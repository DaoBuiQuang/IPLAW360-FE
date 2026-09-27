import React from "react";
import CreatableSelect from "react-select/creatable";

function SearchCreatableSelect({
  value,
  onChange,
  onSearch,
  options = [],
  placeholder = "Chọn hoặc nhập tìm kiếm...",
  className = "",
  isDisabled = false,
}) {
  const selectedOption = value
    ? options.find((opt) => opt.value === value || opt.label === value) || { value, label: value }
    : null;

  const handleChange = (option) => {
    const val = option?.value || "";
    onChange(val);
  };

  const handleCreateOption = (inputValue) => {
    const trimmed = inputValue.trim();
    onChange(trimmed);
    if (onSearch) {
      setTimeout(() => onSearch(trimmed), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (onSearch) {
        setTimeout(() => onSearch(), 100);
      }
    }
  };

  return (
    <CreatableSelect
      className={`text-left ${className}`}
      isClearable
      isDisabled={isDisabled}
      options={options}
      value={selectedOption}
      placeholder={placeholder}
      onChange={handleChange}
      onCreateOption={handleCreateOption}
      onKeyDown={handleKeyDown}
      formatCreateLabel={(inputValue) => `🔍 Tìm với "${inputValue.trim()}"`}
      noOptionsMessage={({ inputValue }) =>
        inputValue
          ? `Nhấn Enter để tìm kiếm "${inputValue}"`
          : "Không có dữ liệu trong danh mục"
      }
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: "38px",
          height: "38px",
          borderRadius: "0.5rem",
          borderColor: state.isFocused ? "#009999" : "#d1d5db",
          boxShadow: state.isFocused ? "0 0 0 1px #009999" : "none",
          fontSize: "0.875rem",
          "&:hover": {
            borderColor: "#009999",
          },
        }),
        valueContainer: (base) => ({
          ...base,
          padding: "0 8px",
        }),
        input: (base) => ({
          ...base,
          margin: 0,
          padding: 0,
        }),
        menu: (base) => ({
          ...base,
          zIndex: 9999,
          borderRadius: "0.5rem",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }),
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isSelected
            ? "#009999"
            : isFocused
            ? "#e6f7f7"
            : "transparent",
          color: isSelected ? "#ffffff" : "#374151",
          cursor: "pointer",
          fontSize: "0.875rem",
        }),
      }}
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
    />
  );
}

export default SearchCreatableSelect;
