import type { Organisation } from "../hooks/use-filtered-orgs";

type ResultItemProps = { item: Organisation };
const ResultItem: React.FC<ResultItemProps> = ({ item }) => {
  return (
    <a
      href={`https://www.linkedin.com/search/results/companies/?companyHqGeo=%5B"101165590"%5D&keywords=${item.name}`}
      target="_blank"
    >
      <div className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded transition-colors flex items-center justify-start text-nowrap overflow-x-scroll">
        <span>{item.name.trim()}</span>
        <span className="text-gray-400">, {item.city?.trim()}</span>
        <span className="text-gray-400">, {item.type_and_rating?.trim()}</span>
        <span className="text-gray-400">, {item.route?.trim()}</span>
      </div>
    </a>
  );
};

export default ResultItem;
