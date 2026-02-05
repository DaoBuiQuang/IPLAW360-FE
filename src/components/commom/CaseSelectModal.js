import React, { useMemo, useState } from "react";
import { Modal, Table, Input } from "antd";

const { Search } = Input;

const CaseSelectModal = ({
  open,
  options = [],
  value,                 // selectedCaseId
  onChange,              // (id) => void
  onOk,                  // () => void
  onCancel,              // () => void
  loading = false,
}) => {
  const [search, setSearch] = useState("");

  const dataFiltered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase().trim();
    return options.filter((c) =>
      [c.tenVuViec, c.moTa, c.clientsRef].filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [options, search]);

  const columns = [
    { title: "#", width: 84, align: "center", render: (_, __, i) => i + 1 },
    {
      title: "ITEM",
      dataIndex: "tenVuViec",
      render: (_, r) => (
        <div className="leading-tight">
          <div className="font-medium">{r.tenVuViec || "—"}</div>
          <div className="text-gray-500">{r.moTa || "—"}</div>
        </div>
      ),
    },
    { title: "Your Ref", dataIndex: "clientsRef", width: 160, align: "center", render: (v) => v || "—" },
    { title: "QTY", width: 80, align: "center", render: () => 1 },
    { title: "SERVICE FEE (VND)", dataIndex: "soTien", width: 180, align: "right", render: (v) => (parseFloat(v || 0)).toLocaleString("vi-VN") },
    { title: "TOTAL (VND)", width: 180, align: "right", render: (_, r) => (parseFloat(r.soTien || 0)).toLocaleString("vi-VN") },
  ];

  return (
    <Modal
      title="Chọn vụ việc để thêm (cùng một mã hồ sơ - matter code))"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="Thêm"
      cancelText="Hủy"
      width={1250}
    >
      <div className="mb-3">
        <Search
          placeholder="Tìm theo tên vụ việc, mô tả, Your Ref..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(v) => setSearch(v)}
        />
      </div>

      <Table
        rowKey="id"
        size="middle"
        bordered
        loading={loading}
        columns={columns}
        dataSource={dataFiltered}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 900, y: 360 }}
        locale={{ emptyText: "Không còn vụ việc nào để thêm." }}
        rowSelection={{
          type: "radio",
          selectedRowKeys: value != null ? [value] : [],
          onChange: (keys) => onChange?.(keys[0]),
        }}
      />
    </Modal>
  );
};

export default CaseSelectModal;
