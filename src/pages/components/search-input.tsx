import React, { useCallback, useRef } from 'react';
import { type GetProps, Input } from 'antd';
import { SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const { Search } = Input;
type SearchProps = GetProps<typeof Input.Search>;

interface Props {
  onSearch: (value: string) => void;
  loading?: boolean;
  debounceDelay?: number;
  placeholder?: string;
  enterButton?: React.ReactNode;
}

export const SearchInput: React.FC<Props> = ({
  onSearch,
  loading,
  debounceDelay = 500, // UX uchun 1000ms biroz ko'p, 500ms tavsiya etiladi
  placeholder,
}) => {
  const { t } = useTranslation();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce mantiqini optimallashtirish
  const triggerSearch = useCallback((value: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onSearch(value);
    }, debounceDelay);
  }, [onSearch, debounceDelay]);

  const handleSearch: SearchProps['onSearch'] = (value: string) => {
    triggerSearch(value);
  };

  const handleChange: SearchProps['onChange'] = (e) => {
    triggerSearch(e.target.value);
  };

  return (
    <Search
      placeholder={placeholder || t('commonSearch.search_ph')}
      allowClear
      enterButton={t('commonSearch.search_btn')}
      size="large"
      loading={loading}
      onChange={handleChange}
      onSearch={handleSearch}
      prefix={<SearchIcon className="text-blue-500 w-4 h-4" />}
      className="search-input-custom"
    />
  );
};