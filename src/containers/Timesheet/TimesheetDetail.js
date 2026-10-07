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

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/timesheet/mytime?tab=task");
    }
  };

  return <Spin spinning={loading}><div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Chi tiết Time record</h2>
    {item && <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
      <Info label="Ngày làm việc" value={item.workDate} />
      <Info label="Mã hồ sơ" value={item.caseCode} />
      <Info label="Quốc gia" value={item.countryCode ? `${item.countryCode}${item.countryName ? ` - ${item.countryName}` : ""}` : "-"} />
      <Info label="Đối tác" value={item.partnerCode ? `${item.partnerCode}${item.partnerName ? ` - ${item.partnerName}` : ""}` : "-"} />
      <Info label="Khách hàng" value={item.customerCode ? `${item.customerCode}${item.customerName ? ` - ${item.customerName}` : ""}` : "-"} />
      <Info label="Nhân sự" value={`${item.employee?.hoTen || "-"} (${item.employeeCode})`} />
      <Info label="Phòng ban" value={item.employee?.phongBan} />
      <Info label="Hoạt động" value={item.activity} />
      <Info label="Số giờ" value={Number(item.hours || 0)} />
      <Info label="Tỉ lệ đóng góp" value={`${Number(item.contributionPercentage ?? item.contributionRate ?? 100)}%`} />
      <Info label="Đơn giá/giờ" value={money(item.hourlyRate)} />
      <Info label="Thành tiền" value={money(item.totalAmount)} />
      <Info label="Trạng thái" value={statusMap[item.status] || item.status} />
      <Info label="Người duyệt" value={item.approvedBy || "-"} />
      <Info label="Thời điểm duyệt" value={item.approvedAt || "-"} />
      <Info label="Mô tả công việc" value={item.description || "-"} fullWidth />
      <Info label="Ghi chú" value={item.notes || "-"} fullWidth />
      {item.rejectionReason && <Info label="Lý do từ chối" value={item.rejectionReason} fullWidth />}
    </div>}
    <div className="flex justify-center gap-4 mt-8">
      <button onClick={handleBack} className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg font-medium transition cursor-pointer">
        Quay lại
      </button>
    </div>
  </div></Spin>;
}

function Info({ label, value, fullWidth = false }) {
  return (
    <div className={`min-w-0 ${fullWidth ? "md:col-span-2" : ""}`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="font-medium text-gray-800 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
        {value || "-"}
      </div>
    </div>
  );
}
