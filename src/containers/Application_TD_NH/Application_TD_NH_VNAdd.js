import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from 'dayjs';
import callAPI from "../../utils/api.js";
import Select from "react-select";
// import ExportWordButton from "../../components/ExportFile/ExportWordButton.js";
import { DatePicker, Radio } from 'antd';
import 'dayjs/locale/vi';
import { showSuccess, showError } from "../../components/commom/Notification.js";
import BrandBasicForm from "../../components/BrandBasicForm.js";
import { Table, Modal, Button, Spin } from "antd";
import DSVuViec from "../../components/VuViecForm/DSVuViec.js";
import FormTachDon from "../../components/commom/FormTachDon.js";
function Application_TD_NH_VNAdd() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const isViewOnly = true
    const { maDonDangKy } = useParams();
    const [noiDungVuViec, setNoiDungVuViec] = useState("");
    const [tenKhachHang, setTenKhachHang] = useState("");
    const [diaChi, setDiaChi] = useState("");
    const [soDienThoai, setSoDienThoai] = useState("");
    const [loaiDon, setLoaiDon] = useState(1); // 1: Đơn gốc, 2: Đơn sửa đổi, 3: Đơn tách, 4: Đơn chuyển nhượng
    const [donGoc, setDonGoc] = useState(null);
    const [donSuaDoi, setDonSuaDoi] = useState({});
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
    const [isModalHTOpen, setIsModalHTOpen] = useState(false);
    const [isModalNDOpen, setIsModalNDOpen] = useState(false);
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
    const [soGUQ, setSoGUQ] = useState("");
    const [soDonUQGoc, setSoDonUQGoc] = useState("");
    const [danhSachDonSuaDoi, setDanhSachDonSuaDoi] = useState([]);
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
                endpoint: "application/fulldetail",
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
                setVuViecList(response.vuViec || []);
                setDonGoc(response.donGoc || null);
                setDonSuaDoi(response.donSuaDoi || {});
                setSoGUQ(response.GiayUyQuyen.soGUQ || "");
                setSoDonUQGoc(response.GiayUyQuyen.soDonGoc || "");
                setDanhSachDonSuaDoi(response.danhSachDonSuaDoi || []);
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
                        📌 TẠO ĐƠN TÁCH NHÃN HIỆU
                    </h2>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                        alt="Cờ Việt Nam"
                        className="w-20 h-15"
                    />
                </div>

                <Spin spinning={loading} tip="Loading..." size="large">
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-800 text-sm">
                            {/* Thông tin chung */}
                            <div className="text-left"><span className="font-medium">Mã hồ sơ:</span> {maHoSoVuViec}</div>
                            <div className="text-left"><span className="font-medium">Loại đơn:</span> {loaiDon === 1 ? "Đơn gốc" : loaiDon === 2 ? "Đơn sửa đổi" : loaiDon === 3 ? "Đơn tách" : loaiDon === 4 ? "Đơn chuyển nhượng" : ""}</div>
                            <div className="text-left"><span className="font-medium">Client ref's:</span> {noiDungVuViec}</div>
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

                                                        {item.ngayGhiNhanSuaDoi && (
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
                            <div className="col-span-2">
                                <DSVuViec
                                    maHoSo={maHoSoVuViec}
                                    onVuViecChange={handleVuViecChange} initialVuViecs={vuViecList}
                                    maHoSoVuViec={maHoSoVuViec}
                                    giayUyQuyenGoc={giayUyQuyenGoc}
                                    setGiayUyQuyenGoc={setGiayUyQuyenGoc}
                                    maUyQuyen={maUyQuyen}
                                    setMaUyQuyen={setMaUyQuyen}
                                    isViewOnly={isViewOnly}
                                />
                            </div>
                            <div className="flex gap-3 mb-4">
                                <Button type="primary" style={{ backgroundColor: "#009999", borderColor: "#009999" }} onClick={() => setIsModalHTOpen(true)}>📄 Xem lịch sử nhận thông báo từ chối thẩm định hình thức</Button>
                                <Button type="primary" style={{ backgroundColor: "#009999", borderColor: "#009999" }} onClick={() => setIsModalNDOpen(true)}>📄 Xem lịch sử nhân thông báo từ chối thẩm định nội dung</Button>
                            </div>

                        </div>
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
