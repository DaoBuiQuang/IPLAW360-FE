import React, { useState } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";

export default function BillForm({ bills, setBills }) {
  // thêm bill rỗng
  const handleAddBill = () => {
    setBills([
      ...bills,
      {
        ngayGuiYeuCau: null,
        ngayTao: dayjs().format("YYYY-MM-DD"),
        qly: "",
        price: "",
        vat: "",
        total: "",
        noiDung: "",
        ghiChu: "",
      },
    ]);
  };

  // xóa bill
  const handleRemoveBill = (index) => {
    const newBills = bills.filter((_, i) => i !== index);
    setBills(newBills);
  };

  // cập nhật field của 1 bill
  const handleChange = (index, field, value) => {
    const newBills = [...bills];
    newBills[index][field] = value;
    // tính lại total nếu có price & vat
    if (field === "price" || field === "vat") {
      const price = parseFloat(newBills[index].price || 0);
      const vat = parseFloat(newBills[index].vat || 0);
      newBills[index].total = (price + (price * vat) / 100).toFixed(2);
    }
    setBills(newBills);
  };

  return (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">Danh sách Bill</h3>
        <button
          onClick={handleAddBill}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Thêm Bill
        </button>
      </div>

      {bills.length === 0 && (
        <p className="text-gray-500 text-sm">Chưa có Bill nào được thêm.</p>
      )}

      {bills.map((bill, index) => (
        <div
          key={index}
          className="mb-4 p-4 border rounded-lg bg-white shadow-sm relative"
        >
          <button
            onClick={() => handleRemoveBill(index)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          >
            X
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Ngày gửi yêu cầu</label>
              <DatePicker
                value={bill.ngayGuiYeuCau ? dayjs(bill.ngayGuiYeuCau) : null}
                onChange={(date) =>
                  handleChange(
                    index,
                    "ngayGuiYeuCau",
                    date ? date.format("YYYY-MM-DD") : null
                  )
                }
                format="DD/MM/YYYY"
                className="w-full mt-1"
              />
            </div>

            <div>
              <label className="block text-gray-700">Ngày tạo</label>
              <DatePicker
                value={bill.ngayTao ? dayjs(bill.ngayTao) : null}
                onChange={(date) =>
                  handleChange(
                    index,
                    "ngayTao",
                    date ? date.format("YYYY-MM-DD") : null
                  )
                }
                format="DD/MM/YYYY"
                className="w-full mt-1"
              />
            </div>

            <div>
              <label className="block text-gray-700">QLY</label>
              <input
                type="number"
                value={bill.qly}
                onChange={(e) =>
                  handleChange(index, "qly", e.target.value)
                }
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label className="block text-gray-700">Giá</label>
              <input
                type="number"
                value={bill.price}
                onChange={(e) =>
                  handleChange(index, "price", e.target.value)
                }
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label className="block text-gray-700">VAT (%)</label>
              <input
                type="number"
                value={bill.vat}
                onChange={(e) =>
                  handleChange(index, "vat", e.target.value)
                }
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label className="block text-gray-700">Tổng tiền</label>
              <input
                type="number"
                value={bill.total}
                readOnly
                className="w-full border rounded-lg p-2 mt-1 bg-gray-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700">Nội dung</label>
              <textarea
                value={bill.noiDung}
                onChange={(e) =>
                  handleChange(index, "noiDung", e.target.value)
                }
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700">Ghi chú</label>
              <textarea
                value={bill.ghiChu}
                onChange={(e) =>
                  handleChange(index, "ghiChu", e.target.value)
                }
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
