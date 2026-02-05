import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";

function ApplicationTypeDetail() {
    const navigate = useNavigate();
    const { maLoaiDon } = useParams();
    const [tenLoaiDon, setTenLoaiDon] = useState("");
    const [moTa, setMoTa] = useState("");

    // Gọi API lấy thông tin chi tiết khi vào trang
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await callAPI({
                    method: "post",
                    endpoint: "/applicationtype/detail",
                    data: { maLoaiDon },
                });
                if (response) {
                    setTenLoaiDon(response.tenLoaiDon);
                    setMoTa(response.moTa);
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin loại đơn!", error);
            }
        };

        fetchData();
    }, [maLoaiDon]);

    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Chỉnh sửa loại đơn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                    <label className="block text-gray-700 text-left">Mã loại đơn <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={maLoaiDon}
                            disabled
                            className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-100 cursor-not-allowed"
                        />
                    </div>
                    <div>
                    <label className="block text-gray-700 text-left">Tên loại đơn <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={tenLoaiDon}
                            onChange={(e) => setTenLoaiDon(e.target.value)}
                            placeholder="Nhập tên loại đơn"
                            disabled
                            className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-100"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-gray-700 text-left">Mô tả</label>
                        <textarea
                            value={moTa}
                            onChange={(e) => setMoTa(e.target.value)}
                            placeholder="Nhập mô tả loại vụ việc"
                            disabled
                            className="w-full p-2 mt-1 border rounded-lg h-24 bg-gray-100"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                    <button className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ApplicationTypeDetail;
