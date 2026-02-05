import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from 'dayjs';
import callAPI from "../../utils/api.js";
import Select from "react-select";
import DegreeInformation from "../../components/TrademarkRegistrationProcess/DegreeInformation.js";
import DocumentSection_KH from "../../components/TrademarkRegistrationProcess/KH/DocumentSection_KH.js";
import { DatePicker, Radio } from 'antd';
import 'dayjs/locale/vi';
import { showSuccess, showError } from "../../components/commom/Notification.js";
import BrandBasicForm from "../../components/BrandBasicForm.js";
import FormGiaHan from "../../components/commom/FormGiaHan.js";
import FormHoSo from "../../components/commom/FormHoSo.js";
import DSVuViec from "../../components/VuViecForm/DSVuViec.js";
function Application_GH_NH_VNAdd() {
    const navigate = useNavigate();

    const [maHoSoVuViec, setMaHoSoVuViec] = useState("");
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
    const [ngayHoanThanhHSTL_DuKien, setNgayHoanThanhHSTL_DuKien] = useState(null);
    const [ngayHoanThanhHSTL, setNgayHoanThanhHSTL] = useState(null);
    const [trangThaiHoanThanhHSTL, setTrangThaiHoanThanhHSTL] = useState("");

    const [ngayNopYCGiaHan, setNgayNopYCGiaHan] = useState(null);
    const [donGoc, setDonGoc] = useState(true);
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

    const [ngayNopPhiCapBang, setNgayNopPhiCapBang] = useState(null);
    const [ngayNhanBang, setNgayNhanBang] = useState(null);
    const [ngayGuiBangChoKH, setNgayGuiBangChoKH] = useState(null);
    const [soBang, setSoBang] = useState("");
    const [quyetDinhSo, setQuyetDinhSo] = useState("");
    const [ngayCapBang, setNgayCapBang] = useState(null);
    const [ngayHetHanBang, setNgayHetHanBang] = useState(null);

    const [trangThaiDon, setTrangThaiDon] = useState("Nộp đơn");
    const [buocXuLy, setBuocXuLy] = useState("");
    const [trangThaiCapBang, setTrangThaiCapBang] = useState(null);
    const [ngayNopYKien, setNgayNopYKien] = useState(null);
    const [ketQuaYKien, setKetQuaYKien] = useState(null);
    const [taiLieuList, setTaiLieuList] = useState([]);
    const [vuViecList, setVuViecList] = useState([])
    const [giayUyQuyenGoc, setGiayUyQuyenGoc] = useState(true);
    const [maUyQuyen, setMaUyQuyen] = useState(null);
    const [brands, setBrands] = useState([]);
    const [productAndService, setProductAndService] = useState([]);

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
            const duKien = dayjs(ngayNopDon).add(2, 'month').format('YYYY-MM-DD');
            setNgayHoanThanhHSTL_DuKien(duKien);
            // 👉 Chỉ set ngày hết hạn nếu chưa có
            if (!ngayHetHanBang) {
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
            const duKien1 = dayjs(ngayHoanThanhHSTL).add(2, 'month').format('YYYY-MM-DD');
            const duKien = dayjs(ngayHoanThanhHSTL).add(6, 'month').format('YYYY-MM-DD');
            setNgayHoanThanhHSTL_DuKien(duKien1);
            updateTrangThaiDon("Thẩm định");
        } else {
        }

    }, [
        ngayNopDon,
        ngayHoanThanhHSTL,
        ngayNhanBang,
        ngayGuiBangChoKH,
        ngayHoanThanhHSTL_DuKien,
        daChonNgayThamDinhNoiDung,
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
                endpoint: "/application_gh_nh_vn/add",
                data: {
                    maHoSo: maHoSoVuViec,
                    idKhachHang: idKhachHang,
                    // maKhachHang: maKhachHang,

                    idDoiTac: idDoiTac,
                    // maDoiTac: maDoiTac,

                    clientsRef: clientsRef,
                    ngayTiepNhan: ngayTiepNhan,
                    ngayXuLy: ngayXuLy,
                    trangThaiVuViec: trangThaiVuViec,
                    ngayDongHS: ngayDongHS,
                    ngayRutHS: ngayRutHS,

                    maHoSoVuViec: maHoSoVuViec,
                    soDon: soDon,
                    maNhanHieu: maNhanHieuOld,
                    maSPDVList: maSPDVList,
                    trangThaiDon: trangThaiDon,
                    buocXuLy: buocXuLy,
                    ghiChu: ghiChu,
                    ngayNopDon: ngayNopDon,

                    ngayNopYCGiaHan: ngayNopYCGiaHan,
                    donGoc: donGoc,
                    ngayKQThamDinh_DuKien: ngayKQThamDinh_DuKien,
                    trangThaiThamDinh: trangThaiThamDinh,
                    ngayThongBaoTuChoiGiaHan: ngayThongBaoTuChoiGiaHan,
                    hanTraLoiTuChoiGiaHan: hanTraLoiTuChoiGiaHan,
                    ngayTraLoiThongBaoTuChoiGiaHan: ngayTraLoiThongBaoTuChoiGiaHan,
                    trangThaiTuChoiGiaHan: trangThaiTuChoiGiaHan,
                    ngayQuyetDinhTuChoiGiaHan: ngayQuyetDinhTuChoiGiaHan,
                    ngayQuyetDinhGiaHan_DuKien: ngayQuyetDinhGiaHan_DuKien,
                    ngayQuyetDinhGiaHan: ngayQuyetDinhGiaHan,
                    ngayDangBa: ngayDangBa,

                    ngayNhanBang: ngayNhanBang,
                    ngayGuiBangChoKhachHang: ngayGuiBangChoKH,
                    ngayCapBang: ngayCapBang,
                    ngayHetHanBang: ngayHetHanBang,
                    soBang: soBang,
                    quyetDinhSo: quyetDinhSo,
                    taiLieus: taiLieuList,
                    giayUyQuyenGoc: giayUyQuyenGoc || true,
                    maUyQuyen: maUyQuyen || null,
                    nhanHieu,
                    vuViecs: vuViecList,
                },
            });
            await showSuccess("Thành công!", "Thêm đơn gia hạn văn bằng thành công!");
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
            {/* <DonProgress trangThaiDon={trangThaiDon} /> */}
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">
                        📌 Thêm đơn gia hạn nhãn hiệu
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">

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
                    <div className="col-span-2">
                        <DocumentSection_KH onTaiLieuChange={handleTaiLieuChange} initialTaiLieus={taiLieuList}
                            maHoSoVuViec={maHoSoVuViec}
                            giayUyQuyenGoc={giayUyQuyenGoc}
                            setGiayUyQuyenGoc={setGiayUyQuyenGoc}
                            maUyQuyen={maUyQuyen}
                            setMaUyQuyen={setMaUyQuyen}
                        />
                    </div>
                    <div className="col-span-2">
                        <FormGiaHan
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
                        />
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Quay lại</button>
                    <button onClick={handleSubmit} disabled={!isFormValid}
                        className={`px-4 py-2 rounded-lg text-white ${isFormValid
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-300 cursor-not-allowed"
                            }`}>Lưu thông tin</button>
                </div>
            </div>
        </div>
    );
}

export default Application_GH_NH_VNAdd;
