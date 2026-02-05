import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
import { DatePicker } from 'antd';
import dayjs from 'dayjs'; 
import 'dayjs/locale/vi';
import { useTranslation } from "react-i18next";
function StaffEdit() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { maNhanSu } = useParams();

    const [hoTen, setHoTen] = useState("");
    const [chucVu, setChucVu] = useState("");
    const [phongBan, setPhongBan] = useState("");
    const [sdt, setSdt] = useState("");
    const [email, setEmail] = useState("");
    const [ngayThangNamSinh, setNgayThangNamSinh] = useState("");
    const [cccd, setCccd] = useState("");
    const [bangCap, setBangCap] = useState("");

    const [errors, setErrors] = useState({});
    const isFormValid = maNhanSu.trim() !== "" && hoTen.trim() !== "";
    const validateField = (field, value) => {
        let error = "";
        if (!value.trim()) {
            if (field === "maNhanSu") error = "Mã nhân sự không được để trống";
            if (field === "hoTen") error = "Họ tên không được để trống";
        }
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: error,
        }));
    };
    useEffect(() => {
        const fetchStaffDetails = async () => {

            try {
                const response = await callAPI({
                    method: "post",
                    endpoint: `/staff/detail`,
                    data: {
                        maNhanSu
                    }
                });
                setHoTen(response.hoTen);
                setChucVu(response.chucVu);
                setPhongBan(response.phongBan);
                setSdt(response.sdt);
                setEmail(response.email);
                setNgayThangNamSinh(response.ngayThangNamSinh);
                setCccd(response.cccd);
                setBangCap(response.bangCap);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin nhân sự!", error);
            }
        };
        fetchStaffDetails();
    }, [maNhanSu]);

    const handleEditStaff = async () => {
        try {
            await callAPI({
                method: "put",
                endpoint: `/staff/edit`,
                data: {
                    maNhanSu,
                    hoTen,
                    chucVu,
                    phongBan,
                    sdt,
                    email: email || null,
                    ngayThangNamSinh,
                    cccd: cccd || null,
                    bangCap,
                },
            });
            await showSuccess(t("successTitle"), 'Cập nhật nhân sự thành công!');
            // alert("Cập nhật nhân sự thành công!");
            navigate(-1);
        } catch (error) {
            console.error("Lỗi khi cập nhật nhân sự!", error);
        }
    };

    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">✏️ Chỉnh sửa nhân sự</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 text-left">Mã nhân sự <span className="text-red-500">*</span></label>
                        <input type="text" value={maNhanSu} disabled className="w-full p-2 mt-1 border rounded-lg text-input bg-gray-200" placeholder={t("employeeCodePlaceholder")}/>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Họ tên<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={hoTen}
                            onChange={(e) => {
                                setHoTen(e.target.value)
                                validateField("hoTen", e.target.value);
                            }}
                            placeholder={t("fullNamePlaceholder")}
                            className="w-full p-2 mt-1 border rounded-lg text-input"

                        />
                        {errors.hoTen && (
                            <p className="text-red-500 text-xs mt-1 text-left">{errors.hoTen}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Chức vụ</label>
                        <input type="text" value={chucVu} onChange={(e) => setChucVu(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder={t("positionPlaceholder")}/>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Phòng ban</label>
                        <input type="text" value={phongBan} onChange={(e) => setPhongBan(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder={t("departmentPlaceholder")}/>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Số điện thoại</label>
                        <input type="text" value={sdt} onChange={(e) => setSdt(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder={t("phoneNumberPlaceholder")}/>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input"  placeholder={t("emailPlaceholder")}/>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Ngày sinh</label>
                        <DatePicker
                            value={ngayThangNamSinh ? dayjs(ngayThangNamSinh) : null}
                            onChange={(date) => {
                                if (dayjs.isDayjs(date) && date.isValid()) {
                                    setNgayThangNamSinh(date.format("YYYY-MM-DD"));
                                } else {
                                    setNgayThangNamSinh(null);
                                }
                            }}
                            format="DD/MM/YYYY"
                            placeholder={t("chooseBirthDate")}
                            className="mt-1 w-full"
                            style={{ height: "38px" }}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">CCCD</label>
                        <input type="text" value={cccd} onChange={(e) => setCccd(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder={t("CCCDPlaceholder")}/>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Bằng cấp</label>
                        <input type="text" value={bangCap} onChange={(e) => setBangCap(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input" placeholder={t("degreePlaceholder")}/>
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                    <button className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>
                    <button onClick={handleEditStaff} disabled={!isFormValid}
                        className={`px-4 py-2 rounded-lg text-white ${isFormValid
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-300 cursor-not-allowed"
                            }`}>
                        Cập nhật nhân sự
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StaffEdit;
