/**
 * Ưu tiên hiển thị email làm định danh nhân sự thay cho mã nhân sự / username gốc.
 * Nếu nhân sự chưa có email thì fallback sang maNhanSu / employeeCode / managerCode.
 */
export const getStaffIdentifier = (staff, fallbackCode = "") => {
  if (!staff) return fallbackCode || "";
  const email =
    staff.email ||
    staff.managerEmail ||
    staff.employee?.email ||
    "";
  if (typeof email === "string" && email.trim() !== "") {
    return email.trim();
  }
  return (
    staff.maNhanSu ||
    staff.employeeCode ||
    staff.managerCode ||
    fallbackCode ||
    ""
  );
};

/**
 * Format nhãn hiển thị nhân sự trong dropdown Select:
 * Ưu tiên "Họ tên (email)" hoặc "Họ tên (email) - Chức vụ", fallback sang maNhanSu nếu chưa có email.
 */
export const formatStaffSelectLabel = (
  staff,
  { roleFallback = "", includeRole = false } = {}
) => {
  if (!staff) return "";
  const name = staff.hoTen || staff.managerName || staff.employee?.hoTen || "";
  const identifier = getStaffIdentifier(staff);
  const roleText = includeRole
    ? staff.chucVu || staff.managerChucVu || roleFallback
    : "";

  let base = "";
  if (name && identifier && name !== identifier) {
    base = `${name} (${identifier})`;
  } else {
    base = name || identifier;
  }

  return roleText ? `${base} - ${roleText}` : base;
};
