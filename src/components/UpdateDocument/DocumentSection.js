import React, { useState, useEffect } from "react";
import AddDocumentModal from "../UpdateDocument/AddDocumentModal";
import callAPI from "../../utils/api";
import Select from "react-select";

const DocumentSection = ({
    initialTaiLieus,
    onTaiLieuChange,
    isAddOnly,
    isViewOnly,
    maHoSoVuViec,
    giayUyQuyenGoc,
    setGiayUyQuyenGoc,
    maUyQuyen,
    setMaUyQuyen,
    idGUQ,
    setIdGUQ,
    idKhachHang,
}) => {
    const [dsTaiLieu, setDsTaiLieu] = useState([]);
    const [dsGiayUyQuyen, setDsGiayUyQuyen] = useState([]); // danh sách GUQ

    const [modalState, setModalState] = useState({
        isOpen: false,
        fileName: "",
        file: null,
        status: "Đã nộp",
        editingIndex: null,
    });

    // ===== LẤY DANH SÁCH GIẤY ỦY QUYỀN THEO idKhachHang =====
    useEffect(() => {
        const fetchGiayUyQuyen = async () => {
            if (!idKhachHang) return;

            try {
                const res = await callAPI({
                    method: "post",
                    endpoint: "/power-of-attorney/all",
                    data: { idKhachHang },
                });

                // res giả sử là array [{ id, soGUQ, ... }]
                setDsGiayUyQuyen(res);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách giấy ủy quyền:", error);
                setDsGiayUyQuyen([]);
            }
        };

        fetchGiayUyQuyen();
    }, [idKhachHang]);

    // ===== KHỞI TẠO DANH SÁCH TÀI LIỆU =====
    useEffect(() => {
        let docs = [];

        if (initialTaiLieus && initialTaiLieus.length > 0) {
            docs = initialTaiLieus;
        } else if (isAddOnly) {
            docs = [
                {
                    tenTaiLieu: "Giấy ủy quyền",
                    linkTaiLieu: "",
                    trangThai: "Chưa nộp",
                },
                {
                    tenTaiLieu: "Tài liệu bổ sung",
                    linkTaiLieu: "",
                    trangThai: "Chưa nộp",
                },
            ];
        } else {
            docs = [];
        }

        setDsTaiLieu(docs);
        // ❌ KHÔNG gọi onTaiLieuChange ở đây nữa
    }, [initialTaiLieus, isAddOnly]);


    const updateTaiLieuList = (newList) => {
        setDsTaiLieu(newList);
        onTaiLieuChange?.(newList);
    };

    const handleAfterUpdate = (link) => {
        const { fileName, status, editingIndex } = modalState;
        const newTaiLieu = {
            tenTaiLieu: fileName,
            linkTaiLieu: link,
            trangThai: status,
            maTaiLieu:
                editingIndex !== null ? dsTaiLieu[editingIndex].maTaiLieu : undefined,
        };

        const updatedList =
            editingIndex !== null
                ? dsTaiLieu.map((tl, i) => (i === editingIndex ? newTaiLieu : tl))
                : [...dsTaiLieu, newTaiLieu];

        updateTaiLieuList(updatedList);
        setModalState({
            isOpen: false,
            fileName: "",
            file: null,
            status: "Đã nộp",
            editingIndex: null,
        });
    };

    const handleAddTaiLieu = () => {
        const { file, fileName, editingIndex } = modalState;
        if (!fileName) return;

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => handleAfterUpdate(reader.result);
            reader.readAsDataURL(file);
        } else {
            const oldLink =
                editingIndex !== null ? dsTaiLieu[editingIndex].linkTaiLieu : null;
            handleAfterUpdate(oldLink);
        }
    };

    const handleEdit = (idx) => {
        const { tenTaiLieu, trangThai } = dsTaiLieu[idx];
        setModalState({
            isOpen: true,
            fileName: tenTaiLieu,
            file: null,
            status: trangThai,
            editingIndex: idx,
        });
    };

    const handleDelete = (idx) => {
        if (window.confirm("Bạn có chắc muốn xóa tài liệu này?")) {
            const newList = dsTaiLieu.filter((_, i) => i !== idx);
            updateTaiLieuList(newList);
        }
    };

    const formatOptions = (data, valueKey, labelKey) => {
        return data.map((item) => ({
            value: item[valueKey],
            label: item[labelKey],
        }));
    };

    return (
        <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Danh sách tài liệu</h3>

            <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4">
                {/* Checkbox GUQ gốc */}
                <div className="w-full md:w-1/2 flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={giayUyQuyenGoc}
                        onChange={(e) => {
                            setGiayUyQuyenGoc(e.target.checked);
                            if (e.target.checked) {
                                setMaUyQuyen(null); // reset nếu chọn lại là gốc
                            }
                        }}
                        disabled={isViewOnly}
                    />
                    <label className="text-sm font-medium">
                        Đây là giấy ủy quyền gốc
                    </label>
                </div>

                {/* Nhập số đơn có GUQ gốc nếu KHÔNG phải gốc */}
                {!giayUyQuyenGoc && (
                    <div className="w-full md:w-1/2">
                        <label className="block text-gray-700 text-left">
                            Nhập số đơn có giấy ủy quyền gốc
                        </label>
                        <input
                            type="text"
                            value={maUyQuyen || ""}
                            onChange={(e) => setMaUyQuyen(e.target.value)}
                            placeholder="Nhập số đơn"
                            className="w-full mt-1 rounded-lg text-left border p-2"
                            disabled={isViewOnly}
                        />
                    </div>
                )}

                {/* Select số giấy ủy quyền (danh sách lấy từ API) */}
                <div className="w-full md:w-1/2">
                    <label className="block text-gray-700 text-left">
                        Số giấy ủy quyền
                    </label>
                    <Select
                        options={formatOptions(dsGiayUyQuyen, "id", "soGUQ")}
                        value={
                            idGUQ
                                ? formatOptions(dsGiayUyQuyen, "id", "soGUQ").find(
                                    (opt) => opt.value === idGUQ
                                )
                                : null
                        }
                        onChange={(selectedOption) =>
                            setIdGUQ(selectedOption ? selectedOption.value : null)
                        }
                        placeholder="Chọn số giấy ủy quyền"
                        className="w-full mt-1 rounded-lg text-left"
                        isClearable
                        isDisabled={isViewOnly}
                    />
                </div>
            </div>

            {/* Bảng tài liệu */}
            {dsTaiLieu.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có tài liệu nào.</p>
            ) : (
                <div className="overflow-x-auto mb-2">
                    <table className="min-w-full bg-white text-xs overflow-hidden rounded-lg border shadow">
                        <thead>
                            <tr>
                                <th className="px-4 py-1 border">Tên tài liệu</th>
                                <th className="px-4 py-1 border">Link tài liệu</th>
                                <th className="px-4 py-1 border">Trạng thái</th>
                                <th className="px-4 py-1 border text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dsTaiLieu.map((tl, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-1 border">{tl.tenTaiLieu}</td>
                                    <td className="px-4 py-1 border">
                                        {tl.linkTaiLieu ? (
                                            <button
                                                onClick={() => {
                                                    const link = document.createElement("a");
                                                    link.href = tl.linkTaiLieu; // chuỗi base64
                                                    link.download =
                                                        tl.tenTaiLieu || "tai_lieu.docx";
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Tải tài liệu
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 italic">
                                                Không có
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-1 border text-center">
                                        <div className="flex justify-center gap-2">
                                            <label className="flex items-center gap-1">
                                                <input
                                                    type="radio"
                                                    name={`trangThai-${idx}`}
                                                    value="Đã nộp"
                                                    checked={tl.trangThai === "Đã nộp"}
                                                    onChange={() => {
                                                        const updatedList = [...dsTaiLieu];
                                                        updatedList[idx].trangThai = "Đã nộp";
                                                        updateTaiLieuList(updatedList);
                                                    }}
                                                    disabled={isViewOnly}
                                                />
                                                Đã nộp
                                            </label>

                                            <label className="flex items-center gap-1">
                                                <input
                                                    type="radio"
                                                    name={`trangThai-${idx}`}
                                                    value="Chưa nộp"
                                                    checked={tl.trangThai === "Chưa nộp"}
                                                    onChange={() => {
                                                        const updatedList = [...dsTaiLieu];
                                                        updatedList[idx].trangThai = "Chưa nộp";
                                                        updateTaiLieuList(updatedList);
                                                    }}
                                                    disabled={isViewOnly}
                                                />
                                                Chưa nộp
                                            </label>
                                        </div>
                                    </td>
                                    <td className="px-4 py-1 border text-center">
                                        <button
                                            onClick={() => handleEdit(idx)}
                                            className="text-yellow-600 hover:text-yellow-800 font-medium mr-3"
                                            title="Chỉnh sửa"
                                            disabled={isViewOnly}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(idx)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                            title="Xóa"
                                            disabled={isViewOnly}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!isViewOnly && (
                <button
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-sm rounded"
                    onClick={() =>
                        setModalState({
                            ...modalState,
                            isOpen: true,
                        })
                    }
                >
                    Thêm tài liệu
                </button>
            )}

            <AddDocumentModal
                isOpen={modalState.isOpen}
                onClose={() =>
                    setModalState({
                        ...modalState,
                        isOpen: false,
                    })
                }
                onAdd={handleAddTaiLieu}
                fileName={modalState.fileName}
                setFileName={(val) =>
                    setModalState({
                        ...modalState,
                        fileName: val,
                    })
                }
                file={modalState.file}
                setFile={(val) =>
                    setModalState({
                        ...modalState,
                        file: val,
                    })
                }
                status={modalState.status}
                setStatus={(val) =>
                    setModalState({
                        ...modalState,
                        status: val,
                    })
                }
                editingIndex={modalState.editingIndex}
            />
        </div>
    );
};

export default DocumentSection;
