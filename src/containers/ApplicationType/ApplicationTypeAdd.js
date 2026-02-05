import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
function ApplicationTypeAdd() {
    const navigate = useNavigate();
    const [maLoaiDon, setMaLoaiDon] = useState("");
    const [tenLoaiDon, setTenLoaiDon] = useState("");
    const [moTa, setMoTa] = useState("");

    const [errors, setErrors] = useState({});
    const isFormValid = maLoaiDon.trim() !== "" && tenLoaiDon.trim() !== "";
    const validateField = (field, value) => {
        let error = "";
        if (!value.trim()) {
            if (field === "maLoaiDon") error = "Mã loại đơn không được để trống";
            if (field === "tenLoaiDon") error = "Tên loại đơn không được để trống";
        }
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: error,
        }));
    };
    const handleAddCaseType = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/applicationtype/add",
                data: {
                    maLoaiDon,
                    tenLoaiDon,
                    moTa,
                },
            });
            await showSuccess("Thành công!", "Thêm loại Đơn đăng ký hoàn tất!");
            setMaLoaiDon("");
            setTenLoaiDon("");
            setMoTa("");
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
            console.error("Lỗi khi thêm loại đơn!", error);
        }
    };

    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Thêm loại đơn mới</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 text-left">Mã loại đơn <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={maLoaiDon}
                            onChange={(e) => {
                                setMaLoaiDon(e.target.value)
                                validateField("maLoaiDon", e.target.value);
                            }}
                            placeholder="Nhập mã loại đơn"
                            className="w-full p-2 mt-1 border rounded-lg text-input"
                        />
                        {errors.maLoaiDon && (
                            <p className="text-red-500 text-xs mt-1 text-left">{errors.maLoaiDon}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Tên loại đơn <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={tenLoaiDon}
                            onChange={(e) => {
                                setTenLoaiDon(e.target.value)
                                validateField("tenLoaiDon", e.target.value);
                            }}
                            placeholder="Nhập tên loại đơn"
                            className="w-full p-2 mt-1 border rounded-lg text-input"
                        />
                        {errors.tenLoaiDon && (
                            <p className="text-red-500 text-xs mt-1 text-left">{errors.tenLoaiDon}</p>
                        )}
                    </div>
                    <div className="col-span-2">
                        <label className="block text-gray-700 text-left">Mô tả</label>
                        <textarea
                            value={moTa}
                            onChange={(e) => setMoTa(e.target.value)}
                            placeholder="Nhập mô tả loại vụ việc"
                            className="w-full p-2 mt-1 border rounded-lg  h-24"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                    <button className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>
                    <button
                        onClick={handleAddCaseType}
                        disabled={!isFormValid}
                        className={`px-4 py-2 rounded-lg text-white ${isFormValid
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-300 cursor-not-allowed"
                            }`}
                    >
                        Thêm loại đơn
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ApplicationTypeAdd;
