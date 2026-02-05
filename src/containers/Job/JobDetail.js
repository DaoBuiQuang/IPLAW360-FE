import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
function JobDetail() {
  const navigate = useNavigate();
  const { maNganhNghe } = useParams(); // lấy id ngành nghề từ URL
  const [tenNganhNghe, setTenNganhNghe] = useState("");
  const [errors, setErrors] = useState({});
  const validateField = (field, value) => {
    let error = "";
    if (!value.trim()) {
      if (field === "maNganhNghe") error = "Mã ngành nghề không được để trống";
      if (field === "tenNganhNghe") error = "Tên ngành nghề không được để trống";
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };
  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const response = await callAPI({
          method: "post",
          endpoint: `/industry/detail`,
          data: {
            maNganhNghe,
          },
        });
        setTenNganhNghe(response.tenNganhNghe);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin ngành nghề!", error);
      }
    };

    fetchJobDetail();
  }, []);

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Sửa ngành nghề</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-left">Mã ngành nghề <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={maNganhNghe}
              disabled
              placeholder="Nhập mã ngành nghề"
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">Tên ngành nghề <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={tenNganhNghe}
              onChange={(e) => {
                setTenNganhNghe(e.target.value)
                validateField("tenNganhNghe", e.target.value);
              }}
              placeholder="Nhập tên ngành nghề"
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
              disabled
            />
            {errors.tenNganhNghe && (
              <p className="text-red-500 text-xs mt-1 text-left">{errors.tenNganhNghe}</p>
            )}
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

export default JobDetail;
