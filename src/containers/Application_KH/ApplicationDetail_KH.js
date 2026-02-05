import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import callAPI from "../../utils/api.js";
import DonProgress from "../../components/commom/DonProgess.js";
import "dayjs/locale/vi";
import { Table, Modal, Button, Spin } from "antd";
import ExportWordModal from "../../components/ExportFile/ExportWordModal.js";
import DSVuViec from "../../components/VuViecForm/DSVuViec.js";

function ApplicationDetail_KH() {
  const navigate = useNavigate();
  const { maDonDangKy } = useParams();

  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ghiChu, setGhiChu] = useState("");
  // Thông tin chung
  const [noiDungVuViec, setNoiDungVuViec] = useState("");
  const [maKhachHang, setMaKhachHang] = useState("");
  const [tenKhachHang, setTenKhachHang] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");

  const [maHoSoVuViec, setMaHoSoVuViec] = useState("");
  const [soDon, setSoDon] = useState("");
  const [ngayNopDon, setNgayNopDon] = useState(null);
  const [maNhanHieu, setMaNhanHieu] = useState("");
  const [tenNhanHieu, setTenNhanHieu] = useState("");
  const [linkAnh, setLinkAnh] = useState("");
  const [maSPDVList, setMaSPDVList] = useState([]);

  // Deadline chung
  const [hanTraLoi, setHanTraLoi] = useState(null);
  const [hanXuLy, setHanXuLy] = useState(null);

  // Hồ sơ tài liệu
  const [ngayHoanThanhHSTL_DuKien, setNgayHoanThanhHSTL_DuKien] = useState(null);
  const [ngayHoanThanhHSTL, setNgayHoanThanhHSTL] = useState(null);
  const [trangThaiHoanThanhHSTL, setTrangThaiHoanThanhHSTL] = useState("");
  const [taiLieuList, setTaiLieuList] = useState([]);

  // Hình thức
  const [ngayKQThamDinhHinhThuc_DuKien, setNgayKQThamDinhHinhThuc_DuKien] = useState(null);
  const [ngayKQThamDinhHinhThuc, setNgayKQThamDinhHinhThuc] = useState(null);
  const [ngayKQThamDinhHinhThuc_DK_SauKN, setNgayKQThamDinhHinhThuc_DK_SauKN] = useState(null);

  // Công bố
  const [ngayCongBo_DuKien, setNgayCongBo_DuKien] = useState(null);
  const [ngayCongBo, setNgayCongBo] = useState(null);

  // Nội dung
  const [ngayKQThamDinhND_DuKien, setNgayKQThamDinhND_DuKien] = useState(null);
  const [ngayKQThamDinhND, setNgayKQThamDinhND] = useState(null);
  const [ngayKQThamDinhND_DK_SauKN, setNgayKQThamDinhND_DK_SauKN] = useState(null);
  const [trangThaiTraLoiKQThamDinhND, setTrangThaiTraLoiKQThamDinhND] = useState(null);

  // Trả lời ND
  const [ngayTraLoiKQThamDinhND_DuKien, setNgayTraLoiKQThamDinhND_DuKien] = useState(null);
  const [ngayTraLoiKQThamDinhND, setNgayTraLoiKQThamDinhND] = useState(null);

  // Cấp bằng
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

  // Trạng thái đơn
  const [trangThaiDon, setTrangThaiDon] = useState("");
  const [buocXuLy, setBuocXuLy] = useState("");

  // Ủy quyền
  const [maUyQuyen, setMaUyQuyen] = useState(null);
  const [giayUyQuyenGoc, setGiayUyQuyenGoc] = useState(true);

  // Lịch sử thẩm định (GIỮ NGUYÊN như bạn yêu cầu)
  const [lichSuThamDinh, setLichSuThamDinh] = useState([]);
  const [isModalTDOpen, setIsModalTDOpen] = useState(false);

  // Danh sách vụ việc (⬅️ thêm mới để giống VN)
  const [vuViecList, setVuViecList] = useState([]);
  const [soGUQ, setSoGUQ] = useState("");
  const [soDonUQGoc, setSoDonUQGoc] = useState("");
  const [clientsRef, setClientsRef] = useState(null);
  const [danhSachDonSuaDoi, setDanhSachDonSuaDoi] = useState([]);
  const [donGoc, setDonGoc] = useState(null);
  const [donSuaDoi, setDonSuaDoi] = useState({});
  const isViewOnly = true;

  useEffect(() => {
    detailApplication();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };
  const formatDateVN = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };
  const formatVietnameseDate = (date = new Date()) => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return `Hà Nội, ngày ${d} tháng ${m} năm ${y}`;
  };
  const daysLeft = (dateString) => {
    if (!dateString) return "";
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `(còn ${diffDays} ngày)` : `(quá hạn ${Math.abs(diffDays)} ngày)`;
  };

  const detailApplication = async () => {
    setLoading(true);
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "application_kh/fulldetail",
        data: { maDonDangKy },
      });

      // ✅ QUAN TRỌNG: chuẩn hoá response
      const response = res?.data ?? res;

      console.log("FULL RESPONSE:", response);
      console.log("clientsRef:", response.clientsRef);

      if (!response) return;

      setMaHoSoVuViec(response.maHoSoVuViec || "");
      setNoiDungVuViec(response.noiDung || "");
      setMaKhachHang(response.maKhachHang || "");
      setTenKhachHang(response.khachHang?.tenKhachHang || "");
      setDiaChi(response.khachHang?.diaChi || "");
      setSoDienThoai(response.khachHang?.sdt || "");

      setSoDon(response.soDon || "");
      setGhiChu(response.ghiChu || "");

      setMaNhanHieu(response.nhanHieu?.maNhanHieu || "");
      setTenNhanHieu(response.nhanHieu?.tenNhanHieu || "");
      setLinkAnh(response.nhanHieu?.linkAnh || "");

      setTrangThaiDon(response.trangThaiDon || "");
      setHanTraLoi(formatDate(response.hanTraLoi));
      setHanXuLy(formatDate(response.hanXuLy));
      setBuocXuLy(response.buocXuLy || "");

      setMaSPDVList(response.maSPDVList || []);
      setNgayNopDon(formatDate(response.ngayNopDon));

      // ✅ CLIENTS REF – DÒNG QUYẾT ĐỊNH
      setClientsRef(response.clientsRef || "");

      // Hồ sơ tài liệu
      setNgayHoanThanhHSTL_DuKien(formatDate(response.ngayHoanThanhHoSoTaiLieu_DuKien));
      setNgayHoanThanhHSTL(formatDate(response.ngayHoanThanhHoSoTaiLieu));
      setTrangThaiHoanThanhHSTL(response.trangThaiHoanThienHoSoTaiLieu || "");

      // Hình thức
      setNgayKQThamDinhHinhThuc_DuKien(formatDate(response.ngayKQThamDinhHinhThuc_DuKien));
      setNgayKQThamDinhHinhThuc(formatDate(response.ngayKQThamDinhHinhThuc));
      setNgayKQThamDinhHinhThuc_DK_SauKN(response.ngayKQThamDinhHinhThuc_DK_SauKN);

      // Công bố
      setNgayCongBo_DuKien(formatDate(response.ngayCongBoDonDuKien));
      setNgayCongBo(formatDate(response.ngayCongBoDon));

      // Nội dung
      setNgayKQThamDinhND_DuKien(formatDate(response.ngayKQThamDinhND_DuKien));
      setNgayKQThamDinhND(formatDate(response.ngayKQThamDinhND));
      setNgayTraLoiKQThamDinhND_DuKien(formatDate(response.ngayTraLoiKQThamDinhND_DuKien));
      setNgayTraLoiKQThamDinhND(formatDate(response.ngayTraLoiKQThamDinhND));
      setNgayKQThamDinhND_DK_SauKN(response.ngayKQThamDinhND_DK_SauKN);
      setTrangThaiTraLoiKQThamDinhND(response.trangThaiTraLoiKQThamDinhND);

      // Cấp bằng
      setNgayThongBaoCapBang(formatDate(response.ngayThongBaoCapBang));
      setTrangThaiCapBang(response.trangThaiDYTBCapBang);
      setNgayNopYKien(formatDate(response.ngayNopYKien));
      setNgayNhanKQYKien(formatDate(response.ngayNhanKQYKien));
      setKetQuaYKien(response.ketQuaYKien);
      setNgayPhanHoiKQYKien(formatDate(response.ngayPhanHoiKQYKien));

      setNgayNopPhiCapBang(formatDate(response.ngayNopPhiCapBang));
      setNgayNhanBang(formatDate(response.ngayNhanBang));
      setNgayGuiBangChoKH(formatDate(response.ngayGuiBangChoKhachHang));
      setSoBang(response.soBang || "");
      setQuyetDinhSo(response.quyetDinhSo || "");
      setNgayCapBang(formatDate(response.ngayCapBang));
      setNgayHetHanBang(formatDate(response.ngayHetHanBang));

      // Tài liệu
      setTaiLieuList(response.taiLieuChuaNop_KH || []);

      // Vụ việc
      setVuViecList(response.vuViec || []);

      // Uỷ quyền
      setMaUyQuyen(response.maUyQuyen || null);
      setGiayUyQuyenGoc(response.giayUyQuyenGoc);

      // Lịch sử thẩm định
      setLichSuThamDinh(response.lichSuThamDinh || []);

      // Giấy uỷ quyền
      setSoGUQ(response.GiayUyQuyen?.soGUQ || "");
      setSoDonUQGoc(response.GiayUyQuyen?.soDonGoc || "");

      // Đơn sửa đổi
      setDanhSachDonSuaDoi(response.danhSachDonSuaDoi || []);
      setDonGoc(response.donGoc || null);
      setDonSuaDoi(response.donSuaDoi || {});
    } catch (error) {
      console.error("detailApplication error:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleApplicationEdit = () => {
    if (maDonDangKy) navigate(`/applicationedit_kh/${maDonDangKy}`);
  };

  const handleVuViecChange = (list) => {
    setVuViecList(list);
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center space-y-4">
      {/* ✅ Thêm DonProgress để giống VN */}
      <DonProgress trangThaiDon={trangThaiDon} />

      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700 uppercase">
            📌 Thông tin đơn đăng ký nhãn hiệu
          </h2>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg"
            alt="Cờ Campuchia"
            className="w-20 h-15"
          />
        </div>

        <Spin spinning={loading} tip="Loading..." size="large">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-800 text-sm">
              {/* Thông tin chung – giống VN */}
              <div className="text-left"><span className="font-medium">Mã hồ sơ:</span> {maHoSoVuViec}</div>
              <div className="text-left"><span className="font-medium">Client ref's:</span> {clientsRef}</div>
              <div className="text-left"><span className="font-medium">Mã khách hàng:</span> {maKhachHang}</div>
              <div className="text-left"><span className="font-medium">Tên khách hàng:</span> {tenKhachHang}</div>
              <div className="text-left"><span className="font-medium">Địa chỉ:</span> {diaChi}</div>
              <div className="text-left"><span className="font-medium">Số điện thoại:</span> {soDienThoai}</div>
              <div className="text-left"><span className="font-medium">Số đơn:</span> {soDon}</div>
              <div className="text-left"><span className="font-medium">Số bằng:</span> {soBang}</div>
              <div className="text-left"><span className="font-medium">Ngày nộp đơn:</span> {formatDateVN(ngayNopDon)}</div>
              <div className="text-left"><span className="font-medium">Tên nhãn hiệu:</span> {tenNhanHieu}</div>
              <div className="text-left"><span className="font-medium">Số giấy ủy quyền:</span> {soGUQ}</div>
              <div className="text-left"><span className="font-medium">Số đơn gốc giấy ủy quyền:</span> {soDonUQGoc}</div>
              {/* Ảnh + Ghi chú */}
              <div className="col-span-1 md:col-span-2 my-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ghi chú bên trái */}


                  {/* Ảnh bên phải */}
                  <div className="flex justify-center items-center">
                    {linkAnh ? (
                      <img
                        src={linkAnh}
                        alt="Ảnh nhãn hiệu"
                        className="h-40 border rounded-md shadow-sm"
                      />
                    ) : (
                      <div className="italic text-gray-400">Không có ảnh</div>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="font-medium">Ghi chú:</span>
                    <p className="mt-1 text-gray-700 italic whitespace-pre-line">
                      {ghiChu || "Chưa có ghi chú"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hai cột Tình trạng & Dự kiến – giống VN */}
              <div className="col-span-1 md:col-span-2 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tình trạng xử lý */}
                <div>
                  <h2 className="text-base font-semibold mb-2 text-left">Tình trạng xử lý</h2>
                  <div className="space-y-2 text-sm text-gray-800">
                    {ngayNopDon && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayNopDon)}</span>
                        <span>Ngày nộp đơn</span>
                      </div>
                    )}
                    {ngayHoanThanhHSTL && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayHoanThanhHSTL)}</span>
                        <span>Ngày hoàn thành hồ sơ</span>
                      </div>
                    )}
                    {ngayKQThamDinhHinhThuc && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhHinhThuc)}</span>
                        <span>Ngày KQ TĐ hình thức</span>
                      </div>
                    )}
                    {ngayKQThamDinhHinhThuc_DK_SauKN && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhHinhThuc_DK_SauKN)}</span>
                        <span>Ngày KQ TĐ hình thức sau khiếu nại</span>
                      </div>
                    )}
                    {ngayCongBo && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayCongBo)}</span>
                        <span>Ngày công bố</span>
                      </div>
                    )}
                    {ngayKQThamDinhND && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhND)}</span>
                        <span>Ngày KQ TĐ nội dung</span>
                      </div>
                    )}
                    {ngayKQThamDinhND_DK_SauKN && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhND_DK_SauKN)}</span>
                        <span>Ngày KQ TĐ nội dung sau khiếu nại</span>
                      </div>
                    )}
                    {ngayTraLoiKQThamDinhND && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayTraLoiKQThamDinhND)}</span>
                        <span>Ngày trả lời TĐND</span>
                      </div>
                    )}
                    {ngayThongBaoCapBang && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayThongBaoCapBang)}</span>
                        <span>Ngày thông báo cấp bằng</span>
                      </div>
                    )}
                    {ngayNopYKien && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayNopYKien)}</span>
                        <span>Ngày nộp ý kiến</span>
                      </div>
                    )}
                    {ngayNhanKQYKien && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayNhanKQYKien)}</span>
                        <span>Ngày nhận KQ ý kiến</span>
                      </div>
                    )}
                    {ngayPhanHoiKQYKien && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayPhanHoiKQYKien)}</span>
                        <span>Ngày phản hồi KQ ý kiến</span>
                      </div>
                    )}
                    {ngayNopPhiCapBang && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayNopPhiCapBang)}</span>
                        <span>Ngày nộp phí cấp bằng</span>
                      </div>
                    )}
                    {ngayNhanBang && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayNhanBang)}</span>
                        <span>Ngày nhận bằng</span>
                      </div>
                    )}
                    {ngayGuiBangChoKH && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayGuiBangChoKH)}</span>
                        <span>Ngày gửi bằng cho KH</span>
                      </div>
                    )}
                    {ngayCapBang && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayCapBang)}</span>
                        <span>Ngày cấp bằng</span>
                      </div>
                    )}
                    {ngayHetHanBang && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayHetHanBang)}</span>
                        <span>Ngày hết hạn bằng</span>
                      </div>
                    )}
                    {Array.isArray(danhSachDonSuaDoi) &&
                      danhSachDonSuaDoi
                        .slice() // copy để sort không mutate props/state
                        .sort((a, b) => (a.lanSuaDoi || 0) - (b.lanSuaDoi || 0))
                        .map((item, index) => (
                          <React.Fragment key={index}>
                            {item.ngayYeuCau && (
                              <div className="flex">
                                <span className="w-32 font-medium">{formatDateVN(item.ngayYeuCau)}</span>
                                <span>
                                  Ngày yêu cầu sửa đổi lần{" "}
                                  {item.lanSuaDoi ?? index + 1}
                                </span>
                              </div>
                            )}

                            {item.ngayGhiNhanSuaDoi && (
                              <div className="flex">
                                <span className="w-32 font-medium">{formatDateVN(item.ngayGhiNhanSuaDoi)}</span>
                                <span>
                                  Ngày ghi nhận sửa đổi lần{" "}
                                  {item.lanSuaDoi ?? index + 1}
                                </span>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                  </div>
                </div>

                {/* Ngày dự kiến */}
                <div>
                  <h2 className="text-base font-semibold mb-2 text-left">Ngày dự kiến</h2>
                  <div className="space-y-2 text-sm text-gray-800">
                    <div className="flex" style={{ height: "20px" }}>
                      <span className="w-32 font-medium"> </span>
                      <span> </span>
                    </div>
                    {ngayHoanThanhHSTL_DuKien && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayHoanThanhHSTL_DuKien)}</span>
                        <span>Hoàn thành hồ sơ (dự kiến)</span>
                      </div>
                    )}
                    {ngayKQThamDinhHinhThuc_DuKien && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhHinhThuc_DuKien)}</span>
                        <span>KQ TĐ hình thức (dự kiến)</span>
                      </div>
                    )}
                    {ngayCongBo_DuKien && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayCongBo_DuKien)}</span>
                        <span>Công bố (dự kiến)</span>
                      </div>
                    )}
                    {ngayKQThamDinhND_DuKien && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhND_DuKien)}</span>
                        <span>KQ TĐ nội dung (dự kiến)</span>
                      </div>
                    )}
                    {ngayTraLoiKQThamDinhND_DuKien && (
                      <div className="flex">
                        <span className="w-32 font-medium">{formatDateVN(ngayTraLoiKQThamDinhND_DuKien)}</span>
                        <span>Trả lời TĐND (dự kiến)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                  {taiLieuList?.length > 0 ? (
                    taiLieuList.map((item) => (
                      <tr key={item.maTaiLieu} className="hover:bg-gray-50 text-left">
                        <td className="px-3 py-2 border-b">{item.tenTaiLieu}</td>
                        <td className="px-3 py-2 border-b">{item.trangThai}</td>
                        <td className="px-3 py-2 border-b">
                          {item.linkTaiLieu ? (
                            <button
                              className="text-blue-600 underline"
                              onClick={() => {
                                const fileName = item.tenTaiLieu || "tai_lieu.docx";
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-gray-500 italic py-4">
                        Không có tài liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ✅ Thêm danh sách vụ việc giống trang Việt Nam */}
              <div className="col-span-2 mt-4">
                <DSVuViec
                  maHoSo={maHoSoVuViec}
                  onVuViecChange={(list) => setVuViecList(list)}
                  initialVuViecs={vuViecList}
                  maHoSoVuViec={maHoSoVuViec}
                  giayUyQuyenGoc={giayUyQuyenGoc}
                  setGiayUyQuyenGoc={setGiayUyQuyenGoc}
                  maUyQuyen={maUyQuyen}
                  setMaUyQuyen={setMaUyQuyen}
                  isViewOnly={isViewOnly}
                />
              </div>

              {/* GIỮ NGUYÊN: 1 nút mở modal lịch sử thẩm định */}
              <div className="flex gap-3 mb-4">
                <Button
                  type="primary"
                  style={{ backgroundColor: "#009999", borderColor: "#009999" }}
                  onClick={() => setIsModalTDOpen(true)}
                >
                  📄 Xem lịch sử nhận thông báo từ chối thẩm định
                </Button>
              </div>
            </div>
          </div>
        </Spin>

        {/* Actions */}
        <div className="mt-4">
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
            >
              Quay lại
            </button>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              In Word: Thông tin Đơn Đăng Ký
            </button>

            <button
              onClick={handleApplicationEdit}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Sửa thông tin đơn
            </button>
          </div>

          <ExportWordModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            data={{
              soBang,
              quyetDinhSo,
              ngayCapBang: formatDateVN(ngayCapBang),
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
              maSPDVList: maSPDVList.join(", "),
              ngayHienTai: formatVietnameseDate(),
            }}
            fileName={`ThongDonDangKy_${maDonDangKy}`}
          />
        </div>

        {/* GIỮ NGUYÊN: Modal lịch sử thẩm định (1 bảng) */}
        <Modal
          title="📄 Lịch sử nhận thông báo từ chối thẩm định"
          open={isModalTDOpen}
          onCancel={() => setIsModalTDOpen(false)}
          footer={null}
          width={1200}
        >
          <Table
            dataSource={lichSuThamDinh}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 1200 }}
            columns={[
              { title: "Lần thẩm định", dataIndex: "lanThamDinh", width: 100 },
              { title: "Kết quả", dataIndex: "ketQuaThamDinh", width: 130 },
              { title: "Ngày TB từ chối", dataIndex: "ngayNhanThongBaoTuChoiTD", width: 140 },
              { title: "Hạn trả lời", dataIndex: "hanTraLoi", width: 140 },
              { title: "Ngày trả lời", dataIndex: "ngayTraLoiThongBaoTuChoi", width: 140 },
              { title: "Gia hạn", dataIndex: "giaHan", render: v => v ? "Có" : "Không", width: 100 },
              { title: "Ngày gia hạn", dataIndex: "ngayGiaHan", width: 130 },
              { title: "Hạn trả lời gia hạn", dataIndex: "hanTraLoiGiaHan", width: 150 },
            ]}
          />
        </Modal>
      </div>
    </div>
  );
}

export default ApplicationDetail_KH;
