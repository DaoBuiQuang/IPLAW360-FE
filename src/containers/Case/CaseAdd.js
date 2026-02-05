import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";
import Select from "react-select";

import { showSuccess, showError, showWarning } from "../../components/commom/Notification";
import { DatePicker } from 'antd';

import dayjs from 'dayjs';  // Import dayjs
import 'dayjs/locale/vi';
import ApplicationAdd from "../Application/ApplicationAdd";
import ApplicationAdd_KH from "../Application_KH/ApplicationAdd_KH";
import Application_GH_NH_VNAdd from "../Application_GH_NH_VN/Application_GH_NH_VNAdd";
function CaseAdd() {
    const navigate = useNavigate();
    const [maHoSoVuViec, setMaHoSoVuViec] = useState("");
    const [maKhachHang, setMaKhachHang] = useState("");
    const [maDoiTac, setMaDoiTac] = useState("");
    const [maLoaiDon, setMaLoaiDon] = useState("1")
    const [noiDungVuViec, setNoiDungVuViec] = useState("");
    const [ngayTiepNhan, setNgayTiepNhan] = useState(null);
    const [ngayXuLy, setNgayXuLy] = useState(null);
    const [maLoaiVuViec, setMaLoaiVuViec] = useState("TM");
    const [maQuocGia, setMaQuocGia] = useState("VN");
    const [trangThaiVuViec, setTrangThaiVuViec] = useState("");
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
        (maLoaiVuViec || "").trim() !== "" &&
        (maHoSoVuViec || "").trim() !== "" &&
        (maLoaiDon || "").trim() !== "" &&
        (maQuocGia || "").trim() !== "" &&
        (noiDungVuViec || "").trim() !== "" &&
        (trangThaiVuViec || "").trim() !== "";
    const validateField = (field, value) => {
        let error = "";
        if (
            (typeof value === "string" && !value.trim()) ||
            (value === null || value === undefined)
        ) {
            if (field === "maKhachHang") error = "Khách hàng không được để trống";
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
                updatedList.push({ maNhanSu: selectedOption.value, vaiTro });
            }
            return updatedList;
        });
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
        fetchCountries();
        fetchPartners();
        fetchCustomers();
        fetchCaseTypes();
        fetchStaffs();
        fetchApplicationTypes();
    }, []);

    // Add case
    const handleAddCase = async () => {
        try {
            const res = await callAPI({
                method: "post",
                endpoint: "/case/add",
                data: {
                    maHoSoVuViec,
                    maKhachHang,
                    noiDungVuViec,
                    ngayTiepNhan,
                    maDoiTac: maDoiTac || null,
                    ngayXuLy,
                    maLoaiVuViec,
                    maQuocGiaVuViec: maQuocGia,
                    trangThaiVuViec,
                    ngayDongHS,
                    ngayRutHS,
                    maLoaiDon,
                    buocXuLyHienTai,
                    nhanSuVuViec
                },
            });
            await showSuccess("Thành công!", "Thêm hồ sơ vụ việc thành công!");
            setMaHoSoVuViec("");
            setMaKhachHang("");
            setMaDoiTac("");
            setMaLoaiDon("");
            setNoiDungVuViec("");
            setNgayTiepNhan(null);
            setNgayXuLy(null);
            setNgayRutHS(null);
            setNgayDongHS(null);
            setMaLoaiVuViec("");
            setMaQuocGia("");
            setTrangThaiVuViec("");
            setBuocXuLyHienTai("");
            setNhanSuVuViec([]);
            setNguoiXuLyChinh(null);
            setNguoiXuLyPhu(null);
            const newCaseId = res.newCase?.id;

            if (newCaseId) {
                navigate(`/caseedit/${newCaseId}`);
            }
            // navigate(-1);
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
            console.error("Lỗi khi thêm hồ sơ vụ việc!", error);
        }
    };
    const handleMaKhachHangChange = async (selectedOption) => {
        if (selectedOption) {
            const value = selectedOption.value;
            setMaKhachHang(value);
            validateField("maKhachHang", value);
            try {
                const response = await callAPI({
                    method: "post",
                    endpoint: "/case/generate-code-case",
                    data: { maKhachHang: value }
                });
                setMaHoSoVuViec(response.maHoSoVuViec);
            } catch (error) {
                console.error("Lỗi khi tạo mã hồ sơ vụ việc:", error);
            }
        } else {
            setMaKhachHang("");
            setMaHoSoVuViec("");
            validateField("maKhachHang", "");
        }
    };

    return (
        <>
            <div className="p-1 bg-gray-100 flex-col flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Thêm hồ sơ vụ việc mới</h2>
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
                                className="w-full  mt-1  rounded-lg  text-left"
                                isClearable
                            />
                            {errors.maQuocGia && (
                                <p className="text-red-500 text-xs mt-1 text-left">{errors.maQuocGia}</p>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-gray-700 text-left">Mã hồ sơ vụ việc <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={maHoSoVuViec}
                                onChange={(e) => {
                                    setMaHoSoVuViec(e.target.value)
                                    validateField("maHoSoVuViec", e.target.value)
                                }}

                                className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                            />
                            {errors.maHoSoVuViec && (
                                <p className="text-red-500 text-xs mt-1 text-left">{errors.maHoSoVuViec}</p>
                            )}
                        </div>

                        <div className="flex-1">
                            <label className="block text-gray-700 text-left ">Chọn khách hàng <span className="text-red-500">*</span></label>
                            <Select
                                options={formatOptions(customers, "maKhachHang", "tenKhachHang")}
                                value={maKhachHang ? formatOptions(customers, "maKhachHang", "tenKhachHang").find(opt => opt.value === maKhachHang) : null}
                                onChange={handleMaKhachHangChange}
                                placeholder="Chọn khách hàng"
                                className="w-full mt-1 rounded-lg h-10 text-left"
                                isClearable
                            />
                            {errors.maKhachHang && (
                                <p className="text-red-500 text-xs mt-1 text-left">{errors.maKhachHang}</p>
                            )}
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
                                placeholder="Nhập nội dung vụ việc"
                                className="w-full p-2 mt-1 border rounded-lg text-input"
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
                                className="w-full  mt-1  rounded-lg  text-left"
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
                                className="w-full  mt-1  rounded-lg  text-left"
                                isClearable
                            />
                            {errors.maLoaiVuViec && (
                                <p className="text-red-500 text-xs mt-1 text-left">{errors.maLoaiVuViec}</p>
                            )}
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
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">Người xử lí chính</label>
                            <Select
                                options={formatOptions(staffs, "maNhanSu", "hoTen").filter(
                                    (opt) => opt.value !== nguoiXuLyPhu?.value
                                )}
                                value={nguoiXuLyChinh}
                                onChange={(selectedOption) => {
                                    setNguoiXuLyChinh(selectedOption);
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
                                options={formatOptions(staffs, "maNhanSu", "hoTen").filter(
                                    (opt) => opt.value !== nguoiXuLyChinh?.value
                                )}
                                value={nguoiXuLyPhu}
                                onChange={(selectedOption) => {
                                    setNguoiXuLyPhu(selectedOption);
                                    handleSelectChange(selectedOption, "Phụ");
                                }}
                                placeholder="Chọn người xử lí phụ"
                                className="w-full mt-1 rounded-lg text-left"
                                isClearable
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">Trạng thái vụ việc <span className="text-red-500">*</span> </label>
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
                    <div className="flex justify-center gap-4 mt-4">
                        <button onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Quay lại</button>
                        <button onClick={handleAddCase} disabled={!isFormValid}
                            className={`px-4 py-2 rounded-lg text-white ${isFormValid
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-blue-300 cursor-not-allowed"
                                }`}>Thêm hồ sơ vụ việc</button>
                    </div>
                </div>

            </div>

        </>
    );
}

export default CaseAdd;
