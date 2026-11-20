import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin } from "antd";
import callAPI from "../../utils/api";
import DocumentSection from "../../components/UpdateDocument/DocumentSection";
import FormSuaDoi from "../../components/commom/FormSuaDoi.js";
import { showSuccess, showError } from "../../components/commom/Notification";

const parseObj = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

function Application_SD_NH_VNEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [origStatus, setOrigStatus] = useState(0);
  const [info, setInfo] = useState({});

  const [soDonSD, setSoDonSD] = useState("");
  const [ngayYeuCau, setNgayYeuCau] = useState(null);
  const [lanSuaDoi, setLanSuaDoi] = useState("");
  const [ngayGhiNhanSuaDoi, setNgayGhiNhanSuaDoi] = useState(null);
  const [duocGhiNhanSuaDoi, setDuocGhiNhanSuaDoi] = useState(false);
  const [trangThaiDuyet, setTrangThaiDuyet] = useState(0);
  const [ngayTuChoi, setNgayTuChoi] = useState(null);
  const [lyDoTuChoi, setLyDoTuChoi] = useState("");
  const [moTaSuaDoi, setMoTaSuaDoi] = useState("");
  const [suaDoiDaiDien, setSuaDoiDaiDien] = useState(false);
  const [ndSuaDoiDaiDien, setNdSuaDoiDaiDien] = useState("");
  const [suaDoiTenChuDon, setSuaDoiTenChuDon] = useState(false);
  const [ndSuaDoiTenChuDon, setNdSuaDoiTenChuDon] = useState("");
  const [suaDoiDiaChi, setSuaDoiDiaChi] = useState(false);
  const [ndSuaDoiDiaChi, setNdSuaDoiDiaChi] = useState("");
  const [suaNhan, setSuaNhan] = useState(false);
  const [ndSuaNhan, setNdSuaNhan] = useState("");
  const [suaNhomSPDV, setSuaNhomSPDV] = useState(false);
  const [ndSuaNhomSPDV, setNdSuaNhomSPDV] = useState("");
  const [suaDoiNoiDungKhac, setSuaDoiNoiDungKhac] = useState(false);
  const [ndSuaDoiNoiDungKhac, setNdSuaDoiNoiDungKhac] = useState("");
  const [taiLieuSD, setTaiLieuSD] = useState([]);
  const [giayUyQuyenGoc, setGiayUyQuyenGoc] = useState(true);
  const [maUyQuyen, setMaUyQuyen] = useState(null);
  const [idGUQ, setIdGUQ] = useState(null);
  const [idKhachHang, setIdKhachHang] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r = await callAPI({
          method: "post",
          endpoint: "/application_sd_nh_vn/detail",
          data: { id: Number(id) },
        });
        const dl = parseObj(r.duLieuThayDoi);
        const st = Number(r.trangThaiDuyet ?? 0);
        setInfo({
          soDonGoc: r.donGoc?.soDon,
          maDonDangKyGoc: r.maDonDangKyGoc,
          maHoSoVuViec: r.donGoc?.maHoSoVuViec || r.donGoc?.maHoSo,
        });
        setOrigStatus(st);
        setTrangThaiDuyet(st);
        setSoDonSD(r.soDonSD || r.soDon || "");
        setNgayYeuCau(r.ngayYeuCau || null);
        setLanSuaDoi(r.lanSuaDoi || "");
        setNgayGhiNhanSuaDoi(st === 1 ? r.ngayGhiNhanSuaDoi || r.ngayChapThuan : null);
        setDuocGhiNhanSuaDoi(st === 1);
        setNgayTuChoi(r.ngayTuChoi || null);
        setLyDoTuChoi(r.lyDoTuChoi || "");
        setMoTaSuaDoi(r.moTa || "");
        setSuaDoiDaiDien(Boolean(r.suaDoiDaiDien));
        setNdSuaDoiDaiDien(r.ndSuaDoiDaiDien || "");
        setSuaDoiTenChuDon(Boolean(r.suaDoiTenChuDon));
        setNdSuaDoiTenChuDon(r.ndSuaDoiTenChuDon || "");
        setSuaDoiDiaChi(Boolean(r.suaDoiDiaChi));
        setNdSuaDoiDiaChi(r.ndSuaDoiDiaChi || "");
        setSuaNhan(Boolean(r.suaNhan));
        setNdSuaNhan(r.ndSuaNhan || "");
        setSuaNhomSPDV(Boolean(r.suaNhomSPDV));
        setNdSuaNhomSPDV(r.ndSuaNhomSPDV || "");
        setSuaDoiNoiDungKhac(Boolean(r.suaDoiNoiDungKhac));
        setNdSuaDoiNoiDungKhac(r.ndSuaDoiNoiDungKhac || dl.ndSuaDoiNoiDungKhac || "");
        setTaiLieuSD(
          Array.isArray(r.taiLieuSuaDoi)
            ? r.taiLieuSuaDoi
            : Array.isArray(dl.taiLieuSuaDoi)
            ? dl.taiLieuSuaDoi
            : []
        );
        setGiayUyQuyenGoc(r.giayUyQuyenGoc ?? dl.giayUyQuyenGoc ?? true);
        setMaUyQuyen(r.maUyQuyen ?? dl.maUyQuyen ?? null);
        setIdGUQ(r.idGUQ ?? dl.idGUQ ?? null);
        setIdKhachHang(r.donGoc?.idKhachHang || null);
      } catch (e) {
        showError("Thất bại", "Không tải được thông tin tờ khai sửa đổi.", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const locked = origStatus === 1;

  const handleSubmit = async () => {
    if (!locked) {
      const hasAnyAmendment = Boolean(
        suaDoiDaiDien ||
        suaDoiTenChuDon ||
        suaDoiDiaChi ||
        suaNhan ||
        suaNhomSPDV ||
        suaDoiNoiDungKhac
      );
      if (!hasAnyAmendment) {
        showError("Thiếu thông tin!", "Vui lòng chọn ít nhất một mục cần sửa đổi.");
        return;
      }
    }
    try {
      const data = {
        id: Number(id),
        soDonSD: Number(trangThaiDuyet) === 2 ? null : (soDonSD?.trim() || null),
        ngayYeuCau,
        moTaSuaDoi,
        taiLieuSuaDoi: taiLieuSD,
      };

      if (!locked) {
        Object.assign(data, {
          lanSuaDoi: lanSuaDoi ? Number(lanSuaDoi) : undefined,
          suaDoiDaiDien,
          ndSuaDoiDaiDien,
          suaDoiTenChuDon,
          ndSuaDoiTenChuDon,
          suaDoiDiaChi,
          ndSuaDoiDiaChi,
          suaNhan,
          ndSuaNhan,
          suaNhomSPDV,
          ndSuaNhomSPDV,
          suaDoiNoiDungKhac,
          ndSuaDoiNoiDungKhac,
          giayUyQuyenGoc,
          maUyQuyen,
          idGUQ,
        });
      }

      if (Number(trangThaiDuyet) !== origStatus) {
        const s = Number(trangThaiDuyet);
        Object.assign(data, {
          trangThaiDuyet: s,
          duocGhiNhanSuaDoi: s === 1,
          ngayChapThuan: s === 1 ? ngayGhiNhanSuaDoi : null,
          ngayGhiNhanSuaDoi: s === 1 ? ngayGhiNhanSuaDoi : null,
          ngayTuChoi: s === 2 ? ngayTuChoi : null,
          lyDoTuChoi: s === 2 ? lyDoTuChoi : null,
        });
      } else if (locked) {
        data.ngayGhiNhanSuaDoi = ngayGhiNhanSuaDoi;
      }

      await callAPI({ method: "post", endpoint: "/application_sd_nh_vn/update", data });
      await showSuccess("Thành công!", "Cập nhật tờ khai sửa đổi thành công!");
      navigate(`/application_sd_nh_vn_detail/${id}`);
    } catch (e) {
      showError("Thất bại!", "Đã xảy ra lỗi khi lưu tờ khai sửa đổi.", e);
    }
  };

  return (
    <div className="p-2 bg-gray-100 min-h-screen flex items-start justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700 uppercase">
            📝 Chỉnh sửa tờ khai sửa đổi nhãn hiệu
          </h2>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
            alt="Cờ Việt Nam"
            className="w-16 h-11 rounded shadow-sm object-cover"
          />
        </div>

        <div className="text-left text-sm mb-3 p-3 bg-gray-50 rounded border flex flex-wrap gap-6">
          <div>
            Đơn được sửa đổi:{" "}
            <b className="text-indigo-600">{info.soDonGoc || info.maDonDangKyGoc || "—"}</b>
          </div>
          {info.maHoSoVuViec && (
            <div>
              Mã hồ sơ: <b>{info.maHoSoVuViec}</b>
            </div>
          )}
        </div>

        {locked && (
          <div className="mb-4 p-3 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm text-left">
            Tờ khai đã được chấp thuận nên phần nội dung sửa đổi cốt lõi đang được khóa để đảm bảo toàn vẹn với đơn sau sửa đổi. Nếu muốn sửa nội dung, hãy chuyển trạng thái về “Chưa chấp thuận” ở trang chi tiết trước.
          </div>
        )}

        <Spin spinning={loading} tip="Đang tải..." size="large">
          <FormSuaDoi
            isEditOnly={locked}
            ngayYeuCau={ngayYeuCau}
            setNgayYeuCau={setNgayYeuCau}
            lanSuaDoi={lanSuaDoi}
            setLanSuaDoi={setLanSuaDoi}
            soDonSD={soDonSD}
            setSoDonSD={setSoDonSD}
            ngayGhiNhanSuaDoi={ngayGhiNhanSuaDoi}
            setNgayGhiNhanSuaDoi={setNgayGhiNhanSuaDoi}
            duocGhiNhanSuaDoi={duocGhiNhanSuaDoi}
            setDuocGhiNhanSuaDoi={setDuocGhiNhanSuaDoi}
            trangThaiDuyet={trangThaiDuyet}
            setTrangThaiDuyet={setTrangThaiDuyet}
            ngayTuChoi={ngayTuChoi}
            setNgayTuChoi={setNgayTuChoi}
            lyDoTuChoi={lyDoTuChoi}
            setLyDoTuChoi={setLyDoTuChoi}
            moTaSuaDoi={moTaSuaDoi}
            setMoTaSuaDoi={setMoTaSuaDoi}
            suaDoiDaiDien={suaDoiDaiDien}
            setSuaDoiDaiDien={setSuaDoiDaiDien}
            ndSuaDoiDaiDien={ndSuaDoiDaiDien}
            setNdSuaDoiDaiDien={setNdSuaDoiDaiDien}
            suaDoiTenChuDon={suaDoiTenChuDon}
            setSuaDoiTenChuDon={setSuaDoiTenChuDon}
            ndSuaDoiTenChuDon={ndSuaDoiTenChuDon}
            setNdSuaDoiTenChuDon={setNdSuaDoiTenChuDon}
            suaDoiDiaChi={suaDoiDiaChi}
            setSuaDoiDiaChi={setSuaDoiDiaChi}
            ndSuaDoiDiaChi={ndSuaDoiDiaChi}
            setNdSuaDoiDiaChi={setNdSuaDoiDiaChi}
            suaNhan={suaNhan}
            setSuaNhan={setSuaNhan}
            ndSuaNhan={ndSuaNhan}
            setNdSuaNhan={setNdSuaNhan}
            suaNhomSPDV={suaNhomSPDV}
            setSuaNhomSPDV={setSuaNhomSPDV}
            ndSuaNhomSPDV={ndSuaNhomSPDV}
            setNdSuaNhomSPDV={setNdSuaNhomSPDV}
            suaDoiNoiDungKhac={suaDoiNoiDungKhac}
            setSuaDoiNoiDungKhac={setSuaDoiNoiDungKhac}
            ndSuaDoiNoiDungKhac={ndSuaDoiNoiDungKhac}
            setNdSuaDoiNoiDungKhac={setNdSuaDoiNoiDungKhac}
          />

          <DocumentSection
            onTaiLieuChange={setTaiLieuSD}
            initialTaiLieus={taiLieuSD}
            giayUyQuyenGoc={giayUyQuyenGoc}
            setGiayUyQuyenGoc={setGiayUyQuyenGoc}
            maUyQuyen={maUyQuyen}
            setMaUyQuyen={setMaUyQuyen}
            idGUQ={idGUQ}
            setIdGUQ={setIdGUQ}
            idKhachHang={idKhachHang}
            isViewOnly={locked}
          />
        </Spin>

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Lưu thông tin
          </button>
        </div>
      </div>
    </div>
  );
}

export default Application_SD_NH_VNEdit;
