import React from "react";
import dayjs from "dayjs";
import { DatePicker, Input, Checkbox, Button, Radio } from "antd";
import { useNavigate } from "react-router-dom";
import "dayjs/locale/vi";

const { TextArea } = Input;

const FormSuaDoi = ({
  isEditOnly,
  ngayYeuCau,
  setNgayYeuCau,
  lanSuaDoi,
  setLanSuaDoi,
  suaDoiDaiDien,
  setSuaDoiDaiDien,
  ndSuaDoiDaiDien,
  setNdSuaDoiDaiDien,
  suaDoiTenChuDon,
  setSuaDoiTenChuDon,
  ndSuaDoiTenChuDon,
  setNdSuaDoiTenChuDon,
  suaDoiDiaChi,
  setSuaDoiDiaChi,
  ndSuaDoiDiaChi,
  setNdSuaDoiDiaChi,
  suaNhan,
  setSuaNhan,
  ndSuaNhan,
  setNdSuaNhan,
  suaNhomSPDV,
  setSuaNhomSPDV,
  ndSuaNhomSPDV,
  setNdSuaNhomSPDV,
  moTaSuaDoi,
  setMoTaSuaDoi,
  ngayGhiNhanSuaDoi,
  setNgayGhiNhanSuaDoi,
  duocGhiNhanSuaDoi,
  setDuocGhiNhanSuaDoi,
  soDonSD,
  setSoDonSD,
  maDonDangKyGoc,
  trangThaiDuyet = 0,
  setTrangThaiDuyet,
  ngayTuChoi,
  setNgayTuChoi,
  lyDoTuChoi,
  setLyDoTuChoi,
}) => {
  const navigate = useNavigate();

  // helper: render checkbox + ô nhập ND
  const renderSuaDoiItem = (label, checked, setChecked, value, setValue) => (
    <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
      <div className="flex items-start gap-2">
        <Checkbox
          checked={checked || false}
          onChange={(e) => setChecked(e.target.checked)}
          className="!m-0"
          disabled={isEditOnly}
        />
        <span className="font-medium">{label}</span>
      </div>

      {checked && (
        <Input.TextArea
          rows={2}
          placeholder={`Nhập nội dung sửa đổi ${label.toLowerCase()}`}
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
          disabled={isEditOnly}
        />
      )}
    </div>
  );

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-blue-700 uppercase">
          📌 Thông tin đơn sửa đổi
        </h3>

        {/* ✅ Nếu có mã đơn gốc thì hiển thị nút chuyển */}
        {maDonDangKyGoc && (
          <Button
            type="link"
            onClick={() => navigate(`/applicationdetail/${maDonDangKyGoc}`)}
          >
            Xem đơn gốc ({maDonDangKyGoc})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Số đơn */}
        <div>
          <label className="block text-gray-700 text-left">Số sửa đổi</label>
          <Input
            value={soDonSD}
            onChange={(e) => setSoDonSD(e.target.value)}
            placeholder="Nhập số đơn"
          />
        </div>

        {/* Ngày yêu cầu */}
        <div>
          <label className="block text-gray-700 text-left">Ngày nộp sửa đổi</label>
          <DatePicker
            value={ngayYeuCau ? dayjs(ngayYeuCau) : null}
            onChange={(date) =>
              setNgayYeuCau(date ? date.format("YYYY-MM-DD") : null)
            }
            format="DD/MM/YYYY"
            className="w-full"
          />
        </div>

        {/* Lần sửa đổi */}
        <div>
          <label className="block text-gray-700 text-left">Lần sửa đổi</label>
          <Input
            type="number"
            value={lanSuaDoi || ""}
            onChange={(e) => setLanSuaDoi(e.target.value)}
            placeholder="Nhập số lần sửa đổi"
          />
        </div>
      </div>

      {/* Các phần sửa đổi */}
      <div className="mt-4 space-y-3">
        {renderSuaDoiItem("Đại diện", suaDoiDaiDien, setSuaDoiDaiDien, ndSuaDoiDaiDien, setNdSuaDoiDaiDien)}
        {renderSuaDoiItem("Tên chủ đơn", suaDoiTenChuDon, setSuaDoiTenChuDon, ndSuaDoiTenChuDon, setNdSuaDoiTenChuDon)}
        {renderSuaDoiItem("Địa chỉ", suaDoiDiaChi, setSuaDoiDiaChi, ndSuaDoiDiaChi, setNdSuaDoiDiaChi)}
        {renderSuaDoiItem("Nhãn", suaNhan, setSuaNhan, ndSuaNhan, setNdSuaNhan)}
        {renderSuaDoiItem("Nhóm SP/DV", suaNhomSPDV, setSuaNhomSPDV, ndSuaNhomSPDV, setNdSuaNhomSPDV)}
      </div>

      {/* Trạng thái xét duyệt của Cục SHTT */}
      <div className="mt-4 p-4 rounded-lg border border-blue-200 bg-blue-50/40 space-y-3">
        <label className="block font-semibold text-gray-800 text-left">
          Trạng thái xét duyệt tờ khai sửa đổi của Cục SHTT
        </label>
        <Radio.Group
          value={
            typeof setTrangThaiDuyet === "function"
              ? Number(trangThaiDuyet ?? (duocGhiNhanSuaDoi ? 1 : 0))
              : duocGhiNhanSuaDoi
              ? 1
              : 0
          }
          onChange={(e) => {
            const val = Number(e.target.value);
            if (typeof setTrangThaiDuyet === "function") {
              setTrangThaiDuyet(val);
            }
            if (typeof setDuocGhiNhanSuaDoi === "function") {
              setDuocGhiNhanSuaDoi(val === 1);
            }
          }}
          disabled={isEditOnly}
          className="flex flex-wrap gap-4"
        >
          <Radio value={0}>⏳ Chưa chấp thuận</Radio>
          <Radio value={1}>✅ Được chấp thuận</Radio>
          <Radio value={2}>❌ Từ chối</Radio>
        </Radio.Group>

        {((typeof setTrangThaiDuyet === "function" ? Number(trangThaiDuyet) === 1 : duocGhiNhanSuaDoi)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-gray-700 text-left">
                Ngày ghi nhận sửa đổi
              </label>
              <DatePicker
                value={ngayGhiNhanSuaDoi ? dayjs(ngayGhiNhanSuaDoi) : null}
                onChange={(date) =>
                  setNgayGhiNhanSuaDoi(date ? date.format("YYYY-MM-DD") : null)
                }
                format="DD/MM/YYYY"
                className="w-full"
                disabled={isEditOnly}
              />
            </div>
          </div>
        )}

        {typeof setTrangThaiDuyet === "function" && Number(trangThaiDuyet) === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {typeof setNgayTuChoi === "function" && (
              <div>
                <label className="block text-gray-700 text-left">Ngày Cục từ chối</label>
                <DatePicker
                  value={ngayTuChoi ? dayjs(ngayTuChoi) : null}
                  onChange={(date) =>
                    setNgayTuChoi(date ? date.format("YYYY-MM-DD") : null)
                  }
                  format="DD/MM/YYYY"
                  className="w-full"
                  disabled={isEditOnly}
                />
              </div>
            )}
            {typeof setLyDoTuChoi === "function" && (
              <div>
                <label className="block text-gray-700 text-left">Lý do từ chối</label>
                <Input
                  value={lyDoTuChoi || ""}
                  onChange={(e) => setLyDoTuChoi(e.target.value)}
                  placeholder="Nhập lý do Cục từ chối sửa đổi"
                  disabled={isEditOnly}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ghi chú */}
      <div className="mt-4">
        <label className="block text-gray-700 text-left">Ghi chú / mô tả</label>
        <TextArea
          rows={4}
          value={moTaSuaDoi}
          onChange={(e) => setMoTaSuaDoi(e.target.value)}
          placeholder="Nhập ghi chú về đơn sửa đổi"
        />
      </div>
    </div>
  );
};

export default FormSuaDoi;
