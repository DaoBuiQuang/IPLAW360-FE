import React, { useEffect, useState } from "react";
import Select from "react-select";
import callAPI from "../../utils/api";

function CaseCodeSelect({ value, onChange, isDisabled = false, placeholder = "Chọn mã hồ sơ", className = "text-left" }) {
  const [options, setOptions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadOptions = async (search = searchText, page = 1, append = false) => {
    if (loading || (!hasMore && append)) return;
    setLoading(true);
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/timesheet/case-options",
        data: { searchText: search, pageIndex: page, pageSize: 20 },
      });
      const nextOptions = (response?.data || []).map((item) => ({ value: item.caseCode, label: item.caseCode }));
      setOptions((current) => {
        const merged = append ? [...current, ...nextOptions] : nextOptions;
        const unique = merged.filter((option, index, list) => list.findIndex((item) => item.value === option.value) === index);
        return value && !unique.some((item) => item.value === value) ? [{ value, label: value }, ...unique] : unique;
      });
      setPageIndex(page);
      setHasMore(page < (response?.pagination?.totalPages || page));
    } catch (error) {
      if (!append) setOptions(value ? [{ value, label: value }] : []);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions(value || "", 1, false);
    // Chỉ tải danh sách ban đầu khi component được tạo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (inputValue, meta) => {
    if (meta.action === "input-change") {
      setSearchText(inputValue);
      setPageIndex(1);
      setHasMore(true);
      loadOptions(inputValue, 1, false);
    }
    return inputValue;
  };

  const handleMenuScrollToBottom = () => {
    if (hasMore && !loading) loadOptions(searchText, pageIndex + 1, true);
  };

  const selectedOption = value ? { value, label: value } : null;
  return (
    <Select
      className={className}
      options={options}
      value={selectedOption}
      onChange={(option) => onChange(option?.value || "")}
      onInputChange={handleInputChange}
      onMenuOpen={() => loadOptions(searchText, 1, false)}
      onMenuScrollToBottom={handleMenuScrollToBottom}
      placeholder={placeholder}
      isClearable={!isDisabled}
      isDisabled={isDisabled}
      isLoading={loading}
      noOptionsMessage={() => "Không có mã hồ sơ"}
    />
  );
}

export default CaseCodeSelect;
