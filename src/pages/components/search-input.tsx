import React, { useCallback, useRef } from 'react';
import { type GetProps, Input } from 'antd';
import { SearchIcon } from 'lucide-react';

const { Search } = Input;
type SearchProps = GetProps<typeof Input.Search>;

interface Props {
  onSearch: (value: string) => void;
  loading?: boolean;
  debounceDelay?: number;
}

export const SearchInput: React.FC<Props> = ({
  onSearch,
  loading,
  debounceDelay = 500,
}) => {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch: SearchProps['onSearch'] = useCallback(
    (value: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        onSearch(value);
      }, debounceDelay);
    },
    [onSearch, debounceDelay],
  );

  const handleChange: SearchProps['onChange'] = useCallback(
    (e: { target: { value: any } }) => {
      const value = e.target.value;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        onSearch(value);
      }, debounceDelay);
    },
    [onSearch, debounceDelay],
  );

  return (
    <Search
      placeholder="Search by name"
      allowClear
      enterButton="Search"
      size="large"
      loading={loading}
      onChange={handleChange}
      onSearch={handleSearch}
      prefix={<SearchIcon className="text-[#10b981]" />}
    />
  );
};
