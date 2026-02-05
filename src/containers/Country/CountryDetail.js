import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useNavigate, useParams } from "react-router-dom";
// import ExportWordButton from "../../components/ExportFile/ExportWordButton.js";

function CountryDetail() {
  const navigate = useNavigate();
  const { maQuocGia } = useParams();
  const [linkAnhBase64, setLinkAnhBase64] = useState("");
  const [tenQuocGia, setTenQuocGia] = useState("");

  useEffect(() => {
    const fetchCountryDetail = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
        return;
      }
      try {
        const response = await callAPI({
          method: "post",
          endpoint: "/country/detail",
          data: { maQuocGia },
          token: token,
        });

        setTenQuocGia(response.tenQuocGia);
         setLinkAnhBase64(response.linkAnh || "");
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết quốc gia:", error);
        alert("Không thể lấy dữ liệu quốc gia!");
      }
    };

    fetchCountryDetail();
  }, []);


  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Chi tiết quốc gia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-left">
              Mã quốc gia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={maQuocGia}
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-left">
              Tên quốc gia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tenQuocGia}
              onChange={(e) => setTenQuocGia(e.target.value)}
              disabled
              className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
            />
          </div>
        </div>
        <div className="mb-4">
          {linkAnhBase64 && (
            <img
              src={linkAnhBase64}
              alt="Xem trước"
              className="mt-2 h-32 object-contain border"
            />
          )}
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-4">
          <button
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>

          {/* Gọi ExportWordButton và truyền data + fileName */}
          {/* <ExportWordButton
            data={{
              MaQuocGia: maQuocGia,
              TenQuocGia: tenQuocGia,
            }}
            fileName={`ThongTinQuocGia_${maQuocGia}`}
          /> */}
        </div>
      </div>
    </div>
  );
}

export default CountryDetail;
