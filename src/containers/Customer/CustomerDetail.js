import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
function CustomerDetail() {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [maKhachHang, setMaKhachHang] = useState(id || "");
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
    const [countries, setCountries] = useState([]);
    const [partners, setPartners] = useState([]);
    const [industries, setIndustries] = useState([]);
    const formatOptions = (data, valueKey, labelKey) => {
        return data.map(item => ({
            value: item[valueKey],
            label: item[labelKey]
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
            } catch (error) {
                console.error("Lỗi khi lấy thông tin khách hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        if (maKhachHang) {
            fetchCustomerDetail();
        }
    }, [maKhachHang]);
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

    useEffect(() => {
        fetchCountries();
        fetchPartners();
        fetchIndustries();
    }, []);
    const trangThaiOptions = [
        { value: "Đang hoạt động", label: "Đang hoạt động" },
        { value: "Dừng hoạt động", label: "Dừng hoạt động" }
    ];
    const getTenDoiTac = (ma) => {
        const doiTac = partners.find(p => p.maDoiTac === ma);
        return doiTac ? doiTac.tenDoiTac : "";
    };

    const getTenQuocGia = (ma) => {
        const quocGia = countries.find(qg => qg.maQuocGia === ma);
        return quocGia ? quocGia.tenQuocGia : "";
    };

    const getTenNganhNghe = (ma) => {
        const nganh = industries.find(n => n.maNganhNghe === ma);
        return nganh ? nganh.tenNganhNghe : "";
    };

    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 {t("chiTietKhachHang")}</h2>
                <Spin spinning={loading} tip="Loading..." size="large">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800 text-left">
                        <div><span className="font-medium">{t("maKhachHang")}:</span> {maKhachHang}</div>
                        <div><span className="font-medium">{t("tenVietTatKH")}:</span> {tenVietTatKH}</div>
                        <div><span className="font-medium">{t("tenKhachHang")}:</span> {tenKhachHang}</div>
                        <div><span className="font-medium">{t("tenDoiTac")}:</span> {getTenDoiTac(maDoiTac)}</div>
                        <div><span className="font-medium">{t("tenQuocGia")}:</span> {getTenQuocGia(maQuocGia)}</div>
                        <div><span className="font-medium">{t("tenNganhNghe")}:</span> {getTenNganhNghe(maNganhNghe)}</div>
                        <div><span className="font-medium">{t("nguoilienhe")}:</span> {nguoiLienHe}</div>
                        <div><span className="font-medium">{t("diaChi")}:</span> {diaChi}</div>
                        <div><span className="font-medium">{t("sdt")}:</span> {sdt}</div>
                        <div><span className="font-medium">{t("trangThai")}:</span> {trangThai}</div>
                        <div><span className="font-medium">{t("moTa")}:</span> {moTa}</div>
                        <div><span className="font-medium">{t("ghiChu")}:</span> {ghiChu}</div>
                        <div><span className="font-medium">{t("maKhachHangCu")}:</span> {maKhachHangCu}</div>
                    </div>
                </Spin>
                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Quay lại</button>
                </div>
            </div>
        </div>
    );
}

export default CustomerDetail;
