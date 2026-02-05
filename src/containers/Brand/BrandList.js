import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useSelector } from 'react-redux';
import { Modal } from "antd";
function BrandList() {
    const role = useSelector((state) => state.auth.role);
    const [brands, setBrands] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState(null);
    const fetchBrands = async (searchValue) => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/brand/list",
                data: { search: searchValue },
            });
            setBrands(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu nhãn hiệu:", error);
        }
    };

    useEffect(() => {
        fetchBrands("");
    }, []);
    const handleDeleteBrand = async () => {
        try {
            await callAPI({
                method: "post",
                endpoint: "/brand/delete",
                data: { maNhanHieu: brandToDelete },
            });
            setShowDeleteModal(false);
            setBrandToDelete(null);
            fetchBrands(searchTerm);
        } catch (error) {
            console.error("Lỗi khi xóa nhãn hiệu:", error);
        }
    };
    return (
        <div className="p-1 bg-gray-100 min-h-screen">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">🏷️ Danh sách nhãn hiệu</h2>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                fetchBrands(searchTerm);
                            }
                        }}
                        placeholder="🔍 Nhập tên nhãn hiệu"
                        className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchBrands(searchTerm)}
                            className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Tìm kiếm
                        </button>
                        {/* <button
                            onClick={() => navigate("/brandadd")}
                             className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Thêm mới
                        </button> */}
                    </div>
                </div>
            </div>

            <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow">
                <thead>
                    <tr className=" text-[#667085] text-center font-normal">
                        <th className="p-2 text-table">STT</th>
                        <th className="p-2 text-table">Mã nhãn hiệu</th>
                        <th className="p-2 text-table">Tên nhãn hiệu</th>
                        <th className="p-2 text-table">Ảnh</th>
                        <th className="p-2 text-center"></th>
                    </tr>
                </thead>
                <tbody>
                    {brands.map((brand, index) => (
                        <tr key={brand.maNhanHieu} className="group hover:bg-gray-100 text-center border-b relative">
                            <td className="p-2 text-table">{index + 1}</td>
                            <td
                                className="p-2 text-table text-blue-500 cursor-pointer hover:underline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/branddetail/${brand.maNhanHieu}`);
                                }}
                            >
                                {brand.maNhanHieu}
                            </td>
                            <td className="p-2 text-table">{brand.tenNhanHieu}</td>
                            <td className="p-2 text-table">
                                {brand.linkAnh ? (
                                    <img src={brand.linkAnh} alt="Brand" className="w-16 h-16 object-contain mx-auto" />
                                ) : (
                                    <span className="text-gray-400 italic">Không có ảnh</span>
                                )}
                            </td>

                            <td className="p-2 relative">
                                {(role === 'admin' || role === 'staff') && (
                                    <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                                        <button
                                            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                                            onClick={() => navigate(`/brandedit/${brand.maNhanHieu}`)}
                                        >
                                            📝
                                        </button>
                                        <button className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                                            onClick={() => {
                                                setShowDeleteModal(true);
                                                setBrandToDelete(brand.maNhanHieu);
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
                onOk={handleDeleteBrand}
                onCancel={() => setShowDeleteModal(false)}
                okText="Xác nhận xóa"
                cancelText="Hủy"
                okButtonProps={{
                    className: "bg-red-500 hover:bg-red-600 text-white",
                }}
            >
                <p>Bạn có chắc chắn muốn xóa nhãn hiệu này không?</p>
            </Modal>
        </div>
    );
}

export default BrandList;
