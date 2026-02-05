import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import callAPI from "../../utils/api";
import Select from "react-select";
import { showSuccess, showError } from "../../components/commom/Notification";
function PartnerAdd() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [maDoiTac, setMaDoiTac] = useState("");
  const [tenDoiTac, setTenDoiTac] = useState("");
  const [maQuocGia, setMaQuocGia] = useState("");
  const [nguoiLienHe, setNguoiLienHe] = useState("");
  const [moTa, setMoTa] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [sdt, setSdt] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [email, setEmail] = useState("");
  const [countries, setCountries] = useState([]);

  const [errors, setErrors] = useState({});
  const isFormValid = tenDoiTac.trim() !== "" && maQuocGia.trim() !== "" && maDoiTac.trim() !== "";
  const validateField = (field, value) => {
    let error = "";
    if (!value.trim()) {
      if (field === "maDoiTac") error = "Mã đối tác không được để trống";
      if (field === "tenDoiTac") error = "Tên đối tác không được để trống";
      if (field === "maQuocGia") error = "Tên quốc gia không được để trống";
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };
  // Fetch danh sách quốc gia
  const fetchCountries = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/country/list",
        data: { search: "" },
      });
      setCountries(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu quốc gia:", error);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleAddPartner = async () => {
    try {
      await callAPI({
        method: "post",
        endpoint: "/partner/add",
        data: {
          maDoiTac,
          tenDoiTac,
          maQuocGia,
          nguoiLienHe,
          moTa,
          diaChi,
          sdt,
          ghiChu,
          email
        },
      });
      await showSuccess("Thành công!", "Thêm đối tác thành công!");
      setMaDoiTac("");
      setTenDoiTac("");
      setMaQuocGia("");
    } catch (error) {
      showError("Thất bại!", "Đã xảy ra lỗi.", error);
      console.error("Lỗi khi thêm đối tác!", error);
    }
  };
  const formatOptions = (data, valueKey, labelKey) => {
    return data.map(item => ({
      value: item[valueKey],
      label: item[labelKey]
    }));
  };
  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Thêm đối tác mới</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-left">Mã đối tác <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={maDoiTac}
              onChange={(e) => {
                setMaDoiTac(e.target.value)
                validateField("maDoiTac", e.target.value);
              }}
              placeholder="Nhập mã đối tác"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
            {errors.maDoiTac && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.maDoiTac}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-left">Tên đối tác <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={tenDoiTac}
              onChange={(e) => {
                setTenDoiTac(e.target.value)
                validateField("tenDoiTac", e.target.value);
              }}
              placeholder="Nhập tên đối tác"
              className="w-full p-2 mt-1 border rounded-lg text-input"
            />
            {errors.tenDoiTac && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.tenDoiTac}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-left">Quốc gia <span className="text-red-500">*</span></label>
            <Select
              options={formatOptions(countries, "maQuocGia", "tenQuocGia")}
              value={maQuocGia ? formatOptions(countries, "maQuocGia", "tenQuocGia").find(opt => opt.value === maQuocGia) : null}
              onChange={(selectedOption) => {
                const value = selectedOption?.value || "";
                setMaQuocGia(value);
                validateField("maQuocGia", value);
              }}
              placeholder="Chọn quốc gia"
              className="w-full  mt-1  rounded-lg text-left"
              isClearable
            />
            {errors.maQuocGia && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.maQuocGia}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-left">{t("nguoilienhe")}</label>
            <input type="text" value={nguoiLienHe} onChange={(e) => setNguoiLienHe(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập người liên hệ" />
          </div>
          <div>
            <label className="block text-gray-700 text-left">{t("diaChi")}</label>
            <input type="text" value={diaChi} onChange={(e) => setDiaChi(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập địa chỉ" />
          </div>

          <div>
            <label className="block text-gray-700 text-left">{t("sdt")}</label>
            <input type="text" value={sdt} onChange={(e) => setSdt(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập số điện thoại" />
          </div>
          <div>
            <label className="block text-gray-700 text-left">Email</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập email" />
          </div>
          <div>
            <label className="block text-gray-700 text-left">{t("moTa")}</label>
            <input type="text" value={moTa} onChange={(e) => setMoTa(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập mô tả" />
          </div>

          <div>
            <label className="block text-gray-700 text-left">{t("ghiChu")}</label>
            <input type="text" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập ghi chú" />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
          <button
            onClick={handleAddPartner}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg text-white ${isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
              }`}
          >
            Thêm đối tác
          </button>
        </div>
      </div>
    </div>
  );
}

export default PartnerAdd;
