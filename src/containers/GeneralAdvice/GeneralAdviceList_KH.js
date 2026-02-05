import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { Pagination } from "antd";

function GeneralAdviceList_KH() {
    const { t } = useTranslation();
    const role = useSelector((state) => state.auth.role);
    const [advices, setAdvices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const navigate = useNavigate();

    const fetchGeneralAdvices = async (searchValue, page = 1, size = 10) => {
        try {
            localStorage.setItem("generalAdviceVNPage", page);
            const response = await callAPI({
                method: "post",
                endpoint: "/generaladvices_kh/list",
                data: {
                    keyword: searchValue,
                    pageIndex: page,
                    pageSize: size,
                },
            });

            setAdvices(response.data);
            setTotalItems(response.pagination?.totalItems || 0);
            setPageIndex(response.pagination?.pageIndex || 1);
            setPageSize(response.pagination?.pageSize || 10);

        } catch (error) {
            console.error("Lỗi lấy tư vấn chung VN:", error);
        }
    };

    useEffect(() => {
        const savedPage = parseInt(localStorage.getItem("generalAdviceVNPage") || "1", 10);
        fetchGeneralAdvices("", savedPage, pageSize);
    }, []);

    return (
        <div className="p-1 bg-gray-100 min-h-screen">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Danh sách tư vấn chung (KH)</h2>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                fetchGeneralAdvices(searchTerm, 1, pageSize);
                            }
                        }}
                        placeholder="🔍 Nhập nội dung tư vấn / tên KH"
                        className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchGeneralAdvices(searchTerm, 1, pageSize)}
                            className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Tìm kiếm
                        </button>
                        <button
                            onClick={() => navigate("/generaladviceadd_kh")}
                            className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Thêm mới
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-2 text-left text-gray-600 text-xl">
                {t("Tìm thấy")} <b className="text-blue-600">{totalItems}</b> {t("kết quả")}
            </div>

            <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow">
                <thead>
                    <tr className=" text-[#667085] text-center font-normal">
                        <th className="p-2 text-table">STT</th>
                        <th className="p-2 text-table">Mã hồ sơ</th>
                        <th className="p-2 text-table">Khách hàng</th>
                        <th className="p-2 text-table">Đối tác</th>
                        <th className="p-2 text-table">Deadline</th>
                        <th className="p-2 text-table">Soft Deadline</th>
                        <th className="p-2 text-table">Ngày xử lý</th>
                        <th className="p-2 text-table">Ngày hoàn thành</th>
                        <th className="p-2 text-table">Nội dung tư vấn</th>
                        <th className="p-2 text-table">Ghi chú</th>
                        <th className="p-2 text-table">Trạng thái</th>
                        <th className="p-2 text-center text-table"></th>
                    </tr>
                </thead>

                <tbody>
                    {advices.map((item, index) => (
                        <tr className="group hover:bg-gray-100 text-center border-b relative" key={item.id}>
                            <td className="p-2 text-table">{(pageIndex - 1) * pageSize + index + 1}</td>
                            <td
                                className="p-2 text-table text-blue-500 cursor-pointer hover:underline"
                                onClick={() => navigate(`/generaladvicedetail/${item.id}`)}
                            >
                                {item.maHoSo}
                            </td>

                            <td className="p-2 text-table">{item.tenKhachHang}</td>
                            <td className="p-2 text-table">{item.tenDoiTac}</td>
                            <td className="p-2 text-table">{item.deadline ? new Date(item.deadline).toLocaleDateString("vi-VN") : ""}</td>
                            <td className="p-2 text-table">{item.softDeadline ? new Date(item.softDeadline).toLocaleDateString("vi-VN") : ""}</td>
                            <td className="p-2 text-table">{item.ngayXuLy ? new Date(item.ngayXuLy).toLocaleDateString("vi-VN") : ""}</td>
                            <td className="p-2 text-table">{item.ngayHoanThanh ? new Date(item.ngayHoanThanh).toLocaleDateString("vi-VN") : ""}</td>
                            <td className="p-2 text-table">{item.noiDung}</td>
                            <td className="p-2 text-table">{item.ghiChu}</td>
                            <td className="p-2 text-table">{item.trangThai}</td>

                            <td className="p-2 relative">
                                {(role === "admin" || role === "staff") && (
                                    <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                                        <button
                                            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                                            onClick={() => navigate(`/generaladviceedit_kh/${item.id}`)}
                                        >
                                            📝
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4 flex flex-col items-center space-y-2">
                {totalItems > 0 && (
                    <div className="text-sm text-gray-500 text-center ">
                        <span className="font-medium text-gray-800">
                            {(pageIndex - 1) * pageSize + 1} - {Math.min(pageIndex * pageSize, totalItems)}
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
                        fetchGeneralAdvices(searchTerm, page, size)
                    }}
                    showSizeChanger
                    pageSizeOptions={['5', '10', '20', '50']}
                />
            </div>
        </div>
    );
}

export default GeneralAdviceList_KH;
