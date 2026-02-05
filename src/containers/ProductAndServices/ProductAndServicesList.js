import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useSelector } from 'react-redux';
import { Modal } from "antd";
function ProductAndServicesList() {
    const role = useSelector((state) => state.auth.role);
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemeToDelete, setItemToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchItems = async (searchValue) => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/productsandservices/list", // Đổi endpoint nếu khác
                data: { search: searchValue },
            });
            setItems(response);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm/dịch vụ:", error);
        }
    };

    useEffect(() => {
        fetchItems("");
    }, []);
    const handleDeleteItem = async () => {
        try {
            await callAPI({
                method: "post",
                endpoint: "/productsandservices/delete",
                data: { maSPDV: itemeToDelete },
            });
            setShowDeleteModal(false);
            setItemToDelete(null);
            fetchItems(searchTerm);
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm dịch vụ:", error);
        }
    };
    return (
        <div className="p-1 bg-gray-100 min-h-screen">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">📦 Danh sách sản phẩm & dịch vụ</h2>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                fetchItems(searchTerm);
                            }
                        }}
                        placeholder="🔍 Nhập tên sản phẩm/dịch vụ hoặc mô tả"
                        className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchItems(searchTerm)}
                            className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Tìm kiếm
                        </button>
                        <button
                            onClick={() => navigate("/productandservicesadd")}
                            className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Thêm mới
                        </button>
                    </div>
                </div>
            </div>

            <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow">
                <thead>
                    <tr className=" text-[#667085] text-center font-normal">
                        <th className="p-2 font-normal">STT</th>
                        <th className="p-2 font-normal">Mã SP/DV</th>
                        <th className="p-2 font-normal">Tên SP/DV</th>
                        <th className="p-2 font-normal">Mô tả</th>
                        <th className="p-2 text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.maSPDV} className="group hover:bg-gray-100 text-center border-b relative">
                            <td className="p-2 text-table">{index + 1}</td>
                            <td
                                className="p-2 text-blue-500 cursor-pointer hover:underline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/productandservicesdetail/${item.maSPDV}`);
                                }}
                            >
                                {item.maSPDV}
                            </td>
                            <td className="p-2 text-table">{item.tenSPDV}</td>
                            <td className="p-2 text-table">{item.moTa || <i className="text-gray-400">Không có mô tả</i>}</td>
                            <td className="p-2 relative">
                                {(role === 'admin' || role === 'staff') && (
                                    <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                                        <button
                                            onClick={() => navigate(`/productandservicesedit/${item.maSPDV}`)}
                                            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            📝
                                        </button>
                                        <button
                                            className="px-3 py-1 bg-red-200 text-red-600 rounded hover:bg-red-300"
                                            onClick={() => {
                                                setShowDeleteModal(true);
                                                setItemToDelete(item.maSPDV);
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
                onOk={handleDeleteItem}
                onCancel={() => setShowDeleteModal(false)}
                okText="Xác nhận xóa"
                cancelText="Hủy"
                okButtonProps={{
                    className: "bg-red-500 hover:bg-red-600 text-white",
                }}
            >
                <p>Bạn có chắc chắn muốn xóa sản phẩm dịch vụ này không?</p>
            </Modal>
        </div>
    );
}

export default ProductAndServicesList;
