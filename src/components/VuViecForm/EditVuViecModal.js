// AddVuViecModal.jsx
import React, { useState, useEffect } from "react";
import {
    Modal,
    Button,
    Input,
    DatePicker,
    InputNumber,
    Select,
    Checkbox,
    Space,
    message,
    Tag,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError, showWarning } from "../../components/commom/Notification";
function EditVuViecModal({
    isOpen,
    onClose,
    onSave,
    record,
    dsNguoiXuLy = [],
    initialMaHoSo,
    defaultType,
    isMainCaseCheck,
    tenLoaiDon,
    maDonDangKy,
}) {
    const navigate = useNavigate();
    const [maHoSo, setMaHoSo] = useState(initialMaHoSo);
    const [loaiTienTe, setLoaiTienTe] = useState("VND");

    const [tenVuViec, setTenVuViec] = useState("");
    const [ngayTaoVV, setNgayTaoVV] = useState(dayjs());
    const [deadline, setDeadline] = useState(null);
    const [softDeadline, setSoftDeadline] = useState(null);
    const [soTien, setSoTien] = useState(0);
    const [ghiChu, setGhiChu] = useState("");
    const [maNguoiXuLy, setMaNguoiXuLy] = useState(null);
    const [xuatBill, setXuatBill] = useState(false);
    const [moTa, setMoTa] = useState("");

    // 2 checkbox riêng
    const [isDangKy, setIsDangKy] = useState(isMainCaseCheck ?? false);
    const [isTiepQuan, setIsTiepQuan] = useState(false);

    const [dsNhanSu, setDsNhanSu] = useState([]);

    // trạng thái để hiển thị lỗi đẹp hơn
    const [touched, setTouched] = useState({
        tenVuViec: false,
        moTa: false,
        soTien: false,
    });
    const [trangThaiYCTT, setTrangThaiYCTT] = useState(undefined); // 0/1/2/3
    const [ghiChuTuChoi, setGhiChuTuChoi] = useState("");

    const ycttText = (v) => (v === 2 ? "Bị từ chối" : v === 3 ? "Đã duyệt" : "Chưa duyệt");
    const ycttColor = (v) => (v === 2 ? "red" : v === 3 ? "green" : "default");

    const isTenVuViecValid = !!tenVuViec?.trim();
    const isMoTaValid = !!moTa?.trim();
    const isSoTienValid = Number(soTien) > 0;
    const canSave = isTenVuViecValid && isMoTaValid && isSoTienValid;

    useEffect(() => {
        fetchNhanSu();

        if (record) {
            setMaHoSo(record.maHoSo || initialMaHoSo || "");
            setTenVuViec(record.tenVuViec || "");
            setNgayTaoVV(record.ngayTaoVV ? dayjs(record.ngayTaoVV) : dayjs());
            setDeadline(record.deadline ? dayjs(record.deadline) : null);
            setSoftDeadline(record.softDeadline ? dayjs(record.softDeadline) : null);
            setSoTien(record.soTien || 0);
            setLoaiTienTe(record.loaiTienTe || "VND");
            setMaNguoiXuLy(record.maNguoiXuLy || null);
            setXuatBill(record.xuatBill === true || record.xuatBill === "Đã xuất");
            setMoTa(record.moTa || "");

            setTrangThaiYCTT(record.trangThaiYCTT);
            setGhiChuTuChoi(record.ghiChuTuChoi || "");

            const main = record.isMainCase ?? false;
            setIsDangKy(main);
            setIsTiepQuan(!main && record.tenVuViec?.trim() === "Tiếp quản và theo đuổi");
        } else {
            setMaHoSo(initialMaHoSo || "");
            setTenVuViec("");
            setNgayTaoVV(dayjs());
            setDeadline(null);
            setSoftDeadline(null);
            setSoTien(0);
            setLoaiTienTe("VND");
            setMaNguoiXuLy(null);
            setXuatBill(false);
            setMoTa("");

            setTrangThaiYCTT(undefined);
            setGhiChuTuChoi("");

            setIsDangKy(isMainCaseCheck ?? false);
            setIsTiepQuan(false);
        }
        setTouched({ tenVuViec: false, moTa: false, soTien: false });
    }, [record, defaultType, initialMaHoSo, isMainCaseCheck]);

    useEffect(() => {
        if (isDangKy) {
            setTenVuViec(tenLoaiDon || "Nộp đơn đăng ký nhãn hiệu");
        }
    }, [isDangKy, tenLoaiDon]);

    const fetchNhanSu = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/staff/list",
                data: {},
            });
            setDsNhanSu(response);
        } catch (error) {
            console.error("Lỗi lấy danh sách nhân sự:", error);
        }
    };

    const handleOk = async () => {
        if (!canSave) {
            setTouched({ tenVuViec: true, moTa: true, soTien: true });
            message.error("Vui lòng nhập đầy đủ: Tên vụ việc, Mô tả và Số tiền (> 0).");
            return;
        }

        try {
            const payload = {
                id: record.id,
                tenVuViec,
                moTa,
                trangThai: record?.trangThai, // giữ nguyên nếu không đổi
                deadline: deadline ? deadline.format("YYYY-MM-DD") : null,
                softDeadline: softDeadline ? softDeadline.format("YYYY-MM-DD") : null,
                soTien,
                loaiTienTe,
                maNguoiXuLy,
                xuatBill,
                isMainCase: !!isDangKy,
            };

            const resp = await callAPI({
                method: "put",
                endpoint: `/vu-viec/edit`,
                data: payload,
            });

            await showSuccess("Thành công!", "Cập nhât nghiệp vụ thành công!");
            // if (onUpdated) onUpdated(resp.vuViec);
            onClose();
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
            console.error("Lỗi cập nhật vụ việc:", error);
            message.error(error?.response?.data?.message || "Có lỗi khi cập nhật vụ việc");
        }
    };

    const handleSelectLoaiDon = (type) => {
        if (type === "chuyen_quyen" || type === "sua_doi") {
            window.open(`/application_sd_nh_vn_add/${maDonDangKy}`, "_blank");
        } else if (type === "tach_don") {
            window.open(`/application_td_nh_vn_add/${maDonDangKy}`, "_blank");
        } else if (type === "nhan_moi") {
            setIsDangKy(false);
            setIsTiepQuan(false);
            setTenVuViec("Đăng ký nhãn hiệu mới");
        }
    };

    const onToggleDangKy = (checked) => {
        setIsDangKy(checked);
        if (checked) {
            setIsTiepQuan(false);
            setTenVuViec(tenLoaiDon || "Nộp đơn đăng ký nhãn hiệu");
        } else {
            setTenVuViec("");
        }
    };

    const onToggleTiepQuan = (checked) => {
        setIsTiepQuan(checked);
        if (checked) {
            setIsDangKy(false);
            setTenVuViec("Tiếp quản và theo đuổi");
        } else {
            setTenVuViec("");
        }
    };

    const isAutoName = isDangKy || isTiepQuan;
    const formatGroup = (value, sep = ".") => {
        if (value === undefined || value === null) return "";
        const raw = String(value).replace(/[^\d]/g, "");
        return raw.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    };

    // const handleSaveEdit = async () => {
    //     if (!editingCase) return;

    //     // Validate đơn giản
    //     if (!editingCase.moTa || !editingCase.soTien || Number(editingCase.soTien) <= 0) {
    //         message.error("Vui lòng nhập đầy đủ Mô tả và Số tiền > 0");
    //         return;
    //     }

    //     try {
    //         // 1️⃣ Gọi API cập nhật nghiệp vụ
    //         const payload = {
    //             id: editingCase.id,
    //             tenVuViec: editingCase.tenVuViec,    // nếu có, tuỳ bạn dùng hay không
    //             moTa: editingCase.moTa,
    //             soTien: editingCase.soTien,
    //             // nếu backend yêu cầu thêm thì map thêm ở đây
    //             // deadline: editingCase.deadline,
    //             // softDeadline: editingCase.softDeadline,
    //             // loaiTienTe: editingCase.loaiTienTe,
    //             // maNguoiXuLy: editingCase.maNguoiXuLy,
    //             // xuatBill: editingCase.xuatBill,
    //             // isMainCase: !!editingCase.isDangKy,
    //         };

    //         const resp = await callAPI({
    //             method: "put",
    //             endpoint: "/vu-viec/edit",
    //             data: payload,
    //         });

    //         // 2️⃣ Cập nhật lại list selectedCases trên giao diện
    //         setSelectedCases((prev) =>
    //             prev.map((item) =>
    //                 item.id === editingCase.id
    //                     ? {
    //                         ...item,
    //                         moTa: editingCase.moTa,
    //                         clientsRef: editingCase.clientsRef,
    //                         qty: editingCase.qty || 1,
    //                         soTien: editingCase.soTien,
    //                     }
    //                     : item
    //             )
    //         );

    //         await showSuccess("Thành công!", "Cập nhật nghiệp vụ thành công!");
    //         setEditModalVisible(false);
    //         setEditingCase(null);
    //     } catch (error) {
    //         console.error("Lỗi cập nhật vụ việc:", error);
    //         showError("Thất bại!", "Đã xảy ra lỗi khi cập nhật nghiệp vụ.", error);
    //         message.error(error?.response?.data?.message || "Có lỗi khi cập nhật vụ việc");
    //     }
    // };

    return (
        <Modal
            open={isOpen}
            title={record ? "CẬP NHẬT NGHIỆP VỤ" : "THÊM NGHIỆP VỤ MỚI"}
            onCancel={onClose}
            footer={
                <Space>
                    <Button key="cancel" onClick={onClose}>
                        Đóng
                    </Button>
                    <Button key="ok" type="primary" onClick={handleOk} disabled={!canSave}>
                        Lưu
                    </Button>
                </Space>
            }
            width={750}
        >
            {/* Hàng trên cùng */}
            <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Checkbox checked={isDangKy} onChange={(e) => onToggleDangKy(e.target.checked)}>
                        {tenLoaiDon || "Nộp đơn đăng ký nhãn hiệu"}
                    </Checkbox>

                    <Checkbox checked={isTiepQuan} onChange={(e) => onToggleTiepQuan(e.target.checked)}>
                        {"Tiếp quản và theo đuổi"}
                    </Checkbox>
                </div>

                <div className="text-right">
                    <span className="block text-gray-500 text-sm">Mã hồ sơ</span>
                    <span className="text-base font-semibold">{maHoSo}</span>
                </div>
            </div>
            {record && (
                <div className="mb-4 grid grid-cols-1 gap-2">
                    <div>
                        <span className="block text-gray-700 font-medium mb-1">
                            Trạng thái yêu cầu thanh toán
                        </span>
                        <Tag color={ycttColor(trangThaiYCTT)}>{ycttText(trangThaiYCTT)}</Tag>
                    </div>
                    {trangThaiYCTT === 2 && (
                        <div>
                            <span className="block text-gray-700 font-medium">Ghi chú từ chối</span>
                            <Input.TextArea
                                value={ghiChuTuChoi}
                                readOnly
                                rows={3}
                                className="mt-1"
                                style={{ background: "#fafafa" }}
                                placeholder="Không có ghi chú"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Các shortcut thao tác nhanh */}
            <div className="mb-4 grid grid-cols-2 gap-6">
                <Button
                    onClick={() => handleSelectLoaiDon("chuyen_quyen")}
                    className="justify-start text-left text-blue-600"
                >
                    Chuyển quyền sở hữu đơn đăng ký
                </Button>
                <Button
                    onClick={() => handleSelectLoaiDon("sua_doi")}
                    className="justify-start text-left text-blue-600"
                >
                    Sửa đổi đơn đăng ký
                </Button>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-6">
                <Button
                    onClick={() => handleSelectLoaiDon("tach_don")}
                    className="justify-start text-left text-blue-600"
                >
                    Tách đơn đăng ký
                </Button>
            </div>

            {/* Form chính */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-700 font-medium">
                        Tên vụ việc <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={tenVuViec}
                        onChange={(e) => setTenVuViec(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, tenVuViec: true }))}
                        placeholder="Nhập tên vụ việc"
                        className="mt-1"
                        disabled={isAutoName}
                        status={!isTenVuViecValid && touched.tenVuViec ? "error" : undefined}
                    />
                    {!isTenVuViecValid && touched.tenVuViec && (
                        <div className="text-red-500 text-xs mt-1">Bắt buộc nhập Tên vụ việc.</div>
                    )}
                </div>
            </div>

            {/* Ngày */}
            <div className="grid grid-cols-3 gap-6 mt-4">
                <div>
                    <label className="block text-gray-700 font-medium">Ngày tạo</label>
                    <DatePicker
                        value={ngayTaoVV}
                        onChange={(date) => setNgayTaoVV(date)}
                        format="DD/MM/YYYY"
                        size="large"
                        className="mt-1 w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Deadline</label>
                    <DatePicker
                        value={deadline}
                        onChange={(date) => setDeadline(date)}
                        format="DD/MM/YYYY"
                        size="large"
                        className="mt-1 w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Ghi chú</label>
                    <Input
                        value={ghiChu}
                        onChange={(e) => setGhiChu(e.target.value)}
                        placeholder="Nhập ghi chú deadline"
                        size="large"
                        className="mt-1 w-full"
                        allowClear
                    />
                </div>
            </div>
            {/* Phí & Người xử lý */}
            <div className="grid grid-cols-2 gap-6 mt-4 items-start">
                {/* Cột 1: Phí vụ việc */}
                <div className="flex flex-col">
                    <label className="block text-gray-700 font-medium">
                        Phí vụ việc <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 mt-1 items-center">
                        <InputNumber
                            size="large"
                            min={0}
                            value={soTien}
                            onChange={(val) => setSoTien(val ?? 0)}
                            className="w-full"
                            inputMode="numeric"
                            step={1000}
                            formatter={(v) => formatGroup(v, loaiTienTe === "USD" ? "," : ".")}
                            parser={(v) => (v ? v.replace(/[^\d]/g, "") : "")}
                            status={!isSoTienValid && touched.soTien ? "error" : undefined}
                            onBlur={() => setTouched((t) => ({ ...t, soTien: true }))}
                        />
                        <Select
                            size="large"
                            value={loaiTienTe}
                            onChange={(val) => setLoaiTienTe(val)}
                            placeholder="Loại tiền"
                            style={{ width: 120 }}
                            options={[
                                { value: "VND", label: "VND" },
                                { value: "USD", label: "USD" },
                            ]}
                        />
                    </div>
                    {/* Vùng hiển thị/đệm lỗi để giữ chiều cao hai cột bằng nhau */}
                    <div className="min-h-[22px]">
                        {!isSoTienValid && touched.soTien && (
                            <div className="text-red-500 text-xs mt-1">
                                Số tiền phải lớn hơn 0.
                            </div>
                        )}
                    </div>
                </div>

                {/* Cột 2: Thêm nhân sự */}
                <div className="flex flex-col">
                    <label className="block text-gray-700 font-medium">Thêm nhân sự</label>
                    <Select
                        size="large"
                        value={maNguoiXuLy}
                        onChange={(val) => setMaNguoiXuLy(val)}
                        placeholder="Chọn nhân sự"
                        style={{ width: "100%" }}
                        options={dsNhanSu.map((ns) => ({
                            value: ns.maNhanSu,
                            label: ns.tenNhanSu,
                        }))}
                    />
                    {/* Đệm chiều cao để cân với vùng lỗi cột bên trái */}
                    <div className="min-h-[22px]" />
                </div>
            </div>
            {/* Checkbox khác */}
            <div className="mt-4 grid grid-cols-2 gap-4">
                <Checkbox checked={xuatBill} onChange={(e) => setXuatBill(e.target.checked)}>
                    Yêu cầu thanh toán
                </Checkbox>
            </div>

            {/* Mô tả */}
            <div className="mt-4">
                <label className="block text-gray-700 font-medium">
                    Mô tả công việc (sẽ hiển thị trên Debit Note) <span className="text-red-500">*</span>
                </label>
                <Input.TextArea
                    value={moTa}
                    onChange={(e) => setMoTa(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, moTa: true }))}
                    rows={3}
                    placeholder="Nhập mô tả chi tiết..."
                    className="mt-1"
                    status={!isMoTaValid && touched.moTa ? "error" : undefined}
                />
                {!isMoTaValid && touched.moTa && (
                    <div className="text-red-500 text-xs mt-1">Bắt buộc nhập Mô tả.</div>
                )}
            </div>
        </Modal>
    );
}

export default EditVuViecModal;
