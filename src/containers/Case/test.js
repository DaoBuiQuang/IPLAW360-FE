import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import Select from "react-select";
import { showSuccess, showError } from "../../components/commom/Notification";
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Spin } from "antd";
function CaseEdit() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { maHoSoVuViec } = useParams();
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
    // const [ngayTao, setNgayTao] = useState("");
    // const [ngayCapNhap, setNgayCapNhap] = useState("");
    const [buocXuLyHienTai, setBuocXuLyHienTai] = useState("");
    const [nhanSuVuViec, setNhanSuVuViec] = useState([]);
    const [nguoiXuLyChinh, setNguoiXuLyChinh] = useState(null);
    const [nguoiXuLyPhu, setNguoiXuLyPhu] = useState(null);
    const [staffs, setStaffs] = useState([]);
    const [applicationtypes, setApplicationTypes] = useState([]);

    const [errors, setErrors] = useState({});
    const isFormValid =
        (maKhachHang || "").trim() !== "" &&
        (ngayTiepNhan || "").trim() !== "" &&
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
        { value: "tam_dung", label: "Tạm dừng" }
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
                alert("Không thể chọn cùng một người cho cả vai trò chính và phụ.");
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
                data: { maHoSoVuViec }
            });

            if (response) {

                setMaKhachHang(response.maKhachHang);
                setMaDoiTac(response.maDoiTac);
                setNoiDungVuViec(response.noiDungVuViec);
                setNgayTiepNhan(formatDate(response.ngayTiepNhan));
                setNgayXuLy(formatDate(response.ngayXuLy));
                setMaLoaiVuViec(response.maLoaiVuViec);
                setMaQuocGia(response.maQuocGiaVuViec);
                setTrangThaiVuViec(response.trangThaiVuViec);
                setBuocXuLyHienTai(response.buocXuLyHienTai);
                setMaLoaiDon(response.maLoaiDon);
                setMaDonDangKy(response.maDonDangKy);
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
                    maHoSoVuViec,
                    maKhachHang,
                    noiDungVuViec,
                    ngayTiepNhan,
                    ngayXuLy: ngayXuLy || null,
                    maLoaiDon,
                    maLoaiVuViec,
                    maQuocGiaVuViec: maQuocGia,
                    trangThaiVuViec,
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
            navigate(`/applicationadd/${maHoSoVuViec}`);
        }
        else {
            navigate(`/applicationedit/${maDonDangKy}`);
        }
    };
    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center">
            {console.log("người xử lí: ", nguoiXuLyChinh)}
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Sửa hồ sơ vụ việc</h2>
                <Spin spinning={loading} tip="Loading..." size="large">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        <div className="flex-1">
                            <label className="block text-gray-700 text-left">Mã hồ sơ vụ việc <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                disabled
                                value={maHoSoVuViec}
                                className="w-full p-2 mt-1 border rounded-lg text-input h-10 bg-gray-200"
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
                    </div>
                </Spin>
                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Quay lại</button>
                    <button onClick={handleEditCase} disabled={!isFormValid}
                        className={`px-4 py-2 rounded-lg text-white ${isFormValid
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-300 cursor-not-allowed"
                            }`}>Sửa hồ sơ vụ việc</button>
                    {(maLoaiVuViec?.startsWith("TM") && maLoaiDon === "1") && (
                        <button onClick={handleApplicationAdd} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            {maDonDangKy ? "Xem đơn đăng ký nhãn hiệu" : "Tạo đơn đăng ký nhãn hiệu"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CaseEdit;
