import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useNavigationType } from "react-router-dom";
import { DatePicker, Modal, Pagination, Spin, Tooltip, Tag } from "antd";
import { toast } from "react-toastify";
import {
  Briefcase,
  Search,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import SearchCreatableSelect from "../../components/commom/SearchCreatableSelect";
import callAPI from "../../utils/api";

const FILTER_STORAGE_KEY = "timesheetMatterFilters";
const STATE_STORAGE_KEY = "timesheetMatterState";

const formatDate = (v) => {
  if (!v) return "-";
  const [y, m, d] = String(v).slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

function ContribBadge({ value }) {
  const n = Number(value ?? 0);
  const cls =
    n > 100
      ? "bg-red-100 text-red-700 border-red-300"
      : n >= 100
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : n > 0
      ? "bg-teal-50 text-teal-700 border-teal-200"
      : "bg-gray-100 text-gray-500 border-gray-200";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {n}%
    </span>
  );
}

export default function TimesheetMatter() {
  const role = useSelector((s) => s.auth.role);
  const currentMaNhanSu = localStorage.getItem("maNhanSu") || "";
  const navigationType = useNavigationType();

  const isAdmin = role === "admin" || role === "ceo";
  const isManager = role === "manager";

  // ── Filters State ──
  const [filters, setFilters] = useState({
    caseCode: "",
    customerCode: "",
    partnerCode: "",
    fromDate: "",
    toDate: "",
    employeeCode: "",
    teamManagerCode: "",
  });

  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
    totalItems: 0,
  });

  const [matters, setMatters] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Options cho bộ lọc ──
  const [caseOptions, setCaseOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [partnerOptions, setPartnerOptions] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);

  // ── Mở rộng từng Matter ──
  const [expandedRows, setExpandedRows] = useState({});
  const [matterActivities, setMatterActivities] = useState({});
  const [loadingActivities, setLoadingActivities] = useState({});

  // ── Modal Xem chi tiết Activity ──
  const [viewDetailModal, setViewDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ── Modal Sửa Activity ──
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    caseCode: "",
    activityName: "",
    contributionPercentage: 0,
    description: "",
    notes: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // ── Modal Xóa Activity ──
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingActivity, setDeletingActivity] = useState(false);

  // Dùng ref để tránh race condition khi gọi API từ debounce/onSearch
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // ── Fetch Filter Options (Khách hàng, Đối tác, Mã hồ sơ, Team, Staff) ──
  useEffect(() => {
    // 1. Tải khách hàng
    callAPI({ method: "post", endpoint: "/customers/by-name", data: {} })
      .then((res) => {
        const raw = Array.isArray(res) ? res : res?.data || [];
        setCustomerOptions(
          raw.map((c) => ({
            value: c.tenKhachHang || c.maKhachHang,
            label: `${c.tenKhachHang || ""}${c.maKhachHang ? ` (${c.maKhachHang})` : ""}`,
          }))
        );
      })
      .catch(() => {});

    // 2. Tải đối tác
    callAPI({ method: "post", endpoint: "/partner/all", data: {} })
      .then((res) => {
        const raw = Array.isArray(res) ? res : res?.data || [];
        setPartnerOptions(
          raw.map((p) => ({
            value: p.tenDoiTac || p.maDoiTac,
            label: `${p.tenDoiTac || ""}${p.maDoiTac ? ` (${p.maDoiTac})` : ""}`,
          }))
        );
      })
      .catch(() => {});

    // 3. Tải gợi ý mã hồ sơ
    callAPI({ method: "post", endpoint: "/timesheet/case-options", data: { pageSize: 50 } })
      .then((res) => {
        const raw = res?.data || [];
        setCaseOptions(
          raw.map((item) => ({
            value: item.caseCode,
            label: item.caseCode,
          }))
        );
      })
      .catch(() => {});

    // 4. Nếu là Admin/CEO: tải team & staff
    if (isAdmin) {
      callAPI({ method: "post", endpoint: "/team/list", data: { pageSize: 100 } })
        .then((res) => {
          const list = (res?.teams || []).map((t) => ({
            value: t.managerCode,
            label: `${t.managerCode} - ${t.managerName}`,
          }));
          setManagerOptions(list);
        })
        .catch(() => {});

      callAPI({ method: "post", endpoint: "/staff/basiclist", data: {} })
        .then((res) => {
          const raw = Array.isArray(res) ? res : res?.data || [];
          setStaffOptions(
            raw.map((s) => ({
              value: s.maNhanSu,
              label: `${s.maNhanSu} - ${s.hoTen}`,
            }))
          );
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  // ── Fetch danh sách Matter với cơ chế overrides linh hoạt ──
  const fetchMatters = useCallback(
    async (
      overrideFilters = {},
      pi = pagination.pageIndex,
      ps = pagination.pageSize
    ) => {
      setLoading(true);
      const activeFilters = { ...filtersRef.current, ...overrideFilters };

      try {
        const payload = {
          caseCode: activeFilters.caseCode ? activeFilters.caseCode.trim() : undefined,
          customerCode: activeFilters.customerCode ? activeFilters.customerCode.trim() : undefined,
          customerName: activeFilters.customerCode ? activeFilters.customerCode.trim() : undefined,
          partnerCode: activeFilters.partnerCode ? activeFilters.partnerCode.trim() : undefined,
          partnerName: activeFilters.partnerCode ? activeFilters.partnerCode.trim() : undefined,
          fromDate: activeFilters.fromDate || undefined,
          toDate: activeFilters.toDate || undefined,
          employeeCode: isAdmin && activeFilters.employeeCode ? activeFilters.employeeCode : undefined,
          teamManagerCode: isAdmin && activeFilters.teamManagerCode ? activeFilters.teamManagerCode : undefined,
          pageIndex: pi,
          pageSize: ps,
        };

        const res = await callAPI({
          method: "post",
          endpoint: "/timesheet/matter/list",
          data: payload,
        });

        const list = res?.data || [];
        setMatters(list);
        setPagination({
          pageIndex: res?.pagination?.pageIndex || pi,
          pageSize: res?.pagination?.pageSize || ps,
          totalItems: res?.pagination?.totalItems || 0,
        });

        // Tự động lưu cache state phân trang
        localStorage.setItem(
          STATE_STORAGE_KEY,
          JSON.stringify({
            pageIndex: res?.pagination?.pageIndex || pi,
            pageSize: res?.pagination?.pageSize || ps,
            totalItems: res?.pagination?.totalItems || 0,
          })
        );
      } catch (err) {
        console.error("Lỗi khi tải danh sách Matter:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageIndex, pagination.pageSize, isAdmin]
  );

  // ── Cơ chế khôi phục từ localStorage (như trong ApplicationList) ──
  useEffect(() => {
    const savedFiltersStr = localStorage.getItem(FILTER_STORAGE_KEY);
    const savedStateStr = localStorage.getItem(STATE_STORAGE_KEY);

    if (savedFiltersStr) {
      try {
        const savedFilters = JSON.parse(savedFiltersStr);
        const savedState = savedStateStr ? JSON.parse(savedStateStr) : {};

        setFilters((prev) => ({ ...prev, ...savedFilters }));
        filtersRef.current = { ...filtersRef.current, ...savedFilters };

        const targetPage = savedState.pageIndex || 1;
        const targetPageSize = savedState.pageSize || 20;

        fetchMatters(savedFilters, targetPage, targetPageSize);
      } catch (e) {
        console.error("Lỗi parse saved filters:", e);
        fetchMatters({}, 1, 20);
      }
    } else {
      fetchMatters({}, 1, 20);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationType]);

  // ── Lưu filter vào localStorage mỗi khi filter thay đổi ──
  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  // ── Hàm trigger tìm kiếm ngay lập tức khi thay đổi giá trị một trường ──
  const handleFieldSearch = (fieldKey, value) => {
    const nextFilters = { ...filtersRef.current, [fieldKey]: value };
    setFilters(nextFilters);
    filtersRef.current = nextFilters;
    fetchMatters(nextFilters, 1, pagination.pageSize);
  };

  // ── Nút Xóa lọc: Reset toàn bộ và tự động gọi API ──
  const handleClearFilters = () => {
    const emptyFilters = {
      caseCode: "",
      customerCode: "",
      partnerCode: "",
      fromDate: "",
      toDate: "",
      employeeCode: "",
      teamManagerCode: "",
    };
    setFilters(emptyFilters);
    filtersRef.current = emptyFilters;
    localStorage.removeItem(FILTER_STORAGE_KEY);
    localStorage.removeItem(STATE_STORAGE_KEY);
    setExpandedRows({});
    fetchMatters(emptyFilters, 1, pagination.pageSize);
  };

  // ── Fetch Activities cho 1 Matter khi toggle ──
  const fetchActivities = async (caseCode) => {
    if (!caseCode) return;
    setLoadingActivities((prev) => ({ ...prev, [caseCode]: true }));
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/timesheet/matter/activities",
        data: {
          caseCode,
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
        },
      });
      setMatterActivities((prev) => ({
        ...prev,
        [caseCode]: res?.activities || [],
      }));
    } catch (err) {
      console.error(`Lỗi tải activities của ${caseCode}:`, err);
    } finally {
      setLoadingActivities((prev) => ({ ...prev, [caseCode]: false }));
    }
  };

  const toggleRow = (caseCode) => {
    const isOpening = !expandedRows[caseCode];
    setExpandedRows((prev) => ({ ...prev, [caseCode]: isOpening }));
    if (isOpening) {
      fetchActivities(caseCode);
    }
  };

  // ── Xem chi tiết Activity ──
  const handleOpenDetail = async (recordId) => {
    if (!recordId) return;
    setViewDetailModal(true);
    setLoadingDetail(true);
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/timesheet/matter/activity-detail",
        data: { id: recordId },
      });
      setDetailData(res);
    } catch (err) {
      console.error("Lỗi xem chi tiết activity:", err);
      setViewDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Sửa Activity ──
  const handleOpenEdit = (act, caseCode) => {
    setEditForm({
      id: act.latestRecordId,
      caseCode,
      activityName: act.activity,
      contributionPercentage: act.contributionPercentage ?? 0,
      description: act.latestDescription || "",
      notes: act.latestNotes || "",
    });
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    const rate = Number(editForm.contributionPercentage);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      toast.warning("Tỷ lệ đóng góp phải nằm trong khoảng từ 0% đến 100%!");
      return;
    }
    if (editForm.description && editForm.description.length > 10000) {
      toast.warning("Nội dung công việc không được vượt quá 10.000 ký tự!");
      return;
    }

    setSavingEdit(true);
    try {
      await callAPI({
        method: "put",
        endpoint: "/timesheet/matter/activity-edit",
        data: {
          id: editForm.id,
          contributionPercentage: rate,
          description: editForm.description,
          notes: editForm.notes,
        },
      });

      toast.success("Cập nhật công việc thành công!");
      setEditModal(false);
      // Tự động reload lại activities của Matter và reload danh sách Matter
      if (editForm.caseCode) {
        fetchActivities(editForm.caseCode);
      }
      fetchMatters(filtersRef.current, pagination.pageIndex, pagination.pageSize);
    } catch (err) {
      console.error("Lỗi cập nhật activity:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Xóa Activity ──
  const handleConfirmDelete = (act, caseCode) => {
    setDeleteConfirm({
      id: act.latestRecordId,
      activity: act.activity,
      caseCode,
      hasColleagues: Boolean(act.colleagues && act.colleagues.length > 0),
    });
  };

  const handleDeleteActivity = async () => {
    if (!deleteConfirm?.id) return;
    setDeletingActivity(true);
    try {
      await callAPI({
        method: "delete",
        endpoint: "/timesheet/matter/activity-delete",
        data: { id: deleteConfirm.id },
      });

      toast.success("Xóa công việc thành công!");
      const targetCase = deleteConfirm.caseCode;
      setDeleteConfirm(null);
      if (targetCase) {
        fetchActivities(targetCase);
      }
      fetchMatters(filtersRef.current, pagination.pageIndex, pagination.pageSize);
    } catch (err) {
      console.error("Lỗi xóa activity:", err);
    } finally {
      setDeletingActivity(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 bg-gray-100 min-h-screen">
      {/* ── Tiêu đề trang ── */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-l-4 border-[#009999]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Briefcase className="text-[#009999]" size={26} />
              MATTER — Hồ sơ vụ việc
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6f7f7] text-[#009999] border border-[#b2e5e5]">
              {isAdmin ? "Toàn công ty (Admin/CEO)" : isManager ? "Quản lý nhóm (Manager)" : "Cá nhân"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Theo dõi tiến độ, tỷ lệ đóng góp và các đầu việc cụ thể theo từng hồ sơ vụ việc mà bạn hoặc nhóm đang tham gia.
          </p>
        </div>

        <button
          onClick={() => {
            fetchMatters(filtersRef.current, 1, pagination.pageSize);
            setExpandedRows({});
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium self-start md:self-auto cursor-pointer"
        >
          <RefreshCw size={15} />
          Làm mới
        </button>
      </div>

      {/* ── Bộ lọc tìm kiếm theo cơ chế mới (tự động gợi ý, tìm theo mã/tên, Enter/Clear tự reload) ── */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchMatters(filtersRef.current, 1, pagination.pageSize);
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            {/* 1. Mã hồ sơ (Đã bỏ dấu *) */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mã hồ sơ
              </label>
              <SearchCreatableSelect
                value={filters.caseCode}
                onChange={(val) => setFilters((f) => ({ ...f, caseCode: val }))}
                onSearch={(val) => handleFieldSearch("caseCode", val)}
                options={caseOptions}
                placeholder="Chọn hoặc nhập mã hồ sơ..."
              />
            </div>

            {/* 2. Khách hàng (Đổi từ 'Mã khách hàng' -> 'Khách hàng', tìm cả mã và tên) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Khách hàng
              </label>
              <SearchCreatableSelect
                value={filters.customerCode}
                onChange={(val) => setFilters((f) => ({ ...f, customerCode: val }))}
                onSearch={(val) => handleFieldSearch("customerCode", val)}
                options={customerOptions}
                placeholder="Nhập mã hoặc tên khách hàng..."
              />
            </div>

            {/* 3. Đối tác (Đổi từ 'Mã đối tác' -> 'Đối tác', tìm cả mã và tên) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Đối tác
              </label>
              <SearchCreatableSelect
                value={filters.partnerCode}
                onChange={(val) => setFilters((f) => ({ ...f, partnerCode: val }))}
                onSearch={(val) => handleFieldSearch("partnerCode", val)}
                options={partnerOptions}
                placeholder="Nhập mã hoặc tên đối tác..."
              />
            </div>

            {/* 4. Thời gian: Từ ngày - Đến ngày */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Từ ngày</label>
                <DatePicker
                  className="w-full"
                  placeholder="Từ ngày"
                  format="DD/MM/YYYY"
                  value={filters.fromDate ? undefined : null}
                  onChange={(d) => {
                    const str = d ? d.format("YYYY-MM-DD") : "";
                    handleFieldSearch("fromDate", str);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Đến ngày</label>
                <DatePicker
                  className="w-full"
                  placeholder="Đến ngày"
                  format="DD/MM/YYYY"
                  value={filters.toDate ? undefined : null}
                  onChange={(d) => {
                    const str = d ? d.format("YYYY-MM-DD") : "";
                    handleFieldSearch("toDate", str);
                  }}
                />
              </div>
            </div>

            {/* Bộ lọc mở rộng cho Admin/CEO */}
            {isAdmin && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quản lý nhóm (Team)</label>
                  <select
                    value={filters.teamManagerCode}
                    onChange={(e) => handleFieldSearch("teamManagerCode", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#009999] focus:outline-none bg-white h-[38px]"
                  >
                    <option value="">-- Tất cả team --</option>
                    {managerOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nhân viên cụ thể</label>
                  <select
                    value={filters.employeeCode}
                    onChange={(e) => handleFieldSearch("employeeCode", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#009999] focus:outline-none bg-white h-[38px]"
                  >
                    <option value="">-- Toàn công ty --</option>
                    {staffOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Nút Tìm kiếm & Xóa lọc */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-2 rounded-lg shadow transition font-medium text-sm flex items-center justify-center gap-1.5 h-[38px] flex-1 cursor-pointer"
              >
                <Search size={16} />
                Tìm kiếm
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg transition text-sm h-[38px] cursor-pointer whitespace-nowrap"
                title="Xóa toàn bộ bộ lọc và đặt lại danh sách"
              >
                Xóa lọc
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Bảng danh sách MATTER ── */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <Spin spinning={loading}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
              <thead className="bg-[#009999] text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3 w-10 text-center"></th>
                  <th className="p-3 font-semibold text-white">Mã hồ sơ</th>
                  <th className="p-3 font-semibold text-white">Khách hàng</th>
                  <th className="p-3 font-semibold text-white">Đối tác</th>
                  <th className="p-3 font-semibold text-white text-center">Quốc gia</th>
                  <th className="p-3 font-semibold text-white text-center">Tổng giờ</th>
                  <th className="p-3 font-semibold text-white text-center">% Đóng góp</th>
                  <th className="p-3 font-semibold text-white text-center">Số việc</th>
                  <th className="p-3 font-semibold text-white text-center">Nhân sự</th>
                  <th className="p-3 font-semibold text-white text-center">Thời gian</th>
                  <th className="p-3 font-semibold text-white text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {matters.length > 0 ? (
                  matters.map((m) => {
                    const isExpanded = Boolean(expandedRows[m.caseCode]);
                    const acts = matterActivities[m.caseCode] || [];
                    const isLoadingActs = Boolean(loadingActivities[m.caseCode]);

                    return (
                      <React.Fragment key={m.caseCode}>
                        {/* Dòng Matter chính */}
                        <tr
                          className={`hover:bg-[#f0fdfa] transition cursor-pointer ${
                            isExpanded ? "bg-[#f4fbfb]" : "bg-white"
                          }`}
                          onClick={() => toggleRow(m.caseCode)}
                        >
                          <td className="p-3 text-center text-gray-400">
                            {isExpanded ? (
                              <ChevronDown size={18} className="text-[#009999]" />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </td>
                          <td className="p-3 font-bold text-[#009999]">
                            <div className="flex items-center gap-1.5">
                              <span>{m.caseCode}</span>
                              {m.totalContributionPercentage > 100 && (
                                <Tooltip title="Cảnh báo: Tổng đóng góp của hồ sơ này vượt quá 100%">
                                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-300 text-[10px] font-bold">
                                    ⚠️ &gt;100%
                                  </span>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-gray-700 max-w-[200px] truncate" title={m.customerName || m.customerCode}>
                            {m.customerName ? (
                              <div>
                                <p className="font-medium text-gray-800 truncate">{m.customerName}</p>
                                <p className="text-xs text-gray-400">{m.customerCode}</p>
                              </div>
                            ) : (
                              m.customerCode || "-"
                            )}
                          </td>
                          <td className="p-3 text-gray-700 max-w-[180px] truncate" title={m.partnerName || m.partnerCode}>
                            {m.partnerName ? (
                              <div>
                                <p className="font-medium text-gray-800 truncate">{m.partnerName}</p>
                                <p className="text-xs text-gray-400">{m.partnerCode}</p>
                              </div>
                            ) : (
                              m.partnerCode || "-"
                            )}
                          </td>
                          <td className="p-3 text-center text-xs text-gray-600">
                            {m.countryCode ? (
                              <span className="px-2 py-0.5 rounded bg-gray-100 font-medium">
                                {m.countryCode}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-3 text-center font-bold text-orange-600">
                            {Number(m.totalHours || 0).toFixed(1)}h
                          </td>
                          <td className="p-3 text-center">
                            <ContribBadge value={m.totalContributionPercentage} />
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                              {m.activityCount}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
                              {m.employeeCount}
                            </span>
                          </td>
                          <td className="p-3 text-center text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(m.earliestWorkDate)} — {formatDate(m.latestWorkDate)}
                          </td>
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => toggleRow(m.caseCode)}
                              className="px-2.5 py-1 text-xs rounded bg-teal-50 hover:bg-teal-100 text-[#009999] border border-[#009999]/30 font-medium transition flex items-center gap-1 mx-auto cursor-pointer"
                            >
                              <Eye size={13} />
                              {isExpanded ? "Đóng" : "Xem việc"}
                            </button>
                          </td>
                        </tr>

                        {/* Dòng mở rộng: Danh sách Activity thuộc Matter */}
                        {isExpanded && (
                          <tr className="bg-[#f9fafb]">
                            <td colSpan={11} className="p-0 border-b border-gray-200">
                              <div className="p-4 pl-12 bg-gradient-to-b from-[#f4fbfb] to-[#fcfdfd] border-l-4 border-[#009999]">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <FileText size={16} className="text-[#009999]" />
                                    Danh sách công việc trong hồ sơ #{m.caseCode}
                                  </h4>
                                  <span className="text-xs text-gray-500">
                                    Tổng {acts.length} đầu việc ghi nhận
                                  </span>
                                </div>

                                <Spin spinning={isLoadingActs}>
                                  {acts.length > 0 ? (
                                    <div className="overflow-x-auto rounded border border-gray-200 bg-white shadow-sm">
                                      <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-100 text-gray-600 font-semibold border-b">
                                          <tr>
                                            <th className="p-2.5">Hoạt động</th>
                                            <th className="p-2.5">Nhân sự thực hiện</th>
                                            <th className="p-2.5">Nội dung công việc</th>
                                            <th className="p-2.5 text-center">Số giờ</th>
                                            <th className="p-2.5 text-center">% Đóng góp</th>
                                            <th className="p-2.5">Cộng sự</th>
                                            <th className="p-2.5 text-center">Ngày gần nhất</th>
                                            <th className="p-2.5 text-center">Thao tác</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                          {acts.map((act, idx) => {
                                            const isMine =
                                              act.employeeCode === currentMaNhanSu;

                                            return (
                                              <tr
                                                key={idx}
                                                className="hover:bg-teal-50/40 transition"
                                              >
                                                <td className="p-2.5 font-medium text-indigo-700 max-w-[220px]">
                                                  {act.activity}
                                                </td>
                                                <td className="p-2.5 whitespace-nowrap">
                                                  <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-gray-800">
                                                      {act.employeeName || act.employeeCode}
                                                    </span>
                                                    {isMine && (
                                                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                                        Tôi
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p className="text-[11px] text-gray-400">
                                                    {act.employeeCode}
                                                  </p>
                                                </td>
                                                <td
                                                  className="p-2.5 text-gray-600 max-w-[260px] truncate"
                                                  title={act.latestDescription || "-"}
                                                >
                                                  {act.latestDescription || "-"}
                                                  {act.latestNotes && (
                                                    <p className="text-[10px] text-gray-400 italic truncate">
                                                      Ghi chú: {act.latestNotes}
                                                    </p>
                                                  )}
                                                </td>
                                                <td className="p-2.5 text-center font-bold text-orange-600">
                                                  {Number(act.totalHours || 0).toFixed(1)}h
                                                </td>
                                                <td className="p-2.5 text-center">
                                                  <ContribBadge value={act.contributionPercentage} />
                                                </td>
                                                <td className="p-2.5">
                                                  {act.colleagues && act.colleagues.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                      {act.colleagues.map((c, cIdx) => (
                                                        <Tag
                                                          key={cIdx}
                                                          color="cyan"
                                                          className="text-[11px] m-0"
                                                        >
                                                          {c.employeeName || c.employeeCode}
                                                        </Tag>
                                                      ))}
                                                    </div>
                                                  ) : (
                                                    <span className="text-gray-400 italic text-[11px]">
                                                      cá nhân
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="p-2.5 text-center text-gray-500 whitespace-nowrap">
                                                  {formatDate(act.latestWorkDate)}
                                                </td>
                                                <td className="p-2.5 text-center whitespace-nowrap">
                                                  <div className="flex items-center justify-center gap-1">
                                                    <button
                                                      onClick={() => handleOpenDetail(act.latestRecordId)}
                                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                                                      title="Xem chi tiết"
                                                    >
                                                      <Eye size={15} />
                                                    </button>

                                                    {/* Chỉ cho phép sửa/xóa nếu là time record của chính mình */}
                                                    {isMine && (
                                                      <>
                                                        <button
                                                          onClick={() => handleOpenEdit(act, m.caseCode)}
                                                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition cursor-pointer"
                                                          title="Chỉnh sửa công việc của tôi"
                                                        >
                                                          <Edit2 size={15} />
                                                        </button>
                                                        <button
                                                          onClick={() => handleConfirmDelete(act, m.caseCode)}
                                                          className="p-1 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                                          title="Xóa công việc của tôi"
                                                        >
                                                          <Trash2 size={15} />
                                                        </button>
                                                      </>
                                                    )}
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="p-4 text-center text-gray-400 bg-white rounded border text-xs">
                                      Không có activity nào trong hồ sơ này
                                    </div>
                                  )}
                                </Spin>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-gray-400">
                      Không tìm thấy hồ sơ nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Spin>

        {/* Phân trang */}
        <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Tổng cộng <strong>{pagination.totalItems}</strong> hồ sơ
          </span>
          <Pagination
            current={pagination.pageIndex}
            total={pagination.totalItems}
            pageSize={pagination.pageSize}
            showSizeChanger
            pageSizeOptions={["10", "20", "50", "100"]}
            onChange={(p, s) => fetchMatters(filtersRef.current, p, s)}
            size="small"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODAL XEM CHI TIẾT ACTIVITY
      ══════════════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-800">
            <Eye className="text-[#009999]" size={20} />
            Chi tiết công việc #{detailData?.caseCode}
          </div>
        }
        open={viewDetailModal}
        onCancel={() => setViewDetailModal(false)}
        footer={[
          <button
            key="close"
            onClick={() => setViewDetailModal(false)}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Đóng
          </button>,
        ]}
        width={650}
      >
        <Spin spinning={loadingDetail}>
          {detailData ? (
            <div className="space-y-4 py-2 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 block">Mã hồ sơ:</span>
                  <span className="font-bold text-[#009999]">{detailData.caseCode || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Hoạt động:</span>
                  <span className="font-semibold text-indigo-700">{detailData.activity}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Nhân sự thực hiện:</span>
                  <span className="font-medium text-gray-800">
                    {detailData.employeeName} ({detailData.employeeCode})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Ngày ghi nhận:</span>
                  <span>{formatDate(detailData.workDate)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Số giờ làm:</span>
                  <span className="font-bold text-orange-600">{Number(detailData.hours || 0)} giờ</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Tỷ lệ đóng góp:</span>
                  <ContribBadge value={detailData.contributionPercentage} />
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Khách hàng:</span>
                  <span>{detailData.customerName || detailData.customerCode || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Đối tác:</span>
                  <span>{detailData.partnerName || detailData.partnerCode || "-"}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">
                  Nội dung công việc:
                </label>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {detailData.description || <span className="italic text-gray-400">Không có nội dung mô tả</span>}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">
                  Ghi chú:
                </label>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {detailData.notes || <span className="italic text-gray-400">Không có ghi chú</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">Không có dữ liệu</div>
          )}
        </Spin>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL SỬA ACTIVITY
      ══════════════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-800">
            <Edit2 className="text-[#009999]" size={20} />
            Chỉnh sửa công việc: {editForm.activityName}
          </div>
        }
        open={editModal}
        onCancel={() => setEditModal(false)}
        footer={[
          <button
            key="cancel"
            onClick={() => setEditModal(false)}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition mr-2 cursor-pointer"
          >
            Hủy
          </button>,
          <button
            key="submit"
            onClick={handleSaveEdit}
            disabled={savingEdit}
            className="px-5 py-1.5 bg-[#009999] hover:bg-[#007a7a] text-white rounded-lg text-sm font-medium transition shadow cursor-pointer"
          >
            {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
          </button>,
        ]}
        width={580}
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-gray-500 bg-amber-50 p-2.5 rounded border border-amber-200">
            💡 Lưu ý: Bạn chỉ được phép điều chỉnh <strong>Tỷ lệ đóng góp (%)</strong>,{" "}
            <strong>Nội dung công việc</strong> và <strong>Ghi chú</strong>. Dữ liệu sẽ tự động đồng bộ về Time Record của bạn trong MYTIME.
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Tỷ lệ đóng góp vào hồ sơ (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={editForm.contributionPercentage}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  contributionPercentage: e.target.value,
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-[#009999] focus:outline-none"
              placeholder="Nhập tỷ lệ từ 0 - 100%"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nội dung công việc
            </label>
            <textarea
              rows={4}
              maxLength={10000}
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-[#009999] focus:outline-none resize-y"
              placeholder="Nhập nội dung công việc thực hiện..."
            />
            <div className="text-right text-[11px] text-gray-400 mt-0.5">
              {(editForm.description || "").length} / 10.000 ký tự
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Ghi chú thêm
            </label>
            <textarea
              rows={3}
              value={editForm.notes}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-[#009999] focus:outline-none resize-y"
              placeholder="Nhập ghi chú (nếu có)..."
            />
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL XÁC NHẬN XÓA ACTIVITY
      ══════════════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-red-600">
            <Trash2 size={20} />
            Xác nhận xóa công việc
          </div>
        }
        open={Boolean(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        footer={[
          <button
            key="cancel"
            onClick={() => setDeleteConfirm(null)}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition mr-2 cursor-pointer"
          >
            Hủy
          </button>,
          <button
            key="del"
            onClick={handleDeleteActivity}
            disabled={deletingActivity}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition shadow cursor-pointer"
          >
            {deletingActivity ? "Đang xóa..." : "Xác nhận xóa"}
          </button>,
        ]}
      >
        <div className="py-2 text-sm text-gray-700 space-y-2">
          <p>
            Bạn có chắc chắn muốn xóa bản ghi hoạt động:{" "}
            <strong className="text-indigo-700">{deleteConfirm?.activity}</strong> trong hồ sơ{" "}
            <strong className="text-[#009999]">#{deleteConfirm?.caseCode}</strong>?
          </p>
          {deleteConfirm?.hasColleagues ? (
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
              ⚠️ <strong>Lưu ý:</strong> Hoạt động này có đồng nghiệp khác cùng tham gia. Thao tác này chỉ xóa phần ghi nhận và tỷ lệ đóng góp của riêng bạn, các đồng nghiệp khác vẫn được bảo lưu dữ liệu.
            </p>
          ) : (
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Bản ghi công việc của bạn trong hồ sơ này sẽ bị xóa vĩnh viễn khỏi module Timesheet.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
