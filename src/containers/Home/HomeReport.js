import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import callAPI from "../../utils/api";

/* ================== UI ATOMS ================== */

const KpiPill = ({ label, value, tone = "gray", onClick }) => {
  const toneMap = {
    red: "bg-red-50 text-red-700 border-red-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
    green: "bg-green-50 text-green-800 border-green-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const cls = `border rounded-lg px-2 py-1 ${toneMap[tone]} ${onClick ? "cursor-pointer hover:shadow-sm transition" : ""
    }`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        <div className="text-[11px] leading-4">{label}</div>
        <div className="text-base font-bold leading-5">{value ?? 0}</div>
      </button>
    );
  }

  return (
    <div className={cls}>
      <div className="text-[11px] leading-4">{label}</div>
      <div className="text-base font-bold leading-5">{value ?? 0}</div>
    </div>
  );
};

const ClickCard = ({ onClick, className = "", children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left w-full ${className} ${onClick ? "cursor-pointer hover:shadow-sm transition" : ""
      }`}
  >
    {children}
  </button>
);

const AssigneeTable = ({ title, items, onRowClick }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="font-semibold text-gray-800 mb-3">{title}</div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 font-semibold" style={{ color: "#000" }}>
              <th className="text-center px-3 py-2 border-b" style={{ color: "#000" }}>
                Nhân sự
              </th>
              <th className="text-center px-3 py-2 border-b" style={{ color: "#000" }}>
                Chưa HTTL
              </th>
              <th className="text-center px-3 py-2 border-b !text-black !opacity-100">
                Hạn Trả lời ≤ 15 ngày
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((it) => {
              const canClick = !!it.maNhanSu;

              return (
                <tr
                  key={it.maNhanSu || it.hoTen}
                  className={`hover:bg-gray-50 ${canClick ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                    }`}
                  onClick={() => canClick && onRowClick?.(it)}
                >
                  <td className="px-3 py-2 border-b">
                    <div className="font-medium text-gray-800">{it.hoTen}</div>
                    {it.phongBan && <div className="text-xs text-gray-500">{it.phongBan}</div>}
                  </td>

                  <td className="px-3 py-2 text-center border-b font-semibold text-red-600">
                    {it.chuaNopTaiLieu}
                  </td>

                  <td className="px-3 py-2 text-center border-b font-semibold text-orange-700">
                    {it.hanTraLoiDuoi15Ngay}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** DeadlineRow */
const DeadlineRow = ({ title, data, onClickBucket }) => {
  if (!data) return null;

  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0">
      <div className="text-sm font-semibold text-gray-800">{title}</div>

      <div className="grid grid-cols-4 gap-2">
        <KpiPill
          label="Quá hạn"
          value={data.overdue}
          tone="red"
          onClick={onClickBucket?.("overdue")}
        />
        <KpiPill label="7 ngày" value={data.d7} tone="orange" onClick={onClickBucket?.("<7")} />
        <KpiPill
          label="15 ngày"
          value={data.d15}
          tone="yellow"
          onClick={onClickBucket?.("<15")}
        />
        <KpiPill
          label="30 ngày"
          value={data.d30}
          tone="green"
          onClick={onClickBucket?.("<30")}
        />
      </div>
    </div>
  );
};

/** MonthMini: 3 tháng gần nhất */
const MonthMini = ({ items, onClick }) => {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  const pretty = (m) => {
    const [y, mm] = String(m).split("-");
    return `T${mm}/${y}`;
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => (
        <ClickCard
          key={it.month}
          onClick={onClick ? () => onClick(it) : undefined}
          className="rounded-lg border bg-gray-50 p-2"
        >
          <div className="text-[11px] text-gray-500">{pretty(it.month)}</div>

          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-[11px] text-gray-600">Đơn nộp </div>
            <div className="text-lg font-extrabold text-gray-800">{Number(it.total ?? 0)}</div>
          </div>

          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-[11px] text-gray-600">Chưa HTTL</div>
            <div className="text-base font-bold text-red-600">
              {Number(it.chuaHoanThanhTaiLieu ?? 0)}
            </div>
          </div>
        </ClickCard>
      ))}
    </div>
  );
};

/** ✅ YearMonthGrid: hiển thị danh sách tháng (FE cắt tới tháng hiện tại) */
const YearMonthGrid = ({ title, items, onClickMonth }) => {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  const pretty = (m) => {
    const [y, mm] = String(m).split("-");
    return `T${mm}/${y}`;
  };

  return (
    <div className="bg-white rounded-xl border p-3">
      <div className="text-sm font-semibold text-gray-800 mb-2">{title}</div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {items.map((it) => (
          <ClickCard
            key={it.month}
            onClick={onClickMonth ? () => onClickMonth(it) : undefined}
            className="rounded-lg border bg-gray-50 p-2"
          >
            <div className="text-[11px] text-gray-500">{pretty(it.month)}</div>

            <div className="mt-1 flex items-baseline justify-between">
              <div className="text-[11px] text-gray-600">Đơn nộp</div>
              <div className="text-lg font-extrabold text-gray-800">{Number(it.total ?? 0)}</div>
            </div>

            <div className="text-[10px] text-gray-400 mt-1">Bấm để xem</div>
          </ClickCard>
        ))}
      </div>
    </div>
  );
};

/** ✅ Year3Bar: 3 năm gần nhất */
const Year3Bar = ({ title, items, onClickYear }) => {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  const yearNow = new Date().getFullYear();

  const badgeCls = (y) => {
    if (y === yearNow) return "bg-blue-50 border-blue-200 text-blue-800";
    return "bg-gray-50 border-gray-200 text-gray-800";
  };

  return (
    <div className="bg-white rounded-xl border p-3">
      <div className="text-sm font-semibold text-gray-800 mb-2">{title}</div>

      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => (
          <ClickCard
            key={it.year}
            onClick={onClickYear ? () => onClickYear(it) : undefined}
            className={`rounded-lg border p-3 ${badgeCls(Number(it.year))}`}
          >
            <div className="text-xs opacity-70">Năm</div>
            <div className="text-lg font-bold">{it.year}</div>

            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-xs opacity-70">Đơn nộp</div>
              <div className="text-2xl font-extrabold">{Number(it.total ?? 0)}</div>
            </div>
          </ClickCard>
        ))}
      </div>
    </div>
  );
};


