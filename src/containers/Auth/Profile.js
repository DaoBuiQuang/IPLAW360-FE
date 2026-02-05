import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, IdCard, GraduationCap, ShieldCheck, Briefcase } from "lucide-react";
import callAPI from "../../utils/api";
import { jwtDecode } from "jwt-decode";

const Profile = () => {
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

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            const decoded = jwtDecode(token);
            const maNhanSu = decoded?.maNhanSu;

            if (!maNhanSu) return;

            try {
                const response = await callAPI({
                    method: "post",
                    endpoint: "/staff/detail",
                    data: { maNhanSu },
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
                    tenTaiKhoan: response.tenTaiKhoan,
                });
            } catch (error) {
                console.error("Lỗi khi lấy thông tin nhân sự!", error);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div className="max-w-3xl mx-auto mt-10 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Hồ sơ cá nhân</h2>

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

export default Profile;
