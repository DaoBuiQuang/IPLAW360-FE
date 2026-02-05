import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import ReactECharts from "echarts-for-react";

const DashboardCountry = () => {
  const [countryData, setCountryData] = useState([]);
  const [partnerCountryData, setPartnerCountryData] = useState([]);
  const [caseCountryData, setCaseCountryData] = useState([]);
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
          fetch(`${apiBase}/customer/customer-count-by-country`, { method: "POST", headers: { "Content-Type": "application/json" } }),
          fetch(`${apiBase}/customer/partner-count-by-country`, { method: "POST", headers: { "Content-Type": "application/json" } }),
          fetch(`${apiBase}/customer/case-count-by-country`, { method: "POST", headers: { "Content-Type": "application/json" } })
        ]);

        const data = await Promise.all(res.map(r => r.json()));

        setCountryData(data[0].map(item => ({
          name: item.tenQuocGia || item.maQuocGia || "Không rõ",
          value: item.count
        })));
        setPartnerCountryData(data[1].map(item => ({
          name: item.tenQuocGia || item.maQuocGia || "Không rõ",
          value: item.count
        })));
        setCaseCountryData(data[2].map(item => ({
          name: item.tenQuocGia || item.maQuocGia || "Không rõ",
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
      <h2 className="text-2xl font-semibold mb-6">🌍 Thống kê theo Quốc gia</h2>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <div className="flex flex-wrap justify-around gap-8">
          <div className="w-[45%] h-[400px]">
            <ReactECharts option={pieChart("Khách hàng theo quốc gia", countryData, "Khách hàng")} style={{ height: "100%" }} />
          </div>
          <div className="w-[45%] h-[400px]">
            <ReactECharts option={pieChart("Đối tác theo quốc gia", partnerCountryData, "Đối tác")} style={{ height: "100%" }} />
          </div>
          <div className="w-[45%] h-[400px]">
            <ReactECharts option={pieChart("Hồ sơ theo quốc gia", caseCountryData, "Hồ sơ")} style={{ height: "100%" }} />
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default DashboardCountry;
