import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
function CountryList() {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  console.log("role: ", role)
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState(null);
  const navigate = useNavigate();
  const fetchCountries = async (searchValue) => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/country/full-list",
        data: { search: searchValue },
      });
      setCountries(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu quốc gia:", error);
    }
  };

  useEffect(() => {
    fetchCountries("");
  }, []);
  const handleDeleteCountry = async () => {
    try {
      await callAPI({
        method: "post",
        endpoint: "/country/delete",
        data: { maQuocGia: countryToDelete },
      });
      setShowDeleteModal(false);
      setCountryToDelete(null);
      fetchCountries(searchTerm);
    } catch (error) {
      console.error("Lỗi khi xóa đối tác:", error);
    }
  };
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Danh sách quốc gia</h2>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchCountries(searchTerm);
              }
            }}
            placeholder="🔍 Nhập tên quốc gia"
            className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
          />

          <div className="flex gap-3">
            <button
              onClick={() => fetchCountries(searchTerm)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              {t("search")}
            </button>
            {(role === 'admin' || role === 'staff') && (
              <button
                onClick={() => navigate("/countryadd")}
                className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
              >
                Thêm mới
              </button>
            )}

          </div>
        </div>
      </div>
      <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow">
        <thead>
          <tr className=" text-[#667085] text-center font-normal">
            <th className="p-2 text-table">STT</th>
            <th className="p-2 text-table">Mã quốc gia</th>
            <th className="p-2 text-table">Tên quốc gia</th>
            <th className="p-2 text-table">Cờ</th> {/* Cột mới */}
            <th className="p-2 text-center text-table"></th>
          </tr>
        </thead>
        <tbody>
          {countries.map((country, index) => (
            <tr
              key={country.maQuocGia}
              className="group hover:bg-gray-100 text-center border-b relative"
            >
              <td className="p-2 text-table">{index + 1}</td>
              <td
                className="p-2 text-blue-500 cursor-pointer hover:underline text-table"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/countrydetail/${country.maQuocGia}`);
                }}
              >
                {country.maQuocGia}
              </td>
              <td className="p-2 text-table">{country.tenQuocGia}</td>
              <td className="p-2 text-table">
                {country.linkAnh ? (
                  <div className="flex text-table items-center">
                    <img
                      src={country.linkAnh}
                      alt={`Cờ ${country.tenQuocGia}`}
                      className="w-10 h-6 object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="flex text-table items-center text-gray-400 italic">
                    Không có
                  </div>
                )}
              </td>

              <td className="p-2 relative">
                {(role === 'admin' || role === 'staff') && (
                  <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                    <button
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                      onClick={() => navigate(`/countryedit/${country.maQuocGia}`)}
                    >
                      📝
                    </button>
                    <button
                      className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                      onClick={() => {
                        setCountryToDelete(country.maQuocGia);
                        setShowDeleteModal(true);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>

      </table>
      <Modal
        title="Xác nhận xóa"
        open={showDeleteModal}
        onOk={handleDeleteCountry}
        onCancel={() => setShowDeleteModal(false)}
        okText="Xác nhận xóa"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600 text-white",
        }}
      >
        <p>Bạn có chắc chắn muốn xóa quốc gia này không?</p>
      </Modal>
    </div>
  );
}

export default CountryList;
