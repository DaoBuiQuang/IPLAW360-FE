import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Modal, Select, Pagination, Spin, Tooltip, Input, message } from "antd";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Search,
  RefreshCw,
  BarChart2,
  Mail,
  Phone,
  Shield,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import callAPI from "../../utils/api";

export default function TeamManagement() {
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);
  const currentMaNhanSu = localStorage.getItem("maNhanSu") || "";

  // ── Danh sách teams ──
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // ── Danh sách tất cả nhân sự để chọn vào team ──
  const [allStaff, setAllStaff] = useState([]);

  // ── State cho modal Thêm 1 thành viên ──
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [targetTeam, setTargetTeam] = useState(null); // { managerCode, managerName, members }
  const [selectedStaffToAdd, setSelectedStaffToAdd] = useState([]); // mảng maNhanSu để hỗ trợ bulk-add
  const [groupNameInput, setGroupNameInput] = useState("");
  const [savingAdd, setSavingAdd] = useState(false);

  // ── State cho modal Chỉnh sửa toàn bộ team (set-team) ──
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingManagerCode, setEditingManagerCode] = useState("");
  const [selectedMembersForSet, setSelectedMembersForSet] = useState([]);
  const [savingSet, setSavingSet] = useState(false);

  // ── State cho modal Xóa thành viên ──
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null); // { nhomId, maNhanSu, hoTen, managerCode }
  const [deleting, setDeleting] = useState(false);

  // ── State cho modal Tạo Team mới & Chỉ định Trưởng nhóm ──
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [newManagerCode, setNewManagerCode] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  // ── Fetch danh sách teams ──
  const fetchTeams = useCallback(
    async (search = searchText, page = pageIndex, size = pageSize) => {
      setLoading(true);
      try {
        const res = await callAPI({
          method: "post",
          endpoint: "/team/list",
          data: {
            searchText: search || undefined,
            pageIndex: page,
            pageSize: size,
          },
        });

        // BE trả về { success, teams: [...], pagination: { pageIndex, pageSize, totalItems } }
        const teamList = res?.teams || res?.data || (Array.isArray(res) ? res : []);
        setTeams(teamList);
        if (res?.pagination) {
          setTotalItems(res.pagination.totalItems || 0);
          setPageIndex(res.pagination.pageIndex || page);
          setPageSize(res.pagination.pageSize || size);
        } else {
          setTotalItems(teamList.length);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách team:", err);
        toast.error("Không thể tải danh sách team. Vui lòng kiểm tra quyền truy cập.");
      } finally {
        setLoading(false);
      }
    },
    [searchText, pageIndex, pageSize]
  );

  // ── Fetch danh sách tất cả nhân sự để gán vào team ──
  const fetchAllStaff = useCallback(async () => {
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/staff/basiclist",
        data: {},
      });
      const list = Array.isArray(res) ? res : res?.data || [];
      setAllStaff(list);
    } catch (err) {
      console.error("Lỗi khi lấy basic staff list:", err);
    }
  }, []);

  useEffect(() => {
    fetchTeams("", 1, pageSize);
    fetchAllStaff();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Xử lý tìm kiếm ──
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeams(searchText, 1, pageSize);
  };

  // ── Mở modal Thêm thành viên ──
  const handleOpenAddModal = (team) => {
    setTargetTeam(team);
    setSelectedStaffToAdd([]);
    setGroupNameInput(team?.members?.[0]?.tenNhom || "");
    setAddModalOpen(true);
  };

  // ── Lưu Thêm thành viên (gọi bulk-add nếu nhiều hoặc add-member nếu 1) ──
  const handleSaveAddMembers = async () => {
    if (!selectedStaffToAdd || selectedStaffToAdd.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 nhân sự để thêm vào team!");
      return;
    }

    setSavingAdd(true);
    try {
      if (selectedStaffToAdd.length === 1) {
        // Gọi /team/add-member
        const res = await callAPI({
          method: "post",
          endpoint: "/team/add-member",
          data: {
            managerCode: targetTeam.managerCode,
            maNhanSu: selectedStaffToAdd[0],
            tenNhom: groupNameInput || undefined,
          },
        });
        toast.success(res?.message || "Đã thêm thành viên vào team thành công!");
      } else {
        // Gọi /team/bulk-add
        const res = await callAPI({
          method: "post",
          endpoint: "/team/bulk-add",
          data: {
            managerCode: targetTeam.managerCode,
            members: selectedStaffToAdd,
            tenNhom: groupNameInput || undefined,
          },
        });
        const addedCount = res?.results?.added?.length || selectedStaffToAdd.length;
        toast.success(`Đã thêm thành công ${addedCount} thành viên vào team!`);
      }

      setAddModalOpen(false);
      fetchTeams(searchText, pageIndex, pageSize);
    } catch (err) {
      console.error("Lỗi thêm thành viên:", err);
      if (err?.response?.status === 409) {
        toast.warning(err?.response?.data?.message || "Nhân sự này đã có trong nhóm!");
      } else {
        toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi thêm thành viên.");
      }
    } finally {
      setSavingAdd(false);
    }
  };

  // ── Mở modal Chỉnh sửa team (set-team) ──
  const handleOpenEditTeamModal = (team) => {
    setTargetTeam(team);
    setEditingManagerCode(team.managerCode);
    const existingMemberCodes = (team.members || []).map((m) => m.maNhanSu);
    setSelectedMembersForSet(existingMemberCodes);
    setGroupNameInput(team?.members?.[0]?.tenNhom || "");
    setEditModalOpen(true);
  };

  // ── Lưu thiết lập lại toàn bộ team (set-team) ──
  const handleSaveSetTeam = async () => {
    setSavingSet(true);
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/team/set-team",
        data: {
          managerCode: editingManagerCode || targetTeam.managerCode,
          members: selectedMembersForSet,
          tenNhom: groupNameInput || undefined,
        },
      });
      toast.success(res?.message || "Đã cập nhật danh sách thành viên team thành công!");
      setEditModalOpen(false);
      fetchTeams(searchText, pageIndex, pageSize);
    } catch (err) {
      console.error("Lỗi cập nhật team:", err);
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật team.");
    } finally {
      setSavingSet(false);
    }
  };

  // ── Xác nhận xóa thành viên khỏi team ──
  const handleConfirmDeleteMember = (team, member) => {
    setMemberToDelete({
      nhomId: member.nhomId,
      maNhanSu: member.maNhanSu,
      hoTen: member.hoTen,
      managerCode: team.managerCode,
    });
    setDeleteModalOpen(true);
  };

  const handleExecuteDeleteMember = async () => {
    if (!memberToDelete) return;
    setDeleting(true);
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/team/remove-member",
        data: {
          nhomId: memberToDelete.nhomId || undefined,
          maNhanSu: memberToDelete.maNhanSu,
          managerCode: memberToDelete.managerCode,
        },
      });
      toast.success(res?.message || `Đã xóa ${memberToDelete.hoTen} khỏi team thành công!`);
      setDeleteModalOpen(false);
      setMemberToDelete(null);
      fetchTeams(searchText, pageIndex, pageSize);
    } catch (err) {
      console.error("Lỗi xóa thành viên:", err);
      toast.error(err?.response?.data?.message || "Không thể xóa thành viên khỏi team.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Tạo Team mới & Chỉ định Trưởng nhóm ──
  const handleOpenCreateTeamModal = () => {
    setNewManagerCode("");
    setNewTeamMembers([]);
    setNewTeamName("");
    setCreateTeamModalOpen(true);
  };

  const handleExecuteCreateTeam = async () => {
    if (!newManagerCode) {
      toast.warning("Vui lòng chọn nhân sự làm Trưởng nhóm!");
      return;
    }
    setCreatingTeam(true);
    try {
      // 1. Cập nhật role thành manager nếu có API update-role
      try {
        await callAPI({
          method: "post",
          endpoint: "/staff/update-role",
          data: { maNhanSu: newManagerCode, role: "manager" },
        });
      } catch {
        // Tiếp tục nếu BE chưa có endpoint này
      }

      // 2. Thiết lập team cho Trưởng nhóm này
      const res = await callAPI({
        method: "post",
        endpoint: "/team/set-team",
        data: {
          managerCode: newManagerCode,
          members: newTeamMembers,
          tenNhom: newTeamName || undefined,
        },
      });
      toast.success(res?.message || "Đã tạo team mới và chỉ định Trưởng nhóm thành công!");
      setCreateTeamModalOpen(false);
      fetchTeams(searchText, pageIndex, pageSize);
    } catch (err) {
      console.error("Lỗi khi tạo team:", err);
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi tạo team mới.");
    } finally {
      setCreatingTeam(false);
    }
  };

  // Lọc danh sách nhân sự chưa có trong team hiện tại để gợi ý khi thêm
  const availableStaffToAdd = allStaff.filter((s) => {
    if (!targetTeam) return true;
    const currentMemberCodes = (targetTeam.members || []).map((m) => m.maNhanSu);
    return !currentMemberCodes.includes(s.maNhanSu);
  });

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* ── Page Header ── */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#009999]/10 text-[#009999] rounded-xl">
              <Users size={24} />
            </span>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Team & Cơ cấu nhóm</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập cơ cấu phân công nhân sự trực thuộc từng Trưởng nhóm (Manager)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateTeamModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#009999] hover:bg-[#007a7a] text-white rounded-xl shadow-xs transition cursor-pointer text-sm font-semibold"
          >
            <UserPlus size={15} />
            <span>+ Tạo Team mới</span>
          </button>
          <button
            onClick={() => fetchTeams(searchText, pageIndex, pageSize)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition cursor-pointer text-sm font-medium"
            title="Tải lại danh sách"
          >
            <RefreshCw size={15} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, họ tên trưởng nhóm hoặc thành viên..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#009999] focus:ring-2 focus:ring-[#009999]/10 transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#009999] hover:bg-[#007a7a] text-white rounded-xl text-sm font-medium transition cursor-pointer shadow-sm"
          >
            Tìm kiếm
          </button>
          {searchText && (
            <button
              type="button"
              onClick={() => {
                setSearchText("");
                fetchTeams("", 1, pageSize);
              }}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition cursor-pointer"
            >
              Xóa tìm kiếm
            </button>
          )}
        </form>
      </div>

      {/* ── Team List Grid ── */}
      <Spin spinning={loading}>
        {teams.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-3">
              <Users size={28} />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">Chưa có team nào</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Không tìm thấy nhóm nhân sự nào phù hợp với bộ lọc. Hãy kiểm tra danh sách Manager hoặc gán thành viên mới.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {teams.map((team) => {
              const members = team.members || [];
              const groupTitle = members[0]?.tenNhom || `Team ${team.managerName || team.managerCode}`;

              return (
                <div
                  key={team.managerCode}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-4 bg-gradient-to-r from-teal-50/60 to-white border-b border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#009999] text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {(team.managerName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800 text-base">
                            {team.managerName || "Chưa có tên"}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Trưởng nhóm
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Mã: <span className="font-mono font-medium text-gray-700">{team.managerCode}</span>
                          {members[0]?.tenNhom && (
                            <>
                              {" · "}
                              <span className="text-[#009999] font-medium">{members[0].tenNhom}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Member Count Badge */}
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-semibold shadow-xs">
                        {members.length} thành viên
                      </span>
                    </div>
                  </div>

                  {/* Card Action Toolbar */}
                  <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAddModal(team)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#009999]/10 hover:bg-[#009999] hover:text-white text-[#009999] rounded-lg font-medium transition cursor-pointer"
                      >
                        <UserPlus size={13} />
                        <span>+ Thêm thành viên</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditTeamModal(team)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Chỉnh sửa team</span>
                      </button>
                    </div>

                    <button
                      onClick={() => navigate(`/timesheet/myteam?managerCode=${team.managerCode}`)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:text-[#009999] font-medium transition cursor-pointer"
                    >
                      <BarChart2 size={13} />
                      <span>Xem KPI team →</span>
                    </button>
                  </div>

                  {/* Members Table */}
                  <div className="flex-1 overflow-x-auto">
                    {members.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-xs">
                        Chưa có thành viên nào trong team này. Nhấn{" "}
                        <strong className="text-[#009999]">+ Thêm thành viên</strong> để gán nhân sự.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-[#009999] text-white">
                          <tr>
                            <th className="px-4 py-2.5 font-semibold text-white">Nhân sự</th>
                            <th className="px-3 py-2.5 font-semibold text-white">Chức vụ</th>
                            <th className="px-3 py-2.5 font-semibold text-white">Liên hệ</th>
                            <th className="px-3 py-2.5 font-semibold text-white">Vai trò</th>
                            <th className="px-3 py-2.5 font-semibold text-white text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {members.map((m) => (
                            <tr key={m.nhomId || m.maNhanSu} className="hover:bg-teal-50/30 transition">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    {(m.hoTen || "?").charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-800 leading-tight">
                                      {m.hoTen || m.maNhanSu}
                                    </p>
                                    <p className="text-[11px] text-gray-400 font-mono">{m.maNhanSu}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="text-gray-700">{m.chucVu || m.phongBan || "Nhân viên"}</span>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="space-y-0.5">
                                  {m.email && (
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <Mail size={11} className="text-gray-400 flex-shrink-0" />
                                      <span className="truncate max-w-[130px]">{m.email}</span>
                                    </div>
                                  )}
                                  {m.sdt && (
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <Phone size={11} className="text-gray-400 flex-shrink-0" />
                                      <span>{m.sdt}</span>
                                    </div>
                                  )}
                                  {!m.email && !m.sdt && <span className="text-gray-300">-</span>}
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    m.role === "manager"
                                      ? "bg-purple-50 text-purple-700 border-purple-200"
                                      : m.role === "admin"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-gray-100 text-gray-600 border-gray-200"
                                  }`}
                                >
                                  {m.role || "staff"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <Tooltip title="Xóa khỏi team">
                                  <button
                                    onClick={() => handleConfirmDeleteMember(team, m)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </Tooltip>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalItems > pageSize && (
          <div className="mt-6 flex justify-end">
            <Pagination
              current={pageIndex}
              pageSize={pageSize}
              total={totalItems}
              onChange={(page, size) => {
                setPageIndex(page);
                setPageSize(size);
                fetchTeams(searchText, page, size);
              }}
              showSizeChanger
              pageSizeOptions={["10", "20", "50"]}
            />
          </div>
        )}
      </Spin>

      {/* ════════════════════════════════════════
           MODAL: THÊM THÀNH VIÊN VÀO TEAM
          ════════════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-800">
            <UserPlus size={18} className="text-[#009999]" />
            <span>Thêm thành viên vào {targetTeam ? `Team ${targetTeam.managerName}` : "Team"}</span>
          </div>
        }
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={handleSaveAddMembers}
        confirmLoading={savingAdd}
        okText="Thêm thành viên"
        cancelText="Hủy bỏ"
        okButtonProps={{ className: "bg-[#009999] hover:bg-[#007a7a] cursor-pointer" }}
        width={540}
      >
        <div className="py-3 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Trưởng nhóm phụ trách
            </label>
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 flex items-center justify-between">
              <span>{targetTeam?.managerName}</span>
              <span className="text-xs font-mono text-gray-500">{targetTeam?.managerCode}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Chọn nhân sự muốn thêm vào team <span className="text-red-500">*</span>
            </label>
            <Select
              mode="multiple"
              allowClear
              className="w-full"
              placeholder="Tìm kiếm và chọn một hoặc nhiều nhân sự..."
              value={selectedStaffToAdd}
              onChange={(values) => setSelectedStaffToAdd(values)}
              options={availableStaffToAdd.map((s) => ({
                value: s.maNhanSu,
                label: `${s.maNhanSu} - ${s.hoTen} (${s.chucVu || "Nhân viên"})`,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Có thể chọn nhiều nhân viên cùng lúc để thêm theo lô (bulk-add).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Tên nhóm (tùy chọn)
            </label>
            <Input
              placeholder="VD: Nhóm Nhãn hiệu 1, Team IP..."
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              className="rounded-xl text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════════════════
           MODAL: THIẾT LẬP LẠI TOÀN BỘ TEAM (SET-TEAM)
          ════════════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-800">
            <Edit3 size={18} className="text-[#009999]" />
            <span>Thiết lập lại danh sách team (Set Team)</span>
          </div>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSaveSetTeam}
        confirmLoading={savingSet}
        okText="Lưu danh sách mới"
        cancelText="Hủy bỏ"
        okButtonProps={{ className: "bg-[#009999] hover:bg-[#007a7a] cursor-pointer" }}
        width={580}
      >
        <div className="py-3 space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 leading-relaxed">
            ⚠️ <strong>Lưu ý:</strong> Chức năng này sẽ <strong>thay thế hoàn toàn</strong> danh sách thành viên hiện tại của team bằng danh sách mới được chọn dưới đây.
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Trưởng nhóm phụ trách
            </label>
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 flex items-center justify-between">
              <span>{targetTeam?.managerName}</span>
              <span className="text-xs font-mono text-gray-500">{targetTeam?.managerCode}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Danh sách thành viên trực thuộc <span className="text-red-500">*</span>
            </label>
            <Select
              mode="multiple"
              allowClear
              className="w-full"
              placeholder="Chọn các thành viên của team..."
              value={selectedMembersForSet}
              onChange={(values) => setSelectedMembersForSet(values)}
              options={allStaff.map((s) => ({
                value: s.maNhanSu,
                label: `${s.maNhanSu} - ${s.hoTen} (${s.chucVu || "Nhân viên"})`,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Đang chọn: <strong>{selectedMembersForSet.length}</strong> nhân sự.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Tên nhóm (tùy chọn)
            </label>
            <Input
              placeholder="VD: Nhóm Nhãn hiệu 1, Team IP..."
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              className="rounded-xl text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════════════════
           MODAL: XÁC NHẬN XÓA THÀNH VIÊN KHỎI TEAM
          ════════════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <Trash2 size={18} />
            <span>Xác nhận xóa thành viên khỏi team</span>
          </div>
        }
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        onOk={handleExecuteDeleteMember}
        confirmLoading={deleting}
        okText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        okButtonProps={{ danger: true, className: "cursor-pointer" }}
      >
        <div className="py-3 text-sm text-gray-600">
          Bạn có chắc chắn muốn xóa nhân sự{" "}
          <strong className="text-gray-900">{memberToDelete?.hoTen}</strong> (
          <span className="font-mono text-gray-500">{memberToDelete?.maNhanSu}</span>) ra khỏi
          nhóm này không?
        </div>
      </Modal>

      {/* ════════════════════════════════════════
           MODAL: TẠO TEAM MỚI & CHỈ ĐỊNH TRƯỞNG NHÓM
          ════════════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-800">
            <UserPlus size={18} className="text-[#009999]" />
            <span>Tạo Team mới & Chỉ định Trưởng nhóm</span>
          </div>
        }
        open={createTeamModalOpen}
        onCancel={() => setCreateTeamModalOpen(false)}
        onOk={handleExecuteCreateTeam}
        confirmLoading={creatingTeam}
        okText="Tạo Team & Lưu"
        cancelText="Hủy bỏ"
        okButtonProps={{ className: "bg-[#009999] hover:bg-[#007a7a] cursor-pointer" }}
        width={580}
      >
        <div className="py-3 space-y-4">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-800 leading-relaxed">
            💡 <strong>Chỉ định Trưởng nhóm:</strong> Chọn nhân sự để làm Trưởng nhóm (Manager) của team mới. Nhân sự này sẽ có quyền xem KPI team và quản lý danh sách thành viên trực thuộc.
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Chỉ định Trưởng nhóm (Manager) <span className="text-red-500">*</span>
            </label>
            <Select
              className="w-full"
              placeholder="Chọn nhân sự làm Trưởng nhóm..."
              value={newManagerCode || undefined}
              onChange={(val) => {
                setNewManagerCode(val);
                // Loại bỏ manager khỏi danh sách thành viên nếu đang chọn
                setNewTeamMembers((prev) => prev.filter((code) => code !== val));
              }}
              options={allStaff.map((s) => ({
                value: s.maNhanSu,
                label: `${s.maNhanSu} - ${s.hoTen} (${s.chucVu || "Nhân viên"})`,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Tên nhóm / Team (tùy chọn)
            </label>
            <Input
              placeholder="VD: Nhóm Nhãn hiệu 1, Team Sở hữu trí tuệ..."
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Chọn các thành viên ban đầu vào team
            </label>
            <Select
              mode="multiple"
              allowClear
              className="w-full"
              placeholder="Chọn các thành viên trực thuộc..."
              value={newTeamMembers}
              onChange={(values) => setNewTeamMembers(values)}
              options={allStaff
                .filter((s) => s.maNhanSu !== newManagerCode)
                .map((s) => ({
                  value: s.maNhanSu,
                  label: `${s.maNhanSu} - ${s.hoTen} (${s.chucVu || "Nhân viên"})`,
                }))}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Đã chọn: <strong>{newTeamMembers.length}</strong> thành viên trực thuộc.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
