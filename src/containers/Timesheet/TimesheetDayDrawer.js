import React, { useState } from "react";
import { Drawer, Modal } from "antd";
import { toast } from "react-toastify";
import TimesheetForm from "./TimesheetForm";
import callAPI from "../../utils/api";

const money = (v) => Number(v || 0).toLocaleString("vi-VN");

const statusMap = {
  DRAFT: "Nháp",
  SUBMITTED: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  LOCKED: "Đã chốt",
};

const statusColor = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
  LOCKED: "bg-indigo-100 text-indigo-700",
};

/** Một ô thông tin (label + value) */
function InfoField({ label, value, accent = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`text-sm font-semibold ${
          accent ? "text-[#009999]" : "text-gray-800"
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

/**
 * Mode "detail": hiển thị đầy đủ thông tin một time record
 */
function RecordDetail({ record, onEdit, onDelete }) {
  return (
    <div className="flex flex-col h-full">
      {/* Banner tổng giờ */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#009999]/10 via-transparent to-transparent border-b border-gray-100">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Số giờ</p>
            <span className="text-3xl font-bold text-orange-600">
              {Number(record.hours || 0)}h
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusColor[record.status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {statusMap[record.status] || record.status || "Đã duyệt"}
          </span>
        </div>
      </div>

      {/* Nội dung chi tiết */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Hoạt động + Mã hồ sơ */}
        <div className="grid grid-cols-2 gap-4">
          <InfoField label="Hoạt động" value={record.activity} accent />
          <InfoField label="Mã hồ sơ" value={record.caseCode} accent />
        </div>

        {/* Nhân sự */}
        <InfoField
          label="Nhân sự"
          value={
            record.employee?.hoTen
              ? `${record.employee.hoTen} (${record.employeeCode})`
              : record.employeeCode
          }
        />

        {/* Phòng ban */}
        {record.employee?.phongBan && (
          <InfoField label="Phòng ban" value={record.employee.phongBan} />
        )}

        {/* Tài chính */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl">
          <InfoField
            label="Đơn giá/giờ"
            value={record.hourlyRate ? `${money(record.hourlyRate)} đ` : "—"}
          />
          <InfoField
            label="Thành tiền"
            value={record.totalAmount ? `${money(record.totalAmount)} đ` : "—"}
            accent
          />
        </div>

        {/* Nội dung công việc */}
        {record.description && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Nội dung công việc
            </span>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">
              {record.description}
            </p>
          </div>
        )}

        {/* Ghi chú */}
        {record.notes && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Ghi chú
            </span>
            <p className="text-sm text-gray-600 leading-relaxed bg-amber-50 rounded-xl p-3 border border-amber-100">
              {record.notes}
            </p>
          </div>
        )}

        {/* Người duyệt */}
        {record.approvedBy && (
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Người duyệt" value={record.approvedBy} />
            {record.approvedAt && (
              <InfoField label="Thời điểm duyệt" value={record.approvedAt} />
            )}
          </div>
        )}

        {/* Lý do từ chối */}
        {record.rejectionReason && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-red-400 font-medium uppercase tracking-wide">
              Lý do từ chối
            </span>
            <p className="text-sm text-red-700 bg-red-50 rounded-xl p-3 border border-red-100">
              {record.rejectionReason}
            </p>
          </div>
        )}
      </div>

      {/* Nút hành động */}
      <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
        <button
          onClick={() => onEdit(record)}
          className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 font-semibold text-sm transition"
        >
          ✏️ Chỉnh sửa
        </button>
        <button
          onClick={() => onDelete(record)}
          className="flex-1 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition"
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  );
}

/**
 * Một dòng record trong danh sách ngày — click vào card body để xem chi tiết
 */
function RecordRow({ record, onView, onEdit, onDelete }) {
  return (
    <div
      className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-[#f0fdfa] hover:border-[#009999]/30 transition group cursor-pointer"
      onClick={() => onView(record)}
      title="Click để xem chi tiết"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
            {record.activity}
          </span>
          {record.caseCode && (
            <span className="inline-block px-2 py-0.5 bg-[#009999]/10 text-[#009999] text-xs font-medium rounded-full">
              {record.caseCode}
            </span>
          )}
        </div>
        {record.description && (
          <p className="text-xs text-gray-500 mt-1.5 truncate">{record.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-orange-600">
            {Number(record.hours || 0)}h
          </span>
          {record.totalAmount > 0 && (
            <span className="text-xs text-gray-400">
              • {money(record.totalAmount)} đ
            </span>
          )}
        </div>
      </div>
      {/* Buttons — stopPropagation để không trigger onView khi click Sửa/Xóa */}
      <div className="flex flex-col gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onEdit(record)}
          className="px-2.5 py-1 bg-gray-200 hover:bg-blue-100 hover:text-blue-700 text-gray-600 rounded-lg text-xs font-medium transition"
        >
          Sửa ✏️
        </button>
        <button
          onClick={() => onDelete(record)}
          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-medium transition"
        >
          Xóa 🗑️
        </button>
      </div>
    </div>
  );
}

/**
 * Drawer hiển thị time records của một ngày cụ thể.
 * Modes: "list" | "detail" | "add" | "edit"
 */
export default function TimesheetDayDrawer({ open, date, records = [], onClose, onRefresh }) {
  const [mode, setMode] = useState("list");
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const formatDisplay = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const totalHours = records.reduce((s, r) => s + Number(r.hours || 0), 0);

  const handleView = (record) => {
    setViewingRecord(record);
    setMode("detail");
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setViewingRecord(null);
    setMode("edit");
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setViewingRecord(null);
    setMode("add");
  };

  const handleFormSaved = () => {
    setMode("list");
    setEditingRecord(null);
    setViewingRecord(null);
    onRefresh();
  };

  const handleBack = () => {
    setMode("list");
    setEditingRecord(null);
    setViewingRecord(null);
  };

  const handleDeleteFromDetail = (record) => {
    // Mở confirm modal từ mode detail
    setDeletingRecord(record);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    setDeleting(true);
    try {
      await callAPI({
        method: "delete",
        endpoint: "/timesheet/delete",
        data: { id: deletingRecord.id },
      });
      toast.success("Xóa thành công!", { position: "top-right", autoClose: 2500 });
      setDeletingRecord(null);
      // Nếu đang ở detail thì quay về list
      if (mode === "detail") setMode("list");
      setViewingRecord(null);
      onRefresh();
    } catch {
      toast.error("Có lỗi xảy ra khi xóa!", { position: "top-right", autoClose: 2500 });
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setMode("list");
    setEditingRecord(null);
    setViewingRecord(null);
    onClose();
  };

  const handleAfterOpenChange = (visible) => {
    if (!visible) {
      setMode("list");
      setEditingRecord(null);
      setViewingRecord(null);
    }
  };

  const drawerTitle = {
    list: `📅 ${formatDisplay(date)}`,
    detail: "🔍 Chi tiết time record",
    add: "➕ Thêm time record",
    edit: "✏️ Chỉnh sửa time record",
  }[mode] || `📅 ${formatDisplay(date)}`;

  const drawerSubtitle =
    mode === "list"
      ? records.length > 0
        ? `${records.length} bản ghi • Tổng ${totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}h`
        : "Chưa có time record"
      : null;

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center gap-3">
            {mode !== "list" && (
              <button
                onClick={handleBack}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition shrink-0"
                title="Quay lại"
              >
                ←
              </button>
            )}
            <div>
              <p className="text-base font-bold text-gray-800 leading-tight">
                {drawerTitle}
              </p>
              {drawerSubtitle && (
                <p className="text-xs text-gray-400 font-normal mt-0.5">
                  {drawerSubtitle}
                </p>
              )}
            </div>
          </div>
        }
        open={open}
        onClose={handleClose}
        afterOpenChange={handleAfterOpenChange}
        width={540}
        styles={{
          body: { padding: 0 },
          header: { borderBottom: "1px solid #f0f0f0" },
        }}
        closeIcon={<span className="text-gray-400 hover:text-gray-600 text-lg">✕</span>}
      >
        {/* ===== Mode: Danh sách ===== */}
        {mode === "list" && (
          <div className="flex flex-col h-full">
            {records.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#009999]/10 to-transparent border-b border-gray-100">
                <span className="text-sm text-gray-600">Tổng giờ hôm nay</span>
                <span
                  className={`text-xl font-bold ${
                    totalHours >= 8 ? "text-green-600" : "text-orange-500"
                  }`}
                >
                  {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}h
                  {totalHours >= 8 && <span className="text-sm ml-1">✅</span>}
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-gray-500 font-medium">Chưa có time record nào</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Nhấn nút bên dưới để thêm công việc
                  </p>
                </div>
              ) : (
                records.map((rec) => (
                  <RecordRow
                    key={rec.id}
                    record={rec}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={setDeletingRecord}
                  />
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-[#009999] hover:bg-[#007a7a] text-white font-semibold text-sm transition shadow-sm"
              >
                + Thêm time record
              </button>
            </div>
          </div>
        )}

        {/* ===== Mode: Chi tiết ===== */}
        {mode === "detail" && viewingRecord && (
          <RecordDetail
            record={viewingRecord}
            onEdit={handleEdit}
            onDelete={handleDeleteFromDetail}
          />
        )}

        {/* ===== Mode: Add / Edit form ===== */}
        {(mode === "add" || mode === "edit") && (
          <div className="p-4">
            <TimesheetForm
              mode={mode}
              initialValues={mode === "edit" ? editingRecord : { workDate: date }}
              onSaved={handleFormSaved}
              embedded
            />
          </div>
        )}
      </Drawer>

      {/* ===== Modal xác nhận xóa ===== */}
      <Modal
        title="Xác nhận xóa"
        open={Boolean(deletingRecord)}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeletingRecord(null)}
        okText="Xóa"
        cancelText="Hủy"
        confirmLoading={deleting}
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc muốn xóa time record{" "}
          <strong>{deletingRecord?.activity}</strong>
          {deletingRecord?.hours ? ` (${deletingRecord.hours}h)` : ""}?
        </p>
      </Modal>
    </>
  );
}
