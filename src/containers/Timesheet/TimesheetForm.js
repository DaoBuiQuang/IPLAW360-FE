import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { DatePicker, Spin } from "antd";
import CaseCodeSelect from "./CaseCodeSelect";
import ActivitySelect from "./ActivitySelect";
import dayjs from "dayjs";
import callAPI from "../../utils/api";
import { showSuccess } from "../../components/commom/Notification";

const emptyValues = {
  employeeCode: "",
  caseCode: "",
  countryCode: "",
  partnerCode: "",
  customerCode: "",
  workDate: dayjs().format("YYYY-MM-DD"),
  hours: "",
  contributionPercentage: 0,
  activity: "",
  description: "",
  notes: "",
};

export default function TimesheetForm({ mode = "add", initialValues = emptyValues, lockedCaseCode = false, onSaved, embedded = false }) {
  const navigate = useNavigate();
  const currentEmployeeCode = localStorage.getItem("maNhanSu") || "";
  const isEditingOtherStaff = mode === "edit" && Boolean(initialValues.employeeCode && initialValues.employeeCode !== currentEmployeeCode);
  const [values, setValues] = useState({
    ...emptyValues,
    ...initialValues,
    workDate: initialValues.workDate || emptyValues.workDate,
    contributionPercentage: initialValues.contributionPercentage ?? initialValues.contributionRate ?? 0,
    employeeCode: mode === "add" ? currentEmployeeCode : initialValues.employeeCode,
  });

  useEffect(() => {
    setValues({
      ...emptyValues,
      ...initialValues,
      workDate: initialValues.workDate || emptyValues.workDate,
      contributionPercentage: initialValues.contributionPercentage ?? initialValues.contributionRate ?? 0,
      employeeCode: mode === "add" ? currentEmployeeCode : (initialValues.employeeCode || currentEmployeeCode),
    });
  }, [initialValues.workDate, initialValues.id, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const [staffs, setStaffs] = useState([]);
  const [countries, setCountries] = useState([]);
  const [partners, setPartners] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.allSettled([
      callAPI({ method: "post", endpoint: "/staff/basiclist", data: {} }),
      callAPI({ method: "post", endpoint: "/country/list", data: {} }),
      callAPI({ method: "post", endpoint: "/partner/all", data: {} }),
      callAPI({ method: "post", endpoint: "/customers/by-name", data: {} }),
    ]).then(([staffResult, countryResult, partnerResult, customerResult]) => {
      setStaffs(staffResult.status === "fulfilled" ? (Array.isArray(staffResult.value) ? staffResult.value : staffResult.value?.data || []) : []);
      const countryList = countryResult.status === "fulfilled" ? (Array.isArray(countryResult.value) ? countryResult.value : countryResult.value?.data || []) : [];
      setCountries(countryList);
      setPartners(partnerResult.status === "fulfilled" ? (Array.isArray(partnerResult.value) ? partnerResult.value : partnerResult.value?.data || []) : []);
      setCustomers(customerResult.status === "fulfilled" ? (Array.isArray(customerResult.value) ? customerResult.value : customerResult.value?.data || []) : []);

      // Đặt mặc định là Việt Nam khi tạo mới nếu chưa có countryCode
      if (mode === "add" && !initialValues.countryCode) {
        const vn = countryList.find(
          (c) =>
            c.maQuocGia === "VN" ||
            c.maQuocGia === "VNM" ||
            c.tenQuocGia?.toLowerCase().includes("việt nam") ||
            c.tenQuocGia?.toLowerCase().includes("viet nam")
        );
        if (vn) {
          setValues((prev) => ({
            ...prev,
            countryCode: prev.countryCode || vn.maQuocGia,
          }));
        }
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedStaff = staffs.find((staff) => staff.maNhanSu === values.employeeCode);
  const employeeOptions = staffs.filter((staff) => mode === "edit" || staff.maNhanSu === currentEmployeeCode);
  const countryOptions = countries.map((item) => ({ value: item.maQuocGia, label: `${item.maQuocGia} - ${item.tenQuocGia}` }));
  const partnerOptions = partners.map((item) => ({ value: item.maDoiTac, label: `${item.maDoiTac} - ${item.tenDoiTac}` }));
  const customerOptions = customers.map((item) => ({ value: item.maKhachHang, label: `${item.maKhachHang} - ${item.tenKhachHang}` }));
  const selectedOption = (options, value, fallbackName) => value
    ? options.find((option) => option.value === value) || { value, label: `${value}${fallbackName ? ` - ${fallbackName}` : ""}` }
    : null;
  const setField = (field, value) => setValues((previous) => ({ ...previous, [field]: value }));
  const validate = () => {
    const nextErrors = {};
    if (!values.employeeCode) nextErrors.employeeCode = "Không xác định được nhân sự đăng nhập";
    if (mode === "add" && values.employeeCode !== currentEmployeeCode) nextErrors.employeeCode = "Chỉ được tạo time record cho tài khoản đang đăng nhập";
    if (!values.workDate) nextErrors.workDate = "Vui lòng chọn ngày làm việc";
    const hours = Number(values.hours);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) nextErrors.hours = "Số giờ phải lớn hơn 0 và không quá 24";
    if (values.contributionPercentage !== "" && values.contributionPercentage !== null && values.contributionPercentage !== undefined) {
      const rate = Number(values.contributionPercentage);
      if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
        nextErrors.contributionPercentage = "Tỉ lệ đóng góp phải từ 0% đến 100%";
      }
    }
    if (!String(values.activity).trim()) nextErrors.activity = "Hoạt động không được để trống";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...(mode === "edit" ? { id: initialValues.id } : {}),
        employeeCode: values.employeeCode,
        caseCode: values.caseCode ? values.caseCode.trim() : null,
        countryCode: values.countryCode || null,
        partnerCode: values.partnerCode || null,
        customerCode: values.customerCode || null,
        workDate: values.workDate,
        hours: Number(values.hours),
        contributionPercentage:
          values.contributionPercentage !== "" && values.contributionPercentage !== null && values.contributionPercentage !== undefined
            ? Number(values.contributionPercentage)
            : 0,
        activity: values.activity.trim(),
        description: values.description ? values.description.trim() : undefined,
        notes: values.notes ? values.notes.trim() : undefined,
      };
      await callAPI({ method: mode === "edit" ? "put" : "post", endpoint: mode === "edit" ? "/timesheet/edit" : "/timesheet/add", data: payload });
      await showSuccess("Thành công", mode === "edit" ? "Cập nhật timesheet thành công" : "Thêm timesheet thành công");
      if (onSaved) onSaved();
      else navigate(-1);
    } catch (error) {
      console.error("Lỗi khi lưu time record:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isEditingOtherStaff) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto text-center mt-4">
        <div className="text-4xl mb-3">⛔</div>
        <h3 className="text-lg font-bold text-red-600 mb-2">Không có quyền chỉnh sửa</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Bạn chỉ có thể xem time record của nhân viên khác và không thể chỉnh sửa hay xóa.
        </p>
        <button
          type="button"
          onClick={() => (onSaved ? onSaved() : navigate(-1))}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return <Spin spinning={loading}>
    <form onSubmit={submit} className={embedded ? "" : "bg-white p-4 rounded-lg shadow-md max-w-4xl mx-auto"}>
      {!embedded && <h2 className="text-2xl font-semibold text-gray-700 mb-4">{mode === "edit" ? "Chỉnh sửa time record" : "Thêm time record"}</h2>}
      <div className="space-y-4">
        {/* Hàng 1: Nhân sự | Ngày làm việc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nhân sự" required error={errors.employeeCode}>
            <Select
              className="text-left w-full"
              options={employeeOptions.map((staff) => ({ value: staff.maNhanSu, label: `${staff.maNhanSu} - ${staff.hoTen}` }))}
              value={selectedStaff ? { value: selectedStaff.maNhanSu, label: `${selectedStaff.maNhanSu} - ${selectedStaff.hoTen}` } : null}
              onChange={(option) => setField("employeeCode", option?.value || "")}
              placeholder="Nhân sự của tôi"
              isDisabled={mode === "add"}
            />
            {selectedStaff && (
              <div className="text-sm text-gray-500 mt-1">
                <p>Họ tên: {selectedStaff.hoTen || "-"}</p>
                <p>Đơn giá hiện tại: {Number(selectedStaff.hourlyRate || 0).toLocaleString("vi-VN")}/giờ</p>
              </div>
            )}
          </Field>
          <Field label="Ngày làm việc" required error={errors.workDate}>
            <DatePicker
              value={values.workDate ? dayjs(values.workDate) : null}
              onChange={(date) => setField("workDate", date?.format("YYYY-MM-DD") || "")}
              format="DD/MM/YYYY"
              className="w-full mt-1"
            />
          </Field>
        </div>

        {/* Hàng 2: Mã hồ sơ | Tỷ lệ đóng góp (mặc định 0) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Mã hồ sơ" error={errors.caseCode}>
            <CaseCodeSelect
              value={values.caseCode}
              onChange={(value) => setField("caseCode", value)}
              isDisabled={lockedCaseCode}
              allowCustom
              placeholder="Chọn hoặc nhập mã hồ sơ"
              className="text-left"
            />
          </Field>
          <Field label="Tỉ lệ đóng góp (%)" error={errors.contributionPercentage}>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={values.contributionPercentage ?? 0}
              onChange={(event) => setField("contributionPercentage", event.target.value)}
              placeholder="Nhập % đóng góp vào hồ sơ (0 - 100%)"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
          </Field>
        </div>

        {/* Hàng 3: Khách hàng | Đối tác | Quốc gia (mặc định Việt Nam) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Khách hàng">
            <Select
              className="text-left w-full"
              options={customerOptions}
              value={selectedOption(customerOptions, values.customerCode, initialValues.customerName)}
              onChange={(option) => setField("customerCode", option?.value || "")}
              placeholder="Chọn khách hàng"
              isClearable
            />
          </Field>
          <Field label="Đối tác">
            <Select
              className="text-left w-full"
              options={partnerOptions}
              value={selectedOption(partnerOptions, values.partnerCode, initialValues.partnerName)}
              onChange={(option) => setField("partnerCode", option?.value || "")}
              placeholder="Chọn đối tác"
              isClearable
            />
          </Field>
          <Field label="Quốc gia">
            <Select
              className="text-left w-full"
              options={countryOptions}
              value={selectedOption(countryOptions, values.countryCode, initialValues.countryName)}
              onChange={(option) => setField("countryCode", option?.value || "")}
              placeholder="Chọn quốc gia"
              isClearable
            />
          </Field>
        </div>

        {/* Hàng 4: Số giờ | Hoạt động */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Số giờ" required error={errors.hours}>
            <input
              type="number"
              min="0.01"
              max="24"
              step="0.01"
              value={values.hours}
              onChange={(event) => setField("hours", event.target.value)}
              placeholder="Nhập số giờ làm việc..."
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
          </Field>
          <Field label="Hoạt động" required error={errors.activity}>
            <ActivitySelect
              value={values.activity}
              onChange={(actVal, selectedItem) => {
                setValues((prev) => ({
                  ...prev,
                  activity: actVal,
                  description:
                    !prev.description && selectedItem?.moTa
                      ? selectedItem.moTa
                      : prev.description,
                }));
                if (errors.activity) {
                  setErrors((prev) => ({ ...prev, activity: "" }));
                }
              }}
            />
          </Field>
        </div>

        {/* Hàng 5: Nội dung công việc | Ghi chú */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nội dung công việc">
            <textarea
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
              className="w-full p-2 mt-1 border rounded-lg text-input resize-none"
              rows={3}
              placeholder="Nội dung công việc..."
            />
          </Field>
          <Field label="Ghi chú">
            <textarea
              value={values.notes}
              onChange={(event) => setField("notes", event.target.value)}
              className="w-full p-2 mt-1 border rounded-lg text-input resize-none"
              rows={3}
              placeholder="Ghi chú thêm..."
            />
          </Field>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-6">
        {!embedded && <button type="button" onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg transition">Quay lại</button>}
        <button type="submit" className="bg-[#009999] hover:bg-[#007a7a] text-white px-6 py-2 rounded-lg transition">{mode === "edit" ? "Cập nhật" : "Thêm mới"}</button>
      </div>
    </form>
  </Spin>;
}
function Field({ label, required = false, error, children }) { return <div><label className="block text-gray-700 text-left">{label}{required && <span className="text-red-500"> *</span>}</label>{children}{error && <p className="text-red-500 text-xs mt-1 text-left">{error}</p>}</div>; }
export { emptyValues };
