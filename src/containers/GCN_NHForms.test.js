import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import callAPI from "../utils/api";
import GCN_NH_CAMAdd from "./GCN_NH_CAM/GCN_NH_CAMAdd";
import GCN_NH_CAMEdit from "./GCN_NH_CAM/GCN_NH_CAMEdit";
import GCN_NH_VNAdd from "./GCN_NH_VN/GCN_NH_VNAdd";
import GCN_NH_VNEdit from "./GCN_NH_VN/GCN_NH_VNEdit";

jest.mock("react-router-dom", () => ({
    useNavigate: () => jest.fn(),
    useParams: () => ({ id: "42" }),
}), { virtual: true });
jest.mock("../utils/api", () => jest.fn());
jest.mock("../components/commom/Notification", () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
}));

test.each([
    ["Vietnam", GCN_NH_VNAdd, "/gcn_nh_vn/add", "Đang xử lý gia hạn", "2"],
    ["Cambodia", GCN_NH_CAMAdd, "/gcn_nh_cam/add", "Đã ghi nhận Tuyên thệ sử dụng", "6"],
])("adds a certificate with its number and status in %s", async (_, AddForm, endpoint, statusLabel, statusCode) => {
    callAPI.mockClear();
    callAPI.mockResolvedValue([]);
    render(<AddForm />);

    const save = screen.getByRole("button", { name: "Thêm giấy chứng nhận" });
    const number = screen.getByRole("textbox", { name: /Số bằng/ });
    const status = screen.getByRole("combobox", { name: /Trạng thái bằng/ });
    fireEvent.change(number, { target: { value: "123456" } });
    expect(save).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Thêm nghiệp vụ" })).not.toBeInTheDocument();

    fireEvent.keyDown(status, { key: "ArrowDown" });
    fireEvent.click(screen.getByText(statusLabel));
    expect(save).toBeEnabled();
    fireEvent.click(save);

    await waitFor(() => expect(callAPI).toHaveBeenCalledWith({
        method: "post",
        endpoint,
        data: expect.objectContaining({ soBang: "123456", trangThaiBang: statusCode }),
    }));
    const [{ data }] = callAPI.mock.calls.find(([request]) => request.endpoint === endpoint);
    expect(data).not.toHaveProperty("vuViecs");
});

test.each([
    ["Vietnam", GCN_NH_VNEdit, "/gcn_nh/detail", "/gcn_nh_vn/edit", "Đang xử lý gia hạn", "2"],
    ["Cambodia", GCN_NH_CAMEdit, "/gcn_nh_kh/detail", "/gcn_nh_cam/edit", "Đã ghi nhận Tuyên thệ không sử dụng", "7"],
])("updates a certificate with optional fields empty in %s", async (_, EditForm, detail, endpoint, statusLabel, statusCode) => {
    callAPI.mockClear();
    callAPI.mockImplementation(async ({ endpoint: requestedEndpoint }) => (
        requestedEndpoint === detail ? {
            soBang: "123456",
            trangThaiBang: Number(statusCode),
            ngayNopDon: "2019-01-01",
            hanGiaHan: "2028-08-23",
            anhBang: "/uploads/certificate.png",
            vuViecs: [{ id: 81 }],
        } : []
    ));
    render(<EditForm />);

    expect(await screen.findByText(statusLabel)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Thêm nghiệp vụ" })).not.toBeInTheDocument();

    const save = screen.getByRole("button", { name: /Lưu thông tin/ });
    const number = screen.getByRole("textbox", { name: /Số bằng/ });
    const status = screen.getByRole("combobox", { name: /Trạng thái bằng/ });
    expect(save).toBeEnabled();

    fireEvent.change(number, { target: { value: "  " } });
    expect(save).toBeDisabled();
    fireEvent.change(number, { target: { value: "  123457  " } });
    fireEvent.keyDown(status, { key: "Backspace" });
    expect(save).toBeDisabled();
    fireEvent.keyDown(status, { key: "ArrowDown" });
    fireEvent.click(screen.getByText(statusLabel));
    fireEvent.click(save);

    await waitFor(() => expect(callAPI).toHaveBeenCalledWith({
        method: "put",
        endpoint,
        data: expect.objectContaining({
            id: "42",
            soBang: "123457",
            trangThaiBang: statusCode,
            idKhachHang: null,
            idDoiTac: null,
            maNhanHieu: null,
            hanGiaHan: "2028-08-23",
        }),
    }));
    const [{ data }] = callAPI.mock.calls.find(([request]) => request.endpoint === endpoint);
    expect(data).not.toHaveProperty("vuViecs");
    expect(data.linkAnh).toBeUndefined();
});
