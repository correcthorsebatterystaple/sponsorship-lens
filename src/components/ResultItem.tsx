import linkedinLogo from "../assets/linkedin.png";

type ResultItemProps = { item: string };
const ResultItem: React.FC<ResultItemProps> = ({ item }) => {
  return (
    <div className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded transition-colors flex items-center justify-between">
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

export default ResultItem;
