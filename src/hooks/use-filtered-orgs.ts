import { useState, useEffect } from "react";
import supabase from "../utils/supabase";

export type Organisation = {
  name: string;
  city?: string;
  type_and_rating?: string;
  route?: string;
};

export const useFilteredOrgs = (query: string) => {
  const [orgs, setFilteredOrgs] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      const { data, count, error } = await supabase
        .from("organisations")
        .select("name,city,type_and_rating,route", { count: "estimated" })
        .ilike("name", `%${query}%`)
        .limit(100)
        .range(0, 99);

      if (error) {
        setLoading(false);
        console.error("Error fetching organisations:", error);
        return null;
      }

      setFilteredOrgs(data);
      setCount(count);

      return { data, count };
    };

    if (!query.length) return;

    setLoading(true);
    fetchOrgs().finally(() => setLoading(false));
  }, [query]);

  return { orgs, loading, count };
};
