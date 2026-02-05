import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import Select from "react-select";
import { showSuccess, showError } from "../../components/commom/Notification";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
function CustomerEdit() {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [maKhachHang, setMaKhachHang] = useState("");
    const [tenVietTatKH, setTenVietTatKH] = useState("");
    const [tenKhachHang, setTenKhachHang] = useState("");
    const [maDoiTac, setMaDoiTac] = useState("");
    const [nguoiLienHe, setNguoiLienHe] = useState("");
    const [moTa, setMoTa] = useState("");
    const [diaChi, setDiaChi] = useState("");
    const [sdt, setSdt] = useState("");
    const [ghiChu, setGhiChu] = useState("");
    const [maQuocGia, setMaQuocGia] = useState("");
    const [maNganhNghe, setMaNganhNghe] = useState("");
    const [trangThai, setTrangThai] = useState("Đang hoạt động");
    const [maKhachHangCu, setMaKhachHangCu] = useState("");
    const [maNhanSu, setMaNhanSu] = useState(null);
    const [countries, setCountries] = useState([]);
    const [partners, setPartners] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [groups, setGroups] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [idNhomKhachHang, setIdNhomKhachHang] = useState(null);
    const formatOptions = (data, valueKey, labelKey) => {
        if (!Array.isArray(data)) return []; // ✅ đảm bảo luôn trả về mảng
        return data.map(item => ({
            value: item[valueKey],
            label: item[labelKey],
        }));
    };

    const [errors, setErrors] = useState({});
    const isFormValid = maKhachHang.trim() !== "" && tenVietTatKH.trim() !== "" && tenKhachHang.trim() !== "";
    const validateField = (field, value) => {
        let error = "";
        if (!value.trim()) {
            if (field === "maKhachHang") error = t("maKhachHangRequired");
            if (field === "tenVietTatKH") error = t("tenVietTatKHRequired");
            if (field === "tenKhachHang") error = t("tenKhachHangRequired");
        }
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: error,
        }));
    };
    useEffect(() => {
        const fetchCustomerDetail = async () => {
            setLoading(true);
            try {
                const response = await callAPI({
                    method: "post",
                    endpoint: "/customer/detail",
                    data: { id }
                });
                setMaKhachHang(response.maKhachHang || "");
                setTenVietTatKH(response.tenVietTatKH || "");
                setTenKhachHang(response.tenKhachHang || "");
                setMaDoiTac(response.maDoiTac || "");
                setMoTa(response.moTa || "");
                setDiaChi(response.diaChi || "");
                setNguoiLienHe(response.nguoiLienHe || "");
                setSdt(response.sdt || "");
                setGhiChu(response.ghiChu || "");
                setMaQuocGia(response.maQuocGia || "");
                setMaNganhNghe(response.maNganhNghe || "");
                setTrangThai(response.trangThai || "Đang hoạt động");
                setMaKhachHangCu(response.maKhachHangCu || "");
                setIdNhomKhachHang(response.idNhomKhachHang || null);
                setMaNhanSu(response.maNhanSu || null);

            } catch (error) {
                console.error("Lỗi khi lấy thông tin khách hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCustomerDetail();
        }
    }, [id]);
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
            console.error("Lỗi khi lấy dữ liệu đối tác:", error);
        }
    };

    const fetchIndustries = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/industry/list",
                data: {},
            });
            setIndustries(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu ngành nghề:", error);
        }
    };
    const fetchGroups = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/group/list",
                data: {},
            });
            console.log("Response nhóm KH:", response);
            setGroups(response.data || []); // ✅ Lấy đúng mảng data
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu nhóm khách hàng:", error);
        }
    };
    const fetchStaffs = async () => {
        try {
            const response = await callAPI({ method: "post", endpoint: "/staff/basiclist", data: {} });
            setStaffs(response);
        } catch (error) { console.error(error); }
    };
    useEffect(() => {
        fetchCountries();
        fetchPartners();
        fetchIndustries();
        fetchGroups();
        fetchStaffs();
    }, []);

    // Add customer
    const handleEditCustomer = async () => {
        try {
            await callAPI({
                method: "put",
                endpoint: "/customer/edit",
                data: {
                    id,
                    maKhachHang,
                    tenVietTatKH,
                    tenKhachHang,
                    maDoiTac: maDoiTac === "" ? null : maDoiTac,
                    nguoiLienHe,
                    moTa,
                    diaChi,
                    sdt,
                    ghiChu,
                    maQuocGia,
                    trangThai,
                    maNganhNghe: maNganhNghe === "" ? null : maNganhNghe,
                    idNhomKhachHang: idNhomKhachHang,
                      maNhanSu: maNhanSu,
                },
            });
            await showSuccess(t("successTitle"), t("capNhapKhachHangThanhCong"));
            navigate(-1);
        } catch (error) {
            showError(t("errorTitle"), t("genericError"), error);
            console.error(t("addStaffError"), error);
        }
    };
    const trangThaiOptions = [
        { value: "Đang hoạt động", label: "Đang hoạt động" },
        { value: "Dừng hoạt động", label: "Dừng hoạt động" }
    ];
    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 {t("suaKhachHang")}</h2>
                <Spin spinning={loading} tip="Loading..." size="large">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-left">{t("maKhachHang")}<span className="text-red-500">*</span></label>
                            {/* <input
                                type="text"
                                value={maKhachHang}
                                readOnly
                                className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200"
                            /> */}
                            <input
                                type="text"
                                value={maKhachHang}
                                onChange={(e) => {
                                    setMaKhachHang(e.target.value);
                                    validateField("maKhachHang", e.target.value);
                                }}
                                placeholder="Nhập mã khách hàng"
                                className="w-full p-2 mt-1 border rounded-lg text-input"
                            />
                            {errors.maKhachHang && (
                                <p className="text-red-500 text-xs mt-1 text-left">{errors.maKhachHang}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">{t("tenVietTatKH")} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={tenVietTatKH}
                                placeholder="Nhập tên viết tắt khách hàng"
                                onChange={(e) => {
                                    setTenVietTatKH(e.target.value)
                                    validateField("tenVietTatKH", e.target.value)
                                }}
                                className="w-full p-2 mt-1 border rounded-lg text-input"
                            />
                            {errors.tenVietTatKH && (
                                <p className="text-red-500 text-xs mt-1 text-left">{errors.tenVietTatKH}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">{t("tenKhachHang")} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={tenKhachHang}
                                placeholder="Nhập tên khách hàng"
                                onChange={(e) => {
                                    setTenKhachHang(e.target.value)
                                    validateField("tenKhachHang", e.target.value);
                                }}
                                className="w-full p-2 mt-1 border rounded-lg text-input"
                            />
                            {errors.tenKhachHang && (
                                <p className="text-red-500 text-xs mt-1 text-left">{errors.tenKhachHang}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700 text-left">{t("tenDoiTac")}</label>
                            <Select
                                options={formatOptions(partners, "maDoiTac", "tenDoiTac")}
                                value={maDoiTac ? formatOptions(partners, "maDoiTac", "tenDoiTac").find(opt => opt.value === maDoiTac) : null}
                                onChange={selectedOption => setMaDoiTac(selectedOption?.value)}
                                placeholder={t("chonDoiTac")}
                                className="w-full mt-1 rounded-lg text-left"
                                isClearable
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-left">{t("tenQuocGia")}</label>
                            <Select
                                options={formatOptions(countries, "maQuocGia", "tenQuocGia")}
                                value={maQuocGia ? formatOptions(countries, "maQuocGia", "tenQuocGia").find(opt => opt.value === maQuocGia) : null}
                                onChange={selectedOption => setMaQuocGia(selectedOption?.value)}
                                placeholder={t("chonQuocGia")}
                                className="w-full mt-1 rounded-lg text-left"
                                isClearable
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-left">{t("tenNganhNghe")}</label>
                            <Select
                                options={formatOptions(industries, "maNganhNghe", "tenNganhNghe")}
                                value={maNganhNghe ? formatOptions(industries, "maNganhNghe", "tenNganhNghe").find(opt => opt.value === maNganhNghe) : null}
                                onChange={selectedOption => setMaNganhNghe(selectedOption?.value)}
                                placeholder={t("chonNganhNghe")}
                                className="w-full mt-1 rounded-lg text-left"
                                isClearable
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">{t("nguoilienhe")}</label>
                            <input type="text" value={nguoiLienHe} onChange={(e) => setNguoiLienHe(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập người liên hệ" />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">{t("diaChi")}</label>
                            <input type="text" value={diaChi} onChange={(e) => setDiaChi(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập địa chỉ" />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-left">{t("sdt")}</label>
                            <input type="text" value={sdt} onChange={(e) => setSdt(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập số điện thoại" />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-left">{t("trangThai")}</label>
                            <Select
                                options={trangThaiOptions}
                                value={trangThaiOptions.find(option => option.value === trangThai)}
                                onChange={(selectedOption) => setTrangThai(selectedOption?.value)}
                                placeholder={t("chonTrangThai")}
                                className="w-full mt-1 rounded-lg text-left"
                                isClearable
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">
                                Nhóm khách hàng
                            </label>
                            <Select
                                options={formatOptions(groups, "id", "tenNhom")}
                                value={
                                    idNhomKhachHang
                                        ? formatOptions(groups, "id", "tenNhom").find(opt => opt.value === idNhomKhachHang)
                                        : null
                                }
                                onChange={(selectedOption) => setIdNhomKhachHang(selectedOption?.value || "")}
                                placeholder="Chọn nhóm khách hàng"
                                className="w-full mt-1 rounded-lg text-left"
                                isClearable
                            />

                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">{t("moTa")}</label>
                            <input type="text" value={moTa} onChange={(e) => setMoTa(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập mô tả" />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-left">{t("ghiChu")}</label>
                            <input type="text" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập ghi chú" />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-left">{t("maKhachHangCu")}</label>
                            <input type="text" value={maKhachHangCu} onChange={(e) => setMaKhachHangCu(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder="Nhập mã khách hàng cũ" />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">Nhân sự phụ trách</label>
                            <Select
                                options={formatOptions(staffs, "maNhanSu", "hoTen")}
                                value={
                                    maNhanSu
                                        ? formatOptions(staffs, "maNhanSu", "hoTen").find(
                                            (opt) => opt.value === maNhanSu
                                        )
                                        : null
                                }
                                onChange={(selectedOption) => setMaNhanSu(selectedOption?.value || null)}
                                placeholder="Chọn người xử lí chính"
                                className="w-full mt-1 rounded-lg text-left"
                                isClearable
                            />
                        </div>
                    </div>
                </Spin>
                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">{t("back")}</button>
                    <button onClick={handleEditCustomer} disabled={!isFormValid}
                        className={`px-4 py-2 rounded-lg text-white ${isFormValid
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-300 cursor-not-allowed"
                            }`}>{t("suaKhachHang")}</button>
                </div>
            </div>
        </div>
    );
}

export default CustomerEdit;
