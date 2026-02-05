import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from 'dayjs';
import callAPI from "../../utils/api.js";
import Select from "react-select";
import DocumentSection_KH from "../../components/TrademarkRegistrationProcess/KH/DocumentSection_KH.js";
import ContentReview_KH from "../../components/TrademarkRegistrationProcess/KH/ContentReview_KH.js";
import DegreeInformation from "../../components/TrademarkRegistrationProcess/DegreeInformation.js";
import CompleteDocumentation from "../../components/TrademarkRegistrationProcess/CompleteDocumentation.js";
import DonProgress from "../../components/commom/DonProgess.js";
// import ExportWordButton from "../../components/ExportFile/ExportWordButton.js";
import { DatePicker, Radio } from 'antd';
import 'dayjs/locale/vi';
import { showSuccess, showError } from "../../components/commom/Notification.js";
import BrandBasicForm from "../../components/BrandBasicForm.js";
import { Spin } from "antd";
import FormHoSo from "../../components/commom/FormHoSo.js";
import DSVuViec from "../../components/VuViecForm/DSVuViec.js";
import FormSuaDoi from "../../components/commom/FormSuaDoi.js";
import FormTachDon from "../../components/commom/FormTachDon.js";
function ApplicationEdit_KH() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { maDonDangKy } = useParams();
    const [loaiDon, setLoaiDon] = useState(1)
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
    const [daiDienSHTT, setDaiDienSHTT] = useState(null);

    const isEditOnly = true
    const [maHoSoVuViec, setMaHoSoVuViec] = useState("");
    const [soDon, setSoDon] = useState("")
    const [ngayNopDon, setNgayNopDon] = useState(null);
    const [maNhanHieu, setMaNhanHieu] = useState("");
    const [tenNhanHieu, setTenNhanHieu] = useState("");
    const [linkAnh, setLinkAnh] = useState("");
    const isKH = true;
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

    const [ngayKQThamDinhND_DuKien, setNgayKQThamDinhND_DuKien] = useState(null);
    const [ngayKQThamDinhND, setNgayKQThamDinhND] = useState(null);
    const [lichSuThamDinhND, setLichSuThamDinhND] = useState([]);
    const [ngayKQThamDinhND_DK_SauKN, setNgayKQThamDinhND_DK_SauKN] = useState(null)
    const [trangThaiTraLoiKQThamDinhND, setTrangThaiTraLoiKQThamDinhND] = useState(null)

    const [ngayNopPhiCapBang, setNgayNopPhiCapBang] = useState(null);
    const [ngayNhanBang, setNgayNhanBang] = useState(null);
    const [ngayGuiBangChoKH, setNgayGuiBangChoKH] = useState(null);
    const [soBang, setSoBang] = useState("");
    const [quyetDinhSo, setQuyetDinhSo] = useState("");
    const [ngayCapBang, setNgayCapBang] = useState(null);
    const [ngayHetHanBang, setNgayHetHanBang] = useState(null);

    const [trangThaiDon, setTrangThaiDon] = useState("");
    const [buocXuLy, setBuocXuLy] = useState("");
    const [idGUQ, setIdGUQ] = useState(null);
    const [taiLieuList, setTaiLieuList] = useState([]);
    const [vuViecList, setVuViecList] = useState([])
    const [giayUyQuyenGoc, setGiayUyQuyenGoc] = useState(true);
    const [maUyQuyen, setMaUyQuyen] = useState(null);
    const [brands, setBrands] = useState([]);
    const [productAndService, setProductAndService] = useState([]);


    //Đơn sửa đổi
    const [idDonSuaDoi, setIdDonSuaDoi] = useState(null);
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
    const [maDonDangKyGoc, setMaDonDangKyGoc] = useState(null);

    // Đơn tách
    const [idDonTach, setIdDonTach] = useState(null);
    const [soDonTD, setSoDonTD] = useState("");
    const [dsNhomSPDV, setDsNhomSPDV] = useState(null);
    const [ndTachDon, setNdTachDon] = useState("");
    const [moTa, setMoTa] = useState("");
    const [ngayYeuCauTD, setNgayYeuCauTD] = useState(null);
    const [ngayGhiNhanTD, setNgayGhiNhanTD] = useState(null);
    const [lanTachDon, setLanTachDon] = useState(1);

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
    const [daChonNgayThamDinhNoiDung, setDaChonNgayThamDinhNoiDung] = useState(false);
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
            setDaChonNgayThamDinhNoiDung(true);
            setDaChonHoanTatThuTucNhapBang(true);
        }
        if (ngayNopDon) {
            const duKien = dayjs(ngayNopDon).add(59, 'day').format('YYYY-MM-DD');
            setNgayHoanThanhHSTL_DuKien(duKien);
            // 👉 Chỉ set ngày hết hạn nếu chưa có
            if (!ngayHetHanBang && soBang) {
                const hetHanBang = dayjs(ngayNopDon).add(10, 'year').format('YYYY-MM-DD');
                setNgayHetHanBang(hetHanBang);
            }

            setDaChonNgayNopDon(true);
            updateTrangThaiDon("Hoàn thành hồ sơ tài liệu");
        } else {
            setNgayHoanThanhHSTL_DuKien(null);
            setNgayHetHanBang(null);
        }
        if (ngayHoanThanhHSTL) {
            // if (!ngayKQThamDinhND_DuKien) {
            const duKien1 = dayjs(ngayHoanThanhHSTL).add(2, 'month').format('YYYY-MM-DD');
            const duKien = dayjs(ngayHoanThanhHSTL).add(6, 'month').format('YYYY-MM-DD');
            // setNgayHoanThanhHSTL_DuKien(duKien1);
            setNgayKQThamDinhND_DuKien(duKien);
            // }
            // setDaChonNgayCongBoDon(true);
            updateTrangThaiDon("Thẩm định");
        } else {
            setNgayKQThamDinhND_DuKien(null);
        }
        if (ngayKQThamDinhND) {
            updateTrangThaiDon("Đơn đăng ký hoàn tất");
        }

    }, [
        ngayNopDon,
        ngayHoanThanhHSTL,
        ngayKQThamDinhND,
        trangThaiTraLoiKQThamDinhND,
        ngayNhanBang,
        ngayGuiBangChoKH,
        ngayHoanThanhHSTL_DuKien,
        ngayKQThamDinhND_DuKien,
        daChonNgayThamDinhNoiDung,
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
                endpoint: "application_kh/detail",
                data: { maDonDangKy }
            });

            if (response) {
                setLoaiDon(response.loaiDon);
                setIdKhachHang(response.idKhachHang);
                setIdDoiTac(response.idDoiTac);
                setClientsRef(response.clientsRef);
                setNgayTiepNhan(response.ngayTiepNhan);
                setNgayXuLy(response.ngayXuLy);
                setTrangThaiVuViec(response.trangThaiVuViec || "1");
                setMaHoSoVuViec(response.maHoSoVuViec);
                setNguoiXuLyChinh(response.maNguoiXuLy1);
                setNguoiXuLyPhu(response.maNguoiXuLy2);

                setMaHoSoVuViec(response.maHoSoVuViec);
                setSoDon(response.soDon)
                setMaNhanHieu(response.nhanHieu.maNhanHieu);
                setTenNhanHieu(response.nhanHieu.tenNhanHieu);
                setLinkAnh(response.nhanHieu.linkAnh);
                setTrangThaiDon(response.trangThaiDon);
                setBuocXuLy(response.buocXuLy);
                setMaSPDVList(response.maSPDVList);
                setGhiChu(response.ghiChu);
                setNgayNopDon(formatDate(response.ngayNopDon));
                //setNgayHoanThanhHSTL_DuKien(formatDate(response.ngayHoanThanhHoSoTaiLieu_DuKien));
                setNgayHoanThanhHSTL(formatDate(response.ngayHoanThanhHoSoTaiLieu));
                setTrangThaiHoanThanhHSTL(response.trangThaiHoanThienHoSoTaiLieu);

                setNgayKQThamDinhND_DuKien(formatDate(response.ngayKQThamDinhND_DuKien));
                setNgayKQThamDinhND(formatDate(response.ngayKQThamDinhND));

                setLichSuThamDinhND(response.lichSuThamDinh)
                setNgayKQThamDinhND_DK_SauKN(response.ngayKQThamDinhND_DK_SauKN);
                setTrangThaiTraLoiKQThamDinhND(response.trangThaiTraLoiKQThamDinhND);

                setNgayNopPhiCapBang(formatDate(response.ngayNopPhiCapBang));
                setNgayNhanBang(formatDate(response.ngayNhanBang));
                setNgayGuiBangChoKH(formatDate(response.ngayGuiBangChoKhachHang));
                setSoBang(response.soBang);
                setQuyetDinhSo(response.quyetDinhSo);
                setNgayCapBang(formatDate(response.ngayCapBang));
                setNgayHetHanBang(formatDate(response.ngayHetHanBang));
                setTrangThaiDon(response.trangThaiDon);
                setTaiLieuList(response.taiLieuChuaNop_KH);
                setGiayUyQuyenGoc(response.giayUyQuyenGoc);
                setMaUyQuyen(response.maUyQuyen || null);
                setVuViecList(response.vuViec);
                setDaiDienSHTT(response.daiDienSHTT || null);
                setIdGUQ(response.idGUQ || null);   
                if (response.donSuaDoi) {
                    setIdDonSuaDoi(response.donSuaDoi.id || null);
                    setSoDonSD(response.donSuaDoi.soDon || "");
                    setNgayYeuCau(response.donSuaDoi.ngayYeuCau ? formatDate(response.donSuaDoi.ngayYeuCau) : null);
                    setLanSuaDoi(response.donSuaDoi.lanSuaDoi ?? 1);
                    setNgayGhiNhanSuaDoi(response.donSuaDoi.ngayGhiNhanSuaDoi ? formatDate(response.donSuaDoi.ngayGhiNhanSuaDoi) : null);
                    setDuocGhiNhanSuaDoi(response.donSuaDoi.duocGhiNhanSuaDoi ?? false);
                    setMoTaSuaDoi(response.donSuaDoi.moTa || "");
                    setSuaDoiDaiDien(response.donSuaDoi.suaDoiDaiDien ?? false);
                    setNdSuaDoiDaiDien(response.donSuaDoi.ndSuaDoiDaiDien || "");
                    setSuaDoiTenChuDon(response.donSuaDoi.suaDoiTenChuDon ?? false);
                    setNdSuaDoiTenChuDon(response.donSuaDoi.ndSuaDoiTenChuDon || "");
                    setSuaDoiDiaChi(response.donSuaDoi.suaDoiDiaChi ?? false);
                    setNdSuaDoiDiaChi(response.donSuaDoi.ndSuaDoiDiaChi || "");
                    setSuaNhan(response.donSuaDoi.suaNhan ?? false);
                    setNdSuaNhan(response.donSuaDoi.ndSuaNhan || "");
                    setSuaNhomSPDV(response.donSuaDoi.suaNhomSPDV ?? false);
                    setNdSuaNhomSPDV(response.donSuaDoi.ndSuaNhomSPDV || "");
                    setMaDonDangKyGoc(response.donSuaDoi.maDonDangKyGoc);
                }
                if (response.donTach) {
                    setIdDonTach(response.donTach.id);
                    setSoDonTD(response.donTach.soDon || "");
                    setDsNhomSPDV(response.donTach.dsNhomSPDV || null);
                    setNdTachDon(response.donTach.ndTachDon || "");
                    setMoTa(response.donTach.moTa || "");
                    setNgayYeuCauTD(response.donTach.ngayYeuCau ? formatDate(response.donTach.ngayYeuCau) : null);
                    setNgayGhiNhanTD(response.donTach.ngayGhiNhanTachDon ? formatDate(response.donTach.ngayGhiNhanTachDon) : null);
                    setLanTachDon(response.donTach.lanTachDon ?? 1);
                }
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
                endpoint: "/application_kh/edit",
                data: {
                    maHoSo: maHoSoVuViec,
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

                    ngayKQThamDinhND_DuKien: ngayKQThamDinhND_DuKien || null,
                    ngayKQThamDinhND: ngayKQThamDinhND || null,
                    lichSuThamDinh: lichSuThamDinhND,
                    ngayKQThamDinhND_DK_SauKN: ngayKQThamDinhND_DK_SauKN,
                    trangThaiTraLoiKQThamDinhND: trangThaiTraLoiKQThamDinhND,


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
                    idGUQ: idGUQ,
                    daiDienSHTT: daiDienSHTT,
                    donSuaDoi: {
                        id: idDonSuaDoi || null, // 🟢 thêm dòng này
                        soDon: soDonSD || "",
                        ngayYeuCau: ngayYeuCau || null,
                        lanSuaDoi: lanSuaDoi ?? 1,
                        ngayGhiNhanSuaDoi: ngayGhiNhanSuaDoi || null,
                        duocGhiNhanSuaDoi: duocGhiNhanSuaDoi ?? false,
                        moTa: moTaSuaDoi || "",
                        suaDoiDaiDien: suaDoiDaiDien ?? false,
                        ndSuaDoiDaiDien: ndSuaDoiDaiDien || "",
                        suaDoiTenChuDon: suaDoiTenChuDon ?? false,
                        ndSuaDoiTenChuDon: ndSuaDoiTenChuDon || "",
                        suaDoiDiaChi: suaDoiDiaChi ?? false,
                        ndSuaDoiDiaChi: ndSuaDoiDiaChi || "",
                        suaNhan: suaNhan ?? false,
                        ndSuaNhan: ndSuaNhan || "",
                        suaNhomSPDV: suaNhomSPDV ?? false,
                        ndSuaNhomSPDV: ndSuaNhomSPDV || ""
                    },
                    donTach: {
                        id: idDonTach,
                        soDon: soDonTD || "",
                        dsNhomSPDV: dsNhomSPDV || null,
                        ndTachDon: ndTachDon || "",
                        moTa: moTa || "",
                        ngayYeuCauTD: ngayYeuCauTD || null,
                        ngayGhiNhanTD: ngayGhiNhanTD || null,
                        lanTachDon: lanTachDon ?? 1,
                    },
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

    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center space-y-4">
            {/* <DonProgress trangThaiDon={trangThaiDon} /> */}
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">
                        📌 Cập nhập đơn đăng ký nhãn hiệu mới
                    </h2>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg"
                        alt="Cờ Campuchia"
                        className="w-20 h-15"
                    />
                </div>
                <FormHoSo
                    soDon={soDon}
                    setSoDon={setSoDon}
                    loaiDon={loaiDon}
                    setLoaiDon={setLoaiDon}
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
                    ngayNopDon={ngayNopDon}
                    setNgayNopDon={setNgayNopDon}
                    daiDienSHTT={daiDienSHTT}
                    setDaiDienSHTT={setDaiDienSHTT}
                />
                <Spin spinning={loading} tip="Loading..." size="large">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <label className="block text-gray-700 text-left">Tình trạng đơn</label>
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
                                        <label className="block text-gray-700 text-left">Ngày nộp đơn</label>
                                        <DatePicker
                                            value={ngayNopDon ? dayjs(ngayNopDon) : null}
                                            onChange={(date) => {
                                                if (dayjs.isDayjs(date) && date.isValid()) {
                                                    setNgayNopDon(date.format("YYYY-MM-DD"));
                                                } else {
                                                    setNgayNopDon(null);
                                                }
                                            }}
                                            format="DD/MM/YYYY"
                                            placeholder="Chọn ngày nộp đơn"
                                            className="mt-1 w-full"
                                        />
                                    </div>

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

                        {/* {daChonNgayNopDon && ( */}
                        <div className="col-span-2">
                            <CompleteDocumentation
                                ngayHoanThanhHSTL_DuKien={ngayHoanThanhHSTL_DuKien}
                                setNgayHoanThanhHSTL_DuKien={setNgayHoanThanhHSTL_DuKien}
                                ngayHoanThanhHSTL={ngayHoanThanhHSTL}
                                setNgayHoanThanhHSTL={setNgayHoanThanhHSTL}
                                trangThaiHoanThanhHSTL={trangThaiHoanThanhHSTL}
                                setTrangThaiHoanThanhHSTL={setTrangThaiHoanThanhHSTL}
                                formatOptions={formatOptions}
                            />
                        </div>
                        {/* )} */}
                        {/* {daChonNgayNopDon && ( */}
                        <div className="col-span-2">
                            <DocumentSection_KH onTaiLieuChange={handleTaiLieuChange} initialTaiLieus={taiLieuList}
                                maHoSoVuViec={maHoSoVuViec}
                                giayUyQuyenGoc={giayUyQuyenGoc}
                                setGiayUyQuyenGoc={setGiayUyQuyenGoc}
                                maUyQuyen={maUyQuyen}
                                setMaUyQuyen={setMaUyQuyen}
                                idGUQ={idGUQ}
                                setIdGUQ={setIdGUQ}
                                idKhachHang={idKhachHang}
                            />
                        </div>
                        {/* <div className="col-span-2">
                            <DocumentSection onTaiLieuChange={handleTaiLieuChange}
                                maHoSoVuViec={maHoSoVuViec}
                                giayUyQuyenGoc={giayUyQuyenGoc}
                                setGiayUyQuyenGoc={setGiayUyQuyenGoc}
                                maUyQuyen={maUyQuyen}
                                setMaUyQuyen={setMaUyQuyen}
                            />
                        </div> */}
                        {/* )} */}
                        {/* {daChonNgayHoanThanhHSTL && ( */}
                        <div className="col-span-2">
                            <ContentReview_KH
                                ngayKQThamDinhND_DuKien={ngayKQThamDinhND_DuKien}
                                setNgayKQThamDinhND_DuKien={setNgayKQThamDinhND_DuKien}
                                ngayKQThamDinhND={ngayKQThamDinhND}
                                setNgayKQThamDinhND={setNgayKQThamDinhND}
                                lichSuThamDinhND={lichSuThamDinhND}
                                setLichSuThamDinhND={setLichSuThamDinhND}
                                ngayKQThamDinhND_DK_SauKN={ngayKQThamDinhND_DK_SauKN}
                                setNgayKQThamDinhND_DK_SauKN={setNgayKQThamDinhND_DK_SauKN}
                                buocXuLy={buocXuLy}
                                setBuocXuLy={setBuocXuLy}
                            />
                        </div>
                        {/* )} */}

                        {/* {(daChonNgayThamDinhNoiDung || (!trangThaiTraLoiKQThamDinhND && daChonNgayThamDinhNoiDung)) && ( */}
                        <div className="col-span-2">
                            <DegreeInformation
                                soBang={soBang}
                                setSoBang={setSoBang}
                                quyetDinhSo={quyetDinhSo}
                                setQuyetDinhSo={setQuyetDinhSo}
                                ngayCapBang={ngayCapBang}
                                setNgayCapBang={setNgayCapBang}
                                ngayHetHanBang={ngayHetHanBang}
                                setNgayHetHanBang={setNgayHetHanBang}
                                ngayGuiBangChoKH={ngayGuiBangChoKH}
                                setNgayGuiBangChoKH={setNgayGuiBangChoKH}

                            />
                        </div>
                        <div className="col-span-2">
                            <DSVuViec
                                maHoSo={maHoSoVuViec}
                                onVuViecChange={handleVuViecChange} initialVuViecs={vuViecList}
                                maHoSoVuViec={maHoSoVuViec}
                                giayUyQuyenGoc={giayUyQuyenGoc}
                                setGiayUyQuyenGoc={setGiayUyQuyenGoc}
                                maUyQuyen={maUyQuyen}
                                setMaUyQuyen={setMaUyQuyen}
                                isKH={isKH}
                                maDonDangKy={maDonDangKy}
                            />
                        </div>
                        <div className="col-span-2">
                            {loaiDon === 2 && (
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
                                    maDonDangKyGoc={maDonDangKyGoc}
                                    isEditOnly={isEditOnly}
                                />
                            )}
                        </div>
                        <div className="col-span-2">
                            {loaiDon === 3 && (
                                <FormTachDon
                                    soDonTD={soDonTD}
                                    setSoDonTD={setSoDonTD}
                                    ngayYeuCauTD={ngayYeuCauTD}
                                    setNgayYeuCauTD={setNgayYeuCauTD}
                                    ngayGhiNhanTD={ngayGhiNhanTD}
                                    setNgayGhiNhanTD={setNgayGhiNhanTD}
                                    dsNhomSPDV={dsNhomSPDV}
                                    setDsNhomSPDV={setDsNhomSPDV}
                                    ndTachDon={ndTachDon}
                                    setNdTachDon={setNdTachDon}
                                    moTa={moTa}
                                    setMoTa={setMoTa}
                                    maDonDangKyGoc={maDonDangKyGoc}
                                    lanTachDon={lanTachDon}
                                    setLanTachDon={setLanTachDon}
                                    isEditOnly={isEditOnly}
                                ></FormTachDon>
                            )}
                        </div>
                        {/* )} */}
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

export default ApplicationEdit_KH;
