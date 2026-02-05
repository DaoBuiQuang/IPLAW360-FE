import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, message } from "antd";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
import GCN_NH_Info from "../../components/commom/GCN_NH_Info";
import DocumentSection_KH from "../../components/TrademarkRegistrationProcess/KH/DocumentSection_KH";
import FormGiaHan from "../../components/commom/FormGiaHan";

function Application_GH_NH_VNEdit() {
    const navigate = useNavigate();
    const { id } = useParams(); // ID của affidavit

    // -------------------- STATE --------------------
    const [loading, setLoading] = useState(true);
    const [gcnData, setGcnData] = useState(null);
    const [taiLieuList, setTaiLieuList] = useState([]);

    // Các trường form Gia hạn
    const [soDon, setSoDon] = useState("");
    const [ngayNopYCGiaHan, setNgayNopYCGiaHan] = useState(null);
    const [donGoc, setDonGoc] = useState(null);
    const [ngayKQThamDinh_DuKien, setNgayKQThamDinh_DuKien] = useState(null);
    const [trangThaiThamDinh, setTrangThaiThamDinh] = useState(null);
    const [ngayThongBaoTuChoiGiaHan, setNgayThongBaoTuChoiGiaHan] = useState(null);
    const [hanTraLoiTuChoiGiaHan, setHanTraLoiTuChoiGiaHan] = useState(null);
    const [ngayTraLoiThongBaoTuChoiGiaHan, setNgayTraLoiThongBaoTuChoiGiaHan] = useState(null);
    const [trangThaiTuChoiGiaHan, setTrangThaiTuChoiGiaHan] = useState(null);
    const [ngayQuyetDinhTuChoiGiaHan, setNgayQuyetDinhTuChoiGiaHan] = useState(null);
    const [ngayQuyetDinhGiaHan_DuKien, setNgayQuyetDinhGiaHan_DuKien] = useState(null);
    const [ngayQuyetDinhGiaHan, setNgayQuyetDinhGiaHan] = useState(null);
    const [ngayDangBa, setNgayDangBa] = useState(null);
    const [idGCN_NH, setIdGCN_NH] = useState(null);

    // -------------------- FETCH DETAIL --------------------
    const fetchAffidavitDetail = async () => {
        try {
            setLoading(true);
            const res = await callAPI({
                method: "post",
                endpoint: "/application_gh_nh_vn/detail",
                data: { id },
            });

            const detail = res?.data;
            if (!detail) throw new Error("Không có dữ liệu trả về");

            setGcnData(detail.gcn);
            setIdGCN_NH(detail.gcn?.id || null);

            // Gán dữ liệu vào form (nếu có)
            setSoDon(detail.soDon || "");
            setNgayNopYCGiaHan(detail.ngayNopYCGiaHan || null);
            setDonGoc(detail.donGoc || null);
            setNgayKQThamDinh_DuKien(detail.ngayKQThamDinh_DuKien || null);
            setTrangThaiThamDinh(detail.trangThaiThamDinh || null);
            setNgayThongBaoTuChoiGiaHan(detail.ngayThongBaoTuChoiGiaHan || null);
            setHanTraLoiTuChoiGiaHan(detail.hanTraLoiTuChoiGiaHan || null);
            setNgayTraLoiThongBaoTuChoiGiaHan(detail.ngayTraLoiThongBaoTuChoiGiaHan || null);
            setTrangThaiTuChoiGiaHan(detail.trangThaiTuChoiGiaHan || null);
            setNgayQuyetDinhTuChoiGiaHan(detail.ngayQuyetDinhTuChoiGiaHan || null);
            setNgayQuyetDinhGiaHan_DuKien(detail.ngayQuyetDinhGiaHan_DuKien || null);
            setNgayQuyetDinhGiaHan(detail.ngayQuyetDinhGiaHan || null);
            setNgayDangBa(detail.ngayDangBa || null);
            setTaiLieuList(detail.taiLieus || []);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết affidavit:", error);
            showError("Không thể tải thông tin affidavit!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchAffidavitDetail();
    }, [id]);

    // -------------------- SUBMIT --------------------
    const handleSubmitDonGiaHan = async () => {
        try {
            const payload = {
                id,
                idGCN_NH,
                soDon,
                ngayNopYCGiaHan,
                donGoc,
                ngayKQThamDinh_DuKien,
                trangThaiThamDinh,
                ngayThongBaoTuChoiGiaHan,
                hanTraLoiTuChoiGiaHan,
                ngayTraLoiThongBaoTuChoiGiaHan,
                trangThaiTuChoiGiaHan,
                ngayQuyetDinhTuChoiGiaHan,
                ngayQuyetDinhGiaHan_DuKien,
                ngayQuyetDinhGiaHan,
                ngayDangBa,
                taiLieus: taiLieuList,
            };

            await callAPI({
                method: "put",
                endpoint: "/application_gh_nh_vn/update",
                data: payload,
            });

            showSuccess("Thành công!", "Cập nhật đơn gia hạn thành công!");
            message.success("Cập nhật đơn gia hạn thành công!");
            navigate(-1);
        } catch (error) {
            console.error("Lỗi khi cập nhật affidavit:", error);
            showError("Thất bại!", "Đã xảy ra lỗi khi cập nhật đơn gia hạn.");
        }
    };

    // -------------------- RENDER --------------------
    if (loading) return <div className="p-4">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-5xl">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
                    Chi tiết Đơn Gia Hạn Nhãn Hiệu
                </h2>

                {gcnData && (
                    <>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                            Thông tin GCN Nhãn hiệu
                        </h3>
                        <GCN_NH_Info data={gcnData} />
                    </>
                )}

                <div className="mt-10 border-t pt-6">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Cập nhật Đơn gia hạn
                    </h3>

                    <DocumentSection_KH
                        onTaiLieuChange={setTaiLieuList}
                        initialTaiLieus={taiLieuList}
                    />

                    <FormGiaHan
                        soDon={soDon}
                        setSoDon={setSoDon}
                        ngayNopYCGiaHan={ngayNopYCGiaHan}
                        setNgayNopYCGiaHan={setNgayNopYCGiaHan}
                        donGoc={donGoc}
                        setDonGoc={setDonGoc}
                        ngayKQThamDinh_DuKien={ngayKQThamDinh_DuKien}
                        setNgayKQThamDinh_DuKien={setNgayKQThamDinh_DuKien}
                        trangThaiThamDinh={trangThaiThamDinh}
                        setTrangThaiThamDinh={setTrangThaiThamDinh}
                        ngayThongBaoTuChoiGiaHan={ngayThongBaoTuChoiGiaHan}
                        setNgayThongBaoTuChoiGiaHan={setNgayThongBaoTuChoiGiaHan}
                        hanTraLoiTuChoiGiaHan={hanTraLoiTuChoiGiaHan}
                        setHanTraLoiTuChoiGiaHan={setHanTraLoiTuChoiGiaHan}
                        ngayTraLoiThongBaoTuChoiGiaHan={ngayTraLoiThongBaoTuChoiGiaHan}
                        setNgayTraLoiThongBaoTuChoiGiaHan={setNgayTraLoiThongBaoTuChoiGiaHan}
                        trangThaiTuChoiGiaHan={trangThaiTuChoiGiaHan}
                        setTrangThaiTuChoiGiaHan={setTrangThaiTuChoiGiaHan}
                        ngayQuyetDinhTuChoiGiaHan={ngayQuyetDinhTuChoiGiaHan}
                        setNgayQuyetDinhTuChoiGiaHan={setNgayQuyetDinhTuChoiGiaHan}
                        ngayQuyetDinhGiaHan_DuKien={ngayQuyetDinhGiaHan_DuKien}
                        setNgayQuyetDinhGiaHan_DuKien={setNgayQuyetDinhGiaHan_DuKien}
                        ngayQuyetDinhGiaHan={ngayQuyetDinhGiaHan}
                        setNgayQuyetDinhGiaHan={setNgayQuyetDinhGiaHan}
                        ngayDangBa={ngayDangBa}
                        setNgayDangBa={setNgayDangBa}
                    />

                    <div className="flex justify-end mt-6 gap-3">
                        <Button onClick={() => navigate(-1)}>← Quay lại</Button>
                        <Button
                            type="primary"
                            className="bg-[#009999]"
                            onClick={handleSubmitDonGiaHan}
                        >
                            Lưu Thay Đổi
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Application_GH_NH_VNEdit;
