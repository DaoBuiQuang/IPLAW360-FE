import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { DatePicker, Input, Select, Spin, message, Radio, Collapse } from "antd";
import "dayjs/locale/vi";
import callAPI from "../../utils/api.js";
import { showSuccess, showError } from "../../components/commom/Notification.js";

const FLAG_VN = "https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg";
const FLAG_KH = "https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg";

const LOAI_THAY_DOI_OPTIONS = [
    {
        value: "CHUYEN_NHUONG",
        label: "Yêu cầu ghi nhận thay đổi người nộp đơn do chuyển nhượng đơn",
    },
    {
        value: "THUA_KE_KE_THUA",
        label: "Yêu cầu ghi nhận thay đổi người nộp đơn do thừa kế, kế thừa hoặc theo quyết định của cơ quan có thẩm quyền",
    },
];

const LOAI_HINH_OPTIONS = [
    { value: "Cá nhân", label: "Cá nhân" },
    { value: "Doanh nghiệp", label: "Doanh nghiệp" },
    { value: "Viện nghiên cứu", label: "Viện nghiên cứu" },
    { value: "Trường đại học", label: "Trường đại học" },
    { value: "Khác", label: "Khác" },
];

const SUGGESTED_DOCS = [
    "Tờ khai thay đổi người nộp đơn",
    "Văn bản chuyển nhượng đơn",
    "Văn bản đồng ý của những người nộp đơn khác",
    "Bản dịch tiếng Việt",
    "Tài liệu chứng minh thay đổi người nộp đơn do thừa kế, kế thừa",
    "Văn bản ủy quyền",
    "Tài liệu khác",
];

const parseObj = (raw) => {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
};

const readFileAsDataUrl = (file, cb) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => cb(reader.result);
    reader.readAsDataURL(file);
};

