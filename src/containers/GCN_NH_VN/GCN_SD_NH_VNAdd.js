import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { Spin, message } from "antd";
import "dayjs/locale/vi";
import callAPI from "../../utils/api.js";
import { showSuccess, showError } from "../../components/commom/Notification.js";
import FormSuaDoiBang from "../../components/commom/FormSuaDoiBang.js";

function GCN_SD_NH_VNAdd() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Thông tin GCN gốc
    const [gcnDetail, setGcnDetail] = useState(null);

    // Form Sửa đổi bằng
    const [soDonSD, setSoDonSD] = useState("");
    const [ngayYeuCau, setNgayYeuCau] = useState(null);
    const [lanSuaDoi, setLanSuaDoi] = useState(1);
    const [ngayGhiNhanSuaDoi, setNgayGhiNhanSuaDoi] = useState(null);
    const [duocGhiNhanSuaDoi, setDuocGhiNhanSuaDoi] = useState(false);
    const [moTaSuaDoi, setMoTaSuaDoi] = useState("");
    const [suaDoiDaiDien, setSuaDoiDaiDien] = useState(false);
    const [ndSuaDoiDaiDien, setNdSuaDoiDaiDien] = useState("");
    const [suaDoiTenChuBang, setSuaDoiTenChuBang] = useState(false);
    const [ndSuaDoiTenChuBang, setNdSuaDoiTenChuBang] = useState("");
    const [suaDoiDiaChi, setSuaDoiDiaChi] = useState(false);
    const [ndSuaDoiDiaChi, setNdSuaDoiDiaChi] = useState("");
    const [suaNhan, setSuaNhan] = useState(false);
    const [ndSuaNhan, setNdSuaNhan] = useState("");
    const [suaNhomSPDV, setSuaNhomSPDV] = useState(false);
    const [ndSuaNhomSPDV, setNdSuaNhomSPDV] = useState("");

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

    const handleSubmit = async () => {
        if (!soDonSD?.trim()) {
            message.error("Vui lòng nhập Số đơn sửa đổi.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                maHoSo: gcnDetail?.maHoSo || "",
                idGCN_NH_Cu: id,
                soDonSD: soDonSD.trim(),
                ngayYeuCau: ngayYeuCau ? (typeof ngayYeuCau === "string" ? ngayYeuCau : dayjs(ngayYeuCau).format("YYYY-MM-DD")) : null,
                lanSuaDoi,
                ngayGhiNhanSuaDoi: ngayGhiNhanSuaDoi ? (typeof ngayGhiNhanSuaDoi === "string" ? ngayGhiNhanSuaDoi : dayjs(ngayGhiNhanSuaDoi).format("YYYY-MM-DD")) : null,
                duocGhiNhanSuaDoi,
                moTaSuaDoi,
                suaDoiDaiDien,
                ndSuaDoiDaiDien,
                suaDoiTenChuBang,
                ndSuaDoiTenChuBang,
                suaDoiDiaChi,
                ndSuaDoiDiaChi,
                suaNhan,
                ndSuaNhan,
                suaNhomSPDV,
                ndSuaNhomSPDV,
            };

            await callAPI({
                method: "post",
                endpoint: "/application_sd_gcn_nh_vn/add",
                data: payload,
            });

            await showSuccess("Thành công!", "Thêm đơn sửa đổi giấy chứng nhận thành công!");
            navigate(-1);
        } catch (error) {
            console.error("Lỗi khi thêm đơn sửa đổi GCN:", error);
            showError("Thất bại!", "Đã xảy ra lỗi khi thêm đơn sửa đổi giấy chứng nhận.", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-5xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
                    📌 THÊM MỚI ĐƠN SỬA ĐỔI GIẤY CHỨNG NHẬN NHÃN HIỆU
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

                    {/* Form sửa đổi */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                            Nội dung Đơn sửa đổi
                        </h3>
                        <FormSuaDoiBang
                            soDonSD={soDonSD}
                            setSoDonSD={setSoDonSD}
                            lanSuaDoi={lanSuaDoi}
                            setLanSuaDoi={setLanSuaDoi}
                            ngayYeuCau={ngayYeuCau}
                            setNgayYeuCau={setNgayYeuCau}
                            ngayGhiNhanSuaDoi={ngayGhiNhanSuaDoi}
                            setNgayGhiNhanSuaDoi={setNgayGhiNhanSuaDoi}
                            duocGhiNhanSuaDoi={duocGhiNhanSuaDoi}
                            setDuocGhiNhanSuaDoi={setDuocGhiNhanSuaDoi}
                            moTaSuaDoi={moTaSuaDoi}
                            setMoTaSuaDoi={setMoTaSuaDoi}
                            suaDoiDaiDien={suaDoiDaiDien}
                            setSuaDoiDaiDien={setSuaDoiDaiDien}
                            ndSuaDoiDaiDien={ndSuaDoiDaiDien}
                            setNdSuaDoiDaiDien={setNdSuaDoiDaiDien}
                            suaDoiTenChuBang={suaDoiTenChuBang}
                            setSuaDoiTenChuBang={setSuaDoiTenChuBang}
                            ndSuaDoiTenChuBang={ndSuaDoiTenChuBang}
                            setNdSuaDoiTenChuBang={setNdSuaDoiTenChuBang}
                            suaDoiDiaChi={suaDoiDiaChi}
                            setSuaDoiDiaChi={setSuaDoiDiaChi}
                            ndSuaDoiDiaChi={ndSuaDoiDiaChi}
                            setNdSuaDoiDiaChi={setNdSuaDoiDiaChi}
                            suaNhan={suaNhan}
                            setSuaNhan={setSuaNhan}
                            ndSuaNhan={ndSuaNhan}
                            setNdSuaNhan={setNdSuaNhan}
                            suaNhomSPDV={suaNhomSPDV}
                            setSuaNhomSPDV={setSuaNhomSPDV}
                            ndSuaNhomSPDV={ndSuaNhomSPDV}
                            setNdSuaNhomSPDV={setNdSuaNhomSPDV}
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
                        {submitting ? "Đang lưu..." : "Lưu Đơn Sửa Đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GCN_SD_NH_VNAdd;
