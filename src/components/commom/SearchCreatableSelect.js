import React, { useState, useRef, useEffect } from "react";

/**
 * SearchCreatableSelect — thanh tìm kiếm với dropdown gợi ý
 *
 * Hành vi:
 * - Người dùng gõ → hiển thị dropdown gợi ý lọc từ `options` (từ khóa trùng khớp)
 * - Dòng đầu tiên luôn là "🔍 Tìm với "{text}"" → nhấn hoặc Enter → gọi onSearch
 * - Chọn 1 option trong danh sách → set giá trị, tự động gọi onSearch
 * - Xóa hết text (value = "") → gọi onSearch với "" để reset danh sách
 * - Sau khi chọn vẫn có thể tiếp tục nhập để tìm kiếm thu hẹp
 */
function SearchCreatableSelect({
  value,
  onChange,
  onSearch,
  options = [],
  placeholder = "Chọn hoặc nhập tìm kiếm...",
  className = "",
  isDisabled = false,
}) {
  const [inputValue, setInputValue] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Đồng bộ inputValue khi value thay đổi từ bên ngoài (ví dụ clear filter)
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll item highlight vào view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex];
      if (item) item.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Lọc options theo inputValue (match bất kỳ vị trí trong string)
  const filteredOptions = React.useMemo(() => {
    if (!inputValue.trim()) return options.slice(0, 20);
    const lower = inputValue.toLowerCase();
    return options
      .filter(
        (opt) =>
          opt.label?.toLowerCase().includes(lower) ||
          opt.value?.toLowerCase().includes(lower)
      )
      .slice(0, 20);
  }, [inputValue, options]);

  // Danh sách items trong dropdown:
  // [0] = "Tìm với ..." luôn ở đầu nếu có text
  // [1..n] = các options gợi ý
  const dropdownItems = inputValue.trim()
    ? [
        { type: "search", label: `🔍 Tìm với "${inputValue.trim()}"`, value: inputValue.trim() },
        ...filteredOptions.map((opt) => ({ type: "option", label: opt.label, value: opt.value })),
      ]
    : filteredOptions.map((opt) => ({ type: "option", label: opt.label, value: opt.value }));

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setHighlightedIndex(-1);

    if (val === "") {
      // Xóa hết → reset danh sách ngay lập tức
      setShowDropdown(false);
      if (onSearch) onSearch("");
    } else {
      setShowDropdown(true);
    }
  };

  const handleSelect = (item) => {
    setInputValue(item.value);
    onChange(item.value);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    if (onSearch) {
      setTimeout(() => onSearch(item.value), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showDropdown && inputValue) {
        setShowDropdown(true);
        return;
      }
      setHighlightedIndex((prev) =>
        prev < dropdownItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : dropdownItems.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < dropdownItems.length) {
        // Chọn item đang highlight
        handleSelect(dropdownItems[highlightedIndex]);
      } else {
        // Không highlight item nào → tìm với text đang nhập
        setShowDropdown(false);
        if (onSearch) onSearch(inputValue.trim());
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    setShowDropdown(false);
    setHighlightedIndex(-1);
    if (onSearch) onSearch("");
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: "100%" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #d1d5db",
          borderRadius: "0.5rem",
          height: "38px",
          paddingLeft: "8px",
          paddingRight: "4px",
          backgroundColor: isDisabled ? "#f3f4f6" : "white",
          boxSizing: "border-box",
          fontSize: "0.875rem",
          transition: "border-color 0.15s",
        }}
        onClick={() => {
          if (!isDisabled && inputValue) setShowDropdown(true);
        }}
        onFocus={() => {
          if (!isDisabled && inputValue) setShowDropdown(true);
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue) setShowDropdown(true);
          }}
          placeholder={placeholder}
          disabled={isDisabled}
          autoComplete="off"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "0.875rem",
            color: "#374151",
            minWidth: 0,
          }}
        />
        {inputValue && !isDisabled && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleClear();
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: "0 4px",
              fontSize: "16px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
            }}
            title="Xóa"
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && dropdownItems.length > 0 && (
        <ul
          ref={listRef}
          style={{
            position: "absolute",
            zIndex: 9999,
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
            maxHeight: "240px",
            overflowY: "auto",
            margin: "2px 0 0",
            padding: 0,
            listStyle: "none",
          }}
        >
          {dropdownItems.map((item, index) => (
            <li
              key={`${item.type}-${index}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "0.875rem",
                textAlign: "left",
                backgroundColor:
                  highlightedIndex === index
                    ? item.type === "search"
                      ? "#e0f2f1"
                      : "#e6f7f7"
                    : "transparent",
                color:
                  item.type === "search"
                    ? "#007a7a"
                    : highlightedIndex === index
                    ? "#374151"
                    : "#374151",
                fontWeight: item.type === "search" ? 600 : 400,
                borderBottom:
                  item.type === "search" && dropdownItems.length > 1
                    ? "1px solid #e5e7eb"
                    : "none",
                transition: "background-color 0.1s",
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchCreatableSelect;
