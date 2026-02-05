import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from 'dayjs';
import callAPI from "../../utils/api.js";
import DonProgress from "../../components/commom/DonProgess.js";
// import ExportWordButton from "../../components/ExportFile/ExportWordModal.js";
import 'dayjs/locale/vi';
import { showSuccess, showError } from "../../components/commom/Notification.js";
import { Table, Modal, Button, Spin } from "antd";
import ExportWordModal from "../../components/ExportFile/ExportWordModal.js";

function Application_GH_NH_VNDetail() {
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [noiDungVuViec, setNoiDungVuViec] = useState("");
    const [maKhachHang, setMaKhachHang] = useState("");
    const [tenKhachHang, setTenKhachHang] = useState("");
    const [diaChi, setDiaChi] = useState("");
    const [soDienThoai, setSoDienThoai] = useState("");

    const { maDonGiaHan } = useParams();
    const isViewOnly = true
    const [maHoSoVuViec, setMaHoSoVuViec] = useState("");
    const [soDon, setSoDon] = useState("")
    const [ngayNopDon, setNgayNopDon] = useState(null);
    const [maNhanHieu, setMaNhanHieu] = useState("");
    const [tenNhanHieu, setTenNhanHieu] = useState("");
    const [linkAnh, setLinkAnh] = useState("");
    const [maSPDVList, setMaSPDVList] = useState([]);

    const [hanTraLoi, setHanTraLoi] = useState(null);
    const [hanXuLy, setHanXuLy] = useState(null);

    const [ngayNopYCGiaHan, setNgayNopYCGiaHan] = useState(null);
    const [donGoc, setDonGoc] = useState(true);
    const [ngayKQThamDinh_DuKien, setNgayKQThamDinh_DuKien] = useState(null);
    const [trangThaiThamDinh, setTrangThaiThamDinh] = useState(true);
    const [ngayThongBaoTuChoiGiaHan, setNgayThongBaoTuChoiGiaHan] = useState(null);
    const [hanTraLoiTuChoiGiaHan, setHanTraLoiTuChoiGiaHan] = useState(null);
    const [ngayTraLoiThongBaoTuChoiGiaHan, setNgayTraLoiThongBaoTuChoiGiaHan] = useState(null);
    const [trangThaiTuChoiGiaHan, setTrangThaiTuChoiGiaHan] = useState(null);
    const [ngayQuyetDinhTuChoiGiaHan, setNgayQuyetDinhTuChoiGiaHan] = useState(null);
    const [ngayQuyetDinhGiaHan_DuKien, setNgayQuyetDinhGiaHan_DuKien] = useState(null);
    const [ngayQuyetDinhGiaHan, setNgayQuyetDinhGiaHan] = useState(null);
    const [ngayDangBa, setNgayDangBa] = useState(null);


    const [ngayNhanBang, setNgayNhanBang] = useState(null);
    const [ngayGuiBangChoKH, setNgayGuiBangChoKH] = useState(null);
    const [soBang, setSoBang] = useState("");
    const [quyetDinhSo, setQuyetDinhSo] = useState("");
    const [ngayCapBang, setNgayCapBang] = useState(null);
    const [ngayHetHanBang, setNgayHetHanBang] = useState(null);

    const [trangThaiDon, setTrangThaiDon] = useState("");
    const [buocXuLy, setBuocXuLy] = useState("");
    const [taiLieuList, setTaiLieuList] = useState([]);
    const [maUyQuyen, setMaUyQuyen] = useState(null);
    const [giayUyQuyenGoc, setGiayUyQuyenGoc] = useState(true);
    const [brands, setBrands] = useState([]);
    const [productAndService, setProductAndService] = useState([]);

    const [isModalTDOpen, setIsModalTDOpen] = useState(false);
    const formatVietnameseDate = (date = new Date()) => {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        return `Hà Nội, ngày ${d} tháng ${m} năm ${y}`;
    };

    const fetchBrands = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/brand/shortlist",
                data: {},
            });
            setBrands(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu nhãn hiệu:", error);
        }
    };
    const fetchItems = async (searchValue) => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/productsandservices/list",
                data: { search: searchValue },
            });
            setProductAndService(response);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm/dịch vụ:", error);
        }
    };
    useEffect(() => {
        fetchBrands();
        fetchItems();
        detailApplication();
    }, [])

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
    const detailApplication = async () => {
        setLoading(true);
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "application_gh_nh_vn/fulldetail",
                data: { maDonGiaHan }
            });

            if (response) {
                setMaHoSoVuViec(response.maHoSoVuViec);
                // if (response.hoSoVuViec) {
                    setNoiDungVuViec(response.noiDungVuViec || "");
                    setMaKhachHang(response.maKhachHang || "");
                    setTenKhachHang(response.khachHang?.tenKhachHang || "");
                    setDiaChi(response.khachHang?.diaChi || "");
                    setSoDienThoai(response.khachHang?.sdt || "");
                // }
                setSoDon(response.soDon)
                setMaNhanHieu(response.NhanHieu.maNhanHieu);
                setTenNhanHieu(response.NhanHieu.tenNhanHieu);
                setLinkAnh(response.NhanHieu.linkAnh);
                setTrangThaiDon(response.trangThaiDon);
                setHanTraLoi(formatDate(response.hanTraLoi));
                setHanXuLy(formatDate(response.hanXuLy));
                setBuocXuLy(response.buocXuLy);
                setMaSPDVList(response.maSPDVList)
                setNgayNopDon(formatDate(response.ngayNopDon));

                setNgayNopYCGiaHan(formatDate(response.ngayNopYCGiaHan));
                setDonGoc(response.donGoc);
                setNgayKQThamDinh_DuKien(formatDate(response.ngayKQThamDinh_DuKien));
                setTrangThaiThamDinh(response.trangThaiThamDinh);
                setNgayThongBaoTuChoiGiaHan(formatDate(response.ngayThongBaoTuChoiGiaHan));
                setHanTraLoiTuChoiGiaHan(formatDate(response.hanTraLoiTuChoiGiaHan));
                setNgayTraLoiThongBaoTuChoiGiaHan(formatDate(response.ngayTraLoiThongBaoTuChoiGiaHan));
                setTrangThaiTuChoiGiaHan(response.trangThaiTuChoiGiaHan);
                setNgayQuyetDinhTuChoiGiaHan(formatDate(response.ngayQuyetDinhTuChoiGiaHan));
                setNgayQuyetDinhGiaHan_DuKien(formatDate(response.ngayQuyetDinhGiaHan_DuKien));
                setNgayQuyetDinhGiaHan(formatDate(response.ngayQuyetDinhGiaHan));
                setNgayDangBa(formatDate(response.ngayDangBa));

                setNgayNhanBang(formatDate(response.ngayNhanBang));
                setNgayGuiBangChoKH(formatDate(response.ngayGuiBangChoKhachHang));
                setSoBang(response.soBang);
                setQuyetDinhSo(response.quyetDinhSo);
                setNgayCapBang(formatDate(response.ngayCapBang));
                setNgayHetHanBang(formatDate(response.ngayHetHanBang));
                setTrangThaiDon(response.trangThaiDon);
                setTaiLieuList(response.TaiLieuGH_NH_VN)
                setMaUyQuyen(response.maUyQuyen || null);
                setGiayUyQuyenGoc(response.giayUyQuyenGoc);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API chi tiết đơn:", error);
        } finally {
            setLoading(false);
        }
    };
    const formatDateVN = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };
    const daysLeft = (dateString) => {
        if (!dateString) return "";
        const today = new Date();
        const targetDate = new Date(dateString);
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? `(còn ${diffDays} ngày)` : `(quá hạn ${Math.abs(diffDays)} ngày)`;
    };
    const getLatestThongBao = (list) => {
        if (!Array.isArray(list)) return null;

        return list
            .filter(item => item.ngayNhanThongBaoTuChoiTD) // lọc có ngày
            .sort((a, b) => new Date(b.ngayNhanThongBaoTuChoiTD) - new Date(a.ngayNhanThongBaoTuChoiTD))[0] || null;
    };
    // const tuChoiND = getLatestThongBao(lichSuThamDinh);

    const handleApplicationEdit = () => {
        if (maDonGiaHan) {
            navigate(`/application_gh_nh_vn_edit/${maDonGiaHan}`);
        }
    };
    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center space-y-4">
            {/* <DonProgress trangThaiDon={trangThaiDon} /> */}
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">
                        📌 Thông tin đơn gia hạn nhãn hiệu mới
                    </h2>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                        alt="Cờ Việt Nam"
                        className="w-20 h-15"
                    />
                </div>
                <Spin spinning={loading} tip="Loading..." size="large">
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-800 text-sm">
                            {/* Thông tin chung */}
                            <div className="text-left"><span className="font-medium">Mã hồ sơ vụ việc:</span> {maHoSoVuViec}</div>
                            <div className="text-left"><span className="font-medium">Tên vụ việc:</span> {noiDungVuViec}</div>
                            <div className="text-left"><span className="font-medium">Mã khách hàng:</span> {maKhachHang}</div>
                            <div className="text-left"><span className="font-medium">Tên khách hàng:</span> {tenKhachHang}</div>
                            <div className="text-left"><span className="font-medium">Địa chỉ:</span> {diaChi}</div>
                            <div className="text-left"><span className="font-medium">Số điện thoại:</span> {soDienThoai}</div>
                            <div className="text-left"><span className="font-medium">Số đơn:</span> {soDon}</div>
                            <div className="text-left"><span className="font-medium">Ngày nộp đơn: </span>{formatDateVN(ngayNopDon)}</div>
                            {/* <div className="text-left"><span className="font-medium">Mã nhãn hiệu:</span> {maNhanHieu}</div> */}
                            <div className="text-left"><span className="font-medium">Tên nhãn hiệu:</span> {tenNhanHieu}</div>

                            <div className="col-span-1 md:col-span-2 text-center my-4">
                                {linkAnh ? (
                                    <img
                                        src={linkAnh}
                                        alt="Ảnh nhãn hiệu"
                                        className="h-32 mx-auto border rounded-md shadow-sm"
                                    />
                                ) : (
                                    <div className="italic text-gray-400">Không có ảnh</div>
                                )}
                            </div>

                            <div className="text-left"><span className="font-medium">Trạng thái đơn:</span> {trangThaiDon}</div>
                            {/* <div className="text-left"><span className="font-medium">Bước xử lý:</span> {buocXuLy}</div> */}
                            <div className="text-left m-0 p-0">
                                <span className="font-medium">Hạn trả lời:</span> {formatDateVN(hanTraLoi)} {daysLeft(hanTraLoi)}
                            </div>

                            <div className="text-left m-0 p-0">
                                <span className="font-medium">Hạn xử lý:</span> {formatDateVN(hanXuLy)} {daysLeft(hanXuLy)}
                            </div>

                            {/* Sản phẩm dịch vụ */}
                            <div className="md:col-span-2 text-left">
                                <span className="font-medium">Sản phẩm dịch vụ:</span>
                                <ul className="list-disc list-inside ml-4 mt-1 text-gray-700">
                                    {maSPDVList?.map((item, index) => (
                                        <li key={index}>Nhóm SPDV: {item}</li>
                                    ))}
                                </ul>
                            </div>


                            {ngayNopYCGiaHan && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày nộp yêu cầu gia hạn:</span> {formatDateVN(ngayNopYCGiaHan)

                                    }
                                </div>
                            )}
                            {donGoc && (
                                <div className="text-left">
                                    <span className="font-medium">Đơn gốc:</span> {donGoc ? "Có" : "Không"}
                                </div>
                            )}
                            {ngayKQThamDinh_DuKien && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày kết quả thẩm định dự kiến:</span> {formatDateVN(ngayKQThamDinh_DuKien)}
                                </div>
                            )}
                            {trangThaiThamDinh && (
                                <div className="text-left">
                                    <span className="font-medium">Trạng thái thẩm định:</span> {trangThaiThamDinh ? "Đã thẩm định" : "Chưa thẩm định"}
                                </div>
                            )}
                            {ngayThongBaoTuChoiGiaHan && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày nhận thông báo từ chối gia hạn:</span> {formatDateVN(ngayThongBaoTuChoiGiaHan)}
                                </div>
                            )}
                            {hanTraLoiTuChoiGiaHan && (
                                <div className="text-left">
                                    <span className="font-medium">Hạn trả lời từ chối gia hạn:</span> {formatDateVN(hanTraLoiTuChoiGiaHan)} {daysLeft(hanTraLoiTuChoiGiaHan)}
                                </div>
                            )}
                            {ngayTraLoiThongBaoTuChoiGiaHan && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày trả lời thông báo từ chối gia hạn:</span> {formatDateVN(ngayTraLoiThongBaoTuChoiGiaHan)}
                                </div>
                            )}
                            {trangThaiTuChoiGiaHan && (
                                <div className="text-left">
                                    <span className="font-medium">Trạng thái từ chối gia hạn:</span> {trangThaiTuChoiGiaHan ? "Đã từ chối" : "Chưa từ chối"}</div>
                            )}
                            {ngayQuyetDinhTuChoiGiaHan && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày quyết định từ chối gia hạn:</span> {formatDateVN(ngayQuyetDinhTuChoiGiaHan)}
                                </div>
                            )}
                            {ngayQuyetDinhGiaHan_DuKien && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày quyết định gia hạn dự kiến:</span> {formatDateVN(ngayQuyetDinhGiaHan_DuKien)}
                                </div>
                            )}
                            {ngayQuyetDinhGiaHan && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày quyết định gia hạn:</span> {formatDateVN(ngayQuyetDinhGiaHan)}
                                </div>
                            )}
                            {ngayDangBa && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày đăng bạ:</span> {formatDateVN(ngayDangBa)}
                                </div>
                            )}
                            {soBang && (
                                <div className="text-left">
                                    <span className="font-medium">Số bằng:</span> {soBang}
                                </div>
                            )}
                            {quyetDinhSo && (
                                <div className="text-left">
                                    <span className="font-medium">Quyết định số:</span> {quyetDinhSo}
                                </div>
                            )}


                            {ngayNhanBang && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày nhận bằng:</span> {formatDateVN(ngayNhanBang)}
                                </div>
                            )}

                            {ngayGuiBangChoKH && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày gửi bằng cho KH:</span> {formatDateVN(ngayGuiBangChoKH)}
                                </div>
                            )}


                            {ngayCapBang && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày cấp bằng:</span> {formatDateVN(ngayCapBang)}
                                </div>
                            )}

                            {ngayHetHanBang && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày hết hạn bằng:</span> {formatDateVN(ngayHetHanBang)}
                                </div>
                            )}
                            {giayUyQuyenGoc === false && (
                                <div className="text-left">
                                    <span className="font-medium">Mã đơn của giấy ủy quyền gốc:</span> {/* Bạn có thể thay bằng biến nếu cần */}
                                    {maUyQuyen || "Chưa có"}
                                </div>
                            )}

                        </div>
                        {/* Danh sách tài liệu */}
                        <div className="mt-8">
                            <div className="text-lg font-semibold text-gray-700 mb-2">Danh sách tài liệu</div>
                            <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                                <thead className="bg-gray-100 text-left">
                                    <tr>
                                        <th className="px-3 py-2 border-b">Tên tài liệu</th>
                                        <th className="px-3 py-2 border-b">Trạng thái</th>
                                        <th className="px-3 py-2 border-b">Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taiLieuList?.length > 0 ? taiLieuList.map((item) => (
                                        <tr key={item.maTaiLieu} className="hover:bg-gray-50 text-left">
                                            <td className="px-3 py-2 border-b">{item.tenTaiLieu}</td>
                                            <td className="px-3 py-2 border-b">{item.trangThai}</td>
                                            <td className="px-3 py-2 border-b">
                                                {item.linkTaiLieu ? (
                                                    <button
                                                        className="text-blue-600 underline"
                                                        onClick={() => {
                                                            const fileName = item.tenTaiLieu || "tai_lieu.docx";

                                                            // Nếu là PDF thì mở tab mới
                                                            // if (item.linkTaiLieu.startsWith("data:application/pdf")) {
                                                            //     window.open(item.linkTaiLieu, "_blank");
                                                            // } else {
                                                            // Còn lại thì tự động tải về
                                                            const link = document.createElement("a");
                                                            link.href = item.linkTaiLieu;
                                                            link.download = fileName;
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);

                                                        }}
                                                    >
                                                        Xem tài liệu
                                                    </button>
                                                ) : (
                                                    <span className="italic text-gray-400">Chưa có</span>
                                                )}
                                            </td>

                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="text-center text-gray-500 italic py-4">Không có tài liệu</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                        </div>
                    </div>
                </Spin>

                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Quay lại</button>
                </div>
                <div className="mt-4">
                    <button
                        onClick={() => setOpenModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        In Word: Thông tin Đơn Gia hạn
                    </button>

                    <ExportWordModal
                        open={openModal}
                        onClose={() => setOpenModal(false)}
                        data={{
                            soBang,
                            quyetDinhSo,
                            ngayCapBang,
                            ngayGuiBangChoKH,
                            maHoSoVuViec,
                            tenKhachHang,
                            tenNhanHieu,
                            soDon,
                            trangThaiDon,
                            ngayNopDon: formatDateVN(ngayNopDon),
                            maNhanHieu,
                            diaChi,
                            giayUyQuyenGoc: maUyQuyen,
                            image: linkAnh,
                            maSPDVList: maSPDVList.join(', '),
                            ngayHienTai: formatVietnameseDate(),
                            // ngayNhanThongBaoTuChoiHT: formatDateVN(tuChoiHT?.ngayNhanThongBaoTuChoiTD),
                            // hanTraLoiHT: formatDateVN(tuChoiHT?.hanTraLoiGiaHan),
                            // ngayNhanThongBaoTuChoiND: formatDateVN(tuChoiND?.ngayNhanThongBaoTuChoiTD),
                            // hanTraLoiND: formatDateVN(tuChoiND?.hanTraLoiGiaHan),
                        }}
                        fileName={`ThongDonGiaHan_${maDonGiaHan}`}
                    />
                </div>
                <button
                    onClick={handleApplicationEdit}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                    Sửa thông tin đơn
                </button>

            </div>
        </div>
    );
}

export default Application_GH_NH_VNDetail;
