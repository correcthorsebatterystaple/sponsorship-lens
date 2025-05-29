import type { Organisation } from "../hooks/use-filtered-orgs";
import ResultItem from "./ResultItem";
import ResultsSummary from "./ResultsSummary";

type ResultsListProps = {
  items: Organisation[];
  total: number;
};
const ResultsList: React.FC<ResultsListProps> = ({ items, total }) => {
  return (
    <div className="space-y-1">
      {<ResultsSummary total={total} showing={100} />}
      {items.length === 0 && (
        <div className="px-4 py-2 text-gray-400 text-center">
          No results found
        </div>
      )}

      {items.map((item, index) => (
        <ResultItem key={index} item={item} />
      ))}
    </div>
  );
};

export default ResultsList;
