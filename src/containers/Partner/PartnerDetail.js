import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import { useTranslation } from "react-i18next";
import Select from "react-select";

function PartnerDetail() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
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

  // Fetch thông tin đối tác
  const fetchPartnerDetails = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/partner/detail",
        data: { id: id },
      });
      setMaDoiTac(response.maDoiTac || "");
      setTenDoiTac(response.tenDoiTac || "");
      setMaQuocGia(response.maQuocGia || "");
      setNguoiLienHe(response.nguoiLienHe || "");
      setMoTa(response.moTa || "");
      setDiaChi(response.diaChi || "");
      setSdt(response.sdt || "");
      setGhiChu(response.ghiChu || "");
      setEmail(response.email || "");
    } catch (error) {
      console.error("Lỗi khi lấy thông tin đối tác:", error);
    }
  };

  useEffect(() => {
    fetchCountries();
    if (id) {
      fetchPartnerDetails();
    }
  }, [id]);

  const formatOptions = (data, valueKey, labelKey) => {
    return data.map(item => ({
      value: item[valueKey],
      label: item[labelKey]
    }));
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Thông tin đối tác</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-left">Mã đối tác <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={maDoiTac}
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">Tên đối tác <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={tenDoiTac}
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">Quốc gia <span className="text-red-500">*</span></label>
            <Select
              options={formatOptions(countries, "maQuocGia", "tenQuocGia")}
              value={maQuocGia ? formatOptions(countries, "maQuocGia", "tenQuocGia").find(opt => opt.value === maQuocGia) : null}
              placeholder="Chọn quốc gia"
              className="w-full mt-1 rounded-lg text-left"
              isDisabled
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">{t("nguoilienhe") || "Người liên hệ"}</label>
            <input
              type="text"
              value={nguoiLienHe}
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">{t("diaChi") || "Địa chỉ"}</label>
            <input
              type="text"
              value={diaChi}
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">{t("sdt") || "SĐT"}</label>
            <input
              type="text"
              value={sdt}
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">Email</label>
            <input
              type="text"
              value={email}
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">{t("moTa") || "Mô tả"}</label>
            <input
              type="text"
              value={moTa}
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">{t("ghiChu") || "Ghi chú"}</label>
            <input
              type="text"
              value={ghiChu}
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}

export default PartnerDetail;
