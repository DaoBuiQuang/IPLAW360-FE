import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from 'dayjs';
import callAPI from "../../utils/api.js";
import Select from "react-select";
import DocumentSection from "../../components/UpdateDocument/DocumentSection.js";
import AnnouncementOfApplication from "../../components/TrademarkRegistrationProcess/AnnouncementOfApplication.js";
import FormalDetermination from "../../components/TrademarkRegistrationProcess/FormalDetermination.js";
import ReplyContentRating from "../../components/TrademarkRegistrationProcess/ReplyContentRating.js";
import DiphimaProcess from "../../components/TrademarkRegistrationProcess/DiphimaProcess.js";
import DegreeInformation from "../../components/TrademarkRegistrationProcess/DegreeInformation.js";
import ContentReview from "../../components/TrademarkRegistrationProcess/ContentReview.js";
import CompleteDocumentation from "../../components/TrademarkRegistrationProcess/CompleteDocumentation.js";
import DonProgress from "../../components/commom/DonProgess.js";
// import ExportWordButton from "../../components/ExportFile/ExportWordButton.js";
import { DatePicker, Radio } from 'antd';
import 'dayjs/locale/vi';
import { showSuccess, showError } from "../../components/commom/Notification.js";
import BrandBasicForm from "../../components/BrandBasicForm.js";
import { Spin } from "antd";
import FormHoSo from "../../components/commom/FormHoSo.js";
import FormSuaDoi from "../../components/commom/FormSuaDoi.js";
import DSVuViec from "../../components/VuViecForm/DSVuViec.js";
import ThongTinHoSo from "../../components/commom/ThongTinHoSo.js";
function Application_SD_NH_KHAdd() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const isViewOnly = true
    const { maDonDangKy } = useParams();
    const [noiDungVuViec, setNoiDungVuViec] = useState("");
    const [tenKhachHang, setTenKhachHang] = useState("");
    const [diaChi, setDiaChi] = useState("");
    const [soDienThoai, setSoDienThoai] = useState("");
    const [loaiDon, setLoaiDon] = useState(1); // 1: Đơn gốc, 2: Đơn sửa đổi, 3: Đơn tách, 4: Đơn chuyển nhượng
    const [idKhachHang, setIdKhachHang] = useState(null);
    const [maKhachHang, setMaKhachHang] = useState("");
    const [hanTraLoi, setHanTraLoi] = useState(null);
    const [hanXuLy, setHanXuLy] = useState(null);
    const [idDoiTac, setIdDoiTac] = useState(null)
    const [maDoiTac, setMaDoiTac] = useState("");
    const [clientsRef, setClientsRef] = useState("");
    const [ngayTiepNhan, setNgayTiepNhan] = useState(null);
    const [ngayXuLy, setNgayXuLy] = useState(null);
    const [trangThaiVuViec, setTrangThaiVuViec] = useState("");
    const [nhanSuVuViec, setNhanSuVuViec] = useState("");
    const [nguoiXuLyChinh, setNguoiXuLyChinh] = useState("");
    const [nguoiXuLyPhu, setNguoiXuLyPhu] = useState("");
    const [ngayDongHS, setNgayDongHS] = useState(null);
    const [ngayRutHS, setNgayRutHS] = useState(null);

    const isEditOnly = true
    const [maHoSoVuViec, setMaHoSoVuViec] = useState("");
    const [soDon, setSoDon] = useState("")
    const [ngayNopDon, setNgayNopDon] = useState(null);
    const [maNhanHieu, setMaNhanHieu] = useState("");
    const [tenNhanHieu, setTenNhanHieu] = useState("");
    const [linkAnh, setLinkAnh] = useState("");
    const nhanHieu = {
        maNhanHieu,
        tenNhanHieu,
        linkAnh,
    };
    const [maSPDVList, setMaSPDVList] = useState([]);
    const [ghiChu, setGhiChu] = useState("");

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
    const [hanNopYKien, setHanNopYKien] = useState(null);
    const [trangThaiCapBang, setTrangThaiCapBang] = useState(null);
    const [ngayNopYKien, setNgayNopYKien] = useState(null);
    const [ngayNhanKQYKien, setNgayNhanKQYKien] = useState(null);
    const [ketQuaYKien, setKetQuaYKien] = useState(null);
    const [hanNopPhiCapBang, setHanNopPhiCapBang] = useState(null);
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
    const [giayUyQuyenGoc, setGiayUyQuyenGoc] = useState(true);
    const [maUyQuyen, setMaUyQuyen] = useState(null);
    const [brands, setBrands] = useState([]);
    const [productAndService, setProductAndService] = useState([]);

    const [soDonSD, setSoDonSD] = useState("");
    const [ngayYeuCau, setNgayYeuCau] = useState(null);
    const [lanSuaDoi, setLanSuaDoi] = useState(1);
    const [ngayGhiNhanSuaDoi, setNgayGhiNhanSuaDoi] = useState(null);
    const [duocGhiNhanSuaDoi, setDuocGhiNhanSuaDoi] = useState(false);
    const [moTaSuaDoi, setMoTaSuaDoi] = useState("");
    const [suaDoiDaiDien, setSuaDoiDaiDien] = useState(false);
    const [ndSuaDoiDaiDien, setNdSuaDoiDaiDien] = useState("");
    const [suaDoiTenChuDon, setSuaDoiTenChuDon] = useState(false);
    const [ndSuaDoiTenChuDon, setNdSuaDoiTenChuDon] = useState("");
    const [suaDoiDiaChi, setSuaDoiDiaChi] = useState(false);
    const [ndSuaDoiDiaChi, setNdSuaDoiDiaChi] = useState("");
    const [suaNhan, setSuaNhan] = useState(false);
    const [ndSuaNhan, setNdSuaNhan] = useState("");
    const [suaNhomSPDV, setSuaNhomSPDV] = useState(false);
    const [ndSuaNhomSPDV, setNdSuaNhomSPDV] = useState("");

    const [errors, setErrors] = useState({});
    const isFormValid =
        (maHoSoVuViec || "").trim() !== "" &&
        ((tenNhanHieu || "").trim() !== "") &&
        Array.isArray(maSPDVList) &&
        maSPDVList.length > 0;
    const validateField = (field, value) => {
        let error = "";
        if (field === "maHoSoVuViec" || field === "maNhanHieu") {
            if (!value || typeof value !== "string" || value.trim() === "") {
                if (field === "maHoSoVuViec") error = "Mã hồ sơ vụ việc không được để trống";
                if (field === "maNhanHieu") error = "Nhãn hiệu không được để trống";
            }
        }

        if (field === "maSPDVList") {
            if (!Array.isArray(value) || value.length === 0) {
                error = "Sản phẩm dịch vụ không được để trống";
            }
        }
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: error,
        }));
    };
    const [daChonNgayNopDon, setDaChonNgayNopDon] = useState(false);
    const [daChonNgayHoanThanhHSTL, setDaChonNgayHoanThanhHSTL] = useState(false);
    const [daChonNgayThamDinhHinhThuc, setDaChonNgayThamDinhHinhThuc] = useState(false);
    const [daChonNgayCongBoDon, setDaChonNgayCongBoDon] = useState(false);
    const [daChonNgayThamDinhNoiDung, setDaChonNgayThamDinhNoiDung] = useState(false);
    const [daChonNgayTraLoiThamDinhNoiDung, setDaChonNgayTraLoiThamDinhNoiDung] = useState(false)
    const [daChonHoanTatThuTucNhapBang, setDaChonHoanTatThuTucNhapBang] = useState(false)
    const formatDateVN = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN");
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
    const trangThaiDonRef = useRef();

    const updateTrangThaiDon = (trangThaiMoi) => {
        if (trangThaiDonRef.current !== trangThaiMoi) {
            setTrangThaiDon(trangThaiMoi);
            trangThaiDonRef.current = trangThaiMoi;
        }
    };

    useEffect(() => {
        if (soBang) {
            setTrangThaiDon("Đơn đăng ký hoàn tất");
            setDaChonNgayNopDon(true);
            setDaChonNgayHoanThanhHSTL(true);
            setDaChonNgayCongBoDon(true);
            setDaChonNgayThamDinhNoiDung(true);
            setDaChonNgayTraLoiThamDinhNoiDung(true);
            setDaChonHoanTatThuTucNhapBang(true);
        }
        if (ngayNopDon) {
            const duKien = dayjs(ngayNopDon).add(1, 'month').format('YYYY-MM-DD');
            setNgayHoanThanhHSTL_DuKien(duKien);
            setNgayKQThamDinhHinhThuc_DuKien(duKien);
            // 👉 Chỉ set ngày hết hạn nếu chưa có
            if (!ngayHetHanBang && soBang) {
                const hetHanBang = dayjs(ngayNopDon).add(10, 'year').format('YYYY-MM-DD');
                setNgayHetHanBang(hetHanBang);
            }

            setDaChonNgayNopDon(true);
            setDaChonNgayHoanThanhHSTL(true);
            updateTrangThaiDon("Thẩm định hình thức");
        } else {
            setNgayHoanThanhHSTL_DuKien(null);
            setNgayKQThamDinhHinhThuc_DuKien(null);
            setNgayHetHanBang(null);
        }

        // if (ngayHoanThanhHSTL) {
        //     // if (!ngayKQThamDinhHinhThuc_DuKien) {
        //     const duKien = dayjs(ngayHoanThanhHSTL).add(1, 'month').format('YYYY-MM-DD');
        //     setNgayKQThamDinhHinhThuc_DuKien(duKien);
        //     // }
        //     setDaChonNgayHoanThanhHSTL(true);
        //     updateTrangThaiDon("Thẩm định hình thức");
        // }

        if (ngayKQThamDinhHinhThuc) {
            // if (!ngayCongBo_DuKien) {
            const duKien = dayjs(ngayKQThamDinhHinhThuc).add(2, 'month').format('YYYY-MM-DD');
            setNgayCongBo_DuKien(duKien);
            // }
            setDaChonNgayThamDinhHinhThuc(true);
            updateTrangThaiDon("Công bố đơn");
        } else {
            setNgayCongBo_DuKien(null);
        }
        if (ngayCongBo) {
            // if (!ngayKQThamDinhND_DuKien) {
            const duKien = dayjs(ngayCongBo).add(9, 'month').format('YYYY-MM-DD');
            setNgayKQThamDinhND_DuKien(duKien);
            // }
            setDaChonNgayCongBoDon(true);
            updateTrangThaiDon("Thẩm định nội dung");
        } else {
            setNgayKQThamDinhND_DuKien(null);
        }

        if (ngayKQThamDinhND) {
            // if (!ngayTraLoiKQThamDinhND_DuKien) {
            const duKien = dayjs(ngayKQThamDinhND).add(3, 'month').format('YYYY-MM-DD');
            setNgayTraLoiKQThamDinhND_DuKien(duKien);
            // }
            setDaChonNgayThamDinhNoiDung(true);
        } else {
            setNgayTraLoiKQThamDinhND_DuKien(null);
        }

        if (
            ngayTraLoiKQThamDinhND ||
            (trangThaiTraLoiKQThamDinhND === false && daChonNgayThamDinhNoiDung) || ngayThongBaoCapBang
        ) {
            setDaChonNgayTraLoiThamDinhNoiDung(true);
            updateTrangThaiDon("Hoàn tất nhận bằng");
        }

        // const baseNgay = ngayNhanKQYKien || ngayThongBaoCapBang;
        if (trangThaiCapBang === true) {
            const baseNgay = ngayThongBaoCapBang;
            if (ngayThongBaoCapBang && !hanNopPhiCapBang) {
                const han = dayjs(baseNgay).add(3, 'month').format('YYYY-MM-DD');
                setHanNopPhiCapBang(han);
            } else if (!baseNgay) {
                setHanNopPhiCapBang(null);
            }
        } else if (trangThaiCapBang === false) {
            const baseNgay = ngayNhanKQYKien;

            if (ketQuaYKien === true && ngayNhanKQYKien && !hanNopPhiCapBang) {
                const han = dayjs(baseNgay).add(3, 'month').format('YYYY-MM-DD');
                setHanNopPhiCapBang(han);
            } else if (!baseNgay || ketQuaYKien !== true) {
                setHanNopPhiCapBang(null);
            }
            if (ngayThongBaoCapBang) {
                const hanYKien = dayjs(ngayThongBaoCapBang).add(3, 'month').format('YYYY-MM-DD');
                setHanNopYKien(hanYKien);
            } else {
                setHanNopYKien(null);
            }
        }
        if (ngayNhanBang) {
            setDaChonHoanTatThuTucNhapBang(true);
            updateTrangThaiDon("Gửi bằng cho khách hàng");
        }

        if (ngayGuiBangChoKH) {
            updateTrangThaiDon("Đơn đăng ký hoàn tất");
        }

    }, [
        soBang,
        ngayNopDon,
        ngayHoanThanhHSTL,
        ngayKQThamDinhHinhThuc,
        ngayCongBo,
        ngayKQThamDinhND,
        ngayTraLoiKQThamDinhND,
        trangThaiTraLoiKQThamDinhND,
        ngayNhanKQYKien,
        ngayThongBaoCapBang,
        ngayNhanBang,
        ngayGuiBangChoKH,
        ngayHoanThanhHSTL_DuKien,
        ngayKQThamDinhHinhThuc_DuKien,
        ngayCongBo_DuKien,
        ngayKQThamDinhND_DuKien,
        ngayTraLoiKQThamDinhND_DuKien,
        hanNopPhiCapBang,
        daChonNgayThamDinhNoiDung,
        trangThaiCapBang,
    ]);

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
                endpoint: "application_kh/fulldetail",
                data: { maDonDangKy }
            });

            if (response) {
                setMaHoSoVuViec(response.maHoSoVuViec);
                setLoaiDon(response.loaiDon);
                setNoiDungVuViec(response.noiDung || "");
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
                setVuViecList(response.vuViec || [])
            }
        } catch (error) {
            console.error("Lỗi khi gọi API chi tiết đơn:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplication = async () => {
        try {
            await callAPI({
                method: "post",
                endpoint: "/application_sd_nh_kh/add",
                data: {
                    maHoSo: maHoSoVuViec,
                    maDonDangKyCu: maDonDangKy,
                    soDonSD,
                    ngayYeuCau,
                    lanSuaDoi,
                    ngayGhiNhanSuaDoi,
                    duocGhiNhanSuaDoi,
                    moTaSuaDoi,
                    suaDoiDaiDien,
                    ndSuaDoiDaiDien,
                    suaDoiTenChuDon,
                    ndSuaDoiTenChuDon,
                    suaDoiDiaChi,
                    ndSuaDoiDiaChi,
                    suaNhan,
                    ndSuaNhan,
                    suaNhomSPDV,
                    ndSuaNhomSPDV,
                },
            });
            await showSuccess("Thành công!", "Thêm đơn sửa đổi đơn đăng ký nhãn hiệu thành công!");
            navigate(-1);
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
            console.error("Lỗi khi Thêm đơn sửa đổi đơn đăng ký nhãn hiệu!", error);
        }
    };
    const handleSubmit = () => {

        handleApplication();

    };
    const handleTaiLieuChange = (list) => {
        setTaiLieuList(list);
    };
    const handleVuViecChange = (list) => {
        setVuViecList(list);
    }
    useEffect(() => {
        console.log("DocumentSection mounted or updated", giayUyQuyenGoc);
    }, [giayUyQuyenGoc]);
    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center space-y-4">
            {/* <DonProgress trangThaiDon={trangThaiDon} /> */}
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700 uppercase">
                        📌 TẠO ĐƠN SỬA ĐỔI NHÃN HIỆU CAMPUCHIA
                    </h2>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg"
                        alt="Cờ Campuchia"
                        className="w-20 h-15"
                    />
                </div>

                <ThongTinHoSo
                    loading={loading}
                    maHoSoVuViec={maHoSoVuViec}
                    loaiDon={loaiDon}
                    noiDungVuViec={noiDungVuViec}
                    maKhachHang={maKhachHang}
                    tenKhachHang={tenKhachHang}
                    diaChi={diaChi}
                    soDienThoai={soDienThoai}
                    soDon={soDon}
                    ngayNopDon={ngayNopDon}
                    tenNhanHieu={tenNhanHieu}
                    maSPDVList={maSPDVList}
                    linkAnh={linkAnh}
                    ghiChu={ghiChu}
                    ngayHoanThanhHSTL={ngayHoanThanhHSTL}
                    ngayKQThamDinhHinhThuc={ngayKQThamDinhHinhThuc}
                    ngayKQThamDinhHinhThuc_DK_SauKN={ngayKQThamDinhHinhThuc_DK_SauKN}
                    ngayCongBo={ngayCongBo}
                    ngayKQThamDinhND={ngayKQThamDinhND}
                    ngayKQThamDinhND_DK_SauKN={ngayKQThamDinhND_DK_SauKN}
                    ngayTraLoiKQThamDinhND={ngayTraLoiKQThamDinhND}
                    ngayThongBaoCapBang={ngayThongBaoCapBang}
                    ngayNopYKien={ngayNopYKien}
                    ngayNhanKQYKien={ngayNhanKQYKien}
                    ngayPhanHoiKQYKien={ngayPhanHoiKQYKien}
                    ngayNopPhiCapBang={ngayNopPhiCapBang}
                    ngayNhanBang={ngayNhanBang}
                    ngayGuiBangChoKH={ngayGuiBangChoKH}
                    ngayCapBang={ngayCapBang}
                    ngayHetHanBang={ngayHetHanBang}
                    ngayHoanThanhHSTL_DuKien={ngayHoanThanhHSTL_DuKien}
                    ngayKQThamDinhHinhThuc_DuKien={ngayKQThamDinhHinhThuc_DuKien}
                    ngayCongBo_DuKien={ngayCongBo_DuKien}
                    ngayKQThamDinhND_DuKien={ngayKQThamDinhND_DuKien}
                    ngayTraLoiKQThamDinhND_DuKien={ngayTraLoiKQThamDinhND_DuKien}
                    taiLieuList={taiLieuList}
                    vuViecList={vuViecList}
                    handleVuViecChange={handleVuViecChange}
                    handleTaiLieuChange={handleTaiLieuChange}
                    giayUyQuyenGoc={giayUyQuyenGoc}
                    setGiayUyQuyenGoc={setGiayUyQuyenGoc}
                    maUyQuyen={maUyQuyen}
                    setMaUyQuyen={setMaUyQuyen}
                    isViewOnly={isViewOnly}
                />

                <FormSuaDoi

                    ngayYeuCau={ngayYeuCau}
                    setNgayYeuCau={setNgayYeuCau}
                    lanSuaDoi={lanSuaDoi}
                    setLanSuaDoi={setLanSuaDoi}
                    soDonSD={soDonSD}
                    setSoDonSD={setSoDonSD}
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
                    suaDoiTenChuDon={suaDoiTenChuDon}
                    setSuaDoiTenChuDon={setSuaDoiTenChuDon}
                    ndSuaDoiTenChuDon={ndSuaDoiTenChuDon}
                    setNdSuaDoiTenChuDon={setNdSuaDoiTenChuDon}
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

                <div className="col-span-2">
                    <DocumentSection onTaiLieuChange={handleTaiLieuChange} initialTaiLieus={taiLieuList}
                        maHoSoVuViec={maHoSoVuViec}
                        giayUyQuyenGoc={giayUyQuyenGoc}
                        setGiayUyQuyenGoc={setGiayUyQuyenGoc}
                        maUyQuyen={maUyQuyen}
                        setMaUyQuyen={setMaUyQuyen}
                    />
                </div>
                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Quay lại</button>
                    <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Lưu thông tin</button>
                </div>
                <div className="mt-4">

                    {/* <ExportWordButton
                        data={{
                            maHoSoVuViec: maHoSoVuViec,
                            soDon: soDon,
                            trangThaiDon: trangThaiDon,
                            ngayNopDon: ngayNopDon,
                            maNhanHieu: maNhanHieu,
                            ngayHoanThanhHSTL_DuKien: ngayHoanThanhHSTL_DuKien,
                            ngayHoanThanhHSTL: ngayHoanThanhHSTL,
                            ngayKQThamDinhHinhThuc_DuKien: ngayKQThamDinhHinhThuc_DuKien,
                            ngayKQThamDinhHinhThuc: ngayKQThamDinhHinhThuc,

                            ngayCongBo_DuKien: ngayCongBo_DuKien,
                            ngayCongBo: ngayCongBo,

                        }}
                        fileName={`ThongDonDangKy_${maDonDangKy}`}
                    /> */}
                </div>

            </div>
        </div>
    );
}

export default Application_SD_NH_KHAdd;
