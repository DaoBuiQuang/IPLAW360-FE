import React from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";

const FormTachDon = ({
  soDonTD,
  setSoDonTD,
  dsNhomSPDV,
  setDsNhomSPDV,
  ndTachDon,
  setNdTachDon,
  moTa,
  setMoTa,
  ngayYeuCauTD,
  setNgayYeuCauTD,
  ngayGhiNhanTD,
  setNgayGhiNhanTD,
  lanTachDon,
  setLanTachDon,
}) => {
  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-blue-700 mb-2 uppercase">
        📌 Thông tin đơn tách
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Số đơn tách */}
        <div className="flex-1">
          <label className="block text-gray-700 text-left">Số đơn tách *</label>
          <input
            type="text"
            value={soDonTD}
            onChange={(e) => setSoDonTD(e.target.value)}
            className="w-full p-2 mt-1 border rounded-lg text-input"
            placeholder="Nhập số đơn tách"
          />
        </div>

        {/* Ngày nộp đơn tách — GIỮ DatePicker */}
        <div className="flex-1">
          <label className="block text-gray-700 text-left">Ngày yêu cầu tách đơn *</label>
          <DatePicker
            value={ngayYeuCauTD ? dayjs(ngayYeuCauTD) : null}
            onChange={(date) =>
              setNgayYeuCauTD(date ? date.format("YYYY-MM-DD") : null)
            }
            format="DD/MM/YYYY"
            className="mt-1 w-full"
          />
        </div>

        {/* Lần tách */}
        <div className="flex-1">
          <label className="block text-gray-700 text-left">Lần tách *</label>
          <input
            type="number"
            min={0}
            value={lanTachDon}
            onChange={(e) => setLanTachDon(e.target.value)}
            className="w-full p-2 mt-1 border rounded-lg text-input"
            placeholder="VD: 1"
          />
        </div>

        {/* Ngày ghi nhận — GIỮ DatePicker */}
        <div className="flex-1">
          <label className="block text-gray-700 text-left">Ngày ghi nhận tách đơn</label>
          <DatePicker
            value={ngayGhiNhanTD ? dayjs(ngayGhiNhanTD) : null}
            onChange={(date) =>
              setNgayGhiNhanTD(date ? date.format("YYYY-MM-DD") : null)
            }
            format="DD/MM/YYYY"
            className="mt-1 w-full"
          />
        </div>

        {/* Nhóm SPDV */}
        <div className="flex-1 col-span-2">
          <label className="block text-gray-700 text-left">
            Danh sách nhóm SPDV * (VD: 01, 05, 35)
          </label>
          <input
            type="text"
            value={dsNhomSPDV}
            onChange={(e) => setDsNhomSPDV(e.target.value)}
            className="w-full p-2 mt-1 border rounded-lg text-input"
            placeholder="01, 05, 35"
          />
        </div>

        {/* Nội dung tách đơn */}
        <div className="flex-1 col-span-2">
          <label className="block text-gray-700 text-left">Nội dung tách đơn</label>
          <textarea
            rows="4"
            value={ndTachDon}
            onChange={(e) => setNdTachDon(e.target.value)}
            className="w-full p-2 mt-1 border rounded-lg text-input"
            placeholder="Nhập nội dung tách đơn"
          />
        </div>

        {/* Mô tả */}
        <div className="flex-1 col-span-2">
          <label className="block text-gray-700 text-left">Mô tả</label>
          <textarea
            rows="4"
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            className="w-full p-2 mt-1 border rounded-lg text-input"
            placeholder="Nhập mô tả thêm"
          />
        </div>

      </div>
    </div>
  );
};

export default FormTachDon;
