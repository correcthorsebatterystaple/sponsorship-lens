import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "use-debounce";
import supabase from "./utils/supabase";
import linkedinLogo from "./assets/linkedin.png";

type SearchInputProps = {
  query: string;
  onQueryChange: (query: string) => void;
};
const SearchInput: React.FC<SearchInputProps> = ({ query, onQueryChange }) => {
  return (
    <div className=" mb-6 sticky top-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        autoFocus
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      />
      {query && (
        <button
          onClick={() => onQueryChange("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

type ResultItemProps = { item: string };
const ResultItem: React.FC<ResultItemProps> = ({ item }) => {
  return (
    <div className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded cursor-pointer transition-colors flex items-center justify-between">
      <span>{item}</span>
      <a
        href={`https://www.linkedin.com/search/results/companies/?companyHqGeo=%5B"101165590"%5D&keywords=${item}`}
        target="_blank"
      >
        <img src={linkedinLogo} alt="LinkedIn Logo" height="6px" width="16px" />
      </a>
    </div>
  );
};

function EmptyState() {
  return (
    <div className="px-4 py-2 text-gray-400 text-center">No results found</div>
  );
}

function ServiceDescription() {
  return (
    <div className="px-4 py-6 text-gray-600 text-center space-y-3">
      <p className="text-lg font-medium text-gray-700">
        Welcome to Sponsorship Lens
      </p>
      <p className="text-sm leading-relaxed">
        Search through the official list of visa-sponsoring companies, published
        by the government. We make it easy to query and explore this public data
        to find the right sponsorship opportunities.
      </p>
      <p className="text-xs text-gray-500">
        Currently available for UK companies only 🇬🇧
      </p>
    </div>
  );
}

type TotalResultsProps = { total: number | null; showing: number };
const TotalResults: React.FC<TotalResultsProps> = ({ total, showing }) => {
  return (
    <div className="px-4 py-2 text-gray-500 text-sm">
      {total !== null
        ? ` Showing top ${Math.min(showing, total)} of ${total} results found`
        : "Loading..."}
    </div>
  );
};

type ResultsListProps = { items: string[] | null; total: number | null };
const ResultsList: React.FC<ResultsListProps> = ({ items, total }) => {
  return (
    <div className="space-y-1">
      {items !== null && <TotalResults total={total} showing={100} />}
      {items === null && <ServiceDescription />}
      {items?.length === 0 && <EmptyState />}

      {items?.map((item, index) => <ResultItem key={index} item={item} />)}
    </div>
  );
};

export default function MinimalistSearch() {
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState<number | null>(null);
  const [debouncedQuery] = useDebounce(query, 300);
  const [filteredItems, setFilteredItems] = useState<string[] | null>(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      const { data, count, error } = await supabase
        .from("organisations")
        .select("name", { count: "estimated" })
        .ilike("name", `%${debouncedQuery}%`)
        .limit(100)
        .range(0, 99);

      if (error) {
        console.error("Error fetching organisations:", error);
        return;
      }

      if (data?.length) {
        setFilteredItems(data.map((item) => item.name as string));
        setTotal(count);
      }
    };

    if (debouncedQuery === "") setFilteredItems(null);
    else fetchOrgs();
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-white p-8 mx-auto">
      <div className="max-w-md mx-auto">
        <SearchInput query={query} onQueryChange={setQuery} />
        <ResultsList items={filteredItems} total={total} />
      </div>
    </div>
  );
}
