import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import Select from "react-select";
import { showSuccess, showError, showWarning } from "../../components/commom/Notification";
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Spin } from "antd";

import ApplicationAdd from "../Application/ApplicationAdd";
import ApplicationAdd_KH from "../Application_KH/ApplicationAdd_KH";
import Application_GH_NH_VNAdd from "../Application_GH_NH_VN/Application_GH_NH_VNAdd";
function CaseEdit() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const [maHoSoVuViec, setMaHoSoVuViec] = useState("");
    const [maKhachHang, setMaKhachHang] = useState("");
    const [maDoiTac, setMaDoiTac] = useState("");
    const [noiDungVuViec, setNoiDungVuViec] = useState("");
    const [ngayTiepNhan, setNgayTiepNhan] = useState(null);
    const [ngayXuLy, setNgayXuLy] = useState(null);
    const [maLoaiVuViec, setMaLoaiVuViec] = useState("");
    const [maLoaiDon, setMaLoaiDon] = useState("")
    const [maQuocGia, setMaQuocGia] = useState("");
    const [trangThaiVuViec, setTrangThaiVuViec] = useState("");
    const [maDonDangKy, setMaDonDangKy] = useState(null);
    const [maDonDangKyKH, setMaDonDangKyKH] = useState(null);
    const [maDonGiaHan, setMaDonGiaHan] = useState(null);
    const [buocXuLyHienTai, setBuocXuLyHienTai] = useState("");
    const [nhanSuVuViec, setNhanSuVuViec] = useState([]);
    const [nguoiXuLyChinh, setNguoiXuLyChinh] = useState(null);
    const [nguoiXuLyPhu, setNguoiXuLyPhu] = useState(null);
    const [ngayDongHS, setNgayDongHS] = useState(null);
    const [ngayRutHS, setNgayRutHS] = useState(null);

    const [casetypes, setCasetypes] = useState([]);
    const [countries, setCountries] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [partners, setPartners] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [applicationtypes, setApplicationTypes] = useState([]);

    const [errors, setErrors] = useState({});
    const isFormValid =
        (maKhachHang || "").trim() !== "" &&
        (trangThaiVuViec || "").trim() !== "" &&
        (maLoaiVuViec || "").trim() !== "" &&
        (maHoSoVuViec || "").trim() !== "" &&
        (maLoaiDon || "").trim() !== "" &&
        (maQuocGia || "").trim() !== "" &&
        (noiDungVuViec || "").trim() !== "";
    const validateField = (field, value) => {
        let error = "";
        if (!value.trim()) {
            if (field === "maKhachHang") error = "Khách hàng không được để trống";
            if (field === "ngayTiepNhan") error = "Ngày tiếp nhận không được để trống";
            if (field === "maLoaiVuViec") error = "Loại vụ việc không được để trống";
            if (field === "maHoSoVuViec") error = "Mã hồ sơ vụ việc không được để trống";
            if (field === "maLoaiDon") error = "Loại đơn không được để trống";
            if (field === "maQuocGia") error = "Quốc gia không được để trống";
            if (field === "noiDungVuViec") error = "Nội dung vụ việc không được để trống";
        }
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: error,
        }));
    };
    const processSteps = [
        { value: "buoc_1", label: "Bước 1: Tiếp nhận" },
        { value: "buoc_2", label: "Bước 2: Xử lý" },
        { value: "buoc_3", label: "Bước 3: Hoàn tất" }
    ];
    const statusOptions = [
        { value: "dang_xu_ly", label: "Đang xử lý" },
        { value: "hoan_thanh", label: "Hoàn thành" },
        { value: "dong", label: "Đóng" },
        { value: "rut_don", label: "Rút đơn" }
    ];


    const formatOptions = (data, valueKey, labelKey) => {
        return data.map(item => ({
            value: item[valueKey],
            label: item[labelKey]
        }));
    };
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split("T")[0];
    };

    const handleSelectChange = (selectedOption, vaiTro) => {
        setNhanSuVuViec(prevState => {
            const otherRole = vaiTro === "Chính" ? "Phụ" : "Chính";
            const maNhanSu = selectedOption?.value;

            const sameMaNhanSuOtherRole = prevState.find(nhanSu =>
                nhanSu.vaiTro === otherRole && nhanSu.maNhanSu === maNhanSu
            );

            if (sameMaNhanSuOtherRole) {
                showWarning("Cảnh báo!", "Không thể chọn cùng một người cho cả vai trò chính và phụ.");
                // alert("Không thể chọn cùng một người cho cả vai trò chính và phụ.");
                return prevState;
            }

            const updatedList = prevState.filter(nhanSu => nhanSu.vaiTro !== vaiTro);
            if (selectedOption) {
                updatedList.push({ maNhanSu, vaiTro });
            }
            return updatedList;
        });
    };

    const fetchCaseDetail = async () => {
        setLoading(true);
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/case/detail",
                data: { id }
            });

            if (response) {
                setMaHoSoVuViec(response.maHoSoVuViec);
                setMaKhachHang(response.maKhachHang);
                setMaDoiTac(response.maDoiTac);
                setNoiDungVuViec(response.noiDungVuViec);
                setNgayTiepNhan(formatDate(response.ngayTiepNhan));
                setNgayXuLy(formatDate(response.ngayXuLy));
                setMaLoaiVuViec(response.maLoaiVuViec);
                setMaQuocGia(response.maQuocGiaVuViec);
                setTrangThaiVuViec(response.trangThaiVuViec);
                setNgayDongHS(formatDate(response.ngayDongHS));
                setNgayRutHS(formatDate(response.ngayRutHS));
                setBuocXuLyHienTai(response.buocXuLyHienTai);
                setMaLoaiDon(response.maLoaiDon);
                setMaDonDangKy(response.maDonDangKy);
                setMaDonDangKyKH(response.maDonDangKyKH);
                setMaDonGiaHan(response.maDonGiaHan);
                const nhanSuChinh = response.nhanSuXuLy.find(item => item.vaiTro === "Chính");
                const nhanSuPhu = response.nhanSuXuLy.find(item => item.vaiTro === "Phụ");
                setNguoiXuLyChinh(nhanSuChinh ? nhanSuChinh.maNhanSu : null);

                setNguoiXuLyPhu(nhanSuPhu ? nhanSuPhu?.maNhanSu : null);
                setNhanSuVuViec(response.nhanSuXuLy);

            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hồ sơ vụ việc:", error);
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
    const fetchApplicationTypes = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/applicationtype/all",
                data: {},
            });
            setApplicationTypes(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu loại đơn", error);
        }
    };
    useEffect(() => {
        fetchCaseDetail();
        fetchCountries();
        fetchPartners();
        fetchCustomers();
        fetchCaseTypes();
        fetchStaffs();
        fetchApplicationTypes();
    }, []);

    // Add case
    const handleEditCase = async () => {
        try {
            await callAPI({
                method: "put",
                endpoint: "/case/edit",
                data: {
                    id,
                    maHoSoVuViec,
                    maKhachHang,
                    noiDungVuViec,
                    ngayTiepNhan: ngayTiepNhan || null,
                    ngayXuLy: ngayXuLy || null,
                    maLoaiDon,
                    maLoaiVuViec,
                    maDoiTac: maDoiTac || null,
                    maQuocGiaVuViec: maQuocGia,
                    trangThaiVuViec,
                    ngayDongHS: ngayDongHS || null,
                    ngayRutHS: ngayRutHS || null,
                    buocXuLyHienTai,
                    nhanSuVuViec
                },
            });
            await showSuccess("Thành công!", "Cập nhật hồ sơ vụ việc thành công!");
            navigate(-1);
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
            console.error("Lỗi khi Cập nhật hồ sơ vụ việc!", error);
        }
    };
    const handleApplicationAdd = () => {
        if (!maDonDangKy) {
            if (maQuocGia === "KH") {
                navigate(`/applicationadd_kh/${maHoSoVuViec}/${id}`);
            } else {
                navigate(`/applicationadd/${maHoSoVuViec}/${id}`);
            }
        } else {
            if (maQuocGia === "KH") {
                navigate(`/applicationedit_kh/${maDonDangKyKH}`);
            } else {
                navigate(`/applicationedit/${maDonDangKy}`);
            }
        }
    };
    const handleApplicationAddVN = () => {
        navigate(`/application_gh_nh_vn_add/${maHoSoVuViec}/${id}`);
        if (maDonGiaHan) {
            navigate(`/application_gh_nh_vn_edit/${maDonGiaHan}`);
        }
    };

    return (
        <>
            <div className="p-1 bg-gray-100 flex flex-row items-center justify-center">
                {console.log("người xử lí: ", nguoiXuLyChinh)}
                <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Sửa hồ sơ vụ việc</h2>
                    <Spin spinning={loading} tip="Loading..." size="large">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-left">Quốc gia vụ việc <span className="text-red-500">*</span></label>
                                <Select
                                    options={formatOptions(countries, "maQuocGia", "tenQuocGia")}
                                    value={maQuocGia ? formatOptions(countries, "maQuocGia", "tenQuocGia").find(opt => opt.value === maQuocGia) : null}
                                    onChange={selectedOption => {
                                        setMaQuocGia(selectedOption?.value)
                                        const value = selectedOption?.value || "";
                                        validateField("maQuocGia", value);
                                    }}
                                    placeholder="Chọn quốc gia"
                                    className="w-full  mt-1  rounded-lg text-left"
                                    isDisabled
                                    isClearable
                                />
                                {errors.maQuocGia && (
                                    <p className="text-red-500 text-xs mt-1 text-left">{errors.maQuocGia}</p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-700 text-left">Mã hồ sơ vụ việc <span className="text-red-500">*</span></label>
                                {/* <input
                                type="text"
                                disabled
                                value={maHoSoVuViec}
                                className="w-full p-2 mt-1 border rounded-lg text-input h-10 bg-gray-200"
                            /> */}
                                <input
                                    type="text"
                                    value={maHoSoVuViec}
                                    onChange={(e) => {
                                        setMaHoSoVuViec(e.target.value);
                                        validateField("maHoSoVuViec", e.target.value);
                                    }}
                                    placeholder="Nhập mã hồ sơ vụ việc"
                                    className="w-full p-2 mt-1 border rounded-lg text-input"
                                />
                                {errors.maHoSoVuViec && (
                                    <p className="text-red-500 text-xs mt-1 text-left">{errors.maHoSoVuViec}</p>
                                )}
                            </div>

                            <div className="flex-1">
                                <label className="block text-gray-700 text-left ">Khách hàng <span className="text-red-500">*</span></label>
                                <Select
                                    options={formatOptions(customers, "maKhachHang", "tenKhachHang")}
                                    value={maKhachHang ? formatOptions(customers, "maKhachHang", "tenKhachHang").find(opt => opt.value === maKhachHang) : null}
                                    onChange={selectedOption => {
                                        setMaKhachHang(selectedOption?.value)
                                        const value = selectedOption?.value || "";
                                        validateField("maKhachHang", value);
                                    }}
                                    placeholder="Chọn khách hàng"
                                    className="w-full mt-1 rounded-lg h-10 text-left"

                                    isClearable
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-left">Tên vụ việc <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={noiDungVuViec}
                                    onChange={(e) => {
                                        setNoiDungVuViec(e.target.value)
                                        validateField("noiDungVuViec", e.target.value)
                                    }}
                                    className="w-full p-2 mt-1 border rounded-lg text-input text-left"
                                />
                                {errors.noiDungVuViec && (
                                    <p className="text-red-500 text-xs mt-1 text-left">{errors.noiDungVuViec}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-700 text-left">Đối tác</label>
                                <Select
                                    options={formatOptions(partners, "maDoiTac", "tenDoiTac")}
                                    value={maDoiTac ? formatOptions(partners, "maDoiTac", "tenDoiTac").find(opt => opt.value === maDoiTac) : null}
                                    onChange={selectedOption => setMaDoiTac(selectedOption?.value)}
                                    placeholder="Chọn đối tác"
                                    className="w-full  mt-1  rounded-lg text-left"
                                    isClearable
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-left ">Loại vụ việc <span className="text-red-500">*</span></label>
                                <Select
                                    options={formatOptions(casetypes, "maLoaiVuViec", "tenLoaiVuViec")}
                                    value={maLoaiVuViec ? formatOptions(casetypes, "maLoaiVuViec", "tenLoaiVuViec").find(opt => opt.value === maLoaiVuViec) : null}
                                    onChange={selectedOption => {
                                        setMaLoaiVuViec(selectedOption?.value)
                                        const value = selectedOption?.value || "";
                                        validateField("maLoaiVuViec", value);
                                    }}
                                    placeholder="Chọn loại vụ việc"
                                    className="w-full  mt-1  rounded-lg text-left"
                                    disabledDate={(current) => {
                                        return current && current > dayjs().endOf("day");
                                    }}
                                    isClearable
                                />
                                {errors.maLoaiVuViec && (
                                    <p className="text-red-500 text-xs mt-1 text-left">{errors.maLoaiVuViec}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-700 text-left">Ngày tiếp nhận <span className="text-red-500">*</span></label>
                                <DatePicker
                                    value={ngayTiepNhan ? dayjs(ngayTiepNhan) : null}
                                    onChange={(date) => {
                                        if (dayjs.isDayjs(date) && date.isValid()) {
                                            setNgayTiepNhan(date.format("YYYY-MM-DD"));
                                            validateField("ngayTiepNhan", date.format("YYYY-MM-DD"));
                                        } else {
                                            setNgayTiepNhan(null);
                                            validateField("ngayTiepNhan", null);
                                        }
                                    }}

                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày tiếp nhận"
                                    className=" mt-1 w-full"
                                    disabledDate={(current) => {
                                        return current && current > dayjs().endOf("day");
                                    }}
                                />
                                {errors.ngayTiepNhan && (
                                    <p className="text-red-500 text-xs mt-1 text-left">{errors.ngayTiepNhan}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-700 text-left">Loại đơn <span className="text-red-500">*</span></label>
                                <Select
                                    options={formatOptions(applicationtypes, "maLoaiDon", "tenLoaiDon")}
                                    value={maLoaiDon ? formatOptions(applicationtypes, "maLoaiDon", "tenLoaiDon").find(opt => opt.value === maLoaiDon) : null}
                                    onChange={selectedOption => {
                                        setMaLoaiDon(selectedOption?.value)
                                        const value = selectedOption?.value || "";
                                        validateField("maLoaiDon", value);
                                    }}
                                    placeholder="Chọn loại đơn"
                                    className="w-full mt-1 rounded-lg h-10 text-left"
                                    isClearable
                                />
                                {errors.maLoaiDon && (
                                    <p className="text-red-500 text-xs mt-1 text-left">{errors.maLoaiDon}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-700 text-left">Ngày xử lý</label>
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
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-left">Người xử lí chính</label>
                                <Select
                                    options={formatOptions(staffs, "maNhanSu", "hoTen")}
                                    // value={maDoiTac ? formatOptions(partners, "maDoiTac", "tenDoiTac").find(opt => opt.value === maDoiTac) : null}
                                    value={formatOptions(staffs, "maNhanSu", "hoTen").find(opt => opt.value === nguoiXuLyChinh)}
                                    onChange={(selectedOption) => {
                                        // setNguoiXuLyChinh(selectedOption);
                                        setNguoiXuLyChinh(selectedOption?.value || null); // ✅ chỉ lấy maNhanSu
                                        handleSelectChange(selectedOption, "Chính");
                                    }}
                                    placeholder="Chọn người xử lí chính"
                                    className="w-full mt-1 rounded-lg text-left"
                                    isClearable
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-left">Người xử lí phụ</label>
                                <Select
                                    options={formatOptions(staffs, "maNhanSu", "hoTen")}
                                    value={formatOptions(staffs, "maNhanSu", "hoTen").find(opt => opt.value === nguoiXuLyPhu)}
                                    onChange={(selectedOption) => {
                                        setNguoiXuLyPhu(selectedOption?.value || null);
                                        handleSelectChange(selectedOption, "Phụ");
                                    }}
                                    placeholder="Chọn người xử lí phụ"
                                    className="w-full mt-1 rounded-lg text-left"
                                    isClearable
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-left">Trạng thái vụ việc <span className="text-red-500">*</span></label>
                                <Select
                                    options={formatOptions(statusOptions, "value", "label")}
                                    value={trangThaiVuViec ? statusOptions.find(opt => opt.value === trangThaiVuViec) : null}
                                    onChange={selectedOption => setTrangThaiVuViec(selectedOption?.value)}
                                    placeholder="Chọn trạng thái"
                                    className="w-full mt-1 rounded-lg text-left"
                                    isClearable
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
                        </div>
                    </Spin>
                    <div className="flex justify-center gap-4 mt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
                        >
                            Quay lại
                        </button>

                        <button
                            onClick={handleEditCase}
                            disabled={!isFormValid}
                            className={`px-4 py-2 rounded-lg text-white ${isFormValid
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-blue-300 cursor-not-allowed"
                                }`}
                        >
                            Sửa hồ sơ vụ việc
                        </button>

                        {/* Nút cho Đăng ký nhãn hiệu */}
                        {(maLoaiVuViec?.startsWith("TM") && maLoaiDon === "1") && (
                            <button
                                onClick={handleApplicationAdd}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            >
                                {maDonDangKy ? "Xem đơn đăng ký nhãn hiệu" : "Tạo đơn đăng ký nhãn hiệu"}
                            </button>
                        )}

                        {/* Nút cho Gia hạn nhãn hiệu (VN) */}
                        {(maLoaiVuViec?.startsWith("TM") && maLoaiDon === "4" && maQuocGia === "VN") && (
                            <button
                                onClick={handleApplicationAddVN}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                            >
                                {maDonGiaHan ? "Xem đơn gia hạn" : "Thêm đơn gia hạn"}
                            </button>
                        )}
                    </div>

                </div>

            </div>
   
        </>
    );
}

export default CaseEdit;
