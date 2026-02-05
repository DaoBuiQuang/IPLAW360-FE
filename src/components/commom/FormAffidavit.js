import React from "react";
import dayjs from "dayjs";
import { DatePicker, Input, InputNumber, Radio } from "antd";
import 'dayjs/locale/vi';

const FormAffidavit = ({
  idGCN_NH,
  setIdGCN_NH,
  lanNop,
  setLanNop,
  ngayNop,
  setNgayNop,
  ngayGhiNhan,
  setNgayGhiNhan,
  ghiChu,
  setGhiChu,
  soAffidavit,
  setSoAffidavit,
  isAutoImport,
  setIsAutoImport
}) => {
  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ID GCN_NH */}
         <div>
          <label className="block text-gray-700 text-left">Số Affidavit</label>
          <input
            
            value={soAffidavit || ""}
            onChange={(e) => setSoAffidavit(e.target.value)}
            placeholder="Nhập ID GCN_NH"
            className="w-full p-2 mt-1 border rounded-lg text-input h-10"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-left">Mã id giấy chứng nhận nhãn hiệu</label>
          <input
            value={idGCN_NH || ""}
            onChange={(e) => setIdGCN_NH(e.target.value)}
            placeholder="Nhập ID GCN_NH"
            className="w-full p-2 mt-1 border rounded-lg text-input h-10 "
            disabled
          />
        </div>

        {/* Lần nộp */}
        <div>
          <label className="block text-gray-700 text-left">Lần nộp</label>
          <input
            type="number"
            value={lanNop || 1}
            onChange={(e) => setLanNop(e.target.value)}
            className="w-full p-2 mt-1 border rounded-lg text-input h-10 "
            placeholder="Nhập số lần nộp"
          />
        </div>

        {/* Ngày nộp */}
        <div>
          <label className="block text-gray-700 text-left">Ngày nộp</label>
          <DatePicker
            value={ngayNop ? dayjs(ngayNop) : null}
            onChange={(date) =>
              setNgayNop(date && date.isValid() ? date.format("YYYY-MM-DD") : null)
            }
            format="DD/MM/YYYY"
            placeholder="Chọn ngày nộp"
            className="mt-1 w-full"
            disabledDate={(current) => current && current > dayjs().endOf("day")}
          />
        </div>

        {/* Ngày ghi nhận */}
        <div>
          <label className="block text-gray-700 text-left">Ngày ghi nhận</label>
          <DatePicker
            value={ngayGhiNhan ? dayjs(ngayGhiNhan) : null}
            onChange={(date) =>
              setNgayGhiNhan(date && date.isValid() ? date.format("YYYY-MM-DD") : null)
            }
            format="DD/MM/YYYY"
            placeholder="Chọn ngày ghi nhận"
            className="mt-1 w-full"
            disabledDate={(current) => current && current > dayjs().endOf("day")}
          />
        </div>

        {/* Ghi chú */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 text-left">Ghi chú</label>
          <Input.TextArea
            rows={3}
            value={ghiChu || ""}
            onChange={(e) => setGhiChu(e.target.value)}
            placeholder="Nhập ghi chú nếu có"
            className="mt-1 w-full"
          />
        </div>

        {/* Phân biệt nhập tay / tự động */}
      </div>
    </div>
  );
};

export default FormAffidavit;
