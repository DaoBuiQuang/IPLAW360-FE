import React from "react";
import { Steps } from "antd";
// import "./DonProgress.css"; // Nếu có CSS tùy chỉnh

const { Step } = Steps;

const steps = [
  "Nộp đơn",
 
  "Thẩm định hình thức",
  "Công bố đơn",
  "Thẩm định nội dung",
  "Hoàn tất nhận bằng",
  "Gửi bằng cho khách hàng",
  "Đơn đăng ký hoàn tất",
];

const DonProgress = ({ trangThaiDon }) => {
  const currentIndex = steps.indexOf(trangThaiDon);

  return (
    <div className="text-xs mt-0 mb-auto p-0 don-progress"
        style={{ marginTop: 16 }}
    >
      <Steps
        direction="vertical" // 👉 Đổi từ horizontal sang vertical
        size="small"
        current={currentIndex !== -1 ? currentIndex : 0}
      >
        {steps.map((step, index) => (
          <Step
            key={index}
            title={
              <span className="text-xs break-words text-left leading-tight">
                {step}
              </span>
            }
          />
        ))}
      </Steps>
    </div>
  );
};

export default DonProgress;
