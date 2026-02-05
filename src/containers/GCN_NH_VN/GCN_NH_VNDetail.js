import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, message } from "antd";
import callAPI from "../../utils/api";

import GCN_NH_Info from "../../components/commom/GCN_NH_Info";
import FormGiaHan from "../../components/commom/FormGiaHan";
import { showSuccess, showError, showWarning } from "../../components/commom/Notification";
import DocumentSection_KH from "../../components/TrademarkRegistrationProcess/KH/DocumentSection_KH";
import FormSuaDoiBang from "../../components/commom/FormSuaDoiBang";

function GCN_NH_VNDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);

  const [showFormGiaHan, setShowFormGiaHan] = useState(false);
  const [soDon, setSoDon] = useState(null);
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
  const [taiLieuList, setTaiLieuList] = useState([]);
  const [idGCN_NH, setIdGCN_NH] = useState(null);
  const [showFormSuaDoi, setShowFormSuaDoi] = useState(false);


  const [soDonSD, setSoDonSD] = useState("");
  const [ngayYeuCau, setNgayYeuCau] = useState(null);
  const [lanSuaDoi, setLanSuaDoi] = useState(1);
  const [ngayGhiNhanSuaDoi, setNgayGhiNhanSuaDoi] = useState(null);
  const [duocGhiNhanSuaDoi, setDuocGhiNhanSuaDoi] = useState(false);
  const [moTaSuaDoi, setMoTaSuaDoi] = useState("");
  const [suaDoiDaiDien, setSuaDoiDaiDien] = useState(false);
  const [ndSuaDoiDaiDien, setNdSuaDoiDaiDien] = useState("");
  const [suaDoiTenChuBang, setSuaDoiTenChuBang] = useState(false);
  const [ndSuaDoiTenChuBang, setNdSuaDoiTenChuBang] = useState("");
  const [suaDoiDiaChi, setSuaDoiDiaChi] = useState(false);
  const [ndSuaDoiDiaChi, setNdSuaDoiDiaChi] = useState("");
  const [suaNhan, setSuaNhan] = useState(false);
  const [ndSuaNhan, setNdSuaNhan] = useState("");
  const [suaNhomSPDV, setSuaNhomSPDV] = useState(false);
  const [ndSuaNhomSPDV, setNdSuaNhomSPDV] = useState("");
  // ✅ Lấy chi tiết GCN
  const fetchDetail = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: `/gcn_nh/detail`,
        data: { id },
      });
      setData(response);
      setIdGCN_NH(response?.id);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết GCN_NH:", error);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  if (!data) return <div className="p-4">Đang tải dữ liệu...</div>;

  // ✅ Gửi form Gia hạn lên API
  const handleSubmitGiaHan = async () => {
    const payload = {
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
      taiLieuList,
    };

    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/application_gh_nh_vn/add",
        data: payload,
      });
      await showSuccess("Thành công!", "Thêm đơn gia hạn thành công!");
      setShowFormGiaHan(false);
    } catch (error) {
      showError("Thất bại!", "Không thể thêm đơn gia hạn.", error);
      console.error("Lỗi khi thêm đơn gia hạn:", error);
      message.error("Đã xảy ra lỗi khi thêm đơn gia hạn!");
    }
  };
  const handleSubmitSuaDoi = async () => {
        try {
            await callAPI({
                method: "post",
                endpoint: "/application_sd_gcn_nh_vn/add",
                data: {
                    maHoSo: data.maHoSo,
                    idGCN_NH_Cu: id,
                    soDonSD,
                    ngayYeuCau,
                    lanSuaDoi,
                    ngayGhiNhanSuaDoi,
                    duocGhiNhanSuaDoi,
                    moTaSuaDoi,
                    suaDoiDaiDien,
                    ndSuaDoiDaiDien,
                    suaDoiTenChuBang,
                    ndSuaDoiTenChuBang,
                    suaDoiDiaChi,
                    ndSuaDoiDiaChi,
                    suaNhan,
                    ndSuaNhan,
                    suaNhomSPDV,
                    ndSuaNhomSPDV,
                },
            });
            await showSuccess("Thành công!", "Thêm đơn sửa đổi giấy chứng nhận nhãn hiệu thành công!");
            navigate(-1);
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
            console.error("Lỗi khi Thêm đơn sửa đổi giấy chứng nhận nhãn hiệu!", error);
        }
    };
  const handleTaiLieuChange = (list) => {
    setTaiLieuList(list);
  };
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
          Thông tin GCN Nhãn hiệu Việt Nam
        </h2>

        {/* ✅ Hiển thị thông tin GCN */}
        <GCN_NH_Info data={data} />

        {/* ✅ Các nút hành động */}
        <div className="flex justify-center mt-8 gap-4 flex-wrap">
          <button
            className="bg-gray-500 text-white font-medium hover:bg-gray-600 px-6 py-3 rounded-lg shadow transition"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>

          <button
            onClick={() => navigate(`/gcn_nh_vnedit/${id})`)}
            className="bg-[#009999] hover:bg-[#007a7a] text-white font-medium px-6 py-3 rounded-lg shadow transition"
          >
            Sửa thông tin
          </button>

          <button
            onClick={() => {
              const today = new Date();
              const hanGiaHan = new Date(data?.hanGiaHan);

              // So sánh ngày (bỏ phần giờ)
              const isPastDeadline = hanGiaHan < new Date(today.toDateString());

              if (!isPastDeadline) {
                showWarning(
                  "Cảnh báo!",
                  ` Chưa đến hạn nộp đơn gia hạn (hạn là ${hanGiaHan.toLocaleDateString("vi-VN")})`
                );
                return;
              }

              // Nếu đã quá hạn -> mở form
              setShowFormGiaHan(true);
            }}
            className="bg-[#009999] hover:bg-[#007a7a] text-white font-medium px-6 py-3 rounded-lg shadow transition"
          >
            Thêm mới Đơn Gia Hạn
          </button>
          <button
            onClick={() => setShowFormSuaDoi(true)}
            className="bg-[#009999] hover:bg-[#007a7a] text-white font-medium px-6 py-3 rounded-lg shadow transition"
          >
            Thêm mới Đơn Sửa Đổi
          </button>
          <button
            onClick={() => setShowFormSuaDoi(true)}
            className="bg-[#009999] hover:bg-[#007a7a] text-white font-medium px-6 py-3 rounded-lg shadow transition"
          >
            Thêm mới Đơn chuyển nhượng
          </button>
        </div>
        {showFormSuaDoi && (
          <div className="mt-10 border-t pt-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Thêm mới Đơn Sửa Đổi
            </h3>

            <FormSuaDoiBang
              idGCN_NH={idGCN_NH}
              soDonSD={soDonSD}
              setSoDonSD={setSoDonSD}
              lanSuaDoi={lanSuaDoi}
              setLanSuaDoi={setLanSuaDoi}
              ngayYeuCau={ngayYeuCau}
              setNgayYeuCau={setNgayYeuCau}
              ngayGhiNhanSuaDoi={ngayGhiNhanSuaDoi}
              setNgayGhiNhanSuaDoi={setNgayGhiNhanSuaDoi}
              duocGhiNhanSuaDoi={duocGhiNhanSuaDoi}
              setDuocGhiNhanSuaDoi={setDuocGhiNhanSuaDoi}
              moTaSuaDoi={moTaSuaDoi}
              setMoTaSuaDoi={setMoTaSuaDoi}
              suaDoiDaiDien={suaDoiDaiDien}
              setSuaDoiDaiDien={setSuaDoiDaiDien}
              ndSuaDoiDaiDien={ndSuaDoiDaiDien}
              setNdSuaDoiDaiDien={setNdSuaDoiDaiDien}
              suaDoiTenChuBang={suaDoiTenChuBang}
              setSuaDoiTenChuBang={setSuaDoiTenChuBang}
              ndSuaDoiTenChuBang={ndSuaDoiTenChuBang}
              setNdSuaDoiTenChuBang={setNdSuaDoiTenChuBang}
              suaDoiDiaChi={suaDoiDiaChi}
              setSuaDoiDiaChi={setSuaDoiDiaChi}
              ndSuaDoiDiaChi={ndSuaDoiDiaChi}
              setNdSuaDoiDiaChi={setNdSuaDoiDiaChi}
              onClose={() => setShowFormSuaDoi(false)}
            />
            <div className="flex justify-end mt-6">
              <Button
                type="default"
                className="bg-gray-500 text-white"
                onClick={() => setShowFormSuaDoi(false)}
              >
                Đóng
              </Button>
              <Button type="primary" className="bg-[#009999]" onClick={handleSubmitSuaDoi}>
                Lưu Đơn sửa đổi
              </Button>
            </div>
          </div>
        )}

        {/* ✅ Form Gia hạn */}
        {showFormGiaHan && (
          <div className="mt-10 border-t pt-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Thêm mới Đơn Gia Hạn</h3>
            <div className="col-span-2">
              <DocumentSection_KH onTaiLieuChange={handleTaiLieuChange} initialTaiLieus={taiLieuList}
              />
            </div>
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
              suaNhomSPDV={suaNhomSPDV}
              setSuaNhomSPDV={setSuaNhomSPDV}
              ndSuaNhomSPDV={ndSuaNhomSPDV}
              setNdSuaNhomSPDV={setNdSuaNhomSPDV}
            />

            <div className="flex justify-end mt-6">
              <Button type="primary" className="bg-[#009999]" onClick={handleSubmitGiaHan}>
                Lưu Đơn Gia Hạn
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GCN_NH_VNDetail;
