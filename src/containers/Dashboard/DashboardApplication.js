import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import ReactECharts from "echarts-for-react";

const DashboardApplications = () => {
  const [statusChartData, setStatusChartData] = useState([]);
  const [hanXuLyChartData, setHanXuLyChartData] = useState([]);
  const [hanTraLoiChartData, setHanTraLoiChartData] = useState([]);
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

        const [statusRes, hanXuLyRes, hanTraLoiRes] = await Promise.all([
          fetchJSON(`${apiBase}/application/statistics-by-status`),
          fetchJSON(`${apiBase}/application/statistics-by-han-xu-ly`),
          fetchJSON(`${apiBase}/application/statistics-by-han-tra-loi`)
        ]);

        setStatusChartData(statusRes.map(item => ({
          name: item.trangThaiDon,
          value: item.count
        })));

        const labelMap = {
          under7Days: "< 7 ngày",
          under30Days: "< 30 ngày",
          overdue: "Quá hạn",
          over30Days: "> 30 ngày"
        };

        setHanXuLyChartData(Object.entries(hanXuLyRes).map(([k, v]) => ({
          name: labelMap[k] || k,
          value: v
        })));

        setHanTraLoiChartData(Object.entries(hanTraLoiRes).map(([k, v]) => ({
          name: labelMap[k] || k,
          value: v
        })));
      } catch (err) {
        console.error("API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pieOption = {
    title: { text: "Trạng thái đơn", left: "center" },
    tooltip: { trigger: "item" },
    legend: { bottom: 10, left: "center" },
    series: [
      {
        name: "Số lượng",
        type: "pie",
        radius: "55%",
        data: statusChartData
      }
    ]
  };

  const barOption = {
    title: { text: "Hạn Cục xử lý", left: "center" },
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

  const barOption2 = {
    title: { text: "Hạn trả lời Cục", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: hanTraLoiChartData.map(item => item.name)
    },
    yAxis: { type: "value" },
    series: [
      {
        data: hanTraLoiChartData.map(item => item.value),
        type: "bar",
        itemStyle: { color: "#00AFAF" }
      }
    ]
  };

  return (
    <div className="bg-white p-8">
      <h2 className="text-2xl font-semibold mb-6">📊 Thống kê Đơn đăng ký</h2>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <div className="flex flex-wrap justify-around gap-8">
          <div className="w-[45%] min-w-[300px] h-[400px]">
            <ReactECharts option={pieOption} style={{ height: "100%" }} />
          </div>
          <div className="w-[45%] min-w-[300px] h-[400px]">
            <ReactECharts option={barOption} style={{ height: "100%" }} />
          </div>
          <div className="w-[45%] min-w-[300px] h-[400px]">
            <ReactECharts option={barOption2} style={{ height: "100%" }} />
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default DashboardApplications;
