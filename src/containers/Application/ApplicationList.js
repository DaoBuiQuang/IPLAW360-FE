import { useNavigate, useNavigationType, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import Select from "react-select";
import { exportToExcel } from "../../components/ExportFile/ExportExcel";
import FieldSelector from "../../components/FieldSelector";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { DatePicker, Modal, Spin, Pagination } from "antd";
import { useTranslation } from "react-i18next";

const FILTER_STORAGE_KEY = "applicationListFilters";
const STATE_STORAGE_KEY = "applicationListState";

function ApplicationList() {
  const role = useSelector((state) => state.auth.role);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([
    {
      soDon: "123456",
      maHoSoVuViec: "HSVV001",
      tenNhanHieu: "Nhãn hiệu mẫu",
    },
  ]);
  // ===== XỬ LÝ CLICK 3 THÁNG GẦN NHẤT =====
  const applyMonthFilterAndSearch = (month) => {
    // month: "2025-12"
    const start = dayjs(`${month}-01`)
      .startOf("month")
      .format("YYYY-MM-DD");

    const end = dayjs(`${month}-01`)
      .endOf("month")
      .format("YYYY-MM-DD");

    // 1️⃣ Set UI filter (để dropdown hiển thị đúng)
    const fieldObj = { value: "ngayNopDon", label: "Ngày nộp đơn" };

    setSelectedField(fieldObj);
    setFromDate(start);
    setToDate(end);
    setSelectedTrangThaiHTTL(1); // Chưa hoàn thành

    // 2️⃣ Build filterCondition đúng format backend
    const customFilterCondition = {
      ...filterCondition,
      selectedField: "ngayNopDon",
      fromDate: start,
      toDate: end,
    };

    // 3️⃣ GỌI API NGAY
    fetchApplications(
      "",        // searchText
      1,         // page
      pageSize,  // size
      customFilterCondition,
      {
        selectedTrangThaiHTTL: 1,
        selectedField: fieldObj,
        fromDate: start,
        toDate: end,
      }
    );
  };

  useEffect(() => {
    const st = location.state;

    if (!st?._fromDashboard) return;

    // ✅ Nếu muốn: vào từ dashboard thì bỏ qua cache cũ
    localStorage.removeItem(FILTER_STORAGE_KEY);
    localStorage.removeItem(STATE_STORAGE_KEY);
    localStorage.setItem("applicationListPage", "1");
    const goSearch = (overrides = {}, customFilterCondition = null) => {
      // đồng bộ UI filter state
      if (typeof overrides.selectedTrangThaiHTTL !== "undefined") {
        setSelectedTrangThaiHTTL(overrides.selectedTrangThaiHTTL);
      }
      if (typeof overrides.selectedHanXuLy !== "undefined") {
        setSelectedHanXuLy(overrides.selectedHanXuLy);
      }
      if (typeof overrides.selectedHanTraLoi !== "undefined") {
        setSelectedHanTraLoi(overrides.selectedHanTraLoi);
      }
      if (typeof overrides.selectedField !== "undefined") {
        setSelectedField(overrides.selectedField);
      }
      if (typeof overrides.fromDate !== "undefined") setFromDate(overrides.fromDate);
      if (typeof overrides.toDate !== "undefined") setToDate(overrides.toDate);
      if (st.preset === "MONTH_OUTSTANDING_DOCS") {
        applyMonthFilterAndSearch(st.month); // vd "2025-12"
        return;
      }


      // gọi API ngay
      fetchApplications("", 1, pageSize, customFilterCondition, overrides);
    };

    if (st.preset === "ASSIGNEE") {
      const staffId = st.selectedNhanSu;
      if (!staffId) return;

      setSelectedNhanSu(staffId);

      fetchApplications("", 1, pageSize, null, {
        selectedNhanSu: staffId,
      });


      return;
    }
    // ===== 1) OUTSTANDING_DOCS: Trạng thái tài liệu = 1 =====
    if (st.preset === "OUTSTANDING_DOCS") {
      goSearch({ selectedTrangThaiHTTL: 1 });
      return;
    }

    // ===== 2) DEADLINE_BUCKET: set đúng hạn trả lời / hạn xử lý =====
    if (st.preset === "DEADLINE_BUCKET") {
      const bucket = st.bucket; // "overdue" | "<7" | "<15" | "<30"
      const opt =
        hanOptions.find((x) => x.value === bucket) || { value: bucket, label: bucket };

      if (st.deadlineType === "hanTraLoi") {
        goSearch(
          { selectedHanTraLoi: opt },
          { ...filterCondition, hanTraLoiFilter: bucket }
        );
      } else {
        goSearch(
          { selectedHanXuLy: opt },
          { ...filterCondition, hanXuLyFilter: bucket }
        );
      }
      return;
    }

    // ===== 3) MONTH_OUTSTANDING_DOCS:
    // Trạng thái TL = 1
    // Trường ngày = ngàyNopDon
    // fromDate = đầu tháng, toDate = cuối tháng =====
    if (st.preset === "MONTH_OUTSTANDING_DOCS") {
      const month = st.month; // "YYYY-MM"
      const start = dayjs(month + "-01").startOf("month").format("YYYY-MM-DD");
      const end = dayjs(month + "-01").endOf("month").format("YYYY-MM-DD");

      const fieldObj = { value: "ngayNopDon", label: "Ngày nộp đơn" };

      const custom = {
        ...filterCondition,
        selectedField: "ngayNopDon",
        fromDate: start,
        toDate: end,
      };

      goSearch(
        {
          selectedTrangThaiHTTL: 1,
          selectedField: fieldObj,
          fromDate: start,
          toDate: end,
        },
        custom
      );
      return;
    }
  }, [location.key]); // dùng location.key để mỗi lần navigate đều chạy


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [productAndService, setProductAndService] = useState([]);

  const [selectedProductAndService, setSelectedProductAndService] = useState([]);
  const [selectedTrangThaiDon, setSelectedTrangThaiDon] = useState(null);
  const [selectedTrangThaiVV, setSelectedTrangThaiVV] = useState(null);
  const [selectedTrangThaiHTTL, setSelectedTrangThaiHTTL] = useState(null);
  const [selectedNhanSu, setSelectedNhanSu] = useState(null);
  const [selectedLoaiDon, setSelectedLoaiDon] = useState(null);

  const [selectedField, setSelectedField] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedHanXuLy, setSelectedHanXuLy] = useState(null);
  const [sortByHanXuLy, setSortByHanXuLy] = useState(false);
  const [selectedHanTraLoi, setSelectedHanTraLoi] = useState(null);
  const [sortByHanTraLoi, setSortByHanTraLoi] = useState(false);
  const [sortByUpdatedAt, setSortByUpdatedAt] = useState(true);
  const [sortByCreatedAt, setSortByCreatedAt] = useState(false);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [customerName, setCustomerName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [staffs, setStaffs] = useState([]);
  const trangThaiDonOptions = [
    { value: "Nộp đơn", label: "Nộp đơn" },
    { value: "Hoàn thành tài liệu", label: "Hoàn thành tài liệu" },
    { value: "Thẩm định hình thức", label: "Thẩm định hình thức" },
    { value: "Công bố đơn", label: "Công bố đơn" },
    { value: "Thẩm định nội dung", label: "Thẩm định nội dung" },
    { value: "Trả lời thẩm định nội dung", label: "Trả lời thẩm định nội dung" },
    { value: "Hoàn tất nhận bằng", label: "Hoàn tất nhận bằng" },
    { value: "Chờ nhận bằng", label: "Chờ nhận bằng" },
    { label: "Loại đơn", labelEn: "Application Type", key: "loaiDon" },
  ];
  const trangThaiHTTLOptions = [
    { value: 1, label: "Chưa hoàn thành" },
    { value: 2, label: "Đã hoàn thành" },
  ];
  const loaiDonOptions = [
    { value: 1, label: "Đơn gốc" },
    { value: 2, label: "Đơn sửa đổi" },
    { value: 3, label: "Đơn tách" },
    { value: 4, label: "Đơn chuyển nhượng" }
  ];
  const statusOptions = [
    { value: "1", label: "Đang giải quyết" },
    { value: "2", label: "Cấp bằng" },
    { value: "3", label: "Từ chối" },
    { value: "4", label: "Rút đơn" },
    { value: "6", label: "Ngừng theo đuổi" },
    { value: "5", label: "Đóng đơn" }
  ];
  const allFieldOptions = [
    { label: "Số Đơn", labelEn: "App No", key: "soDon" },
    { label: "Mã HSVV", labelEn: "Matter code", key: "maHoSoVuViec" },
    { label: "Tên khách hàng", labelEn: "Client Name", key: "tenKhachHang" },
    { label: "Tên đối tác", labelEn: "Partner Name", key: "tenDoiTac" },
    { label: "Tên nhãn hiệu", labelEn: "Trademark", key: "tenNhanHieu" },
    { label: "Ảnh nhãn hiệu", labelEn: "Image", key: "linkAnh" },
    { label: "Nhóm SPDV", labelEn: "Class", key: "dsSPDV" },
    { label: "Tình trạng xử lý đơn", labelEn: "Next stage", key: "tinhTrangDon" },
    { label: "Trạng thái đơn", labelEn: "Next stage", key: "trangThaiVuViec" },
    { label: "Hạn trả lời Cục", labelEn: "Official Deadline", key: "hanTraLoi" },
    { label: "Hạn Cục xử lý", labelEn: "Soft Deadline", key: "hanXuLy" },
    { label: "Trạng thái hoàn thành TL", labelEn: "Outstanding Documents", key: "trangThaiHoanThienHoSoTaiLieu" },
    { label: "Ngày nộp đơn", labelEn: "Filing Date", key: "ngayNopDon" },
    { label: "Ngày hoàn thành TL", labelEn: "Doc Completion", key: "ngayHoanThanhHoSoTaiLieu" },
    { label: "Ngày có KQ thẩm định hình thức", labelEn: "Formality Exam Result", key: "ngayKQThamDinhHinhThuc" },
    { label: "Ngày công bố đơn", labelEn: "Publication", key: "ngayCongBoDon" },
    { label: "Ngày kết quả thẩm định nội dung", labelEn: "Substantive Exam Result", key: "ngayKQThamDinhND" },
    { label: "Ngày TL kết quả thẩm định nội dung", labelEn: "Response To SE", key: "ngayTraLoiKQThamDinhND" },
    { label: "Ngày thông báo cấp bằng", labelEn: "Notice of Protection", key: "ngayThongBaoCapBang" },
    { label: "Hạn nộp phí cấp bằng", labelEn: "Deadline For Granting Payment", key: "hanNopPhiCapBang" },
    { label: "Ngày nộp phí cấp bằng", labelEn: "For Granting Payment", key: "ngayNopPhiCapBang" },
    { label: "Ngày nhận bằng", labelEn: "Certificate Receipt", key: "ngayNhanBang" },
    { label: "Số bằng", key: "soBang" },
    { label: "Ngày cấp bằng", key: "ngayCapBang" },
    { label: "Ngày hết hạn bằng", key: "ngayHetHanBang" },
    { label: "Ngày gửi bằng cho khách hàng", key: "ngayGuiBangChoKhachHang" },
    { label: "Loại đơn", labelEn: "Application Type", key: "loaiDon" },
  ];

  const hiddenFieldKeys = [
    "ngayHoanThanhHoSoTaiLieu",
    "ngayKQThamDinhHinhThuc",
    "ngayCongBoDon",
    "ngayKQThamDinhND",
    "ngayTraLoiKQThamDinhND",
    "ngayNopPhiCapBang",
    "soBang",
    "ngayCapBang",
    "ngayHetHanBang",
    "ngayGuiBangChoKhachHang",
    "ngayNhanBang",
    "ngayTraLoiKQThamDinhND",
    "dsSPDV",
  ];

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState(
    allFieldOptions.filter((field) => !hiddenFieldKeys.includes(field.key)).map((field) => field.key)
  );

  const fieldOptions = [
    { value: "ngayNopDon", label: "Ngày nộp đơn" },
    { value: "ngayHoanThanhHoSoTaiLieu", label: "Ngày Hoàn thành tài liệu" },
    { value: "ngayKQThamDinhHinhThuc", label: "Ngày chấp nhận đơn hợp lệ" },
    { value: "ngayCongBoDon", label: "Ngày công bố đơn" },
    { value: "ngayKQThamDinhND", label: "Ngày kết quả thẩm định nội dung đơn" },
    { value: "ngayThongBaoCapBang", label: "Ngày thông báo cấp bằng" },
    { value: "ngayNopPhiCapBang", label: "Ngày nộp phí cấp bằng" },
    { value: "ngayGuiBangChoKhachHang", label: "Ngày gửi bằng cho khách hàng" },
    { value: "ngayHetHanBang", label: "Ngày hết hạn bằng" },
  ];

  const hanOptions = [
    { value: "<30", label: "Còn hạn dưới 30 ngày" },
    { value: "<15", label: "Còn hạn dưới 15 ngày" },
    { value: "<7", label: "Còn hạn dưới 7 ngày" },
    { value: "overdue", label: "Đã quá hạn" },
  ];

  const [showFilters, setShowFilters] = useState(false);

  const filterCondition = {
    selectedField: selectedField?.value || "",
    fromDate,
    toDate,
    hanXuLyFilter: selectedHanXuLy?.value || "",
    hanTraLoiFilter: selectedHanTraLoi?.value || "",
    sortByHanXuLy: sortByHanXuLy,
    sortByHanTraLoi: sortByHanTraLoi,
    sortByUpdatedAt: sortByUpdatedAt,
    sortByCreatedAt: sortByCreatedAt,
  };

  const fetchApplications = async (
    searchValue,
    page = 1,
    size = 10,
    customFilterCondition,
    overrides = {}
  ) => {
    setLoading(true);
    try {
      localStorage.setItem("applicationListPage", page.toString());

      const payload = {
        searchText: searchValue,

        customerName: overrides.customerName ?? customerName,
        partnerName: overrides.partnerName ?? partnerName,
        brandName: overrides.brandName ?? brandName,

        maNguoiXuLy1: overrides.selectedNhanSu ?? selectedNhanSu,
        maSPDVList: overrides.selectedProductAndService ?? selectedProductAndService,
        trangThaiDon: overrides.selectedTrangThaiDon ?? selectedTrangThaiDon,
        trangThaiVuViec: overrides.selectedTrangThaiVV ?? selectedTrangThaiVV,
        loaiDon: overrides.selectedLoaiDon ?? selectedLoaiDon,
        trangThaiTaiLieu: overrides.selectedTrangThaiHTTL ?? selectedTrangThaiHTTL,
        fields: overrides.selectedFields ?? selectedFields,

        filterCondition: customFilterCondition || filterCondition,
        pageIndex: page,
        pageSize: size,
      };

      const response = await callAPI({
        method: "post",
        endpoint: "/application/list",
        data: payload,
      });

      setApplications(response.data || []);
      setTotalItems(response.pagination?.totalItems || 0);
      setPageIndex(response.pagination?.pageIndex || 1);
      setPageSize(response.pagination?.pageSize || 10);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn đăng ký:", error);
      // ✅ toast chỉ khi lỗi (nếu bạn muốn)
      // showError("Có lỗi khi tải dữ liệu");
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
  const fetchStaffs = async () => {
    try {
      const response = await callAPI({ method: "post", endpoint: "/staff/basiclist", data: {} });
      setStaffs(response);
    } catch (error) { console.error(error); }
  };
  const formatOptions = (data, valueKey, labelKey) => {
    return data.map((item) => ({
      value: item[valueKey],
      label: item[labelKey],
    }));
  };

  // ✅ Khởi tạo: phân biệt vào mới vs quay lại (Back)
  useEffect(() => {
    const savedPage = parseInt(localStorage.getItem("applicationListPage") || "1", 10);
    const savedFiltersString = localStorage.getItem(FILTER_STORAGE_KEY);
    const savedStateString = localStorage.getItem(STATE_STORAGE_KEY);

    if (navigationType === "POP" && savedStateString) {
      // 👉 Trường hợp Back/Forward: dùng dữ liệu cache, KHÔNG gọi API
      try {
        const savedFilters = savedFiltersString ? JSON.parse(savedFiltersString) : {};
        const savedState = JSON.parse(savedStateString);

        // Khôi phục filter
        setSearchTerm(savedFilters.searchTerm || "");
        setCustomerName(savedFilters.customerName || "");
        setPartnerName(savedFilters.partnerName || "");
        setBrandName(savedFilters.brandName || "");
        setSelectedProductAndService(savedFilters.selectedProductAndService || []);
        setSelectedTrangThaiDon(savedFilters.selectedTrangThaiDon || null);
        setSelectedTrangThaiHTTL(savedFilters.selectedTrangThaiHTTL || null);
        setSelectedField(savedFilters.selectedField || null);
        setFromDate(savedFilters.fromDate || "");
        setToDate(savedFilters.toDate || "");
        setSelectedHanXuLy(savedFilters.selectedHanXuLy || null);
        setSortByHanXuLy(savedFilters.sortByHanXuLy || false);
        setSelectedHanTraLoi(savedFilters.selectedHanTraLoi || null);
        setSortByHanTraLoi(savedFilters.sortByHanTraLoi || false);
        setSortByUpdatedAt(
          typeof savedFilters.sortByUpdatedAt === "boolean"
            ? savedFilters.sortByUpdatedAt
            : true
        );
        setSortByCreatedAt(savedFilters.sortByCreatedAt || false);
        setSelectedFields(savedFilters.selectedFields || selectedFields);

        // Khôi phục list + paging
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
          sortByUpdatedAt:
            typeof savedFilters.sortByUpdatedAt === "boolean"
              ? savedFilters.sortByUpdatedAt
              : true,
          sortByCreatedAt: savedFilters.sortByCreatedAt || false,
        };

        fetchApplications(
          savedFilters.searchTerm || "",
          savedPage,
          savedState?.pageSize || pageSize,       // dùng pageSize đã lưu nếu có
          restoredFilterCondition,
          savedFilters                           // ✅ overrides
        );

      } catch (e) {
        console.error("Error parsing saved state or filters", e);
        fetchApplications("", savedPage, pageSize);
      }
    } else {
      // 👉 Trường hợp vào mới / push link: gọi API bình thường
      if (savedFiltersString) {
        try {
          const savedFilters = JSON.parse(savedFiltersString);
          const savedState = JSON.parse(savedStateString);
          setSearchTerm(savedFilters.searchTerm || "");
          setCustomerName(savedFilters.customerName || "");
          setPartnerName(savedFilters.partnerName || "");
          setBrandName(savedFilters.brandName || "");
          setSelectedProductAndService(savedFilters.selectedProductAndService || []);
          setSelectedTrangThaiDon(savedFilters.selectedTrangThaiDon || null);
          setSelectedTrangThaiHTTL(savedFilters.selectedTrangThaiHTTL || null);
          setSelectedField(savedFilters.selectedField || null);
          setFromDate(savedFilters.fromDate || "");
          setToDate(savedFilters.toDate || "");
          setSelectedHanXuLy(savedFilters.selectedHanXuLy || null);
          setSortByHanXuLy(savedFilters.sortByHanXuLy || false);
          setSelectedHanTraLoi(savedFilters.selectedHanTraLoi || null);
          setSortByHanTraLoi(savedFilters.sortByHanTraLoi || false);
          setSortByUpdatedAt(
            typeof savedFilters.sortByUpdatedAt === "boolean"
              ? savedFilters.sortByUpdatedAt
              : true
          );
          setSortByCreatedAt(savedFilters.sortByCreatedAt || false);
          setSelectedFields(savedFilters.selectedFields || selectedFields);

          const restoredFilterCondition = {
            selectedField: savedFilters.selectedField?.value || "",
            fromDate: savedFilters.fromDate || "",
            toDate: savedFilters.toDate || "",
            hanXuLyFilter: savedFilters.selectedHanXuLy?.value || "",
            hanTraLoiFilter: savedFilters.selectedHanTraLoi?.value || "",
            sortByHanXuLy: savedFilters.sortByHanXuLy || false,
            sortByHanTraLoi: savedFilters.sortByHanTraLoi || false,
            sortByUpdatedAt:
              typeof savedFilters.sortByUpdatedAt === "boolean"
                ? savedFilters.sortByUpdatedAt
                : true,
            sortByCreatedAt: savedFilters.sortByCreatedAt || false,
          };

          fetchApplications(
            savedFilters.searchTerm || "",
            savedPage,
            savedState?.pageSize || pageSize,       // dùng pageSize đã lưu nếu có
            restoredFilterCondition,
            savedFilters                           // ✅ overrides
          );

        } catch (e) {
          console.error("Error parsing saved filters", e);
          fetchApplications("", savedPage, pageSize);
        }
      } else {
        fetchApplications("", savedPage, pageSize);
      }
    }

    if (!localStorage.getItem("applicationListPage")) {
      localStorage.setItem("applicationListPage", "1");
    }

    fetchItems();
    fetchStaffs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationType]);

  // ✅ Lưu filter vào localStorage mỗi khi đổi
  useEffect(() => {
    const filtersToSave = {
      searchTerm,
      customerName,
      partnerName,
      brandName,
      selectedProductAndService,
      selectedTrangThaiDon,
      selectedTrangThaiVV,     // ✅ thêm
      selectedTrangThaiHTTL,
      selectedNhanSu,          // ✅ thêm
      selectedLoaiDon,         // ✅ thêm
      selectedField,
      fromDate,
      toDate,
      selectedHanXuLy,
      sortByHanXuLy,
      selectedHanTraLoi,
      sortByHanTraLoi,
      sortByUpdatedAt,
      sortByCreatedAt,
      selectedFields,
    };


    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filtersToSave));
  }, [
    searchTerm,
    customerName,
    partnerName,
    brandName,
    selectedProductAndService,
    selectedTrangThaiDon,
    selectedTrangThaiHTTL,
    selectedField,
    fromDate,
    toDate,
    selectedHanXuLy,
    sortByHanXuLy,
    selectedHanTraLoi,
    sortByHanTraLoi,
    sortByUpdatedAt,
    sortByCreatedAt,
    selectedFields,
  ]);

  // ✅ Lưu list + paging để quay lại không cần gọi API nữa
  useEffect(() => {
    const stateToSave = {
      totalItems,
      pageIndex,
      pageSize,
    };
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [totalItems, pageIndex, pageSize]);

  const columns = allFieldOptions
    .filter((field) => selectedFields.includes(field.key))
    .map((field) => ({ label: field.label, labelEn: field.labelEn, key: field.key }));

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
    await callAPI({
      method: "post",
      endpoint: "/application/delete",
      data: { maDonDangKy: applicationToDelete },
    });
    setShowDeleteModal(false);
    setApplicationToDelete(null);
    fetchApplications(searchTerm, pageIndex, pageSize);
  };

  const handleClearFilters = () => {
    setSelectedProductAndService([]);
    setSelectedTrangThaiDon(null);
    setSelectedField(null);
    setFromDate("");
    setToDate("");
    setSelectedHanXuLy(null);
    setSortByHanXuLy(false);
    setSelectedHanTraLoi(null);
    setSortByHanTraLoi(false);
    setSortByUpdatedAt(true);
    setSortByCreatedAt(false);
    setCustomerName("");
    setPartnerName("");
    setBrandName("");
    setSearchTerm("");
    setSelectedNhanSu(null);
    setSelectedTrangThaiHTTL(null);
  };

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          📌 Danh sách đơn đăng ký nhãn hiệu Việt Nam
        </h2>

        {/* Search + buttons */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchApplications(searchTerm, 1, pageSize);
              }
            }}
            placeholder="🔍 Nhập số đơn hoặc mã hồ sơ"
            className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
          />
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => fetchApplications(searchTerm, 1, pageSize)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Tìm kiếm
            </button>
            <button
              onClick={() => navigate("/applicationadd")}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Thêm mới
            </button>
            <button
              onClick={() => exportToExcel(applications, allFieldOptions, "DanhSachDonDK")}
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
              <input
                type="text"
                value={customerName || ""}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên khách hàng"
                className="border w-full focus:outline-none focus:ring-2 search-input rounded-lg p-2 text-sm"
              />
            </div>
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Đối tác
              </label>
              <input
                type="text"
                value={partnerName || ""}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Nhập tên đối tác"
                className="border w-full focus:outline-none focus:ring-2 search-input rounded-lg p-2 text-sm"
              />
            </div>
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Nhãn hiệu
              </label>
              <input
                type="text"
                value={brandName || ""}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Nhập tên nhãn hiệu"
                className="border w-full focus:outline-none focus:ring-2 search-input rounded-lg p-2 text-sm"
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

            {/* Trạng thái đơn */}
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Tình trạng thái đơn
              </label>
              <Select
                options={trangThaiDonOptions}
                value={trangThaiDonOptions.find((opt) => opt.value === selectedTrangThaiDon)}
                onChange={(selectedOption) =>
                  setSelectedTrangThaiDon(selectedOption ? selectedOption.value : null)
                }
                placeholder="Chọn tình thái đơn"
                className="text-left"
                isClearable
              />
            </div>
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Trạng thái vụ việc
              </label>
              <Select
                options={statusOptions}
                value={statusOptions.find((opt) => opt.value === selectedTrangThaiVV)}
                onChange={(selectedOption) =>
                  setSelectedTrangThaiVV(selectedOption ? selectedOption.value : null)
                }
                placeholder="Chọn trạng thái"
                className="text-left"
                isClearabl
              />
            </div>
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Trạng thái Tài liệu
              </label>
              <Select
                options={trangThaiHTTLOptions}
                value={trangThaiHTTLOptions.find((opt) => opt.value === selectedTrangThaiHTTL)}
                onChange={(selectedOption) =>
                  setSelectedTrangThaiHTTL(selectedOption ? selectedOption.value : null)
                }
                placeholder="Chọn trạng thái"
                className="text-left"
                isClearable
              />
            </div>
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Loại đơn
              </label>
              <Select
                options={loaiDonOptions}
                value={loaiDonOptions.find((opt) => opt.value === selectedLoaiDon)}
                onChange={(selectedOption) =>
                  setSelectedLoaiDon(selectedOption ? selectedOption.value : null)
                }
                placeholder="Chọn trạng loại đơn"
                className="text-left"
                isClearable
              />
            </div>
            <div>
              <label className="block text-gray-700 text-left">Người xử lý</label>
              <Select
                options={formatOptions(staffs, "maNhanSu", "hoTen")}
                value={formatOptions(staffs, "maNhanSu", "hoTen").find(opt => opt.value === selectedNhanSu) || null}
                onChange={(selectedOption) =>
                  setSelectedNhanSu(selectedOption?.value || null)
                }
                placeholder="Chọn người xử lý chính"
                className="w-full mt-1 rounded-lg text-left"
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

            {/* Sắp xếp thời gian */}
            <div className="w-full md:w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Sắp xếp theo thời gian
              </label>

              <div className="mt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sortByUpdatedAt}
                  onChange={(e) => {
                    setSortByUpdatedAt(e.target.checked);
                    if (e.target.checked) {
                      setSortByCreatedAt(false);
                    }
                  }}
                />
                <span className="text-sm">Ngày cập nhật gần nhất</span>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sortByCreatedAt}
                  onChange={(e) => {
                    setSortByCreatedAt(e.target.checked);
                    if (e.target.checked) {
                      setSortByUpdatedAt(false);
                    }
                  }}
                />
                <span className="text-sm">Ngày tạo gần nhất</span>
              </div>
            </div>

            {/* Dòng 2: Lọc theo thời gian */}
            <div className="w-full">
              <div className="flex flex-wrap items-end gap-4">
                {/* Chọn trường ngày */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 text-left">
                    Trường ngày
                  </label>
                  <Select
                    options={fieldOptions}
                    value={selectedField}
                    onChange={(option) => setSelectedField(option)}
                    placeholder="Chọn trường ngày"
                    className="text-left"
                    isClearable
                  />
                </div>

                {/* Từ ngày */}
                <div className="w-full md:w-1/3 lg:w-1/5">
                  <label className="mb-1 block text-sm font-medium text-gray-700 text-left">
                    Từ ngày
                  </label>
                  <DatePicker
                    value={fromDate ? dayjs(fromDate) : null}
                    onChange={(date) =>
                      setFromDate(
                        dayjs.isDayjs(date) && date.isValid()
                          ? date.format("YYYY-MM-DD")
                          : ""
                      )
                    }
                    format="DD/MM/YYYY"
                    placeholder="Từ ngày"
                    className="w-full"
                  />
                </div>

                {/* Đến ngày */}
                <div className="w-full md:w-1/3 lg:w-1/5">
                  <label className="mb-1 block text-sm font-medium text-gray-700 text-left">
                    Đến ngày
                  </label>
                  <DatePicker
                    value={toDate ? dayjs(toDate) : null}
                    onChange={(date) =>
                      setToDate(
                        dayjs.isDayjs(date) && date.isValid()
                          ? date.format("YYYY-MM-DD")
                          : ""
                      )
                    }
                    format="DD/MM/YYYY"
                    placeholder="Đến ngày"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tổng số kết quả */}
      <div className="mb-2 text-left text-gray-600 text-xl">
        {t("Tìm thấy")} <b className="text-blue-600">{totalItems}</b> {t("kết quả")}
      </div>

      {/* Bảng */}
      <div className="overflow-x-auto mt-4 overflow-hidden rounded-lg border shadow">
        <Spin spinning={loading} tip="Loading..." size="large">
          <table className="w-full border-collapse bg-white text-sm ">
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
                    key={app.maDonDangKy || index}
                    className="group hover:bg-gray-100 text-center border-b relative"
                  >
                    <td className="p-2 text-table ">
                      {(pageIndex - 1) * pageSize + index + 1}
                    </td>
                    {columns.map((col, colIndex) => {
                      const commonClass = `p-2 text-table ${colIndex < columns.length - 1 ? "" : ""
                        }`;
                      let content = app[col.key];

                      const isDateField = [
                        "ngayNopDon",
                        "ngayHoanThanhHoSoTaiLieu",
                        "ngayKQThamDinhHinhThuc",
                        "ngayCongBoDon",
                        "ngayKQThamDinhND",
                        "ngayTraLoiKQThamDinhND",
                        "ngayThongBaoCapBang",
                        "ngayNopPhiCapBang",
                        "ngayNhanBang",
                        "ngayCapBang",
                        "ngayHetHanBang",
                        "ngayGuiBangChoKhachHang",
                        "hanNopPhiCapBang",
                      ];

                      if (isDateField.includes(col.key)) {
                        return (
                          <td key={col.key} className={commonClass}>
                            {content
                              ? new Date(content).toLocaleDateString("vi-VN")
                              : ""}
                          </td>
                        );
                      }

                      if (col.key === "soDon") {
                        const maDon = app.maDonDangKy;
                        const hasDon = !!maDon;
                        const hasSoDon = !!content;

                        return (
                          <td
                            key={col.key}
                            className={`p-2 text-table ${hasDon
                              ? "text-blue-500 cursor-pointer hover:underline"
                              : "text-gray-500"
                              }`}
                            onClick={(e) => {
                              if (hasDon) {
                                e.stopPropagation();
                                navigate(`/applicationdetail/${maDon}`);
                              }
                            }}
                          >
                            {hasDon
                              ? hasSoDon
                                ? content
                                : "Chưa có số đơn"
                              : "Không có đơn đăng ký"}
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
                          return (
                            <td key={col.key} className="p-2 font-semibold"></td>
                          );
                        }
                        let text = "";
                        let textColor = "";

                        if (app.hanXuLy) {
                          const today = new Date();
                          const hanXuLyDate = new Date(app.hanXuLy);

                          if (!isNaN(hanXuLyDate.getTime())) {
                            const diffTime =
                              hanXuLyDate.setHours(0, 0, 0, 0) -
                              today.setHours(0, 0, 0, 0);
                            const diffDays = Math.ceil(
                              diffTime / (1000 * 60 * 60 * 24)
                            );

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
                          <td
                            key={col.key}
                            className={`p-2 font-semibold ${textColor} ${colIndex < columns.length - 1 ? "" : ""
                              }`}
                          >
                            {text}
                          </td>
                        );
                      }

                      if (col.key === "hanTraLoi") {
                        if (app.trangThaiVuViec === "5") {
                          return (
                            <td key={col.key} className="p-2 font-semibold"></td>
                          );
                        }
                        let text = "";
                        let textColor = "";

                        if (app.hanTraLoi) {
                          const today = new Date();
                          const hanTraLoiDate = new Date(app.hanTraLoi);

                          if (!isNaN(hanTraLoiDate.getTime())) {
                            const diffTime =
                              hanTraLoiDate.setHours(0, 0, 0, 0) -
                              today.setHours(0, 0, 0, 0);
                            const diffDays = Math.ceil(
                              diffTime / (1000 * 60 * 60 * 24)
                            );

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
                          <td
                            key={col.key}
                            className={`p-2 font-semibold ${textColor} ${colIndex < columns.length - 1 ? "" : ""
                              }`}
                          >
                            {text}
                          </td>
                        );
                      }

                      if (col.key === "trangThaiHoanThienHoSoTaiLieu") {
                        return (
                          <td
                            className={`p-2 min-w-[120px] ${colIndex < columns.length - 1 ? "" : ""
                              }`}
                            key={col.key}
                          >
                            <div className="flex flex-col text-table">
                              <span>{app.trangThaiHoanThienHoSoTaiLieu}</span>

                              {app.ngayHoanThanhHoSoTaiLieu_DuKien &&
                                app.trangThaiHoanThienHoSoTaiLieu !==
                                "Hoàn thành" &&
                                (() => {
                                  const today = new Date();
                                  const dueDate = new Date(
                                    app.ngayHoanThanhHoSoTaiLieu_DuKien
                                  );
                                  const diffTime = dueDate - today;
                                  const diffDays = Math.ceil(
                                    diffTime / (1000 * 60 * 60 * 24)
                                  );
                                  const textColor =
                                    diffDays < 0
                                      ? "text-red-500"
                                      : "text-orange-500";

                                  return (
                                    <div>
                                      <span
                                        className={`text-xs ${textColor}`}
                                      >
                                        {diffDays > 0
                                          ? `Còn ${diffDays} ngày`
                                          : diffDays === 0
                                            ? "Hạn là hôm nay"
                                            : `Quá hạn ${Math.abs(
                                              diffDays
                                            )} ngày`}
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
                            {typeof content === "string" &&
                              content.startsWith("data:image/") ? (
                              <img
                                src={content}
                                alt="Ảnh"
                                className="mx-auto max-h-20 rounded shadow-sm object-contain"
                              />
                            ) : (
                              <span className="text-gray-500 italic">
                                Không có ảnh
                              </span>
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
                      {(role === "admin" || role === "staff") &&
                        app.donGoc !== 1 && (
                          <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                            <button
                              className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                              onClick={() =>
                                navigate(`/applicationedit/${app.maDonDangKy}`)
                              }
                            >
                              📝
                            </button>
                            <button
                              className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                              onClick={() => {
                                setApplicationToDelete(app.maDonDangKy);
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
                  <td
                    colSpan={columns.length + 1}
                    className="p-4 text-center text-gray-500"
                  >
                    Không có đơn đăng ký nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Spin>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col items-center space-y-2">
        {totalItems > 0 && (
          <div className="text-sm text-gray-500 text-center ">
            <span className="font-medium text-gray-800">
              {(pageIndex - 1) * pageSize + 1} -{" "}
              {Math.min(pageIndex * pageSize, totalItems)}
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

      {/* Modal chọn cột */}
      <FieldSelector
        visible={showFieldModal}
        allFieldOptions={allFieldOptions}
        selectedFields={selectedFields}
        setSelectedFields={setSelectedFields}
        onClose={() => setShowFieldModal(false)}
        onConfirm={() => setShowFieldModal(false)}
      />

      {/* Modal xóa */}
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
        <p>Bạn có chắc chắn muốn xóa đơn đăng ký này không?</p>
      </Modal>
    </div>
  );
}

export default ApplicationList;
