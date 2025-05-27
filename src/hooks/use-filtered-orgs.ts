import { useState, useEffect } from "react";
import supabase from "../utils/supabase";

export const useFilteredOrgs = (query: string) => {
  const [orgs, setFilteredOrgs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      const { data, count, error } = await supabase
        .from("organisations")
        .select("name", { count: "estimated" })
        .ilike("name", `%${query}%`)
        .limit(100)
        .range(0, 99);

      if (error) {
        setLoading(false);
        console.error("Error fetching organisations:", error);
        return null;
      }

      setFilteredOrgs(data.map((org) => org.name));
      setCount(count);

      return { data, count };
    };

    if (!query.length) return;

    setLoading(true);
    fetchOrgs().finally(() => setLoading(false));
  }, [query]);

  return { orgs, loading, count };
};
