import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import callAPI from "../../utils/api.js";
import "dayjs/locale/vi";
import { showSuccess, showError } from "../../components/commom/Notification.js";
import { Spin } from "antd";
import FormTachDon from "../../components/commom/FormTachDon.js";

function Application_TD_NH_KHAdd() {
    const navigate = useNavigate();
    const { maDonDangKy } = useParams();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [maHoSoVuViec, setMaHoSoVuViec] = useState("");
    const [loaiDon, setLoaiDon] = useState(1);
    const [clientsRef, setClientsRef] = useState("");
    const [maKhachHang, setMaKhachHang] = useState("");
    const [tenKhachHang, setTenKhachHang] = useState("");
    const [diaChi, setDiaChi] = useState("");
    const [soDienThoai, setSoDienThoai] = useState("");
    const [soDon, setSoDon] = useState("");
    const [soBang, setSoBang] = useState("");
    const [ngayNopDon, setNgayNopDon] = useState(null);
    const [tenNhanHieu, setTenNhanHieu] = useState("");
    const [linkAnh, setLinkAnh] = useState("");
    const [soGUQ, setSoGUQ] = useState("");
    const [soDonUQGoc, setSoDonUQGoc] = useState("");
    const [maSPDVList, setMaSPDVList] = useState([]);
    const [ghiChu, setGhiChu] = useState("");
    const [taiLieuList, setTaiLieuList] = useState([]);

    const [soDonTD, setSoDonTD] = useState("");
    const [ngayNopDonTD, setNgayNopDonTD] = useState(dayjs().format("YYYY-MM-DD"));
    const [ngayYeuCauTD, setNgayYeuCauTD] = useState(dayjs().format("YYYY-MM-DD"));
    const [lanTachDon, setLanTachDon] = useState(1);
    const [ngayGhiNhanTD, setNgayGhiNhanTD] = useState(null);
    const [dsNhomSPDV, setDsNhomSPDV] = useState("");
    const [ndTachDon, setNdTachDon] = useState("");
    const [moTa, setMoTa] = useState("");

    const formatDateVN = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    useEffect(() => {
        if (maDonDangKy) {
            detailApplication();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maDonDangKy]);

    const detailApplication = async () => {
        setLoading(true);
        try {
            const res = await callAPI({
                method: "post",
                endpoint: "/application_kh/fulldetail",
                data: { maDonDangKy },
            });
            const response = res?.data ?? res;
            if (response) {
                setMaHoSoVuViec(response.maHoSoVuViec || response.maHoSo || "");
                setLoaiDon(response.loaiDon ?? 1);
                setClientsRef(response.clientsRef || response.clientRef || response.noiDung || "");
                setMaKhachHang(response.maKhachHang || response.khachHang?.maKhachHang || "");
                setTenKhachHang(response.khachHang?.tenKhachHang || response.tenKhachHang || "");
                setDiaChi(response.khachHang?.diaChi || response.diaChi || "");
                setSoDienThoai(response.khachHang?.sdt || response.sdt || "");
                setSoDon(response.soDon || "");
                setSoBang(response.soBang || "");
                setNgayNopDon(response.ngayNopDon || null);
                setTenNhanHieu(response.nhanHieu?.tenNhanHieu || "");
                setLinkAnh(response.nhanHieu?.linkAnh || "");
                setSoGUQ(response.GiayUyQuyen?.soGUQ || "");
                setSoDonUQGoc(response.GiayUyQuyen?.soDonGoc || "");
                setMaSPDVList(Array.isArray(response.maSPDVList) ? response.maSPDVList : []);
                setGhiChu(response.ghiChu || "");
                setTaiLieuList(response.taiLieuChuaNop_KH || response.taiLieu || []);
            }
        } catch (error) {
            console.error("Lỗi khi tải chi tiết đơn KH:", error);
            showError("Thất bại", "Không thể tải thông tin đơn đăng ký Campuchia.", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!soDonTD || !soDonTD.trim()) {
            showError("Lỗi!", "Vui lòng nhập Số đơn tách.");
            return;
        }
        if (!ngayNopDonTD && !ngayYeuCauTD) {
            showError("Lỗi!", "Vui lòng chọn Ngày nộp đơn tách / Ngày yêu cầu tách đơn.");
            return;
        }
        if (lanTachDon === "" || lanTachDon === null || lanTachDon === undefined) {
            showError("Lỗi!", "Vui lòng nhập Lần tách.");
            return;
        }
        if (!dsNhomSPDV || !dsNhomSPDV.trim()) {
            showError("Lỗi!", "Vui lòng nhập Danh sách nhóm SPDV tách (VD: 01, 05, 35).");
            return;
        }

        setSubmitting(true);
        try {
            await callAPI({
                method: "post",
                endpoint: "/application_td_nh_kh/add",
                data: {
                    maHoSo: maHoSoVuViec,
                    maDonDangKyCu: maDonDangKy,
                    maDonDangKyGoc: maDonDangKy,
                    listDonTach: [
                        {
                            soDon: soDonTD.trim(),
                            nhomSPDV: dsNhomSPDV.trim(),
                            ngayNopDon: ngayNopDonTD || ngayYeuCauTD,
                            ngayYeuCau: ngayYeuCauTD || ngayNopDonTD,
                            ngayGhiNhanTachDon: ngayGhiNhanTD || null,
                            ngayGhiNhanSuaDoi: ngayGhiNhanTD || null,
                            lanTachDon: Number(lanTachDon) || 1,
                            ndTachDon: ndTachDon || "",
                            moTa: moTa || "",
                        },
                    ],
                },
            });
            await showSuccess("Thành công!", "Tách đơn đăng ký nhãn hiệu Campuchia thành công!");
            navigate("/application_td_nh_khlist");
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi khi tách đơn đăng ký nhãn hiệu Campuchia.", error);
            console.error("Lỗi khi tách đơn đăng ký nhãn hiệu KH:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-2 bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700 uppercase">
                        📌 TÁCH ĐƠN ĐĂNG KÝ NHÃN HIỆU CAMPUCHIA
                    </h2>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg"
                        alt="Cờ Campuchia"
                        className="w-20 h-14 object-cover rounded shadow-sm"
                    />
                </div>

                <Spin spinning={loading} tip="Loading..." size="large">
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-gray-800 text-sm">
                            <div className="text-left">
                                <span className="font-medium">Mã hồ sơ:</span> {maHoSoVuViec || "—"}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Loại đơn:</span>{" "}
                                {Number(loaiDon) === 1
                                    ? "Đơn gốc"
                                    : Number(loaiDon) === 2
                                    ? "Đơn sửa đổi"
                                    : Number(loaiDon) === 3
                                    ? "Đơn tách"
                                    : Number(loaiDon) === 4
                                    ? "Đơn chuyển quyền sở hữu"
                                    : "Đơn gốc"}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Client ref's:</span> {clientsRef || "—"}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Mã khách hàng:</span> {maKhachHang || "—"}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Tên khách hàng:</span> {tenKhachHang || "—"}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Địa chỉ:</span> {diaChi || "—"}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Số điện thoại:</span> {soDienThoai || "—"}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Số đơn:</span> {soDon || "—"}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Số bằng:</span> {soBang || "—"}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Ngày nộp đơn:</span> {formatDateVN(ngayNopDon) || "—"}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Tên nhãn hiệu:</span> {tenNhanHieu || "—"}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Số giấy ủy quyền:</span> {soGUQ || "—"}
                            </div>
                            {soDonUQGoc && (
                                <div className="text-left">
                                    <span className="font-medium">Số đơn gốc giấy ủy quyền:</span> {soDonUQGoc}
                                </div>
                            )}
                            <div className="md:col-span-2 text-left">
                                <span className="font-medium">Danh sách nhóm Sản phẩm dịch vụ:</span>{" "}
                                <span className="text-gray-700">
                                    {maSPDVList?.length > 0 ? maSPDVList.join(", ") : "Không có dữ liệu"}
                                </span>
                            </div>

                            <div className="col-span-1 md:col-span-2 my-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex justify-center items-center">
                                        {linkAnh ? (
                                            <img
                                                src={linkAnh}
                                                alt="Ảnh nhãn hiệu"
                                                className="h-36 border rounded-md shadow-sm object-contain"
                                            />
                                        ) : (
                                            <div className="italic text-gray-400">Không có ảnh</div>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <span className="font-medium">Ghi chú:</span>
                                        <p className="mt-1 text-gray-700 italic whitespace-pre-line">
                                            {ghiChu || "Chưa có ghi chú"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {Array.isArray(taiLieuList) && taiLieuList.length > 0 && (
                            <div className="mt-4">
                                <div className="text-base font-semibold text-gray-700 mb-2 text-left">
                                    Danh sách tài liệu
                                </div>
                                <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                                    <thead className="bg-gray-100 text-left">
                                        <tr>
                                            <th className="px-3 py-2 border-b">Tên tài liệu</th>
                                            <th className="px-3 py-2 border-b">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {taiLieuList.map((tl, idx) => (
                                            <tr key={tl.maTaiLieu || idx} className="border-b text-left">
                                                <td className="px-3 py-2">{tl.tenTaiLieu}</td>
                                                <td className="px-3 py-2">{tl.trangThai}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <FormTachDon
                            soDonTD={soDonTD}
                            setSoDonTD={setSoDonTD}
                            ngayNopDonTD={ngayNopDonTD}
                            setNgayNopDonTD={setNgayNopDonTD}
                            dsNhomSPDV={dsNhomSPDV}
                            setDsNhomSPDV={setDsNhomSPDV}
                            ndTachDon={ndTachDon}
                            setNdTachDon={setNdTachDon}
                            moTa={moTa}
                            setMoTa={setMoTa}
                            ngayYeuCauTD={ngayYeuCauTD}
                            setNgayYeuCauTD={setNgayYeuCauTD}
                            ngayGhiNhanTD={ngayGhiNhanTD}
                            setNgayGhiNhanTD={setNgayGhiNhanTD}
                            lanTachDon={lanTachDon}
                            setLanTachDon={setLanTachDon}
                        />
                    </div>
                </Spin>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded-lg font-medium"
                    >
                        Quay lại
                    </button>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="bg-[#009999] hover:bg-[#007a7a] text-white px-6 py-2 rounded-lg font-medium shadow disabled:opacity-50"
                    >
                        {submitting ? "Đang lưu..." : "Lưu đơn tách"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Application_TD_NH_KHAdd;
