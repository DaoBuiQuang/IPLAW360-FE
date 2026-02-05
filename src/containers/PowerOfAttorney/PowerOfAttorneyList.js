// src/pages/PowerOfAttorney/PowerOfAttorneyList.jsx
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import callAPI from "../../utils/api";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pagination } from "antd";


function PowerOfAttorneyList() {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);

  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [customerName, setCustomerName] = useState("");

  const navigate = useNavigate();

  // để revoke URL tránh leak (1 ref dùng chung)
  const blobUrlRef = useRef(null);

  const fetchPowerOfAttorney = async (searchValue, page = 1, size = 10) => {
    try {
      localStorage.setItem("powerOfAttorneyPage", page);

      const response = await callAPI({
        method: "post",
        endpoint: "/power-of-attorney/list",
        data: {
          soDonGoc: searchValue,
          tenKhachHang: customerName,
          pageIndex: page,
          pageSize: size,
        },
      });

      setList(response.data || []);
      setTotalItems(response.pagination?.totalItems || 0);
      setPageIndex(response.pagination?.pageIndex || 1);
      setPageSize(response.pagination?.pageSize || 10);
    } catch (error) {
      console.error("Lỗi lấy danh sách giấy ủy quyền:", error);
    }
  };

  useEffect(() => {
    const savedPage = parseInt(localStorage.getItem("powerOfAttorneyPage") || "1", 10);
    fetchPowerOfAttorney("", savedPage, pageSize);

    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loaiGUQOptions = [
    { value: 1, label: "Ủy quyền chung" },
    { value: 2, label: "Ủy quyền theo vụ việc" },
  ];

  const getLoaiGUQLabel = (value) => {
    if (value === null || value === undefined) return "";
    const option = loaiGUQOptions.find((opt) => Number(opt.value) === Number(value));
    return option ? option.label : "";
  };
  /* ========================================================= */

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          📌 Danh sách giấy ủy quyền
        </h2>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchPowerOfAttorney(searchTerm, 1, pageSize);
              }
            }}
            placeholder="🔍 Nhập số đơn gốc"
            className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
          />

          <div className="flex gap-3">
            <button
              onClick={() => fetchPowerOfAttorney(searchTerm, 1, pageSize)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Tìm kiếm
            </button>

            {(role === "admin" || role === "staff") && (
              <button
                onClick={() => navigate("/power-of-attorneyadd")}
                className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
              >
                Thêm mới
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="flex flex-wrap gap-3">
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Khách hàng
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên khách hàng"
                className="border w-full focus:outline-none focus:ring-2 search-input rounded-lg p-2 text-sm"
              />
            </div>

          </div>
        </div>
      </div>

      <div className="mb-2 text-left text-gray-600 text-xl">
        {t("Tìm thấy")} <b className="text-blue-600">{totalItems}</b> {t("kết quả")}
      </div>

      <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow">
        <thead>
          <tr className="text-[#667085] text-center font-normal">
            <th className="p-2 text-table">STT</th>
            <th className="p-2 text-table">Số giấy ủy quyền</th>
            <th className="p-2 text-table">Loại giấy ủy quyền</th>
            <th className="p-2 text-table">Tên Khách Hàng</th>
            <th className="p-2 text-table">Tên đối tác</th>
            <th className="p-2 text-table">Quốc gia</th>
            <th className="p-2 text-table">File</th>
            <th className="p-2 text-table">Ngày ủy quyền</th>
            <th className="p-2 text-table">Ngày hết hạn</th>
            <th className="p-2 text-table">Số đơn gốc</th>
            <th className="p-2 text-table">Ghi chú</th>
            <th className="p-2 text-center text-table"></th>
          </tr>
        </thead>

        <tbody>
          {list.map((item, index) => (
            <tr
              className="group hover:bg-gray-100 text-center border-b relative"
              key={item.id}
            >
              <td className="p-2 text-table">
                {(pageIndex - 1) * pageSize + index + 1}
              </td>

              <td className="p-2 text-table">{item.soGUQ || ""}</td>

              <td className="p-2 text-table">{getLoaiGUQLabel(item.loaiGUQ)}</td>

              <td className="p-2 text-table">{item.KhachHangCuoi?.tenKhachHang || ""}</td>

              <td className="p-2 text-table">{item.DoiTac?.tenDoiTac || ""}</td>

              <td className="p-2 text-table">{item.QuocGia?.tenQuocGia || ""}</td>

              {/* ✅ FILE (URL API) */}
              <td className="p-2 text-table">
                {item.linkAnh ? (
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={`${process.env.REACT_APP_API_URL.replace(
                        "/api",
                        ""
                      )}/api/files/view/${item.linkAnh}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Xem
                    </a>

                    <a
                      href={`${process.env.REACT_APP_API_URL.replace(
                        "/api",
                        ""
                      )}/api/files/download/${item.linkAnh}`}
                      download
                      className="text-green-600 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Tải
                    </a>
                  </div>
                ) : (
                  ""
                )}
              </td>
              <td className="p-2 text-table">
                {item.ngayUyQuyen
                  ? new Date(item.ngayUyQuyen).toLocaleDateString("vi-VN")
                  : ""}
              </td>

              <td className="p-2 text-table">
                {item.ngayHetHan ? (
                  <>
                    {new Date(item.ngayHetHan).toLocaleDateString("vi-VN")}
                    <div
                      className={`text-xs font-semibold ${(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const expiredDate = new Date(item.ngayHetHan);
                        expiredDate.setHours(0, 0, 0, 0);

                        const diff = Math.ceil(
                          (expiredDate - today) / (1000 * 60 * 60 * 24)
                        );

                        return diff < 0 ? "text-red-600" : "text-sky-600";
                      })()}`}
                    >
                      {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const expiredDate = new Date(item.ngayHetHan);
                        expiredDate.setHours(0, 0, 0, 0);

                        const diff = Math.ceil(
                          (expiredDate - today) / (1000 * 60 * 60 * 24)
                        );

                        return diff < 0
                          ? `Quá ${Math.abs(diff)} ngày`
                          : `Còn ${diff} ngày`;
                      })()}
                    </div>
                  </>
                ) : (
                  ""
                )}
              </td>

              <td
                className="p-2 text-table text-blue-500 cursor-pointer hover:underline"
                onClick={() => navigate(`/power-of-attorney/detail/${item.id}`)}
              >
                {item.soDonGoc || ""}
              </td>

              <td className="p-2 text-table">{item.ghiChu || ""}</td>

              <td className="p-2 relative w-[70px]">
                {(role === "admin" || role === "staff") && (
                  <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                    <button
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                      onClick={() => navigate(`/power-of-attorneyedit/${item.id}`)}
                    >
                      📝
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}

          {list.length === 0 && (
            <tr>
              <td colSpan={12} className="text-center p-4 text-gray-500">
                Không có giấy ủy quyền nào
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 flex flex-col items-center space-y-2">
        {totalItems > 0 && (
          <div className="text-sm text-gray-500 text-center">
            <span className="font-medium text-gray-800">
              {(pageIndex - 1) * pageSize + 1} -{" "}
              {Math.min(pageIndex * pageSize, totalItems)}
            </span>
            <span className="mx-1"> / </span>
            <span className="font-medium text-gray-800">{totalItems}</span>
          </div>
        )}

        <Pagination
          current={pageIndex}
          total={totalItems}
          pageSize={pageSize}
          onChange={(page, size) => {
            setPageIndex(page);
            setPageSize(size);
            fetchPowerOfAttorney(searchTerm, page, size);
          }}
          showSizeChanger
          pageSizeOptions={["5", "10", "20", "50"]}
        />
      </div>
    </div>
  );
}

export default PowerOfAttorneyList;
