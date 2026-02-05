import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Spin } from "antd";

const Dashboard = () => {
  const [statusChartData, setStatusChartData] = useState([]);
  const [hanXuLyChartData, setHanXuLyChartData] = useState([]);
  const [countryChartData, setCountryChartData] = useState([]);
  const [partnerChartData, setPartnerChartData] = useState([]);
  const [partnerByCountryData, setPartnerByCountryData] = useState([]);
  const [caseByCountryData, setCaseByCountryData] = useState([]);
  const [caseByPartnerData, setCaseByPartnerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJSON = async (url) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Fetch error: ${url}`);
      return await res.json();
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const apiBase = process.env.REACT_APP_API_URL;

        const [
          statusRes,
          hanXuLyRes,
          countryRes,
          partnerRes,
          partnerByCountryRes,
          caseByCountryRes,
          caseByPartnerRes
        ] = await Promise.all([
          fetchJSON(`${apiBase}/application/statistics-by-status`),
          fetchJSON(`${apiBase}/application/statistics-by-han-xu-ly`),
          fetchJSON(`${apiBase}/customer/customer-count-by-country`),
          fetchJSON(`${apiBase}/customer/customer-count-by-partner`),
          fetchJSON(`${apiBase}/customer/partner-count-by-country`),
          fetchJSON(`${apiBase}/customer/case-count-by-country`),
          fetchJSON(`${apiBase}/customer/case-count-by-partner`)
        ]);

        // Format dữ liệu
        setStatusChartData(statusRes.map(item => ({ name: item.trangThaiDon, value: item.count })));

        const labelMap = {
          under7Days: "< 7 ngày",
          under30Days: "< 30 ngày",
          overdue: "Quá hạn",
          over30Days: "> 30 ngày"
        };
        setHanXuLyChartData(Object.entries(hanXuLyRes).map(([k, v]) => ({ name: labelMap[k] || k, value: v })));

        setCountryChartData(countryRes.map(item => ({ name: item.tenQuocGia || item.maQuocGia || "Không rõ", value: item.count })));

        setPartnerChartData(partnerRes.map(item => ({ name: item.tenDoiTac || item.maDoiTac || "Không rõ", value: item.count })));

        setPartnerByCountryData(partnerByCountryRes.map(item => ({ name: item.tenQuocGia || item.maQuocGia || "Không rõ", value: item.count })));

        setCaseByCountryData(caseByCountryRes.map(item => ({ name: item.tenQuocGia || item.maQuocGia || "Không rõ", value: item.count })));

        setCaseByPartnerData(caseByPartnerRes.map(item => ({ name: item.tenDoiTac || item.maDoiTac || "Không rõ", value: item.count })));
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ----- Chart Options -----
  const pieOption = {
    title: { text: "📌 Trạng thái đơn", left: "center" },
    tooltip: { trigger: "item" },
    legend: { bottom: 10, left: "center" },
    series: [
      {
        name: "Số lượng",
        type: "pie",
        radius: "55%",
        data: statusChartData,
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" }
        }
      }
    ]
  };

  const barOption = {
    title: { text: "📅 Hạn xử lý", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: hanXuLyChartData.map(item => item.name)
    },
    yAxis: { type: "value" },
    series: [
      {
        data: hanXuLyChartData.map(item => item.value),
        type: "bar",
        itemStyle: { color: "#3398DB" }
      }
    ]
  };

  const pieChart = (title, data, name) => ({
    title: { text: title, left: "center" },
    tooltip: { trigger: "item" },
    legend: { bottom: 10, left: "center" },
    series: [
      {
        name,
        type: "pie",
        radius: "55%",
        data,
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" }
        }
      }
    ]
  });

  return (
    <div className="bg-white p-8">
      <h2 className="text-2xl font-semibold mb-6">📊 Dashboard Thống Kê</h2>
      <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
        <div className="flex flex-wrap justify-around gap-8">
          <div className="w-[45%] min-w-[300px] h-[400px]"><ReactECharts option={pieOption} style={{ height: "100%" }} /></div>
          <div className="w-[45%] min-w-[300px] h-[400px]"><ReactECharts option={barOption} style={{ height: "100%" }} /></div>
          <div className="w-[45%] min-w-[300px] h-[400px]"><ReactECharts option={pieChart("🌍 Khách hàng theo quốc gia", countryChartData, "Số khách hàng")} style={{ height: "100%" }} /></div>
          <div className="w-[45%] min-w-[300px] h-[400px]"><ReactECharts option={pieChart("🤝 Khách hàng theo đối tác", partnerChartData, "Số khách hàng")} style={{ height: "100%" }} /></div>
          <div className="w-[45%] min-w-[300px] h-[400px]"><ReactECharts option={pieChart("🌐 Đối tác theo quốc gia", partnerByCountryData, "Số đối tác")} style={{ height: "100%" }} /></div>
          <div className="w-[45%] min-w-[300px] h-[400px]"><ReactECharts option={pieChart("📁 Hồ sơ theo quốc gia", caseByCountryData, "Số hồ sơ")} style={{ height: "100%" }} /></div>
          <div className="w-[45%] min-w-[300px] h-[400px]"><ReactECharts option={pieChart("📁 Hồ sơ theo đối tác", caseByPartnerData, "Số hồ sơ")} style={{ height: "100%" }} /></div>
        </div>
      </Spin>
    </div>
  );
};

export default Dashboard;
