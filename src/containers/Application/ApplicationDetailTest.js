import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from 'dayjs';
import callAPI from "../../utils/api";
import DonProgress from "../../components/commom/DonProgess.js";
// import ExportWordButton from "../../components/ExportFile/ExportWordModal.js";
import 'dayjs/locale/vi';
import { showSuccess, showError } from "../../components/commom/Notification";
import { Table, Modal, Button, Spin, DatePicker, Radio, Input } from "antd";
import ExportWordModal from "../../components/ExportFile/ExportWordModal.js";
import DSVuViec from "../../components/VuViecForm/DSVuViec.js";

function ApplicationDetailTest() {
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [noiDungVuViec, setNoiDungVuViec] = useState("");
    const [clientsRef, setClientsRef] = useState("");
    const [maKhachHang, setMaKhachHang] = useState("");
    const [tenKhachHang, setTenKhachHang] = useState("");
    const [diaChi, setDiaChi] = useState("");
    const [soDienThoai, setSoDienThoai] = useState("");

    const { maDonDangKy } = useParams();
    const isViewOnly = true
    const [maHoSoVuViec, setMaHoSoVuViec] = useState("");
    const [soDon, setSoDon] = useState("")
    const [ngayNopDon, setNgayNopDon] = useState(null);
    const [maNhanHieu, setMaNhanHieu] = useState("");
    const [tenNhanHieu, setTenNhanHieu] = useState("");
    const [linkAnh, setLinkAnh] = useState("");
    const [maSPDVList, setMaSPDVList] = useState([]);

    const [hanTraLoi, setHanTraLoi] = useState(null);
    const [hanXuLy, setHanXuLy] = useState(null);
    const [ngayHoanThanhHSTL_DuKien, setNgayHoanThanhHSTL_DuKien] = useState(null);
    const [ngayHoanThanhHSTL, setNgayHoanThanhHSTL] = useState(null);
    const [trangThaiHoanThanhHSTL, setTrangThaiHoanThanhHSTL] = useState("");

    const [ngayKQThamDinhHinhThuc_DuKien, setNgayKQThamDinhHinhThuc_DuKien] = useState(null);
    const [ngayKQThamDinhHinhThuc, setNgayKQThamDinhHinhThuc] = useState(null);
    const [lichSuThamDinhHT, setLichSuThamDinhHT] = useState([])
    const [ngayKQThamDinhHinhThuc_DK_SauKN, setNgayKQThamDinhHinhThuc_DK_SauKN] = useState(null)

    const [ngayCongBo_DuKien, setNgayCongBo_DuKien] = useState(null);
    const [ngayCongBo, setNgayCongBo] = useState(null);

    const [ngayKQThamDinhND_DuKien, setNgayKQThamDinhND_DuKien] = useState(null);
    const [ngayKQThamDinhND, setNgayKQThamDinhND] = useState(null);
    const [lichSuThamDinhND, setLichSuThamDinhND] = useState([]);
    const [ngayKQThamDinhND_DK_SauKN, setNgayKQThamDinhND_DK_SauKN] = useState(null)
    const [trangThaiTraLoiKQThamDinhND, setTrangThaiTraLoiKQThamDinhND] = useState(null)


    const [ngayTraLoiKQThamDinhND_DuKien, setNgayTraLoiKQThamDinhND_DuKien] = useState(null);
    const [ngayTraLoiKQThamDinhND, setNgayTraLoiKQThamDinhND] = useState(null);

    const [ngayThongBaoCapBang, setNgayThongBaoCapBang] = useState(null);
    const [trangThaiCapBang, setTrangThaiCapBang] = useState(null);
    const [ngayNopYKien, setNgayNopYKien] = useState(null);
    const [ngayNhanKQYKien, setNgayNhanKQYKien] = useState(null);
    const [ketQuaYKien, setKetQuaYKien] = useState(null);
    const [ngayPhanHoiKQYKien, setNgayPhanHoiKQYKien] = useState(null);

    const [ngayNopPhiCapBang, setNgayNopPhiCapBang] = useState(null);
    const [ngayNhanBang, setNgayNhanBang] = useState(null);
    const [ngayGuiBangChoKH, setNgayGuiBangChoKH] = useState(null);
    const [soBang, setSoBang] = useState("");
    const [quyetDinhSo, setQuyetDinhSo] = useState("");
    const [ngayCapBang, setNgayCapBang] = useState(null);
    const [ngayHetHanBang, setNgayHetHanBang] = useState(null);

    const [trangThaiDon, setTrangThaiDon] = useState("");
    const [buocXuLy, setBuocXuLy] = useState("");
    const [taiLieuList, setTaiLieuList] = useState([]);
    const [vuViecList, setVuViecList] = useState([])
    const [maUyQuyen, setMaUyQuyen] = useState(null);
    const [giayUyQuyenGoc, setGiayUyQuyenGoc] = useState(true);
    const [brands, setBrands] = useState([]);
    const [productAndService, setProductAndService] = useState([]);
    const [ghiChu, setGhiChu] = useState("");
    const [loaiDon, setLoaiDon] = useState(null);
    const [donGoc, setDonGoc] = useState(null);
    const [maDonDangKyGoc, setMaDonDangKyGoc] = useState(null);
    const [soDonGoc, setSoDonGoc] = useState(null);
    const [ngayNopDonGoc, setNgayNopDonGoc] = useState(null);
    const [dangSuaDoi, setDangSuaDoi] = useState(false);
    const [dangChuyenQuyen, setDangChuyenQuyen] = useState(false);
    const [dsBienDongChoDuyet, setDsBienDongChoDuyet] = useState([]);
    const [dsDonCon, setDsDonCon] = useState([]);
    const [donSuaDoi, setDonSuaDoi] = useState({});
    const [donTach, setDonTach] = useState({});
    const [donCQSH, setDonCQSH] = useState({});
    const [quickApproveModalOpen, setQuickApproveModalOpen] = useState(false);
    const [selectedPendingItem, setSelectedPendingItem] = useState(null);
    const [quickApproveStatus, setQuickApproveStatus] = useState(1);
    const [quickApproveSoDon, setQuickApproveSoDon] = useState("");
    const [quickApproveDate, setQuickApproveDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [quickRejectDate, setQuickRejectDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [quickRejectReason, setQuickRejectReason] = useState("");
    const [submittingQuickApprove, setSubmittingQuickApprove] = useState(false);
    const [isModalHTOpen, setIsModalHTOpen] = useState(false);
    const [isModalNDOpen, setIsModalNDOpen] = useState(false);
    const [soGUQ, setSoGUQ] = useState("");
    const [soDonUQGoc, setSoDonUQGoc] = useState("");
    const [danhSachDonSuaDoi, setDanhSachDonSuaDoi] = useState([]);
    const [danhSachDonChuyenQuyen, setDanhSachDonChuyenQuyen] = useState([]);
    const formatVietnameseDate = (date = new Date()) => {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        return `Hà Nội, ngày ${d} tháng ${m} năm ${y}`;
    };

    const fetchBrands = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/brand/shortlist",
                data: {},
            });
            setBrands(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu nhãn hiệu:", error);
        }
    };
    const fetchItems = async (searchValue) => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/productsandservices/list",
                data: { search: searchValue },
            });
            setProductAndService(response);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm/dịch vụ:", error);
        }
    };
    useEffect(() => {
        fetchBrands();
        fetchItems();
        detailApplication();
    }, [])

    const formatOptions = (data, valueKey, labelKey) => {
        return data.map(item => ({
            value: item[valueKey],
            label: item[labelKey]
        }));
    };
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split("T")[0];
    };
    const detailApplication = async () => {
        setLoading(true);
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "application/fulldetail",
                data: { maDonDangKy }
            });

            if (response) {
                setMaHoSoVuViec(response.maHoSoVuViec);
                setLoaiDon(response.loaiDon);
                setNoiDungVuViec(response.noiDung || response.clientsRef || response.clientRef || "");
                setClientsRef(response.clientsRef || response.clientRef || response.noiDungVuViec || response.noiDung || "");
                setMaKhachHang(response.maKhachHang || "");
                setTenKhachHang(response.khachHang?.tenKhachHang || "");
                setDiaChi(response.khachHang?.diaChi || "");
                setSoDienThoai(response.khachHang?.sdt || "");
                setSoDon(response.soDon)
                setMaNhanHieu(response.nhanHieu.maNhanHieu);
                setTenNhanHieu(response.nhanHieu.tenNhanHieu);
                setLinkAnh(response.nhanHieu.linkAnh);
                setTrangThaiDon(response.trangThaiDon);
                setHanTraLoi(formatDate(response.hanTraLoi));
                setHanXuLy(formatDate(response.hanXuLy));
                setBuocXuLy(response.buocXuLy);
                setMaSPDVList(response.maSPDVList)
                setNgayNopDon(formatDate(response.ngayNopDon));
                setNgayHoanThanhHSTL_DuKien(formatDate(response.ngayHoanThanhHoSoTaiLieu_DuKien));
                setNgayHoanThanhHSTL(formatDate(response.ngayHoanThanhHoSoTaiLieu));
                setTrangThaiHoanThanhHSTL(response.trangThaiHoanThienHoSoTaiLieu);
                setNgayKQThamDinhHinhThuc_DuKien(formatDate(response.ngayKQThamDinhHinhThuc_DuKien));
                setLichSuThamDinhHT(response.lichSuThamDinhHT)
                setNgayKQThamDinhHinhThuc_DK_SauKN(response.ngayKQThamDinhHinhThuc_DK_SauKN)

                setNgayKQThamDinhHinhThuc(formatDate(response.ngayKQThamDinhHinhThuc));
                setNgayCongBo_DuKien(formatDate(response.ngayCongBoDonDuKien));
                setNgayCongBo(formatDate(response.ngayCongBoDon));
                setNgayKQThamDinhND_DuKien(formatDate(response.ngayKQThamDinhND_DuKien));
                setNgayKQThamDinhND(formatDate(response.ngayKQThamDinhND));
                setNgayTraLoiKQThamDinhND_DuKien(formatDate(response.ngayTraLoiKQThamDinhND_DuKien));
                setNgayTraLoiKQThamDinhND(formatDate(response.ngayTraLoiKQThamDinhND));
                setLichSuThamDinhND(response.lichSuThamDinhND)
                setNgayKQThamDinhND_DK_SauKN(response.ngayKQThamDinhND_DK_SauKN);
                setTrangThaiTraLoiKQThamDinhND(response.trangThaiTraLoiKQThamDinhND);

                setNgayThongBaoCapBang(formatDate(response.ngayThongBaoCapBang));
                setTrangThaiCapBang(response.trangThaiDYTBCapBang);
                setNgayNopYKien(formatDate(response.ngayNopYKien));
                setNgayNhanKQYKien(formatDate(response.ngayNhanKQYKien));
                setKetQuaYKien(response.ketQuaYKien);
                setNgayPhanHoiKQYKien(formatDate(response.ngayPhanHoiKQYKien));

                setNgayNopPhiCapBang(formatDate(response.ngayNopPhiCapBang));
                setNgayNhanBang(formatDate(response.ngayNhanBang));
                setNgayGuiBangChoKH(formatDate(response.ngayGuiBangChoKhachHang));
                setSoBang(response.soBang);
                setQuyetDinhSo(response.quyetDinhSo);
                setNgayCapBang(formatDate(response.ngayCapBang));
                setNgayHetHanBang(formatDate(response.ngayHetHanBang));
                setTrangThaiDon(response.trangThaiDon);
                setTaiLieuList(response.taiLieu)
                setMaUyQuyen(response.maUyQuyen || null);
                setGiayUyQuyenGoc(response.giayUyQuyenGoc);

                setGhiChu(response.ghiChu || "");
                setVuViecList(response.vuViec || []);
                setDonGoc(response.donGoc || null);
                setMaDonDangKyGoc(response.maDonDangKyGoc || response.donCha?.maDonDangKy || null);
                setSoDonGoc(response.soDonGoc || response.donCha?.soDon || response.donTach?.soDonGoc || null);
                setNgayNopDonGoc(formatDate(response.ngayNopDonGoc || response.donCha?.ngayNopDon || response.donTach?.ngayNopDonGoc));
                setDangSuaDoi(!!response.dangSuaDoi);
                setDangChuyenQuyen(!!response.dangChuyenQuyen);
                setDsBienDongChoDuyet(response.dsBienDongChoDuyet || []);
                setDsDonCon(response.dsDonCon || []);
                setDonSuaDoi(response.donSuaDoi || {});
                setDonTach(response.donTach || {});
                setDonCQSH(response.donCQSH || {});
                setSoGUQ(response.GiayUyQuyen?.soGUQ || "");
                setSoDonUQGoc(response.GiayUyQuyen?.soDonGoc || "");
                setDanhSachDonSuaDoi(response.danhSachDonSuaDoi || []);
                setDanhSachDonChuyenQuyen(response.danhSachDonChuyenQuyen || []);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API chi tiết đơn:", error);
        } finally {
            setLoading(false);
        }
    };
    const formatDateVN = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };
    const daysLeft = (dateString) => {
        if (!dateString) return "";
        const today = new Date();
        const targetDate = new Date(dateString);
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? `(còn ${diffDays} ngày)` : `(quá hạn ${Math.abs(diffDays)} ngày)`;
    };
    const getLatestThongBao = (list) => {
        if (!Array.isArray(list)) return null;

        return list
            .filter(item => item.ngayNhanThongBaoTuChoiTD)
            .sort((a, b) => new Date(b.ngayNhanThongBaoTuChoiTD) - new Date(a.ngayNhanThongBaoTuChoiTD))[0] || null;
    };
    const tuChoiND = getLatestThongBao(lichSuThamDinhND);
    const tuChoiHT = getLatestThongBao(lichSuThamDinhHT);
    const handleApplicationEdit = () => {
        if (maDonDangKy) {
            navigate(`/applicationedit/${maDonDangKy}`);
        }
    };
    const handleVuViecChange = (list) => {
        setVuViecList(list);
    }

    const openQuickApproveModal = (bd) => {
        setSelectedPendingItem(bd);
        setQuickApproveStatus(1);
        setQuickApproveSoDon(bd?.soDon || "");
        setQuickApproveDate(dayjs().format("YYYY-MM-DD"));
        setQuickRejectDate(dayjs().format("YYYY-MM-DD"));
        setQuickRejectReason("");
        setQuickApproveModalOpen(true);
    };

    const handleConfirmQuickApprove = async () => {
        if (!selectedPendingItem?.id) return;
        setSubmittingQuickApprove(true);
        try {
            const isSuaDoi = selectedPendingItem.loaiBienDong === "SUA_DOI";
            const endpoint = isSuaDoi ? "/application_sd_nh_vn/update" : "/application_cq_nh_vn/update";
            const st = Number(quickApproveStatus);
            const cleanSoDon = st === 2 ? null : (quickApproveSoDon.trim() || null);
            const res = await callAPI({
                method: "post",
                endpoint,
                data: {
                    id: selectedPendingItem.id,
                    trangThaiDuyet: st,
                    soDon: cleanSoDon,
                    soDonSD: cleanSoDon,
                    soDonChuyenQuyen: cleanSoDon,
                    duocGhiNhanSuaDoi: st === 1,
                    ngayChapThuan: st === 1 ? quickApproveDate : null,
                    ngayGhiNhanSuaDoi: st === 1 ? quickApproveDate : null,
                    ngayGhiNhanCQ: st === 1 ? quickApproveDate : null,
                    ngayTuChoi: st === 2 ? quickRejectDate : null,
                    lyDoTuChoi: st === 2 ? quickRejectReason : null,
                },
            });
            await showSuccess("Thành công", "Đã cập nhật kết quả xét duyệt của Cục SHTT!");
            setQuickApproveModalOpen(false);
            const maMoi = res?.maDonDangKyMoi || res?.donMoi?.maDonDangKy;
            if (Number(quickApproveStatus) === 1 && maMoi) {
                navigate(`/applicationdetail/${maMoi}`);
                window.location.reload();
            } else {
                detailApplication();
            }
        } catch (error) {
            console.error("Lỗi khi xét duyệt nhanh:", error);
            showError("Thất bại", "Không thể cập nhật kết quả xét duyệt.", error);
        } finally {
            setSubmittingQuickApprove(false);
        }
    };
    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center space-y-4">
            <DonProgress trangThaiDon={trangThaiDon} />
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700 uppercase">
                        📌 Thông tin đơn đăng ký nhãn hiệu
                    </h2>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                        alt="Cờ Việt Nam"
                        className="w-20 h-15"
                    />
                </div>
                <Spin spinning={loading} tip="Loading..." size="large">
                    {/* Banner cảnh báo đơn gốc đã đóng băng */}
                    {Number(donGoc) === 1 && (
                        <div className="mb-4 p-4 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-left">
                            <div className="font-semibold text-base text-gray-800">
                                🔒 Đơn đăng ký này đã đóng băng (Lưu lịch sử)
                            </div>
                            <p className="text-sm mt-1">
                                Đơn này đã được Cục chấp thuận sửa đổi / chuyển quyền sở hữu và toàn bộ quy trình thẩm định đã được chuyển giao sang đơn mới.
                            </p>
                            {Array.isArray(dsDonCon) && dsDonCon.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {dsDonCon.map((con, idx) => (
                                        <button
                                            key={con.maDonDangKy || idx}
                                            type="button"
                                            onClick={() => {
                                                navigate(`/applicationdetail/${con.maDonDangKy}`);
                                                window.location.reload();
                                            }}
                                            className="px-3 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                            ➔ Xem đơn mới: {con.soDon || con.maDonDangKy} ({con.loaiBienDong})
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Banner có tờ khai Đang sửa đổi / Đang chuyển quyền sở hữu chờ Cục xét duyệt */}
                    {Array.isArray(dsBienDongChoDuyet) && dsBienDongChoDuyet.length > 0 && (
                        <div className="mb-4 p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-left space-y-2">
                            <div className="font-semibold text-base">
                                ⏳ Đơn đang có Tờ khai sửa đổi / chuyển quyền sở hữu chờ Cục SHTT xét duyệt:
                            </div>
                            {dsBienDongChoDuyet.map((bd, idx) => {
                                const detailUrl =
                                    bd.loaiBienDong === "SUA_DOI"
                                        ? `/application_sd_nh_vn_detail/${bd.id}`
                                        : bd.loaiBienDong === "CHUYEN_QUYEN"
                                        ? `/application_cq_nh_vn_detail/${bd.id}`
                                        : null;
                                return (
                                <div
                                    key={bd.id || idx}
                                    className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-3 rounded border border-amber-200 gap-2"
                                >
                                    <div className="text-sm">
                                        <span className="font-semibold text-amber-800">[{bd.tenBienDong}]</span>{" "}
                                        Số tờ khai:{" "}
                                        <b
                                            className={detailUrl ? "text-blue-600 underline cursor-pointer" : ""}
                                            onClick={() => detailUrl && navigate(detailUrl)}
                                            title={detailUrl ? "Xem chi tiết tờ khai" : ""}
                                        >
                                            {bd.soDon || "—"}
                                        </b>{" "}
                                        | Ngày nộp YC:{" "}
                                        <b>{bd.ngayYeuCau ? formatDateVN(bd.ngayYeuCau) : "—"}</b> | Lần:{" "}
                                        <b>{bd.lanBienDong || 1}</b>
                                    </div>
                                    <div className="flex gap-2">
                                        {detailUrl && (
                                            <button
                                                type="button"
                                                onClick={() => navigate(detailUrl)}
                                                className="px-3 py-1.5 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                            >
                                                👁️ Xem tờ khai
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openQuickApproveModal(bd)}
                                            className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                        >
                                            ⚖️ Xét duyệt (Chấp thuận / Từ chối)
                                        </button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-800 text-sm">
                            {/* Thông tin chung */}
                            <div className="text-left"><span className="font-medium">Mã hồ sơ:</span> {maHoSoVuViec}</div>
                            <div className="text-left flex items-center gap-2 flex-wrap">
                                <span className="font-medium">Loại đơn:</span>
                                {dangSuaDoi && (
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                        ⏳ Đang sửa đổi
                                    </span>
                                )}
                                {dangChuyenQuyen && (
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-300">
                                        ⏳ Đang chuyển quyền
                                    </span>
                                )}
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    {Number(loaiDon) === 1 || Number(loaiDon) === 0
                                        ? "Đơn gốc"
                                        : Number(loaiDon) === 2
                                        ? "Đã sửa đổi"
                                        : Number(loaiDon) === 3 || Number(loaiDon) === 5
                                        ? "Đơn tách"
                                        : Number(loaiDon) === 4
                                        ? "Đã chuyển quyền sở hữu"
                                        : "Đơn gốc"}
                                </span>
                            </div>
                            {(maDonDangKyGoc || soDonGoc) && (
                                <>
                                    <div className="text-left">
                                        <span className="font-medium">Số đơn gốc:</span>{" "}
                                        <span
                                            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
                                            onClick={() => {
                                                if (maDonDangKyGoc) {
                                                    navigate(`/applicationdetail/${maDonDangKyGoc}`);
                                                    window.location.reload();
                                                }
                                            }}
                                        >
                                            {soDonGoc || maDonDangKyGoc}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <span className="font-medium">Ngày nộp đơn gốc:</span>{" "}
                                        <span className="font-semibold text-gray-800">
                                            {ngayNopDonGoc ? formatDateVN(ngayNopDonGoc) : "—"}
                                        </span>
                                    </div>
                                </>
                            )}
                            <div className="text-left"><span className="font-medium">Client ref's:</span> {clientsRef || noiDungVuViec}</div>
                            <div className="text-left"><span className="font-medium">Mã khách hàng:</span> {maKhachHang}</div>
                            <div className="text-left"><span className="font-medium">Tên khách hàng:</span> {tenKhachHang}</div>
                            <div className="text-left"><span className="font-medium">Địa chỉ:</span> {diaChi}</div>
                            <div className="text-left"><span className="font-medium">Số điện thoại:</span> {soDienThoai}</div>
                            <div className="text-left"><span className="font-medium">Số đơn:</span> {soDon}</div>
                            <div className="text-left"><span className="font-medium">Số bằng:</span> {soBang}</div>
                            <div className="text-left"><span className="font-medium">Ngày nộp đơn: </span>{formatDateVN(ngayNopDon)}</div>
                            <div className="text-left"><span className="font-medium">Số giấy ủy quyền: </span>{formatDateVN(ngayNopDon)}</div>
                            {/* <div className="text-left"><span className="font-medium">Mã nhãn hiệu:</span> {maNhanHieu}</div> */}
                            <div className="text-left"><span className="font-medium">Tên nhãn hiệu:</span> {tenNhanHieu}</div>
                            <div className="text-left"><span className="font-medium">Số giấy ủy quyền:</span> {soGUQ}</div>
                            <div className="text-left"><span className="font-medium">Số đơn gốc giấy ủy quyền:</span> {soDonUQGoc}</div>
                            <div className="md:col-span-2 text-left">
                                <span className="font-medium">Danh sách nhóm Sản phẩm dịch vụ:</span>{" "}
                                <span className="text-gray-700">
                                    {maSPDVList?.length > 0
                                        ? maSPDVList.join(", ")
                                        : "Không có dữ liệu"}
                                </span>
                            </div>

                            {/* Ảnh + Ghi chú */}
                            <div className="col-span-1 md:col-span-2 my-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex justify-center items-center">
                                        {linkAnh ? (
                                            <img
                                                src={linkAnh}
                                                alt="Ảnh nhãn hiệu"
                                                className="h-40 border rounded-md shadow-sm"
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

                            {/* Khối 2 cột */}
                            <div className="col-span-1 md:col-span-2 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tình trạng xử lý */}
                                <div>
                                    <h2 className="text-base font-semibold mb-2 text-left">Tình trạng xử lý</h2>
                                    <div className="space-y-2 text-sm text-gray-800">
                                        {ngayNopDon && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayNopDon)}</span>
                                                <span>Ngày nộp đơn</span>
                                            </div>
                                        )}
                                        {ngayHoanThanhHSTL && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayHoanThanhHSTL)}</span>
                                                <span>Ngày hoàn thành hồ sơ</span>
                                            </div>
                                        )}
                                        {ngayKQThamDinhHinhThuc && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhHinhThuc)}</span>
                                                <span>Ngày KQ TĐ hình thức</span>
                                            </div>
                                        )}
                                        {ngayKQThamDinhHinhThuc_DK_SauKN && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhHinhThuc_DK_SauKN)}</span>
                                                <span>Ngày KQ TĐ hình thức sau khiếu nại</span>
                                            </div>
                                        )}
                                        {ngayCongBo && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayCongBo)}</span>
                                                <span>Ngày công bố</span>
                                            </div>
                                        )}
                                        {ngayKQThamDinhND && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhND)}</span>
                                                <span>Ngày KQ TĐ nội dung</span>
                                            </div>
                                        )}
                                        {ngayKQThamDinhND_DK_SauKN && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhHinhThuc_DK_SauKN)}</span>
                                                <span>Ngày KQ TĐ nội dung sau khiếu nại</span>
                                            </div>
                                        )}
                                        {ngayTraLoiKQThamDinhND && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayTraLoiKQThamDinhND)}</span>
                                                <span>Ngày trả lời TĐND</span>
                                            </div>
                                        )}
                                        {ngayThongBaoCapBang && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayThongBaoCapBang)}</span>
                                                <span>Ngày thông báo cấp bằng</span>
                                            </div>
                                        )}
                                        {/* {donSuaDoi.ngayYeuCau && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(donSuaDoi.ngayYeuCau)}</span>
                                                <span>Ngày yêu cầu sửa đổi</span>
                                            </div>
                                        )}
                                        {donSuaDoi.ngayGhiNhanSuaDoi && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(donSuaDoi.ngayGhiNhanSuaDoi)}</span>
                                                <span>Ngày ghi nhận sửa đổi</span>
                                            </div>
                                        )} */}
                                        {ngayNopYKien && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayNopYKien)}</span>
                                                <span>Ngày nộp ý kiến</span>
                                            </div>
                                        )}
                                        {ngayNhanKQYKien && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayNhanKQYKien)}</span>
                                                <span>Ngày nhận KQ ý kiến</span>
                                            </div>
                                        )}
                                        {ngayPhanHoiKQYKien && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayPhanHoiKQYKien)}</span>
                                                <span>Ngày phản hồi KQ ý kiến</span>
                                            </div>
                                        )}
                                        {ngayNopPhiCapBang && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayNopPhiCapBang)}</span>
                                                <span>Ngày nộp phí cấp bằng</span>
                                            </div>
                                        )}
                                        {ngayNhanBang && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayNhanBang)}</span>
                                                <span>Ngày nhận bằng</span>
                                            </div>
                                        )}
                                        {ngayGuiBangChoKH && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayGuiBangChoKH)}</span>
                                                <span>Ngày gửi bằng cho KH</span>
                                            </div>
                                        )}
                                        {ngayCapBang && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayCapBang)}</span>
                                                <span>Ngày cấp bằng</span>
                                            </div>
                                        )}
                                        {ngayHetHanBang && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayHetHanBang)}</span>
                                                <span>Ngày hết hạn bằng</span>
                                            </div>
                                        )}
                                        {Array.isArray(danhSachDonSuaDoi) &&
                                            danhSachDonSuaDoi
                                                .slice() // copy để sort không mutate props/state
                                                .sort((a, b) => (a.lanSuaDoi || 0) - (b.lanSuaDoi || 0))
                                                .map((item, index) => (
                                                    <React.Fragment key={index}>
                                                        {item.ngayYeuCau && (
                                                            <div className="flex">
                                                                <span className="w-32 font-medium">{formatDateVN(item.ngayYeuCau)}</span>
                                                                <span>
                                                                    Ngày yêu cầu sửa đổi lần{" "}
                                                                    {item.lanSuaDoi ?? index + 1}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {Number(item.trangThaiDuyet) === 1 && item.ngayGhiNhanSuaDoi && (
                                                            <div className="flex">
                                                                <span className="w-32 font-medium">{formatDateVN(item.ngayGhiNhanSuaDoi)}</span>
                                                                <span>
                                                                    Ngày ghi nhận sửa đổi lần{" "}
                                                                    {item.lanSuaDoi ?? index + 1}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                        {Array.isArray(danhSachDonChuyenQuyen) &&
                                            danhSachDonChuyenQuyen
                                                .slice()
                                                .sort((a, b) => (a.lanChuyenQuyen || 0) - (b.lanChuyenQuyen || 0))
                                                .map((item, index) => (
                                                    <React.Fragment key={`cq_${item.id || index}`}>
                                                        {item.ngayYeuCau && (
                                                            <div className="flex">
                                                                <span className="w-32 font-medium">{formatDateVN(item.ngayYeuCau)}</span>
                                                                <span>
                                                                    Ngày yêu cầu chuyển quyền sở hữu lần{" "}
                                                                    {item.lanChuyenQuyen ?? index + 1}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {Number(item.trangThaiDuyet) === 1 && item.ngayGhiNhanCQ && (
                                                            <div className="flex">
                                                                <span className="w-32 font-medium">{formatDateVN(item.ngayGhiNhanCQ)}</span>
                                                                <span>
                                                                    Ngày ghi nhận chuyển quyền sở hữu lần{" "}
                                                                    {item.lanChuyenQuyen ?? index + 1}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                    </div>
                                </div>

                                {/* Ngày dự kiến */}
                                <div>
                                    <h2 className="text-base font-semibold mb-2 text-left">Ngày dự kiến</h2>
                                    <div className="space-y-2 text-sm text-gray-800">
                                        <div className="flex " style={{ height: '20px' }}>
                                            <span className="w-32 font-medium"> </span>
                                            <span> </span>
                                        </div>
                                        {ngayHoanThanhHSTL_DuKien && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayHoanThanhHSTL_DuKien)}</span>
                                                <span>Hoàn thành hồ sơ (dự kiến)</span>
                                            </div>
                                        )}
                                        {ngayKQThamDinhHinhThuc_DuKien && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhHinhThuc_DuKien)}</span>
                                                <span>KQ TĐ hình thức (dự kiến)</span>
                                            </div>
                                        )}
                                        {ngayCongBo_DuKien && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayCongBo_DuKien)}</span>
                                                <span>Công bố (dự kiến)</span>
                                            </div>
                                        )}
                                        {ngayKQThamDinhND_DuKien && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhND_DuKien)}</span>
                                                <span>KQ TĐ nội dung (dự kiến)</span>
                                            </div>
                                        )}
                                        {ngayTraLoiKQThamDinhND_DuKien && (
                                            <div className="flex">
                                                <span className="w-32 font-medium">{formatDateVN(ngayTraLoiKQThamDinhND_DuKien)}</span>
                                                <span>Trả lời TĐND (dự kiến)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Danh sách tài liệu */}
                        <div className="mt-8">
                            <div className="text-lg font-semibold text-gray-700 mb-2">Danh sách tài liệu</div>
                            <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                                <thead className="bg-gray-100 text-left">
                                    <tr>
                                        <th className="px-3 py-2 border-b">Tên tài liệu</th>
                                        <th className="px-3 py-2 border-b">Trạng thái</th>
                                        <th className="px-3 py-2 border-b">Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taiLieuList?.length > 0 ? taiLieuList.map((item) => (
                                        <tr key={item.maTaiLieu} className="hover:bg-gray-50 text-left">
                                            <td className="px-3 py-2 border-b">{item.tenTaiLieu}</td>
                                            <td className="px-3 py-2 border-b">{item.trangThai}</td>
                                            <td className="px-3 py-2 border-b">
                                                {item.linkTaiLieu ? (
                                                    <button
                                                        className="text-blue-600 underline"
                                                        onClick={() => {
                                                            const fileName = item.tenTaiLieu || "tai_lieu.docx";

                                                            // Nếu là PDF thì mở tab mới
                                                            // if (item.linkTaiLieu.startsWith("data:application/pdf")) {
                                                            //     window.open(item.linkTaiLieu, "_blank");
                                                            // } else {
                                                            // Còn lại thì tự động tải về
                                                            const link = document.createElement("a");
                                                            link.href = item.linkTaiLieu;
                                                            link.download = fileName;
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);

                                                        }}
                                                    >
                                                        Xem tài liệu
                                                    </button>
                                                ) : (
                                                    <span className="italic text-gray-400">Chưa có</span>
                                                )}
                                            </td>

                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="text-center text-gray-500 italic py-4">Không có tài liệu</td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                            <div className="flex gap-3 mb-4">
                                <Button type="primary" style={{ backgroundColor: "#009999", borderColor: "#009999" }} onClick={() => setIsModalHTOpen(true)}>📄 Xem lịch sử nhận thông báo từ chối thẩm định hình thức</Button>
                                <Button type="primary" style={{ backgroundColor: "#009999", borderColor: "#009999" }} onClick={() => setIsModalNDOpen(true)}>📄 Xem lịch sử nhân thông báo từ chối thẩm định nội dung</Button>
                            </div>

                        </div>
                    </div>
                </Spin>


                <div className="mt-4">
                    <div className="flex justify-center gap-4 mt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
                        >
                            Quay lại
                        </button>

                        <button
                            onClick={() => setOpenModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            In Word: Thông tin Đơn Đăng Ký
                        </button>
                        {donGoc !== 1 && (
                            <button
                                onClick={handleApplicationEdit}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                            >
                                Sửa thông tin đơn
                            </button>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-4 items-center justify-center">
                            <button
                                type="button"
                                onClick={() => navigate(`/application_sd_nh_vn_add/${maDonDangKy}`)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                            >
                                <span>Sửa đổi đơn đăng ký</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/application_td_nh_vn_add/${maDonDangKy}`)}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                            >
                                <span>Tách đơn đăng ký</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/application_cq_nh_vn_add/${maDonDangKy}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                            >
                                <span>Chuyển quyền sở hữu</span>
                            </button>
                        </div>
                    </div>
                    <ExportWordModal
                        open={openModal}
                        onClose={() => setOpenModal(false)}
                        data={{
                            soBang,
                            quyetDinhSo,
                            ngayCapBang: formatDateVN(ngayCapBang),
                            ngayGuiBangChoKH,
                            maHoSoVuViec,
                            tenKhachHang,
                            tenNhanHieu,
                            soDon,
                            trangThaiDon,
                            ngayNopDon: formatDateVN(ngayNopDon),
                            ngayKQThamDinhND: formatDateVN(ngayKQThamDinhND),
                            ngayTraLoiKQThamDinhND_DuKien: formatDateVN(ngayTraLoiKQThamDinhND_DuKien),
                            maNhanHieu,
                            ngayHoanThanhHSTL_DuKien,
                            ngayHoanThanhHSTL,
                            ngayKQThamDinhHinhThuc_DuKien,
                            ngayKQThamDinhHinhThuc,
                            diaChi,
                            ngayCongBo_DuKien,
                            ngayCongBo,
                            giayUyQuyenGoc: soDonUQGoc,
                            image: linkAnh,
                            maSPDVList: maSPDVList.join(', '),
                            ngayHienTai: formatVietnameseDate(),
                            ngayNhanThongBaoTuChoiHT: formatDateVN(tuChoiHT?.ngayNhanThongBaoTuChoiTD),
                            hanTraLoiHT: formatDateVN(tuChoiHT?.hanTraLoiGiaHan),
                            ngayNhanThongBaoTuChoiND: formatDateVN(tuChoiND?.ngayNhanThongBaoTuChoiTD),
                            hanTraLoiND: formatDateVN(tuChoiND?.hanTraLoiGiaHan),
                        }}
                        fileName={`ThongDonDangKy_${maDonDangKy}`}
                    />
                </div>

                <Modal
                    title="⚖️ Cập nhật kết quả xét duyệt của Cục SHTT"
                    open={quickApproveModalOpen}
                    onOk={handleConfirmQuickApprove}
                    onCancel={() => setQuickApproveModalOpen(false)}
                    confirmLoading={submittingQuickApprove}
                    okText="Xác nhận lưu"
                    cancelText="Hủy"
                    width={620}
                >
                    {selectedPendingItem && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded border text-sm">
                                <div>
                                    Loại tờ khai: <b>{selectedPendingItem.tenBienDong}</b>
                                </div>
                                <div>
                                    Số tờ khai: <b>{selectedPendingItem.soDon || "—"}</b>
                                </div>
                            </div>
                            <Radio.Group
                                value={Number(quickApproveStatus)}
                                onChange={(e) => setQuickApproveStatus(Number(e.target.value))}
                                className="flex flex-col gap-2"
                            >
                                <Radio value={1}>
                                    ✅ Được chấp thuận
                                </Radio>
                                <Radio value={2}>
                                    ❌ Từ chối
                                </Radio>
                            </Radio.Group>

                            {Number(quickApproveStatus) === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {selectedPendingItem.loaiBienDong === "CHUYEN_QUYEN"
                                                ? "Số đơn ghi nhận chuyển giao"
                                                : "Số đơn ghi nhận sửa đổi"}
                                        </label>
                                        <Input
                                            value={quickApproveSoDon}
                                            onChange={(e) => setQuickApproveSoDon(e.target.value)}
                                            placeholder={
                                                selectedPendingItem.loaiBienDong === "CHUYEN_QUYEN"
                                                    ? "Nhập số đơn ghi nhận (CĐxxxx)"
                                                    : "Nhập số đơn ghi nhận (SĐxxxx)"
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày ghi nhận
                                        </label>
                                        <DatePicker
                                            value={quickApproveDate ? dayjs(quickApproveDate) : null}
                                            onChange={(d) => setQuickApproveDate(d ? d.format("YYYY-MM-DD") : null)}
                                            format="DD/MM/YYYY"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            )}

                            {Number(quickApproveStatus) === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày từ chối
                                        </label>
                                        <DatePicker
                                            value={quickRejectDate ? dayjs(quickRejectDate) : null}
                                            onChange={(d) => setQuickRejectDate(d ? d.format("YYYY-MM-DD") : null)}
                                            format="DD/MM/YYYY"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lý do từ chối
                                        </label>
                                        <Input
                                            value={quickRejectReason}
                                            onChange={(e) => setQuickRejectReason(e.target.value)}
                                            placeholder="Nhập lý do từ chối"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>

                <Modal
                    title="📄 Lịch sử nhận thông báo từ chối thẩm định hình thức"
                    open={isModalHTOpen}
                    onCancel={() => setIsModalHTOpen(false)}
                    footer={null}
                    width={1200}
                >
                    <Table
                        dataSource={lichSuThamDinhHT}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        scroll={{ x: 1200 }} // Cho phép cuộn ngang nếu dữ liệu dài
                        columns={[
                            { title: "Loại thẩm định", dataIndex: "loaiThamDinh", width: 120 },
                            { title: "Lần thẩm định", dataIndex: "lanThamDinh", width: 100 },
                            { title: "Kết quả", dataIndex: "ketQuaThamDinh", width: 130 },
                            { title: "Ngày TB từ chối", dataIndex: "ngayNhanThongBaoTuChoiTD", width: 140 },
                            { title: "Hạn trả lời", dataIndex: "hanTraLoi", width: 140 },
                            { title: "Ngày trả lời", dataIndex: "ngayTraLoiThongBaoTuChoi", width: 140 },
                            { title: "Gia hạn", dataIndex: "giaHan", render: val => val ? "Có" : "Không", width: 100 },
                            { title: "Ngày gia hạn", dataIndex: "ngayGiaHan", width: 130 },
                            { title: "Hạn trả lời gia hạn", dataIndex: "hanTraLoiGiaHan", width: 150 },
                            { title: "Trạng thái bị nhận QĐ từ chối", dataIndex: "trangThaiBiNhanQuyetDinhTuChoi", render: val => val ? "Có" : "Không", width: 200 },
                            { title: "Ngày nhận QĐ từ chối", dataIndex: "ngayNhanQuyetDinhTuChoi", width: 160 },
                            { title: "Hạn khiếu nại CSHTT", dataIndex: "hanKhieuNaiCSHTT", width: 150 },
                            { title: "Ngày KN CSHTT", dataIndex: "ngayKhieuNaiCSHTT", width: 140 },
                            { title: "KQ KN CSHTT", dataIndex: "ketQuaKhieuNaiCSHTT", width: 130 },
                            { title: "Ngày KQ KN CSHTT", dataIndex: "ngayKQ_KN_CSHTT", width: 150 },
                            { title: "Ghi chú KQ KN CSHTT", dataIndex: "ghiChuKetQuaKNCSHTT", width: 180 },
                            { title: "Hạn KN BKHCN", dataIndex: "hanKhieuNaiBKHCN", width: 130 },
                            { title: "Ngày KN BKHCN", dataIndex: "ngayKhieuNaiBKHCN", width: 130 },
                            { title: "KQ KN BKHCN", dataIndex: "ketQuaKhieuNaiBKHCN", width: 130 },
                            { title: "Ngày KQ KN BKHCN", dataIndex: "ngayKQ_KN_BKHCN", width: 150 },
                            { title: "Ghi chú KQ KN BKHCN", dataIndex: "ghiChuKetQuaKNBKHCN", width: 180 },
                            { title: "Ngày nộp YC sau KN", dataIndex: "ngayNopYeuCauSauKN", width: 160 },
                            { title: "Ghi chú", dataIndex: "ghiChu", width: 200 },
                        ]}
                    />
                </Modal>
                <Modal
                    title="📄 Lịch sử nhận thông báo từ chối thẩm định nội dung"
                    open={isModalNDOpen}
                    onCancel={() => setIsModalNDOpen(false)}
                    footer={null}
                    width={1200}
                >
                    <Table
                        dataSource={lichSuThamDinhND}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        scroll={{ x: 1200 }}
                        columns={[
                            { title: "Loại thẩm định", dataIndex: "loaiThamDinh", width: 120 },
                            { title: "Lần thẩm định", dataIndex: "lanThamDinh", width: 100 },
                            { title: "Kết quả", dataIndex: "ketQuaThamDinh", width: 130 },
                            { title: "Ngày TB từ chối", dataIndex: "ngayNhanThongBaoTuChoiTD", width: 140 },
                            { title: "Hạn trả lời", dataIndex: "hanTraLoi", width: 140 },
                            { title: "Ngày trả lời", dataIndex: "ngayTraLoiThongBaoTuChoi", width: 140 },
                            { title: "Gia hạn", dataIndex: "giaHan", render: val => val ? "Có" : "Không", width: 100 },
                            { title: "Ngày gia hạn", dataIndex: "ngayGiaHan", width: 130 },
                            { title: "Hạn trả lời gia hạn", dataIndex: "hanTraLoiGiaHan", width: 150 },
                            { title: "Trạng thái bị nhận QĐ từ chối", dataIndex: "trangThaiBiNhanQuyetDinhTuChoi", render: val => val ? "Có" : "Không", width: 200 },
                            { title: "Ngày nhận QĐ từ chối", dataIndex: "ngayNhanQuyetDinhTuChoi", width: 160 },
                            { title: "Hạn khiếu nại CSHTT", dataIndex: "hanKhieuNaiCSHTT", width: 150 },
                            { title: "Ngày KN CSHTT", dataIndex: "ngayKhieuNaiCSHTT", width: 140 },
                            { title: "KQ KN CSHTT", dataIndex: "ketQuaKhieuNaiCSHTT", width: 130 },
                            { title: "Ngày KQ KN CSHTT", dataIndex: "ngayKQ_KN_CSHTT", width: 150 },
                            { title: "Ghi chú KQ KN CSHTT", dataIndex: "ghiChuKetQuaKNCSHTT", width: 180 },
                            { title: "Hạn KN BKHCN", dataIndex: "hanKhieuNaiBKHCN", width: 130 },
                            { title: "Ngày KN BKHCN", dataIndex: "ngayKhieuNaiBKHCN", width: 130 },
                            { title: "KQ KN BKHCN", dataIndex: "ketQuaKhieuNaiBKHCN", width: 130 },
                            { title: "Ngày KQ KN BKHCN", dataIndex: "ngayKQ_KN_BKHCN", width: 150 },
                            { title: "Ghi chú KQ KN BKHCN", dataIndex: "ghiChuKetQuaKNBKHCN", width: 180 },
                            { title: "Ngày nộp YC sau KN", dataIndex: "ngayNopYeuCauSauKN", width: 160 },
                            { title: "Ghi chú", dataIndex: "ghiChu", width: 200 },
                        ]}
                    />
                </Modal>

            </div>
        </div>
    );
}

export default ApplicationDetailTest;
