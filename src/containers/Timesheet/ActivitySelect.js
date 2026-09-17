import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import callAPI from "../../utils/api";

const defaultActivities = [
  "Nộp đơn",
  "Tra cứu thông tin",
  "Soạn hồ sơ",
  "Kiểm tra hồ sơ",
  "Bổ sung hồ sơ",
  "Theo dõi tiến độ",
  "Công việc phát sinh",
  "Khác",
];

export default function ActivitySelect({
  value,
  onChange,
  isDisabled = false,
  placeholder = "Chọn hoạt động hoặc tìm theo mã viết tắt...",
  className = "text-left mt-1",
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await callAPI({
          method: "post",
          endpoint: "/ds-cong-viec/list",
          data: { pageIndex: 1, pageSize: 200 },
        });

        const dsCongViec = Array.isArray(res?.data) ? res.data : [];

        // Tạo options từ Danh Sách Công Việc Thường Nhật
        const customOptions = dsCongViec.map((item) => {
          const displayLabel = item.maVietTat
            ? `[${item.maVietTat}] ${item.moTa}`
            : item.moTa;
          const val = item.maVietTat
            ? `${item.maVietTat} - ${item.moTa}`
            : item.moTa;
          return {
            value: val,
            label: displayLabel,
            moTa: item.moTa,
            maVietTat: item.maVietTat,
            item,
          };
        });

        // Tạo options từ danh mục cơ bản (nếu chưa có trong custom)
        const baseOptions = defaultActivities
          .filter(
            (act) =>
              !customOptions.some(
                (c) =>
                  c.moTa?.toLowerCase() === act.toLowerCase() ||
                  c.value?.toLowerCase() === act.toLowerCase()
              )
          )
          .map((act) => ({
            value: act,
            label: act,
            moTa: act,
            maVietTat: "",
          }));

        const grouped = [];
        if (customOptions.length > 0) {
          grouped.push({
            label: "Công việc thường nhật (Hệ thống)",
            options: customOptions,
          });
        }
        if (baseOptions.length > 0) {
          grouped.push({
            label: "Hoạt động chung",
            options: baseOptions,
          });
        }

        if (isMounted) {
          setOptions(grouped.length > 0 ? grouped : baseOptions);
        }
      } catch {
        // Fallback danh sách tĩnh nếu API lỗi
        if (isMounted) {
          setOptions(
            defaultActivities.map((act) => ({ value: act, label: act }))
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchActivities();
    return () => {
      isMounted = false;
    };
  }, []);

  // Tìm option khớp với giá trị hiện tại
  const findSelected = (val) => {
    if (!val) return null;

    // Tìm trong grouped hoặc mảng phẳng
    for (const groupOrOpt of options) {
      if (groupOrOpt.options) {
        const found = groupOrOpt.options.find(
          (o) =>
            o.value === val ||
            o.moTa === val ||
            o.label === val ||
            (o.maVietTat && val.startsWith(`${o.maVietTat} -`))
        );
        if (found) return found;
      } else {
        if (
          groupOrOpt.value === val ||
          groupOrOpt.moTa === val ||
          groupOrOpt.label === val
        ) {
          return groupOrOpt;
        }
      }
    }

    // Nếu không khớp option nào có sẵn (do người dùng tự nhập hoặc dữ liệu cũ)
    return { value: val, label: val };
  };

  const selectedOption = findSelected(value);

  const handleChange = (selected) => {
    if (!selected) {
      onChange("", null);
      return;
    }
    onChange(selected.value, selected.item || null);
  };

  return (
    <CreatableSelect
      className={`${className} w-full`}
      options={options}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      isClearable={!isDisabled}
      isDisabled={isDisabled}
      isLoading={loading}
      formatCreateLabel={(input) => `Dùng hoạt động khác: "${input}"`}
      noOptionsMessage={() => "Không tìm thấy công việc phù hợp"}
    />
  );
}
