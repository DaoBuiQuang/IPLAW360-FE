import { Modal, Descriptions, Tag } from "antd";

export default function CaseDetailModal({ visible, onClose, record }) {
    if (!record) return null;

    return (
        <Modal
            title={`📋 Chi tiết vụ việc - ${record.maHoSo}`}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <Descriptions bordered column={2} size="middle">
                <Descriptions.Item label="Mã hồ sơ">
                    <b>{record.maHoSo}</b>
                </Descriptions.Item>
                <Descriptions.Item label="Tên vụ việc">
                    {record.tenVuViec}
                </Descriptions.Item>

                <Descriptions.Item label="Mô tả" span={2}>
                    {record.moTa || "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Số đơn">
                    {record.soDon}
                </Descriptions.Item>
                <Descriptions.Item label="Khách hàng">
                    {record.tenKhachHang}
                </Descriptions.Item>

                <Descriptions.Item label="Quốc gia">
                    {record.tenQuocGia}
                </Descriptions.Item>
                <Descriptions.Item label="Đối tác">
                    {record.tenDoiTac}
                </Descriptions.Item>

                <Descriptions.Item label="Loại tiền tệ">
                    {record.loaiTienTe}
                </Descriptions.Item>

                <Descriptions.Item label="Số tiền">
                    {Number(record.soTien).toLocaleString()} {record.loaiTienTe}
                </Descriptions.Item>
                <Descriptions.Item label="Deadline">
                    {record.deadline}
                </Descriptions.Item>

                <Descriptions.Item label="Soft deadline">
                    {record.softDeadline || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái yêu cầu thanh toán">
                    {record.trangThaiYCTT === 2 ? (
                        <Tag color="red">Bị từ chối</Tag>
                    ) : record.trangThaiYCTT === 3 ? (
                        <Tag color="green">Đã duyệt</Tag>
                    ) : (
                        <Tag color="default">Chưa duyệt</Tag>
                    )}
                </Descriptions.Item>


                <Descriptions.Item label="Người xuất yêu cầu thanh toán">
                    {record.nguoiXuatBill}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày xuất yêu cầu thanh toán">
                    {record.ngayXuatBill}
                </Descriptions.Item>

                <Descriptions.Item label="Cần thanh toán" span={2}>
                    {record.xuatBill ? (
                        <Tag color="green">✅ Đã xuất</Tag>
                    ) : (
                        <Tag color="red">❌ Chưa xuất</Tag>
                    )}
                </Descriptions.Item>

                <Descriptions.Item label="Ghi chú từ chối" span={2}>
                    {record.ghiChuTuChoi || "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Mã đơn" span={2}>
                    {record.maDon}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
}
