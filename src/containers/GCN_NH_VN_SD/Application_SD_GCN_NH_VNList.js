import { useNavigate, useNavigationType } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { Modal, Pagination, Spin } from "antd";
import SearchCreatableSelect from "../../components/commom/SearchCreatableSelect";

const FILTER_STORAGE_KEY_SD_GCN = "applicationSdGcnNhVnListFilters";
const STATE_STORAGE_KEY_SD_GCN = "applicationSdGcnNhVnListState";
const PAGE_STORAGE_KEY_SD_GCN = "applicationSdGcnNhVnListPage";

function Application_SD_GCN_NH_VNList() {
    const { t } = useTranslation();
    const role = useSelector((state) => state.auth.role);
    const navigate = useNavigate();
    const navigationType = useNavigationType();

    const [loading, setLoading] = useState(false);
    const [donGiaHans, setDonGiaHans] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [partnerName, setPartnerName] = useState("");
    const [brandName, setBrandName] = useState("");
    const [customerOptions, setCustomerOptions] = useState([]);
    const [partnerOptions, setPartnerOptions] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [partnerToDelete, setPartnerToDelete] = useState(null);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const gcnSearchOptions = React.useMemo(() => {
        const list = [];
        const seen = new Set();
        (donGiaHans || []).forEach((item) => {
            const gcn = item.gcn;
            if (gcn?.soBang && !seen.has(gcn.soBang)) {
                seen.add(gcn.soBang);
                list.push({
                    value: gcn.soBang,
                    label: `Số bằng: ${gcn.soBang}${gcn.NhanHieu?.tenNhanHieu ? ` - ${gcn.NhanHieu.tenNhanHieu}` : ""}`,
                });
            }
            if (gcn?.soDon && !seen.has(gcn.soDon)) {
                seen.add(gcn.soDon);
                list.push({
                    value: gcn.soDon,
                    label: `Số đơn: ${gcn.soDon}${gcn.NhanHieu?.tenNhanHieu ? ` - ${gcn.NhanHieu.tenNhanHieu}` : ""}`,
                });
            }
            if (gcn?.maHoSo && !seen.has(gcn.maHoSo)) {
                seen.add(gcn.maHoSo);
                list.push({
                    value: gcn.maHoSo,
                    label: `Mã HS: ${gcn.maHoSo}${gcn.NhanHieu?.tenNhanHieu ? ` - ${gcn.NhanHieu.tenNhanHieu}` : ""}`,
                });
            }
        });
        return list;
    }, [donGiaHans]);

    const fetchGCNs = async (
        searchValue,
        page = 1,
        size = 10,
        overrides = {}
    ) => {
        setLoading(true);
        try {
            localStorage.setItem(PAGE_STORAGE_KEY_SD_GCN, page.toString());
            const term = searchValue !== undefined ? searchValue : searchTerm;
            const cn = overrides.customerName !== undefined ? overrides.customerName : customerName;
            const pn = overrides.partnerName !== undefined ? overrides.partnerName : partnerName;
            const bn = overrides.brandName !== undefined ? overrides.brandName : brandName;

            const response = await callAPI({
                method: "post",
                endpoint: "/application_sd_gcn_nh_vn/list",
                data: {
                    soBang: term,
                    searchText: term,
                    customerName: cn,
                    partnerName: pn,
                    brandName: bn,
                    pageSize: size,
                    pageIndex: page,
                },
            });
            setDonGiaHans(response.data || []);
            setTotalItems(response.pagination?.totalItems || 0);
            setPageIndex(response.pagination?.pageIndex || 1);
            setPageSize(response.pagination?.pageSize || 10);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu đơn sửa đổi GCN VN:", error);
            setDonGiaHans([]);
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
        const savedPage = parseInt(localStorage.getItem(PAGE_STORAGE_KEY_SD_GCN) || "1", 10);
        const savedFiltersString = localStorage.getItem(FILTER_STORAGE_KEY_SD_GCN);
        const savedStateString = localStorage.getItem(STATE_STORAGE_KEY_SD_GCN);

        fetchFilterOptions();

        if (navigationType === "POP" && savedStateString) {
            try {
                const savedFilters = savedFiltersString ? JSON.parse(savedFiltersString) : {};
                const savedState = JSON.parse(savedStateString);

                setSearchTerm(savedFilters.searchTerm || "");
                setCustomerName(savedFilters.customerName || "");
                setPartnerName(savedFilters.partnerName || "");
                setBrandName(savedFilters.brandName || "");

                setDonGiaHans(savedState.donGiaHans || []);
                setTotalItems(savedState.totalItems || 0);
                setPageIndex(savedState.pageIndex || savedPage || 1);
                setPageSize(savedState.pageSize || 10);

                fetchGCNs(
                    savedFilters.searchTerm || "",
                    savedPage,
                    savedState?.pageSize || pageSize,
                    savedFilters
                );
            } catch (e) {
                console.error("Error parsing saved state/filters (SD_GCN_NH_VN)", e);
                fetchGCNs("", savedPage, pageSize);
            }
        } else {
            if (savedFiltersString) {
                try {
                    const savedFilters = JSON.parse(savedFiltersString);
                    setSearchTerm(savedFilters.searchTerm || "");
                    setCustomerName(savedFilters.customerName || "");
                    setPartnerName(savedFilters.partnerName || "");
                    setBrandName(savedFilters.brandName || "");

                    fetchGCNs(
                        savedFilters.searchTerm || "",
                        savedPage,
                        pageSize,
                        savedFilters
                    );
                } catch (e) {
                    console.error("Error parsing saved filters (SD_GCN_NH_VN)", e);
                    fetchGCNs("", savedPage, pageSize);
                }
            } else {
                fetchGCNs("", savedPage, pageSize);
            }
        }

        if (!localStorage.getItem(PAGE_STORAGE_KEY_SD_GCN)) {
            localStorage.setItem(PAGE_STORAGE_KEY_SD_GCN, "1");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigationType]);

    useEffect(() => {
        const filtersToSave = {
            searchTerm,
            customerName,
            partnerName,
            brandName,
        };
        localStorage.setItem(FILTER_STORAGE_KEY_SD_GCN, JSON.stringify(filtersToSave));
    }, [searchTerm, customerName, partnerName, brandName]);

    useEffect(() => {
        const stateToSave = {
            donGiaHans,
            totalItems,
            pageIndex,
            pageSize,
        };
        localStorage.setItem(STATE_STORAGE_KEY_SD_GCN, JSON.stringify(stateToSave));
    }, [donGiaHans, totalItems, pageIndex, pageSize]);

    const handleDeletePartner = async () => {
        try {
            await callAPI({
                method: "post",
                endpoint: "/partner/delete",
                data: { id: partnerToDelete },
            });
            setShowDeleteModal(false);
            setPartnerToDelete(null);
            fetchGCNs(searchTerm, pageIndex, pageSize);
        } catch (error) {
            console.error("Lỗi khi xóa đối tác:", error);
        }
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setCustomerName("");
        setPartnerName("");
        setBrandName("");
        fetchGCNs("", 1, pageSize, {
            customerName: "",
            partnerName: "",
            brandName: "",
        });
    };

    return (
        <div className="p-1 bg-gray-100 min-h-screen">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    📌 Danh sách đơn sửa đổi văn bằng Việt Nam
                </h2>

                {/* Hàng search chính */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                    <div className="w-full md:w-1/3">
                        <SearchCreatableSelect
                            value={searchTerm}
                            onChange={(val) => setSearchTerm(val)}
                            onSearch={(keyword) =>
                                fetchGCNs(keyword !== undefined ? keyword : searchTerm, 1, pageSize)
                            }
                            options={gcnSearchOptions}
                            placeholder="🔍 Nhập số bằng, số đơn hoặc mã hồ sơ"
                        />
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => fetchGCNs(searchTerm, 1, pageSize)}
                            className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Tìm kiếm
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Xóa lọc
                        </button>
                    </div>
                </div>

                {/* Bộ lọc nâng cao: Khách hàng / Đối tác / Nhãn hiệu */}
                <div className="flex flex-wrap gap-3">
                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            Khách hàng
                        </label>
                        <SearchCreatableSelect
                            value={customerName}
                            onChange={(val) => setCustomerName(val)}
                            onSearch={() => fetchGCNs(searchTerm, 1, pageSize)}
                            options={customerOptions}
                            placeholder="Nhập tên khách hàng"
                        />
                    </div>

                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            Đối tác
                        </label>
                        <SearchCreatableSelect
                            value={partnerName}
                            onChange={(val) => setPartnerName(val)}
                            onSearch={() => fetchGCNs(searchTerm, 1, pageSize)}
                            options={partnerOptions}
                            placeholder="Nhập tên đối tác"
                        />
                    </div>

                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            Nhãn hiệu
                        </label>
                        <SearchCreatableSelect
                            value={brandName}
                            onChange={(val) => setBrandName(val)}
                            onSearch={() => fetchGCNs(searchTerm, 1, pageSize)}
                            options={brandOptions}
                            placeholder="Nhập tên nhãn hiệu"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-2 text-left text-gray-600 text-xl">
                {t("Tìm thấy")} <b className="text-blue-600">{totalItems}</b> {t("kết quả")}
            </div>

            <div className="w-full overflow-x-auto">
                <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
                    <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow">
                        <thead>
                            <tr className=" text-[#667085] text-center font-normal">
                                <th className="p-2 text-table">STT</th>
                                <th className="p-2 text-table">Số bằng</th>
                                <th className="p-2 text-table">Ngày yêu cầu sửa đổi</th>
                                <th className="p-2 text-table">Ngày ghi nhận sửa đổi</th>
                                <th className="p-2 text-table">Mô tả</th>
                                <th className="p-2 text-table">Lần sửa đổi</th>
                                <th className="p-2 text-table">Số đơn</th>
                                <th className="p-2 text-table">Mã hồ sơ</th>
                                <th className="p-2 text-table">Tên chủ bằng</th>
                                <th className="p-2 text-table">Đại diện SHCN</th>
                                <th className="p-2 text-table">Tên nhãn hiệu</th>
                                <th className="p-2 text-table">Nhóm SPDV</th>
                                <th className="p-2 text-table">Ngày nộp đơn</th>
                                <th className="p-2 text-table">Ngày cấp bằng</th>
                                <th className="p-2 text-table">Ngày yêu cầu gia hạn</th>
                                <th className="p-2 text-center text-table"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {donGiaHans.length > 0 ? (
                                donGiaHans.map((donGiaHan, index) => (
                                    <tr key={donGiaHan.id || index} className="group hover:bg-gray-100 text-center border-b relative">
                                        <td className="p-2 text-table">{index + 1}</td>
                                        <td className="p-2 text-table font-medium text-blue-600">
                                            {donGiaHan.gcn?.soBang || "—"}
                                        </td>
                                        <td className="p-2 text-table">
                                            {donGiaHan.ngayYeuCau ? new Date(donGiaHan.ngayYeuCau).toLocaleDateString("vi-VN") : ""}
                                        </td>
                                        <td className="p-2 text-table">
                                            {donGiaHan.ngayGhiNhanSuaDoi ? new Date(donGiaHan.ngayGhiNhanSuaDoi).toLocaleDateString("vi-VN") : ""}
                                        </td>
                                        <td className="p-2 text-table">{donGiaHan.moTa || ""}</td>
                                        <td className="p-2 text-table">{donGiaHan.lanSuaDoi || 1}</td>
                                        <td className="p-2 text-table">{donGiaHan.gcn?.soDon || ""}</td>
                                        <td className="p-2 text-table">{donGiaHan.gcn?.maHoSo || ""}</td>
                                        <td className="p-2 text-table">{donGiaHan.gcn?.KhachHangCuoi?.tenKhachHang || ""}</td>
                                        <td className="p-2 text-table">{donGiaHan.gcn?.DoiTac?.tenDoiTac || ""}</td>
                                        <td className="p-2 text-table">{donGiaHan.gcn?.NhanHieu?.tenNhanHieu || ""}</td>
                                        <td className="p-2 text-table">{donGiaHan.gcn?.dsNhomSPDV || ""}</td>
                                        <td className="p-2 text-table">
                                            {donGiaHan.gcn?.ngayNopDon ? new Date(donGiaHan.gcn.ngayNopDon).toLocaleDateString("vi-VN") : ""}
                                        </td>
                                        <td className="p-2 text-table">
                                            {donGiaHan.gcn?.ngayCapBang ? new Date(donGiaHan.gcn.ngayCapBang).toLocaleDateString("vi-VN") : ""}
                                        </td>
                                        <td className="p-2 text-table">
                                            {donGiaHan.gcn?.hanGiaHan ? new Date(donGiaHan.gcn.hanGiaHan).toLocaleDateString("vi-VN") : ""}
                                        </td>
                                        <td className="p-2 relative">
                                            {(role === "admin" || role === "staff") && (
                                                <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                                                    <button
                                                        className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                                                        onClick={() => navigate(`/application_gh_nh_vn_edit/${donGiaHan.id}`)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        📝
                                                    </button>
                                                    <button
                                                        className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                                                        onClick={() => {
                                                            setPartnerToDelete(donGiaHan.gcn?.id || donGiaHan.id);
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={16} className="p-4 text-center text-gray-500">
                                        Không tìm thấy bản ghi nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Spin>
            </div>

            <div className="mt-4 flex flex-col items-center space-y-2">
                {totalItems > 0 && (
                    <div className="text-sm text-gray-500 text-center ">
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
                        fetchGCNs(searchTerm, page, size);
                    }}
                    showSizeChanger
                    pageSizeOptions={['5', '10', '20', '50']}
                    locale={{ items_per_page: t("bản ghi") }}
                />
            </div>

            <Modal
                title="Xác nhận xóa"
                open={showDeleteModal}
                onOk={handleDeletePartner}
                onCancel={() => setShowDeleteModal(false)}
                okText="Xác nhận xóa"
                cancelText="Hủy"
                okButtonProps={{
                    className: "bg-red-500 hover:bg-red-600 text-white",
                }}
            >
                <p>Bạn có chắc chắn muốn xóa bản ghi này không?</p>
            </Modal>
        </div>
    );
}

export default Application_SD_GCN_NH_VNList;
