import { useNavigate, useNavigationType } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import Select from "react-select";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Modal, Pagination } from "antd";

const FILTER_STORAGE_KEY_GCN_CAM = "gcnNhCamListFilters";
const STATE_STORAGE_KEY_GCN_CAM = "gcnNhCamListState";
const PAGE_STORAGE_KEY_GCN_CAM = "gcnNhCamListPage";

function GCN_NH_CAMList() {
    const { t } = useTranslation();
    const role = useSelector((state) => state.auth.role);
    const navigate = useNavigate();
    const navigationType = useNavigationType(); // 'PUSH' | 'POP' | 'REPLACE'

    const [gcn_nhs, setGCN_NHS] = useState([]);
    const [countries, setCountries] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");

    const [customerName, setCustomerName] = useState("");
    const [partnerName, setPartnerName] = useState("");
    const [brandName, setBrandName] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [partnerToDelete, setPartnerToDelete] = useState(null);

    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchGCNs = async (
        searchValue,
        countryCode,
        page = 1,
        size = 10,
        overrideFilters
    ) => {
        try {
            localStorage.setItem(PAGE_STORAGE_KEY_GCN_CAM, page.toString());

            const cn =
                overrideFilters && overrideFilters.customerName !== undefined
                    ? overrideFilters.customerName
                    : customerName;
            const pn =
                overrideFilters && overrideFilters.partnerName !== undefined
                    ? overrideFilters.partnerName
                    : partnerName;
            const bn =
                overrideFilters && overrideFilters.brandName !== undefined
                    ? overrideFilters.brandName
                    : brandName;

            const response = await callAPI({
                method: "post",
                endpoint: "/gcn_nh_kh/list",
                data: {
                    soBang: searchValue,
                    customerName: cn,
                    partnerName: pn,
                    brandName: bn,
                    // nếu backend có field lọc country thì thêm ở đây, ví dụ: countryCode
                    pageSize: size,
                    pageIndex: page,
                },
            });

            setGCN_NHS(response.data || []);
            setTotalItems(response.pagination?.totalItems || 0);
            setPageIndex(response.pagination?.pageIndex || 1);
            setPageSize(response.pagination?.pageSize || 10);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu GCN:", error);
        }
    };

    const fetchCountries = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/country/list",
                data: {},
            });
            setCountries(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu quốc gia:", error);
        }
    };

    // Khởi tạo: phân biệt vào mới / back
    useEffect(() => {
        const savedPage = parseInt(
            localStorage.getItem(PAGE_STORAGE_KEY_GCN_CAM) || "1",
            10
        );
        const savedFiltersString = localStorage.getItem(
            FILTER_STORAGE_KEY_GCN_CAM
        );
        const savedStateString = localStorage.getItem(STATE_STORAGE_KEY_GCN_CAM);

        fetchCountries();

        if (navigationType === "POP" && savedStateString) {
            // 👉 Trường hợp Back: khôi phục state từ cache, không gọi API
            try {
                const savedFilters = savedFiltersString
                    ? JSON.parse(savedFiltersString)
                    : {};
                const savedState = JSON.parse(savedStateString);

                setSearchTerm(savedFilters.searchTerm || "");
                setSelectedCountry(savedFilters.selectedCountry || "");
                setCustomerName(savedFilters.customerName || "");
                setPartnerName(savedFilters.partnerName || "");
                setBrandName(savedFilters.brandName || "");

                setGCN_NHS(savedState.gcn_nhs || []);
                setTotalItems(savedState.totalItems || 0);
                setPageIndex(savedState.pageIndex || savedPage || 1);
                setPageSize(savedState.pageSize || 10);
            } catch (e) {
                console.error("Error parsing saved state/filters (GCN_CAM)", e);
                fetchGCNs("", "", savedPage, pageSize);
            }
        } else {
            // 👉 Trường hợp vào mới / PUSH: khôi phục filter (nếu có) và gọi API
            if (savedFiltersString) {
                try {
                    const savedFilters = JSON.parse(savedFiltersString);

                    setSearchTerm(savedFilters.searchTerm || "");
                    setSelectedCountry(savedFilters.selectedCountry || "");
                    setCustomerName(savedFilters.customerName || "");
                    setPartnerName(savedFilters.partnerName || "");
                    setBrandName(savedFilters.brandName || "");

                    fetchGCNs(
                        savedFilters.searchTerm || "",
                        savedFilters.selectedCountry || "",
                        savedPage,
                        pageSize,
                        {
                            customerName: savedFilters.customerName || "",
                            partnerName: savedFilters.partnerName || "",
                            brandName: savedFilters.brandName || "",
                        }
                    );
                } catch (e) {
                    console.error("Error parsing saved filters (GCN_CAM)", e);
                    fetchGCNs("", "", savedPage, pageSize);
                }
            } else {
                fetchGCNs("", "", savedPage, pageSize);
            }
        }

        if (!localStorage.getItem(PAGE_STORAGE_KEY_GCN_CAM)) {
            localStorage.setItem(PAGE_STORAGE_KEY_GCN_CAM, "1");
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigationType]);

    // Lưu filter vào localStorage
    useEffect(() => {
        const filtersToSave = {
            searchTerm,
            selectedCountry,
            customerName,
            partnerName,
            brandName,
        };
        localStorage.setItem(
            FILTER_STORAGE_KEY_GCN_CAM,
            JSON.stringify(filtersToSave)
        );
    }, [searchTerm, selectedCountry, customerName, partnerName, brandName]);

    // Lưu list + paging
    useEffect(() => {
        const stateToSave = {
            gcn_nhs,
            totalItems,
            pageIndex,
            pageSize,
        };
        localStorage.setItem(
            STATE_STORAGE_KEY_GCN_CAM,
            JSON.stringify(stateToSave)
        );
    }, [gcn_nhs, totalItems, pageIndex, pageSize]);

    // Xóa GCN
    const handleDeletePartner = async () => {
        try {
            await callAPI({
                method: "post",
                endpoint: "/partner/delete",
                data: { id: partnerToDelete },
            });
            setShowDeleteModal(false);
            setPartnerToDelete(null);
            fetchGCNs(searchTerm, selectedCountry, pageIndex, pageSize);
        } catch (error) {
            console.error("Lỗi khi xóa đối tác:", error);
        }
    };

    const formatOptions = (data, valueKey, labelKey) => {
        return data.map((item) => ({
            value: item[valueKey],
            label: item[labelKey],
        }));
    };

    return (
        <div className="p-1 bg-gray-100 min-h-screen">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    📌 Danh sách giấy chứng nhận (văn bằng) Campuchia
                </h2>

                {/* Hàng search chính */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                fetchGCNs(searchTerm, selectedCountry, 1, pageSize);
                            }
                        }}
                        placeholder="🔍 Nhập số bằng"
                        className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
                    />

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => fetchGCNs(searchTerm, selectedCountry, 1, pageSize)}
                            className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Tìm kiếm
                        </button>
                        <button
                            onClick={() => navigate("/gcn_nh_camadd")}
                            className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Thêm mới
                        </button>
                    </div>

                </div>

                {/* Hàng filter nâng cao: khách hàng / đối tác / nhãn hiệu */}
                <div className="flex flex-wrap gap-3">
                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            Khách hàng
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Nhập tên khách hàng"
                            className="border w-full focus:outline-none focus:ring-2 search-input rounded-lg p-2 text-sm"
                        />
                    </div>

                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            Đối tác
                        </label>
                        <input
                            type="text"
                            value={partnerName}
                            onChange={(e) => setPartnerName(e.target.value)}
                            placeholder="Nhập tên đối tác"
                            className="border w-full focus:outline-none focus:ring-2 search-input rounded-lg p-2 text-sm"
                        />
                    </div>

                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            Nhãn hiệu
                        </label>
                        <input
                            type="text"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="Nhập tên nhãn hiệu"
                            className="border w-full focus:outline-none focus:ring-2 search-input rounded-lg p-2 text-sm"
                        />
                    </div>

                    {/* Nếu muốn dùng lọc quốc gia thì mở block này */}
                    {/* <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Quốc gia
            </label>
            <Select
              options={formatOptions(countries, "maQuocGia", "tenQuocGia")}
              value={
                selectedCountry
                  ? formatOptions(countries, "maQuocGia", "tenQuocGia").find(
                      (opt) => opt.value === selectedCountry
                    )
                  : null
              }
              onChange={(selectedOption) =>
                setSelectedCountry(selectedOption?.value || "")
              }
              placeholder="Chọn quốc gia"
              className="text-left"
              isClearable
            />
          </div> */}
                </div>
            </div>

            {/* Tổng số kết quả */}
            <div className="mb-2 text-left text-gray-600 text-xl">
                {t("Tìm thấy")} <b className="text-blue-600">{totalItems}</b> {t("kết quả")}
            </div>

            {/* Bảng */}
            <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow ">
                    <thead>
                        <tr className=" text-[#667085] text-center font-normal">
                            <th className="p-2 text-table">STT</th>
                            <th className="p-2 text-table">Số bằng</th>
                            <th className="p-2 text-table">Số đơn</th>
                            <th className="p-2 text-table">Mã hồ sơ</th>
                            <th className="p-2 text-table">Tên chủ bằng</th>
                            <th className="p-2 text-table">Đại diện SHCN</th>
                            <th className="p-2 text-table">Tên nhãn hiệu</th>
                            <th className="p-2 text-table">Ảnh nhãn hiệu</th>
                            <th className="p-2 text-table">Nhóm SPDV</th>
                            <th className="p-2 text-table">Ngày nộp đơn</th>
                            <th className="p-2 text-table">Ngày cấp bằng</th>
                            <th className="p-2 text-table">Ghi chú</th>
                            <th className="p-2 text-table">Ngày yêu cầu Affidavit</th>
                            <th className="p-2 text-table">Ngày yêu cầu gia hạn</th>
                            <th className="p-2 text-table">Ngày hết hạn bằng</th>
                            <th className="p-2 text-center text-table"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {gcn_nhs.map((gcn_nh, index) => (
                            <tr
                                key={gcn_nh.id || index}
                                className="group hover:bg-gray-100 text-center border-b relative"
                            >
                                <td className="p-2 text-table">{index + 1}</td>
                                <td
                                    className="p-2 text-table text-blue-500 cursor-pointer hover:underline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/gcn_nh_camdetail/${gcn_nh.id}`);
                                    }}
                                >
                                    {gcn_nh.soBang}
                                </td>
                                <td className="p-2 text-table">{gcn_nh.soDon}</td>
                                <td className="p-2 text-table">{gcn_nh.maHoSo}</td>
                                <td className="p-2 text-table">{gcn_nh.tenKhachHang}</td>
                                <td className="p-2 text-table">{gcn_nh.tenDoiTac}</td>
                                <td className="p-2 text-table">{gcn_nh.tenNhanHieu}</td>
                                <td className="p-2 text-table">
                                    {typeof gcn_nh.linkAnh === "string" &&
                                        gcn_nh.linkAnh.startsWith("data:image/") ? (
                                        <img
                                            src={gcn_nh.linkAnh}
                                            alt="Ảnh nhãn hiệu"
                                            className="mx-auto max-h-20 rounded shadow-sm object-contain"
                                        />
                                    ) : (
                                        <span className="text-gray-500 italic">Không có ảnh</span>
                                    )}
                                </td>
                                <td className="p-2 text-table">{gcn_nh.dsNhomSPDV}</td>
                                <td className="p-2 text-table">
                                    {gcn_nh.ngayNopDon
                                        ? new Date(gcn_nh.ngayNopDon).toLocaleDateString("vi-VN")
                                        : ""}
                                </td>
                                <td className="p-2 text-table">
                                    {gcn_nh.ngayCapBang
                                        ? new Date(gcn_nh.ngayCapBang).toLocaleDateString("vi-VN")
                                        : ""}
                                </td>
                                <td className="p-2 text-table">{gcn_nh.ghiChu}</td>

                                {/* Hạn Affidavit */}
                                <td className="p-2 text-table">
                                    {gcn_nh.hanNopTuyenThe ? (
                                        <>
                                            {new Date(gcn_nh.hanNopTuyenThe).toLocaleDateString(
                                                "vi-VN"
                                            )}
                                            <div
                                                className={`text-xs font-semibold ${(() => {
                                                    const diff = Math.ceil(
                                                        (new Date(gcn_nh.hanNopTuyenThe) - new Date()) /
                                                        (1000 * 60 * 60 * 24)
                                                    );
                                                    return diff < 0 ? "text-red-600" : "text-sky-600";
                                                })()
                                                    }`}
                                            >
                                                {(() => {
                                                    const diff = Math.ceil(
                                                        (new Date(gcn_nh.hanNopTuyenThe) - new Date()) /
                                                        (1000 * 60 * 60 * 24)
                                                    );
                                                    return diff < 0
                                                        ? `Quá ${Math.abs(diff)} ngày`
                                                        : `Còn ${diff} ngày `;
                                                })()}
                                            </div>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </td>

                                {/* Hạn gia hạn */}
                                <td className="p-2 text-table">
                                    {gcn_nh.hanGiaHan ? (
                                        <>
                                            {new Date(gcn_nh.hanGiaHan).toLocaleDateString("vi-VN")}
                                            <div
                                                className={`text-xs font-semibold ${(() => {
                                                    const diff = Math.ceil(
                                                        (new Date(gcn_nh.hanGiaHan) - new Date()) /
                                                        (1000 * 60 * 60 * 24)
                                                    );
                                                    return diff < 0 ? "text-red-600" : "text-sky-600";
                                                })()
                                                    }`}
                                            >
                                                {(() => {
                                                    const diff = Math.ceil(
                                                        (new Date(gcn_nh.hanGiaHan) - new Date()) /
                                                        (1000 * 60 * 60 * 24)
                                                    );
                                                    return diff < 0
                                                        ? `Quá ${Math.abs(diff)} ngày`
                                                        : `Còn ${diff} ngày`;
                                                })()}
                                            </div>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </td>

                                {/* Ngày hết hạn bằng */}
                                <td className="p-2 text-table">
                                    {gcn_nh.ngayHetHanBang ? (
                                        <>
                                            {new Date(gcn_nh.ngayHetHanBang).toLocaleDateString(
                                                "vi-VN"
                                            )}
                                            <div
                                                className={`text-xs font-semibold ${(() => {
                                                    const diff = Math.ceil(
                                                        (new Date(gcn_nh.ngayHetHanBang) - new Date()) /
                                                        (1000 * 60 * 60 * 24)
                                                    );
                                                    return diff < 0 ? "text-red-600" : "text-sky-600";
                                                })()
                                                    }`}
                                            >
                                                {(() => {
                                                    const diff = Math.ceil(
                                                        (new Date(gcn_nh.ngayHetHanBang) - new Date()) /
                                                        (1000 * 60 * 60 * 24)
                                                    );
                                                    return diff < 0
                                                        ? `Quá ${Math.abs(diff)} ngày`
                                                        : `Còn ${diff} ngày`;
                                                })()}
                                            </div>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </td>

                                <td className="p-2 relative">
                                    {(role === "admin" || role === "staff") && (
                                        <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                                            <button
                                                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                                                onClick={() =>
                                                    navigate(`/gcn_nh_camedit/${gcn_nh.id}`)
                                                }
                                            >
                                                📝
                                            </button>
                                            <button
                                                className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                                                onClick={() => {
                                                    setPartnerToDelete(gcn_nh.id);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                        fetchGCNs(searchTerm, selectedCountry, page, size);
                    }}
                    showSizeChanger
                    pageSizeOptions={["5", "10", "20", "50"]}
                    locale={{ items_per_page: t("bản ghi") }}
                />
            </div>

            {/* Modal xóa */}
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
                <p>Bạn có chắc chắn muốn xóa đối tác này không?</p>
            </Modal>
        </div>
    );
}

export default GCN_NH_CAMList;
