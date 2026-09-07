import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin } from "antd";
import callAPI from "../../utils/api";

const statusMap = { DRAFT: "Nháp", SUBMITTED: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối", LOCKED: "Đã chốt" };
const money = (value) => Number(value || 0).toLocaleString("vi-VN");

export default function TimesheetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    callAPI({ method: "post", endpoint: "/timesheet/detail", data: { id } })
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  return <Spin spinning={loading}><div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Chi tiết Timesheet</h2>
    {item && <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
      <Info label="Ngày làm việc" value={item.workDate} />
      <Info label="Mã hồ sơ" value={item.caseCode} />
      <Info label="Nhân sự" value={`${item.employee?.hoTen || "-"} (${item.employeeCode})`} />
      <Info label="Phòng ban" value={item.employee?.phongBan} />
      <Info label="Hoạt động" value={item.activity} />
      <Info label="Số giờ" value={Number(item.hours || 0)} />
      <Info label="Đơn giá/giờ" value={money(item.hourlyRate)} />
      <Info label="Thành tiền" value={money(item.totalAmount)} />
      <Info label="Trạng thái" value={statusMap[item.status] || item.status} />
      <Info label="Người duyệt" value={item.approvedBy || "-"} />
      <Info label="Thời điểm duyệt" value={item.approvedAt || "-"} />
      <Info label="Mô tả công việc" value={item.description || "-"} />
      <Info label="Ghi chú" value={item.notes || "-"} />
      {item.rejectionReason && <Info label="Lý do từ chối" value={item.rejectionReason} />}
    </div>}
    <div className="flex justify-center gap-4 mt-8"><button onClick={() => navigate(-1)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">Quay lại</button></div>
  </div></Spin>;
}
function Info({ label, value }) { return <div><p className="text-sm text-gray-500">{label}</p><p className="font-medium text-gray-800">{value || "-"}</p></div>; }
