import dayjs from "dayjs";

export const GCN_CAM_STATUS_OPTIONS = [
    { value: "1", label: "Chưa làm gì" },
    { value: "2", label: "Đang xử lý gia hạn" },
    { value: "3", label: "Đang xử lý Affidavit" },
    { value: "4", label: "Không xử lý gia hạn" },
    { value: "5", label: "Không xử lý Affidavit" },
    { value: "6", label: "Đã ghi nhận Tuyên thệ sử dụng" },
    { value: "7", label: "Đã ghi nhận Tuyên thệ không sử dụng" },
];

export const AFFIDAVIT_TYPE_OPTIONS = [
    { value: "SU_DUNG", label: "Tuyên thệ sử dụng" },
    { value: "KHONG_SU_DUNG", label: "Tuyên thệ không sử dụng" },
];

export const getGcnCamStatusLabel = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const found = GCN_CAM_STATUS_OPTIONS.find((opt) => opt.value === String(value));
    return found ? found.label : String(value);
};

export const getAffidavitTypeLabel = (value) => {
    if (!value) return "";
    const found = AFFIDAVIT_TYPE_OPTIONS.find((opt) => opt.value === value);
    return found ? found.label : value;
};

/**
 * Tính hạn nộp tuyên thệ tiếp theo (+5 năm) từ ngày ghi nhận tuyên thệ (ưu tiên)
 * hoặc từ ngày cấp bằng nếu chưa có ngày ghi nhận tuyên thệ.
 */
export const calcNextAffidavitDeadline = ({ ngayGhiNhanTuyenThe, ngayCapBang }) => {
    const base = ngayGhiNhanTuyenThe || ngayCapBang;
    if (!base) return null;
    const parsed = dayjs(base);
    return parsed.isValid() ? parsed.add(5, "year").format("YYYY-MM-DD") : null;
};
