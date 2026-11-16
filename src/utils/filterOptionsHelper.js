import callAPI from "./api";

/**
 * Tải danh sách tùy chọn Khách hàng, Đối tác, Nhãn hiệu dùng chung cho SearchCreatableSelect.
 */
export const fetchSharedFilterOptions = async () => {
  const [custRes, partnerRes, brandRes] = await Promise.allSettled([
    callAPI({ method: "post", endpoint: "/customers/by-name", data: {} }),
    callAPI({ method: "post", endpoint: "/partner/all", data: {} }),
    callAPI({ method: "post", endpoint: "/brand/shortlist", data: {} }),
  ]);

  const customerOptions =
    custRes.status === "fulfilled"
      ? (Array.isArray(custRes.value) ? custRes.value : custRes.value?.data || []).map((c) => ({
          value: c.tenKhachHang,
          label: `${c.tenKhachHang}${c.maKhachHang ? ` (${c.maKhachHang})` : ""}`,
        }))
      : [];

  const partnerOptions =
    partnerRes.status === "fulfilled"
      ? (Array.isArray(partnerRes.value) ? partnerRes.value : partnerRes.value?.data || []).map((p) => ({
          value: p.tenDoiTac,
          label: `${p.tenDoiTac}${p.maDoiTac ? ` (${p.maDoiTac})` : ""}`,
        }))
      : [];

  const brandOptions =
    brandRes.status === "fulfilled"
      ? (Array.isArray(brandRes.value) ? brandRes.value : brandRes.value?.data || []).map((b) => ({
          value: b.tenNhanHieu,
          label: `${b.tenNhanHieu}${b.maNhanHieu ? ` (${b.maNhanHieu})` : ""}`,
        }))
      : [];

  return { customerOptions, partnerOptions, brandOptions };
};
