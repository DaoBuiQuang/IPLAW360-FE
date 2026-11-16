import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import Select from "react-select";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { DatePicker, Modal, Spin, Pagination, Radio, Input } from "antd";
import { useTranslation } from "react-i18next";
import SearchCreatableSelect from "../../components/commom/SearchCreatableSelect";
import { showInfo, showSuccess, showError } from "../../components/commom/Notification";

function Application_CQ_NH_VNList() {
  const role = useSelector((state) => state.auth.role);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [selectedTrangThaiDuyet, setSelectedTrangThaiDuyet] = useState(null);

  const [customerOptions, setCustomerOptions] = useState([]);
  const [partnerOptions, setPartnerOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(0);
  const [approvalDate, setApprovalDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [rejectDate, setRejectDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [rejectReason, setRejectReason] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const searchOptions = React.useMemo(() => {
    const list = [];
    const seen = new Set();
    (records || []).forEach((item) => {
      const soDonCQ = item.soDonCQ || item.soDon;
      if (soDonCQ && !seen.has(soDonCQ)) {
        seen.add(soDonCQ);
        list.push({
          value: soDonCQ,
          label: `Số đơn CN: ${soDonCQ}${item.tenNhanHieu ? ` - ${item.tenNhanHieu}` : ""}`,
        });
      }
      if (item.soDonGoc && !seen.has(item.soDonGoc)) {
        seen.add(item.soDonGoc);
        list.push({
          value: item.soDonGoc,
          label: `Số đơn gốc: ${item.soDonGoc}${item.tenNhanHieu ? ` - ${item.tenNhanHieu}` : ""}`,
        });
      }
      if (item.maHoSoVuViec && !seen.has(item.maHoSoVuViec)) {
        seen.add(item.maHoSoVuViec);
        list.push({
          value: item.maHoSoVuViec,
          label: `Mã HSVV: ${item.maHoSoVuViec}`,
        });
      }
    });
    return list;
  }, [records]);

  const fetchRecords = async (searchValue, page = 1, size = 10, overrides = {}) => {
    setLoading(true);
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/application_cq_nh_vn/list",
        data: {
          searchText: searchValue !== undefined ? searchValue : searchTerm,
          customerName: overrides.customerName !== undefined ? overrides.customerName : customerName,
          partnerName: overrides.partnerName !== undefined ? overrides.partnerName : partnerName,
          brandName: overrides.brandName !== undefined ? overrides.brandName : brandName,
          trangThaiDuyet:
            overrides.selectedTrangThaiDuyet !== undefined
              ? overrides.selectedTrangThaiDuyet
              : selectedTrangThaiDuyet,
          pageIndex: page,
          pageSize: size,
        },
      });
      setRecords(response.data || []);
      setTotalItems(response.pagination?.totalItems || 0);
      setPageIndex(response.pagination?.pageIndex || 1);
      setPageSize(response.pagination?.pageSize || 10);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn chuyển nhượng:", error);
      setRecords([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [custRes, partnerRes, brandRes] = await Promise.allSettled([
        callAPI({ method: "post", endpoint: "/customers/by-name", data: {} }),
        callAPI({ method: "post", endpoint: "/partner/all", data: {} }),
        callAPI({ method: "post", endpoint: "/brand/shortlist", data: {} }),
      ]);
      if (custRes.status === "fulfilled") {
        const raw = Array.isArray(custRes.value) ? custRes.value : custRes.value?.data || [];
        setCustomerOptions(
          raw.map((c) => ({
            value: c.tenKhachHang,
            label: `${c.tenKhachHang}${c.maKhachHang ? ` (${c.maKhachHang})` : ""}`,
          }))
        );
      }
      if (partnerRes.status === "fulfilled") {
        const raw = Array.isArray(partnerRes.value) ? partnerRes.value : partnerRes.value?.data || [];
        setPartnerOptions(
          raw.map((p) => ({
            value: p.tenDoiTac,
            label: `${p.tenDoiTac}${p.maDoiTac ? ` (${p.maDoiTac})` : ""}`,
          }))
        );
      }
      if (brandRes.status === "fulfilled") {
        const raw = Array.isArray(brandRes.value) ? brandRes.value : brandRes.value?.data || [];
        setBrandOptions(
          raw.map((b) => ({
            value: b.tenNhanHieu,
            label: `${b.tenNhanHieu}${b.maNhanHieu ? ` (${b.maNhanHieu})` : ""}`,
          }))
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải filter options:", error);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchRecords("", 1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearFilters = () => {
    setSearchTerm("");
    setCustomerName("");
    setPartnerName("");
    setBrandName("");
    setSelectedTrangThaiDuyet(null);
    fetchRecords("", 1, pageSize, {
      customerName: "",
      partnerName: "",
      brandName: "",
      selectedTrangThaiDuyet: null,
    });
  };

  const openApprovalModal = (item) => {
    setApprovalRecord(item);
    setApprovalStatus(Number(item.trangThaiDuyet ?? 0));
    setApprovalDate(
      item.ngayChapThuan || item.ngayGhiNhanCQ
        ? dayjs(item.ngayChapThuan || item.ngayGhiNhanCQ).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD")
    );
    setRejectDate(
      item.ngayTuChoi
        ? dayjs(item.ngayTuChoi).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD")
    );
    setRejectReason(item.lyDoTuChoi || "");
    setApprovalNote(item.moTa || item.noiDung || "");
    setApprovalModalOpen(true);
  };

  const handleConfirmApproval = async () => {
    const id = approvalRecord?.idDonCQ || approvalRecord?.id;
    if (!id) {
      showError("Lỗi", "Không tìm thấy ID tờ khai chuyển nhượng.");
      return;
    }
    setSubmittingApproval(true);
    try {
      await callAPI({
        method: "post",
        endpoint: "/application_cq_nh_vn/update",
        data: {
          id,
          trangThaiDuyet: Number(approvalStatus),
          ngayChapThuan: Number(approvalStatus) === 1 ? approvalDate : null,
          ngayGhiNhanCQ: Number(approvalStatus) === 1 ? approvalDate : null,
          ngayTuChoi: Number(approvalStatus) === 2 ? rejectDate : null,
          lyDoTuChoi: Number(approvalStatus) === 2 ? rejectReason : null,
          moTa: approvalNote,
        },
      });
      await showSuccess("Thành công", "Đã cập nhật trạng thái xét duyệt đơn chuyển nhượng!");
      setApprovalModalOpen(false);
      setApprovalRecord(null);
      fetchRecords(searchTerm, pageIndex, pageSize);
    } catch (error) {
      console.error("Lỗi cập nhật xét duyệt đơn chuyển nhượng:", error);
      showError("Thất bại", "Không thể cập nhật kết quả xét duyệt.", error);
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleDeleteRecord = async () => {
    const id = recordToDelete?.idDonCQ || recordToDelete?.id;
    if (!id) return;
    try {
      await callAPI({
        method: "post",
        endpoint: "/application_cq_nh_vn/delete",
        data: { id },
      });
      await showSuccess("Thành công", "Đã xóa tờ khai chuyển nhượng.");
      setShowDeleteModal(false);
      setRecordToDelete(null);
      fetchRecords(searchTerm, pageIndex, pageSize);
    } catch (error) {
      console.error("Lỗi xóa đơn chuyển nhượng:", error);
      showError("Thất bại", "Không thể xóa tờ khai chuyển nhượng.", error);
    }
  };

  const trangThaiDuyetOptions = [
    { value: 0, label: "⏳ Chưa chấp thuận" },
    { value: 1, label: "✅ Được chấp thuận" },
    { value: 2, label: "❌ Từ chối" },
  ];

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          📌 Danh sách đơn chuyển nhượng nhãn hiệu Việt Nam
        </h2>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="w-full md:w-1/3">
            <SearchCreatableSelect
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
              onSearch={(keyword) =>
                fetchRecords(keyword !== undefined ? keyword : searchTerm, 1, pageSize)
              }
              options={searchOptions}
              placeholder="🔍 Nhập số đơn chuyển nhượng, số đơn gốc hoặc mã hồ sơ"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => fetchRecords(searchTerm, 1, pageSize)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() =>
                showInfo("Thông báo", "Vui lòng chọn Chuyển quyền sở hữu trong trang Thông tin Đơn đăng ký.")
              }
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Thêm mới
            </button>
            <button
              onClick={handleClearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-3 rounded-lg shadow-md transition"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Khách hàng
            </label>
            <SearchCreatableSelect
              value={customerName}
              onChange={(val) => setCustomerName(val)}
              onSearch={() => fetchRecords(searchTerm, 1, pageSize)}
              options={customerOptions}
              placeholder="Nhập tên khách hàng"
            />
          </div>
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Đối tác
            </label>
            <SearchCreatableSelect
              value={partnerName}
              onChange={(val) => setPartnerName(val)}
              onSearch={() => fetchRecords(searchTerm, 1, pageSize)}
              options={partnerOptions}
              placeholder="Nhập tên đối tác"
            />
          </div>
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Nhãn hiệu
            </label>
            <SearchCreatableSelect
              value={brandName}
              onChange={(val) => setBrandName(val)}
              onSearch={() => fetchRecords(searchTerm, 1, pageSize)}
              options={brandOptions}
              placeholder="Nhập tên nhãn hiệu"
            />
          </div>
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Trạng thái xét duyệt
            </label>
            <Select
              options={trangThaiDuyetOptions}
              value={trangThaiDuyetOptions.find((o) => o.value === selectedTrangThaiDuyet) || null}
              onChange={(opt) => setSelectedTrangThaiDuyet(opt ? opt.value : null)}
              placeholder="Tất cả trạng thái"
              className="text-left"
              isClearable
            />
          </div>
        </div>
      </div>

      <div className="mb-2 mt-3 text-left text-gray-600 text-xl">
        {t("Tìm thấy")} <b className="text-blue-600">{totalItems}</b> {t("kết quả")}
      </div>

      <div className="w-full overflow-x-auto">
        <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
          <table className="w-full border-collapse bg-white text-sm mt-2 overflow-hidden rounded-lg border shadow">
            <thead>
              <tr className="text-[#667085] text-center font-normal">
                <th className="p-2 text-table">STT</th>
                <th className="p-2 text-table">Số đơn chuyển nhượng</th>
                <th className="p-2 text-table">Trạng thái xét duyệt</th>
                <th className="p-2 text-table">Mã hồ sơ</th>
                <th className="p-2 text-table">Bên chuyển nhượng (Cũ)</th>
                <th className="p-2 text-table">Bên nhận chuyển nhượng (Mới)</th>
                <th className="p-2 text-table">Tên nhãn hiệu</th>
                <th className="p-2 text-table">Ảnh nhãn hiệu</th>
                <th className="p-2 text-table">Ngày yêu cầu CN</th>
                <th className="p-2 text-table">Ngày ghi nhận CN</th>
                <th className="p-2 text-table">Lần CN</th>
                <th className="p-2 text-table">Ghi chú</th>
                <th className="p-2 text-center text-table"></th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((item, idx) => {
                  const st = Number(item.trangThaiDuyet ?? 0);
                  const targetMaDon = item.maDonDangKy || item.maDonDangKyGoc;
                  return (
                    <tr key={item.idDonCQ || item.id || idx} className="group hover:bg-gray-100 text-center border-b relative">
                      <td className="p-2 text-table">{(pageIndex - 1) * pageSize + idx + 1}</td>
                      <td
                        className={`p-2 text-table font-semibold ${
                          targetMaDon ? "text-blue-500 cursor-pointer hover:underline" : "text-gray-800"
                        }`}
                        onClick={() => targetMaDon && navigate(`/applicationdetail/${targetMaDon}`)}
                      >
                        {item.soDonCQ || item.soDon || item.soDonGoc || "—"}
                      </td>
                      <td className="p-2 text-table">
                        <div className="flex flex-col items-center gap-1">
                          {st === 0 && (
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              ⏳ Chưa chấp thuận
                            </span>
                          )}
                          {st === 1 && (
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✅ Được chấp thuận
                            </span>
                          )}
                          {st === 2 && (
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-300">
                              ❌ Từ chối
                            </span>
                          )}
                          {st === 2 && item.lyDoTuChoi && (
                            <span className="text-[11px] text-red-600 italic">
                              Lý do: {item.lyDoTuChoi}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-table">{item.maHoSoVuViec || item.maHoSo || "—"}</td>
                      <td className="p-2 text-table">{item.tenKhachHangCu || "—"}</td>
                      <td className="p-2 text-table font-medium text-teal-700">{item.tenKhachHangMoi || item.tenKhachHang || "—"}</td>
                      <td className="p-2 text-table">{item.tenNhanHieu || "—"}</td>
                      <td className="p-2 text-table">
                        {typeof item.linkAnh === "string" && item.linkAnh.startsWith("data:image/") ? (
                          <img
                            src={item.linkAnh}
                            alt="Ảnh"
                            className="mx-auto max-h-16 rounded shadow-sm object-contain"
                          />
                        ) : (
                          <span className="text-gray-400 italic">Không có ảnh</span>
                        )}
                      </td>
                      <td className="p-2 text-table">
                        {item.ngayYeuCau ? new Date(item.ngayYeuCau).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="p-2 text-table">
                        {item.ngayGhiNhanCQ ? new Date(item.ngayGhiNhanCQ).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="p-2 text-table">{item.lanChuyenQuyen || 1}</td>
                      <td className="p-2 text-table">{item.moTa || item.noiDung || ""}</td>
                      <td className="p-2 relative">
                        {(role === "admin" || role === "staff") && (
                          <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                            <button
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                              onClick={() => openApprovalModal(item)}
                              title="Cập nhật kết quả xét duyệt"
                            >
                              ⚖️ Duyệt
                            </button>
                            <button
                              className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                              onClick={() => {
                                setRecordToDelete(item);
                                setShowDeleteModal(true);
                              }}
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={15} className="p-4 text-center text-gray-500">
                    Không có đơn chuyển nhượng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Spin>
      </div>

      <div className="mt-4 flex flex-col items-center space-y-2">
        {totalItems > 0 && (
          <div className="text-sm text-gray-500 text-center">
            <span className="font-medium text-gray-800">
              {(pageIndex - 1) * pageSize + 1} - {Math.min(pageIndex * pageSize, totalItems)}
            </span>
            <span className="mx-1"> / </span>
            <span className="font-medium text-gray-800">{totalItems}</span>
          </div>
        )}
        <Pagination
          current={pageIndex}
          total={totalItems}
          pageSize={pageSize}
          onChange={(page, size) => {
            setPageIndex(page);
            setPageSize(size);
            fetchRecords(searchTerm, page, size);
          }}
          showSizeChanger
          pageSizeOptions={["5", "10", "20", "50"]}
          locale={{ items_per_page: t("bản ghi") }}
        />
      </div>

      <Modal
        title="⚖️ Cập nhật kết quả xét duyệt Đơn chuyển nhượng nhãn hiệu"
        open={approvalModalOpen}
        onOk={handleConfirmApproval}
        onCancel={() => setApprovalModalOpen(false)}
        confirmLoading={submittingApproval}
        okText="Lưu kết quả"
        cancelText="Hủy"
        width={650}
      >
        {approvalRecord && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded border text-sm space-y-1">
              <div>
                <span className="text-gray-500">Số đơn chuyển nhượng: </span>
                <b className="text-gray-800">{approvalRecord.soDonCQ || approvalRecord.soDon || "—"}</b>
              </div>
              <div>
                <span className="text-gray-500">Đơn gốc: </span>
                <b className="text-indigo-600">{approvalRecord.soDonGoc || approvalRecord.maDonDangKyGoc || "—"}</b>
              </div>
              <div>
                <span className="text-gray-500">Bên nhận chuyển nhượng: </span>
                <b className="text-teal-700">{approvalRecord.tenKhachHangMoi || approvalRecord.tenKhachHang || "—"}</b>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Trạng thái xét duyệt của Cục SHTT:
              </label>
              <Radio.Group
                value={Number(approvalStatus)}
                onChange={(e) => setApprovalStatus(Number(e.target.value))}
                className="flex flex-col gap-2"
              >
                <Radio value={0}>⏳ Chưa chấp thuận</Radio>
                <Radio value={1}>✅ Được chấp thuận</Radio>
                <Radio value={2}>❌ Từ chối</Radio>
              </Radio.Group>
            </div>

            {Number(approvalStatus) === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày ghi nhận chuyển nhượng
                </label>
                <DatePicker
                  value={approvalDate ? dayjs(approvalDate) : null}
                  onChange={(d) => setApprovalDate(d ? d.format("YYYY-MM-DD") : null)}
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </div>
            )}

            {Number(approvalStatus) === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày từ chối
                  </label>
                  <DatePicker
                    value={rejectDate ? dayjs(rejectDate) : null}
                    onChange={(d) => setRejectDate(d ? d.format("YYYY-MM-DD") : null)}
                    format="DD/MM/YYYY"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do từ chối
                  </label>
                  <Input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do Cục từ chối"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú / Mô tả
              </label>
              <Input.TextArea
                rows={3}
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Nhập ghi chú..."
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Xác nhận xóa"
        open={showDeleteModal}
        onOk={handleDeleteRecord}
        onCancel={() => setShowDeleteModal(false)}
        okText="Xác nhận xóa"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600 text-white",
        }}
      >
        <p>Bạn có chắc chắn muốn xóa tờ khai chuyển nhượng này không?</p>
      </Modal>
    </div>
  );
}

export default Application_CQ_NH_VNList;

