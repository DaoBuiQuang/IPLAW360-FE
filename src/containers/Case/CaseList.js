import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import Select from "react-select";
import { useSelector } from 'react-redux';
import FieldSelector from "../../components/FieldSelector";
import { Modal } from "antd";
import { Spin, Pagination } from "antd";
import { useTranslation } from "react-i18next";
import { exportToExcel } from "../../components/ExportFile/ExportExcel";
import AddVuViecModal from "../../components/VuViecForm/AddVuViecModal";
import CaseDetailModal from "../../components/VuViecForm/CaseDetailModal";
import EditVuViecModal from "../../components/VuViecForm/EditVuViecModal";
function CaseList() {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const role = useSelector((state) => state.auth.role);
    const [cases, setCases] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState(null);
    const [caseMaToDelete, setCaseMaToDelete] = useState(null);
    const [applicationTypes, setApplicationTypes] = useState([]);
    const [selectedApplicationTypes, setSelectedApplicationType] = useState("");
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState("");
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [casetypes, setCasetypes] = useState([]);
    const [selectedCasetype, setSelectedCasetype] = useState("");
    const [staffs, setStaffs] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState("");
    const navigate = useNavigate();
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [selectedFields, setSelectedFields] = useState([
        "maHoSo",
        "soDon",
        "tenVuViec",
        "moTa",
        "tenKhachHang",
        "xuatBill",
        "tenNhanHieu",
        "deadline",
        "softDeadline",
        "soTien",
        "tenQuocGia",
        "trangThaiYCTT",
    ]);

    const allFieldOptions = [
        // { label: "Mã đơn DK", labelEn: "Matter code", key: "maDonDangKy" },
        { label: "Mã hồ sơ", labelEn: "Matter code", key: "maHoSo" },
        //  { label: "Client's ref", labelEn: "Deadline For Granting Payment", key: "hanNopPhiCapBang" },
        { label: "Số Đơn", labelEn: "App No", key: "soDon" },

        { label: "Tên khách hàng", labelEn: "Client Name", key: "tenKhachHang" },
        { label: "Tên vụ việc", labelEn: "Matter name", key: "tenVuViec" },
        { label: "Mô tả", labelEn: "", key: "moTa" },
        // { label: "Matter name", labelEn: "Trademark", key: "tenNhanHieu" },
        { label: "Cần thanh toán", labelEn: "Bill", key: "xuatBill" },
        { label: "Ngày Debit note", labelEn: "Next stage", key: "trangThaiDon" },
        { label: "Deadline", labelEn: "Deadline", key: "deadline" },
        { label: "Soft Deadline", labelEn: "Soft Deadline", key: "softDeadline" },
        { label: "Số tiền", labelEn: "soTien", key: "soTien" },
        { label: "Debit Note", labelEn: "Số Debit Note", key: "trangThaiHoanThienHoSoTaiLieu" },
        { label: "Tên quốc gia", labelEn: "tenQuocGia", key: "tenQuocGia" },
        // {label: "Trạng thái", labelEn:"", key: "trangThaiYCTT"}

    ];
    const formatOptions = (data, valueKey, labelKey) => {
        return data.map(item => ({
            value: item[valueKey],
            label: item[labelKey]
        }));
    };
    const fetchCases = async (searchValue, partnerId, countryId, customerId, casetypeId, staffId, page = 1, size = 10) => {
        setLoading(true);
        try {
            localStorage.setItem("caseListPage", page);
            const response = await callAPI({
                method: "post",
                endpoint: "/vuviec/list",
                data: {
                    searchText: searchValue,
                    idDoiTac: partnerId,
                    maQuocGia: countryId,
                    idKhachHang: customerId,
                    maLoaiVuViec: casetypeId,
                    maNhanSu: staffId,
                    fields: selectedFields,
                    pageIndex: page,
                    pageSize: size,
                },
            });
            setCases(response.data || []);
            setTotalItems(response.pagination?.totalItems || 0);
            setPageIndex(response.pagination?.pageIndex || 1);
            setPageSize(response.pagination?.pageSize || 10);
        } catch (error) {
            setCases([]);
            setTotalItems(0);
            setPageIndex(1);
            setPageSize(10);
            console.error("Lỗi khi lấy dữ liệu hồ sơ vụ việc:", error);
        } finally {
            setLoading(false);
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

    const fetchPartners = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/partner/all",
                data: {},
            });
            setPartners(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu quốc gia:", error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/customers/by-name",
                data: {},
            });
            setCustomers(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu khách hàng", error);
        }
    };
    const fetchCaseTypes = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/casetype/list",
                data: {},
            });
            setCasetypes(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu loại nghề nghiệp:", error);
        }
    };
    const fetchApplicationTypes = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/applicationtype/all",
                data: {}
            })
            setApplicationTypes(response)
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu loại đơn: ", error)
        }
    }
    const fetchStaffs = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/staff/basiclist",
                data: {},
            });
            setStaffs(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu nhân sự:", error);
        }
    };
    useEffect(() => {
        const savedPage = parseInt(localStorage.getItem("caseListPage") || "1", 10);
        fetchCases(
            "",
            null,
            null,
            null,
            null,
            null,
            savedPage,
            pageSize
        );
        localStorage.setItem("caseListPage", "1");
        fetchCountries();
        fetchPartners();
        fetchCustomers();
        fetchCaseTypes();
        fetchStaffs();
        fetchApplicationTypes();
    }, []);


    const handleDeleteCase = async () => {
        try {
            await callAPI({
                method: "post",
                endpoint: "/case/delete",
                data: {
                    id: caseToDelete,
                    maHoSoVuViec: caseMaToDelete
                },
            });
            setShowDeleteModal(false);
            setCaseToDelete(null);
            setCaseMaToDelete(null);
            fetchCases(searchTerm);
        } catch (error) {
            console.error("Lỗi khi xóa hồ sơ vụ việc:", error);
        }
    };
    const columns = allFieldOptions
        .filter(field => selectedFields.includes(field.key))
        .map(field => ({ label: field.label, labelEn: field.labelEn, key: field.key }));

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCaseEdit, setSelectedCaseEdit] = useState(null);

    const handleOpenModal = (caseItem) => {
        setSelectedCaseEdit(caseItem);
        setIsModalOpen(true);
    };

    return (
        <div className="p-1 bg-gray-100 ">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 uppercase">📌 Danh sách nghiệp vụ</h2>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                fetchCases(
                                    searchTerm,
                                    selectedPartner,
                                    selectedCountry,
                                    selectedCustomer,
                                    selectedCasetype,
                                    selectedStaff,
                                    1,
                                    pageSize
                                );
                            }
                        }}
                        placeholder="🔍 Nhập tên vụ việc hoặc mã hồ sơ"
                        className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchCases(searchTerm, selectedPartner, selectedCountry, selectedCustomer, selectedCasetype, selectedStaff, 1, pageSize)}
                            className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Tìm kiếm
                        </button>


                        <button
                            onClick={() => setShowFieldModal(true)}
                            className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
                        >
                            Chọn cột hiển thị
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="w-full md:w-1/6">
                        <label className="block text-sm font-medium text-gray-700 mb-1  text-left">Quốc gia</label>
                        <Select
                            options={formatOptions(countries, "maQuocGia", "tenQuocGia")}
                            value={selectedCountry ? formatOptions(countries, "maQuocGia", "tenQuocGia").find(opt => opt.value === selectedCountry) : null}
                            onChange={selectedOption => setSelectedCountry(selectedOption?.value)}
                            placeholder="Chọn quốc gia"
                            className="text-left"
                            isClearable
                        />
                    </div>
                    {/* <div className="w-full md:w-1/6">
                        <label className="block text-sm font-medium text-gray-700 mb-1  text-left">Người XL chính</label>
                        <Select
                            options={formatOptions(staffs, "maNhanSu", "hoTen")}
                            value={selectedStaff ? formatOptions(staffs, "maNhanSu", "hoTen").find(opt => opt.value === selectedStaff) : null}
                            onChange={selectedOption => setSelectedStaff(selectedOption?.value)}
                            placeholder="Chọn người XL chính"
                            className="text-left"
                            isClearable
                        />
                    </div> */}
                    {/* <div className="w-full md:w-1/6">
                        <label className="block text-sm font-medium text-gray-700 mb-1  text-left">Loại vụ việc</label>
                        <Select
                            options={formatOptions(casetypes, "maLoaiVuViec", "tenLoaiVuViec")}
                            value={selectedCasetype ? formatOptions(casetypes, "maLoaiVuViec", "tenLoaiVuViec").find(opt => opt.value === selectedCasetype) : null}
                            onChange={selectedOption => setSelectedCasetype(selectedOption?.value)}
                            placeholder="Chọn loại vụ việc"
                            className="text-left"
                            isClearable
                        />
                    </div>
                    <div className="w-full md:w-1/6">
                        <label className="block text-sm font-medium text-gray-700 mb-1  text-left">Loại đơn</label>
                        <Select
                            options={formatOptions(applicationTypes, "maLoaiDon", "tenLoaiDon")}
                            value={selectedApplicationTypes ? formatOptions(applicationTypes, "maLoaiDon", "tenLoaiDon").find(opt => opt.value === selectedApplicationTypes) : null}
                            onChange={selectedOption => setSelectedApplicationType(selectedOption?.value)}
                            placeholder="Chọn loại đơn"
                            className="text-left"
                            isClearable
                        />
                    </div> */}
                    <div className="w-full md:w-1/6">
                        <label className="block text-sm font-medium text-gray-700 mb-1  text-left">Khách hàng</label>
                        <Select
                            options={formatOptions(customers, "id", "tenKhachHang")}
                            value={selectedCustomer ? formatOptions(customers, "id", "tenKhachHang").find(opt => opt.value === selectedCustomer) : null}
                            onChange={selectedOption => setSelectedCustomer(selectedOption?.value)}
                            placeholder="Chọn khách hàng"
                            className="text-left"
                            isClearable
                        />
                    </div>


                    <div className="w-full md:w-1/6">
                        <label className="block text-sm font-medium text-gray-700 mb-1  text-left">Đối tác</label>
                        <Select
                            options={formatOptions(partners, "id", "tenDoiTac")}
                            value={selectedPartner ? formatOptions(partners, "id", "tenDoiTac").find(opt => opt.value === selectedPartner) : null}
                            onChange={selectedOption => setSelectedPartner(selectedOption?.value)}
                            placeholder="Chọn đối tác"
                            className="text-left"
                            isClearable
                        />
                    </div>
                </div>
            </div>

            <div class="overflow-x-auto mt-4 overflow-hidden rounded-lg border shadow">
                <Spin spinning={loading} tip="Loading..." size="large">
                    <table className="w-full border-collapse bg-white text-sm">
                        <thead>
                            <tr className="text-[#667085] text-center font-normal">
                                <th className="p-2 text-table">
                                    <div className="leading-tight">
                                        STT
                                        <div className="text-xs text-gray-700">No.</div> {/* đổi từ gray-400 sang gray-700 */}
                                    </div>
                                </th>
                                {columns.map((col) => (
                                    <th key={col.key} className="p-2 text-table">
                                        <div className="leading-tight">
                                            {col.label}
                                            <div className="text-xs text-gray-700">{col.labelEn}</div> {/* đổi màu tại đây */}
                                        </div>
                                    </th>
                                ))}
                                <th className="p-2 text-table"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cases.length > 0 ? (
                                cases.map((caseItem, index) => (
                                    <tr key={caseItem.id} className="group hover:bg-gray-100 text-center border-b relative">
                                        <td className="p-2 text-table ">{index + 1}</td>
                                        {columns.map((col, colIndex) => {
                                            let content = caseItem[col.key];
                                            const commonClass = `p-2 text-table ${colIndex < columns.length - 1 ? '' : ''}`;

                                            if (
                                                col.key === "ngayTiepNhan" ||
                                                col.key === "ngayTao" ||
                                                col.key === "ngayCapNhap"
                                            ) {
                                                content = content ? new Date(content).toLocaleDateString("vi-VN") : "";
                                            }

                                            if (col.key === "maHoSoVuViec") {
                                                return (
                                                    <td
                                                        key={col.key}
                                                        className={`${commonClass} text-blue-500 cursor-pointer hover:underline`}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            navigate(`/casedetail/${caseItem.id}`);
                                                        }}
                                                    >
                                                        {content}
                                                    </td>
                                                );
                                            }
                                            if (col.key === "soDon") {
                                                return (
                                                    <td
                                                        key={col.key}
                                                        className={`${commonClass} text-blue-500 cursor-pointer hover:underline`}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            navigate(`/applicationdetail/${caseItem.maDon}`);
                                                        }}
                                                    >
                                                        {content}
                                                    </td>
                                                );
                                            }
                                            if (col.key === "nguoiXuLyChinh") {
                                                return (
                                                    <td key={col.key} className={commonClass}>
                                                        {caseItem.nguoiXuLyChinh ? (
                                                            <div>{caseItem.nguoiXuLyChinh.tenNhanSu}</div>
                                                        ) : (
                                                            <span>—</span>
                                                        )}
                                                    </td>
                                                );
                                            }
                                            if (col.key === "xuatBill") {
                                                return (
                                                    <td key={col.key} className={commonClass}>
                                                        {caseItem.xuatBill ? "Việc cần thanh toán" : "Chưa cần thanh toán"}
                                                    </td>
                                                );
                                            }

                                            if (col.key === "nhanSuKhac") {
                                                return (
                                                    <td key={col.key} className={commonClass}>
                                                        {Array.isArray(caseItem.nhanSuKhac) && caseItem.nhanSuKhac.length > 0 ? (
                                                            caseItem.nhanSuKhac.map((ns, idx) => (
                                                                <div key={idx}>{ns.tenNhanSu} ({ns.vaiTro})</div>
                                                            ))
                                                        ) : (
                                                            <span>—</span>
                                                        )}
                                                    </td>
                                                );
                                            }
                                            if (col.key === "soTien") {
                                                return (
                                                    <td key={col.key} className={commonClass}>
                                                        {caseItem.soTien
                                                            ? `${caseItem.soTien.toLocaleString("vi-VN")} ${caseItem.loaiTienTe || ""}`
                                                            : "—"}
                                                    </td>
                                                );
                                            }
                                            if (col.key === "trangThaiVuViec") {
                                                const statusMap = {
                                                    dang_xu_ly: "Đang xử lý",
                                                    hoan_thanh: "Hoàn thành",
                                                    dong: "Đóng",
                                                    rut_don: "Rút đơn",
                                                };
                                                return (
                                                    <td key={col.key} className={commonClass}>
                                                        {statusMap[content] || "Không xác định"}
                                                    </td>
                                                );
                                            }

                                            return <td key={col.key} className={commonClass}>{content}</td>;
                                        })}

                                        <td className="p-2 relative">
                                            {(role === 'admin' || role === 'staff') && (
                                                <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                                                    <button
                                                        className="px-3 py-1 bg-blue-200 rounded-md hover:bg-blue-300"
                                                        onClick={() => {
                                                            setSelectedCase(caseItem);
                                                            setShowDetailModal(true);
                                                        }}
                                                    >
                                                        Xem
                                                    </button>
                                                    <button
                                                        className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                                                        onClick={() => handleOpenModal(caseItem)}
                                                    >
                                                        📝
                                                    </button>

                                                    {/* <button
                                                        className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                                                        onClick={() => {
                                                            setCaseToDelete(caseItem.id);
                                                            setCaseMaToDelete(caseItem.maHoSoVuViec);
                                                            setShowDeleteModal(true);
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                    <button
                                                        className="px-3 py-1 bg-blue-200 text-blue-600 rounded-md hover:bg-blue-300"
                                                        onClick={() => {
                                                            if (caseItem.maDonGiaHan || caseItem.soDonGiaHan) {
                                                                // Nếu có đơn gia hạn
                                                                navigate(
                                                                    `${caseItem.soDonGiaHan
                                                                        ? `/application_gh_nh_vn_edit/${caseItem.maDonGiaHan}`
                                                                        : `/application_gh_nh_vn_add/${caseItem.maHoSoVuViec}/${caseItem.id}`
                                                                    }`
                                                                );
                                                            } else {
                                                                // Nếu là đơn đăng ký thường
                                                                navigate(
                                                                    `${caseItem.maDonDangKy || caseItem.maDonDangKyKH
                                                                        ? `/applicationedit${caseItem.maQuocGia === "KH" ? "_kh" : ""
                                                                        }/${caseItem.maDonDangKy || caseItem.maDonDangKyKH}`
                                                                        : `/applicationadd${caseItem.maQuocGia === "KH" ? "_kh" : ""
                                                                        }/${caseItem.maHoSoVuViec}/${caseItem.id}`
                                                                    }`
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        📄
                                                    </button> */}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 2} className="text-center py-6 text-gray-500 italic">
                                        Không có bản ghi nào
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
                        <span className="mr-1"></span>
                        <span className="font-medium text-gray-800">
                            {(pageIndex - 1) * pageSize + 1} - {Math.min(pageIndex * pageSize, totalItems)}
                        </span>
                        <span className="mx-1"> / </span>
                        <span className="font-medium text-gray-800">{totalItems}</span>
                        <span className="ml-1"></span>
                    </div>
                )}
                <Pagination
                    current={pageIndex}
                    total={totalItems}
                    pageSize={pageSize}
                    onChange={(page, size) => {
                        setPageIndex(page);
                        setPageSize(size)
                        fetchCases(searchTerm, selectedPartner, selectedCountry, selectedCustomer, selectedCasetype, selectedStaff, page, size)
                    }}
                    showSizeChanger
                    pageSizeOptions={['5', '10', '20', '50']}
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
                title="Xác nhận xóa"
                open={showDeleteModal}
                onOk={handleDeleteCase}
                onCancel={() => setShowDeleteModal(false)}
                okText="Xác nhận xóa"
                cancelText="Hủy"
                okButtonProps={{
                    className: "bg-red-500 hover:bg-red-600 text-white",
                }}
            >
                <p>Bạn có chắc chắn muốn xóa hồ sơ vụ việc này không?</p>
            </Modal>
            <EditVuViecModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(data) => {
                    console.log("Dữ liệu lưu:", data);
                    setIsModalOpen(false);
                }}
                record={selectedCaseEdit}
            />
            <CaseDetailModal
                visible={showDetailModal}
                record={selectedCase}
                onClose={() => setShowDetailModal(false)}
            ></CaseDetailModal>
        </div>
    );
}

export default CaseList;