function CQSHFormCore({ country = "VN", mode = "add" }) {
    const isKH = country === "KH";
    const isEdit = mode === "edit";
    const navigate = useNavigate();
    const { maDonDangKy, id } = useParams();

    const apiPrefix = isKH ? "/application_cq_nh_kh" : "/application_cq_nh_vn";
    const appFullDetailEndpoint = isKH ? "/application_kh/fulldetail" : "/application/fulldetail";
    const listPath = isKH ? "/application_cq_nh_khlist" : "/application_cq_nh_vnlist";
    const detailPathPrefix = isKH ? "/application_cq_nh_kh_detail" : "/application_cq_nh_vn_detail";

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Thông tin đơn gốc hiện tại
    const [appDetail, setAppDetail] = useState(null);
    const [targetMaDonGoc, setTargetMaDonGoc] = useState(maDonDangKy || "");

    // Danh sách chọn
    const [customers, setCustomers] = useState([]);
    const [guqList, setGuqList] = useState([]);

    // Form chuyển quyền sở hữu (Mẫu số 11)
    const [customerId, setCustomerId] = useState(null);
    const [soDonChuyenQuyen, setSoDonChuyenQuyen] = useState("");
    const [loaiThayDoi, setLoaiThayDoi] = useState("CHUYEN_NHUONG");
    const [ngayYeuCau, setNgayYeuCau] = useState(dayjs());
    const [ngayGhiNhan, setNgayGhiNhan] = useState(null);
    const [lanChuyenQuyen, setLanChuyenQuyen] = useState(1);
    const [trangThaiDuyet, setTrangThaiDuyet] = useState(0);
    const [ngayTuChoi, setNgayTuChoi] = useState(null);
    const [lyDoTuChoi, setLyDoTuChoi] = useState("");
    const [ghiChu, setGhiChu] = useState("");

    // Mục (II) Thông tin bổ sung Người nộp đơn mới + Người nộp đơn thứ hai
    const [loaiHinhMoi, setLoaiHinhMoi] = useState("");
    const [maSoThueMoi, setMaSoThueMoi] = useState("");
    const [maQuocTichMoi, setMaQuocTichMoi] = useState("");
    const [dienThoaiMoi, setDienThoaiMoi] = useState("");
    const [emailMoi, setEmailMoi] = useState("");
    const [nguoiNopThuHaiTen, setNguoiNopThuHaiTen] = useState("");
    const [nguoiNopThuHaiDiaChi, setNguoiNopThuHaiDiaChi] = useState("");
    const [nguoiNopThuHaiDienThoai, setNguoiNopThuHaiDienThoai] = useState("");
    const [nguoiNopThuHaiEmail, setNguoiNopThuHaiEmail] = useState("");

    // Mục (III) Đại diện & Giấy ủy quyền
    const [daiDienSHTT, setDaiDienSHTT] = useState("Công ty tư vấn SHTT IPAC");
    const [idGUQ, setIdGUQ] = useState(null);
    const [giayUyQuyenGoc, setGiayUyQuyenGoc] = useState(true);
    const [maUyQuyen, setMaUyQuyen] = useState("");

    // Mục (VI) Danh mục tài liệu kèm theo
    const [taiLieuCQ, setTaiLieuCQ] = useState([]);

    useEffect(() => {
        fetchCustomers();
        fetchGUQs();
        if (isEdit && id) {
            fetchEditDetail();
        } else if (maDonDangKy) {
            fetchAppDetail(maDonDangKy);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maDonDangKy, id, isEdit, isKH]);

    const fetchCustomers = async () => {
        try {
            const res = await callAPI({ method: "post", endpoint: "/customers/by-name", data: {} });
            const raw = Array.isArray(res) ? res : res?.data || [];
            setCustomers(raw);
        } catch (error) {
            console.error("Lỗi khi tải danh sách khách hàng:", error);
        }
    };

    const fetchGUQs = async () => {
        try {
            const res = await callAPI({ method: "post", endpoint: "/power-of-attorney/list", data: { pageSize: 500 } });
            const raw = Array.isArray(res) ? res : res?.data || [];
            setGuqList(raw);
        } catch {
            // Optional
        }
    };

    const fetchAppDetail = async (maDon) => {
        setLoading(true);
        try {
            const raw = await callAPI({
                method: "post",
                endpoint: appFullDetailEndpoint,
                data: { maDonDangKy: maDon },
            });
            const res = raw?.data ?? raw;
            if (res) {
                setAppDetail(res);
                setTargetMaDonGoc(maDon);
                if (res.daiDienSHTT) setDaiDienSHTT(res.daiDienSHTT);
                if (res.idGUQ) setIdGUQ(res.idGUQ);
                if (res.giayUyQuyenGoc !== undefined && res.giayUyQuyenGoc !== null) {
                    setGiayUyQuyenGoc(Boolean(res.giayUyQuyenGoc));
                }
                if (res.maUyQuyen) setMaUyQuyen(res.maUyQuyen);
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin đơn đăng ký:", error);
            message.error("Không thể tải thông tin đơn đăng ký.");
        } finally {
            setLoading(false);
        }
    };

    const fetchEditDetail = async () => {
        setLoading(true);
        try {
            const res = await callAPI({
                method: "post",
                endpoint: `${apiPrefix}/detail`,
                data: { id: Number(id) },
            });
            if (res) {
                setAppDetail(res.donGoc || null);
                setTargetMaDonGoc(res.maDonDangKyGoc || "");
                setCustomerId(res.idKhachHang || res.khachHangMoi?.id || null);
                setSoDonChuyenQuyen(res.soDon || "");
                setLoaiThayDoi(res.loaiThayDoi || "CHUYEN_NHUONG");
                setNgayYeuCau(res.ngayYeuCau ? dayjs(res.ngayYeuCau) : null);
                setNgayGhiNhan(Number(res.trangThaiDuyet) === 1 && res.ngayGhiNhanCQ ? dayjs(res.ngayGhiNhanCQ) : null);
                setLanChuyenQuyen(res.lanChuyenQuyen || 1);
                setTrangThaiDuyet(Number(res.trangThaiDuyet ?? 0));
                setNgayTuChoi(res.ngayTuChoi ? dayjs(res.ngayTuChoi) : null);
                setLyDoTuChoi(res.lyDoTuChoi || "");
                setGhiChu(res.moTa || res.noiDung || "");
                setIdGUQ(res.idGUQ || null);
                if (res.giayUyQuyenGoc !== undefined && res.giayUyQuyenGoc !== null) {
                    setGiayUyQuyenGoc(Boolean(res.giayUyQuyenGoc));
                }
                setMaUyQuyen(res.maUyQuyen || "");

                const dl = parseObj(res.duLieuThayDoi);
                if (dl.daiDienSHTT) setDaiDienSHTT(dl.daiDienSHTT);
                else if (res.donGoc?.daiDienSHTT) setDaiDienSHTT(res.donGoc.daiDienSHTT);

                const npm = dl.nguoiNopDonMoi || {};
                setLoaiHinhMoi(npm.loaiHinh || "");
                setMaSoThueMoi(npm.maSoThueHoacCCCD || "");
                setMaQuocTichMoi(npm.maQuocTich || "");
                setDienThoaiMoi(npm.dienThoai || "");
                setEmailMoi(npm.email || "");

                const np2 = dl.nguoiNopDonThuHai || {};
                setNguoiNopThuHaiTen(np2.tenDayDu || "");
                setNguoiNopThuHaiDiaChi(np2.diaChi || "");
                setNguoiNopThuHaiDienThoai(np2.dienThoai || "");
                setNguoiNopThuHaiEmail(np2.email || "");

                setTaiLieuCQ(Array.isArray(res.taiLieuCQ) ? res.taiLieuCQ : Array.isArray(dl.taiLieuCQ) ? dl.taiLieuCQ : []);
            }
        } catch (error) {
            console.error("Lỗi khi tải chi tiết tờ khai chuyển quyền sở hữu:", error);
            showError("Thất bại", "Không thể tải chi tiết tờ khai chuyển quyền sở hữu.", error);
        } finally {
            setLoading(false);
        }
    };

    const selectedCustomer = customers.find((c) => Number(c.id) === Number(customerId)) || null;

    const addDocRow = (tenTaiLieu = "") => {
        setTaiLieuCQ((prev) => [...prev, { tenTaiLieu, trangThai: "Chưa nộp", linkTaiLieu: "" }]);
    };

    const updateDocRow = (idx, patch) => {
        setTaiLieuCQ((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
    };

    const removeDocRow = (idx) => {
        setTaiLieuCQ((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async () => {
        if (!customerId) {
            message.error("Vui lòng chọn khách hàng nhận chuyển quyền.");
            return;
        }

        const st = Number(trangThaiDuyet);
        const cleanSoDonCQ = st === 2 ? null : (soDonChuyenQuyen.trim() || null);
        const duLieuThayDoi = {
            idKhachHang: Number(customerId),
            maKhachHangMoi: Number(customerId),
            tenKhachHangMoi: selectedCustomer?.tenKhachHang || undefined,
            daiDienSHTT: daiDienSHTT.trim() || "Công ty tư vấn SHTT IPAC",
            nguoiNopDonMoi: {
                loaiHinh: loaiHinhMoi || null,
                maSoThueHoacCCCD: maSoThueMoi.trim() || null,
                maQuocTich: maQuocTichMoi.trim() || null,
                dienThoai: dienThoaiMoi.trim() || selectedCustomer?.sdt || null,
                email: emailMoi.trim() || null,
            },
            nguoiNopDonThuHai: nguoiNopThuHaiTen.trim()
                ? {
                      tenDayDu: nguoiNopThuHaiTen.trim(),
                      diaChi: nguoiNopThuHaiDiaChi.trim() || null,
                      dienThoai: nguoiNopThuHaiDienThoai.trim() || null,
                      email: nguoiNopThuHaiEmail.trim() || null,
                  }
                : null,
            taiLieuCQ: taiLieuCQ
                .filter((d) => d.tenTaiLieu && d.tenTaiLieu.trim())
                .map((d) => ({
                    tenTaiLieu: d.tenTaiLieu.trim(),
                    trangThai: d.trangThai || (d.linkTaiLieu ? "Đã nộp" : "Chưa nộp"),
                    linkTaiLieu: d.linkTaiLieu || null,
                })),
        };

        setSubmitting(true);
        try {
            const payload = {
                ...(isEdit ? { id: Number(id) } : {}),
                maHoSo: appDetail?.maHoSoVuViec || appDetail?.maHoSo || "",
                maDonDangKyCu: targetMaDonGoc,
                maDonDangKyGoc: targetMaDonGoc,
                maKhachHangMoi: Number(customerId),
                idKhachHang: Number(customerId),
                soDonChuyenQuyen: cleanSoDonCQ,
                soDon: cleanSoDonCQ,
                loaiThayDoi,
                ngayYeuCauChuyenQuyen: ngayYeuCau ? ngayYeuCau.format("YYYY-MM-DD") : null,
                ngayYeuCau: ngayYeuCau ? ngayYeuCau.format("YYYY-MM-DD") : null,
                ngayGhiNhanChuyenQuyen: st === 1 && ngayGhiNhan ? ngayGhiNhan.format("YYYY-MM-DD") : null,
                ngayGhiNhanCQ: st === 1 && ngayGhiNhan ? ngayGhiNhan.format("YYYY-MM-DD") : null,
                ngayChapThuan: st === 1 && ngayGhiNhan ? ngayGhiNhan.format("YYYY-MM-DD") : null,
                lanChuyenQuyen: Number(lanChuyenQuyen) || 1,
                trangThaiDuyet: st,
                ngayTuChoi: st === 2 && ngayTuChoi ? ngayTuChoi.format("YYYY-MM-DD") : null,
                lyDoTuChoi: st === 2 ? lyDoTuChoi.trim() || null : null,
                ghiChu: ghiChu.trim(),
                moTa: ghiChu.trim(),
                daiDienSHTT: daiDienSHTT.trim() || "Công ty tư vấn SHTT IPAC",
                idGUQ: idGUQ ? Number(idGUQ) : null,
                giayUyQuyenGoc: Boolean(giayUyQuyenGoc),
                maUyQuyen: !giayUyQuyenGoc ? maUyQuyen.trim() || null : null,
                duLieuThayDoi,
            };

            if (isEdit) {
                await callAPI({
                    method: "put",
                    endpoint: `${apiPrefix}/update`,
                    data: payload,
                });
                await showSuccess("Thành công!", "Cập nhật tờ khai chuyển quyền sở hữu thành công!");
                navigate(`${detailPathPrefix}/${id}`);
            } else {
                await callAPI({
                    method: "post",
                    endpoint: `${apiPrefix}/add`,
                    data: payload,
                });
                await showSuccess("Thành công!", "Tạo đơn chuyển quyền sở hữu thành công!");
                navigate(listPath);
            }
        } catch (error) {
            console.error("Lỗi khi lưu đơn chuyển quyền sở hữu:", error);
            showError("Thất bại!", "Đã xảy ra lỗi khi lưu đơn chuyển quyền sở hữu.", error);
        } finally {
            setSubmitting(false);
        }
    };

    const currentOwnerName = appDetail?.khachHang?.tenKhachHang || appDetail?.tenKhachHang || "—";
    const currentOwnerAddr = appDetail?.khachHang?.diaChi || appDetail?.diaChi || "";
    const currentBrandName = appDetail?.nhanHieu?.tenNhanHieu || appDetail?.tenNhanHieu || "—";
    const currentBrandImg = appDetail?.nhanHieu?.linkAnh || appDetail?.linkAnh || "";
    const currentAgent = appDetail?.daiDienSHTT || appDetail?.doitac?.tenDoiTac || appDetail?.tenDoiTac || "—";
    const currentSpdvList = Array.isArray(appDetail?.maSPDVList)
        ? appDetail.maSPDVList
        : Array.isArray(appDetail?.DonDK_SPDVs)
        ? appDetail.DonDK_SPDVs.map((s) => s.maSPDV)
        : Array.isArray(appDetail?.DonDK_SPDV_KH)
        ? appDetail.DonDK_SPDV_KH.map((s) => s.maSPDV)
        : [];

    return (
        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center min-h-screen">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-5xl">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 uppercase m-0">
                        📌 {isEdit ? "CẬP NHẬT TỜ KHAI CHUYỂN QUYỀN SỞ HỮU" : "TẠO ĐƠN CHUYỂN QUYỀN SỞ HỮU ĐƠN ĐĂNG KÝ NHÃN HIỆU"}
                    </h2>
                    <img
                        src={isKH ? FLAG_KH : FLAG_VN}
                        alt={isKH ? "Cờ Campuchia" : "Cờ Việt Nam"}
                        className="w-16 h-11 object-cover rounded shadow-sm"
                    />
                </div>

                <Spin spinning={loading} tip="Đang tải dữ liệu...">
                    {/* Khối thông tin đơn đăng ký hiện tại */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6 text-left">
                        <h3 className="text-base font-semibold text-[#009999] uppercase mb-3 border-b pb-2">
                            (I) Thông tin đơn đăng ký được chuyển quyền sở hữu
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500 font-medium">Số đơn: </span>
                                <span className="font-semibold text-indigo-700">{appDetail?.soDon || "—"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Mã hồ sơ: </span>
                                <span className="font-semibold text-gray-800">
                                    {appDetail?.maHoSoVuViec || appDetail?.maHoSo || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Chủ đơn hiện tại (Bên chuyển quyền): </span>
                                <span className="font-semibold text-gray-800">{currentOwnerName}</span>
                                {currentOwnerAddr && (
                                    <div className="text-xs text-gray-500 mt-0.5">{currentOwnerAddr}</div>
                                )}
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Đại diện SHCN: </span>
                                <span className="font-semibold text-gray-800">{currentAgent}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div>
                                    <span className="text-gray-500 font-medium">Tên nhãn hiệu: </span>
                                    <span className="font-semibold text-gray-800">{currentBrandName}</span>
                                </div>
                                {currentBrandImg && (
                                    <img
                                        src={currentBrandImg}
                                        alt="Nhãn hiệu"
                                        className="h-10 rounded border object-contain bg-white"
                                    />
                                )}
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Ngày nộp đơn: </span>
                                <span className="font-semibold text-gray-800">
                                    {appDetail?.ngayNopDon ? dayjs(appDetail.ngayNopDon).format("DD/MM/YYYY") : "—"}
                                </span>
                            </div>
                            {currentSpdvList.length > 0 && (
                                <div className="md:col-span-2">
                                    <span className="text-gray-500 font-medium">Nhóm SP/DV hiện hành: </span>
                                    <span className="font-medium text-gray-800">{currentSpdvList.join(", ")}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Khối thông tin tờ khai chuyển quyền sở hữu */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-5 text-left">
                        <h3 className="text-base font-semibold text-[#009999] uppercase border-b pb-2 m-0">
                            Thông tin Tờ khai chuyển quyền sở hữu
                        </h3>

                        {/* Cơ sở / Hình thức thay đổi người nộp đơn (Mẫu số 11 - Mục I) */}
                        <div className="p-4 rounded-lg border border-teal-200 bg-teal-50/40">
                            <label className="block text-gray-800 font-semibold text-sm mb-2">
                                Hình thức thay đổi người nộp đơn <span className="text-red-500">*</span>
                            </label>
                            <Radio.Group
                                value={loaiThayDoi}
                                onChange={(e) => setLoaiThayDoi(e.target.value)}
                                className="flex flex-col gap-2"
                            >
                                {LOAI_THAY_DOI_OPTIONS.map((opt) => (
                                    <Radio key={opt.value} value={opt.value} className="whitespace-normal">
                                        {opt.label}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium text-sm mb-1">
                                    Số đơn chuyển quyền sở hữu
                                </label>
                                <Input
                                    value={soDonChuyenQuyen}
                                    onChange={(e) => setSoDonChuyenQuyen(e.target.value)}
                                    placeholder="Nhập số đơn ghi nhận (CĐxxxx)"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium text-sm mb-1">
                                    Ngày yêu cầu chuyển quyền
                                </label>
                                <DatePicker
                                    className="w-full"
                                    format="DD/MM/YYYY"
                                    value={ngayYeuCau}
                                    onChange={(d) => setNgayYeuCau(d)}
                                    placeholder="Chọn ngày yêu cầu"
                                />
                            </div>
                            {isEdit && (
                                <div>
                                    <label className="block text-gray-700 font-medium text-sm mb-1">
                                        Lần chuyển quyền
                                    </label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={lanChuyenQuyen}
                                        onChange={(e) => setLanChuyenQuyen(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* (II) Người nộp đơn mới (Bên nhận chuyển quyền) */}
                        <div className="border-t pt-4 space-y-3">
                            <div className="font-semibold text-gray-800 text-sm uppercase">
                                (II) Người nộp đơn mới (Bên nhận chuyển quyền)
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium text-sm mb-1">
                                    Khách hàng nhận chuyển quyền <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    className="w-full"
                                    placeholder="Chọn khách hàng nhận chuyển quyền"
                                    value={customerId}
                                    onChange={(val) => setCustomerId(val)}
                                    showSearch
                                    optionFilterProp="label"
                                    filterOption={(input, option) =>
                                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={customers.map((c) => ({
                                        value: c.id,
                                        label: `${c.tenKhachHang}${c.maKhachHang ? ` (${c.maKhachHang})` : ""}`,
                                    }))}
                                />
                                {selectedCustomer && (
                                    <div className="mt-2 p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-1">
                                        <div><b>Mã KH:</b> {selectedCustomer.maKhachHang || "—"}</div>
                                        <div><b>SĐT:</b> {selectedCustomer.sdt || "—"}</div>
                                        <div className="md:col-span-2"><b>Địa chỉ:</b> {selectedCustomer.diaChi || "—"}</div>
                                    </div>
                                )}
                            </div>

                            <Collapse
                                ghost
                                size="small"
                                items={[
                                    {
                                        key: "extra_applicant",
                                        label: (
                                            <span className="text-xs font-medium text-blue-600">
                                                + Thông tin bổ sung Người nộp đơn mới & Người nộp đơn thứ hai (tùy chọn)
                                            </span>
                                        ),
                                        children: (
                                            <div className="space-y-3 bg-gray-50 p-3 rounded border">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Loại hình</label>
                                                        <Select
                                                            className="w-full"
                                                            allowClear
                                                            placeholder="Chọn loại hình"
                                                            value={loaiHinhMoi || undefined}
                                                            onChange={(v) => setLoaiHinhMoi(v || "")}
                                                            options={LOAI_HINH_OPTIONS}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Mã số thuế / CCCD</label>
                                                        <Input
                                                            value={maSoThueMoi}
                                                            onChange={(e) => setMaSoThueMoi(e.target.value)}
                                                            placeholder="Nhập MST hoặc CCCD"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Mã quốc tịch (ST.3)</label>
                                                        <Input
                                                            value={maQuocTichMoi}
                                                            onChange={(e) => setMaQuocTichMoi(e.target.value)}
                                                            placeholder="VD: VN, US, JP..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Điện thoại</label>
                                                        <Input
                                                            value={dienThoaiMoi}
                                                            onChange={(e) => setDienThoaiMoi(e.target.value)}
                                                            placeholder="Điện thoại liên hệ"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs text-gray-600 mb-1">Email</label>
                                                        <Input
                                                            value={emailMoi}
                                                            onChange={(e) => setEmailMoi(e.target.value)}
                                                            placeholder="Email người nộp đơn mới"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="border-t pt-3">
                                                    <div className="text-xs font-semibold text-gray-700 mb-2">
                                                        Người nộp đơn thứ hai (nếu có)
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <Input
                                                            value={nguoiNopThuHaiTen}
                                                            onChange={(e) => setNguoiNopThuHaiTen(e.target.value)}
                                                            placeholder="Tên đầy đủ người nộp đơn thứ hai"
                                                        />
                                                        <Input
                                                            value={nguoiNopThuHaiDiaChi}
                                                            onChange={(e) => setNguoiNopThuHaiDiaChi(e.target.value)}
                                                            placeholder="Địa chỉ"
                                                        />
                                                        <Input
                                                            value={nguoiNopThuHaiDienThoai}
                                                            onChange={(e) => setNguoiNopThuHaiDienThoai(e.target.value)}
                                                            placeholder="Điện thoại"
                                                        />
                                                        <Input
                                                            value={nguoiNopThuHaiEmail}
                                                            onChange={(e) => setNguoiNopThuHaiEmail(e.target.value)}
                                                            placeholder="Email"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </div>

                        {/* (III) Đại diện & Giấy ủy quyền */}
                        <div className="border-t pt-4 space-y-3">
                            <div className="font-semibold text-gray-800 text-sm uppercase">
                                (III) Đại diện của người nộp đơn & Giấy ủy quyền
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium text-sm mb-1">
                                        Tổ chức đại diện SHCN
                                    </label>
                                    <Input
                                        value={daiDienSHTT}
                                        onChange={(e) => setDaiDienSHTT(e.target.value)}
                                        placeholder="Công ty tư vấn SHTT IPAC"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium text-sm mb-1">
                                        Giấy ủy quyền (GUQ)
                                    </label>
                                    <Select
                                        className="w-full"
                                        allowClear
                                        showSearch
                                        placeholder="Chọn Giấy ủy quyền (nếu có)"
                                        value={idGUQ || undefined}
                                        onChange={(v) => setIdGUQ(v || null)}
                                        optionFilterProp="label"
                                        options={guqList.map((g) => ({
                                            value: g.id,
                                            label: `${g.soGUQ || `GUQ #${g.id}`}${g.soDonGoc ? ` (Đơn gốc: ${g.soDonGoc})` : ""}`,
                                        }))}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <Radio.Group
                                        value={Boolean(giayUyQuyenGoc)}
                                        onChange={(e) => setGiayUyQuyenGoc(Boolean(e.target.value))}
                                    >
                                        <Radio value={true}>Bản gốc GUQ</Radio>
                                        <Radio value={false}>Bản sao GUQ</Radio>
                                    </Radio.Group>
                                </div>
                                {!giayUyQuyenGoc && (
                                    <div>
                                        <Input
                                            value={maUyQuyen}
                                            onChange={(e) => setMaUyQuyen(e.target.value)}
                                            placeholder="Nhập số đơn chứa GUQ gốc"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trạng thái xét duyệt của Cục SHTT */}
                        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/40 space-y-3">
                            <label className="block font-semibold text-gray-800 text-left text-sm">
                                Trạng thái xét duyệt tờ khai chuyển quyền sở hữu
                            </label>
                            <Radio.Group
                                value={Number(trangThaiDuyet)}
                                onChange={(e) => {
                                    const nextVal = Number(e.target.value);
                                    setTrangThaiDuyet(nextVal);
                                    if (nextVal === 2) setSoDonChuyenQuyen("");
                                }}
                                className="flex flex-wrap gap-4"
                            >
                                <Radio value={0}>⏳ Chưa chấp thuận</Radio>
                                <Radio value={1}>✅ Được chấp thuận</Radio>
                                <Radio value={2}>❌ Từ chối</Radio>
                            </Radio.Group>

                            {Number(trangThaiDuyet) === 1 && (
                                <div className="pt-2 max-w-md">
                                    <label className="block text-gray-700 font-medium text-sm mb-1">
                                        Ngày ghi nhận chuyển quyền sở hữu
                                    </label>
                                    <DatePicker
                                        className="w-full"
                                        format="DD/MM/YYYY"
                                        value={ngayGhiNhan}
                                        onChange={(d) => setNgayGhiNhan(d)}
                                        placeholder="Chọn ngày ghi nhận"
                                    />
                                </div>
                            )}

                            {Number(trangThaiDuyet) === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-gray-700 font-medium text-sm mb-1">
                                            Ngày Cục từ chối
                                        </label>
                                        <DatePicker
                                            className="w-full"
                                            format="DD/MM/YYYY"
                                            value={ngayTuChoi}
                                            onChange={(d) => setNgayTuChoi(d)}
                                            placeholder="Chọn ngày từ chối"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium text-sm mb-1">
                                            Lý do từ chối
                                        </label>
                                        <Input
                                            value={lyDoTuChoi}
                                            onChange={(e) => setLyDoTuChoi(e.target.value)}
                                            placeholder="Nhập lý do từ chối"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* (VI) Danh mục tài liệu kèm theo */}
                        <div className="border-t pt-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold text-gray-800 text-sm uppercase">
                                    (VI) Danh mục tài liệu kèm theo
                                </span>
                                <button
                                    type="button"
                                    onClick={() => addDocRow("")}
                                    className="px-3 py-1 text-xs font-semibold rounded bg-[#009999] hover:bg-[#007a7a] text-white"
                                >
                                    + Thêm tài liệu
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {SUGGESTED_DOCS.map((docName) => (
                                    <button
                                        key={docName}
                                        type="button"
                                        onClick={() => addDocRow(docName)}
                                        className="px-2 py-0.5 text-xs rounded-full border border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100"
                                    >
                                        + {docName}
                                    </button>
                                ))}
                            </div>

                            {taiLieuCQ.length > 0 && (
                                <div className="space-y-2">
                                    {taiLieuCQ.map((doc, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-gray-50 p-2.5 rounded border"
                                        >
                                            <div className="md:col-span-5">
                                                <Input
                                                    size="small"
                                                    value={doc.tenTaiLieu}
                                                    onChange={(e) => updateDocRow(idx, { tenTaiLieu: e.target.value })}
                                                    placeholder="Tên tài liệu"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Select
                                                    size="small"
                                                    className="w-full"
                                                    value={doc.trangThai || "Chưa nộp"}
                                                    onChange={(v) => updateDocRow(idx, { trangThai: v })}
                                                    options={[
                                                        { value: "Đã nộp", label: "Đã nộp" },
                                                        { value: "Chưa nộp", label: "Chưa nộp" },
                                                    ]}
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <input
                                                    type="file"
                                                    className="text-xs w-full"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            readFileAsDataUrl(file, (dataUrl) => {
                                                                updateDocRow(idx, {
                                                                    linkTaiLieu: dataUrl,
                                                                    tenTaiLieu: doc.tenTaiLieu || file.name,
                                                                    trangThai: "Đã nộp",
                                                                });
                                                            });
                                                        }
                                                    }}
                                                />
                                                {doc.linkTaiLieu && (
                                                    <span className="text-[11px] text-emerald-600">✓ Đã đính kèm tệp</span>
                                                )}
                                            </div>
                                            <div className="md:col-span-1 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocRow(idx)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ghi chú */}
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-1">
                                Ghi chú
                            </label>
                            <Input.TextArea
                                rows={3}
                                value={ghiChu}
                                onChange={(e) => setGhiChu(e.target.value)}
                                placeholder="Nhập ghi chú thêm (nếu có)..."
                            />
                        </div>
                    </div>
                </Spin>

                {/* Nút hành động */}
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
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow transition disabled:opacity-50"
                    >
                        {submitting
                            ? "Đang lưu..."
                            : isEdit
                            ? "Lưu cập nhật"
                            : "Lưu đơn chuyển quyền sở hữu"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CQSHFormCore;
