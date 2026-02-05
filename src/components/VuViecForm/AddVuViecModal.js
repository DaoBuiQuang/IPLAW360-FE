// AddVuViecModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Checkbox,
  Space,
  message,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";

function AddVuViecModal({
  isOpen,
  onClose,
  onSave,
  record,
  dsNguoiXuLy = [],
  initialMaHoSo,
  defaultType,
  isMainCaseCheck,
  tenLoaiDon,
  maDonDangKy,
  isGeneralAdvice,
  isKH,
  onSplitDon,
}) {
  const navigate = useNavigate();
  const [maHoSo, setMaHoSo] = useState(initialMaHoSo);
  const [loaiTienTe, setLoaiTienTe] = useState("VND");

  const [tenVuViec, setTenVuViec] = useState("");
  const [ngayTaoVV, setNgayTaoVV] = useState(dayjs());
  const [deadline, setDeadline] = useState(null);
  const [softDeadline, setSoftDeadline] = useState(null);
  const [soTien, setSoTien] = useState(0);
  const [ghiChu, setGhiChu] = useState("");
  const [maNguoiXuLy, setMaNguoiXuLy] = useState(null);
  const [xuatBill, setXuatBill] = useState(false);
  const [moTa, setMoTa] = useState("");

  // 2 checkbox riêng
  const [isDangKy, setIsDangKy] = useState(isMainCaseCheck ?? false);
  const [isTiepQuan, setIsTiepQuan] = useState(false);

  const [dsNhanSu, setDsNhanSu] = useState([]);
  const [customers, setCustomers] = useState([]); // 🔹 DS khách hàng cho chuyển quyền

  // trạng thái để hiển thị lỗi đẹp hơn
  const [touched, setTouched] = useState({
    tenVuViec: false,
    moTa: false,
    soTien: false,
  });
  const [trangThaiYCTT, setTrangThaiYCTT] = useState(undefined); // 0/1/2/3
  const [ghiChuTuChoi, setGhiChuTuChoi] = useState("");

  const ycttText = (v) =>
    v === 2 ? "Bị từ chối" : v === 3 ? "Đã duyệt" : "Chưa duyệt";
  const ycttColor = (v) => (v === 2 ? "red" : v === 3 ? "green" : "default");

  const isTenVuViecValid = !!tenVuViec?.trim();
  const isMoTaValid = !!moTa?.trim();
  const isSoTienValid = Number(soTien) > 0;
  const canSave = isTenVuViecValid && isMoTaValid && isSoTienValid;

  // 🔹 STATE cho modal TÁCH ĐƠN
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitCount, setSplitCount] = useState(1);
  const [splitList, setSplitList] = useState([
    { nhomSPDV: "", ngayYeuCau: null, ngayGhiNhanSuaDoi: null, soDon: "" },
  ]);

  // 🔹 STATE cho modal CHUYỂN QUYỀN
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    customerId: null,
    soDonChuyenQuyen: "",
    ngayYeuCau: null,
    ngayGhiNhan: null,
    ghiChu: "",
  });

  useEffect(() => {
    fetchNhanSu();
    fetchCustomers();

    if (record) {
      setMaHoSo(record.maHoSo || initialMaHoSo || "");
      setTenVuViec(record.tenVuViec || "");
      setNgayTaoVV(record.ngayTaoVV ? dayjs(record.ngayTaoVV) : dayjs());
      setDeadline(record.deadline ? dayjs(record.deadline) : null);
      setSoftDeadline(record.softDeadline ? dayjs(record.softDeadline) : null);
      setSoTien(record.soTien || 0);
      setLoaiTienTe(record.loaiTienTe || "VND");
      setMaNguoiXuLy(record.maNguoiXuLy || null);
      setXuatBill(record.xuatBill === true || record.xuatBill === "Đã xuất");
      setMoTa(record.moTa || "");

      setTrangThaiYCTT(record.trangThaiYCTT);
      setGhiChuTuChoi(record.ghiChuTuChoi || "");

      const main = record.isMainCase ?? false;
      setIsDangKy(main);
      setIsTiepQuan(
        !main && record.tenVuViec?.trim() === "Tiếp quản và theo đuổi"
      );
    } else {
      setMaHoSo(initialMaHoSo || "");
      setTenVuViec("");
      setNgayTaoVV(dayjs());
      setDeadline(null);
      setSoftDeadline(null);
      setSoTien(0);
      setLoaiTienTe("VND");
      setMaNguoiXuLy(null);
      setXuatBill(false);
      setMoTa("");

      setTrangThaiYCTT(undefined);
      setGhiChuTuChoi("");

      setIsDangKy(isMainCaseCheck ?? false);
      setIsTiepQuan(false);
    }
    setTouched({ tenVuViec: false, moTa: false, soTien: false });
  }, [record, defaultType, initialMaHoSo, isMainCaseCheck]);

  useEffect(() => {
    if (isDangKy) {
      setTenVuViec(tenLoaiDon || "Nộp đơn đăng ký nhãn hiệu");
    }
  }, [isDangKy, tenLoaiDon]);

  const fetchNhanSu = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/staff/list",
        data: {},
      });
      setDsNhanSu(response);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhân sự:", error);
    }
  };

  // 🔹 Lấy khách hàng cho chuyển quyền
  const fetchCustomers = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/customers/by-name",
        data: {},
      });
      setCustomers(response);
    } catch (error) {
      console.error("Lỗi lấy danh sách khách hàng:", error);
    }
  };

  const handleOk = () => {
    if (!canSave) {
      setTouched({ tenVuViec: true, moTa: true, soTien: true });
      message.error(
        "Vui lòng nhập đầy đủ: Tên vụ việc, Mô tả và Số tiền (> 0)."
      );
      return;
    }

    const formatted = {
      maHoSo,
      tenVuViec,
      ngayTaoVV: ngayTaoVV ? ngayTaoVV.format("YYYY-MM-DD") : null,
      deadline: deadline ? deadline.format("YYYY-MM-DD") : null,
      softDeadline: softDeadline ? softDeadline.format("YYYY-MM-DD") : null,
      soTien,
      loaiTienTe,
      maNguoiXuLy,
      xuatBill,
      moTa,
      isMainCase: !!isDangKy,
    };
    onSave(formatted);
  };

  // 🔹 Gọi khi bấm các nút “Chuyển quyền / Sửa đổi / Tách đơn” (VN)
  const handleSelectLoaiDon = (type) => {
    if (type === "chuyen_quyen") {
      openTransferModal();                    // ✅ mở modal chuyển quyền
    } else if (type === "sua_doi") {
      window.open(`/application_sd_nh_vn_add/${maDonDangKy}`, "_blank");
    } else if (type === "tach_don") {
      openSplitModal();
    } else if (type === "nhan_moi") {
      setIsDangKy(false);
      setIsTiepQuan(false);
      setTenVuViec("Đăng ký nhãn hiệu mới");
    }
  };

  // 🔹 Gọi khi là KH
  const handleSelectLoaiDonKH = (type) => {
    if (type === "chuyen_quyen") {
      openTransferModal();                    // ✅ khách hàng cũng mở modal
    } else if (type === "sua_doi") {
      window.open(`/application_sd_nh_kh_add/${maDonDangKy}`, "_blank");
    }
  };

  const onToggleDangKy = (checked) => {
    setIsDangKy(checked);
    if (checked) {
      setIsTiepQuan(false);
      setTenVuViec(tenLoaiDon || "Nộp đơn đăng ký nhãn hiệu");
    } else {
      setTenVuViec("");
    }
  };

  const onToggleTiepQuan = (checked) => {
    setIsTiepQuan(checked);
    if (checked) {
      setIsDangKy(false);
      setTenVuViec("Tiếp quản và theo đuổi");
    } else {
      setTenVuViec("");
    }
  };

  const isAutoName = isDangKy || isTiepQuan;

  const formatGroup = (value, sep = ".") => {
    if (value === undefined || value === null) return "";
    const raw = String(value).replace(/[^\d]/g, "");
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  };

  // 🔹 HÀM mở modal tách đơn
  const openSplitModal = () => {
    setIsSplitModalOpen(true);
    setSplitCount(1);
    setSplitList([
      { nhomSPDV: "", ngayYeuCau: null, ngayGhiNhanSuaDoi: null, soDon: "" },
    ]);
  };

  // 🔹 Khi thay đổi số lượng đơn tách
  const handleChangeSplitCount = (val) => {
    const n = Math.max(1, Number(val) || 1);
    setSplitCount(n);

    setSplitList((prev) => {
      const clone = [...prev];
      if (n > clone.length) {
        while (clone.length < n) {
          clone.push({
            nhomSPDV: "",
            ngayYeuCau: null,
            ngayGhiNhanSuaDoi: null,
            soDon: "",
          });
        }
      } else if (n < clone.length) {
        clone.length = n;
      }
      return clone;
    });
  };

  // 🔹 Thay đổi field từng đơn tách
  const handleChangeSplitField = (index, field, value) => {
    setSplitList((prev) => {
      const clone = [...prev];
      clone[index] = {
        ...clone[index],
        [field]: value,
      };
      return clone;
    });
  };

  const isValidNhomSPDV = (value) => {
    if (!value) return false;
    const regex = /^(\d{1,2})(\s*,\s*\d{1,2})*$/;
    return regex.test(value.trim());
  };

  // 🔹 OK trên modal tách đơn
  const handleSplitModalOk = async () => {
    try {
      for (const item of splitList) {
        if (!item.soDon || !item.soDon.trim()) {
          message.error("Vui lòng nhập Số đơn tách cho tất cả các đơn.");
          return;
        }

        if (!isValidNhomSPDV(item.nhomSPDV)) {
          message.error(
            "Nhóm SPDV phải đúng định dạng (ví dụ: 1, 5, 10, 35)."
          );
          return;
        }
      }

      const listDonTach = splitList.map((item) => ({
        soDon: item.soDon.trim(),
        nhomSPDV: item.nhomSPDV.trim(),
        ngayYeuCau: item.ngayYeuCau
          ? item.ngayYeuCau.format("YYYY-MM-DD")
          : null,
        ngayGhiNhanSuaDoi: item.ngayGhiNhanSuaDoi
          ? item.ngayGhiNhanSuaDoi.format("YYYY-MM-DD")
          : null,
      }));

      await callAPI({
        method: "post",
        endpoint: isKH
          ? "/application_td_nh_kh/add"
          : "/application_td_nh_vn/add",
        data: {
          maHoSo,
          maDonDangKyCu: maDonDangKy,
          listDonTach,
        },
      });

      message.success("Tách đơn thành công!");
      setIsSplitModalOpen(false);
    } catch (error) {
      console.error("Lỗi tách đơn:", error);
      message.error("Tách đơn thất bại!");
    }
  };

  const handleSplitModalCancel = () => {
    setIsSplitModalOpen(false);
  };

  // 🔹 HÀM mở modal CHUYỂN QUYỀN
  const openTransferModal = () => {
    setTransferForm({
      customerId: null,
      soDonChuyenQuyen: "",
      ngayYeuCau: null,
      ngayGhiNhan: null,
      ghiChu: "",
    });
    setIsTransferModalOpen(true);
  };

  const handleChangeTransferField = (field, value) => {
    setTransferForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTransferModalOk = async () => {
    const { customerId, soDonChuyenQuyen, ngayYeuCau, ngayGhiNhan, ghiChu } =
      transferForm;

    if (!customerId) {
      message.error("Vui lòng chọn khách hàng nhận chuyển quyền.");
      return;
    }

    if (!soDonChuyenQuyen.trim()) {
      message.error("Vui lòng nhập Số đơn chuyển nhượng.");
      return;
    }

    try {
      const payload = {
        maHoSo,
        maDonDangKyCu: maDonDangKy,
        maKhachHangMoi: customerId, // hoặc idKhachHangMoi tùy backend
        soDonChuyenQuyen: soDonChuyenQuyen.trim(),
        ngayYeuCauChuyenQuyen: ngayYeuCau
          ? ngayYeuCau.format("YYYY-MM-DD")
          : null,
        ngayGhiNhanChuyenQuyen: ngayGhiNhan
          ? ngayGhiNhan.format("YYYY-MM-DD")
          : null,
        ghiChu,
      };

      await callAPI({
        method: "post",
        endpoint: isKH
          ? "/application_cq_nh_kh/add" // 🔧 đổi theo API backend của bạn
          : "/application_cq_nh_vn/add",
        data: payload,
      });

      message.success("Tạo đơn chuyển quyền thành công!");
      setIsTransferModalOpen(false);
    } catch (error) {
      console.error("Lỗi chuyển quyền:", error);
      message.error("Thao tác chuyển quyền thất bại!");
    }
  };

  const handleTransferModalCancel = () => {
    setIsTransferModalOpen(false);
  };

  return (
    <>
      <Modal
        open={isOpen}
        title={record ? "CẬP NHẬT NGHIỆP VỤ" : "THÊM NGHIỆP VỤ MỚI"}
        onCancel={onClose}
        footer={
          <Space>
            <Button key="cancel" onClick={onClose}>
              Đóng
            </Button>
            <Button
              key="ok"
              type="primary"
              onClick={handleOk}
              disabled={!canSave}
            >
              Lưu
            </Button>
          </Space>
        }
        width={750}
      >
        {/* Hàng trên cùng */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Checkbox
              checked={isDangKy}
              onChange={(e) => onToggleDangKy(e.target.checked)}
            >
              {tenLoaiDon || "Nộp đơn đăng ký nhãn hiệu"}
            </Checkbox>

            <Checkbox
              checked={isTiepQuan}
              onChange={(e) => onToggleTiepQuan(e.target.checked)}
            >
              {"Tiếp quản và theo đuổi"}
            </Checkbox>
          </div>

          <div className="text-right">
            <span className="block text-gray-500 text-sm">Mã hồ sơ</span>
            <span className="text-base font-semibold">{maHoSo}</span>
          </div>
        </div>

        {record && (
          <div className="mb-4 grid grid-cols-1 gap-2">
            <div>
              <span className="block text-gray-700 font-medium mb-1">
                Trạng thái yêu cầu thanh toán
              </span>
              <Tag color={ycttColor(trangThaiYCTT)}>
                {ycttText(trangThaiYCTT)}
              </Tag>
            </div>
            {trangThaiYCTT === 2 && (
              <div>
                <span className="block text-gray-700 font-medium">
                  Ghi chú từ chối
                </span>
                <Input.TextArea
                  value={ghiChuTuChoi}
                  readOnly
                  rows={3}
                  className="mt-1"
                  style={{ background: "#fafafa" }}
                  placeholder="Không có ghi chú"
                />
              </div>
            )}
          </div>
        )}

        {/* Các shortcut thao tác nhanh */}
        {!isGeneralAdvice && (
          <>
            {isKH ? (
              <div className="mb-4 grid grid-cols-2 gap-6">
                <Button
                  onClick={() => handleSelectLoaiDonKH("sua_doi")}
                  className="justify-start text-left text-blue-600"
                >
                  Sửa đổi đơn đăng ký
                </Button>
                <Button
                  onClick={() => handleSelectLoaiDonKH("chuyen_quyen")}
                  className="justify-start text-left text-blue-600"
                >
                  Chuyển quyền sở hữu đơn đăng ký
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-2 gap-6">
                  <Button
                    onClick={() => handleSelectLoaiDon("chuyen_quyen")}
                    className="justify-start text-left text-blue-600"
                  >
                    Chuyển quyền sở hữu đơn đăng ký
                  </Button>
                  <Button
                    onClick={() => handleSelectLoaiDon("sua_doi")}
                    className="justify-start text-left text-blue-600"
                  >
                    Sửa đổi đơn đăng ký
                  </Button>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-6">
                  <Button
                    onClick={() => handleSelectLoaiDon("tach_don")}
                    className="justify-start text-left text-blue-600"
                  >
                    Tách đơn đăng ký
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {/* Form chính */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium">
              Tên vụ việc <span className="text-red-500">*</span>
            </label>
            <Input
              value={tenVuViec}
              onChange={(e) => setTenVuViec(e.target.value)}
              onBlur={() =>
                setTouched((t) => ({ ...t, tenVuViec: true }))
              }
              placeholder="Nhập tên vụ việc"
              className="mt-1"
              disabled={isAutoName}
              status={
                !isTenVuViecValid && touched.tenVuViec ? "error" : undefined
              }
            />
            {!isTenVuViecValid && touched.tenVuViec && (
              <div className="text-red-500 text-xs mt-1">
                Bắt buộc nhập Tên vụ việc.
              </div>
            )}
          </div>
        </div>

        {/* Ngày */}
        <div className="grid grid-cols-3 gap-6 mt-4">
          <div>
            <label className="block text-gray-700 font-medium">Ngày tạo</label>
            <DatePicker
              value={ngayTaoVV}
              onChange={(date) => setNgayTaoVV(date)}
              format="DD/MM/YYYY"
              size="large"
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Deadline</label>
            <DatePicker
              value={deadline}
              onChange={(date) => setDeadline(date)}
              format="DD/MM/YYYY"
              size="large"
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Ghi chú</label>
            <Input
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Nhập ghi chú deadline"
              size="large"
              className="mt-1 w-full"
              allowClear
            />
          </div>
        </div>

        {/* Phí & Người xử lý */}
        <div className="grid grid-cols-2 gap-6 mt-4 items-start">
          <div className="flex flex-col">
            <label className="block text-gray-700 font-medium">
              Phí vụ việc <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mt-1 items-center">
              <InputNumber
                size="large"
                min={0}
                value={soTien}
                onChange={(val) => setSoTien(val ?? 0)}
                className="w-full"
                inputMode="numeric"
                step={1000}
                formatter={(v) =>
                  formatGroup(v, loaiTienTe === "USD" ? "," : ".")
                }
                parser={(v) => (v ? v.replace(/[^\d]/g, "") : "")}
                status={
                  !isSoTienValid && touched.soTien ? "error" : undefined
                }
                onBlur={() =>
                  setTouched((t) => ({ ...t, soTien: true }))
                }
              />
              <Select
                size="large"
                value={loaiTienTe}
                onChange={(val) => setLoaiTienTe(val)}
                placeholder="Loại tiền"
                style={{ width: 120 }}
                options={[
                  { value: "VND", label: "VND" },
                  { value: "USD", label: "USD" },
                ]}
              />
            </div>
            <div className="min-h-[22px]">
              {!isSoTienValid && touched.soTien && (
                <div className="text-red-500 text-xs mt-1">
                  Số tiền phải lớn hơn 0.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-gray-700 font-medium">
              Thêm nhân sự
            </label>
            <Select
              size="large"
              value={maNguoiXuLy}
              onChange={(val) => setMaNguoiXuLy(val)}
              placeholder="Chọn nhân sự"
              style={{ width: "100%" }}
              options={dsNhanSu.map((ns) => ({
                value: ns.maNhanSu,
                label: ns.tenNhanSu,
              }))}
            />
            <div className="min-h-[22px]" />
          </div>
        </div>

        {/* Checkbox khác */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Checkbox
            checked={xuatBill}
            onChange={(e) => setXuatBill(e.target.checked)}
          >
            Yêu cầu thanh toán
          </Checkbox>
        </div>

        {/* Mô tả */}
        <div className="mt-4">
          <label className="block text-gray-700 font-medium">
            Mô tả công việc (sẽ hiển thị trên Debit Note){" "}
            <span className="text-red-500">*</span>
          </label>
          <Input.TextArea
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, moTa: true }))}
            rows={3}
            placeholder="Nhập mô tả chi tiết..."
            className="mt-1"
            status={!isMoTaValid && touched.moTa ? "error" : undefined}
          />
          {!isMoTaValid && touched.moTa && (
            <div className="text-red-500 text-xs mt-1">
              Bắt buộc nhập Mô tả.
            </div>
          )}
        </div>
      </Modal>

      {/* 🔹 MODAL TÁCH ĐƠN */}
      <Modal
        open={isSplitModalOpen}
        title="TÁCH ĐƠN ĐĂNG KÝ"
        onOk={handleSplitModalOk}
        onCancel={handleSplitModalCancel}
        width={800}
        okText="Xác nhận tách"
        cancelText="Hủy"
      >
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Số lượng đơn muốn tách
          </label>
          <InputNumber
            min={1}
            value={splitCount}
            onChange={handleChangeSplitCount}
          />
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {splitList.map((item, index) => (
            <div
              key={index}
              className="border rounded-md p-3 bg-gray-50 space-y-3"
            >
              <div className="font-semibold text-gray-700 mb-1">
                Đơn tách #{index + 1}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium">
                  Số đơn tách <span className="text-red-500">*</span>
                </label>
                <Input
                  value={item.soDon}
                  onChange={(e) =>
                    handleChangeSplitField(index, "soDon", e.target.value)
                  }
                  placeholder="Nhập số đơn tách"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium">
                  Danh sách nhóm sản phẩm/dịch vụ mới{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  value={item.nhomSPDV}
                  onChange={(e) =>
                    handleChangeSplitField(index, "nhomSPDV", e.target.value)
                  }
                  placeholder="Nhập nhóm SPDV (vd: 1, 5, 10, 35)"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium">
                    Ngày yêu cầu tách đơn
                  </label>
                  <DatePicker
                    value={item.ngayYeuCau}
                    onChange={(d) =>
                      handleChangeSplitField(index, "ngayYeuCau", d)
                    }
                    format="DD/MM/YYYY"
                    className="mt-1 w-full"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium">
                    Ngày ghi nhận tách đơn
                  </label>
                  <DatePicker
                    value={item.ngayGhiNhanSuaDoi}
                    onChange={(d) =>
                      handleChangeSplitField(index, "ngayGhiNhanSuaDoi", d)
                    }
                    format="DD/MM/YYYY"
                    className="mt-1 w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* 🔹 MODAL CHUYỂN QUYỀN */}
      <Modal
        open={isTransferModalOpen}
        title="CHUYỂN QUYỀN SỞ HỮU ĐƠN ĐĂNG KÝ"
        onOk={handleTransferModalOk}
        onCancel={handleTransferModalCancel}
        width={700}
        okText="Xác nhận chuyển quyền"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium">
              Khách hàng nhận chuyển quyền <span className="text-red-500">*</span>
            </label>
            <Select
              className="mt-1 w-full"
              placeholder="Chọn khách hàng"
              value={transferForm.customerId}
              onChange={(val) => handleChangeTransferField("customerId", val)}
              showSearch
              optionFilterProp="label"
              options={customers.map((c) => ({
                value: c.maKhachHang,      // hoặc c.id tùy DB
                label: c.tenKhachHang,
              }))}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium">
              Số đơn chuyển nhượng <span className="text-red-500">*</span>
            </label>
            <Input
              className="mt-1"
              value={transferForm.soDonChuyenQuyen}
              onChange={(e) =>
                handleChangeTransferField("soDonChuyenQuyen", e.target.value)
              }
              placeholder="Nhập số đơn chuyển quyền / hợp đồng chuyển nhượng"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium">
                Ngày yêu cầu chuyển quyền
              </label>
              <DatePicker
                className="mt-1 w-full"
                format="DD/MM/YYYY"
                value={transferForm.ngayYeuCau}
                onChange={(d) => handleChangeTransferField("ngayYeuCau", d)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium">
                Ngày ghi nhận chuyển quyền
              </label>
              <DatePicker
                className="mt-1 w-full"
                format="DD/MM/YYYY"
                value={transferForm.ngayGhiNhan}
                onChange={(d) => handleChangeTransferField("ngayGhiNhan", d)}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium">
              Ghi chú
            </label>
            <Input.TextArea
              className="mt-1"
              rows={3}
              value={transferForm.ghiChu}
              onChange={(e) =>
                handleChangeTransferField("ghiChu", e.target.value)
              }
              placeholder="Nhập ghi chú thêm (nếu có)..."
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AddVuViecModal;
