import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import Select from "react-select";
import { showSuccess, showError } from "../../components/commom/Notification";
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Spin } from "antd";
function CaseDetail() {
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
    // const [ngayTao, setNgayTao] = useState("");
    // const [ngayCapNhap, setNgayCapNhap] = useState("");
    const [buocXuLyHienTai, setBuocXuLyHienTai] = useState("");
    const [nhanSuVuViec, setNhanSuVuViec] = useState([]);
    const [nguoiXuLyChinh, setNguoiXuLyChinh] = useState(null);
    const [nguoiXuLyPhu, setNguoiXuLyPhu] = useState(null);

    const [casetypes, setCasetypes] = useState([]);
    const [countries, setCountries] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [partners, setPartners] = useState([]);
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
            const updatedList = prevState.filter(nhanSu => nhanSu.vaiTro !== vaiTro);
            if (selectedOption) {
                updatedList.push({ maNhanSu: selectedOption.value, vaiTro });
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
                setBuocXuLyHienTai(response.buocXuLyHienTai);
                setMaLoaiDon(response.maLoaiDon);
                setMaDonDangKy(response.maDonDangKy);
                const nhanSuChinh = response.nhanSuXuLy.find(item => item.vaiTro === "Chính");
                const nhanSuPhu = response.nhanSuXuLy.find(item => item.vaiTro === "Phụ");

                // Set các giá trị của người xử lý chính và phụ
                setNguoiXuLyChinh(nhanSuChinh ? nhanSuChinh.maNhanSu : null);
                setNguoiXuLyPhu(nhanSuPhu ? nhanSuPhu.maNhanSu : null);

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


    const handleApplicationAdd = () => {
        if (!maDonDangKy) {
            navigate(`/applicationadd/${maHoSoVuViec}`);
        }
        else {
            navigate(`/applicationdetail/${maDonDangKy}`);
        }
    };
    // Lấy tên khách hàng từ mã
    const getTenKhachHang = (maKH) => {
        const kh = customers.find(c => c.maKhachHang === maKH);
        return kh?.tenKhachHang || "Không xác định";
    };

    // Lấy tên loại vụ việc từ mã
    const getTenLoaiVuViec = (maLoai) => {
        const item = casetypes.find(c => c.maLoaiVuViec === maLoai);
        return item?.tenLoaiVuViec || "Không xác định";
    };

    // Lấy tên loại đơn từ mã
    const getTenLoaiDon = (maLoai) => {
        const item = applicationtypes.find(a => a.maLoaiDon === maLoai);
        return item?.tenLoaiDon || "Không xác định";
    };

    // Lấy tên quốc gia từ mã
    const getTenQuocGia = (maQG) => {
        const qg = countries.find(c => c.maQuocGia === maQG);
        return qg?.tenQuocGia || "Không xác định";
    };

    // Lấy tên đối tác từ mã
    const getTenDoiTac = (maDT) => {
        const dt = partners.find(d => d.maDoiTac === maDT);
        return dt?.tenDoiTac || "Không xác định";
    };

    // Lấy nhãn trạng thái từ value
    const getTrangThaiLabel = (value) => {
        const status = statusOptions.find(s => s.value === value);
        return status?.label || "Không xác định";
    };

    // Lấy tên nhân sự từ mã
    const getTenNhanSu = (maNS) => {
        const ns = staffs.find(s => s.maNhanSu === maNS);
        return ns?.hoTen || "Không xác định";
    };

    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Thông tin hồ sơ vụ việc</h2>

                <Spin spinning={loading} tip="Loading..." size="large">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800 text-left">

                        <div><span className="font-medium">Mã hồ sơ vụ việc:</span> {maHoSoVuViec}</div>
                        <div><span className="font-medium">Khách hàng:</span> {getTenKhachHang(maKhachHang)}</div>
                        <div><span className="font-medium">Tên vụ việc:</span> {noiDungVuViec}</div>
                        <div><span className="font-medium">Ngày tiếp nhận:</span> {ngayTiepNhan}</div>
                        <div><span className="font-medium">Ngày xử lý:</span> {ngayXuLy || "Chưa có"}</div>
                        <div><span className="font-medium">Loại vụ việc:</span> {getTenLoaiVuViec(maLoaiVuViec)}</div>
                        <div><span className="font-medium">Loại đơn:</span> {getTenLoaiDon(maLoaiDon)}</div>
                        <div><span className="font-medium">Quốc gia vụ việc:</span> {getTenQuocGia(maQuocGia)}</div>
                        <div><span className="font-medium">Đối tác:</span> {getTenDoiTac(maDoiTac) || "Không có"}</div>
                        <div><span className="font-medium">Trạng thái vụ việc:</span> {getTrangThaiLabel(trangThaiVuViec)}</div>
                        <div><span className="font-medium">Người xử lý chính:</span> {getTenNhanSu(nguoiXuLyChinh)}</div>
                        <div><span className="font-medium">Người xử lý phụ:</span> {getTenNhanSu(nguoiXuLyPhu)}</div>

                    </div>
                </Spin>
                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">
                        Quay lại
                    </button>

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

export default CaseDetail;
