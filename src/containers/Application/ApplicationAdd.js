import React, { useState, useEffect, useRef } from "react";
import { Form, useNavigate, useParams } from "react-router-dom";
import dayjs from 'dayjs';
import callAPI from "../../utils/api";
import Select from "react-select";
import DocumentSection from "../../components/UpdateDocument/DocumentSection";
import AnnouncementOfApplication from "../../components/TrademarkRegistrationProcess/AnnouncementOfApplication";
import FormalDetermination from "../../components/TrademarkRegistrationProcess/FormalDetermination";
import ReplyContentRating from "../../components/TrademarkRegistrationProcess/ReplyContentRating";
import DiphimaProcess from "../../components/TrademarkRegistrationProcess/DiphimaProcess";
import DegreeInformation from "../../components/TrademarkRegistrationProcess/DegreeInformation";
import ContentReview from "../../components/TrademarkRegistrationProcess/ContentReview";
import CompleteDocumentation from "../../components/TrademarkRegistrationProcess/CompleteDocumentation";
import DonProgress from "../../components/commom/DonProgess.js";
import { DatePicker, Radio } from 'antd';
import 'dayjs/locale/vi';
import { showSuccess, showError } from "../../components/commom/Notification";
import BrandBasicForm from "../../components/BrandBasicForm";
import FormHoSo from "../../components/commom/FormHoSo.js";
import DSVuViec from "../../components/VuViecForm/DSVuViec.js";
function ApplicationAdd() {
    const navigate = useNavigate();

    const { id } = useParams();
    const [maHoSoVuViec, setMaHoSoVuViec] = useState("");
    const [loaiDon, setLoaiDon] = useState(1); // 1: Đơn gốc, 2: Đơn sửa đổi, 3: Đơn tách, 4: Đơn chuyển nhượng
    const [idKhachHang, setIdKhachHang] = useState(null);
    const [maKhachHang, setMaKhachHang] = useState("");
    const [idDoiTac, setIdDoiTac] = useState(null)
    const [maDoiTac, setMaDoiTac] = useState("");
    const [clientsRef, setClientsRef] = useState("");
    const [ngayTiepNhan, setNgayTiepNhan] = useState(null);
    const [ngayXuLy, setNgayXuLy] = useState(null);
    const [trangThaiVuViec, setTrangThaiVuViec] = useState(null);
    const [nhanSuVuViec, setNhanSuVuViec] = useState("");
    const [nguoiXuLyChinh, setNguoiXuLyChinh] = useState("");
    const [nguoiXuLyPhu, setNguoiXuLyPhu] = useState("");
    const [ngayDongHS, setNgayDongHS] = useState(null);
    const [ngayRutHS, setNgayRutHS] = useState(null);

    const isAddOnly = true
    const [soDon, setSoDon] = useState("")
    const [ngayNopDon, setNgayNopDon] = useState(null);
    const [maNhanHieuOld, setMaNhanHieuOld] = useState("");
    // const [maNhanHieu, setMaNhanHieu] = useState("");
    const [tenNhanHieu, setTenNhanHieu] = useState("");
    const [linkAnh, setLinkAnh] = useState("");
    const nhanHieu = {
        // maNhanHieu,
        tenNhanHieu,
        linkAnh,
    };
    const [maSPDVList, setMaSPDVList] = useState([]);
    const [ghiChu, setGhiChu] = useState("");
    const [expenseNotes, setExpenseNotes] = useState("");
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
    const [lichSuThamDinhND, setLichSuThamDinhND] = useState([])
    const [ngayKQThamDinhND_DK_SauKN, setNgayKQThamDinhND_DK_SauKN] = useState(null)
    const [trangThaiTraLoiKQThamDinhND, setTrangThaiTraLoiKQThamDinhND] = useState(null)

    const [ngayTraLoiKQThamDinhND_DuKien, setNgayTraLoiKQThamDinhND_DuKien] = useState(null);
    const [ngayTraLoiKQThamDinhND, setNgayTraLoiKQThamDinhND] = useState(null);

    const [ngayThongBaoCapBang, setNgayThongBaoCapBang] = useState(null);
    const [trangThaiCapBang, setTrangThaiCapBang] = useState(null);
    const [hanNopYKien, setHanNopYKien] = useState(null);
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

    const [trangThaiDon, setTrangThaiDon] = useState("Nộp đơn");
    const [buocXuLy, setBuocXuLy] = useState("");

    const [taiLieuList, setTaiLieuList] = useState([]);
    const [vuViecList, setVuViecList] = useState([])
    const [giayUyQuyenGoc, setGiayUyQuyenGoc] = useState(true);
    const [maUyQuyen, setMaUyQuyen] = useState(null);
    const [brands, setBrands] = useState([]);
    const [productAndService, setProductAndService] = useState([]);
    const [idSoBangOld, setIdSoBangOld] = useState(null);
    const [idGUQ, setIdGUQ] = useState(null);
    const [daiDienSHTT, setDaiDienSHTT] = useState("Công ty tư vấn SHTT IPAC");
    const [errors, setErrors] = useState({});
    const isFormValid =
        (maHoSoVuViec || "").trim() !== "" &&
        ((tenNhanHieu || "").trim() !== "" || (String(maNhanHieuOld || "").trim() !== "")) &&
        Array.isArray(maSPDVList) &&
        maSPDVList.length > 0;

    const validateField = (field, value) => {
        let error = "";
        if (field === "maHoSoVuViec" || field === "maNhanHieu") {
            if (!value || typeof value !== "string" || value.trim() === "") {
                if (field === "maHoSoVuViec") error = "Mã hồ sơ vụ việc không được để trống";
                if (field === "tenNhanHieu") error = "Tên nhãn hiệu không được để trống";
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
    useEffect(() => {
        fetchBrands();
        fetchItems();
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

            // 👉 Thêm xử lý hanNopYKien khi trạng thái cấp bằng là false
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

    const handleApplication = async () => {
        try {
            await callAPI({
                method: "post",
                endpoint: "/application/add",
                data: {
                    maHoSo: maHoSoVuViec,
                    loaiDon: loaiDon,
                    idKhachHang: idKhachHang,
                    idDoiTac: idDoiTac,
                    clientsRef: clientsRef,
                    ngayTiepNhan: ngayTiepNhan,
                    ngayXuLy: ngayXuLy,
                    trangThaiVuViec: trangThaiVuViec,
                    ngayDongHS: ngayDongHS,
                    ngayRutHS: ngayRutHS,

                    soDon: soDon,
                    maNhanHieu: maNhanHieuOld,
                    maSPDVList: maSPDVList,
                    trangThaiDon: trangThaiDon,
                    buocXuLy: buocXuLy,
                    ghiChu: ghiChu,
                    ngayNopDon: ngayNopDon,
                    ngayHoanThanhHoSoTaiLieu_DuKien: ngayHoanThanhHSTL_DuKien,
                    ngayHoanThanhHoSoTaiLieu: ngayHoanThanhHSTL,
                    trangThaiHoanThienHoSoTaiLieu: trangThaiHoanThanhHSTL,
                    ngayKQThamDinhHinhThuc_DuKien: ngayKQThamDinhHinhThuc_DuKien,
                    ngayKQThamDinhHinhThuc: ngayKQThamDinhHinhThuc,
                    lichSuThamDinhHT: lichSuThamDinhHT,
                    ngayKQThamDinhHinhThuc_DK_SauKN: ngayKQThamDinhHinhThuc_DK_SauKN,
                    ngayCongBoDonDuKien: ngayCongBo_DuKien,
                    ngayCongBoDon: ngayCongBo,
                    ngayKQThamDinhND_DuKien: ngayKQThamDinhND_DuKien,
                    ngayKQThamDinhND: ngayKQThamDinhND,
                    lichSuThamDinhND: lichSuThamDinhND,
                    ngayKQThamDinhND_DK_SauKN: ngayKQThamDinhND_DK_SauKN,
                    trangtrangThaiTraLoiKQThamDinhND: trangThaiTraLoiKQThamDinhND,
                    ngayTraLoiKQThamDinhND_DuKien: ngayTraLoiKQThamDinhND_DuKien,
                    ngayTraLoiKQThamDinhND: ngayTraLoiKQThamDinhND,
                    ngayThongBaoCapBang: ngayThongBaoCapBang,
                    trangThaiDYTBCapBang: trangThaiCapBang || null,
                    ngayNopYKien: ngayNopYKien || null,
                    ngayNhanKQYKien: ngayNhanKQYKien || null,
                    ketQuaYKien: ketQuaYKien || null,
                    hanNopPhiCapBang: hanNopPhiCapBang || null,

                    ngayNopPhiCapBang: ngayNopPhiCapBang,
                    ngayNhanBang: ngayNhanBang,
                    ngayGuiBangChoKhachHang: ngayGuiBangChoKH,
                    ngayCapBang: ngayCapBang,
                    ngayHetHanBang: ngayHetHanBang,
                    soBang: soBang,
                    quyetDinhSo: quyetDinhSo,
                    taiLieus: taiLieuList,
                    giayUyQuyenGoc: giayUyQuyenGoc,
                    maUyQuyen: maUyQuyen || null,
                    nhanHieu,
                    vuViecs: vuViecList,
                    idSoBangOld: idSoBangOld,
                    idGUQ: idGUQ,
                    daiDienSHTT: daiDienSHTT,
                    expense_notes: expenseNotes,
                      maNguoiXuLy1: nguoiXuLyChinh,
                },
            });
            await showSuccess("Thành công!", "Thêm đơn đăng ký nhãn hiệu thành công!");
            navigate(-1);
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
            console.error("Lỗi khi thêm đơn đăng ký!", error);
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
        <div className="p-1 bg-gray-100 flex  items-center justify-center space-y-4">
            <DonProgress trangThaiDon={trangThaiDon} />
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700 uppercase">
                        📌 Thêm đơn đăng ký nhãn hiệu mới Việt Nam
                    </h2>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                        alt="Cờ Việt Nam"
                        className="w-20 h-15"
                    />
                </div>
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
                    daiDienSHTT={daiDienSHTT}
                    setDaiDienSHTT={setDaiDienSHTT}
                    expenseNotes={expenseNotes}
                    setExpenseNotes={setExpenseNotes}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="flex flex-col gap-4">
                                {/* <div>
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
                                        disabledDate={(current) => {
                                            return current && current > dayjs().endOf("day");
                                        }}
                                    />
                                </div> */}

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
                                maNhanHieuOld={maNhanHieuOld}
                                setMaNhanHieuOld={setMaNhanHieuOld}
                                tenNhanHieu={tenNhanHieu}
                                setTenNhanHieu={setTenNhanHieu}
                                linkAnh={linkAnh}
                                setLinkAnh={setLinkAnh}
                                errors={errors}
                                setErrors={setErrors}
                                validateField={validateField}
                                brands={brands}
                            />
                        </div>
                    </div>

                    {daChonNgayNopDon && (
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
                    )}
                    {daChonNgayNopDon && (
                        <div className="col-span-2">
                            <DocumentSection onTaiLieuChange={handleTaiLieuChange} isAddOnly={isAddOnly}
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
                    )}
                    {daChonNgayHoanThanhHSTL && (
                        <div className="col-span-2">
                            <FormalDetermination
                                ngayKQThamDinhHinhThuc_DuKien={ngayKQThamDinhHinhThuc_DuKien}
                                setNgayKQThamDinhHinhThuc_DuKien={setNgayKQThamDinhHinhThuc_DuKien}
                                ngayKQThamDinhHinhThuc={ngayKQThamDinhHinhThuc}
                                setNgayKQThamDinhHinhThuc={setNgayKQThamDinhHinhThuc}
                                lichSuThamDinhHT={lichSuThamDinhHT}
                                setLichSuThamDinhHT={setLichSuThamDinhHT}
                                ngayKQThamDinhHinhThuc_DK_SauKN={ngayKQThamDinhHinhThuc_DK_SauKN}
                                setNgayKQThamDinhHinhThuc_DK_SauKN={setNgayKQThamDinhHinhThuc_DK_SauKN}
                                buocXuLy={buocXuLy}
                                setBuocXuLy={setBuocXuLy}
                            />
                        </div>
                    )}
                    {daChonNgayThamDinhHinhThuc && (
                        <div className="col-span-2">
                            <AnnouncementOfApplication
                                ngayCongBo_DuKien={ngayCongBo_DuKien}
                                setNgayCongBo_DuKien={setNgayCongBo_DuKien}
                                ngayCongBo={ngayCongBo}
                                setNgayCongBo={setNgayCongBo}
                            />
                        </div>
                    )}
                    {daChonNgayCongBoDon && (
                        <div className="col-span-2">
                            <ContentReview
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
                    )}
                    {daChonNgayThamDinhNoiDung && (
                        <div>
                            <Radio.Group
                                onChange={(e) => setTrangThaiTraLoiKQThamDinhND(e.target.value)}
                                value={trangThaiTraLoiKQThamDinhND}
                                className="mt-2"
                            >
                                <Radio value={true}>Phản hồi</Radio>
                                <Radio value={false}>Chờ nhận bằng</Radio>
                            </Radio.Group>
                        </div>
                    )}
                    {daChonNgayThamDinhNoiDung && trangThaiTraLoiKQThamDinhND === true && (
                        <div className="col-span-2">
                            <ReplyContentRating
                                ngayTraLoiKQThamDinhND_DuKien={ngayTraLoiKQThamDinhND_DuKien}
                                setNgayTraLoiKQThamDinhND_DuKien={setNgayTraLoiKQThamDinhND_DuKien}
                                ngayTraLoiKQThamDinhND={ngayTraLoiKQThamDinhND}
                                setNgayTraLoiKQThamDinhND={setNgayTraLoiKQThamDinhND}
                            />
                        </div>
                    )}
                    {(daChonNgayTraLoiThamDinhNoiDung || (trangThaiTraLoiKQThamDinhND === false && daChonNgayThamDinhNoiDung)) && (
                        <div className="col-span-2">
                            <DiphimaProcess
                                ngayThongBaoCapBang={ngayThongBaoCapBang}
                                setNgayThongBaoCapBang={setNgayThongBaoCapBang}
                                ngayNopPhiCapBang={ngayNopPhiCapBang}
                                setNgayNopPhiCapBang={setNgayNopPhiCapBang}
                                ngayNhanBang={ngayNhanBang}
                                setNgayNhanBang={setNgayNhanBang}
                                trangThaiCapBang={trangThaiCapBang}
                                setTrangThaiCapBang={setTrangThaiCapBang}
                                hanNopYKien={hanNopYKien}
                                setHanNopYKien={setHanNopYKien}
                                ngayNopYKien={ngayNopYKien}
                                setNgayNopYKien={setNgayNopYKien}
                                ngayNhanKQYKien={ngayNhanKQYKien}
                                setNgayNhanKQYKien={setNgayNhanKQYKien}
                                ketQuaYKien={ketQuaYKien}
                                setKetQuaYKien={setKetQuaYKien}
                                hanNopPhiCapBang={hanNopPhiCapBang}
                                setHanNopPhiCapBang={setHanNopPhiCapBang}
                            />
                        </div>
                    )}
                    {(daChonNgayTraLoiThamDinhNoiDung || (!trangThaiTraLoiKQThamDinhND && daChonNgayThamDinhNoiDung)) && (
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
                                idSoBangOld={idSoBangOld}
                                setIdSoBangOld={setIdSoBangOld}
                            />
                        </div>
                    )}
                    <div className="col-span-2">
                        <DSVuViec
                            maHoSo={maHoSoVuViec}
                            onVuViecChange={handleVuViecChange} initialVuViecs={vuViecList}
                            maHoSoVuViec={maHoSoVuViec}
                            giayUyQuyenGoc={giayUyQuyenGoc}
                            setGiayUyQuyenGoc={setGiayUyQuyenGoc}
                            maUyQuyen={maUyQuyen}
                            setMaUyQuyen={setMaUyQuyen}
                        />
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Quay lại</button>
                    <button onClick={handleSubmit} disabled={!isFormValid}
                        className={`px-4 py-2 rounded-lg text-white ${isFormValid
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-300 cursor-not-allowed"
                            }`}>Thêm đơn đăng ký</button>
                </div>
            </div>
        </div>
    );
}

export default ApplicationAdd;
