import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { DatePicker, Spin } from "antd";
import CaseCodeSelect from "./CaseCodeSelect";
import ActivitySelect from "./ActivitySelect";
import dayjs from "dayjs";
import callAPI from "../../utils/api";
import { showSuccess } from "../../components/commom/Notification";

const emptyValues = { employeeCode: "", caseCode: "", workDate: dayjs().format("YYYY-MM-DD"), hours: "", activity: "", description: "", notes: "" };

export default function TimesheetForm({ mode = "add", initialValues = emptyValues, lockedCaseCode = false, onSaved, embedded = false }) {
  const navigate = useNavigate();
  const currentEmployeeCode = localStorage.getItem("maNhanSu") || "";
  const [values, setValues] = useState({ ...emptyValues, ...initialValues, employeeCode: mode === "add" ? currentEmployeeCode : initialValues.employeeCode });
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    callAPI({ method: "post", endpoint: "/staff/basiclist", data: {} }).then((response) => {
      const list = Array.isArray(response) ? response : response?.data || [];
      setStaffs(list);
    }).catch(() => setStaffs([]));
  }, []);

  const selectedStaff = staffs.find((staff) => staff.maNhanSu === values.employeeCode);
  const employeeOptions = staffs.filter((staff) => mode === "edit" || staff.maNhanSu === currentEmployeeCode);
  const setField = (field, value) => setValues((previous) => ({ ...previous, [field]: value }));
  const validate = () => {
    const nextErrors = {};
    if (!values.employeeCode) nextErrors.employeeCode = "Không xác định được nhân sự đăng nhập";
    if (mode === "add" && values.employeeCode !== currentEmployeeCode) nextErrors.employeeCode = "Chỉ được tạo time record cho tài khoản đang đăng nhập";
    if (!values.workDate) nextErrors.workDate = "Vui lòng chọn ngày làm việc";
    const hours = Number(values.hours);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) nextErrors.hours = "Số giờ phải lớn hơn 0 và không quá 24";
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
        workDate: values.workDate,
        hours: Number(values.hours),
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

  return <Spin spinning={loading}>
    <form onSubmit={submit} className={embedded ? "" : "bg-white p-4 rounded-lg shadow-md max-w-4xl mx-auto"}>
      {!embedded && <h2 className="text-2xl font-semibold text-gray-700 mb-4">{mode === "edit" ? "Chỉnh sửa time record" : "Thêm time record"}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nhân sự" required error={errors.employeeCode}>
          <Select className="text-left w-full" options={employeeOptions.map((staff) => ({ value: staff.maNhanSu, label: `${staff.maNhanSu} - ${staff.hoTen}` }))} value={selectedStaff ? { value: selectedStaff.maNhanSu, label: `${selectedStaff.maNhanSu} - ${selectedStaff.hoTen}` } : null} onChange={(option) => setField("employeeCode", option?.value || "")} placeholder="Nhân sự của tôi" isDisabled={mode === "add"} />
          {selectedStaff && <div className="text-sm text-gray-500 mt-1"><p>Họ tên: {selectedStaff.hoTen || "-"}</p><p>Đơn giá hiện tại: {Number(selectedStaff.hourlyRate || 0).toLocaleString("vi-VN")}/giờ</p></div>}
        </Field>
        <Field label="Mã hồ sơ" error={errors.caseCode}><CaseCodeSelect value={values.caseCode} onChange={(value) => setField("caseCode", value)} isDisabled={lockedCaseCode} allowCustom placeholder="Chọn hoặc nhập mã hồ sơ" className="text-left" /></Field>
        <Field label="Ngày làm việc" required error={errors.workDate}><DatePicker value={values.workDate ? dayjs(values.workDate) : null} onChange={(date) => setField("workDate", date?.format("YYYY-MM-DD") || "")} format="DD/MM/YYYY" className="w-full mt-1" /></Field>
        <Field label="Số giờ" required error={errors.hours}><input type="number" min="0.01" max="24" step="0.01" value={values.hours} onChange={(event) => setField("hours", event.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" /></Field>
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
        <Field label="Nội dung công việc"><textarea value={values.description} onChange={(event) => setField("description", event.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" rows={3} /></Field>
        <Field label="Ghi chú"><textarea value={values.notes} onChange={(event) => setField("notes", event.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input md:col-span-2" rows={3} /></Field>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        {!embedded && <button type="button" onClick={() => navigate(-1)} className="bg-gray-300 px-4 py-2 rounded-lg">Quay lại</button>}
        <button type="submit" className="bg-[#009999] text-white px-4 py-2 rounded-lg">{mode === "edit" ? "Cập nhật" : "Thêm mới"}</button>
      </div>
    </form>
  </Spin>;
}
function Field({ label, required = false, error, children }) { return <div><label className="block text-gray-700 text-left">{label}{required && <span className="text-red-500"> *</span>}</label>{children}{error && <p className="text-red-500 text-xs mt-1 text-left">{error}</p>}</div>; }
export { emptyValues };
