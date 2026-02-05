import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, message } from "antd";
import callAPI from "../../utils/api";

import FormAffidavit from "../../components/commom/FormAffidavit";
import GCN_NH_Info from "../../components/commom/GCN_NH_Info";
import { showSuccess, showError, showWarning } from "../../components/commom/Notification";
import DocumentSection_KH from "../../components/TrademarkRegistrationProcess/KH/DocumentSection_KH";
import FormGiaHan from "../../components/commom/FormGiaHan";
import FormSuaDoiBang from "../../components/commom/FormSuaDoiBang";
function GCN_NH_CAMDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);

  const [showAffidavitForm, setShowAffidavitForm] = useState(false);
  const [soAffidavit, setSoAffidavit] = useState(null);
  const [idGCN_NH, setIdGCN_NH] = useState(null);
  const [lanNop, setLanNop] = useState(1);
  const [ngayNop, setNgayNop] = useState(null);
  const [ngayGhiNhan, setNgayGhiNhan] = useState(null);
  const [ghiChu, setGhiChu] = useState("");
  const [isAutoImport, setIsAutoImport] = useState(false);
  const [taiLieuList, setTaiLieuList] = useState([]);

  const [showFormGiaHan, setShowFormGiaHan] = useState(false);
  const [soDon, setSoDon] = useState(null);
  const [ngayNopYCGiaHan, setNgayNopYCGiaHan] = useState(null);
  const [donGoc, setDonGoc] = useState(true);
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
  const fetchDetail = async () => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: `/gcn_nh_kh/detail`,
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

  const handleSubmitAffidavit = async () => {
    const payload = { taiLieuList, soAffidavit, idGCN_NH, lanNop, ngayNop, ngayGhiNhan, ghiChu, isAutoImport };
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/affidavit/add",
        data: payload,
      });
      await showSuccess("Thành công!", "Thêm affidavit thành công!");
      setShowAffidavitForm(false);
    } catch (error) {
      showError("Thất bại!", "Đã xảy ra lỗi.", error);
      console.error("Lỗi khi thêm affidavit:", error);
      message.error("Không thể thêm affidavit!");
    }
  };
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
        endpoint: "/application_gh_nh_kh/add",
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
        endpoint: "/application_sd_gcn_nh_kh/add",
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
          Thông tin GCN Nhãn hiệu CAMPUCHIA
        </h2>

        <GCN_NH_Info data={data} />

        {/* Các nút hành động */}
        <div className="flex justify-center mt-8 gap-4 flex-wrap">
          <button
            className="bg-gray-500 text-white font-medium hover:bg-gray-600 px-6 py-3 rounded-lg shadow transition"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>

          <button
            onClick={() => navigate(`/gcn_nh_camedit/${id}`)}
            className="bg-[#009999] hover:bg-[#007a7a] text-white font-medium px-6 py-3 rounded-lg shadow transition"
          >
            Sửa thông tin
          </button>

          <button
            onClick={() => {
              const today = new Date();
              const deadline = new Date(data?.hanNopTuyenThe);
              const isPastDeadline = deadline < new Date(today.toDateString());

              if (!isPastDeadline) {
                showWarning("Cảnh báo!", `Chưa đến hạn nộp Affidavit (hạn là ${deadline.toLocaleDateString("vi-VN")})`);
                return;
              }

              setShowAffidavitForm(!showAffidavitForm);
            }}
            className="bg-[#009999] hover:bg-[#007a7a] text-white font-medium px-6 py-3 rounded-lg shadow transition"
          >
            {showAffidavitForm ? "Ẩn form Affidavit" : "Thêm mới Affidavit"}
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
        </div>

        {/* Form Affidavit */}
        {showAffidavitForm && (
          <div className="mt-10 border-t pt-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Thêm mới Affidavit</h3>
            <div className="col-span-2">
              <DocumentSection_KH onTaiLieuChange={handleTaiLieuChange} initialTaiLieus={taiLieuList}
              />
            </div>
            <FormAffidavit
              soAffidavit={soAffidavit}
              setSoAffidavit={setSoAffidavit}
              idGCN_NH={idGCN_NH}
              setIdGCN_NH={setIdGCN_NH}
              lanNop={lanNop}
              setLanNop={setLanNop}
              ngayNop={ngayNop}
              setNgayNop={setNgayNop}
              ngayGhiNhan={ngayGhiNhan}
              setNgayGhiNhan={setNgayGhiNhan}
              ghiChu={ghiChu}
              setGhiChu={setGhiChu}
              isAutoImport={isAutoImport}
              setIsAutoImport={setIsAutoImport}
            />

            <div className="flex justify-end mt-6">
              <Button type="primary" className="bg-[#009999]" onClick={handleSubmitAffidavit}>
                Lưu Thông Tin
              </Button>
            </div>
          </div>
        )}
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

export default GCN_NH_CAMDetail;