/* ================== MAIN DASHBOARD ================== */

function HomeReport() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const gotoApplicationList = (country, state = {}) => {
    const path = country === "KH" ? "/applicationlist_kh" : "/applicationlist";
    navigate(path, { state });
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await callAPI({
          method: "post",
          endpoint: "/deadline-dashboard",
        });
        setData(res?.data ?? res);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalDeadline = useMemo(() => {
    const safe = (x) => x ?? 0;

    const buckets = [
      data?.donDangKy?.VN?.hanTraLoi,
      data?.donDangKy?.VN?.hanXuLy,
      data?.donDangKy?.KH?.hanTraLoi,
      data?.donDangKy?.KH?.hanXuLy,
      data?.vanBang?.VN?.hanGiaHan,
      data?.vanBang?.KH?.hanNopTuyenThe,
      data?.vanBang?.KH?.hanGiaHan,
      data?.giayUyQuyen?.ngayHetHan,
    ].filter(Boolean);

    return buckets.reduce(
      (acc, b) => ({
        overdue: acc.overdue + safe(b?.overdue),
        d7: acc.d7 + safe(b?.d7),
        d15: acc.d15 + safe(b?.d15),
        d30: acc.d30 + safe(b?.d30),
      }),
      { overdue: 0, d7: 0, d15: 0, d30: 0 }
    );
  }, [data]);

  const vn = data?.donDangKy?.VN;
  const kh = data?.donDangKy?.KH;

  // ✅ Cắt list tháng năm nay tới THÁNG HIỆN TẠI (backend đang trả đủ 12 tháng)
  const filterUpToCurrentMonth = (items) => {
    if (!Array.isArray(items)) return [];
    const now = new Date();
    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return items.filter((x) => String(x.month) <= curKey);
  };

  const vnMonthsUpToNow = useMemo(
    () => filterUpToCurrentMonth(vn?.tongDonTheoThangNamNay),
    [vn?.tongDonTheoThangNamNay]
  );

  const khMonthsUpToNow = useMemo(
    () => filterUpToCurrentMonth(kh?.tongDonTheoThangNamNay),
    [kh?.tongDonTheoThangNamNay]
  );

  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const vnCurrentMonth = useMemo(() => {
    const found = vnMonthsUpToNow.find((x) => x.month === currentMonthKey);
    return found ?? { month: currentMonthKey, total: 0 };
  }, [vnMonthsUpToNow, currentMonthKey]);

  const khCurrentMonth = useMemo(() => {
    const found = khMonthsUpToNow.find((x) => x.month === currentMonthKey);
    return found ?? { month: currentMonthKey, total: 0 };
  }, [khMonthsUpToNow, currentMonthKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải dữ liệu thống kê...
      </div>
    );
  }

  /* ================== PRESETS ================== */

  const presetOutstandingDocs = (country) => ({
    preset: "OUTSTANDING_DOCS",
    selectedTrangThaiHTTL: 1,
    _fromDashboard: true,
    _country: country,
  });

  const presetDeadline = (country, typeKey, bucketValue) => ({
    preset: "DEADLINE_BUCKET",
    deadlineType: typeKey,
    bucket: bucketValue,
    _fromDashboard: true,
    _country: country,
  });

  const presetMonthOutstanding = (country, month) => ({
    preset: "MONTH_OUTSTANDING_DOCS",
    month,
    _fromDashboard: true,
    _country: country,
  });

  const presetMonthTotalSubmissions = (country, month) => ({
    preset: "MONTH_TOTAL_SUBMISSIONS",
    month,
    _fromDashboard: true,
    _country: country,
  });

  const presetYearTotalSubmissions = (country, year) => ({
    preset: "YEAR_TOTAL_SUBMISSIONS",
    year,
    _fromDashboard: true,
    _country: country,
  });

  return (
    <div className="bg-gray-50 min-h-screen p-6 space-y-6">
      {/* ================== HEADER SUMMARY (TỔNG) ================== */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">Tổng cảnh báo</h2>
          <div className="text-sm text-gray-500">Cập nhật theo thời gian thực</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ClickCard
            onClick={() => gotoApplicationList("VN", presetDeadline("VN", "hanXuLy", "overdue"))}
            className="rounded-xl p-6 bg-red-50 border border-red-200 flex flex-col justify-center min-h-[130px]"
          >
            <div className="text-sm font-semibold text-red-700">Quá hạn</div>
            <div className="text-5xl font-extrabold text-red-600 leading-none mt-2">
              {totalDeadline.overdue}
            </div>
          </ClickCard>

          <div className="rounded-xl p-4 bg-white border border-gray-200 min-h-[130px]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">Sắp hết hạn</div>
              <div className="text-xs text-gray-500">
                Tổng:{" "}
                <span className="font-semibold">
                  {(totalDeadline.d7 ?? 0) + (totalDeadline.d15 ?? 0) + (totalDeadline.d30 ?? 0)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <ClickCard
                onClick={() => gotoApplicationList("VN", presetDeadline("VN", "hanXuLy", "<7"))}
                className="rounded-lg p-3 bg-orange-50 border border-orange-200"
              >
                <div className="text-xs text-orange-700">Trong 7 ngày</div>
                <div className="text-3xl font-extrabold text-orange-600">{totalDeadline.d7}</div>
              </ClickCard>

              <ClickCard
                onClick={() => gotoApplicationList("VN", presetDeadline("VN", "hanXuLy", "<15"))}
                className="rounded-lg p-3 bg-yellow-50 border border-yellow-200"
              >
                <div className="text-xs text-yellow-800">Trong 15 ngày</div>
                <div className="text-3xl font-extrabold text-yellow-700">{totalDeadline.d15}</div>
              </ClickCard>

              <ClickCard
                onClick={() => gotoApplicationList("VN", presetDeadline("VN", "hanXuLy", "<30"))}
                className="rounded-lg p-3 bg-green-50 border border-green-200"
              >
                <div className="text-xs text-green-800">Trong 30 ngày</div>
                <div className="text-3xl font-extrabold text-green-700">{totalDeadline.d30}</div>
              </ClickCard>
            </div>
          </div>
        </div>
      </div>

      {/* ================== ĐƠN ĐĂNG KÝ ================== */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="mb-4">
          <div className="text-lg font-bold">📁 Đơn đăng ký</div>
          <div className="text-sm text-gray-500">
            VN & Campuchia: deadline + hồ sơ tài liệu + thống kê nộp đơn theo tháng/năm
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VN */}
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-blue-700">Việt Nam</div>
              <div className="text-xs text-gray-500">Tổng quan</div>
            </div>
            {/* ✅ THÁNG HIỆN TẠI + THEO THÁNG NĂM NAY + THEO NĂM 3 NĂM */}
            <div className="mt-3 space-y-3">
              <YearMonthGrid
                title="Tổng đơn nộp theo tháng (năm nay)"
                items={vnMonthsUpToNow}
                onClickMonth={(it) => gotoApplicationList("VN", presetMonthTotalSubmissions("VN", it.month))}
              />

              {/* ✅ NEW: 3 năm gần nhất */}
              <Year3Bar
                title="Tổng đơn nộp theo năm (3 năm gần nhất)"
                items={vn?.tongDonTheoNam3NamGanNhat}
                onClickYear={(it) => gotoApplicationList("VN", presetYearTotalSubmissions("VN", it.year))}
              />
            </div>
            <div className="bg-white rounded-xl border p-3">
              <DeadlineRow
                title="Hạn trả lời Cục"
                data={vn?.hanTraLoi}
                onClickBucket={(bucket) => () => gotoApplicationList("VN", presetDeadline("VN", "hanTraLoi", bucket))}
              />
              <DeadlineRow
                title="Hạn Cục xử lý"
                data={vn?.hanXuLy}
                onClickBucket={(bucket) => () => gotoApplicationList("VN", presetDeadline("VN", "hanXuLy", bucket))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <ClickCard
                onClick={() => gotoApplicationList("VN", presetOutstandingDocs("VN"))}
                className="bg-white rounded-xl border p-3"
              >
                <div className="text-sm font-semibold text-gray-800">Hồ sơ tài liệu chưa hoàn thành</div>
                <div className="text-3xl font-extrabold text-blue-600 mt-1">{vn?.chuaHoanThanhTaiLieu ?? 0}</div>
                <div className="text-xs text-gray-500">chưa có ngày hoàn thành</div>
              </ClickCard>

              <div className="bg-white rounded-xl border p-3">
                <div className="text-sm font-semibold text-gray-800 mb-2">
                  3 tháng gần nhất (Đơn nộp / Chưa HTTL)
                </div>
                <MonthMini
                  items={vn?.thongKe3Thang}
                  onClick={(it) => gotoApplicationList("VN", presetMonthOutstanding("VN", it.month))}
                />
              </div>
            </div>


          </div>

          {/* KH */}
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-green-700">Campuchia</div>
              <div className="text-xs text-gray-500">Tổng quan</div>
            </div>
            <div className="mt-3 space-y-3">
              <YearMonthGrid
                title="Tổng đơn nộp theo tháng (năm nay)"
                items={khMonthsUpToNow}
                onClickMonth={(it) => gotoApplicationList("KH", presetMonthTotalSubmissions("KH", it.month))}
              />

              {/* ✅ NEW: 3 năm gần nhất */}
              <Year3Bar
                title="Tổng đơn nộp theo năm (3 năm gần nhất)"
                items={kh?.tongDonTheoNam3NamGanNhat}
                onClickYear={(it) => gotoApplicationList("KH", presetYearTotalSubmissions("KH", it.year))}
              />
            </div>
            <div className="bg-white rounded-xl border p-3">
              <DeadlineRow
                title="Hạn trả lời Cục"
                data={kh?.hanTraLoi}
                onClickBucket={(bucket) => () => gotoApplicationList("KH", presetDeadline("KH", "hanTraLoi", bucket))}
              />
              <DeadlineRow
                title="Hạn Cục xử lý"
                data={kh?.hanXuLy}
                onClickBucket={(bucket) => () => gotoApplicationList("KH", presetDeadline("KH", "hanXuLy", bucket))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <ClickCard
                onClick={() => gotoApplicationList("KH", presetOutstandingDocs("KH"))}
                className="bg-white rounded-xl border p-3"
              >
                <div className="text-sm font-semibold text-gray-800">Hồ sơ tài liệu chưa hoàn thành</div>
                <div className="text-3xl font-extrabold text-blue-600 mt-1">{kh?.chuaHoanThanhTaiLieu ?? 0}</div>
                <div className="text-xs text-gray-500">chưa có ngày hoàn thành</div>
              </ClickCard>

              <div className="bg-white rounded-xl border p-3">
                <div className="text-sm font-semibold text-gray-800 mb-2">
                  3 tháng gần nhất (Đơn nộp / Chưa HTTL)
                </div>
                <MonthMini
                  items={kh?.thongKe3Thang}
                  onClick={(it) => gotoApplicationList("KH", presetMonthOutstanding("KH", it.month))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================== NHÂN SỰ PHỤ TRÁCH ================== */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="mb-4">
          <div className="text-lg font-bold">👤 Nhân sự phụ trách đơn</div>
          <div className="text-sm text-gray-500">
            Thống kê số đơn mỗi nhân sự đang xử lý & số đơn chưa hoàn thành hồ sơ tài liệu
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssigneeTable
            title="Việt Nam"
            items={data?.nhanSuPhuTrach?.VN}
            onRowClick={(it) =>
              gotoApplicationList("VN", {
                preset: "ASSIGNEE",
                selectedNhanSu: it.maNhanSu,
                _fromDashboard: true,
                _country: "VN",
              })
            }
          />

          <AssigneeTable
            title="Campuchia"
            items={data?.nhanSuPhuTrach?.KH}
            onRowClick={(it) =>
              gotoApplicationList("KH", {
                preset: "ASSIGNEE",
                selectedNhanSu: it.maNhanSu,
                _fromDashboard: true,
                _country: "KH",
              })
            }
          />
        </div>
      </div>

      {/* ================== VĂN BẰNG ================== */}
      <div className="flex items-center gap-2 mt-2">
        <div className="text-lg font-bold">📜 Văn bằng</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="font-semibold text-blue-700 mb-4">Việt Nam</div>
          <DeadlineRow
            title="Hạn gia hạn"
            data={data?.vanBang?.VN?.hanGiaHan}
            onClickBucket={(bucket) => () =>
              gotoApplicationList("VN", { preset: "VAN_BANG_GIA_HAN", bucket, _fromDashboard: true })
            }
          />
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="font-semibold text-green-700 mb-4">Campuchia</div>
          <div className="bg-gray-50 rounded-xl border p-3">
            <DeadlineRow
              title="Hạn nộp tuyên thệ"
              data={data?.vanBang?.KH?.hanNopTuyenThe}
              onClickBucket={(bucket) => () =>
                gotoApplicationList("KH", { preset: "VAN_BANG_TUYEN_THE", bucket, _fromDashboard: true })
              }
            />
            <DeadlineRow
              title="Hạn gia hạn"
              data={data?.vanBang?.KH?.hanGiaHan}
              onClickBucket={(bucket) => () =>
                gotoApplicationList("KH", { preset: "VAN_BANG_GIA_HAN", bucket, _fromDashboard: true })
              }
            />
          </div>
        </div>
      </div>

      {/* ================== GIẤY ỦY QUYỀN ================== */}
      <div className="flex items-center gap-2 mt-2">
        <div className="text-lg font-bold">✍️ Giấy uỷ quyền</div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="bg-gray-50 rounded-xl border p-3">
          <DeadlineRow
            title="Hạn hết hiệu lực"
            data={data?.giayUyQuyen?.ngayHetHan}
            onClickBucket={(bucket) => () =>
              gotoApplicationList("VN", { preset: "GIAY_UY_QUYEN", bucket, _fromDashboard: true })
            }
          />
        </div>
      </div>
    </div>
  );
}

export default HomeReport;