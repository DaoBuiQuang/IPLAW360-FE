import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  PieChart, Users, Briefcase, Handshake, Globe, UserCheck,
  FileText, Settings, Tag, ShoppingCart, LayoutDashboard,
  Key, User, ChevronDown, ChevronUp, DollarSign, Search, FileSignature, BarChart3, Stamp, Timer, Calendar
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { setOpenAtLevel } from "../features/uiSlice";
import logoweb from "../assets/image/logo-web-big.jpg";

function MenuLeft() {
  const location = useLocation();
  const role = useSelector((state) => state.auth.role);
  const { t } = useTranslation();

  // ✅ Dùng Redux thay cho useState
  const dispatch = useDispatch();
  const openMenu = useSelector((s) => s.ui.openMenu);

  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-2 p-2 rounded-lg w-full transition 
    ${isActive
      ? "border border-[#009999] text-[#009999] fill-[#009999]"
      : "hover:border hover:border-[#009999] hover:text-[#009999] hover:fill-[#009999]"}`;

  // ✅ Duy nhất 1 renderMenuGroup dùng Redux openMenu + setOpenAtLevel
  const renderMenuGroup = (parentKey, key, title, iconRenderer, children) => {
    const isOpen = openMenu[parentKey] === key;
    return (
      <li>
        <button
          onClick={() => dispatch(setOpenAtLevel({ parent: parentKey, key }))}
          className={`flex items-center justify-between p-2 rounded-lg w-full transition 
            ${isOpen ? "border border-[#009999] text-[#009999]" : "hover:border hover:border-[#009999] hover:text-[#009999]"}`}
        >
          <div className="flex items-center space-x-2">
            {iconRenderer?.(isOpen)}
            <span>{title}</span>
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && <ul className="ml-6 mt-1 space-y-1 text-sm">{children}</ul>}
      </li>
    );
  };

  return (
    <aside className="bg-white w-[280px] h-screen shadow-md flex flex-col overflow-y-auto">
      {/* Logo */}
      <NavLink
        to="/"
        className="p-2 flex justify-center hover:opacity-80 transition-opacity"
      >
        <img src="https://ipac.vn/image/catalog/brands/LOGO-chuan-mau-2.png" alt="Logo" className="w-32" />
      </NavLink>

      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2 text-[#009999] text-sm font-bold">
          {/* ════════════════════════════════════
               TIMESHEET — menu tổng (mọi role đều thấy)
              ════════════════════════════════════ */}
          {renderMenuGroup(
            "root",
            "timesheet",
            "TIMESHEET",
            (open) => <Timer size={16} color={open ? "#009999" : undefined} />,
            <>
              {/* ── MYTIME — NavLink trực tiếp vào trang + ROUTINES sub ── */}
              <li>
                <NavLink to="/timesheet/mytime" className={navLinkClass}>
                  <User size={14} />
                  <span className="text-left w-full">MYTIME</span>
                </NavLink>
                {/* ROUTINES: hiện ra khi đang ở trang MYTIME */}
                {location.pathname.startsWith("/timesheet/mytime") || location.pathname === "/dscongviec_list" ? (
                  <ul className="ml-5 mt-1 space-y-1 text-sm">
                    <li>
                      <NavLink to="/dscongviec_list" className={navLinkClass}>
                        <Briefcase size={13} />
                        <span className="text-left w-full">ROUTINES</span>
                      </NavLink>
                    </li>
                  </ul>
                ) : null}
              </li>

              {/* ── MYTEAM — Manager hoặc Admin xem ── */}
              {(role === "manager" || role === "admin" || role === "ceo") && (
                <li>
                  <NavLink to="/timesheet/myteam" className={navLinkClass}>
                    <Users size={14} />
                    <span className="text-left w-full">MYTEAM</span>
                  </NavLink>
                  {/* TEAMWORK: hiện khi đang ở MYTEAM hoặc TEAMWORK */}
                  {(location.pathname.startsWith("/timesheet/myteam") || location.pathname.startsWith("/timesheet/teamwork")) ? (
                    <ul className="ml-5 mt-1 space-y-1 text-sm">
                      <li>
                        <NavLink to="/timesheet/teamwork" className={navLinkClass}>
                          <FileText size={13} />
                          <span className="text-left w-full">TEAMWORK</span>
                        </NavLink>
                      </li>
                    </ul>
                  ) : null}
                </li>
              )}

              {/* ── QUẢN LÝ TEAM — Chỉ Admin/CEO ── */}
              {(role === "admin" || role === "ceo") && (
                <li>
                  <NavLink to="/teamlist" className={navLinkClass}>
                    <UserCheck size={14} />
                    <span className="text-left w-full">QUẢN LÝ TEAM</span>
                  </NavLink>
                </li>
              )}

              {/* ── MYOFFICE — chỉ CEO/Admin ── */}
              {(role === "admin" || role === "ceo") && (
                <li>
                  <NavLink to="/timesheet/myoffice" className={navLinkClass}>
                    <BarChart3 size={14} />
                    <span className="text-left w-full">MYOFFICE</span>
                  </NavLink>
                  {/* OFFICEWORK: hiện khi đang ở MYOFFICE hoặc OFFICEWORK */}
                  {(location.pathname.startsWith("/timesheet/myoffice") || location.pathname.startsWith("/timesheet/officework")) ? (
                    <ul className="ml-5 mt-1 space-y-1 text-sm">
                      <li>
                        <NavLink to="/timesheet/officework" className={navLinkClass}>
                          <FileText size={13} />
                          <span className="text-left w-full">OFFICEWORK</span>
                        </NavLink>
                      </li>
                    </ul>
                  ) : null}
                </li>
              )}
            </>
          )}



          {/* VIỆT NAM */}
          {renderMenuGroup(
            "root",
            "vietnam",
            "VIỆT NAM",
            (open) => <img
              src="https://flagcdn.com/w20/vn.png"
              alt="Vietnam flag"
              width={20}
              height={14}
              style={{ borderRadius: 2 }}
            />,
            <>
              {renderMenuGroup(
                "vietnam",
                "nhanhieu",
                "Nhãn hiệu",
                (open) => <Tag size={16} color={open ? "#009999" : undefined} />,
                <>
                  <li>
                    <NavLink to="/applicationlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Đơn đăng ký</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/gcn_nhlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Giấy chứng nhận(văn bằng)</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/application_sd_nh_vnlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Tờ khai sửa đổi đơn đăng ký</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/application_td_nh_vnlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Tờ khai tách đơn đăng ký</span>
                    </NavLink>
                  </li>
                  {/* <li>
                    <NavLink to="/gcn_nh_sdlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Giấy chứng nhận(văn bằng) đã sửa đổi</span>
                    </NavLink>
                  </li> */}
                  <li>
                    <NavLink to="/application_gh_nh_vn_list" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Đơn gia hạn GCN</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/application_sd_gcn_nh_vnlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Đơn sửa đổi GCN</span>
                    </NavLink>
                  </li>
                  {/* <li>
                    <NavLink to="/application_cn_gcn_nh_vn_list" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Đơn chuyển nhượng GCN</span>
                    </NavLink>
                  </li> */}
                </>
              )}

              {renderMenuGroup(
                "vietnam",
                "kieudang",
                "Kiểu dáng CN",
                (open) => <LayoutDashboard size={16} color={open ? "#009999" : undefined} />,
                <></>
              )}

              {renderMenuGroup(
                "vietnam",
                "sangche",
                "Sáng chế & GPHI",
                (open) => <Briefcase size={16} color={open ? "#009999" : undefined} />,
                <></>
              )}

              {renderMenuGroup(
                "vietnam",
                "banquyen",
                "Bản quyền",
                (open) => <FileText size={16} color={open ? "#009999" : undefined} />,
                <></>
              )}

              {renderMenuGroup(
                "vietnam",
                "tracuu",
                "Tra cứu nhãn hiệu",
                (open) => <Search size={16} color={open ? "#009999" : undefined} />,
                <></>
              )}

              <NavLink to="/generaladvicelist_vn" className={navLinkClass}>
                <FileText size={14} />
                <span className="text-left w-full">Danh sách tư vấn chung</span>
              </NavLink>
              <li>
                <NavLink to="/caselist" className={navLinkClass}>
                  <FileText size={14} />
                  <span className="text-left w-full">Danh sách nghiệp vụ</span>
                </NavLink>
              </li>

              {renderMenuGroup(
                "vietnam",
                "billing",
                "Thanh toán",
                (open) => <DollarSign size={16} color={open ? "#009999" : undefined} />,
                <>
                  <li>
                    <NavLink to="/vuviec_bill" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Nghiệp vụ yêu cầu thanh toán</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/vuviec_bill_chua_duyet" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Nghiệp vụ yêu cầu thanh toán chưa duyệt</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/vuviec_bill_tu_choi" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Nghiệp vụ bị từ chối yêu cầu thanh toán</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/vuviec_bill_da_duyet" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Nghiệp vụ yêu cầu thanh toán đã duyệt</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/debitnote_list" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Đề nghị thanh toán (DebitNote)</span>
                    </NavLink>
                  </li>
                </>
              )}

              {renderMenuGroup(
                "vietnam",
                "baocao",
                "Báo cáo - Thống kê",
                (open) => <PieChart size={16} color={open ? "#009999" : undefined} />,
                <></>
              )}
            </>
          )}

          {/* CAMPUCHIA */}
          {renderMenuGroup(
            "root",
            "cambodia",
            "CAMPUCHIA",
            (open) => <img
              src="https://flagcdn.com/w20/kh.png"
              alt="Cambodia flag"
              width={20}
              height={14}
              style={{ borderRadius: 2 }}
            />,
            <>
              {renderMenuGroup(
                "cambodia",
                "nhanhieu_kh",
                "Nhãn hiệu",
                (open) => <Tag size={16} color={open ? "#009999" : undefined} />,
                <>
                  <li>
                    <NavLink to="/applicationlist_kh" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Đơn đăng ký</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/gcn_nh_camlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Giấy chứng nhận(văn bằng)</span>
                    </NavLink>
                  </li>
                  {/* <li>
                    <NavLink to="/gcn_nh_sd_camlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Giấy chứng nhận(văn bằng) đã sửa đổi</span>
                    </NavLink>
                  </li> */}
                  <li>
                    <NavLink to="/affidavitlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Đơn nộp tuyên thệ sử dụng - Affidavit</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/application_sd_nh_khlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Tờ khai sửa đổi đơn đăng ký</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/application_td_nh_khlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Tờ khai tách đơn đăng ký</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/application_gh_nh_kh_list" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Đơn gia hạn GCN</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/application_sd_gcn_nh_khlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Đơn sửa đổi GCN</span>
                    </NavLink>
                  </li>
                  {/* <li>
                    <NavLink to="/application_cn_nh_khlist" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Đơn chuyển nhượng GCN</span>
                    </NavLink>
                  </li> */}
                </>
              )}

              {renderMenuGroup(
                "cambodia",
                "kieudang",
                "Kiểu dáng CN",
                (open) => <LayoutDashboard size={16} color={open ? "#009999" : undefined} />,
                <></>
              )}

              {renderMenuGroup(
                "cambodia",
                "sangche",
                "Sáng chế & GPHI",
                (open) => <Briefcase size={16} color={open ? "#009999" : undefined} />,
                <></>
              )}

              {renderMenuGroup(
                "cambodia",
                "banquyen",
                "Bản quyền",
                (open) => <FileText size={16} color={open ? "#009999" : undefined} />,
                <></>
              )}

              {renderMenuGroup(
                "cambodia",
                "tracuu",
                "Tra cứu nhãn hiệu",
                (open) => <Search size={16} color={open ? "#009999" : undefined} />,
                <></>
              )}

              <NavLink to="/generaladvicelist_kh" className={navLinkClass}>
                <FileText size={14} />
                <span className="text-left w-full">Danh sách tư vấn chung</span>
              </NavLink>

              <li>
                <NavLink to="/case_khlist" className={navLinkClass}>
                  <FileText size={14} />
                  <span className="text-left w-full">Danh sách vụ việc</span>
                </NavLink>
              </li>

              {renderMenuGroup(
                "cambodia",
                "billing",
                "Thanh toán",
                (open) => <DollarSign size={16} color={open ? "#009999" : undefined} />,
                <>
                  <li>
                    <NavLink to="/vuviec_bill_kh" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Nghiệp vụ yêu cầu thanh toán</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/vuviec_bill_kh_tu_choi" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Nghiệp vụ yêu cầu thanh toán bị từ chối</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/vuviec_bill_kh_chua_duyet" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Nghiệp vụ yêu cầu thanh toán chưa duyệt</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/vuviec_bill_kh_da_duyet" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Nghiệp vụ yêu cầu thanh toán được duyệt</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/debitnote_kh_list" className={navLinkClass}>
                      <FileText size={14} />
                      <span className="text-left w-full">Đề nghị thanh toán (DebitNote)</span>
                    </NavLink>
                  </li>
                </>
              )}

              {renderMenuGroup(
                "cambodia",
                "baocao",
                "Báo cáo - Thống kê",
                (open) => <PieChart size={16} color={open ? "#009999" : undefined} />,
                <></>
              )}
            </>
          )}

          {/* TÌM KIẾM */}
          {renderMenuGroup(
            "root",
            "timkiem",
            "Tìm kiếm",
            (open) => <Search size={16} color={open ? "#009999" : undefined} />,
            <>
              <li>
                <NavLink to="/vuviec_bill_full_all" className={navLinkClass}>
                  <FileText size={14} />
                  <span className="text-left w-full">Danh sách nghiệp vụ đã yêu cầu thanh toán</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/vuviec_bill_chua_duyet_all" className={navLinkClass}>
                  <FileText size={14} />
                  <span className="text-left w-full">Danh sách nghiệp vụ chưa duyệt</span>
                </NavLink>
              </li>
                <li>
                <NavLink to="/vuviec_bill_da_duyet_all" className={navLinkClass}>
                  <FileText size={14} />
                  <span className="text-left w-full">Danh sách nghiệp vụ đã duyệt</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/debitnote_list_all" className={navLinkClass}>
                  <FileText size={14} />
                  <span className="text-left w-full">Đề nghị thanh toán (DebitNote)</span>
                </NavLink>
              </li>
            </>
          )}

          {/* HỆ THỐNG — Quản lý nhân sự & Quản lý team bên trong chỉ dành cho Admin/CEO */}
          {renderMenuGroup(
            "root",
            "system",
            "Hệ thống",
            (open) => <Settings size={16} color={open ? "#009999" : undefined} />,
            <>
              <li>
                <NavLink to="/customerlist" className={navLinkClass}>
                  <Users size={14} />
                  <span className="text-left w-full">{t("khachHang")}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/power-of-attorneylist" className={navLinkClass}>
                  <FileSignature size={14} />
                  <span className="text-left w-full">{t("Giấy ủy quyền")}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/partnerlist" className={navLinkClass}>
                  <Handshake size={14} />
                  <span className="text-left w-full">{t("doiTac")}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/brandlist" className={navLinkClass}>
                  <Tag size={14} />
                  <span className="text-left w-full">{t("nhanHieu")}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/grouplist" className={navLinkClass}>
                  <Users size={14} />
                  <span className="text-left w-full">{"Nhóm khách hàng"}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/contactpersonlist" className={navLinkClass}>
                  <Users size={14} />
                  <span className="text-left w-full">{"Người liên hệ"}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/joblist" className={navLinkClass}>
                  <Briefcase size={14} />
                  <span className="text-left w-full">{t("nganhNghe")}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/countrylist" className={navLinkClass}>
                  <Globe size={14} />
                  <span className="text-left w-full">{t("quocGia")}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/productandserviceslist" className={navLinkClass}>
                  <ShoppingCart size={14} />
                  <span className="text-left w-full">{t("sanPhamDichVu")}</span>
                </NavLink>
              </li>
              {(role === "admin" || role === "ceo") && (
                <>
                  <li>
                    <NavLink to="/stafflist" className={navLinkClass}>
                      <UserCheck size={14} />
                      <span className="text-left w-full">{t("nhanSu")}</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/teamlist" className={navLinkClass}>
                      <Users size={14} />
                      <span className="text-left w-full">Quản lý Team</span>
                    </NavLink>
                  </li>
                </>
              )}
            </>
          )}

          {/* QUẢN TRỊ */}
          {renderMenuGroup(
            "root",
            "settings",
            "Quản trị",
            (open) => <User size={16} color={open ? "#009999" : undefined} />,
            <>
              <li>
                <NavLink to="/changepassword" className={navLinkClass}>
                  <Key size={14} />
                  <span className="text-left w-full">{t("doiMatKhau")}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className={navLinkClass}>
                  <User size={14} />
                  <span className="text-left w-full">{t("thongTinTaiKhoan")}</span>
                </NavLink>
              </li>
            </>
          )}

          {/* BÁO CÁO THỐNG KÊ — Chỉ Admin/CEO */}
          {(role === "admin" || role === "ceo") &&
            renderMenuGroup(
              "root",
              "reports",
              "Báo cáo thống kê",
              (open) => <BarChart3 size={16} color={open ? "#009999" : undefined} />,
              <>
                <li>
                  <NavLink to="/applicationlist_vn_report" className={navLinkClass}>
                    <Stamp size={14} />
                    <span className="text-left w-full">
                      {t("Báo cáo về đơn đăng ký nhãn hiệu Việt Nam")}
                    </span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/applicationlist_kh_report" className={navLinkClass}>
                    <Stamp size={14} />
                    <span className="text-left w-full">
                      {t("Báo cáo về đơn đăng ký nhãn hiệu Campuchia")}
                    </span>
                  </NavLink>
                </li>
              </>
            )}

        </ul>
      </nav>
    </aside>
  );
}

export default MenuLeft;
