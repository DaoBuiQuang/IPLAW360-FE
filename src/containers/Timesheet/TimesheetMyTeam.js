import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin, Modal, Select, Tooltip, Input } from "antd";
import {
  Users,
  UserCheck,
  Mail,
  Phone,
  BarChart2,
  Calendar,
  UserPlus,
  ArrowLeft,
  LayoutGrid,
  List,
  Shield,
  Briefcase,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import KpiSummaryBar from "./KpiSummaryBar";
import TimesheetMyTime from "./TimesheetMyTime";
import callAPI from "../../utils/api";
import dayjs from "dayjs";

const money = (v) => Number(v || 0).toLocaleString("vi-VN");

/**
 * TimesheetMyTeam — Hiển thị cho Manager và Admin
 * - Manager xem team của mình
 * - Admin có thể chọn xem team của bất kỳ Manager nào
 * - KPI team (week/month/quarter/year)
 * - Danh sách thành viên (Card / Table view)
 * - Nút xem KPI cá nhân & xem MYTIME của từng nhân sự
 * - Thêm thành viên nhanh vào team
 */
export default function TimesheetMyTeam() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useSelector((s) => s.auth.role);
  const currentMaNhanSu = localStorage.getItem("maNhanSu") || "";

  const isAdmin = role === "admin" || role === "ceo";

  // URL param managerCode (nếu admin truyền) hoặc mã của chính user
  const paramManagerCode = searchParams.get("managerCode");
  const [selectedManagerCode, setSelectedManagerCode] = useState(
    paramManagerCode || (isAdmin ? "" : currentMaNhanSu)
  );

  // ── Danh sách Manager để Admin chọn ──
  const [managersList, setManagersList] = useState([]);

  // ── Danh sách NV trong team ──
  const [managerInfo, setManagerInfo] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [viewLayout, setViewLayout] = useState("cards"); // "cards" | "table"

  // ── NV đang xem MYTIME ──
  const [selectedStaff, setSelectedStaff] = useState(null);

  // ── Modal xem KPI cá nhân ──
  const [kpiStaffModal, setKpiStaffModal] = useState(null); // nhân viên đang xem KPI
  const [individualKpi, setIndividualKpi] = useState(null);
  const [loadingIndividualKpi, setLoadingIndividualKpi] = useState(false);

  // ── Modal thêm thành viên nhanh ──
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [allStaffList, setAllStaffList] = useState([]);
  const [memberToAdd, setMemberToAdd] = useState(null);
  const [addingMember, setAddingMember] = useState(false);

  // ── KPI Team ──
  const [kpi, setKpi] = useState({});
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiPeriod, setKpiPeriod] = useState("month");
  const [kpiParams, setKpiParams] = useState({
    year: dayjs().year(),
    month: dayjs().month() + 1,
    week: Math.ceil(dayjs().date() / 7),
    quarter: Math.ceil((dayjs().month() + 1) / 3),
  });

  // Effective manager code đang xem
  const activeManagerCode = selectedManagerCode || currentMaNhanSu;

  // ── Fetch danh sách Managers (chỉ cho Admin) ──
  useEffect(() => {
    if (isAdmin) {
      callAPI({ method: "post", endpoint: "/team/list", data: { pageSize: 100 } })
        .then((res) => {
          const teams = res?.teams || [];
          const mgrs = teams.map((t) => ({
            value: t.managerCode,
            label: `${t.managerCode} - ${t.managerName} (${(t.members || []).length} TV)`,
          }));
          setManagersList(mgrs);
          if (!selectedManagerCode && mgrs.length > 0) {
            setSelectedManagerCode(mgrs[0].value);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch Team data ──
  const fetchTeam = useCallback(
    async (mCode = activeManagerCode) => {
      setLoadingTeam(true);
      try {
        const payload = isAdmin && mCode ? { managerCode: mCode } : {};
        const res = await callAPI({
          method: "post",
          endpoint: "/staff/myteam",
          data: payload,
        });

        // BE trả về { success: true, manager: { maNhanSu, hoTen, chucVu }, members: [...] }
        const members = res?.members || res?.data || (Array.isArray(res) ? res : []);
        setTeamMembers(members);
        setManagerInfo(res?.manager || null);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu team:", err);
        setTeamMembers([]);
        setManagerInfo(null);
      } finally {
        setLoadingTeam(false);
      }
    },
    [isAdmin, activeManagerCode]
  );

  // ── Fetch Team KPI ──
  const fetchKpi = useCallback(
    async (period, params, mCode = activeManagerCode) => {
      setKpiLoading(true);
      try {
        const res = await callAPI({
          method: "post",
          endpoint: "/timesheet/kpi",
          data: {
            teamManagerCode: mCode || undefined,
            period,
            ...params,
          },
        });
        setKpi(res?.kpi || {});
      } catch {
        setKpi({});
      } finally {
        setKpiLoading(false);
      }
    },
    [activeManagerCode]
  );

  // ── Hồ sơ vượt quá 100% trong team ──
  const [teamOverContributed, setTeamOverContributed] = useState([]);

  const fetchOverContributed = useCallback(
    async (mCode = activeManagerCode) => {
      try {
        const payload = isAdmin && mCode ? { teamManagerCode: mCode } : {};
        const res = await callAPI({
          method: "post",
          endpoint: "/timesheet/summary",
          data: payload,
        });
        setTeamOverContributed(res?.summary?.overContributedCases || []);
      } catch {
        setTeamOverContributed([]);
      }
    },
    [isAdmin, activeManagerCode]
  );

  useEffect(() => {
    if (activeManagerCode) {
      fetchTeam(activeManagerCode);
      fetchKpi(kpiPeriod, kpiParams, activeManagerCode);
      fetchOverContributed(activeManagerCode);
    }
  }, [activeManagerCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKpiPeriodChange = (p, params) => {
    setKpiPeriod(p);
    setKpiParams(params);
    fetchKpi(p, params, activeManagerCode);
  };

  // ── Xem KPI cá nhân của 1 thành viên qua Modal ──
  const handleViewIndividualKpi = async (member) => {
    setKpiStaffModal(member);
    setLoadingIndividualKpi(true);
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/timesheet/kpi",
        data: {
          employeeCode: member.maNhanSu,
          period: kpiPeriod,
          ...kpiParams,
        },
      });
      setIndividualKpi(res?.kpi || null);
    } catch {
      setIndividualKpi(null);
    } finally {
      setLoadingIndividualKpi(false);
    }
  };

  // ── Mở modal thêm thành viên ──
  const handleOpenAddMemberModal = async () => {
    setMemberToAdd(null);
    setAddMemberModalOpen(true);
    try {
      const res = await callAPI({ method: "post", endpoint: "/staff/basiclist", data: {} });
      const list = Array.isArray(res) ? res : res?.data || [];
      const currentCodes = teamMembers.map((m) => m.maNhanSu);
      setAllStaffList(list.filter((s) => !currentCodes.includes(s.maNhanSu)));
    } catch {
      setAllStaffList([]);
    }
  };

  const handleExecuteAddMember = async () => {
    if (!memberToAdd) {
      toast.warning("Vui lòng chọn nhân viên để thêm vào team!");
      return;
    }
    setAddingMember(true);
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/team/add-member",
        data: {
          managerCode: activeManagerCode,
          maNhanSu: memberToAdd,
        },
      });
      toast.success(res?.message || "Đã thêm thành viên vào team!");
      setAddMemberModalOpen(false);
      fetchTeam(activeManagerCode);
      fetchKpi(kpiPeriod, kpiParams, activeManagerCode);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Lỗi khi thêm thành viên");
    } finally {
      setAddingMember(false);
    }
  };

  // ── Nếu đang xem MYTIME của 1 NV (chế độ read-only) ──
  if (selectedStaff) {
    return (
      <div className="p-3 bg-gray-50 min-h-screen">
        <div className="bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-gray-100 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedStaff(null)}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft size={16} />
              <span>Quay lại MYTEAM</span>
            </button>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase font-semibold">Đang xem nhân viên:</span>
              <strong className="text-base text-[#009999]">{selectedStaff.hoTen}</strong>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                {selectedStaff.maNhanSu}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              Chế độ giám sát (Chỉ xem)
            </span>
          </div>
        </div>

        <TimesheetMyTime viewMode="other" targetEmployeeCode={selectedStaff.maNhanSu} />
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* ── Page Header ── */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#009999]/10 text-[#009999] rounded-xl">
              <Users size={24} />
            </span>
            <h1 className="text-2xl font-bold text-gray-800">
              {isAdmin ? "MYTEAM — Giám sát Team" : "MYTEAM — Team của tôi"}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {managerInfo
              ? `Trưởng nhóm: ${managerInfo.hoTen} (${managerInfo.maNhanSu}) — ${managerInfo.chucVu || "Trưởng nhóm"}`
              : "Theo dõi chỉ số KPI và tiến độ báo cáo công việc của các nhân viên trong team"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dropdown chọn Manager cho Admin */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Chọn Team:</span>
              <Select
                className="w-56"
                value={activeManagerCode}
                onChange={(val) => {
                  setSelectedManagerCode(val);
                  setSearchParams({ managerCode: val });
                }}
                options={managersList}
                placeholder="Chọn trưởng nhóm..."
              />
            </div>
          )}

          {/* Nút xem bảng TEAMWORK */}
          <button
            onClick={() =>
              navigate(
                `/timesheet/teamwork${
                  isAdmin && activeManagerCode ? `?managerCode=${activeManagerCode}` : ""
                }`
              )
            }
            className="flex items-center gap-1.5 px-4 py-2 bg-[#009999] hover:bg-[#007a7a] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <FileText size={15} />
            <span>📋 Bảng TEAMWORK →</span>
          </button>
        </div>
      </div>

      {/* ── CẢNH BÁO TỈ LỆ ĐÓNG GÓP HỒ SƠ > 100% TRONG TEAM ── */}
      {teamOverContributed.length > 0 && (
        <div className="mb-6 p-4 bg-red-50/90 border-l-4 border-red-500 rounded-2xl shadow-sm border border-red-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-red-100 text-red-700 rounded-xl flex-shrink-0">
              <AlertTriangle size={20} />
            </span>
            <div>
              <h4 className="font-bold text-red-900 text-sm flex items-center gap-2">
                <span>Cảnh báo quản lý: Phát hiện {teamOverContributed.length} hồ sơ có tỉ lệ đóng góp vượt 100%</span>
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                Các nhân sự trong team đang báo cáo time với tổng tỉ lệ đóng góp vượt quá 100%. Quản lý vui lòng kiểm tra và yêu cầu điều chỉnh lại:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {teamOverContributed.map((item) => (
                  <span
                    key={item.caseCode}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white text-red-800 text-xs font-medium border border-red-200 shadow-2xs"
                  >
                    📁 <strong>{item.caseCode}</strong>: Tổng{" "}
                    <span className="text-red-600 font-bold">{item.totalContribution}%</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              navigate(
                `/timesheet/teamwork${
                  isAdmin && activeManagerCode ? `?managerCode=${activeManagerCode}` : ""
                }`
              )
            }
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex-shrink-0"
          >
            Kiểm tra ngay →
          </button>
        </div>
      )}

      {/* ── KPI tổng quan team ── */}
      <KpiSummaryBar
        kpi={kpi}
        loading={kpiLoading}
        period={kpiPeriod}
        onPeriodChange={handleKpiPeriodChange}
        showBreakdown={true}
        breakdown={kpi.breakdown || []}
        onStaffClick={(code) => {
          const member = teamMembers.find((m) => m.maNhanSu === code);
          if (member) setSelectedStaff(member);
        }}
      />

      {/* ── Danh sách thành viên trong team ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">
              Thành viên trong team ({teamMembers.length})
            </h2>
            {managerInfo?.tenNhom && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#009999]/10 text-[#009999]">
                {managerInfo.tenNhom}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Nút thêm thành viên */}
            <button
              onClick={handleOpenAddMemberModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#009999] hover:bg-[#007a7a] text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <UserPlus size={14} />
              <span>+ Thêm thành viên</span>
            </button>

            {/* Layout switch buttons */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewLayout("cards")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewLayout === "cards" ? "bg-white text-[#009999] shadow-xs" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Dạng thẻ (Cards)"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewLayout("table")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewLayout === "table" ? "bg-white text-[#009999] shadow-xs" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Dạng bảng (Table)"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        <Spin spinning={loadingTeam}>
          {teamMembers.length === 0 && !loadingTeam ? (
            <div className="p-12 text-center text-gray-400">
              <Users size={36} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">Chưa có thành viên nào trong team này.</p>
              <p className="text-xs text-gray-400 mt-1">
                Nhấn vào <strong>+ Thêm thành viên</strong> để bắt đầu phân công nhân sự vào nhóm.
              </p>
            </div>
          ) : viewLayout === "cards" ? (
            /* ════ CARD VIEW ════ */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {teamMembers.map((m) => (
                <div
                  key={m.maNhanSu}
                  className="bg-white rounded-xl border border-gray-200/80 p-4 hover:shadow-md hover:border-[#009999]/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name, Role */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#009999]/10 text-[#009999] flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
                          {(m.hoTen || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm leading-tight">{m.hoTen}</h3>
                          <p className="text-xs font-mono text-gray-500 mt-0.5">{m.maNhanSu}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          m.role === "manager"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-teal-50 text-teal-700 border-teal-200"
                        }`}
                      >
                        {m.role || "staff"}
                      </span>
                    </div>

                    {/* Details: Chức vụ, Email, SĐT */}
                    <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Briefcase size={13} className="text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-700">
                          {m.chucVu || m.phongBan || "Nhân viên"}
                        </span>
                      </div>
                      {m.email && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Mail size={13} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{m.email}</span>
                        </div>
                      )}
                      {m.sdt && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Phone size={13} className="text-gray-400 flex-shrink-0" />
                          <span>{m.sdt}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleViewIndividualKpi(m)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      <BarChart2 size={13} />
                      <span>Xem KPI</span>
                    </button>
                    <button
                      onClick={() => setSelectedStaff(m)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#009999]/10 hover:bg-[#009999] hover:text-white text-[#009999] rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Calendar size={13} />
                      <span>Xem MYTIME →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ════ TABLE VIEW ════ */
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-[#009999] text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-white">Nhân sự</th>
                    <th className="px-4 py-3 font-semibold text-white">Chức vụ / Phòng ban</th>
                    <th className="px-4 py-3 font-semibold text-white">Email</th>
                    <th className="px-4 py-3 font-semibold text-white">Số điện thoại</th>
                    <th className="px-4 py-3 font-semibold text-white">Vai trò</th>
                    <th className="px-4 py-3 font-semibold text-white text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teamMembers.map((m) => (
                    <tr key={m.maNhanSu} className="hover:bg-teal-50/40 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#009999]/10 text-[#009999] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {(m.hoTen || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{m.hoTen}</p>
                            <p className="text-[11px] font-mono text-gray-400">{m.maNhanSu}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {m.chucVu || m.phongBan || "Nhân viên"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{m.email || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{m.sdt || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          {m.role || "staff"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewIndividualKpi(m)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition cursor-pointer"
                          >
                            KPI
                          </button>
                          <button
                            onClick={() => setSelectedStaff(m)}
                            className="px-2.5 py-1 bg-[#009999]/10 hover:bg-[#009999] hover:text-white text-[#009999] rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            MYTIME →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Spin>
      </div>

      {/* ════════════════════════════════════════
           MODAL: XEM KPI CÁ NHÂN CỦA 1 THÀNH VIÊN
          ════════════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-800">
            <BarChart2 size={18} className="text-[#009999]" />
            <span>KPI cá nhân — {kpiStaffModal?.hoTen}</span>
          </div>
        }
        open={!!kpiStaffModal}
        onCancel={() => {
          setKpiStaffModal(null);
          setIndividualKpi(null);
        }}
        footer={[
          <button
            key="close"
            onClick={() => {
              setKpiStaffModal(null);
              setIndividualKpi(null);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition cursor-pointer"
          >
            Đóng
          </button>,
          <button
            key="mytime"
            onClick={() => {
              const staff = kpiStaffModal;
              setKpiStaffModal(null);
              setSelectedStaff(staff);
            }}
            className="px-4 py-2 bg-[#009999] hover:bg-[#007a7a] text-white rounded-xl text-sm font-semibold transition cursor-pointer ml-2"
          >
            Xem chi tiết MYTIME →
          </button>,
        ]}
        width={560}
      >
        <Spin spinning={loadingIndividualKpi}>
          {individualKpi ? (
            <div className="py-3 space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 flex justify-between">
                <span>
                  Kỳ đánh giá: <strong className="uppercase text-gray-700">{individualKpi.period}</strong>
                </span>
                <span>
                  Từ: <strong>{individualKpi.fromDate}</strong> đến <strong>{individualKpi.toDate}</strong> (
                  {individualKpi.workingDays} ngày làm việc)
                </span>
              </div>

              {/* KPI metrics cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-100">
                  <p className="text-xs text-teal-700 font-medium">Tổng số giờ làm</p>
                  <p className="text-2xl font-bold text-teal-800 mt-1">
                    {individualKpi.totalHours || 0}
                    <span className="text-xs font-normal text-teal-600 ml-1">
                      / {individualKpi.targetHours || 0}h
                    </span>
                  </p>
                </div>
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-700 font-medium">Tỷ lệ hoàn thành KPI</p>
                  <p className="text-2xl font-bold text-blue-800 mt-1">
                    {individualKpi.completionRate || 0}%
                  </p>
                </div>
                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <p className="text-xs text-indigo-700 font-medium">Tổng doanh thu tạo ra</p>
                  <p className="text-lg font-bold text-indigo-800 mt-1">
                    {money(individualKpi.totalAmount)} đ
                  </p>
                </div>
                <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="text-xs text-purple-700 font-medium">Số time record</p>
                  <p className="text-2xl font-bold text-purple-800 mt-1">
                    {individualKpi.recordCount || 0}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">
              Không có dữ liệu KPI cho nhân sự này trong kỳ đã chọn.
            </div>
          )}
        </Spin>
      </Modal>

      {/* ════════════════════════════════════════
           MODAL: THÊM NHANH THÀNH VIÊN VÀO TEAM
          ════════════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-800">
            <UserPlus size={18} className="text-[#009999]" />
            <span>Thêm thành viên vào team</span>
          </div>
        }
        open={addMemberModalOpen}
        onCancel={() => setAddMemberModalOpen(false)}
        onOk={handleExecuteAddMember}
        confirmLoading={addingMember}
        okText="Thêm vào team"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-[#009999] hover:bg-[#007a7a] cursor-pointer" }}
      >
        <div className="py-3 space-y-3">
          <p className="text-xs text-gray-500">
            Chọn nhân sự để gán vào nhóm của <strong>{managerInfo?.hoTen || activeManagerCode}</strong>:
          </p>
          <Select
            className="w-full"
            placeholder="Tìm kiếm nhân sự..."
            value={memberToAdd}
            onChange={(val) => setMemberToAdd(val)}
            options={allStaffList.map((s) => ({
              value: s.maNhanSu,
              label: `${s.maNhanSu} - ${s.hoTen} (${s.chucVu || "Nhân viên"})`,
            }))}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>
      </Modal>
    </div>
  );
}
