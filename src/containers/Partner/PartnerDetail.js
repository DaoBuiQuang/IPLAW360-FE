import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import Select from "react-select";
function PartnerDetail() {
  const navigate = useNavigate();
  const { maDoiTac } = useParams();
  const [tenDoiTac, setTenDoiTac] = useState("");
  const [maQuocGia, setMaQuocGia] = useState("");
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

  // Fetch thông tin đối tác cần chỉnh sửa
  const fetchPartnerDetails = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/partner/detail",
        data: { maDoiTac },
      });
      setTenDoiTac(response.tenDoiTac);
      setMaQuocGia(response.maQuocGia);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin đối tác:", error);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchPartnerDetails();
  }, [maDoiTac]);
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
              onChange={(e) => setTenDoiTac(e.target.value)}
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
          <div>
          <label className="block text-gray-700 text-left">Quốc gia <span className="text-red-500">*</span></label>
            <Select
              options={formatOptions(countries, "maQuocGia", "tenQuocGia")}
              value={maQuocGia ? formatOptions(countries, "maQuocGia", "tenQuocGia").find(opt => opt.value === maQuocGia) : null}
              onChange={selectedOption => setMaQuocGia(selectedOption?.value)}
              placeholder="Chọn quốc gia"
              className="w-full  mt-1  rounded-lg text-left"
              isDisabled

              isClearable
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
