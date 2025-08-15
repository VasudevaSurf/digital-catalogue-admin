"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { debounce } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showClearButton?: boolean;
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className = "",
  autoFocus = false,
  showClearButton = true,
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      onChange(searchValue);
      onSearch?.(searchValue);
    }, debounceMs),
    [onChange, onSearch, debounceMs]
  );

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    onSearch?.("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch?.(localValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />

      {showClearButton && localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
