import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import ReactECharts from "echarts-for-react";

const DashboardPartner = () => {
  const [customerPartnerData, setCustomerPartnerData] = useState([]);
  const [casePartnerData, setCasePartnerData] = useState([]);
  const [loading, setLoading] = useState(true);

  const pieChart = (title, data, name) => ({
    title: { text: title, left: "center" },
    tooltip: { trigger: "item" },
    legend: { bottom: 10, left: "center" },
    series: [{
      name,
      type: "pie",
      radius: "55%",
      data
    }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiBase = process.env.REACT_APP_API_URL;

        const res = await Promise.all([
          fetch(`${apiBase}/customer/customer-count-by-partner`, { method: "POST", headers: { "Content-Type": "application/json" } }),
          fetch(`${apiBase}/customer/case-count-by-partner`, { method: "POST", headers: { "Content-Type": "application/json" } })
        ]);

        const data = await Promise.all(res.map(r => r.json()));

        setCustomerPartnerData(data[0].map(item => ({
          name: item.tenDoiTac || item.maDoiTac || "Không rõ",
          value: item.count
        })));
        setCasePartnerData(data[1].map(item => ({
          name: item.tenDoiTac || item.maDoiTac || "Không rõ",
          value: item.count
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white p-8">
      <h2 className="text-2xl font-semibold mb-6">🤝 Thống kê theo Đối tác</h2>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <div className="flex flex-wrap justify-around gap-8">
          <div className="w-[45%] h-[400px]">
            <ReactECharts option={pieChart("Khách hàng theo đối tác", customerPartnerData, "Khách hàng")} style={{ height: "100%" }} />
          </div>
          <div className="w-[45%] h-[400px]">
            <ReactECharts option={pieChart("Hồ sơ theo đối tác", casePartnerData, "Hồ sơ")} style={{ height: "100%" }} />
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default DashboardPartner;
