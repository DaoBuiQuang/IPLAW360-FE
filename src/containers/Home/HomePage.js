// HomePage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Users, Briefcase, Handshake, Globe, UserCheck,
  FileText, Settings, Tag, ShoppingCart, LayoutDashboard,
  Key, User, ChevronDown, ChevronUp, DollarSign, Search
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setOpenAtLevel, openPath } from "../../features/uiSlice";
function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const openMenu = useSelector((s) => s.ui.openMenu);

  const navLinkClass =
    "flex items-center space-x-2 p-2 rounded-lg w-full transition hover:border hover:border-[#009999] hover:text-[#009999] hover:fill-[#009999]";

  const renderMenuGroup = (parentKey, key, title, icon, children) => {
    const isOpen = openMenu[parentKey] === key;
    return (
      <li>
        <button
          onClick={() => dispatch(setOpenAtLevel({ parent: parentKey, key }))}
          className={`flex items-center justify-between p-3 rounded-lg w-full text-lg font-semibold transition ${isOpen ? "border border-[#009999] text-[#009999]" : "hover:border hover:border-[#009999] hover:text-[#009999]"
            }`}
        >
          <div className="flex items-center space-x-3">
            {icon(isOpen)}
            <span>{title}</span>
          </div>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isOpen && <ul className="ml-8 mt-2 space-y-2 text-base">{children}</ul>}
      </li>
    );
  };

  // helper: mở nhánh trước khi đi tới route
  const goWithMenuOpen = (pathArr, to) => {
    // pathArr ví dụ: [{ parent:'root', key:'vietnam' }, { parent:'vietnam', key:'nhanhieu' }]
    dispatch(openPath({ path: pathArr }));
    navigate(to);
  };
  useEffect(() => {
    console.log(+"5" + 5);

  });
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center text-[#009999] mb-8">Trang chủ</h1>
      <nav className="max-w-4xl mx-auto">
        <ul className="space-y-4 text-[#009999]">

          {/* VIỆT NAM */}
          <div className="grid grid-cols-2 gap-8">
            <ul className="space-y-4 text-[#009999]">
              {renderMenuGroup(
                "root",
                "vietnam",
                "VIỆT NAM",
                (open) => <Globe size={20} color={open ? "#009999" : undefined} />,
                <>
                  {renderMenuGroup(
                    "vietnam",
                    "nhanhieu",
                    "Nhãn hiệu",
                    (open) => <Tag size={18} color={open ? "#009999" : undefined} />,
                    <>
                      <li>
                        <button
                          onClick={() =>
                            goWithMenuOpen(
                              [{ parent: "root", key: "vietnam" }, { parent: "vietnam", key: "nhanhieu" }],
                              "/applicationlist"
                            )
                          }
                          className={navLinkClass}
                        >
                          <FileText size={16} />
                          <span>Đơn đăng ký</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() =>
                            goWithMenuOpen(
                              [{ parent: "root", key: "vietnam" }, { parent: "vietnam", key: "nhanhieu" }],
                              "/application_sd_nh_vn_list"
                            )
                          }
                          className={navLinkClass}
                        >
                          <FileText size={16} />
                          <span>Sửa đổi đăng ký</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() =>
                            goWithMenuOpen(
                              [{ parent: "root", key: "vietnam" }, { parent: "vietnam", key: "nhanhieu" }],
                              "/application_cn_nh_vn_list"
                            )
                          }
                          className={navLinkClass}
                        >
                          <FileText size={16} />
                          <span>Chuyển nhượng quyền</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() =>
                            goWithMenuOpen(
                              [{ parent: "root", key: "vietnam" }, { parent: "vietnam", key: "nhanhieu" }],
                              "/application_tach_nh_vn_list"
                            )
                          }
                          className={navLinkClass}
                        >
                          <FileText size={16} />
                          <span>Tách đơn</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() =>
                            goWithMenuOpen(
                              [{ parent: "root", key: "vietnam" }, { parent: "vietnam", key: "nhanhieu" }],
                              "/application_gh_nh_vn_list"
                            )
                          }
                          className={navLinkClass}
                        >
                          <FileText size={16} />
                          <span>Gia hạn văn bằng</span>
                        </button>
                      </li>
                    </>
                  )}

                  {renderMenuGroup(
                    "vietnam",
                    "kieudang",
                    "Kiểu dáng CN",
                    (open) => <LayoutDashboard size={18} color={open ? "#009999" : undefined} />,
                    <></>
                  )}

                  {renderMenuGroup(
                    "vietnam",
                    "sangche",
                    "Sáng chế & GPHI",
                    (open) => <Briefcase size={18} color={open ? "#009999" : undefined} />,
                    <></>
                  )}

                  {renderMenuGroup(
                    "vietnam",
                    "banquyen",
                    "Bản quyền",
                    (open) => <FileText size={18} color={open ? "#009999" : undefined} />,
                    <></>
                  )}

                  {renderMenuGroup(
                    "vietnam",
                    "tracuu",
                    "Tra cứu nhãn hiệu",
                    (open) => <Search size={18} color={open ? "#009999" : undefined} />,
                    <></>
                  )}

                  {renderMenuGroup(
                    "vietnam",
                    "tuvan",
                    "Tư vấn chung",
                    (open) => <Handshake size={18} color={open ? "#009999" : undefined} />,
                    <></>
                  )}

                  <li>
                    <button
                      onClick={() =>
                        goWithMenuOpen(
                          [{ parent: "root", key: "vietnam" }],
                          "/caselist"
                        )
                      }
                      className={navLinkClass}
                    >
                      <FileText size={16} />
                      <span>Danh sách vụ việc</span>
                    </button>
                  </li>

                  {renderMenuGroup(
                    "vietnam",
                    "billing",
                    "Billing",
                    (open) => <DollarSign size={18} color={open ? "#009999" : undefined} />,
                    <>
                      <li>
                        <button
                          onClick={() =>
                            goWithMenuOpen(
                              [{ parent: "root", key: "vietnam" }, { parent: "vietnam", key: "billing" }],
                              "/vuviec_bill"
                            )
                          }
                          className={navLinkClass}
                        >
                          <FileText size={16} />
                          <span>Vụ việc cần thanh toán</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() =>
                            goWithMenuOpen(
                              [{ parent: "root", key: "vietnam" }, { parent: "vietnam", key: "billing" }],
                              "/debitnote_list"
                            )
                          }
                          className={navLinkClass}
                        >
                          <FileText size={16} />
                          <span>Debit Note</span>
                        </button>
                      </li>
                    </>
                  )}

                  {renderMenuGroup(
                    "vietnam",
                    "baocao",
                    "Báo cáo - Thống kê",
                    (open) => <PieChart size={18} color={open ? "#009999" : undefined} />,
                    <></>
                  )}
                </>
              )}
            </ul>

            {/* CAMPUCHIA */}
            <ul className="space-y-4 text-[#009999]">
              {renderMenuGroup(
                "root",
                "cambodia",
                "CAMPUCHIA",
                (open) => <Globe size={20} color={open ? "#009999" : undefined} />,
                <>
                  {renderMenuGroup(
                    "cambodia",
                    "nhanhieu_kh",
                    "Nhãn hiệu",
                    (open) => <Tag size={18} color={open ? "#009999" : undefined} />,
                    <>
                      <li>
                        <button
                          onClick={() =>
                            goWithMenuOpen(
                              [{ parent: "root", key: "cambodia" }, { parent: "cambodia", key: "nhanhieu_kh" }],
                              "/applicationlist_kh"
                            )
                          }
                          className={navLinkClass}
                        >
                          <FileText size={16} />
                          <span>Đơn đăng ký</span>
                        </button>
                      </li>
                    </>
                  )}

                  {renderMenuGroup(
                    "cambodia",
                    "kieudang",
                    "Kiểu dáng CN",
                    (open) => <LayoutDashboard size={18} color={open ? "#009999" : undefined} />,
                    <></>
                  )}

                  {renderMenuGroup(
                    "cambodia",
                    "sangche",
                    "Sáng chế & GPHI",
                    (open) => <Briefcase size={18} color={open ? "#009999" : undefined} />,
                    <></>
                  )}

                  {renderMenuGroup(
                    "cambodia",
                    "banquyen",
                    "Bản quyền",
                    (open) => <FileText size={18} color={open ? "#009999" : undefined} />,
                    <></>
                  )}

                  {renderMenuGroup(
                    "cambodia",
                    "tracuu",
                    "Tra cứu nhãn hiệu",
                    (open) => <Search size={18} color={open ? "#009999" : undefined} />,
                    <></>
                  )}

                  {renderMenuGroup(
                    "cambodia",
                    "tuvan",
                    "Tư vấn chung",
                    (open) => <Handshake size={18} color={open ? "#009999" : undefined} />,
                    <></>
                  )}
                </>
              )}
            </ul>
          </div>

          {/* TÌM KIẾM */}
          {renderMenuGroup(
            "root",
            "timkiem",
            "Tìm kiếm",
            (open) => <Search size={20} color={open ? "#009999" : undefined} />,
            <>
              <li>
                <button
                  onClick={() =>
                    goWithMenuOpen([{ parent: "root", key: "timkiem" }], "/brandlist")
                  }
                  className={navLinkClass}
                >
                  <Tag size={16} />
                  <span>Nhãn hiệu</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    goWithMenuOpen([{ parent: "root", key: "timkiem" }], "/vuviec_bill")
                  }
                  className={navLinkClass}
                >
                  <FileText size={16} />
                  <span>Billing</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    goWithMenuOpen([{ parent: "root", key: "timkiem" }], "/debitnote")
                  }
                  className={navLinkClass}
                >
                  <FileText size={16} />
                  <span>Debit Note</span>
                </button>
              </li>
            </>
          )}

          {/* HỆ THỐNG */}
          {renderMenuGroup(
            "root",
            "system",
            "Hệ thống",
            (open) => <Settings size={20} color={open ? "#009999" : undefined} />,
            <>
              <li>
                <button
                  onClick={() =>
                    goWithMenuOpen([{ parent: "root", key: "system" }], "/customerlist")
                  }
                  className={navLinkClass}
                >
                  <Users size={16} />
                  <span>Khách hàng</span>
                </button>
              </li>
              {/* ... các mục khác tương tự, chỉ đổi route */}
            </>
          )}

          {/* QUẢN TRỊ */}
          {renderMenuGroup(
            "root",
            "settings",
            "Quản trị",
            (open) => <User size={20} color={open ? "#009999" : undefined} />,
            <>
              <li>
                <button
                  onClick={() =>
                    goWithMenuOpen([{ parent: "root", key: "settings" }], "/changepassword")
                  }
                  className={navLinkClass}
                >
                  <Key size={16} />
                  <span>Đổi mật khẩu</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    goWithMenuOpen([{ parent: "root", key: "settings" }], "/profile")
                  }
                  className={navLinkClass}
                >
                  <User size={16} />
                  <span>Thông tin tài khoản</span>
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}

export default HomePage;
