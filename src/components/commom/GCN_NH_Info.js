import React from "react";

function GCN_NH_Info({ data }) {
  if (!data) return <div>Không có dữ liệu</div>;

  const renderRow = (label, value) => (
    <div className="flex mb-3">
      <span className="w-56 font-semibold text-gray-700 text-left">{label}:</span>
      <span className="text-gray-900">{value || "—"}</span>
    </div>
  );

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

        {data.anhBang && (
          <div className="text-center">
            <p className="font-semibold text-gray-700 mb-2">Ảnh bằng</p>
            <img
              src={data.anhBang}
              alt="Ảnh bằng GCN"
              className="max-h-64 rounded-lg border shadow-md"
            />
          </div>
        )}
      </div>

      {/* Thông tin chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {renderRow("Số bằng", data.soBang)}
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
        {renderRow("Ngày hết hạn", data.ngayHetHanBang)}
      </div>
    </div>
  );
}

export default GCN_NH_Info;
