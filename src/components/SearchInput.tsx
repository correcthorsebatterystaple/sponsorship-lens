import { Search, X } from "lucide-react";
import type { ChangeEventHandler } from "react";

type SearchInputProps = {
  query: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onCancel: () => void;
};
const SearchInput: React.FC<SearchInputProps> = ({
  query,
  onChange,
  onCancel,
}) => {
  return (
    <div className=" mb-6 sticky top-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        autoFocus
        type="text"
        placeholder="Search..."
        onChange={onChange}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        defaultValue={query}
      />
      {query && (
        <button
          onClick={onCancel}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
