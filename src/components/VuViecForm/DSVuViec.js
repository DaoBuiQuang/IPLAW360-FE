// DSVuViec.jsx
import React, { useState, useEffect } from "react";
import { Button, Table, Popconfirm, Tag } from "antd";
import AddVuViecModal from "./AddVuViecModal";

const DSVuViec = ({
  initialVuViecs,
  isViewOnly,
  maHoSo,
  onVuViecChange,
  tenLoaiDon,
  maDonDangKy,
  isGeneralAdvice,
  isKH
}) => {
  const [dsVuViec, setDsVuViec] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    editingIndex: null,
    record: null,
  });

  useEffect(() => {
    if (initialVuViecs && initialVuViecs.length > 0) setDsVuViec(initialVuViecs);
  }, [initialVuViecs]);

  useEffect(() => {
    // console.log("dsVuViec thay đổi: ", dsVuViec);
  }, [dsVuViec]);

  const handleAddOrUpdate = (newData) => {
    let updatedList;
    if (modalState.editingIndex !== null) {
      updatedList = dsVuViec.map((item, i) => (i === modalState.editingIndex ? newData : item));
    } else {
      updatedList = [...dsVuViec, newData];
    }
    setDsVuViec(updatedList);
    onVuViecChange?.(updatedList);
    setModalState({ isOpen: false, editingIndex: null, record: null });
  };

  const handleEdit = (record, index) =>
    setModalState({ isOpen: true, editingIndex: index, record });
  const handleDelete = (index) => {
    const newList = dsVuViec.filter((_, i) => i !== index);
    setDsVuViec(newList);
    onVuViecChange?.(newList);
  };

  // Helper định dạng tiền tệ
  const formatMoney = (value, currency = "VND") => {
    if (value === undefined || value === null || value === "") return "-";
    const num = Number(String(value).replace(/[^\d.-]/g, ""));
    if (Number.isNaN(num)) return "-";
    const isUSD = currency === "USD";
    const locale = isUSD ? "en-US" : "vi-VN";
    return num.toLocaleString(locale, {
      minimumFractionDigits: isUSD ? 2 : 0,
      maximumFractionDigits: isUSD ? 2 : 0,
    });
  };

  // Mapping trạng thái
  const ycttText = (v) => (v === 2 ? "Bị từ chối" : v === 3 ? "Đã duyệt" : "Chưa duyệt");
  const ycttColor = (v) => (v === 2 ? "red" : v === 3 ? "green" : "default");

  const columns = [
    { title: "Mã hồ sơ", dataIndex: "maHoSo", key: "maHoSo" },
    { title: "Tên nghiệp vụ", dataIndex: "tenVuViec", key: "tenVuViec" },
    { title: "Ngày tạo", dataIndex: "ngayTaoVV", key: "ngayTaoVV" },
    { title: "Deadline", dataIndex: "deadline", key: "deadline" },
    { title: "Soft Deadline", dataIndex: "softDeadline", key: "softDeadline" },
    {
      title: "Phí",
      key: "phi",
      align: "right",
      render: (_, record) => {
        const currency = record.loaiTienTe || "VND";
        const formatted = formatMoney(record.soTien, currency);
        return `${formatted} ${currency}`;
      },
    },
    { title: "Mô tả", dataIndex: "moTa", key: "moTa" },
    {
      title: "Cần thanh toán",
      dataIndex: "xuatBill",
      key: "xuatBill",
      render: (val) => (val ? "Yêu cầu thanh toán" : "Chưa yêu cầu thanh toán"),
    },
    // Chỉ 1 cột trạng thái như yêu cầu
    {
      title: "Trạng thái YCTT",
      dataIndex: "trangThaiYCTT",
      key: "trangThaiYCTT",
      render: (v) => <Tag color={ycttColor(v)}>{ycttText(v)}</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record, index) =>
        !isViewOnly && (
          <>
            <Button type="link" onClick={() => handleEdit(record, index)}>
              Sửa
            </Button>
            <Popconfirm
              title="Bạn có chắc muốn xóa?"
              onConfirm={() => handleDelete(index)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="link" danger>
                Xóa
              </Button>
            </Popconfirm>
          </>
        ),
    },
  ];

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2 uppercase">Danh sách nghiệp vụ</h3>
      <Table
        columns={columns}
        dataSource={dsVuViec}
        rowKey={(record, index) => index}
        pagination={false}
        bordered
        size="small"
      />

      {/* {!isViewOnly &&
        !isGeneralAdvice &&
        !dsVuViec.some((vv) => vv.isMainCase) && (
          <Button
            type="dashed"
            className="mt-2 mr-2"
            onClick={() =>
              setModalState({
                isOpen: true,
                editingIndex: null,
                record: null,
                defaultType: "nhan_moi",
                isMainCaseCheck: true,
              })
            }
          >
            Tạo nghiệp vụ cho đơn
          </Button>
        )} */}


      {!isViewOnly && (
        <Button
          type="primary"
          className="mt-2"
          onClick={() =>
            setModalState({
              isOpen: true,
              editingIndex: null,
              record: null,
              isMainCaseCheck: false,
            })
          }
        >
          Thêm nghiệp vụ
        </Button>
      )}

      <AddVuViecModal
        initialMaHoSo={maHoSo}
        maDonDangKy={maDonDangKy}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, editingIndex: null, record: null })}
        onSave={handleAddOrUpdate}
        record={modalState.record}
        isMainCaseCheck={modalState.isMainCaseCheck}
        tenLoaiDon={tenLoaiDon}
        isGeneralAdvice={isGeneralAdvice}
        isKH={isKH}
      />
    </div>
  );
};

export default DSVuViec;
