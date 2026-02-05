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

function ApplicationKD_VNDetail() {
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [noiDungVuViec, setNoiDungVuViec] = useState("");
    const [maKhachHang, setMaKhachHang] = useState("");
    const [tenKhachHang, setTenKhachHang] = useState("");
    const [diaChi, setDiaChi] = useState("");
    const [soDienThoai, setSoDienThoai] = useState("");

    const { maDonDangKy } = useParams();
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
    const [ngayHoanThanhHSTL_DuKien, setNgayHoanThanhHSTL_DuKien] = useState(null);
    const [ngayHoanThanhHSTL, setNgayHoanThanhHSTL] = useState(null);
    const [trangThaiHoanThanhHSTL, setTrangThaiHoanThanhHSTL] = useState("");

    const [ngayKQThamDinhHinhThuc_DuKien, setNgayKQThamDinhHinhThuc_DuKien] = useState(null);
    const [ngayKQThamDinhHinhThuc, setNgayKQThamDinhHinhThuc] = useState(null);
    const [lichSuThamDinhHT, setLichSuThamDinhHT] = useState([])
    const [ngayKQThamDinhHinhThuc_DK_SauKN, setNgayKQThamDinhHinhThuc_DK_SauKN] = useState(null)

    const [ngayCongBo_DuKien, setNgayCongBo_DuKien] = useState(null);
    const [ngayCongBo, setNgayCongBo] = useState(null);

    const [ngayKQThamDinhND_DuKien, setNgayKQThamDinhND_DuKien] = useState(null);
    const [ngayKQThamDinhND, setNgayKQThamDinhND] = useState(null);
    const [lichSuThamDinhND, setLichSuThamDinhND] = useState([]);
    const [ngayKQThamDinhND_DK_SauKN, setNgayKQThamDinhND_DK_SauKN] = useState(null)
    const [trangThaiTraLoiKQThamDinhND, setTrangThaiTraLoiKQThamDinhND] = useState(null)


    const [ngayTraLoiKQThamDinhND_DuKien, setNgayTraLoiKQThamDinhND_DuKien] = useState(null);
    const [ngayTraLoiKQThamDinhND, setNgayTraLoiKQThamDinhND] = useState(null);

    const [ngayThongBaoCapBang, setNgayThongBaoCapBang] = useState(null);
    const [trangThaiCapBang, setTrangThaiCapBang] = useState(null);
    const [ngayNopYKien, setNgayNopYKien] = useState(null);
    const [ngayNhanKQYKien, setNgayNhanKQYKien] = useState(null);
    const [ketQuaYKien, setKetQuaYKien] = useState(null);
    const [ngayPhanHoiKQYKien, setNgayPhanHoiKQYKien] = useState(null);

    const [ngayNopPhiCapBang, setNgayNopPhiCapBang] = useState(null);
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

    const [isModalHTOpen, setIsModalHTOpen] = useState(false);
    const [isModalNDOpen, setIsModalNDOpen] = useState(false);
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
                endpoint: "application/fulldetail",
                data: { maDonDangKy }
            });

            if (response) {
                setMaHoSoVuViec(response.maHoSoVuViec);
                if (response.hoSoVuViec) {
                    setNoiDungVuViec(response.hoSoVuViec.noiDungVuViec || "");
                    setMaKhachHang(response.hoSoVuViec.maKhachHang || "");
                    setTenKhachHang(response.hoSoVuViec.khachHang?.tenKhachHang || "");
                    setDiaChi(response.hoSoVuViec.khachHang?.diaChi || "");
                    setSoDienThoai(response.hoSoVuViec.khachHang?.sdt || "");
                }
                setSoDon(response.soDon)
                setMaNhanHieu(response.nhanHieu.maNhanHieu);
                setTenNhanHieu(response.nhanHieu.tenNhanHieu);
                setLinkAnh(response.nhanHieu.linkAnh);
                setTrangThaiDon(response.trangThaiDon);
                setHanTraLoi(formatDate(response.hanTraLoi));
                setHanXuLy(formatDate(response.hanXuLy));
                setBuocXuLy(response.buocXuLy);
                setMaSPDVList(response.maSPDVList)
                setNgayNopDon(formatDate(response.ngayNopDon));
                setNgayHoanThanhHSTL_DuKien(formatDate(response.ngayHoanThanhHoSoTaiLieu_DuKien));
                setNgayHoanThanhHSTL(formatDate(response.ngayHoanThanhHoSoTaiLieu));
                setTrangThaiHoanThanhHSTL(response.trangThaiHoanThienHoSoTaiLieu);
                setNgayKQThamDinhHinhThuc_DuKien(formatDate(response.ngayKQThamDinhHinhThuc_DuKien));
                setLichSuThamDinhHT(response.lichSuThamDinhHT)
                setNgayKQThamDinhHinhThuc_DK_SauKN(response.ngayKQThamDinhHinhThuc_DK_SauKN)

                setNgayKQThamDinhHinhThuc(formatDate(response.ngayKQThamDinhHinhThuc));
                setNgayCongBo_DuKien(formatDate(response.ngayCongBoDonDuKien));
                setNgayCongBo(formatDate(response.ngayCongBoDon));
                setNgayKQThamDinhND_DuKien(formatDate(response.ngayKQThamDinhND_DuKien));
                setNgayKQThamDinhND(formatDate(response.ngayKQThamDinhND));
                setNgayTraLoiKQThamDinhND_DuKien(formatDate(response.ngayTraLoiKQThamDinhND_DuKien));
                setNgayTraLoiKQThamDinhND(formatDate(response.ngayTraLoiKQThamDinhND));
                setLichSuThamDinhND(response.lichSuThamDinhND)
                setNgayKQThamDinhND_DK_SauKN(response.ngayKQThamDinhND_DK_SauKN);
                setTrangThaiTraLoiKQThamDinhND(response.trangThaiTraLoiKQThamDinhND);

                setNgayThongBaoCapBang(formatDate(response.ngayThongBaoCapBang));
                setTrangThaiCapBang(response.trangThaiDYTBCapBang);
                setNgayNopYKien(formatDate(response.ngayNopYKien));
                setNgayNhanKQYKien(formatDate(response.ngayNhanKQYKien));
                setKetQuaYKien(response.ketQuaYKien);
                setNgayPhanHoiKQYKien(formatDate(response.ngayPhanHoiKQYKien));

                setNgayNopPhiCapBang(formatDate(response.ngayNopPhiCapBang));
                setNgayNhanBang(formatDate(response.ngayNhanBang));
                setNgayGuiBangChoKH(formatDate(response.ngayGuiBangChoKhachHang));
                setSoBang(response.soBang);
                setQuyetDinhSo(response.quyetDinhSo);
                setNgayCapBang(formatDate(response.ngayCapBang));
                setNgayHetHanBang(formatDate(response.ngayHetHanBang));
                setTrangThaiDon(response.trangThaiDon);
                setTaiLieuList(response.taiLieu)
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
    const tuChoiND = getLatestThongBao(lichSuThamDinhND);
    const tuChoiHT = getLatestThongBao(lichSuThamDinhHT);
    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center space-y-4">
            <DonProgress trangThaiDon={trangThaiDon} />
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">
                        📌 Thông tin đơn đăng ký kiểu dáng mới
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
                            {/* Các mốc thời gian khác */}
                            {ngayHoanThanhHSTL_DuKien && (
                                <div className="text-left m-0 p-0">
                                    <span className="font-medium">Ngày hoàn thành hồ sơ (dự kiến):</span> {formatDateVN(ngayHoanThanhHSTL_DuKien)}
                                </div>
                            )}

                            {ngayHoanThanhHSTL && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày hoàn thành hồ sơ:</span> {formatDateVN(ngayHoanThanhHSTL)}
                                </div>
                            )}

                            {/* {trangThaiHoanThanhHSTL && ( */}
                            <div className="text-left">
                                <span className="font-medium">Trạng thái hoàn thiện hồ sơ:</span> {trangThaiHoanThanhHSTL}
                                {taiLieuList?.some(tl => tl.trangThai === "Chưa nộp") && (
                                    <span className="text-red-600 ml-2">(Cần bổ sung)</span>
                                )}
                            </div>
                            {/* )} */}


                            {ngayKQThamDinhHinhThuc_DuKien && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày KQ TĐ hình thức (dự kiến):</span> {formatDateVN(ngayKQThamDinhHinhThuc_DuKien)}
                                </div>
                            )}

                            {ngayKQThamDinhHinhThuc && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày KQ TĐ hình thức:</span> {formatDateVN(ngayKQThamDinhHinhThuc)}
                                </div>
                            )}

                            {ngayKQThamDinhHinhThuc_DK_SauKN && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày KQ TĐ hình thức sau KN:</span> {formatDateVN(ngayKQThamDinhHinhThuc_DK_SauKN)}
                                </div>
                            )}

                            {ngayCongBo_DuKien && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày công bố (dự kiến):</span> {formatDateVN(ngayCongBo_DuKien)}
                                </div>
                            )}

                            {ngayCongBo && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày công bố:</span> {formatDateVN(ngayCongBo)}
                                </div>
                            )}

                            {ngayKQThamDinhND_DuKien && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày KQ TĐ nội dung (dự kiến):</span> {formatDateVN(ngayKQThamDinhND_DuKien)}
                                </div>
                            )}

                            {ngayKQThamDinhND && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày KQ TĐ nội dung:</span> {formatDateVN(ngayKQThamDinhND)}
                                </div>
                            )}

                            {ngayKQThamDinhND_DK_SauKN && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày KQ TĐ nội dung sau KN:</span> {formatDateVN(ngayKQThamDinhND_DK_SauKN)}
                                </div>
                            )}

                            {ngayTraLoiKQThamDinhND_DuKien && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày trả lời TĐND (dự kiến):</span> {formatDateVN(ngayTraLoiKQThamDinhND_DuKien)}
                                </div>
                            )}

                            {ngayTraLoiKQThamDinhND && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày trả lời TĐND:</span> {formatDateVN(ngayTraLoiKQThamDinhND)}
                                </div>
                            )}

                            {ngayThongBaoCapBang && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày thông báo cấp bằng:</span> {formatDateVN(ngayThongBaoCapBang)}
                                </div>
                            )}

                            {trangThaiCapBang && (
                                <div className="text-left">
                                    <span className="font-medium">Trạng thái cấp bằng:</span> {trangThaiCapBang}
                                </div>
                            )}

                            {ngayNopYKien && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày nộp ý kiến:</span> {formatDateVN(ngayNopYKien)}
                                </div>
                            )}

                            {ngayNhanKQYKien && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày nhận KQ ý kiến:</span> {formatDateVN(ngayNhanKQYKien)}
                                </div>
                            )}

                            {ketQuaYKien && (
                                <div className="text-left">
                                    <span className="font-medium">Kết quả ý kiến:</span> {ketQuaYKien}
                                </div>
                            )}

                            {ngayNopPhiCapBang && (
                                <div className="text-left">
                                    <span className="font-medium">Ngày nộp phí cấp bằng:</span> {formatDateVN(ngayNopPhiCapBang)}
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
                            <div className="flex gap-3 mb-4">
                                <Button type="primary" style={{ backgroundColor: "#009999", borderColor: "#009999" }} onClick={() => setIsModalHTOpen(true)}>📄 Xem lịch sử nhận thông báo từ chối thẩm định hình thức</Button>
                                <Button type="primary" style={{ backgroundColor: "#009999", borderColor: "#009999" }} onClick={() => setIsModalNDOpen(true)}>📄 Xem lịch sử nhân thông báo từ chối thẩm định nội dung</Button>
                            </div>

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
                        In Word: Thông tin Đơn Đăng Ký
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
                            ngayKQThamDinhND: formatDateVN(ngayKQThamDinhND),
                            ngayTraLoiKQThamDinhND_DuKien: formatDateVN(ngayTraLoiKQThamDinhND_DuKien),
                            maNhanHieu,
                            ngayHoanThanhHSTL_DuKien,
                            ngayHoanThanhHSTL,
                            ngayKQThamDinhHinhThuc_DuKien,
                            ngayKQThamDinhHinhThuc,
                            diaChi,
                            ngayCongBo_DuKien,
                            ngayCongBo,
                            giayUyQuyenGoc: maUyQuyen,
                            image: linkAnh,
                            maSPDVList: maSPDVList.join(', '),
                            ngayHienTai: formatVietnameseDate(),
                            ngayNhanThongBaoTuChoiHT: formatDateVN(tuChoiHT?.ngayNhanThongBaoTuChoiTD),
                            hanTraLoiHT: formatDateVN(tuChoiHT?.hanTraLoiGiaHan),
                            ngayNhanThongBaoTuChoiND: formatDateVN(tuChoiND?.ngayNhanThongBaoTuChoiTD),
                            hanTraLoiND: formatDateVN(tuChoiND?.hanTraLoiGiaHan),
                        }}
                        fileName={`ThongDonDangKy_${maDonDangKy}`}
                    />
                </div>

                <Modal
                    title="📄 Lịch sử nhận thông báo từ chối thẩm định hình thức"
                    open={isModalHTOpen}
                    onCancel={() => setIsModalHTOpen(false)}
                    footer={null}
                    width={1200}
                >
                    <Table
                        dataSource={lichSuThamDinhHT}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        scroll={{ x: 1200 }} // Cho phép cuộn ngang nếu dữ liệu dài
                        columns={[
                            { title: "Loại thẩm định", dataIndex: "loaiThamDinh", width: 120 },
                            { title: "Lần thẩm định", dataIndex: "lanThamDinh", width: 100 },
                            { title: "Kết quả", dataIndex: "ketQuaThamDinh", width: 130 },
                            { title: "Ngày TB từ chối", dataIndex: "ngayNhanThongBaoTuChoiTD", width: 140 },
                            { title: "Hạn trả lời", dataIndex: "hanTraLoi", width: 140 },
                            { title: "Ngày trả lời", dataIndex: "ngayTraLoiThongBaoTuChoi", width: 140 },
                            { title: "Gia hạn", dataIndex: "giaHan", render: val => val ? "Có" : "Không", width: 100 },
                            { title: "Ngày gia hạn", dataIndex: "ngayGiaHan", width: 130 },
                            { title: "Hạn trả lời gia hạn", dataIndex: "hanTraLoiGiaHan", width: 150 },
                            { title: "Trạng thái bị nhận QĐ từ chối", dataIndex: "trangThaiBiNhanQuyetDinhTuChoi", render: val => val ? "Có" : "Không", width: 200 },
                            { title: "Ngày nhận QĐ từ chối", dataIndex: "ngayNhanQuyetDinhTuChoi", width: 160 },
                            { title: "Hạn khiếu nại CSHTT", dataIndex: "hanKhieuNaiCSHTT", width: 150 },
                            { title: "Ngày KN CSHTT", dataIndex: "ngayKhieuNaiCSHTT", width: 140 },
                            { title: "KQ KN CSHTT", dataIndex: "ketQuaKhieuNaiCSHTT", width: 130 },
                            { title: "Ngày KQ KN CSHTT", dataIndex: "ngayKQ_KN_CSHTT", width: 150 },
                            { title: "Ghi chú KQ KN CSHTT", dataIndex: "ghiChuKetQuaKNCSHTT", width: 180 },
                            { title: "Hạn KN BKHCN", dataIndex: "hanKhieuNaiBKHCN", width: 130 },
                            { title: "Ngày KN BKHCN", dataIndex: "ngayKhieuNaiBKHCN", width: 130 },
                            { title: "KQ KN BKHCN", dataIndex: "ketQuaKhieuNaiBKHCN", width: 130 },
                            { title: "Ngày KQ KN BKHCN", dataIndex: "ngayKQ_KN_BKHCN", width: 150 },
                            { title: "Ghi chú KQ KN BKHCN", dataIndex: "ghiChuKetQuaKNBKHCN", width: 180 },
                            { title: "Ngày nộp YC sau KN", dataIndex: "ngayNopYeuCauSauKN", width: 160 },
                            { title: "Ghi chú", dataIndex: "ghiChu", width: 200 },
                        ]}
                    />
                </Modal>

                <Modal
                    title="📄 Lịch sử nhận thông báo từ chối thẩm định nội dung"
                    open={isModalNDOpen}
                    onCancel={() => setIsModalNDOpen(false)}
                    footer={null}
                    width={1200}
                >
                    <Table
                        dataSource={lichSuThamDinhND}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        scroll={{ x: 1200 }}
                        columns={[
                            { title: "Loại thẩm định", dataIndex: "loaiThamDinh", width: 120 },
                            { title: "Lần thẩm định", dataIndex: "lanThamDinh", width: 100 },
                            { title: "Kết quả", dataIndex: "ketQuaThamDinh", width: 130 },
                            { title: "Ngày TB từ chối", dataIndex: "ngayNhanThongBaoTuChoiTD", width: 140 },
                            { title: "Hạn trả lời", dataIndex: "hanTraLoi", width: 140 },
                            { title: "Ngày trả lời", dataIndex: "ngayTraLoiThongBaoTuChoi", width: 140 },
                            { title: "Gia hạn", dataIndex: "giaHan", render: val => val ? "Có" : "Không", width: 100 },
                            { title: "Ngày gia hạn", dataIndex: "ngayGiaHan", width: 130 },
                            { title: "Hạn trả lời gia hạn", dataIndex: "hanTraLoiGiaHan", width: 150 },
                            { title: "Trạng thái bị nhận QĐ từ chối", dataIndex: "trangThaiBiNhanQuyetDinhTuChoi", render: val => val ? "Có" : "Không", width: 200 },
                            { title: "Ngày nhận QĐ từ chối", dataIndex: "ngayNhanQuyetDinhTuChoi", width: 160 },
                            { title: "Hạn khiếu nại CSHTT", dataIndex: "hanKhieuNaiCSHTT", width: 150 },
                            { title: "Ngày KN CSHTT", dataIndex: "ngayKhieuNaiCSHTT", width: 140 },
                            { title: "KQ KN CSHTT", dataIndex: "ketQuaKhieuNaiCSHTT", width: 130 },
                            { title: "Ngày KQ KN CSHTT", dataIndex: "ngayKQ_KN_CSHTT", width: 150 },
                            { title: "Ghi chú KQ KN CSHTT", dataIndex: "ghiChuKetQuaKNCSHTT", width: 180 },
                            { title: "Hạn KN BKHCN", dataIndex: "hanKhieuNaiBKHCN", width: 130 },
                            { title: "Ngày KN BKHCN", dataIndex: "ngayKhieuNaiBKHCN", width: 130 },
                            { title: "KQ KN BKHCN", dataIndex: "ketQuaKhieuNaiBKHCN", width: 130 },
                            { title: "Ngày KQ KN BKHCN", dataIndex: "ngayKQ_KN_BKHCN", width: 150 },
                            { title: "Ghi chú KQ KN BKHCN", dataIndex: "ghiChuKetQuaKNBKHCN", width: 180 },
                            { title: "Ngày nộp YC sau KN", dataIndex: "ngayNopYeuCauSauKN", width: 160 },
                            { title: "Ghi chú", dataIndex: "ghiChu", width: 200 },
                        ]}
                    />
                </Modal>

            </div>
        </div>
    );
}

export default ApplicationKD_VNDetail;
