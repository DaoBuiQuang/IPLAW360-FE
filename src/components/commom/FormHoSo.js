import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";
import Select from "react-select";

import { showSuccess, showError } from "../../components/commom/Notification";
import { DatePicker } from 'antd';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';

function FormHoSo({
    soDon, setSoDon,
    ngayNopDon, setNgayNopDon,
    maHoSoVuViec, setMaHoSoVuViec,
    idKhachHang, setIdKhachHang, setMaKhachHang,
    idDoiTac, setIdDoiTac, setMaDoiTac,
    clientsRef, setClientsRef,
    ngayTiepNhan, setNgayTiepNhan,
    trangThaiVuViec, setTrangThaiVuViec,
    ngayDongHS, setNgayDongHS,
    ngayRutHS, setNgayRutHS,
    loaiDon, setLoaiDon,
    daiDienSHTT,
    setDaiDienSHTT,
    nguoiXuLyChinh, setNguoiXuLyChinh,
    nguoiXuLyPhu, setNguoiXuLyPhu
}) {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [partners, setPartners] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [errors, setErrors] = useState({});
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const maHoSoRef = useRef(null);
    const listRef = useRef(null);
    useEffect(() => {
        console.log("id khách hàng", idKhachHang)
    }, [idKhachHang]);
    // ID riêng để gửi API
    // const [idKhachHang, setIdKhachHang] = useState(null);
    // const [idDoiTac, setIdDoiTac] = useState(null);

    const statusOptions = [
        { value: "1", label: "Đang giải quyết" },
        { value: "2", label: "Cấp bằng" },
        { value: "3", label: "Từ chối" },
        { value: "4", label: "Rút đơn" },
        { value: "6", label: "Ngừng theo đuổi" },
        { value: "5", label: "Đóng đơn" }
    ];
    const isFormValid =
        idKhachHang;


    const validateField = (field, value) => {
        let error = "";
        if (!value || (typeof value === "string" && !value.trim())) {
            if (field === "maKhachHang") error = "Khách hàng không được để trống";
        }
        setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
    };

    const formatOptions = (data, idKey, valueKey, labelKey) => {
        return data.map(item => ({
            id: item[idKey],
            value: valueKey ? item[valueKey] : item[idKey],
            label: labelKey ? item[labelKey] : item[idKey]
        }));
    };

    const fetchPartners = async () => {
        try {
            const response = await callAPI({ method: "post", endpoint: "/partner/all", data: {} });
            setPartners(response);
        } catch (error) { console.error(error); }
    };

    const fetchCustomers = async () => {
        try {
            const response = await callAPI({ method: "post", endpoint: "/customers/by-name", data: {} });
            setCustomers(response);
        } catch (error) { console.error(error); }
    };

    const fetchStaffs = async () => {
        try {
            const response = await callAPI({ method: "post", endpoint: "/staff/basiclist", data: {} });
            setStaffs(response);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchPartners();
        fetchCustomers();
        fetchStaffs();
        console.log("trangThaiVuViec ", trangThaiVuViec)
    }, []);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (maHoSoRef.current && !maHoSoRef.current.contains(e.target)) {
                setShowSuggestions(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Tự động cuộn phần tử đang highlight vào view khi bấm phím mũi tên
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const activeItem = listRef.current.children[highlightedIndex];
            if (activeItem) {
                activeItem.scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightedIndex]);

    // Select handlers
    const handleMaKhachHangChange = async (selectedOption) => {
        if (selectedOption) {
            setMaKhachHang({ id: selectedOption.id, ma: selectedOption.value });
            setIdKhachHang(selectedOption.id);
            validateField("maKhachHang", selectedOption.value);

            // Tự động điền Đối tác nếu KH có liên kết đối tác
            const rawCustomer = customers.find(c => c.id === selectedOption.id);
            if (rawCustomer?.idDoiTac) {
                setIdDoiTac(rawCustomer.idDoiTac);
                setMaDoiTac({ id: rawCustomer.idDoiTac, ma: rawCustomer.maDoiTac });
            } else {
                setIdDoiTac(null);
                setMaDoiTac(null);
            }

            try {
                const response = await callAPI({
                    method: "post",
                    endpoint: "/case/generate-code-case",
                    data: { maKhachHang: selectedOption.value }
                });
                setMaHoSoVuViec(response.maHoSoVuViec);
            } catch (error) { console.error(error); }
        } else {
            setMaKhachHang(null);
            setIdKhachHang(null);
            setMaHoSoVuViec("");
            setIdDoiTac(null);
            setMaDoiTac(null);
            validateField("maKhachHang", "");
        }
    };

    const handleMaDoiTacChange = (selectedOption) => {
        if (selectedOption) {
            setMaDoiTac({ id: selectedOption.id, ma: selectedOption.value });
            setIdDoiTac(selectedOption.id);
        } else {
            setMaDoiTac(null);
            setIdDoiTac(null);
        }
    };

    // Lọc danh sách KH theo prefix người dùng gõ (local filter, không cần API mới)
    const filterCustomers = (prefix) => {
        if (!prefix || prefix.length < 1) return [];
        const lower = prefix.toLowerCase();
        return formatOptions(customers, "id", "maKhachHang", "tenKhachHang")
            .filter(opt => opt.value.toLowerCase().startsWith(lower))
            .slice(0, 10);
    };

    // Handler khi user gõ vào ô Mã hồ sơ
    const handleMaHoSoInputChange = (e) => {
        const val = e.target.value;
        setMaHoSoVuViec(val);
        validateField("maHoSoVuViec", val);
        setHighlightedIndex(-1);
        if (val.length >= 1) {
            const filtered = filterCustomers(val);
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Điều hướng bằng bàn phím (mũi tên lên / xuống, Enter, Escape)
    const handleMaHoSoKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        } else if (e.key === "Enter") {
            if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                e.preventDefault();
                handleSuggestionSelect(suggestions[highlightedIndex]);
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
            setHighlightedIndex(-1);
        }
    };

    // Handler khi user chọn 1 KH từ dropdown gợi ý
    const handleSuggestionSelect = async (selectedOption) => {
        setShowSuggestions(false);
        setSuggestions([]);
        setHighlightedIndex(-1);
        // Điền thông tin KH
        setIdKhachHang(selectedOption.id);
        setMaKhachHang({ id: selectedOption.id, ma: selectedOption.value });
        // Tự động điền Đối tác nếu KH có liên kết
        const rawCustomer = customers.find(c => c.id === selectedOption.id);
        if (rawCustomer?.idDoiTac) {
            setIdDoiTac(rawCustomer.idDoiTac);
            setMaDoiTac({ id: rawCustomer.idDoiTac, ma: rawCustomer.maDoiTac });
        } else {
            setIdDoiTac(null);
            setMaDoiTac(null);
        }
        // Tự động hoàn thiện mã hồ sơ (thêm -0000x)
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/case/generate-code-case",
                data: { maKhachHang: selectedOption.value }
            });
            setMaHoSoVuViec(response.maHoSoVuViec);
            validateField("maHoSoVuViec", response.maHoSoVuViec);
        } catch (error) {
            console.error("Lỗi khi tạo mã hồ sơ:", error);
            setMaHoSoVuViec(selectedOption.value + "-");
        }
    };
    const loaiDonOptions = [
        { value: 1, label: "Đơn gốc" },
        { value: 2, label: "Đơn sửa đổi" },
        { value: 3, label: "Đơn tách" },
        { value: 4, label: "Đơn chuyển nhượng" }
    ];
    useEffect(() => {
        if (trangThaiVuViec != null && trangThaiVuViec !== undefined) {
            const getTrangThaiVuViecLabel = (value) => {
                const statusMap = {
                    '1': "Đang giải quyết",
                    '2': "Cấp bằng",
                    '3': "Từ chối",
                    '4': "Rút đơn",
                    '5': "Đóng đơn"
                };
                return statusMap[value] || "Không xác định";
            };

            const label = getTrangThaiVuViecLabel(trangThaiVuViec);
            console.log("🔹 Trạng thái vụ việc hiện tại:", label);

            // nếu muốn hiển thị popup, toast hoặc setState thì thêm ở đây
            // showInfo(`Trạng thái vụ việc: ${label}`);
        }
    }, [trangThaiVuViec]);
    const staffOptions = formatOptions(staffs, "maNhanSu", "maNhanSu", "hoTen");

    // Thêm hồ sơ
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">

                <div className="flex-1 relative" ref={maHoSoRef}>
                    <label className="block text-gray-700 text-left">Mã hồ sơ <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={maHoSoVuViec}
                        onChange={handleMaHoSoInputChange}
                        onKeyDown={handleMaHoSoKeyDown}
                        placeholder="Nhập mã KH để tìm, hoặc chọn KH bên dưới"
                        className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                        autoComplete="off"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <ul
                            ref={listRef}
                            className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto"
                        >
                            {suggestions.map((s, index) => (
                                <li
                                    key={s.id}
                                    onMouseDown={(e) => { e.preventDefault(); handleSuggestionSelect(s); }}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`px-3 py-2 cursor-pointer text-sm text-left border-b last:border-b-0 flex items-center gap-2 transition-colors ${
                                        highlightedIndex === index ? "bg-blue-100 text-blue-900 font-medium" : "hover:bg-blue-50 text-gray-700"
                                    }`}
                                >
                                    <span className="font-mono font-semibold text-blue-700 shrink-0">{s.value}</span>
                                    <span className="text-gray-500 truncate">– {s.label}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {errors.maHoSoVuViec && <p className="text-red-500 text-xs mt-1 text-left">{errors.maHoSoVuViec}</p>}
                </div>
                <div>
                    <label className="block text-gray-700 text-left">Loại đơn <span className="text-red-500">*</span></label>
                    <Select
                        options={loaiDonOptions}
                        value={loaiDon ? loaiDonOptions.find(opt => opt.value === loaiDon) : null}
                        onChange={selectedOption => setLoaiDon(selectedOption?.value)}
                        placeholder="Chọn loại đơn"
                        className="w-full mt-1 rounded-lg text-left"
                        isClearable
                        isDisabled
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-left">Client's Ref</label>
                    <input
                        type="text"
                        value={clientsRef}
                        onChange={(e) => {
                            setClientsRef(e.target.value)
                            validateField("clientsRef", e.target.value)
                        }}
                        placeholder="Nhập Client's Ref"
                        className="w-full p-2 mt-1 border rounded-lg text-input"
                    />
                    {/* {errors.noiDungVuViec && (
                        <p className="text-red-500 text-xs mt-1 text-left">{errors.noiDungVuViec}</p>
                    )} */}
                </div>
                <div>
                    <label className="block text-gray-700 text-left">Đại diện sở hữu trí tuệ</label>
                    <input
                        type="text"
                        value={daiDienSHTT}
                        onChange={(e) => {
                            setDaiDienSHTT(e.target.value)
                            validateField("clientsRef", e.target.value)
                        }}
                        placeholder="Nhập đại diện sở hữu trí tuệ"
                        className="w-full p-2 mt-1 border rounded-lg text-input"
                    />
                    {/* {errors.noiDungVuViec && (
                        <p className="text-red-500 text-xs mt-1 text-left">{errors.noiDungVuViec}</p>
                    )} */}
                </div>
                <div >
                    <label className="block text-gray-700 text-left ">Số đơn</label>
                    <input
                        type="text"
                        value={soDon}
                        placeholder="Nhập số đơn"
                        onChange={(e) => setSoDon(e.target.value)}
                        className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-gray-700 text-left">Khách hàng <span className="text-red-500">*</span></label>
                    <Select
                        options={formatOptions(customers, "id", "maKhachHang", "tenKhachHang")}
                        value={idKhachHang ? formatOptions(customers, "id", "maKhachHang", "tenKhachHang").find(opt => opt.id === idKhachHang) : null}
                        onChange={handleMaKhachHangChange}
                        placeholder="Chọn khách hàng"
                        className="w-full mt-1 rounded-lg h-10 text-left"
                        isClearable
                    />
                    {errors.idKhachHang && <p className="text-red-500 text-xs mt-1 text-left">{errors.idKhachHang}</p>}
                </div>

                <div>
                    <label className="block text-gray-700 text-left">Ngày nộp đơn</label>
                    <DatePicker
                        value={ngayNopDon ? dayjs(ngayNopDon) : null}
                        onChange={(date) => {
                            if (dayjs.isDayjs(date) && date.isValid()) {
                                setNgayNopDon(date.format("YYYY-MM-DD"));
                            } else {
                                setNgayNopDon(null);
                            }
                        }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày nộp đơn"
                        className="mt-1 w-full"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 text-left">Đối tác</label>
                    <Select
                        options={formatOptions(partners, "id", "maDoiTac", "tenDoiTac")}
                        value={idDoiTac ? formatOptions(partners, "id", "maDoiTac", "tenDoiTac").find(opt => opt.id == idDoiTac) : null}
                        onChange={handleMaDoiTacChange}
                        placeholder="Chọn đối tác"
                        className="w-full mt-1 rounded-lg text-left"
                        isClearable
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-left">Ngày tiếp nhận</label>
                    <DatePicker
                        value={ngayTiepNhan ? dayjs(ngayTiepNhan) : null}
                        onChange={(date) => {
                            if (dayjs.isDayjs(date) && date.isValid()) {
                                setNgayTiepNhan(date.format("YYYY-MM-DD"));

                            } else {
                                setNgayTiepNhan(null);
                            }
                        }}

                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày tiếp nhận"
                        className=" mt-1 w-full"
                        disabledDate={(current) => {
                            return current && current > dayjs().endOf("day");
                        }}
                    />
                </div>
                {/* <div>
                    <label className="block text-gray-700 text-left">Ngày xử lý </label>
                    <DatePicker
                        value={ngayXuLy ? dayjs(ngayXuLy) : null}
                        onChange={(date) => {
                            if (dayjs.isDayjs(date) && date.isValid()) {
                                setNgayXuLy(date.format("YYYY-MM-DD"));
                            } else {
                                setNgayXuLy(null);
                            }
                        }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày xử lý"
                        className="mt-1 w-full"
                        style={{ height: "38px" }}
                        disabledDate={(current) => {
                            return current && current > dayjs().endOf("day");
                        }}
                    />
                </div> */}
                <div>
                    <label className="block text-gray-700 text-left">Người xử lý chính</label>
                    <Select
                        options={staffOptions}
                        value={staffOptions.find(opt => opt.value === nguoiXuLyChinh) || null}
                        onChange={(selectedOption) =>
                            setNguoiXuLyChinh(selectedOption?.value || null)
                        }
                        placeholder="Chọn người xử lý chính"
                        className="w-full mt-1 rounded-lg text-left"
                        isClearable
                    />
                </div>

                <div>
                    <label className="block text-gray-700 text-left">Người xử lý phụ</label>
                    <Select
                        options={staffOptions.filter(
                            (opt) => opt.value !== nguoiXuLyChinh
                        )}
                        value={staffOptions.find(
                            (opt) => opt.value === nguoiXuLyPhu
                        ) || null}
                        onChange={(selectedOption) => setNguoiXuLyPhu(selectedOption?.value || null)}
                        placeholder="Chọn người xử lý phụ"
                        className="w-full mt-1 rounded-lg text-left"
                        isClearable
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-left">
                        Trạng thái đơn (trangThaiVuViec)
                        <span className="text-red-500">*</span>
                    </label>

                    <Select
                        options={statusOptions}
                        value={statusOptions.find(opt => opt.value === String(trangThaiVuViec))}
                        onChange={(option) => setTrangThaiVuViec(option?.value || "1")}
                        placeholder="Chọn trạng thái"
                        isClearable
                        className="w-full mt-1 rounded-lg text-left"
                        formatOptionLabel={(option) => (
                            <span style={{ color: option.value === "5" ? "red" : "inherit" }}>
                                {option.label}
                            </span>
                        )}
                        styles={{
                            singleValue: (base, { data }) => ({
                                ...base,
                                color: data.value === "5" ? "red" : base.color,
                            }),
                        }}
                    />
                </div>
                {trangThaiVuViec === "dong" && (
                    <div>
                        <label className="block text-gray-700 text-left">Ngày đóng hồ sơ</label>
                        <DatePicker
                            value={ngayDongHS ? dayjs(ngayDongHS) : null}
                            onChange={(date) => {
                                if (dayjs.isDayjs(date) && date.isValid()) {
                                    setNgayDongHS(date.format("YYYY-MM-DD"));
                                } else {
                                    setNgayDongHS(null);
                                }
                            }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày đóng hồ sơ"
                            className="mt-1 w-full"
                            style={{ height: "38px" }}
                        />
                    </div>
                )}

                {trangThaiVuViec === "rut_don" && (
                    <div>
                        <label className="block text-gray-700 text-left">Ngày rút hồ sơ</label>
                        <DatePicker
                            value={ngayRutHS ? dayjs(ngayRutHS) : null}
                            onChange={(date) => {
                                if (dayjs.isDayjs(date) && date.isValid()) {
                                    setNgayRutHS(date.format("YYYY-MM-DD"));
                                } else {
                                    setNgayRutHS(null);
                                }
                            }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày rút hồ sơ"
                            className="mt-1 w-full"
                            style={{ height: "38px" }}
                        />
                    </div>
                )}

                {/* Các trường khác giữ nguyên (ngày tiếp nhận, ngày xử lý, người xử lý, trạng thái, ...) */}
            </div>

            {/* <div className="flex justify-center gap-4 mt-4">
                <button onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Quay lại</button>
                <button onClick={handleAddCase} disabled={!isFormValid}
                    className={`px-4 py-2 rounded-lg text-white ${isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}>
                    Thêm hồ sơ vụ việc
                </button>
            </div> */}
        </div>
    );
}

export default FormHoSo;
