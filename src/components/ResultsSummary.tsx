type ResultsSummaryProps = { total: number; showing: number };
const ResultsSummary: React.FC<ResultsSummaryProps> = ({ total, showing }) => {
  return (
    <div className="px-4 py-2 text-gray-500 text-sm sticky top-17 bg-white">
      {` Showing top ${Math.min(showing, total)} of ${total} results found`}
    </div>
  );
};

export default ResultsSummary;
