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
import FormTachDon from "../../components/commom/FormTachDon.js";
function Application_TD_NH_VNAdd() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { maDonDangKy } = useParams();
    const [loaiDon, setLoaiDon] = useState(1); // 1: Đơn gốc, 2: Đơn sửa đổi, 3: Đơn tách, 4: Đơn chuyển nhượng
    const [idKhachHang, setIdKhachHang] = useState(null);
    const [maKhachHang, setMaKhachHang] = useState("");
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
    // const [customers, setCustomers] = useState([]);
    // const fetchCustomers = async () => {
    //     try {
    //         const response = await callAPI({ method: "post", endpoint: "/customers/by-name", data: {} });
    //         setCustomers(response);
    //     } catch (error) { console.error(error); }
    // };

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
                endpoint: "application/detail",
                data: { maDonDangKy }
            });

            if (response) {
                setLoaiDon(response.loaiDon);
                setIdKhachHang(response.idKhachHang);
                setIdDoiTac(response.idDoiTac);
                setClientsRef(response.clientsRef);
                setNgayTiepNhan(response.ngayTiepNhan);
                setNgayXuLy(response.ngayXuLy);
                setTrangThaiVuViec(response.trangThaiVuViec)
                setMaHoSoVuViec(response.maHoSoVuViec);
                setNguoiXuLyChinh(response.maNguoiXuLy1);
                setNguoiXuLyPhu(response.maNguoiXuLy2);

                setSoDon(response.soDon)
                setMaNhanHieu(response.nhanHieu.maNhanHieu);
                setTenNhanHieu(response.nhanHieu.tenNhanHieu);
                setLinkAnh(response.nhanHieu.linkAnh);
                setTrangThaiDon(response.trangThaiDon);
                setBuocXuLy(response.buocXuLy);
                setMaSPDVList(response.maSPDVList);
                setGhiChu(response.ghiChu);
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
                setHanNopYKien(formatDate(response.hanNopYKien));
                setNgayNopYKien(formatDate(response.ngayNopYKien));
                setNgayNhanKQYKien(formatDate(response.ngayNhanKQYKien));
                setKetQuaYKien(response.ketQuaYKien);
                setHanNopPhiCapBang(formatDate(response.hanNopPhiCapBang));

                setNgayNopPhiCapBang(formatDate(response.ngayNopPhiCapBang));
                setNgayNhanBang(formatDate(response.ngayNhanBang));
                setNgayGuiBangChoKH(formatDate(response.ngayGuiBangChoKhachHang));
                setSoBang(response.soBang);
                setQuyetDinhSo(response.quyetDinhSo);
                setNgayCapBang(formatDate(response.ngayCapBang));
                setNgayHetHanBang(formatDate(response.ngayHetHanBang));
                setTrangThaiDon(response.trangThaiDon);
                setTaiLieuList(response.taiLieu)
                setGiayUyQuyenGoc(response.giayUyQuyenGoc);
                setMaUyQuyen(response.maUyQuyen || null);
                setVuViecList(response.vuViec)
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
                method: "put",
                endpoint: "/application/edit",
                data: {
                    maHoSo: maHoSoVuViec,
                    loaiDon: loaiDon,
                    idKhachHang: idKhachHang,
                    // maKhachHang: maKhachHang,

                    idDoiTac: idDoiTac,
                    clientsRef: clientsRef,
                    ngayTiepNhan: ngayTiepNhan,
                    ngayXuLy: ngayXuLy,
                    maNguoiXuLy1: nguoiXuLyChinh,
                    maNguoiXuLy2: nguoiXuLyPhu,
                    trangThaiVuViec: trangThaiVuViec,
                    ngayDongHS: ngayDongHS,
                    ngayRutHS: ngayRutHS,

                    maDonDangKy: maDonDangKy,
                    maHoSoVuViec: maHoSoVuViec,
                    soDon: soDon,
                    maNhanHieu: maNhanHieu,
                    maSPDVList: maSPDVList,
                    ghiChu: ghiChu,
                    trangThaiDon: trangThaiDon,
                    buocXuLy: buocXuLy,

                    ngayNopDon: ngayNopDon || null,
                    ngayHoanThanhHoSoTaiLieu_DuKien: ngayHoanThanhHSTL_DuKien || null,
                    ngayHoanThanhHoSoTaiLieu: ngayHoanThanhHSTL || null,
                    trangThaiHoanThienHoSoTaiLieu: trangThaiHoanThanhHSTL,
                    ngayKQThamDinhHinhThuc_DuKien: ngayKQThamDinhHinhThuc_DuKien || null,
                    ngayKQThamDinhHinhThuc: ngayKQThamDinhHinhThuc || null,
                    lichSuThamDinhHT: lichSuThamDinhHT,
                    ngayKQThamDinhHinhThuc_DK_SauKN: ngayKQThamDinhHinhThuc_DK_SauKN,
                    ngayCongBoDonDuKien: ngayCongBo_DuKien || null,
                    ngayCongBoDon: ngayCongBo || null,
                    ngayKQThamDinhND_DuKien: ngayKQThamDinhND_DuKien || null,
                    ngayKQThamDinhND: ngayKQThamDinhND || null,
                    lichSuThamDinhND: lichSuThamDinhND,
                    ngayKQThamDinhND_DK_SauKN: ngayKQThamDinhND_DK_SauKN,
                    trangThaiTraLoiKQThamDinhND: trangThaiTraLoiKQThamDinhND,
                    ngayTraLoiKQThamDinhND_DuKien: ngayTraLoiKQThamDinhND_DuKien || null,
                    ngayTraLoiKQThamDinhND: ngayTraLoiKQThamDinhND || null,
                    ngayThongBaoCapBang: ngayThongBaoCapBang || null,
                    trangThaiDYTBCapBang: trangThaiCapBang,

                    hanNopYKien: hanNopYKien || null,
                    ngayNopYKien: ngayNopYKien || null,
                    ngayNhanKQYKien: ngayNhanKQYKien || null,
                    ketQuaYKien: ketQuaYKien || null,
                    hanNopPhiCapBang: hanNopPhiCapBang || null,

                    ngayNopPhiCapBang: ngayNopPhiCapBang || null,
                    ngayNhanBang: ngayNhanBang || null,
                    ngayGuiBangChoKhachHang: ngayGuiBangChoKH || null,
                    ngayCapBang: ngayCapBang || null,
                    ngayHetHanBang: ngayHetHanBang || null,
                    soBang: soBang,
                    quyetDinhSo: quyetDinhSo || "",
                    taiLieus: taiLieuList,

                    giayUyQuyenGoc: giayUyQuyenGoc,
                    maUyQuyen: maUyQuyen || null,
                    nhanHieu,
                    vuViecs: vuViecList,
                },
            });
            await showSuccess("Thành công!", "Cập nhật đơn đăng ký nhãn hiệu thành công!");
            navigate(-1);
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
            console.error("Lỗi khi thêm hồ sơ vụ việc!", error);
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
                        📌 TẠO ĐƠN TÁCH ĐỔI NHÃN HIỆU
                    </h2>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                        alt="Cờ Việt Nam"
                        className="w-20 h-15"
                    />
                </div>

                <Spin spinning={loading} tip="Loading..." size="large">
                    <FormHoSo
                        soDon={soDon}
                        setSoDon={setSoDon}
                        loaiDon={loaiDon}
                        setLoaiDon={setLoaiDon}
                        ngayNopDon={ngayNopDon}
                        setNgayNopDon={setNgayNopDon}
                        maHoSoVuViec={maHoSoVuViec}
                        setMaHoSoVuViec={setMaHoSoVuViec}
                        idKhachHang={idKhachHang}
                        setIdKhachHang={setIdKhachHang}
                        idDoiTac={idDoiTac}
                        setIdDoiTac={setIdDoiTac}
                        maKhachHang={maKhachHang}
                        setMaKhachHang={setMaKhachHang}
                        maDoiTac={maDoiTac}
                        setMaDoiTac={setMaDoiTac}
                        clientsRef={clientsRef}
                        setClientsRef={setClientsRef}
                        ngayTiepNhan={ngayTiepNhan}
                        setNgayTiepNhan={setNgayTiepNhan}
                        ngayXuLy={ngayXuLy}
                        setNgayXuLy={setNgayXuLy}
                        trangThaiVuViec={trangThaiVuViec}
                        setTrangThaiVuViec={setTrangThaiVuViec}
                        nhanSuVuViec={nhanSuVuViec}
                        setNhanSuVuViec={setNhanSuVuViec}
                        nguoiXuLyChinh={nguoiXuLyChinh}
                        setNguoiXuLyChinh={setNguoiXuLyChinh}
                        nguoiXuLyPhu={nguoiXuLyPhu}
                        setNguoiXuLyPhu={setNguoiXuLyPhu}
                        ngayDongHS={ngayDongHS}
                        setNgayDongHS={setNgayDongHS}
                        ngayRutHS={ngayRutHS}
                        setNgayRutHS={setNgayRutHS}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* <div >
                                <label className="block text-gray-700 text-left">Mã hồ sơ vụ việc</label>
                                <input
                                    type="text"
                                    value={maHoSoVuViec}
                                    onChange={(e) => setMaHoSoVuViec(e.target.value)}
                                    className="w-full p-2 mt-1 border rounded-lg text-input h-10 bg-gray-200"
                                    disabled
                                />
                            </div> */}
                            {/* <div >
                                <label className="block text-gray-700 text-left">Số đơn</label>
                                <input
                                    type="text"
                                    value={soDon}
                                    placeholder="Nhập số đơn"
                                    onChange={(e) => setSoDon(e.target.value)}
                                    className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                                />
                            </div> */}

                            <div>
                                <label className="block text-gray-700 text-left">Trạng thái đơn</label>
                                <input
                                    type="text"
                                    value={trangThaiDon}
                                    disabled
                                    onChange={(e) => setTrangThaiDon(e.target.value)}
                                    className="w-full p-2 mt-1 border rounded-lg text-input h-10 bg-gray-200"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-left">Bước xử lý</label>
                                <input
                                    type="text"
                                    value={buocXuLy}
                                    disabled
                                    onChange={(e) => setBuocXuLy(e.target.value)}
                                    className="w-full p-2 mt-1 border rounded-lg text-input h-10 bg-gray-200"
                                />
                            </div>
                            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Cột trái: Ngày nộp đơn + Danh sách sản phẩm dịch vụ */}
                                <div className="flex flex-col gap-4">

                                    <div>
                                        <label className="block text-gray-700 text-left">Danh sách sản phẩm dịch vụ <span className="text-red-500">*</span></label>
                                        <Select
                                            options={formatOptions(productAndService, "maSPDV", "tenSPDV")}
                                            value={
                                                maSPDVList && maSPDVList.length > 0
                                                    ? formatOptions(productAndService, "maSPDV", "tenSPDV").filter(opt => maSPDVList.includes(opt.value))
                                                    : []
                                            }
                                            onChange={(selectedOptions) => {
                                                const selectedValues = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                                                setMaSPDVList(selectedValues);
                                                validateField("maSPDVList", selectedValues);
                                            }}
                                            placeholder="Chọn mã nhãn hiệu"
                                            className="w-full mt-1 rounded-lg text-left"
                                            isClearable
                                            isMulti
                                        />
                                        {errors.maSPDVList && (
                                            <p className="text-red-500 text-xs mt-1 text-left">{errors.maSPDVList}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Cột phải: Ghi chú */}
                                <div>
                                    <label className="block  text-left">Ghi chú</label>
                                    <textarea
                                        value={ghiChu}
                                        placeholder="Nhập ghi chú"
                                        onChange={(e) => setGhiChu(e.target.value)}
                                        className="w-full p-2 mt-1 border rounded-lg  min-h-[120px] resize-none"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <BrandBasicForm
                                    maNhanHieu={maNhanHieu}
                                    setMaNhanHieu={setMaNhanHieu}
                                    tenNhanHieu={tenNhanHieu}
                                    setTenNhanHieu={setTenNhanHieu}
                                    linkAnh={linkAnh}
                                    setLinkAnh={setLinkAnh}
                                    errors={errors}
                                    validateField={validateField}
                                    isEditOnly
                                />
                            </div>
                        </div>


                    </div>
                    {/* <FormSuaDoi></FormSuaDoi> */}
                    <FormTachDon></FormTachDon>
                        <div className="col-span-2">
                            <DocumentSection onTaiLieuChange={handleTaiLieuChange} initialTaiLieus={taiLieuList}
                                maHoSoVuViec={maHoSoVuViec}
                                giayUyQuyenGoc={giayUyQuyenGoc}
                                setGiayUyQuyenGoc={setGiayUyQuyenGoc}
                                maUyQuyen={maUyQuyen}
                                setMaUyQuyen={setMaUyQuyen}
                            />
                        </div>
                    
                </Spin>
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

export default Application_TD_NH_VNAdd;
