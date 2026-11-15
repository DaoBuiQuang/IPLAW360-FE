import React from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

function GCN_NH_Info({ data }) {
  const navigate = useNavigate();
  if (!data) return <div>Không có dữ liệu</div>;

  const renderRow = (label, value) => (
    <div className="flex mb-3">
      <span className="w-56 font-semibold text-gray-700 text-left">{label}:</span>
      <span className="text-gray-900">{value || "—"}</span>
    </div>
  );

  const idGcnGoc = data.idGCN_NH_Goc || data.gcnCha?.id;
  const soBangGoc = data.soBangGoc || data.gcnCha?.soBang;
  const ngayCapGoc = data.ngayCapBangGoc || data.gcnCha?.ngayCapBang;
  const displayNgayHetHan =
    data.ngayHetHanBang ||
    (data.ngayNopDon && dayjs(data.ngayNopDon).isValid()
      ? dayjs(data.ngayNopDon).add(10, "year").format("YYYY-MM-DD")
      : null);

  const loaiBangText =
    Number(data.loaiBang) === 2
      ? "Đã sửa đổi"
      : Number(data.loaiBang) === 3 || Number(data.loaiBang) === 4
      ? "Đã chuyển nhượng"
      : "Bằng gốc";

  return (
    <div>
      {/* Ảnh thương hiệu */}
      <div className="flex flex-col items-center gap-6 mb-8">
        {data.linkAnh && (
          <div className="text-center">
            <p className="font-semibold text-gray-700 mb-2">Mẫu nhãn</p>
            <img
              src={data.linkAnh}
              alt="Logo nhãn hiệu"
              className="max-h-64 rounded-lg border shadow-md"
            />
          </div>
        )}

        {(data.anhBang || data.linkScan) && (
          <div className="text-center flex flex-col items-center">
            <p className="font-semibold text-gray-700 mb-2">Ảnh bằng (Scan)</p>
            <a
              href={data.anhBang || data.linkScan}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block group"
              title="Click để mở xem ảnh scan gốc trong tab mới"
            >
              <img
                src={data.anhBang || data.linkScan}
                alt="Ảnh bằng GCN"
                className="max-h-64 rounded-lg border shadow-md group-hover:opacity-90 transition cursor-pointer"
              />
              <span className="mt-2 inline-flex items-center gap-1 text-sm text-[#009999] hover:underline font-medium">
                🔗 Xem ảnh scan đầy đủ (tab mới)
              </span>
            </a>
          </div>
        )}
      </div>

      {/* Thông tin chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {renderRow("Số bằng", data.soBang)}
        <div className="flex mb-3 items-center">
          <span className="w-56 font-semibold text-gray-700 text-left">Loại bằng:</span>
          <div className="flex flex-wrap items-center gap-2">
            {data.dangSuaDoi && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                ⏳ Đang sửa đổi
              </span>
            )}
            {data.dangChuyenQuyen && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-300">
                ⏳ Đang chuyển quyền
              </span>
            )}
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {loaiBangText}
            </span>
          </div>
        </div>
        {(idGcnGoc || soBangGoc) && (
          <>
            <div className="flex mb-3">
              <span className="w-56 font-semibold text-gray-700 text-left">Số bằng gốc:</span>
              <span
                className="text-indigo-600 font-semibold cursor-pointer hover:underline"
                onClick={() => {
                  if (idGcnGoc) {
                    navigate(`/gcn_nhdetail/${idGcnGoc}`);
                    window.location.reload();
                  }
                }}
              >
                {soBangGoc || `#${idGcnGoc}`}
              </span>
            </div>
            {renderRow("Ngày cấp bằng gốc", ngayCapGoc)}
          </>
        )}
        {renderRow("Số đơn", data.soDon)}
        {renderRow("Mã hồ sơ", data.maHoSo)}
        {renderRow("Chủ đơn / Chủ bằng", data.tenKhachHang)}
        {renderRow("Địa chỉ", data.diaChiKhachHang)}
        {renderRow("Đại diện SHCN", data.tenDoiTac)}
        {renderRow("Tên nhãn hiệu", data.tenNhanHieu)}
        {renderRow("Danh sách nhóm SPDV", data.dsNhomSPDV)}
        {renderRow("Chi tiết nhóm SPDV", data.chiTietNhomSPDV)}
        {renderRow("Màu sắc nhãn hiệu", data.mauSacNH)}
        {renderRow("Ngày nộp đơn", data.ngayNopDon)}
        {renderRow("Ngày cấp bằng", data.ngayCapBang)}
        {renderRow("Ghi chú", data.ghiChu)}
        {renderRow("Ngày yêu cầu Affidavit", data?.hanNopTuyenThe)}
         {renderRow("Ngày yêu cầu gia hạn", data.hanGiaHan)}
        {renderRow("Ngày hết hạn", displayNgayHetHan)}
      </div>
    </div>
  );
}

export default GCN_NH_Info;
