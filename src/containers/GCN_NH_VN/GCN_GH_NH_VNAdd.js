import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { Button, Spin, message } from "antd";
import "dayjs/locale/vi";
import callAPI from "../../utils/api.js";
import { showSuccess, showError } from "../../components/commom/Notification.js";
import FormGiaHan from "../../components/commom/FormGiaHan.js";
import DocumentSection_KH from "../../components/TrademarkRegistrationProcess/KH/DocumentSection_KH.js";

function GCN_GH_NH_VNAdd() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Thông tin GCN gốc
    const [gcnDetail, setGcnDetail] = useState(null);

    // Form Gia Hạn
    const [soDon, setSoDon] = useState("");
    const [ngayNopYCGiaHan, setNgayNopYCGiaHan] = useState(null);
    const [donGoc, setDonGoc] = useState(false);
    const [ngayKQThamDinh_DuKien, setNgayKQThamDinh_DuKien] = useState(null);
    const [trangThaiThamDinh, setTrangThaiThamDinh] = useState(true);
    const [ngayThongBaoTuChoiGiaHan, setNgayThongBaoTuChoiGiaHan] = useState(null);
    const [hanTraLoiTuChoiGiaHan, setHanTraLoiTuChoiGiaHan] = useState(null);
    const [ngayTraLoiThongBaoTuChoiGiaHan, setNgayTraLoiThongBaoTuChoiGiaHan] = useState(null);
    const [trangThaiTuChoiGiaHan, setTrangThaiTuChoiGiaHan] = useState(null);
    const [ngayQuyetDinhTuChoiGiaHan, setNgayQuyetDinhTuChoiGiaHan] = useState(null);
    const [ngayQuyetDinhGiaHan_DuKien, setNgayQuyetDinhGiaHan_DuKien] = useState(null);
    const [ngayQuyetDinhGiaHan, setNgayQuyetDinhGiaHan] = useState(null);
    const [ngayDangBa, setNgayDangBa] = useState(null);
    const [taiLieuList, setTaiLieuList] = useState([]);

    useEffect(() => {
        if (id) {
            fetchGcnDetail();
        }
    }, [id]);

    const fetchGcnDetail = async () => {
        setLoading(true);
        try {
            const res = await callAPI({
                method: "post",
                endpoint: "/gcn_nh/detail",
                data: { id },
            });
            if (res) {
                setGcnDetail(res);
            }
        } catch (error) {
            console.error("Lỗi khi tải chi tiết GCN:", error);
            message.error("Không thể tải thông tin Giấy chứng nhận.");
        } finally {
            setLoading(false);
        }
    };

    const handleTaiLieuChange = (list) => {
        setTaiLieuList(list);
    };

    const handleSubmit = async () => {
        if (!soDon?.trim()) {
            message.error("Vui lòng nhập Số đơn gia hạn.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                idGCN_NH: id,
                maHoSo: gcnDetail?.maHoSo || "",
                soDon: soDon.trim(),
                ngayNopYCGiaHan,
                donGoc: false,
                ngayKQThamDinh_DuKien,
                trangThaiThamDinh,
                ngayThongBaoTuChoiGiaHan,
                hanTraLoiTuChoiGiaHan,
                ngayTraLoiThongBaoTuChoiGiaHan,
                trangThaiTuChoiGiaHan,
                ngayQuyetDinhTuChoiGiaHan,
                ngayQuyetDinhGiaHan_DuKien,
                ngayQuyetDinhGiaHan,
                ngayDangBa,
                taiLieuList,
            };

            await callAPI({
                method: "post",
                endpoint: "/application_gh_nh_vn/add",
                data: payload,
            });

            await showSuccess("Thành công!", "Thêm đơn gia hạn giấy chứng nhận thành công!");
            navigate(-1);
        } catch (error) {
            console.error("Lỗi khi thêm đơn gia hạn:", error);
            showError("Thất bại!", "Đã xảy ra lỗi khi thêm đơn gia hạn.", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-5xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
                    📌 THÊM MỚI ĐƠN GIA HẠN GIẤY CHỨNG NHẬN NHÃN HIỆU
                </h2>

                <Spin spinning={loading}>
                    {/* Tóm tắt GCN gốc */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                            Thông tin Giấy chứng nhận
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 font-medium">Số bằng: </span>
                                <span className="font-semibold text-gray-800">
                                    {gcnDetail?.soBang || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Số đơn gốc: </span>
                                <span className="font-semibold text-gray-800">
                                    {gcnDetail?.soDon || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Mã hồ sơ: </span>
                                <span className="font-semibold text-gray-800">
                                    {gcnDetail?.maHoSo || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Chủ bằng: </span>
                                <span className="font-semibold text-gray-800">
                                    {gcnDetail?.tenKhachHang || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Đại diện SHCN: </span>
                                <span className="font-semibold text-gray-800">
                                    {gcnDetail?.tenDoiTac || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Tên nhãn hiệu: </span>
                                <span className="font-semibold text-gray-800">
                                    {gcnDetail?.tenNhanHieu || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Ngày cấp bằng: </span>
                                <span className="font-semibold text-gray-800">
                                    {gcnDetail?.ngayCapBang
                                        ? dayjs(gcnDetail.ngayCapBang).format("DD/MM/YYYY")
                                        : "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Ngày hết hạn bằng: </span>
                                <span className="font-semibold text-gray-800">
                                    {gcnDetail?.ngayHetHanBang
                                        ? dayjs(gcnDetail.ngayHetHanBang).format("DD/MM/YYYY")
                                        : "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách tài liệu */}
                    <div className="mb-6">
                        <DocumentSection_KH
                            onTaiLieuChange={handleTaiLieuChange}
                            initialTaiLieus={taiLieuList}
                        />
                    </div>

                    {/* Form gia hạn */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                            Thông tin Đơn gia hạn
                        </h3>
                        <FormGiaHan
                            soDon={soDon}
                            setSoDon={setSoDon}
                            ngayNopYCGiaHan={ngayNopYCGiaHan}
                            setNgayNopYCGiaHan={setNgayNopYCGiaHan}
                            donGoc={donGoc}
                            setDonGoc={setDonGoc}
                            ngayKQThamDinh_DuKien={ngayKQThamDinh_DuKien}
                            setNgayKQThamDinh_DuKien={setNgayKQThamDinh_DuKien}
                            trangThaiThamDinh={trangThaiThamDinh}
                            setTrangThaiThamDinh={setTrangThaiThamDinh}
                            ngayThongBaoTuChoiGiaHan={ngayThongBaoTuChoiGiaHan}
                            setNgayThongBaoTuChoiGiaHan={setNgayThongBaoTuChoiGiaHan}
                            hanTraLoiTuChoiGiaHan={hanTraLoiTuChoiGiaHan}
                            setHanTraLoiTuChoiGiaHan={setHanTraLoiTuChoiGiaHan}
                            ngayTraLoiThongBaoTuChoiGiaHan={ngayTraLoiThongBaoTuChoiGiaHan}
                            setNgayTraLoiThongBaoTuChoiGiaHan={setNgayTraLoiThongBaoTuChoiGiaHan}
                            trangThaiTuChoiGiaHan={trangThaiTuChoiGiaHan}
                            setTrangThaiTuChoiGiaHan={setTrangThaiTuChoiGiaHan}
                            ngayQuyetDinhTuChoiGiaHan={ngayQuyetDinhTuChoiGiaHan}
                            setNgayQuyetDinhTuChoiGiaHan={setNgayQuyetDinhTuChoiGiaHan}
                            ngayQuyetDinhGiaHan_DuKien={ngayQuyetDinhGiaHan_DuKien}
                            setNgayQuyetDinhGiaHan_DuKien={setNgayQuyetDinhGiaHan_DuKien}
                            ngayQuyetDinhGiaHan={ngayQuyetDinhGiaHan}
                            setNgayQuyetDinhGiaHan={setNgayQuyetDinhGiaHan}
                            ngayDangBa={ngayDangBa}
                            setNgayDangBa={setNgayDangBa}
                        />
                    </div>
                </Spin>

                {/* Hàng nút bấm */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="bg-gray-400 hover:bg-gray-500 text-white font-medium px-6 py-2.5 rounded-lg shadow transition"
                    >
                        Quay lại
                    </button>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="bg-[#009999] hover:bg-[#007a7a] text-white font-medium px-6 py-2.5 rounded-lg shadow transition disabled:opacity-50"
                    >
                        {submitting ? "Đang lưu..." : "Lưu Đơn Gia Hạn"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GCN_GH_NH_VNAdd;
