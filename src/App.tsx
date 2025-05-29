import { useEffect, useState, type ChangeEvent } from "react";
import { Loader } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useFilteredOrgs } from "./hooks/use-filtered-orgs";
import ResultsList from "./components/ResultsList";
import SearchInput from "./components/SearchInput";
import ServiceDescription from "./components/ServiceDescription";

export default function App() {
  const params = new URLSearchParams(window.location.search.slice(1));
  const q = params.get("q");

  const [query, setQuery] = useState(q ?? "");
  const { orgs, loading, count } = useFilteredOrgs(query);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value);
  const handleCancel = () => setQuery("");

  const debouncedHandleChange = useDebouncedCallback(handleChange, 300);

  useEffect(() => {
    window.history.replaceState(null, "", `?q=${query}`);
  }, [query]);

  return (
    <div className="min-h-screen bg-white p-8 mx-auto">
      <div className="max-w-lg mx-auto">
        <SearchInput
          query={query}
          onChange={debouncedHandleChange}
          onCancel={handleCancel}
        />

        {query.length === 0 && <ServiceDescription />}

        {loading && (
          <Loader className="mx-auto my-4 h-6 w-6 animate-spin text-gray-500" />
        )}

        {query.length > 0 && !loading && (
          <ResultsList items={orgs ?? []} total={count ?? -1} />
        )}
      </div>
    </div>
  );
}
