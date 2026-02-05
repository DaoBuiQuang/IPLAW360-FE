import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api";
import { DatePicker, Modal, Input, message } from "antd";
import { User, Mail, Phone, Calendar, IdCard, GraduationCap, ShieldCheck, Briefcase } from "lucide-react";
import { showSuccess, showError } from "../../components/commom/Notification";
import dayjs from "dayjs";
import 'dayjs/locale/vi';

const StaffDetail = () => {
    const navigate = useNavigate();
    const { maNhanSu } = useParams();

    const [profile, setProfile] = useState({
        hoTen: "",
        chucVu: "",
        phongBan: "",
        sdt: "",
        email: "",
        ngayThangNamSinh: "",
        cccd: "",
        bangCap: "",
        tenTaiKhoan: ""
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await callAPI({
                    method: "post",
                    endpoint: `/staff/detail`,
                    data: { maNhanSu }
                });
                setProfile({
                    hoTen: response.hoTen,
                    chucVu: response.chucVu,
                    phongBan: response.phongBan,
                    sdt: response.sdt,
                    email: response.email,
                    ngayThangNamSinh: response.ngayThangNamSinh,
                    cccd: response.cccd,
                    bangCap: response.bangCap,
                    tenTaiKhoan: response.tenTaiKhoan
                });
            } catch (error) {
                console.error("Lỗi khi lấy thông tin nhân sự!", error);
            }
        };
        fetchProfile();
    }, [maNhanSu]);

    const handleResetPassword = async () => {
        if (!newPassword) {
            message.warning("Vui lòng nhập mật khẩu mới.");
            return;
        }
        if (newPassword !== confirmPassword) {
            message.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/reset-password",
                data: {
                    username: profile.tenTaiKhoan,
                    newPassword: newPassword
                }
            });
            message.success(response.message || "Mật khẩu đã được đặt lại.");
            await showSuccess("Thành công!", "Lấy lại mật khẩu thành công!");
            setIsModalOpen(false);
            setNewPassword("");
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
            message.error(error?.response?.data?.message || "Lỗi khi đặt lại mật khẩu.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Thông tin nhân sự</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={<User size={20} />} label="Họ tên" value={profile.hoTen} />
                <InfoItem icon={<Briefcase size={20} />} label="Chức vụ" value={profile.chucVu} />
                <InfoItem icon={<ShieldCheck size={20} />} label="Phòng ban" value={profile.phongBan} />
                <InfoItem icon={<Phone size={20} />} label="Số điện thoại" value={profile.sdt} />
                <InfoItem icon={<Mail size={20} />} label="Email" value={profile.email} />
                <InfoItem icon={<Calendar size={20} />} label="Ngày sinh" value={formatDate(profile.ngayThangNamSinh)} />
                <InfoItem icon={<IdCard size={20} />} label="CCCD" value={profile.cccd} />
                <InfoItem icon={<GraduationCap size={20} />} label="Bằng cấp" value={profile.bangCap} />
                <InfoItem icon={<User size={20} />} label="Tên tài khoản" value={profile.tenTaiKhoan} />
            </div>

            <div className="flex justify-center gap-4 mt-8">
                <button className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg" onClick={() => navigate(-1)}>
                    Quay lại
                </button>
                {(!profile.tenTaiKhoan || profile.tenTaiKhoan.trim() === "") && (
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                        onClick={() => navigate(`/registerstaff/${maNhanSu}`)}
                    >
                        Tạo tài khoản
                    </button>
                )}
                {profile.tenTaiKhoan && (
                    <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Lấy lại mật khẩu
                    </button>
                )}
            </div>

            <Modal
                title={`Đặt lại mật khẩu cho tài khoản ${profile.tenTaiKhoan}`}
                open={isModalOpen}
                onOk={handleResetPassword}
                onCancel={() => setIsModalOpen(false)}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <label className="block text-left mb-2 text-gray-700">Mật khẩu mới</label>
                <Input.Password
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <label className="block text-left mt-4 mb-2 text-gray-700">Nhập lại mật khẩu</label>
                <Input.Password
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </Modal>
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-center">
        <div className="text-blue-500 mr-3">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 text-left">{label}</p>
            <p className="text-gray-800 font-medium text-left">{value || "-"}</p>
        </div>
    </div>
);

const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
};

export default StaffDetail;
