import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { DatePicker, Input, Select, Spin, message } from "antd";
import "dayjs/locale/vi";
import callAPI from "../../utils/api.js";
import { showSuccess, showError } from "../../components/commom/Notification.js";

function Application_CQ_NH_VNAdd() {
    const navigate = useNavigate();
    const { maDonDangKy } = useParams();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Thông tin đơn đăng ký hiện tại
    const [appDetail, setAppDetail] = useState(null);

    // Form chuyển quyền
    const [customerId, setCustomerId] = useState(null);
    const [soDonChuyenQuyen, setSoDonChuyenQuyen] = useState("");
    const [ngayYeuCau, setNgayYeuCau] = useState(null);
    const [ngayGhiNhan, setNgayGhiNhan] = useState(null);
    const [ghiChu, setGhiChu] = useState("");

    // Danh sách khách hàng
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        if (maDonDangKy) {
            fetchAppDetail();
        }
        fetchCustomers();
    }, [maDonDangKy]);

    const fetchAppDetail = async () => {
        setLoading(true);
        try {
            const res = await callAPI({
                method: "post",
                endpoint: "/application/detail",
                data: { maDonDangKy },
            });
            if (res) {
                setAppDetail(res);
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin đơn đăng ký:", error);
            message.error("Không thể tải thông tin đơn đăng ký.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await callAPI({
                method: "post",
                endpoint: "/customers/by-name",
                data: {},
            });
            if (Array.isArray(res)) {
                setCustomers(res);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách khách hàng:", error);
        }
    };

    const handleSubmit = async () => {
        if (!customerId) {
            message.error("Vui lòng chọn khách hàng nhận chuyển quyền.");
            return;
        }

        if (!soDonChuyenQuyen.trim()) {
            message.error("Vui lòng nhập Số đơn chuyển nhượng.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                maHoSo: appDetail?.maHoSoVuViec || appDetail?.maHoSo || "",
                maDonDangKyCu: maDonDangKy,
                maKhachHangMoi: Number(customerId),
                soDonChuyenQuyen: soDonChuyenQuyen.trim(),
                ngayYeuCauChuyenQuyen: ngayYeuCau ? ngayYeuCau.format("YYYY-MM-DD") : null,
                ngayGhiNhanChuyenQuyen: ngayGhiNhan ? ngayGhiNhan.format("YYYY-MM-DD") : null,
                ghiChu: ghiChu.trim(),
            };

            await callAPI({
                method: "post",
                endpoint: "/application_cq_nh_vn/add",
                data: payload,
            });

            await showSuccess("Thành công!", "Tạo đơn chuyển quyền sở hữu thành công!");
            navigate(-1);
        } catch (error) {
            console.error("Lỗi khi tạo đơn chuyển quyền:", error);
            showError("Thất bại!", "Đã xảy ra lỗi khi tạo đơn chuyển quyền sở hữu.", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-5xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
                    📌 CHUYỂN QUYỀN SỞ HỮU ĐƠN ĐĂNG KÝ NHÃN HIỆU
                </h2>

                <Spin spinning={loading}>
                    {/* Khối thông tin đơn đăng ký gốc */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                            Thông tin đơn đăng ký hiện tại
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 font-medium">Số đơn: </span>
                                <span className="font-semibold text-gray-800">
                                    {appDetail?.soDon || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Mã hồ sơ: </span>
                                <span className="font-semibold text-gray-800">
                                    {appDetail?.maHoSoVuViec || appDetail?.maHoSo || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Chủ đơn hiện tại: </span>
                                <span className="font-semibold text-gray-800">
                                    {appDetail?.tenKhachHang || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Đại diện SHCN: </span>
                                <span className="font-semibold text-gray-800">
                                    {appDetail?.tenDoiTac || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Tên nhãn hiệu: </span>
                                <span className="font-semibold text-gray-800">
                                    {appDetail?.tenNhanHieu || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium">Ngày nộp đơn: </span>
                                <span className="font-semibold text-gray-800">
                                    {appDetail?.ngayNopDon
                                        ? dayjs(appDetail.ngayNopDon).format("DD/MM/YYYY")
                                        : "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Khối thông tin chuyển quyền */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
                            Thông tin nhận chuyển quyền
                        </h3>

                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-1">
                                Khách hàng nhận chuyển quyền <span className="text-red-500">*</span>
                            </label>
                            <Select
                                className="w-full"
                                placeholder="Chọn khách hàng nhận chuyển quyền"
                                value={customerId}
                                onChange={(val) => setCustomerId(val)}
                                showSearch
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                options={customers.map((c) => ({
                                    value: c.id,
                                    label: `${c.tenKhachHang} ${c.maKhachHang ? `(${c.maKhachHang})` : ""}`,
                                }))}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-1">
                                Số đơn chuyển nhượng / Hợp đồng chuyển quyền <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={soDonChuyenQuyen}
                                onChange={(e) => setSoDonChuyenQuyen(e.target.value)}
                                placeholder="Nhập số đơn chuyển quyền / số hợp đồng"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium text-sm mb-1">
                                    Ngày yêu cầu chuyển quyền
                                </label>
                                <DatePicker
                                    className="w-full"
                                    format="DD/MM/YYYY"
                                    value={ngayYeuCau}
                                    onChange={(d) => setNgayYeuCau(d)}
                                    placeholder="Chọn ngày yêu cầu"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium text-sm mb-1">
                                    Ngày ghi nhận chuyển quyền
                                </label>
                                <DatePicker
                                    className="w-full"
                                    format="DD/MM/YYYY"
                                    value={ngayGhiNhan}
                                    onChange={(d) => setNgayGhiNhan(d)}
                                    placeholder="Chọn ngày ghi nhận"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-1">
                                Ghi chú
                            </label>
                            <Input.TextArea
                                rows={4}
                                value={ghiChu}
                                onChange={(e) => setGhiChu(e.target.value)}
                                placeholder="Nhập ghi chú thêm (nếu có)..."
                            />
                        </div>
                    </div>
                </Spin>

                {/* Nút hành động */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="bg-gray-400 hover:bg-gray-500 text-white font-medium px-6 py-2.5 rounded-lg shadow transition"
                    >
                        Quay lại
                    </button>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow transition disabled:opacity-50"
                    >
                        {submitting ? "Đang lưu..." : "Lưu đơn chuyển quyền"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Application_CQ_NH_VNAdd;
