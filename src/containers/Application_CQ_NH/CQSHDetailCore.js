import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { Spin, Modal, Radio, DatePicker, Input } from "antd";
import callAPI from "../../utils/api";
import { showSuccess, showError, showWarning } from "../../components/commom/Notification";

const FLAG_VN = "https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg";
const FLAG_KH = "https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg";

const fmtDate = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "—");

const parseObj = (raw) => {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
};

const DeadlineBadge = ({ date }) => {
    if (!date) return null;
    const diff = dayjs(date).startOf("day").diff(dayjs().startOf("day"), "day");
    let cls = "bg-emerald-100 text-emerald-800 border-emerald-300";
    let text = `Còn ${diff} ngày`;
    if (diff < 0) {
        cls = "bg-red-100 text-red-700 border-red-300";
        text = `Quá hạn ${Math.abs(diff)} ngày`;
    } else if (diff === 0) {
        cls = "bg-orange-100 text-orange-800 border-orange-300";
        text = "Hạn là hôm nay";
    } else if (diff <= 7) {
        cls = "bg-orange-100 text-orange-800 border-orange-300";
    }
    return (
        <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full border ${cls}`}>
            {text}
        </span>
    );
};

const Section = ({ title, children, extra }) => (
    <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#009999] pb-1.5 mb-3">
            <h3 className="text-base font-semibold text-[#009999] uppercase text-left m-0">
                {title}
            </h3>
            {extra}
        </div>
        {children}
    </div>
);

const Field = ({ label, children }) => (
    <div className="text-left text-sm text-gray-800">
        <span className="font-medium text-gray-600">{label}:</span>{" "}
        <span className="text-gray-900">{children ?? "—"}</span>
    </div>
);

const readFileAsDataUrl = (file, cb) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => cb(reader.result);
    reader.readAsDataURL(file);
};

const emptyRound = {
    id: null,
    soThongBao: "",
    ngayNhanThongBao: dayjs().format("YYYY-MM-DD"),
    hanTraLoi: null,
    noiDungThongBao: "",
    tenFileThongBao: "",
    linkFileThongBao: "",
    ngayTraLoi: null,
    noiDungTraLoi: "",
    tenFileTraLoi: "",
    linkFileTraLoi: "",
};

const LOAI_DON_LABEL = {
    1: "Đơn gốc ban đầu",
    2: "Đơn đã sửa đổi",
    3: "Đơn tách",
    4: "Đơn đã chuyển quyền sở hữu",
};

function CQSHDetailCore({ country = "VN" }) {
    const isKH = country === "KH";
    const navigate = useNavigate();
    const { id } = useParams();

    const apiPrefix = isKH ? "/application_cq_nh_kh" : "/application_cq_nh_vn";
    const listPath = isKH ? "/application_cq_nh_khlist" : "/application_cq_nh_vnlist";
    const detailPathPrefix = isKH ? "/application_cq_nh_kh_detail" : "/application_cq_nh_vn_detail";
    const editPathPrefix = isKH ? "/application_cq_nh_kh_edit" : "/application_cq_nh_vn_edit";
    const appDetailPathPrefix = isKH ? "/applicationdetail_kh" : "/applicationdetail";

    const [loading, setLoading] = useState(false);
    const [rec, setRec] = useState(null);

    const [approvalOpen, setApprovalOpen] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState(0);
    const [approvalSoDon, setApprovalSoDon] = useState("");
    const [approvalDate, setApprovalDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [rejectDate, setRejectDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [rejectReason, setRejectReason] = useState("");
    const [saving, setSaving] = useState(false);

    const [roundOpen, setRoundOpen] = useState(false);
    const [round, setRound] = useState(emptyRound);

    const loadDetail = useCallback(async () => {
        setLoading(true);
        try {
            const res = await callAPI({
                method: "post",
                endpoint: `${apiPrefix}/detail`,
                data: { id: Number(id) },
            });
            setRec(res);
        } catch (e) {
            console.error("Lỗi tải chi tiết đơn chuyển quyền sở hữu:", e);
            showError("Thất bại", "Không tải được thông tin đơn chuyển quyền sở hữu.", e);
        } finally {
            setLoading(false);
        }
    }, [id, apiPrefix]);

    useEffect(() => {
        loadDetail();
    }, [loadDetail]);

    if (!rec) {
        return (
            <div className="p-4 bg-gray-100 min-h-screen flex items-start justify-center">
                <Spin spinning={loading} tip="Đang tải thông tin đơn chuyển quyền sở hữu..." size="large">
                    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-5xl min-h-[240px] flex flex-col items-center justify-center gap-4">
                        <p className="text-gray-500">
                            {loading ? "Đang tải dữ liệu..." : "Không tìm thấy thông tin tờ khai chuyển quyền sở hữu."}
                        </p>
                        {!loading && (
                            <button
                                onClick={() => navigate(listPath)}
                                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg text-sm"
                            >
                                Quay lại danh sách
                            </button>
                        )}
                    </div>
                </Spin>
            </div>
        );
    }

    const st = Number(rec.trangThaiDuyet ?? 0);
    const duLieu = parseObj(rec.duLieuThayDoi);
    const donGoc = rec.donGoc || {};
    const donMoi = rec.donMoi || null;
    const khCu = donGoc.khachHang || {};
    const khMoi = rec.khachHangMoi || {};
    const npm = duLieu.nguoiNopDonMoi || {};
    const np2 = duLieu.nguoiNopDonThuHai || null;
    const phanHoiList = Array.isArray(rec.phanHoiList) ? rec.phanHoiList : [];
    const lichSuCQ = Array.isArray(rec.lichSuChuyenQuyen) ? rec.lichSuChuyenQuyen : [];
    const taiLieuCQ = Array.isArray(rec.taiLieuCQ)
        ? rec.taiLieuCQ
        : Array.isArray(duLieu.taiLieuCQ)
        ? duLieu.taiLieuCQ
        : [];
    const spdvRows = donGoc.DonDK_SPDV_KH || donGoc.DonDK_SPDVs || [];
    const loaiThayDoi = rec.loaiThayDoi || "CHUYEN_NHUONG";
    const guq = rec.giayUyQuyen || donGoc.GiayUyQuyen || null;

    const openApprovalModal = () => {
        setApprovalStatus(st);
        setApprovalSoDon(rec.soDon || "");
        setApprovalDate(
            rec.ngayGhiNhanCQ || rec.ngayChapThuan
                ? dayjs(rec.ngayGhiNhanCQ || rec.ngayChapThuan).format("YYYY-MM-DD")
                : dayjs().format("YYYY-MM-DD")
        );
        setRejectDate(
            rec.ngayTuChoi ? dayjs(rec.ngayTuChoi).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
        );
        setRejectReason(rec.lyDoTuChoi || "");
        setApprovalOpen(true);
    };

    const handleSaveApproval = async () => {
        setSaving(true);
        try {
            const targetState = Number(approvalStatus);
            const cleanSoDon = targetState === 2 ? null : (approvalSoDon.trim() || null);
            await callAPI({
                method: "post",
                endpoint: `${apiPrefix}/update`,
                data: {
                    id: rec.id,
                    trangThaiDuyet: targetState,
                    soDonChuyenQuyen: cleanSoDon,
                    soDon: cleanSoDon,
                    ngayGhiNhanCQ: targetState === 1 ? approvalDate : null,
                    ngayChapThuan: targetState === 1 ? approvalDate : null,
                    ngayTuChoi: targetState === 2 ? rejectDate : null,
                    lyDoTuChoi: targetState === 2 ? rejectReason : null,
                },
            });
            await showSuccess("Thành công", "Đã cập nhật trạng thái xét duyệt!");
            setApprovalOpen(false);
            loadDetail();
        } catch (e) {
            showError("Thất bại", "Không thể cập nhật trạng thái xét duyệt.", e);
        } finally {
            setSaving(false);
        }
    };

    const openNewRound = () => {
        setRound({ ...emptyRound, ngayNhanThongBao: dayjs().format("YYYY-MM-DD") });
        setRoundOpen(true);
    };

    const openEditRound = (r) => {
        setRound({
            id: r.id,
            soThongBao: r.soThongBao || "",
            ngayNhanThongBao: r.ngayNhanThongBao || dayjs().format("YYYY-MM-DD"),
            hanTraLoi: r.hanTraLoi || null,
            noiDungThongBao: r.noiDungThongBao || "",
            tenFileThongBao: r.tenFileThongBao || "",
            linkFileThongBao: r.linkFileThongBao || "",
            ngayTraLoi: r.ngayTraLoi || null,
            noiDungTraLoi: r.noiDungTraLoi || "",
            tenFileTraLoi: r.tenFileTraLoi || "",
            linkFileTraLoi: r.linkFileTraLoi || "",
        });
        setRoundOpen(true);
    };

    const handleSaveRound = async () => {
        if (!round.ngayNhanThongBao || !round.hanTraLoi) {
            showWarning("Thiếu thông tin", "Vui lòng nhập Ngày nhận thông báo và Hạn trả lời Cục.");
            return;
        }
        setSaving(true);
        try {
            await callAPI({
                method: "post",
                endpoint: `${apiPrefix}/phan-hoi/save`,
                data: {
                    ...round,
                    idDonCQSH: rec.id,
                },
            });
            await showSuccess("Thành công", "Đã lưu thông tin phản hồi với Cục SHTT.");
            setRoundOpen(false);
            loadDetail();
        } catch (e) {
            showError("Thất bại", "Không thể lưu vòng phản hồi.", e);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRound = (roundId) => {
        Modal.confirm({
            title: "Xác nhận xóa vòng thông báo?",
            content: "Hạn trả lời hiện hành của tờ khai sẽ được tự động cập nhật lại.",
            okText: "Xóa",
            cancelText: "Hủy",
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await callAPI({
                        method: "post",
                        endpoint: `${apiPrefix}/phan-hoi/delete`,
                        data: { id: roundId },
                    });
                    await showSuccess("Thành công", "Đã xóa vòng thông báo.");
                    loadDetail();
                } catch (e) {
                    showError("Thất bại", "Không thể xóa vòng thông báo.", e);
                }
            },
        });
    };

    const downloadDataUrl = (url, name) => {
        if (!url) return;
        const a = document.createElement("a");
        a.href = url;
        a.download = name || "tai_lieu";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="p-2 md:p-4 bg-gray-100 min-h-screen flex justify-center">
            <div className="bg-white p-5 md:p-8 rounded-xl shadow-md w-full max-w-5xl">
                <Spin spinning={loading}>
                    {/* Header */}
                    <div className="flex justify-between items-center gap-4 mb-4">
                        <div className="text-left">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 uppercase m-0">
                                📌 TỜ KHAI THAY ĐỔI NGƯỜI NỘP ĐƠN ĐĂNG KÝ NHÃN HIỆU
                            </h2>
                        </div>
                        <img
                            src={isKH ? FLAG_KH : FLAG_VN}
                            alt={isKH ? "Cờ Campuchia" : "Cờ Việt Nam"}
                            className="w-16 h-11 object-cover rounded shadow-sm flex-shrink-0"
                        />
                    </div>

                    {/* Banner trạng thái */}
                    {st === 1 && (
                        <div className="mb-4 p-4 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 text-left">
                            <div className="font-semibold text-base">✅ Được chấp thuận</div>
                            <div className="text-sm mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                <span>
                                    Ngày ghi nhận: <b>{fmtDate(rec.ngayGhiNhanCQ || rec.ngayChapThuan)}</b>
                                </span>
                                {rec.maDonDangKy && (
                                    <span>
                                        | Đơn sau chuyển quyền:{" "}
                                        <button
                                            type="button"
                                            className="text-teal-700 font-semibold underline"
                                            onClick={() => navigate(`${appDetailPathPrefix}/${rec.maDonDangKy}`)}
                                        >
                                            {donMoi?.soDon || rec.soDon || rec.maDonDangKy}
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {st === 2 && (
                        <div className="mb-4 p-4 rounded-lg border border-red-300 bg-red-50 text-red-900 text-left">
                            <div className="font-semibold text-base flex items-center gap-2 flex-wrap">
                                <span>❌ Bị từ chối</span>
                                {rec.tuDongTuChoi && (
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-200 text-red-800">
                                        Tự động từ chối do quá hạn
                                    </span>
                                )}
                            </div>
                            <div className="text-sm mt-1 space-y-0.5">
                                <div>
                                    Ngày từ chối: <b>{fmtDate(rec.ngayTuChoi)}</b>
                                </div>
                                {rec.lyDoTuChoi && (
                                    <div>
                                        Lý do: <span className="italic">{rec.lyDoTuChoi}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {st === 0 && (
                        <div className="mb-4 p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-left">
                            <div className="font-semibold text-base">⏳ Đang chờ Cục SHTT xét duyệt</div>
                            {rec.hanTraLoi && (
                                <div className="text-sm mt-1">
                                    Hạn trả lời Cục: <b>{fmtDate(rec.hanTraLoi)}</b>
                                    <DeadlineBadge date={rec.hanTraLoi} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Box định danh */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <Field label="Số đơn chuyển quyền sở hữu">
                            <span className="font-semibold text-[#009999]">{st === 2 ? "—" : (rec.soDon || "—")}</span>
                        </Field>
                        <Field label="Ngày yêu cầu">
                            <b>{fmtDate(rec.ngayYeuCau)}</b>
                        </Field>
                        <Field label="Lần chuyển quyền">
                            <b>Lần {rec.lanChuyenQuyen || 1}</b>
                        </Field>
                        <Field label="Mã hồ sơ vụ việc">
                            {rec.maHoSo || donGoc.maHoSoVuViec || donGoc.maHoSo || "—"}
                        </Field>
                        <Field label="Client ref's">
                            {donGoc.clientsRef || "—"}
                        </Field>
                        {st === 1 && (
                            <Field label="Ngày ghi nhận">
                                <span className="font-semibold text-emerald-700">
                                    {fmtDate(rec.ngayGhiNhanCQ || rec.ngayChapThuan)}
                                </span>
                            </Field>
                        )}
                    </div>

                    {/* (I) ĐƠN ĐĂNG KÝ NHÃN HIỆU YÊU CẦU GHI NHẬN THAY ĐỔI */}
                    <Section title="(I) Đơn đăng ký nhãn hiệu yêu cầu ghi nhận thay đổi">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <Field label="Loại đơn yêu cầu">
                                <span className="text-[#009999] font-medium">[✓] Đơn đăng ký nhãn hiệu</span>
                            </Field>
                            <Field label="Số đơn được chuyển quyền">
                                {rec.maDonDangKyGoc ? (
                                    <button
                                        type="button"
                                        className="text-indigo-600 font-semibold hover:underline"
                                        onClick={() => navigate(`${appDetailPathPrefix}/${rec.maDonDangKyGoc}`)}
                                    >
                                        {donGoc.soDon || rec.maDonDangKyGoc}
                                    </button>
                                ) : (
                                    "—"
                                )}
                            </Field>
                            <Field label="Ngày nộp đơn được chuyển quyền">{fmtDate(donGoc.ngayNopDon)}</Field>
                            <Field label="Phân loại đơn được chuyển quyền">
                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    {LOAI_DON_LABEL[Number(donGoc.loaiDon)] || "Đơn gốc ban đầu"}
                                </span>
                            </Field>
                            <Field label="Nhãn hiệu">
                                <div className="inline-flex items-center gap-2 align-middle">
                                    {donGoc.nhanHieu?.linkAnh ? (
                                        <img
                                            src={donGoc.nhanHieu.linkAnh}
                                            alt="Ảnh nhãn hiệu"
                                            className="h-10 rounded border object-contain bg-white"
                                        />
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">Không có ảnh</span>
                                    )}
                                    <span className="font-semibold">{donGoc.nhanHieu?.tenNhanHieu || "—"}</span>
                                </div>
                            </Field>
                            <Field label="Nhóm SP/DV hiện hành">
                                {spdvRows.length > 0
                                    ? spdvRows
                                          .map((s) =>
                                              s.SanPham_DichVu?.tenSPDV
                                                  ? `${s.maSPDV} (${s.SanPham_DichVu.tenSPDV})`
                                                  : s.maSPDV
                                          )
                                          .join(", ")
                                    : "—"}
                            </Field>
                        </div>

                        {/* Cơ sở thay đổi người nộp đơn */}
                        <div className="mt-4 p-3 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1.5 text-left text-sm">
                            <div className="font-medium text-gray-700 mb-1">Cơ sở thay đổi người nộp đơn:</div>
                            <div className={loaiThayDoi === "CHUYEN_NHUONG" ? "text-[#009999] font-semibold" : "text-gray-400"}>
                                {loaiThayDoi === "CHUYEN_NHUONG" ? "[✓]" : "[ ]"} Yêu cầu ghi nhận thay đổi người nộp đơn do chuyển nhượng đơn.
                            </div>
                            <div className={loaiThayDoi === "THUA_KE_KE_THUA" ? "text-[#009999] font-semibold" : "text-gray-400"}>
                                {loaiThayDoi === "THUA_KE_KE_THUA" ? "[✓]" : "[ ]"} Yêu cầu ghi nhận thay đổi người nộp đơn do thừa kế, kế thừa hoặc theo quyết định của cơ quan có thẩm quyền.
                            </div>
                        </div>

                        {/* Lịch sử chuyển quyền */}
                        {lichSuCQ.length > 0 && (
                            <div className="mt-4 p-3 rounded-lg border border-gray-200 bg-white text-left">
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Lịch sử chuyển quyền
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="px-2.5 py-1 rounded bg-gray-100 border text-gray-700 font-medium">
                                        Đơn gốc: {donGoc.soDon || rec.maDonDangKyGoc}
                                    </span>
                                    {lichSuCQ.map((item) => {
                                        const isCurrent = Number(item.id) === Number(rec.id);
                                        const itemSt = Number(item.trangThaiDuyet ?? 0);
                                        const icon = itemSt === 1 ? "✅" : itemSt === 2 ? "❌" : "⏳";
                                        return (
                                            <React.Fragment key={item.id}>
                                                <span className="text-gray-400">→</span>
                                                <button
                                                    type="button"
                                                    onClick={() => !isCurrent && navigate(`${detailPathPrefix}/${item.id}`)}
                                                    className={`px-2.5 py-1 rounded border font-medium transition ${
                                                        isCurrent
                                                            ? "bg-teal-50 border-[#009999] text-[#009999]"
                                                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {icon} CQ lần {item.lanChuyenQuyen || 1} ({item.soDon || "—"})
                                                    {item.tenKhachHangMoi ? ` — ${item.tenKhachHangMoi}` : ""}
                                                    {isCurrent ? " • Đang xem" : ""}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Section>

                    {/* (II) & (IV) ĐỐI CHIẾU BÊN CHUYỂN QUYỀN & NGƯỜI NỘP ĐƠN MỚI */}
                    <Section title="(II) Người nộp đơn mới & (IV) Bên chuyển quyền">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Bên chuyển quyền (Cũ - Mục IV Mẫu 11) */}
                            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-2 text-left">
                                <div className="text-xs font-bold text-gray-500 uppercase border-b pb-1">
                                    Bên thứ hai trong hợp đồng (Bên chuyển quyền / Chủ đơn cũ)
                                </div>
                                <Field label="Tên đầy đủ">
                                    <b>{khCu.tenKhachHang || "—"}</b>
                                </Field>
                                <Field label="Mã khách hàng">{khCu.maKhachHang || "—"}</Field>
                                <Field label="Địa chỉ">{khCu.diaChi || "—"}</Field>
                                <Field label="Quốc gia">
                                    {khCu.quocGia?.tenQuocGia || khCu.maQuocGia || "—"}
                                </Field>
                                <Field label="Điện thoại">{khCu.sdt || "—"}</Field>
                                {khCu.nguoiLienHe && <Field label="Người liên hệ">{khCu.nguoiLienHe}</Field>}
                            </div>

                            {/* Người nộp đơn mới (Bên nhận chuyển quyền - Mục II Mẫu 11) */}
                            <div className="p-4 rounded-lg border border-teal-300 bg-teal-50/40 space-y-2 text-left">
                                <div className="text-xs font-bold text-[#009999] uppercase border-b border-teal-200 pb-1">
                                    Người nộp đơn mới (Bên nhận chuyển quyền)
                                </div>
                                <Field label="Tên đầy đủ">
                                    <b className="text-teal-800">{khMoi.tenKhachHang || duLieu.tenKhachHangMoi || "—"}</b>
                                </Field>
                                <Field label="Mã khách hàng">{khMoi.maKhachHang || "—"}</Field>
                                <Field label="Địa chỉ">{khMoi.diaChi || "—"}</Field>
                                <Field label="Quốc gia / Quốc tịch">
                                    {[khMoi.quocGia?.tenQuocGia || khMoi.maQuocGia, npm.maQuocTich]
                                        .filter(Boolean)
                                        .join(" / ") || "—"}
                                </Field>
                                {npm.loaiHinh && <Field label="Loại hình">{npm.loaiHinh}</Field>}
                                {npm.maSoThueHoacCCCD && <Field label="MST / CCCD">{npm.maSoThueHoacCCCD}</Field>}
                                <Field label="Điện thoại">{npm.dienThoai || khMoi.sdt || "—"}</Field>
                                {npm.email && <Field label="Email">{npm.email}</Field>}
                            </div>
                        </div>

                        {np2 && np2.tenDayDu && (
                            <div className="mt-3 p-3 rounded-lg border border-gray-200 bg-white text-left space-y-1">
                                <div className="text-xs font-semibold text-gray-600 uppercase">
                                    Người nộp đơn thứ hai
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <Field label="Tên đầy đủ">{np2.tenDayDu}</Field>
                                    <Field label="Địa chỉ">{np2.diaChi || "—"}</Field>
                                    <Field label="Điện thoại">{np2.dienThoai || "—"}</Field>
                                    <Field label="Email">{np2.email || "—"}</Field>
                                </div>
                            </div>
                        )}
                    </Section>

                    {/* (III) ĐẠI DIỆN CỦA NGƯỜI NỘP ĐƠN */}
                    <Section title="(III) Đại diện của người nộp đơn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <Field label="Tổ chức đại diện SHCN">
                                <b>{duLieu.daiDienSHTT || donGoc.daiDienSHTT || "Công ty tư vấn SHTT IPAC"}</b>
                            </Field>
                            <Field label="Đối tác liên kết">
                                {donGoc.doitac?.tenDoiTac || "—"}
                            </Field>
                            <Field label="Giấy ủy quyền">
                                {rec.giayUyQuyenGoc === false
                                    ? `Bản sao GUQ${rec.maUyQuyen ? ` (Nộp theo đơn số: ${rec.maUyQuyen})` : ""}`
                                    : rec.giayUyQuyenGoc === true
                                    ? "Bản gốc GUQ"
                                    : "—"}
                            </Field>
                            <Field label="Số Giấy ủy quyền">
                                {guq?.soGUQ || (rec.idGUQ ? `GUQ #${rec.idGUQ}` : "—")}
                            </Field>
                        </div>
                    </Section>

                    {/* (V) QUÁ TRÌNH THẨM ĐỊNH & PHẢN HỒI VỚI CỤC SHTT */}
                    <Section
                        title="(V) Quá trình thẩm định & phản hồi với Cục SHTT"
                        extra={
                            st === 0 && (
                                <button
                                    type="button"
                                    onClick={openNewRound}
                                    className="px-3 py-1 text-xs font-semibold rounded bg-[#009999] hover:bg-[#007a7a] text-white"
                                >
                                    + Thêm thông báo / phản hồi
                                </button>
                            )
                        }
                    >
                        {phanHoiList.length === 0 ? (
                            <div className="p-4 rounded border border-dashed border-gray-300 text-sm text-gray-500 italic text-center">
                                Chưa có thông báo phản hồi nào từ Cục SHTT.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {phanHoiList.map((r) => {
                                    const answered = Boolean(r.ngayTraLoi);
                                    return (
                                        <div
                                            key={r.id}
                                            className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm text-left space-y-2"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-gray-800">
                                                        Lần thông báo #{r.lanThongBao}
                                                    </span>
                                                    {r.soThongBao && (
                                                        <span className="text-xs text-gray-500">
                                                            (Số TB: {r.soThongBao})
                                                        </span>
                                                    )}
                                                    {answered ? (
                                                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                                            ✓ Đã trả lời Cục
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                                                            ⏳ Chờ công ty trả lời
                                                        </span>
                                                    )}
                                                </div>
                                                {st === 0 && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditRound(r)}
                                                            className="px-2.5 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                                                        >
                                                            {answered ? "Sửa" : "Cập nhật trả lời"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteRound(r.id)}
                                                            className="px-2.5 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                <Field label="Ngày nhận thông báo">
                                                    <b>{fmtDate(r.ngayNhanThongBao)}</b>
                                                </Field>
                                                <Field label="Hạn trả lời Cục">
                                                    <b>{fmtDate(r.hanTraLoi)}</b>
                                                    {!answered && st === 0 && <DeadlineBadge date={r.hanTraLoi} />}
                                                </Field>
                                                <div className="md:col-span-2">
                                                    <Field label="Nội dung thông báo">
                                                        {r.noiDungThongBao || "—"}
                                                    </Field>
                                                </div>
                                                {r.linkFileThongBao && (
                                                    <div className="md:col-span-2">
                                                        <button
                                                            type="button"
                                                            className="text-xs text-blue-600 underline"
                                                            onClick={() =>
                                                                downloadDataUrl(
                                                                    r.linkFileThongBao,
                                                                    r.tenFileThongBao || `thong_bao_${r.lanThongBao}`
                                                                )
                                                            }
                                                        >
                                                            📎 Tải tệp thông báo ({r.tenFileThongBao || "file"})
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {(r.ngayTraLoi || r.noiDungTraLoi || r.linkFileTraLoi) && (
                                                <div className="pt-2 border-t border-gray-100 space-y-1 text-sm">
                                                    <Field label="Ngày công ty trả lời Cục">
                                                        <span className="font-semibold text-emerald-700">
                                                            {fmtDate(r.ngayTraLoi)}
                                                        </span>
                                                    </Field>
                                                    <Field label="Nội dung trả lời">
                                                        {r.noiDungTraLoi || "—"}
                                                    </Field>
                                                    {r.linkFileTraLoi && (
                                                        <div>
                                                            <button
                                                                type="button"
                                                                className="text-xs text-blue-600 underline"
                                                                onClick={() =>
                                                                    downloadDataUrl(
                                                                        r.linkFileTraLoi,
                                                                        r.tenFileTraLoi || `tra_loi_${r.lanThongBao}`
                                                                    )
                                                                }
                                                            >
                                                                📎 Tải tệp trả lời ({r.tenFileTraLoi || "file"})
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Section>

                    {/* (VI) DANH MỤC TÀI LIỆU KÈM THEO */}
                    <Section title="(VI) Danh mục tài liệu kèm theo đơn chuyển quyền sở hữu">
                        <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                            <thead className="bg-[#009999] text-white text-left">
                                <tr>
                                    <th className="px-3 py-2">Tên tài liệu</th>
                                    <th className="px-3 py-2 w-36">Trạng thái</th>
                                    <th className="px-3 py-2 w-40">Tệp đính kèm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taiLieuCQ.length > 0 ? (
                                    taiLieuCQ.map((tl, idx) => (
                                        <tr key={idx} className="border-b hover:bg-gray-50 text-left">
                                            <td className="px-3 py-2">{tl.tenTaiLieu}</td>
                                            <td className="px-3 py-2">{tl.trangThai || "—"}</td>
                                            <td className="px-3 py-2">
                                                {tl.linkTaiLieu ? (
                                                    <button
                                                        type="button"
                                                        className="text-blue-600 underline text-xs"
                                                        onClick={() => downloadDataUrl(tl.linkTaiLieu, tl.tenTaiLieu)}
                                                    >
                                                        Tải tài liệu
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Chưa có</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-3 py-4 text-center text-gray-400 italic">
                                            Không có tài liệu đính kèm
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {(rec.moTa || rec.noiDung) && (
                            <div className="mt-4 p-3 rounded bg-gray-50 border text-left text-sm">
                                <span className="font-medium text-gray-600">Ghi chú: </span>
                                <span className="text-gray-800 whitespace-pre-line">{rec.moTa || rec.noiDung}</span>
                            </div>
                        )}
                    </Section>

                    {/* Actions */}
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(listPath)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-5 py-2 rounded-lg"
                        >
                            Quay lại danh sách
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`${editPathPrefix}/${rec.id}`)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2 rounded-lg"
                        >
                            📝 Sửa tờ khai
                        </button>
                        <button
                            type="button"
                            onClick={openApprovalModal}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg"
                        >
                            ⚖️ Cập nhật xét duyệt
                        </button>
                    </div>
                </Spin>
            </div>

            {/* Modal Xét duyệt */}
            <Modal
                title="⚖️ Cập nhật kết quả xét duyệt Đơn chuyển quyền sở hữu"
                open={approvalOpen}
                onOk={handleSaveApproval}
                onCancel={() => setApprovalOpen(false)}
                confirmLoading={saving}
                okText="Lưu kết quả"
                cancelText="Hủy"
                width={560}
            >
                <div className="space-y-4">
                    <Radio.Group
                        value={Number(approvalStatus)}
                        onChange={(e) => setApprovalStatus(Number(e.target.value))}
                        className="flex flex-col gap-2"
                    >
                        <Radio value={0}>⏳ Chưa chấp thuận</Radio>
                        <Radio value={1}>✅ Được chấp thuận</Radio>
                        <Radio value={2}>❌ Từ chối</Radio>
                    </Radio.Group>

                    {Number(approvalStatus) === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số đơn ghi nhận chuyển giao
                                </label>
                                <Input
                                    value={approvalSoDon}
                                    onChange={(e) => setApprovalSoDon(e.target.value)}
                                    placeholder="Nhập số đơn ghi nhận (CĐxxxx)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày ghi nhận chuyển quyền sở hữu
                                </label>
                                <DatePicker
                                    value={approvalDate ? dayjs(approvalDate) : null}
                                    onChange={(d) => setApprovalDate(d ? d.format("YYYY-MM-DD") : null)}
                                    format="DD/MM/YYYY"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}

                    {Number(approvalStatus) === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày từ chối</label>
                                <DatePicker
                                    value={rejectDate ? dayjs(rejectDate) : null}
                                    onChange={(d) => setRejectDate(d ? d.format("YYYY-MM-DD") : null)}
                                    format="DD/MM/YYYY"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối</label>
                                <Input
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Nhập lý do từ chối"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Modal Thêm/Sửa vòng phản hồi */}
            <Modal
                title={round.id ? "Cập nhật thông báo & trả lời Cục SHTT" : "Thêm thông báo từ Cục SHTT"}
                open={roundOpen}
                onOk={handleSaveRound}
                onCancel={() => setRoundOpen(false)}
                confirmLoading={saving}
                okText="Lưu"
                cancelText="Hủy"
                width={650}
            >
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Số thông báo</label>
                            <Input
                                value={round.soThongBao}
                                onChange={(e) => setRound((p) => ({ ...p, soThongBao: e.target.value }))}
                                placeholder="VD: 1234/TB-SHTT"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Ngày nhận thông báo *
                            </label>
                            <DatePicker
                                className="w-full"
                                format="DD/MM/YYYY"
                                value={round.ngayNhanThongBao ? dayjs(round.ngayNhanThongBao) : null}
                                onChange={(d) =>
                                    setRound((p) => ({
                                        ...p,
                                        ngayNhanThongBao: d ? d.format("YYYY-MM-DD") : null,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Hạn trả lời Cục *
                            </label>
                            <DatePicker
                                className="w-full"
                                format="DD/MM/YYYY"
                                value={round.hanTraLoi ? dayjs(round.hanTraLoi) : null}
                                onChange={(d) =>
                                    setRound((p) => ({
                                        ...p,
                                        hanTraLoi: d ? d.format("YYYY-MM-DD") : null,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nội dung thông báo</label>
                        <Input.TextArea
                            rows={2}
                            value={round.noiDungThongBao}
                            onChange={(e) => setRound((p) => ({ ...p, noiDungThongBao: e.target.value }))}
                            placeholder="Nhập nội dung thông báo của Cục..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tệp thông báo đính kèm</label>
                        <input
                            type="file"
                            className="text-xs"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    readFileAsDataUrl(file, (url) =>
                                        setRound((p) => ({
                                            ...p,
                                            tenFileThongBao: file.name,
                                            linkFileThongBao: url,
                                        }))
                                    );
                                }
                            }}
                        />
                        {round.tenFileThongBao && (
                            <span className="ml-2 text-xs text-emerald-600">✓ {round.tenFileThongBao}</span>
                        )}
                    </div>

                    <div className="border-t pt-3 space-y-3">
                        <div className="font-semibold text-xs text-gray-700 uppercase">
                            Phần công ty trả lời Cục (nếu đã trả lời)
                        </div>
                        <div className="max-w-xs">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Ngày trả lời Cục</label>
                            <DatePicker
                                className="w-full"
                                format="DD/MM/YYYY"
                                value={round.ngayTraLoi ? dayjs(round.ngayTraLoi) : null}
                                onChange={(d) =>
                                    setRound((p) => ({
                                        ...p,
                                        ngayTraLoi: d ? d.format("YYYY-MM-DD") : null,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nội dung trả lời</label>
                            <Input.TextArea
                                rows={2}
                                value={round.noiDungTraLoi}
                                onChange={(e) => setRound((p) => ({ ...p, noiDungTraLoi: e.target.value }))}
                                placeholder="Nhập nội dung trả lời Cục..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tệp trả lời đính kèm</label>
                            <input
                                type="file"
                                className="text-xs"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        readFileAsDataUrl(file, (url) =>
                                            setRound((p) => ({
                                                ...p,
                                                tenFileTraLoi: file.name,
                                                linkFileTraLoi: url,
                                            }))
                                        );
                                    }
                                }}
                            />
                            {round.tenFileTraLoi && (
                                <span className="ml-2 text-xs text-emerald-600">✓ {round.tenFileTraLoi}</span>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default CQSHDetailCore;
