import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { Spin, Modal, Radio, DatePicker, Input, Switch } from "antd";
import callAPI from "../../utils/api";
import { showSuccess, showError, showWarning } from "../../components/commom/Notification";

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

function Application_SD_NH_KHDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [rec, setRec] = useState(null);
  const [onlyChanged, setOnlyChanged] = useState(true);

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
        endpoint: "/application_sd_nh_kh/detail",
        data: { id: Number(id) },
      });
      setRec(res);
    } catch (e) {
      console.error("Lỗi tải chi tiết đơn sửa đổi Campuchia:", e);
      showError("Thất bại", "Không tải được thông tin đơn sửa đổi.", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (!rec) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen flex items-start justify-center">
        <Spin spinning={loading} tip="Đang tải thông tin đơn sửa đổi..." size="large">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-5xl min-h-[240px] flex flex-col items-center justify-center gap-4">
            <p className="text-gray-500">
              {loading ? "Đang tải dữ liệu..." : "Không tìm thấy thông tin tờ khai sửa đổi."}
            </p>
            {!loading && (
              <button
                onClick={() => navigate("/application_sd_nh_khlist")}
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
  const rounds = Array.isArray(rec.lichSuPhanHoi) ? rec.lichSuPhanHoi : [];
  const openRound = [...rounds].reverse().find((r) => !r.ngayTraLoi);
  const hanTraLoi = st === 0 ? rec.hanTraLoi || openRound?.hanTraLoi : null;
  const dangChoTraLoiCuc = st === 0 && (rec.dangChoTraLoiCuc ?? !!openRound);
  const chain = Array.isArray(rec.chuoiSuaDoi) ? rec.chuoiSuaDoi : [];
  const taiLieuSuaDoi = Array.isArray(rec.taiLieuSuaDoi)
    ? rec.taiLieuSuaDoi
    : Array.isArray(duLieu.taiLieuSuaDoi)
    ? duLieu.taiLieuSuaDoi
    : [];

  const guqWrap = rec.giayUyQuyenSuaDoi || {};
  const guqGocFlag =
    guqWrap.giayUyQuyenGoc ?? rec.giayUyQuyenGoc ?? duLieu.giayUyQuyenGoc ?? donGoc.giayUyQuyenGoc;
  const guqMaUyQuyen =
    guqWrap.maUyQuyen || rec.maUyQuyen || duLieu.maUyQuyen || donGoc.maUyQuyen;
  const guqSoGUQ =
    guqWrap.giayUyQuyen?.soGUQ || rec.giayUyQuyen?.soGUQ || donGoc.GiayUyQuyen?.soGUQ || "";

  const ndKhac = rec.ndSuaDoiNoiDungKhac || duLieu.ndSuaDoiNoiDungKhac || "";
  const loaiDonGocText = LOAI_DON_LABEL[Number(donGoc.loaiDon)] || "Đơn gốc ban đầu";

  const spdvText = (don) =>
    (don?.DonDK_SPDV_KH || don?.DonDK_SPDVs || [])
      .map((s) => `${s.maSPDV}${s.SanPham_DichVu?.tenSPDV ? ` (${s.SanPham_DichVu.tenSPDV})` : ""}`)
      .join(", ");

  const khText = (don) =>
    don?.khachHang
      ? `${don.khachHang.tenKhachHang || ""}${
          don.khachHang.maKhachHang ? ` (${don.khachHang.maKhachHang})` : ""
        }`
      : "";

  const NhanCell = ({ don }) =>
    don?.nhanHieu ? (
      <div className="flex items-center gap-3">
        {don.nhanHieu.linkAnh ? (
          <img
            src={don.nhanHieu.linkAnh}
            alt="Ảnh nhãn hiệu"
            className="h-16 max-w-[120px] object-contain border rounded bg-white p-0.5 shadow-sm"
          />
        ) : (
          <span className="italic text-xs text-gray-400">Không có ảnh</span>
        )}
        <span className="font-medium">{don.nhanHieu.tenNhanHieu || "—"}</span>
      </div>
    ) : (
      <span>—</span>
    );

  const compareRows = [
    {
      flag: "suaDoiTenChuDon",
      label: "Tên chủ đơn",
      before: khText(donGoc),
      req: rec.ndSuaDoiTenChuDon,
      after: khText(donMoi),
    },
    {
      flag: "suaDoiDiaChi",
      label: "Địa chỉ chủ đơn",
      before: donGoc.khachHang?.diaChi,
      req: rec.ndSuaDoiDiaChi,
      after: donMoi?.khachHang?.diaChi,
    },
    {
      flag: "suaDoiDaiDien",
      label: "Tổ chức đại diện SHCN",
      before: donGoc.daiDienSHTT,
      req: rec.ndSuaDoiDaiDien,
      after: donMoi?.daiDienSHTT,
    },
    {
      flag: "suaNhan",
      label: "Mẫu nhãn hiệu / Tên nhãn hiệu",
      before: <NhanCell don={donGoc} />,
      req: rec.ndSuaNhan,
      after: donMoi ? <NhanCell don={donMoi} /> : null,
    },
    {
      flag: "suaNhomSPDV",
      label: "Danh mục hàng hóa, dịch vụ (Nhóm SP/DV)",
      before: spdvText(donGoc),
      req: rec.ndSuaNhomSPDV,
      after: spdvText(donMoi),
    },
    {
      flag: "suaDoiNoiDungKhac",
      label: "Nội dung khác",
      before: "—",
      req: ndKhac,
      after: st === 1 && rec.suaDoiNoiDungKhac ? "Đã ghi nhận theo quyết định duyệt" : null,
    },
  ];
  const shownRows = compareRows.filter((r) => !onlyChanged || Boolean(rec[r.flag]));

  const renderStatusBanner = () => {
    if (st === 1) {
      return (
        <div className="p-4 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 text-left">
          <div className="font-semibold text-base">✅ Được chấp thuận</div>
          <div className="text-sm mt-1">
            Ngày ghi nhận sửa đổi: <b>{fmtDate(rec.ngayGhiNhanSuaDoi || rec.ngayChapThuan)}</b>
            {donMoi && (
              <>
                {" "}
                | Đơn sau sửa đổi:{" "}
                <span
                  className="text-emerald-700 font-semibold underline cursor-pointer"
                  onClick={() => navigate(`/applicationdetail_kh/${donMoi.maDonDangKy}`)}
                >
                  {donMoi.soDon || donMoi.maDonDangKy}
                </span>
              </>
            )}
          </div>
        </div>
      );
    }
    if (st === 2) {
      return (
        <div className="p-4 rounded-lg border border-red-300 bg-red-50 text-red-800 text-left">
          <div className="font-semibold text-base flex items-center flex-wrap gap-2">
            <span>❌ Bị từ chối</span>
            {rec.tuDongTuChoi && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-200 text-red-900 border border-red-300">
                Quá hạn trả lời
              </span>
            )}
          </div>
          <div className="text-sm mt-1">
            Ngày từ chối: <b>{fmtDate(rec.ngayTuChoi)}</b>
            {rec.lyDoTuChoi && (
              <>
                {" "}
                | Lý do: <b>{rec.lyDoTuChoi}</b>
              </>
            )}
          </div>
        </div>
      );
    }
    if (dangChoTraLoiCuc) {
      return (
        <div className="p-4 rounded-lg border border-orange-300 bg-orange-50 text-orange-900 text-left">
          <div className="font-semibold text-base">
            ⚠️ Đang chờ Công ty trả lời Thông báo Cục (Lần {openRound?.lanThongBao || rounds.length || 1})
          </div>
          <div className="text-sm mt-1">
            Hạn trả lời Cục: <b>{fmtDate(hanTraLoi)}</b>
            <DeadlineBadge date={hanTraLoi} />
          </div>
        </div>
      );
    }
    return (
      <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-left">
        <div className="font-semibold text-base">⏳ Đang chờ Cục xét duyệt</div>
        {rounds.length > 0 && (
          <div className="text-sm mt-1">
            Đã trả lời Cục lần gần nhất vào ngày{" "}
            <b>{fmtDate(rounds[rounds.length - 1]?.ngayTraLoi)}</b> — Đang chờ kết quả mới từ Cục.
          </div>
        )}
      </div>
    );
  };

  const openApproval = () => {
    setApprovalStatus(st);
    setApprovalSoDon(rec.soDonSD || rec.soDon || "");
    setApprovalDate(
      rec.ngayChapThuan || rec.ngayGhiNhanSuaDoi
        ? dayjs(rec.ngayChapThuan || rec.ngayGhiNhanSuaDoi).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD")
    );
    setRejectDate(
      rec.ngayTuChoi ? dayjs(rec.ngayTuChoi).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
    );
    setRejectReason(rec.lyDoTuChoi || "");
    setApprovalOpen(true);
  };

  const confirmApproval = async () => {
    setSaving(true);
    try {
      const s = Number(approvalStatus);
      await callAPI({
        method: "post",
        endpoint: "/application_sd_nh_kh/update",
        data: {
          id: rec.id,
          trangThaiDuyet: s,
          soDonSD: s === 2 ? null : (approvalSoDon.trim() || null),
          soDon: s === 2 ? null : (approvalSoDon.trim() || null),
          duocGhiNhanSuaDoi: s === 1,
          ngayChapThuan: s === 1 ? approvalDate : null,
          ngayGhiNhanSuaDoi: s === 1 ? approvalDate : null,
          ngayTuChoi: s === 2 ? rejectDate : null,
          lyDoTuChoi: s === 2 ? rejectReason : null,
        },
      });
      await showSuccess("Thành công", "Đã cập nhật trạng thái xét duyệt tờ khai sửa đổi!");
      setApprovalOpen(false);
      loadDetail();
    } catch (e) {
      showError("Thất bại", "Không thể cập nhật trạng thái xét duyệt.", e);
    } finally {
      setSaving(false);
    }
  };

  const openRoundModal = (r) => {
    setRound(
      r
        ? {
            ...emptyRound,
            ...r,
            ngayNhanThongBao: r.ngayNhanThongBao
              ? dayjs(r.ngayNhanThongBao).format("YYYY-MM-DD")
              : null,
            hanTraLoi: r.hanTraLoi ? dayjs(r.hanTraLoi).format("YYYY-MM-DD") : null,
            ngayTraLoi: r.ngayTraLoi ? dayjs(r.ngayTraLoi).format("YYYY-MM-DD") : null,
          }
        : { ...emptyRound }
    );
    setRoundOpen(true);
  };

  const saveRound = async () => {
    if (!round.ngayNhanThongBao || !round.hanTraLoi) {
      showError("Thiếu thông tin", "Vui lòng nhập đầy đủ Ngày nhận thông báo và Hạn trả lời Cục.");
      return;
    }
    if (String(round.hanTraLoi) < String(round.ngayNhanThongBao)) {
      showError("Ngày không hợp lệ", "Hạn trả lời không được nhỏ hơn Ngày nhận thông báo.");
      return;
    }
    setSaving(true);
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/application_sd_nh_kh/phan-hoi/save",
        data: {
          ...round,
          idDonSuaDoi: rec.id,
          reopenIfAutoRejected: st === 2 && Boolean(rec.tuDongTuChoi) && Boolean(round.ngayTraLoi),
        },
      });
      if (res?.warning && typeof showWarning === "function") {
        showWarning("Lưu ý", res.warning);
      } else {
        await showSuccess("Thành công", res?.message || "Đã lưu thông tin phản hồi với Cục!");
      }
      setRoundOpen(false);
      loadDetail();
    } catch (e) {
      showError("Thất bại", "Không thể lưu thông tin phản hồi.", e);
    } finally {
      setSaving(false);
    }
  };

  const deleteRound = (r) => {
    Modal.confirm({
      title: `Xác nhận xóa vòng thông báo lần #${r.lanThongBao}?`,
      content:
        "Thao tác này sẽ xóa bản ghi thông báo/trả lời và tự động cập nhật lại hạn trả lời hiện hành.",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await callAPI({
            method: "post",
            endpoint: "/application_sd_nh_kh/phan-hoi/delete",
            data: { id: r.id, idDonSuaDoi: rec.id },
          });
          await showSuccess("Thành công", "Đã xóa vòng phản hồi.");
          loadDetail();
        } catch (e) {
          showError("Thất bại", "Không thể xóa vòng phản hồi.", e);
        }
      },
    });
  };

  const downloadFile = (link, name) => {
    if (!link) return;
    const a = document.createElement("a");
    a.href = link;
    a.download = name || "tai_lieu";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const setR = (k, v) => setRound((p) => ({ ...p, [k]: v }));
  const dpVal = (v) => (v ? dayjs(v) : null);
  const dpChange = (k) => (d) => setR(k, d ? d.format("YYYY-MM-DD") : null);

  return (
    <div className="p-2 bg-gray-100 min-h-screen flex items-start justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-800 uppercase">
              📌 Tờ khai sửa đổi, bổ sung đơn đăng ký nhãn hiệu Campuchia
            </h2>
          </div>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg"
            alt="Cờ Campuchia"
            className="w-16 h-11 rounded shadow-sm object-cover"
          />
        </div>

        <Spin spinning={loading} tip="Đang tải..." size="large">
          {/* Banner trạng thái */}
          {renderStatusBanner()}

          {/* Khối 0: Hành chính tờ khai */}
          <div className="mt-4 p-4 rounded-lg bg-gray-50 border grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <Field label="Số đơn sửa đổi">
              <b className="text-blue-700">{st === 2 ? "—" : (rec.soDonSD || rec.soDon || "—")}</b>
            </Field>
            <Field label="Ngày yêu cầu sửa đổi">
              <b>{fmtDate(rec.ngayYeuCau)}</b>
            </Field>
            <Field label="Lần sửa đổi">
              <b>{rec.lanSuaDoi ? `Lần ${rec.lanSuaDoi}` : "—"}</b>
            </Field>
            <Field label="Mã hồ sơ vụ việc">{donGoc.maHoSoVuViec || donGoc.maHoSo || "—"}</Field>
            <Field label="Client ref's">{donGoc.clientsRef || "—"}</Field>
            {st === 0 && hanTraLoi && (
              <Field label="Hạn trả lời Cục hiện hành">
                <b>{fmtDate(hanTraLoi)}</b>
                <DeadlineBadge date={hanTraLoi} />
              </Field>
            )}
            {st === 1 && (
              <Field label="Ngày ghi nhận sửa đổi">
                <b className="text-emerald-700">
                  {fmtDate(rec.ngayGhiNhanSuaDoi || rec.ngayChapThuan)}
                </b>
              </Field>
            )}
            {st === 2 && (
              <Field label="Ngày từ chối">
                <b className="text-red-700">{fmtDate(rec.ngayTuChoi)}</b>
              </Field>
            )}
          </div>

          {/* Mục I */}
          <Section title="(I) Đơn đăng ký nhãn hiệu được yêu cầu sửa đổi, bổ sung">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
              <Field label="Loại đơn yêu cầu sửa đổi">
                <span className="font-semibold text-teal-700">[✓] Đơn đăng ký nhãn hiệu</span>
              </Field>
              <Field label="Số đơn được sửa đổi trực tiếp">
                {rec.maDonDangKyGoc ? (
                  <span
                    className="text-indigo-600 font-semibold cursor-pointer hover:underline"
                    onClick={() => navigate(`/applicationdetail_kh/${rec.maDonDangKyGoc}`)}
                  >
                    {donGoc.soDon || rec.maDonDangKyGoc}
                  </span>
                ) : (
                  "—"
                )}
              </Field>
              <Field label="Ngày nộp đơn được sửa đổi">{fmtDate(donGoc.ngayNopDon)}</Field>
              <Field label="Phân loại đơn được sửa đổi">
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {loaiDonGocText}
                </span>
              </Field>
              <Field label="Nhãn hiệu (trước sửa đổi)">
                <div className="mt-1">
                  <NhanCell don={donGoc} />
                </div>
              </Field>
              <Field label="Nhóm SP/DV hiện hành">{spdvText(donGoc) || "—"}</Field>
            </div>

            {/* Lịch sử sửa đổi */}
            {chain.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border text-left">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-2">
                  Lịch sử sửa đổi
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      rec.donGocBanDau?.maDonDangKy &&
                      navigate(`/applicationdetail_kh/${rec.donGocBanDau.maDonDangKy}`)
                    }
                    className="px-2.5 py-1 rounded border bg-white hover:bg-gray-100 text-gray-800"
                  >
                    Đơn gốc ban đầu:{" "}
                    <b>{rec.donGocBanDau?.soDon || rec.donGocBanDau?.maDonDangKy || "—"}</b>
                  </button>
                  {chain.map((c) => {
                    const cs = Number(c.trangThaiDuyet ?? 0);
                    const icon = cs === 1 ? "✅" : cs === 2 ? "❌" : "⏳";
                    return (
                      <React.Fragment key={c.id}>
                        <span className="text-gray-400 font-bold">➔</span>
                        <button
                          type="button"
                          onClick={() =>
                            !c.isCurrent && navigate(`/application_sd_nh_kh_detail/${c.id}`)
                          }
                          className={`px-2.5 py-1 rounded border transition ${
                            c.isCurrent
                              ? "border-[#009999] bg-teal-50 text-teal-900 font-bold shadow-sm cursor-default"
                              : "bg-white hover:bg-blue-50 text-gray-700 cursor-pointer"
                          }`}
                        >
                          {icon} SĐ lần {c.lanSuaDoi ?? "?"}
                          {c.soDon ? ` (${c.soDon})` : ""}
                          {c.isCurrent ? " • Đang xem" : ""}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </Section>

          {/* Mục II */}
          <Section title="(II) Người nộp đơn / Chủ đơn (tại thời điểm nộp tờ khai)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <Field label="Mã khách hàng">{donGoc.khachHang?.maKhachHang || "—"}</Field>
              <Field label="Tên đầy đủ chủ đơn">{donGoc.khachHang?.tenKhachHang || "—"}</Field>
              <Field label="Địa chỉ">{donGoc.khachHang?.diaChi || "—"}</Field>
              <Field label="Quốc gia / Mã quốc gia">
                {donGoc.khachHang?.maQuocGia
                  ? `${donGoc.khachHang.maQuocGia}${
                      donGoc.khachHang.quocGia?.tenQuocGia
                        ? ` - ${donGoc.khachHang.quocGia.tenQuocGia}`
                        : ""
                    }`
                  : "—"}
              </Field>
              <Field label="Số điện thoại">{donGoc.khachHang?.sdt || "—"}</Field>
              <Field label="Người liên hệ">{donGoc.khachHang?.nguoiLienHe || "—"}</Field>
            </div>
          </Section>

          {/* Mục III */}
          <Section title="(III) Đại diện của người nộp đơn & Đối tác">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <Field label="Tổ chức đại diện SHCN">{donGoc.daiDienSHTT || "—"}</Field>
              <Field label="Đối tác">
                {donGoc.doitac
                  ? `${donGoc.doitac.tenDoiTac}${
                      donGoc.doitac.maDoiTac ? ` (${donGoc.doitac.maDoiTac})` : ""
                    }`
                  : "—"}
              </Field>
              <Field label="Giấy ủy quyền">
                {guqGocFlag === false
                  ? `Bản sao (bản gốc nộp theo đơn số: ${guqMaUyQuyen || "—"})`
                  : guqGocFlag === true
                  ? "Bản gốc nộp kèm đơn"
                  : "—"}
              </Field>
              <Field label="Số giấy ủy quyền">{guqSoGUQ || "—"}</Field>
            </div>
          </Section>

          {/* Mục IV */}
          <Section
            title="(IV) Nội dung yêu cầu sửa đổi, bổ sung"
            extra={
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-1.5 cursor-pointer text-gray-700">
                  <Switch size="small" checked={onlyChanged} onChange={setOnlyChanged} />
                  <span>Chỉ hiển thị mục có sửa đổi</span>
                </label>
                {st !== 1 && (
                  <button
                    type="button"
                    onClick={() => navigate(`/application_sd_nh_kh_edit/${rec.id}`)}
                    className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium rounded-md text-xs"
                  >
                    📝 Chỉnh sửa nội dung tờ khai
                  </button>
                )}
              </div>
            }
          >
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-2.5 border-b border-r w-12 text-center">Chọn</th>
                    <th className="p-2.5 border-b border-r text-left w-1/5">Hạng mục</th>
                    <th className="p-2.5 border-b border-r text-left w-1/4">Trước sửa đổi</th>
                    <th className="p-2.5 border-b border-r text-left w-1/4">
                      Nội dung yêu cầu sửa đổi
                    </th>
                    <th className="p-2.5 border-b text-left w-1/4">
                      Sau sửa đổi{" "}
                      {st !== 1 && (
                        <span className="text-xs font-normal text-gray-400">(chưa duyệt)</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shownRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center italic text-gray-500">
                        Không có hạng mục nào được đánh dấu sửa đổi.
                      </td>
                    </tr>
                  ) : (
                    shownRows.map((r) => {
                      const active = Boolean(rec[r.flag]);
                      return (
                        <tr
                          key={r.flag}
                          className={active ? "bg-amber-50/50" : "bg-white text-gray-400"}
                        >
                          <td className="p-2.5 border-b border-r text-center text-base">
                            {active ? "☑" : "☐"}
                          </td>
                          <td className="p-2.5 border-b border-r text-left font-medium text-gray-800">
                            {r.label}
                          </td>
                          <td className="p-2.5 border-b border-r text-left align-top">
                            {r.before || "—"}
                          </td>
                          <td className="p-2.5 border-b border-r text-left align-top whitespace-pre-line font-medium text-blue-900">
                            {active ? r.req || "—" : "—"}
                          </td>
                          <td className="p-2.5 border-b text-left align-top text-emerald-900">
                            {st === 1 && active ? r.after || "—" : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Mục V: Quá trình thẩm định & Phản hồi Cục */}
          <Section
            title="(V) Quá trình thẩm định & Phản hồi với Cục"
            extra={
              st !== 1 && (
                <button
                  type="button"
                  onClick={() => openRoundModal(null)}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#009999] hover:bg-[#007a7a] text-white rounded-md shadow-sm"
                >
                  + Ghi nhận thông báo từ Cục
                </button>
              )
            }
          >
            {rounds.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-gray-300 text-sm italic text-gray-500 text-left">
                Chưa có thông báo nào từ Cục.
              </div>
            ) : (
              <div className="space-y-3">
                {rounds.map((r) => {
                  const answered = Boolean(r.ngayTraLoi);
                  return (
                    <div
                      key={r.id}
                      className={`border rounded-lg p-4 text-sm text-left ${
                        answered ? "bg-gray-50 border-gray-200" : "bg-orange-50/40 border-orange-300"
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">
                            Lần thông báo #{r.lanThongBao}
                            {r.soThongBao ? ` — Số TB: ${r.soThongBao}` : ""}
                          </span>
                          {answered ? (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Đã trả lời Cục
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-800 border border-orange-300">
                              ⏳ Chờ công ty trả lời
                            </span>
                          )}
                        </div>
                        {st !== 1 && (
                          <div className="flex items-center gap-3 text-xs font-medium">
                            <button
                              type="button"
                              className="text-blue-600 hover:underline"
                              onClick={() => openRoundModal(r)}
                            >
                              {answered ? "✏️ Sửa" : "↩️ Ghi nhận đã trả lời / Sửa"}
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:underline"
                              onClick={() => deleteRound(r)}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2.5">
                        <div>
                          <span className="text-gray-600">Ngày nhận thông báo:</span>{" "}
                          <b>{fmtDate(r.ngayNhanThongBao)}</b>
                        </div>
                        <div>
                          <span className="text-gray-600">Hạn trả lời Cục:</span>{" "}
                          <b>{fmtDate(r.hanTraLoi)}</b>
                          {!answered && st === 0 && <DeadlineBadge date={r.hanTraLoi} />}
                        </div>
                        <div className="md:col-span-2 whitespace-pre-line">
                          <span className="text-gray-600">Nội dung thông báo:</span>{" "}
                          {r.noiDungThongBao || "—"}
                        </div>
                        {r.linkFileThongBao && (
                          <div className="md:col-span-2">
                            <button
                              type="button"
                              className="text-blue-600 underline text-xs"
                              onClick={() => downloadFile(r.linkFileThongBao, r.tenFileThongBao)}
                            >
                              📎 Tải thông báo Cục: {r.tenFileThongBao || "thong_bao_cuc"}
                            </button>
                          </div>
                        )}

                        <div className="md:col-span-2 border-t pt-2 mt-1">
                          {answered ? (
                            <div className="space-y-1">
                              <div>
                                <span className="text-gray-600">Ngày công ty trả lời Cục:</span>{" "}
                                <b className="text-emerald-700">{fmtDate(r.ngayTraLoi)}</b>
                              </div>
                              <div className="whitespace-pre-line">
                                <span className="text-gray-600">Nội dung trả lời:</span>{" "}
                                {r.noiDungTraLoi || "—"}
                              </div>
                              {r.linkFileTraLoi && (
                                <button
                                  type="button"
                                  className="text-blue-600 underline text-xs"
                                  onClick={() => downloadFile(r.linkFileTraLoi, r.tenFileTraLoi)}
                                >
                                  📎 Tải công văn trả lời: {r.tenFileTraLoi || "cong_van_tra_loi"}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-orange-700 font-medium text-xs">
                                Chưa ghi nhận ngày công ty trả lời Cục.
                              </span>
                              {st !== 1 && (
                                <button
                                  type="button"
                                  onClick={() => navigate(`/application_sd_nh_kh_edit/${rec.id}`)}
                                  className="text-xs text-purple-700 underline hover:text-purple-900"
                                >
                                  📝 Sửa nội dung tờ khai để nộp trả lời
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Mục VI: Tài liệu kèm theo */}
          <Section title="(VI) Danh mục tài liệu kèm theo Đơn sửa đổi">
            <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-3 py-2 border-b">Tên tài liệu</th>
                  <th className="px-3 py-2 border-b">Trạng thái</th>
                  <th className="px-3 py-2 border-b">Tệp đính kèm</th>
                </tr>
              </thead>
              <tbody>
                {taiLieuSuaDoi.length > 0 ? (
                  taiLieuSuaDoi.map((tl, idx) => (
                    <tr key={tl.maTaiLieu || idx} className="hover:bg-gray-50 text-left">
                      <td className="px-3 py-2 border-b">{tl.tenTaiLieu}</td>
                      <td className="px-3 py-2 border-b">{tl.trangThai || "—"}</td>
                      <td className="px-3 py-2 border-b">
                        {tl.linkTaiLieu ? (
                          <button
                            type="button"
                            className="text-blue-600 underline"
                            onClick={() => downloadFile(tl.linkTaiLieu, tl.tenTaiLieu)}
                          >
                            Xem / Tải tài liệu
                          </button>
                        ) : (
                          <span className="italic text-gray-400">Chưa có</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500 italic py-4">
                      Không có tài liệu đính kèm riêng cho tờ khai sửa đổi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>

          {/* Mục VII: Ghi chú & Thông tin cập nhật */}
          <Section title="(VII) Ghi chú & Thông tin cập nhật">
            <div className="p-3 rounded bg-gray-50 border text-left text-sm whitespace-pre-line text-gray-700 italic">
              {rec.moTa || "Chưa có ghi chú"}
            </div>
            <div className="text-left text-xs text-gray-500 mt-2">
              Nhân sự cập nhật:{" "}
              <b>
                {rec.tenNhanSuCapNhap || rec.nhanSuCapNhap?.hoTen || rec.maNhanSuCapNhap || "—"}
              </b>{" "}
              | Ngày tạo: <b>{fmtDate(rec.createdAt)}</b> | Cập nhật gần nhất:{" "}
              <b>{fmtDate(rec.updatedAt)}</b>
            </div>
          </Section>
        </Spin>

        {/* Thanh hành động */}
        <div className="flex flex-wrap justify-center gap-3 mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/application_sd_nh_khlist")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Quay lại
          </button>
          {st !== 1 && (
            <button
              type="button"
              onClick={() => navigate(`/application_sd_nh_kh_edit/${rec.id}`)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              📝 Chỉnh sửa tờ khai
            </button>
          )}
          <button
            type="button"
            onClick={openApproval}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            ⚖️ Cập nhật trạng thái xét duyệt
          </button>
          {rec.maDonDangKyGoc && (
            <button
              type="button"
              onClick={() => navigate(`/applicationdetail_kh/${rec.maDonDangKyGoc}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              🔗 Mở đơn được sửa đổi
            </button>
          )}
          {st === 1 && donMoi && (
            <button
              type="button"
              onClick={() => navigate(`/applicationdetail_kh/${donMoi.maDonDangKy}`)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              🔗 Mở đơn sau sửa đổi
            </button>
          )}
        </div>
      </div>

      {/* Modal cập nhật trạng thái xét duyệt */}
      <Modal
        title="⚖️ Cập nhật kết quả xét duyệt Tờ khai sửa đổi"
        open={approvalOpen}
        onOk={confirmApproval}
        onCancel={() => setApprovalOpen(false)}
        confirmLoading={saving}
        okText="Lưu kết quả"
        cancelText="Hủy"
        width={600}
      >
        <div className="space-y-4">
          <Radio.Group
            value={Number(approvalStatus)}
            onChange={(e) => setApprovalStatus(Number(e.target.value))}
            className="flex flex-col gap-2"
          >
            <Radio value={0}>⏳ Đang chờ / Chưa chấp thuận</Radio>
            <Radio value={1}>✅ Được chấp thuận</Radio>
            <Radio value={2}>❌ Từ chối</Radio>
          </Radio.Group>

          {Number(approvalStatus) === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số đơn ghi nhận sửa đổi
                </label>
                <Input
                  value={approvalSoDon}
                  onChange={(e) => setApprovalSoDon(e.target.value)}
                  placeholder="Nhập số đơn ghi nhận (SĐxxxx)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày ghi nhận sửa đổi
                </label>
                <DatePicker
                  value={dpVal(approvalDate)}
                  onChange={(d) => setApprovalDate(d ? d.format("YYYY-MM-DD") : null)}
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {Number(approvalStatus) === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày từ chối</label>
                <DatePicker
                  value={dpVal(rejectDate)}
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

      {/* Modal thêm / sửa vòng phản hồi với Cục */}
      <Modal
        title={round.id ? "Cập nhật vòng phản hồi với Cục" : "Ghi nhận Thông báo từ Cục"}
        open={roundOpen}
        onOk={saveRound}
        onCancel={() => setRoundOpen(false)}
        confirmLoading={saving}
        okText="Lưu vòng phản hồi"
        cancelText="Hủy"
        width={720}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số thông báo của Cục</label>
            <Input
              value={round.soThongBao || ""}
              onChange={(e) => setR("soThongBao", e.target.value)}
              placeholder="Nhập số công văn / thông báo (nếu có)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày nhận thông báo <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={dpVal(round.ngayNhanThongBao)}
              onChange={dpChange("ngayNhanThongBao")}
              format="DD/MM/YYYY"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hạn trả lời Cục <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={dpVal(round.hanTraLoi)}
              onChange={dpChange("hanTraLoi")}
              format="DD/MM/YYYY"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tệp thông báo của Cục
            </label>
            <input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  readFileAsDataUrl(f, (url) =>
                    setRound((p) => ({ ...p, tenFileThongBao: f.name, linkFileThongBao: url }))
                  );
                }
              }}
            />
            {round.tenFileThongBao && (
              <div className="text-xs text-gray-500 mt-1 truncate">{round.tenFileThongBao}</div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung thông báo
            </label>
            <Input.TextArea
              rows={3}
              value={round.noiDungThongBao || ""}
              onChange={(e) => setR("noiDungThongBao", e.target.value)}
              placeholder="Nhập nội dung thông báo từ Cục..."
            />
          </div>

          <div className="md:col-span-2 border-t pt-3 font-semibold text-gray-800">
            Phản hồi / Trả lời của Công ty
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày trả lời Cục</label>
            <DatePicker
              value={dpVal(round.ngayTraLoi)}
              onChange={dpChange("ngayTraLoi")}
              format="DD/MM/YYYY"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tệp công văn trả lời
            </label>
            <input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  readFileAsDataUrl(f, (url) =>
                    setRound((p) => ({ ...p, tenFileTraLoi: f.name, linkFileTraLoi: url }))
                  );
                }
              }}
            />
            {round.tenFileTraLoi && (
              <div className="text-xs text-gray-500 mt-1 truncate">{round.tenFileTraLoi}</div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung trả lời
            </label>
            <Input.TextArea
              rows={3}
              value={round.noiDungTraLoi || ""}
              onChange={(e) => setR("noiDungTraLoi", e.target.value)}
              placeholder="Nhập nội dung trả lời đã gửi Cục..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Application_SD_NH_KHDetail;
