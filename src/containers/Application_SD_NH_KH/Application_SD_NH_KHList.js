import { useNavigate, useNavigationType } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import Select from "react-select";
import { exportToExcel } from "../../components/ExportFile/ExportExcel";
import FieldSelector from "../../components/FieldSelector";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { DatePicker, Modal, Spin, Pagination, Radio, Input } from "antd";
import { useTranslation } from "react-i18next";
import SearchCreatableSelect from "../../components/commom/SearchCreatableSelect";
import { showInfo, showSuccess, showError } from "../../components/commom/Notification";

const FILTER_STORAGE_KEY_SD_KH = "applicationSdNhKhListFilters";
const STATE_STORAGE_KEY_SD_KH = "applicationSdNhKhListState";
const PAGE_STORAGE_KEY_SD_KH = "applicationSdNhKhListPage";

function Application_SD_NH_KHList() {
  const role = useSelector((state) => state.auth.role);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [selectedTrangThaiDuyetFilter, setSelectedTrangThaiDuyetFilter] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(0);
  const [approvalSoDon, setApprovalSoDon] = useState("");
  const [approvalDate, setApprovalDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [rejectDate, setRejectDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [rejectReason, setRejectReason] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [submittingApproval, setSubmittingApproval] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productAndService, setProductAndService] = useState([]);
  const [selectedProductAndService, setSelectedProductAndService] = useState([]);
  const [selectedTrangThaiDon, setSelectedTrangThaiDon] = useState(null);

  const [selectedField, setSelectedField] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedHanXuLy, setSelectedHanXuLy] = useState(null);
  const [sortByHanXuLy, setSortByHanXuLy] = useState(false);
  const [selectedHanTraLoi, setSelectedHanTraLoi] = useState(null);
  const [sortByHanTraLoi, setSortByHanTraLoi] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [customerName, setCustomerName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [customerOptions, setCustomerOptions] = useState([]);
  const [partnerOptions, setPartnerOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);

  const applicationSearchOptions = React.useMemo(() => {
    const list = [];
    const seen = new Set();
    (applications || []).forEach((app) => {
      const sdNo = app.soDonSD || app.soDon;
      if (sdNo && !seen.has(sdNo)) {
        seen.add(sdNo);
        list.push({
          value: sdNo,
          label: `Số đơn: ${sdNo}${app.tenNhanHieu ? ` - ${app.tenNhanHieu}` : ""}`,
        });
      }
      if (app.maHoSoVuViec && !seen.has(app.maHoSoVuViec)) {
        seen.add(app.maHoSoVuViec);
        list.push({
          value: app.maHoSoVuViec,
          label: `Mã HSVV: ${app.maHoSoVuViec}${app.tenNhanHieu ? ` - ${app.tenNhanHieu}` : ""}`,
        });
      }
    });
    return list;
  }, [applications]);

  const filterCondition = {
    selectedField: selectedField?.value || "",
    fromDate,
    toDate,
    hanXuLyFilter: selectedHanXuLy?.value || "",
    hanTraLoiFilter: selectedHanTraLoi?.value || "",
    sortByHanXuLy,
    sortByHanTraLoi,
  };

  const trangThaiDonOptions = [
    { value: "Nộp đơn", label: "Nộp đơn" },
    { value: "Hoàn thành hồ sơ tài liệu", label: "Hoàn thành hồ sơ tài liệu" },
    { value: "Thẩm định", label: "Thẩm định" },
    { value: "Đơn đăng ký hoàn tất", label: "Đơn đăng ký hoàn tất" },
  ];

  const allFieldOptions = [
    { label: "Số Đơn sửa đổi", labelEn: "Amendment No", key: "soDonSD" },
    { label: "Trạng thái xét duyệt", labelEn: "Approval Status", key: "trangThaiDuyet" },
    { label: "Số đơn được sửa đổi", labelEn: "Amended Application No", key: "soDonGoc" },
    { label: "Nội dung sửa đổi", labelEn: "Amended Items", key: "noiDungSuaDoi" },
    { label: "Mã HSVV", labelEn: "Matter code", key: "maHoSoVuViec" },
    { label: "Ngày yêu cầu sửa đổi", key: "ngayYeuCau" },
    { label: "Ngày ghi nhận sửa đổi", key: "ngayGhiNhanSuaDoi" },
    { label: "Lần sửa đổi", key: "lanSuaDoi" },
    { label: "Tên khách hàng", labelEn: "Client Name", key: "tenKhachHang" },
    { label: "Tên đối tác", labelEn: "Partner Name", key: "tenDoiTac" },
    { label: "Tên nhãn hiệu", labelEn: "Trademark", key: "tenNhanHieu" },
    { label: "Ảnh nhãn hiệu", labelEn: "Image", key: "linkAnh" },
    { label: "Nhóm SPDV", labelEn: "Class", key: "dsSPDV" },
    { label: "Tình trạng xử lý đơn", labelEn: "Next stage", key: "tinhTrangDon" },
    { label: "Trạng thái đơn", labelEn: "Status", key: "trangThaiVuViec" },
    { label: "Hạn trả lời Cục", labelEn: "Official Deadline", key: "hanTraLoi" },
    { label: "Hạn Cục xử lý", labelEn: "Soft Deadline", key: "hanXuLy" },
    { label: "Trạng thái hoàn thành TL", labelEn: "Outstanding Documents", key: "trangThaiHoanThienHoSoTaiLieu" },
    { label: "Ngày nộp đơn", labelEn: "Filing Date", key: "ngayNopDon" },
    { label: "Ngày hoàn thành TL", labelEn: "Doc Completion", key: "ngayHoanThanhHoSoTaiLieu" },
    { label: "Ngày có KQ thẩm định", labelEn: "Exam Result", key: "ngayKQThamDinh" },
    { label: "Ngày nhận bằng", labelEn: "Certificate Receipt", key: "ngayNhanBang" },
    { label: "Số bằng", key: "soBang" },
    { label: "Ngày cấp bằng", key: "ngayCapBang" },
    { label: "Ngày hết hạn bằng", key: "ngayHetHanBang" },
    { label: "Ngày gửi bằng cho khách hàng", key: "ngayGuiBangChoKhachHang" },
    { label: "Loại đơn", labelEn: "Application Type", key: "loaiDon" },
  ];

  const hiddenFieldKeys = [
    "ngayHoanThanhHoSoTaiLieu",
    "ngayKQThamDinh",
    "soBang",
    "ngayCapBang",
    "ngayHetHanBang",
    "ngayGuiBangChoKhachHang",
    "ngayNhanBang",
    "dsSPDV",
    "ngayNopDon",
  ];

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState(
    allFieldOptions
      .filter((field) => !hiddenFieldKeys.includes(field.key))
      .map((field) => field.key)
  );

  const fetchApplications = async (
    searchValue,
    page = 1,
    size = 10,
    customFilterCondition = null,
    overrides = {}
  ) => {
    setLoading(true);
    try {
      localStorage.setItem(PAGE_STORAGE_KEY_SD_KH, page.toString());

      const payload = {
        searchText: searchValue !== undefined ? searchValue : searchTerm,
        customerName: overrides.customerName !== undefined ? overrides.customerName : customerName,
        partnerName: overrides.partnerName !== undefined ? overrides.partnerName : partnerName,
        brandName: overrides.brandName !== undefined ? overrides.brandName : brandName,
        maSPDVList:
          overrides.selectedProductAndService !== undefined
            ? overrides.selectedProductAndService
            : selectedProductAndService,
        trangThaiDon:
          overrides.selectedTrangThaiDon !== undefined
            ? overrides.selectedTrangThaiDon
            : selectedTrangThaiDon,
        trangThaiDuyet:
          overrides.selectedTrangThaiDuyetFilter !== undefined
            ? overrides.selectedTrangThaiDuyetFilter
            : selectedTrangThaiDuyetFilter,
        fields: [
          ...new Set([
            ...(overrides.selectedFields !== undefined ? overrides.selectedFields : selectedFields),
            "suaDoiDaiDien",
            "suaDoiTenChuDon",
            "suaDoiDiaChi",
            "suaNhan",
            "suaNhomSPDV",
            "suaDoiNoiDungKhac",
          ]),
        ],
        filterCondition: customFilterCondition || filterCondition,
        pageIndex: page,
        pageSize: size,
      };

      const response = await callAPI({
        method: "post",
        endpoint: "/application_sd_nh_kh/list",
        data: payload,
      });

      setApplications(response.data || []);
      setTotalItems(response.pagination?.totalItems || 0);
      setPageIndex(response.pagination?.pageIndex || 1);
      setPageSize(response.pagination?.pageSize || 10);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn sửa đổi Campuchia:", error);
      setApplications([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/productsandservices/list",
        data: {},
      });
      setProductAndService(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm/dịch vụ:", error);
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

  const formatOptions = (data, valueKey, labelKey) =>
    data.map((item) => ({
      value: item[valueKey],
      label: item[labelKey],
    }));

  useEffect(() => {
    const savedPage = parseInt(localStorage.getItem(PAGE_STORAGE_KEY_SD_KH) || "1", 10);
    const savedFiltersString = localStorage.getItem(FILTER_STORAGE_KEY_SD_KH);
    const savedStateString = localStorage.getItem(STATE_STORAGE_KEY_SD_KH);

    fetchItems();
    fetchFilterOptions();

    if (navigationType === "POP" && savedStateString) {
      try {
        const savedFilters = savedFiltersString ? JSON.parse(savedFiltersString) : {};
        const savedState = JSON.parse(savedStateString);

        setSearchTerm(savedFilters.searchTerm || "");
        setCustomerName(savedFilters.customerName || "");
        setPartnerName(savedFilters.partnerName || "");
        setBrandName(savedFilters.brandName || "");
        setSelectedProductAndService(savedFilters.selectedProductAndService || []);
        setSelectedTrangThaiDon(savedFilters.selectedTrangThaiDon || null);
        setSelectedField(savedFilters.selectedField || null);
        setFromDate(savedFilters.fromDate || "");
        setToDate(savedFilters.toDate || "");
        setSelectedHanXuLy(savedFilters.selectedHanXuLy || null);
        setSortByHanXuLy(savedFilters.sortByHanXuLy || false);
        setSelectedHanTraLoi(savedFilters.selectedHanTraLoi || null);
        setSortByHanTraLoi(savedFilters.sortByHanTraLoi || false);

        setApplications(savedState.applications || []);
        setTotalItems(savedState.totalItems || 0);
        setPageIndex(savedState.pageIndex || savedPage || 1);
        setPageSize(savedState.pageSize || 10);

        const restoredFilterCondition = {
          selectedField: savedFilters.selectedField?.value || "",
          fromDate: savedFilters.fromDate || "",
          toDate: savedFilters.toDate || "",
          hanXuLyFilter: savedFilters.selectedHanXuLy?.value || "",
          hanTraLoiFilter: savedFilters.selectedHanTraLoi?.value || "",
          sortByHanXuLy: savedFilters.sortByHanXuLy || false,
          sortByHanTraLoi: savedFilters.sortByHanTraLoi || false,
        };

        fetchApplications(
          savedFilters.searchTerm || "",
          savedPage,
          savedState?.pageSize || pageSize,
          restoredFilterCondition,
          savedFilters
        );
      } catch (e) {
        console.error("Error parsing saved state/filters (SD_NH_KH)", e);
        fetchApplications("", savedPage, pageSize);
      }
    } else if (savedFiltersString) {
      try {
        const savedFilters = JSON.parse(savedFiltersString);
        setSearchTerm(savedFilters.searchTerm || "");
        setCustomerName(savedFilters.customerName || "");
        setPartnerName(savedFilters.partnerName || "");
        setBrandName(savedFilters.brandName || "");
        setSelectedProductAndService(savedFilters.selectedProductAndService || []);
        setSelectedTrangThaiDon(savedFilters.selectedTrangThaiDon || null);
        setSelectedField(savedFilters.selectedField || null);
        setFromDate(savedFilters.fromDate || "");
        setToDate(savedFilters.toDate || "");
        setSelectedHanXuLy(savedFilters.selectedHanXuLy || null);
        setSortByHanXuLy(savedFilters.sortByHanXuLy || false);
        setSelectedHanTraLoi(savedFilters.selectedHanTraLoi || null);
        setSortByHanTraLoi(savedFilters.sortByHanTraLoi || false);

        const restoredFilterCondition = {
          selectedField: savedFilters.selectedField?.value || "",
          fromDate: savedFilters.fromDate || "",
          toDate: savedFilters.toDate || "",
          hanXuLyFilter: savedFilters.selectedHanXuLy?.value || "",
          hanTraLoiFilter: savedFilters.selectedHanTraLoi?.value || "",
          sortByHanXuLy: savedFilters.sortByHanXuLy || false,
          sortByHanTraLoi: savedFilters.sortByHanTraLoi || false,
        };

        fetchApplications(
          savedFilters.searchTerm || "",
          savedPage,
          pageSize,
          restoredFilterCondition,
          savedFilters
        );
      } catch (e) {
        console.error("Error parsing saved filters (SD_NH_KH)", e);
        fetchApplications("", savedPage, pageSize);
      }
    } else {
      fetchApplications("", savedPage, pageSize);
    }

    if (!localStorage.getItem(PAGE_STORAGE_KEY_SD_KH)) {
      localStorage.setItem(PAGE_STORAGE_KEY_SD_KH, "1");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationType]);

  useEffect(() => {
    const filtersToSave = {
      searchTerm,
      customerName,
      partnerName,
      brandName,
      selectedProductAndService,
      selectedTrangThaiDon,
      selectedField,
      fromDate,
      toDate,
      selectedHanXuLy,
      sortByHanXuLy,
      selectedHanTraLoi,
      sortByHanTraLoi,
      selectedFields,
    };
    localStorage.setItem(FILTER_STORAGE_KEY_SD_KH, JSON.stringify(filtersToSave));
  }, [
    searchTerm,
    customerName,
    partnerName,
    brandName,
    selectedProductAndService,
    selectedTrangThaiDon,
    selectedField,
    fromDate,
    toDate,
    selectedHanXuLy,
    sortByHanXuLy,
    selectedHanTraLoi,
    sortByHanTraLoi,
    selectedFields,
  ]);

  useEffect(() => {
    const stateToSave = {
      applications,
      totalItems,
      pageIndex,
      pageSize,
    };
    localStorage.setItem(STATE_STORAGE_KEY_SD_KH, JSON.stringify(stateToSave));
  }, [applications, totalItems, pageIndex, pageSize]);

  const columns = allFieldOptions
    .filter((field) => selectedFields.includes(field.key))
    .map((field) => ({ label: field.label, labelEn: field.labelEn, key: field.key }));

  const fieldOptions = [
    { value: "ngayNopDon", label: "Ngày nộp đơn" },
    { value: "ngayHoanThanhHoSoTaiLieu", label: "Ngày hoàn thành tài liệu" },
    { value: "ngayGuiBangChoKhachHang", label: "Ngày gửi bằng cho khách hàng" },
    { value: "ngayHetHanBang", label: "Ngày hết hạn bằng" },
  ];

  const hanOptions = [
    { value: "<30", label: "Còn hạn dưới 30 ngày" },
    { value: "<15", label: "Còn hạn dưới 15 ngày" },
    { value: "<7", label: "Còn hạn dưới 7 ngày" },
    { value: "overdue", label: "Đã quá hạn" },
  ];

  const getTenSPDVChuoi = (spdvList) => {
    if (!Array.isArray(spdvList) || spdvList.length === 0) return "";
    return spdvList
      .map((sp) => {
        const found = productAndService.find((p) => p.maSPDV === sp.maSPDV);
        return found?.tenSPDV || `${sp.maSPDV}`;
      })
      .join(", ");
  };

  const handleDeleteApplication = async () => {
    try {
      const targetId = applicationToDelete?.idDonSuaDoi || applicationToDelete?.id;
      if (targetId) {
        await callAPI({
          method: "post",
          endpoint: "/application_sd_nh_kh/delete",
          data: { id: targetId },
        });
      } else {
        await callAPI({
          method: "post",
          endpoint: "/application_kh/delete",
          data: { maDonDangKy: applicationToDelete?.maDonDangKy || applicationToDelete },
        });
      }
      setShowDeleteModal(false);
      setApplicationToDelete(null);
      fetchApplications(searchTerm, pageIndex, pageSize);
    } catch (error) {
      console.error("Lỗi khi xóa đơn sửa đổi Campuchia:", error);
      showError("Thất bại", "Không thể xóa đơn sửa đổi.", error);
      setShowDeleteModal(false);
      setApplicationToDelete(null);
    }
  };

  const openApprovalModal = (app) => {
    setApprovalRecord(app);
    setApprovalStatus(Number(app.trangThaiDuyet ?? 0));
    setApprovalSoDon(app.soDonSD || app.soDon || "");
    setApprovalDate(
      app.ngayChapThuan || app.ngayGhiNhanSuaDoi
        ? dayjs(app.ngayChapThuan || app.ngayGhiNhanSuaDoi).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD")
    );
    setRejectDate(
      app.ngayTuChoi ? dayjs(app.ngayTuChoi).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
    );
    setRejectReason(app.lyDoTuChoi || "");
    setApprovalNote(app.moTaSuaDoi || app.moTa || "");
    setApprovalModalOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!approvalRecord?.idDonSuaDoi && !approvalRecord?.id) {
      showError("Lỗi", "Không tìm thấy ID tờ khai sửa đổi.");
      return;
    }
    setSubmittingApproval(true);
    try {
      const st = Number(approvalStatus);
      await callAPI({
        method: "post",
        endpoint: "/application_sd_nh_kh/update",
        data: {
          id: approvalRecord.idDonSuaDoi || approvalRecord.id,
          trangThaiDuyet: st,
          soDonSD: st === 2 ? null : (approvalSoDon.trim() || null),
          soDon: st === 2 ? null : (approvalSoDon.trim() || null),
          duocGhiNhanSuaDoi: st === 1,
          ngayChapThuan: st === 1 ? approvalDate : null,
          ngayGhiNhanSuaDoi: st === 1 ? approvalDate : null,
          ngayTuChoi: st === 2 ? rejectDate : null,
          lyDoTuChoi: st === 2 ? rejectReason : null,
          moTa: approvalNote,
        },
      });
      await showSuccess("Thành công", "Đã cập nhật trạng thái xét duyệt tờ khai sửa đổi!");
      setApprovalModalOpen(false);
      setApprovalRecord(null);
      fetchApplications(searchTerm, pageIndex, pageSize);
    } catch (err) {
      console.error("Lỗi cập nhật xét duyệt:", err);
      showError("Thất bại", "Không thể cập nhật trạng thái xét duyệt.", err);
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedProductAndService([]);
    setSelectedTrangThaiDon(null);
    setSelectedTrangThaiDuyetFilter(null);
    setSelectedField(null);
    setFromDate("");
    setToDate("");
    setSelectedHanXuLy(null);
    setSortByHanXuLy(false);
    setSelectedHanTraLoi(null);
    setSortByHanTraLoi(false);
    setCustomerName("");
    setPartnerName("");
    setBrandName("");
    setSearchTerm("");
    fetchApplications(
      "",
      1,
      pageSize,
      {
        selectedField: "",
        fromDate: "",
        toDate: "",
        hanXuLyFilter: "",
        hanTraLoiFilter: "",
        sortByHanXuLy: false,
        sortByHanTraLoi: false,
      },
      {
        customerName: "",
        partnerName: "",
        brandName: "",
        selectedProductAndService: [],
        selectedTrangThaiDon: null,
        selectedTrangThaiDuyetFilter: null,
      }
    );
  };

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          📌 Danh sách đơn sửa đổi nhãn hiệu Campuchia
        </h2>

        {/* Hàng Search chính */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="w-full md:w-1/3">
            <SearchCreatableSelect
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
              onSearch={(keyword) =>
                fetchApplications(keyword !== undefined ? keyword : searchTerm, 1, pageSize)
              }
              options={applicationSearchOptions}
              placeholder="🔍 Nhập số đơn hoặc mã hồ sơ"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => fetchApplications(searchTerm, 1, pageSize)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() =>
                showInfo("Thông báo", "Vui lòng sửa đổi đơn trong danh sách Đơn đăng ký.")
              }
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Thêm mới
            </button>
            <button
              onClick={() => exportToExcel(applications, allFieldOptions, "DanhSachDonDK_SuaDoi_KH")}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Xuất Excel
            </button>
            <button
              onClick={() => setShowFieldModal(true)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Chọn cột hiển thị
            </button>
            <button
              onClick={handleClearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-3 rounded-lg shadow-md transition"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        {/* Filters */}
        <div>
          <div className="flex flex-wrap gap-3">
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Khách hàng
              </label>
              <SearchCreatableSelect
                value={customerName || ""}
                onChange={(val) => setCustomerName(val)}
                onSearch={() => fetchApplications(searchTerm, 1, pageSize)}
                options={customerOptions}
                placeholder="Nhập tên khách hàng"
              />
            </div>
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Đối tác
              </label>
              <SearchCreatableSelect
                value={partnerName || ""}
                onChange={(val) => setPartnerName(val)}
                onSearch={() => fetchApplications(searchTerm, 1, pageSize)}
                options={partnerOptions}
                placeholder="Nhập tên đối tác"
              />
            </div>
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Nhãn hiệu
              </label>
              <SearchCreatableSelect
                value={brandName || ""}
                onChange={(val) => setBrandName(val)}
                onSearch={() => fetchApplications(searchTerm, 1, pageSize)}
                options={brandOptions}
                placeholder="Nhập tên nhãn hiệu"
              />
            </div>

            {/* Sản phẩm dịch vụ */}
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Sản phẩm dịch vụ
              </label>
              <Select
                options={formatOptions(productAndService, "maSPDV", "tenSPDV")}
                value={formatOptions(productAndService, "maSPDV", "tenSPDV").filter((opt) =>
                  selectedProductAndService?.includes(opt.value)
                )}
                onChange={(selectedOptions) =>
                  setSelectedProductAndService(
                    selectedOptions ? selectedOptions.map((opt) => opt.value) : []
                  )
                }
                placeholder="Chọn SPDV"
                className="text-left"
                isClearable
                isMulti
              />
            </div>

            {/* Trạng thái xét duyệt tờ khai */}
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Trạng thái xét duyệt
              </label>
              <Select
                options={[
                  { value: 0, label: "⏳ Chưa chấp thuận" },
                  { value: 1, label: "✅ Được chấp thuận" },
                  { value: 2, label: "❌ Từ chối" },
                ]}
                value={
                  [
                    { value: 0, label: "⏳ Chưa chấp thuận" },
                    { value: 1, label: "✅ Được chấp thuận" },
                    { value: 2, label: "❌ Từ chối" },
                  ].find((opt) => opt.value === selectedTrangThaiDuyetFilter) || null
                }
                onChange={(selectedOption) =>
                  setSelectedTrangThaiDuyetFilter(selectedOption ? selectedOption.value : null)
                }
                placeholder="Tất cả trạng thái"
                className="text-left"
                isClearable
              />
            </div>

            {/* Trạng thái đơn */}
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Trạng thái đơn
              </label>
              <Select
                options={trangThaiDonOptions}
                value={trangThaiDonOptions.find((opt) => opt.value === selectedTrangThaiDon) || null}
                onChange={(selectedOption) =>
                  setSelectedTrangThaiDon(selectedOption ? selectedOption.value : null)
                }
                placeholder="Chọn trạng thái đơn"
                className="text-left"
                isClearable
              />
            </div>

            {/* Hạn xử lý */}
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Lọc theo hạn xử lý
              </label>
              <Select
                options={hanOptions}
                value={selectedHanXuLy}
                onChange={(option) => setSelectedHanXuLy(option)}
                placeholder="Lọc theo hạn xử lý"
                isClearable
                className="text-left"
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sortByHanXuLy}
                  onChange={(e) => {
                    setSortByHanXuLy(e.target.checked);
                    if (e.target.checked) setSortByHanTraLoi(false);
                  }}
                />
                <label>Sắp xếp theo hạn xử lý</label>
              </div>
            </div>

            {/* Hạn trả lời */}
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Lọc theo hạn trả lời
              </label>
              <Select
                options={hanOptions}
                value={selectedHanTraLoi}
                onChange={(option) => setSelectedHanTraLoi(option)}
                placeholder="Lọc theo hạn trả lời"
                isClearable
                className="text-left"
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sortByHanTraLoi}
                  onChange={(e) => {
                    setSortByHanTraLoi(e.target.checked);
                    if (e.target.checked) setSortByHanXuLy(false);
                  }}
                />
                <label>Sắp xếp theo hạn trả lời</label>
              </div>
            </div>

            {/* Dòng 2: Lọc theo thời gian */}
            <div className="w-full">
              <div className="flex flex-wrap gap-3">
                <div className="w-full md:w-1/4">
                  <Select
                    options={fieldOptions}
                    value={selectedField}
                    onChange={(option) => setSelectedField(option)}
                    placeholder="Chọn trường ngày"
                    className="text-left"
                    isClearable
                  />
                </div>
                <DatePicker
                  value={fromDate ? dayjs(fromDate) : null}
                  onChange={(date) =>
                    setFromDate(
                      dayjs.isDayjs(date) && date.isValid() ? date.format("YYYY-MM-DD") : ""
                    )
                  }
                  format="DD/MM/YYYY"
                  placeholder="Từ ngày"
                  className="w-full md:w-1/6"
                />
                <DatePicker
                  value={toDate ? dayjs(toDate) : null}
                  onChange={(date) =>
                    setToDate(
                      dayjs.isDayjs(date) && date.isValid() ? date.format("YYYY-MM-DD") : ""
                    )
                  }
                  format="DD/MM/YYYY"
                  placeholder="Đến ngày"
                  className="w-full md:w-1/6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-2 text-left text-gray-600 text-xl">
        {t("Tìm thấy")} <b className="text-blue-600">{totalItems}</b> {t("kết quả")}
      </div>

      <div className="overflow-x-auto mt-4 overflow-hidden rounded-lg border shadow">
        <Spin spinning={loading} tip="Loading..." size="large">
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr className="text-[#667085] text-center font-normal">
                <th className="p-2 text-table">
                  <div className="leading-tight">
                    STT
                    <div className="text-xs text-gray-700">No.</div>
                  </div>
                </th>
                {columns.map((col) => (
                  <th key={col.key} className="p-2 text-table">
                    <div className="leading-tight">
                      {col.label}
                      <div className="text-xs text-gray-700">{col.labelEn}</div>
                    </div>
                  </th>
                ))}
                <th className="p-2 text-table"></th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((app, index) => (
                  <tr
                    key={app.idDonSuaDoi || app.id || app.maDonDangKy || index}
                    className="group hover:bg-gray-100 text-center border-b relative"
                  >
                    <td className="p-2 text-table">{index + 1}</td>
                    {columns.map((col) => {
                      const commonClass = "p-2 text-table";
                      const content = app[col.key];

                      const isDateField = [
                        "ngayNopDon",
                        "ngayHoanThanhHoSoTaiLieu",
                        "ngayKQThamDinh",
                        "ngayNhanBang",
                        "ngayCapBang",
                        "ngayHetHanBang",
                        "ngayGuiBangChoKhachHang",
                        "ngayYeuCau",
                        "ngayGhiNhanSuaDoi",
                      ];

                      if (col.key === "ngayGhiNhanSuaDoi" && Number(app.trangThaiDuyet) !== 1) {
                        return (
                          <td key={col.key} className={commonClass}>
                            —
                          </td>
                        );
                      }
                      if (isDateField.includes(col.key)) {
                        return (
                          <td key={col.key} className={commonClass}>
                            {content ? new Date(content).toLocaleDateString("vi-VN") : ""}
                          </td>
                        );
                      }
                      if (col.key === "soDonSD") {
                        const targetId = app.idDonSuaDoi || app.id;
                        return (
                          <td
                            key={col.key}
                            className={`p-2 text-table font-semibold ${
                              targetId ? "text-blue-500 cursor-pointer hover:underline" : "text-gray-800"
                            }`}
                            onClick={(e) => {
                              if (targetId) {
                                e.stopPropagation();
                                navigate(`/application_sd_nh_kh_detail/${targetId}`);
                              }
                            }}
                          >
                            {Number(app.trangThaiDuyet) === 2 ? "—" : (app.soDonSD || app.soDon || "—")}
                          </td>
                        );
                      }
                      if (col.key === "soDonGoc") {
                        return (
                          <td
                            key={col.key}
                            className={`p-2 text-table ${
                              app.maDonDangKyGoc
                                ? "text-indigo-600 cursor-pointer hover:underline font-medium"
                                : "text-gray-700"
                            }`}
                            onClick={(e) => {
                              if (app.maDonDangKyGoc) {
                                e.stopPropagation();
                                navigate(`/applicationdetail_kh/${app.maDonDangKyGoc}`);
                              }
                            }}
                          >
                            {app.soDonGoc || app.maDonDangKyGoc || "—"}
                          </td>
                        );
                      }
                      if (col.key === "noiDungSuaDoi") {
                        const tags = [
                          app.suaDoiTenChuDon && "Tên chủ đơn",
                          app.suaDoiDiaChi && "Địa chỉ",
                          app.suaDoiDaiDien && "Đại diện",
                          app.suaNhan && "Nhãn",
                          app.suaNhomSPDV && "Nhóm SP/DV",
                          app.suaDoiNoiDungKhac && "Nội dung khác",
                        ].filter(Boolean);
                        return (
                          <td key={col.key} className={commonClass}>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {tags.length > 0 ? (
                                tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                        );
                      }
                      if (col.key === "trangThaiDuyet") {
                        const st = Number(app.trangThaiDuyet ?? 0);
                        return (
                          <td key={col.key} className="p-2 text-table">
                            <div className="flex flex-col items-center gap-1">
                              {st === 0 && !app.dangChoTraLoiCuc && (
                                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                  ⏳ Chưa chấp thuận
                                </span>
                              )}
                              {st === 0 && app.dangChoTraLoiCuc && (
                                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-300">
                                  ⚠️ Chờ trả lời Cục
                                  {app.soLanThongBaoCuc ? ` (Lần ${app.soLanThongBaoCuc})` : ""}
                                </span>
                              )}
                              {st === 1 && (
                                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  ✅ Được chấp thuận
                                </span>
                              )}
                              {st === 2 && (
                                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-300">
                                  ❌ Từ chối{app.tuDongTuChoi ? " (Quá hạn)" : ""}
                                </span>
                              )}
                              {st === 2 && app.lyDoTuChoi && (
                                <span className="text-[11px] text-red-600 italic">
                                  Lý do: {app.lyDoTuChoi}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      }
                      if (col.key === "loaiDon") {
                        let text = "";
                        switch (app.loaiDon) {
                          case 1:
                            text = "Đơn gốc";
                            break;
                          case 2:
                            text = "Đơn sửa đổi";
                            break;
                          case 3:
                            text = "Đơn tách";
                            break;
                          default:
                            text = "Không xác định";
                            break;
                        }
                        return (
                          <td key={col.key} className="p-2 text-table">
                            {text}
                          </td>
                        );
                      }
                      if (col.key === "trangThaiVuViec") {
                        let text = "";
                        switch (app.trangThaiVuViec) {
                          case "1":
                            text = "Đang giải quyết";
                            break;
                          case "2":
                            text = "Cấp bằng";
                            break;
                          case "3":
                            text = "Từ chối";
                            break;
                          case "4":
                            text = "Rút đơn";
                            break;
                          case "5":
                            text = "Đóng đơn";
                            break;
                          case "6":
                            text = "Ngừng theo đuổi";
                            break;
                          default:
                            text = "Không xác định";
                            break;
                        }
                        return (
                          <td key={col.key} className="p-2 text-table">
                            {text}
                          </td>
                        );
                      }
                      if (col.key === "dsSPDV") {
                        return (
                          <td key={col.key} className={commonClass}>
                            {getTenSPDVChuoi(app.dsSPDV)}
                          </td>
                        );
                      }
                      if (col.key === "hanXuLy") {
                        if (app.trangThaiVuViec === "5") {
                          return <td key={col.key} className="p-2 font-semibold"></td>;
                        }
                        let text = "";
                        let textColor = "";
                        if (app.hanXuLy) {
                          const today = new Date();
                          const hanXuLyDate = new Date(app.hanXuLy);
                          if (!isNaN(hanXuLyDate.getTime())) {
                            const diffTime =
                              hanXuLyDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) {
                              text = `Quá hạn ${Math.abs(diffDays)} ngày`;
                              textColor = "text-red-600";
                            } else if (diffDays <= 7) {
                              text = `Còn ${diffDays} ngày`;
                              textColor = "text-orange-500";
                            } else {
                              text = `Còn ${diffDays} ngày`;
                              textColor = "text-emerald-600";
                            }
                          }
                        }
                        return (
                          <td key={col.key} className={`p-2 font-semibold ${textColor}`}>
                            {text}
                          </td>
                        );
                      }
                      if (col.key === "hanTraLoi") {
                        const st = Number(app.trangThaiDuyet ?? 0);
                        if (st === 2 && app.tuDongTuChoi) {
                          return (
                            <td key={col.key} className="p-2 font-semibold text-red-600">
                              Quá hạn trả lời
                            </td>
                          );
                        }
                        if (st !== 0 || !app.hanTraLoi) {
                          return <td key={col.key} className="p-2 text-table"></td>;
                        }
                        const diffDays = dayjs(app.hanTraLoi)
                          .startOf("day")
                          .diff(dayjs().startOf("day"), "day");
                        let text = "";
                        let textColor = "";
                        if (diffDays < 0) {
                          text = `Quá hạn ${Math.abs(diffDays)} ngày`;
                          textColor = "text-red-600";
                        } else if (diffDays === 0) {
                          text = "Hạn là hôm nay";
                          textColor = "text-orange-600";
                        } else if (diffDays <= 7) {
                          text = `Còn ${diffDays} ngày`;
                          textColor = "text-orange-500";
                        } else {
                          text = `Còn ${diffDays} ngày`;
                          textColor = "text-emerald-600";
                        }
                        return (
                          <td key={col.key} className={`p-2 font-semibold ${textColor}`}>
                            {text}
                          </td>
                        );
                      }
                      if (col.key === "trangThaiHoanThienHoSoTaiLieu") {
                        return (
                          <td className="p-2 min-w-[120px]" key={col.key}>
                            <div className="flex flex-col text-table">
                              <span>{app.trangThaiHoanThienHoSoTaiLieu}</span>
                              {app.ngayHoanThanhHoSoTaiLieu_DuKien &&
                                app.trangThaiHoanThienHoSoTaiLieu !== "Hoàn thành" &&
                                (() => {
                                  const today = new Date();
                                  const dueDate = new Date(app.ngayHoanThanhHoSoTaiLieu_DuKien);
                                  const diffTime = dueDate - today;
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  const textColor = diffDays < 0 ? "text-red-500" : "text-orange-500";
                                  return (
                                    <div>
                                      <span className={`text-xs ${textColor}`}>
                                        {diffDays > 0
                                          ? `Còn ${diffDays} ngày`
                                          : diffDays === 0
                                          ? "Hạn là hôm nay"
                                          : `Quá hạn ${Math.abs(diffDays)} ngày`}
                                      </span>
                                    </div>
                                  );
                                })()}
                              {app.taiLieuChuaNop?.length > 0 && (
                                <ul className="mt-1 list-disc list-inside text-xs text-gray-600">
                                  {app.taiLieuChuaNop.map((tl, idx) => (
                                    <li key={idx}>{tl.tenTaiLieu}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </td>
                        );
                      }
                      if (col.key === "linkAnh") {
                        return (
                          <td key={col.key} className={commonClass}>
                            {typeof content === "string" && content.startsWith("data:image/") ? (
                              <img
                                src={content}
                                alt="Ảnh"
                                className="mx-auto max-h-20 rounded shadow-sm object-contain"
                              />
                            ) : (
                              <span className="text-gray-500 italic">Không có ảnh</span>
                            )}
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className={commonClass}>
                          {content}
                        </td>
                      );
                    })}
                    <td className="p-2 text-table">
                      {(role === "admin" || role === "staff") && (
                        <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                          {(app.idDonSuaDoi || app.id) && (
                            <button
                              className="px-3 py-1 bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200"
                              onClick={() =>
                                navigate(`/application_sd_nh_kh_detail/${app.idDonSuaDoi || app.id}`)
                              }
                              title="Xem chi tiết tờ khai sửa đổi"
                            >
                              👁️
                            </button>
                          )}
                          <button
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                            onClick={() => openApprovalModal(app)}
                            title="Cập nhật kết quả xét duyệt của Cục"
                          >
                            ⚖️ Duyệt
                          </button>
                          {(app.idDonSuaDoi || app.id) && (
                            <button
                              className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                              onClick={() =>
                                navigate(`/application_sd_nh_kh_edit/${app.idDonSuaDoi || app.id}`)
                              }
                              title="Chỉnh sửa tờ khai sửa đổi"
                            >
                              📝
                            </button>
                          )}
                          <button
                            className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                            onClick={() => {
                              setApplicationToDelete(app);
                              setShowDeleteModal(true);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="p-4 text-center text-gray-500">
                    Không có đơn đăng ký nào
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
            fetchApplications(searchTerm, page, size);
          }}
          showSizeChanger
          pageSizeOptions={["5", "10", "20", "50"]}
          locale={{ items_per_page: t("bản ghi") }}
        />
      </div>

      <FieldSelector
        visible={showFieldModal}
        allFieldOptions={allFieldOptions}
        selectedFields={selectedFields}
        setSelectedFields={setSelectedFields}
        onClose={() => setShowFieldModal(false)}
        onConfirm={() => setShowFieldModal(false)}
      />

      <Modal
        title="⚖️ Cập nhật kết quả xét duyệt Tờ khai sửa đổi đơn đăng ký"
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
                <span className="text-gray-500">Số tờ khai sửa đổi: </span>
                <b className="text-gray-800">{approvalRecord.soDonSD || approvalRecord.soDon || "—"}</b>
              </div>
              <div>
                <span className="text-gray-500">Đơn được sửa đổi: </span>
                <b className="text-indigo-600">
                  {approvalRecord.soDonGoc || approvalRecord.maDonDangKyGoc || "—"}
                </b>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Trạng thái xét duyệt của Cục:
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
                    value={approvalDate ? dayjs(approvalDate) : null}
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
                    placeholder="Nhập lý do từ chối"
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
        onOk={handleDeleteApplication}
        onCancel={() => setShowDeleteModal(false)}
        okText="Xác nhận xóa"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600 text-white",
        }}
      >
        <p>Bạn có chắc chắn muốn xóa đơn sửa đổi này không?</p>
      </Modal>
    </div>
  );
}

export default Application_SD_NH_KHList;
