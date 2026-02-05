import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
import { DatePicker } from 'antd';
import dayjs from 'dayjs'; 
import 'dayjs/locale/vi';
function StaffAdd() {
  const navigate = useNavigate();
  const [maNhanSu, setMaNhanSu] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [chucVu, setChucVu] = useState("");
  const [phongBan, setPhongBan] = useState("");
  const [sdt, setSdt] = useState("");
  const [email, setEmail] = useState("");
  const [ngayThangNamSinh, setNgayThangNamSinh] = useState(null);
  const [cccd, setCccd] = useState("");
  const [bangCap, setBangCap] = useState("");

  const [errors, setErrors] = useState({});
  const isFormValid = maNhanSu.trim() !== "" && hoTen.trim() !== "";
  const validateField = (field, value) => {
    let error = "";
    if (!value.trim()) {
      if (field === "maNhanSu") error = "Mã nhân sự không được để trống";
      if (field === "hoTen") error = "Họ tên không được để trống";
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };
  const handleAddStaff = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/staff/add",
        data: {
          maNhanSu,
          hoTen,
          chucVu,
          phongBan,
          sdt,
          email: email || null,
          ngayThangNamSinh:ngayThangNamSinh || null,
          cccd: cccd || null,
          bangCap,
        },
      });
      await showSuccess("Thành công!", "Thêm nhân sự thành công!");
      setMaNhanSu("");
      setHoTen("");
      setChucVu("");
      setPhongBan("");
      setSdt("");
      setEmail("");
      setNgayThangNamSinh("");
      setCccd("");
      setBangCap("");
    } catch (error) {
      showError("Thất bại!", "Đã xảy ra lỗi.", error);
      console.error("Lỗi khi thêm nhân sự!", error);
    }
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Thêm nhân sự mới</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-left">Mã nhân sự <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={maNhanSu}
              onChange={(e) => {
                setMaNhanSu(e.target.value)
                validateField("maNhanSu", e.target.value);
              }}
              placeholder="Nhập mã nhân sự"
              className="w-full p-2 mt-1 border rounded-lg text-input"

            />
            {errors.maNhanSu && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.maNhanSu}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-left">Họ tên <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={hoTen}
              onChange={(e) => {
                setHoTen(e.target.value)
                validateField("hoTen", e.target.value);
              }}
              placeholder="Nhập họ tên"
              className="w-full p-2 mt-1 border rounded-lg text-input"

            />
            {errors.hoTen && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.hoTen}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-left">Chức vụ</label>
            <input
              type="text"
              value={chucVu}
              onChange={(e) => setChucVu(e.target.value)}
              placeholder="Nhập chức vụ"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">Phòng ban</label>
            <input
              type="text"
              value={phongBan}
              onChange={(e) => setPhongBan(e.target.value)}
              placeholder="Nhập phòng ban"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">Số điện thoại</label>
            <input
              type="text"
              value={sdt}
              onChange={(e) => setSdt(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">Ngày sinh</label>
            {/* <input
              type="date"
              value={ngayThangNamSinh}
              onChange={(e) => setNgayThangNamSinh(e.target.value)}
              className="w-full p-2 mt-1 border rounded-lg text-input"
            /> */}
            <DatePicker
              value={ngayThangNamSinh ? dayjs(ngayThangNamSinh) : null}
              onChange={(date) => {
                if (dayjs.isDayjs(date) && date.isValid()) {
                  setNgayThangNamSinh(date.format("YYYY-MM-DD"));
                } else {
                  setNgayThangNamSinh(null);
                }
              }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
              className="mt-1 w-full"
              style={{ height: "38px" }}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">CCCD</label>
            <input
              type="text"
              value={cccd}
              onChange={(e) => setCccd(e.target.value)}
              placeholder="Nhập CCCD"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">Bằng cấp</label>
            <input
              type="text"
              value={bangCap}
              onChange={(e) => setBangCap(e.target.value)}
              placeholder="Nhập bằng cấp"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg" onClick={() => navigate(-1)}>
            Quay lại
          </button>
          <button
            onClick={handleAddStaff}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white ${isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
              }`}
          >
            Thêm nhân sự
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaffAdd;
