import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Modal, Table } from "antd";
import callAPI from "../../utils/api";

const NotificationDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [notification, setNotification] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchNotificationDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await callAPI({
                    method: "POST",
                    endpoint: "/send-notification-detail",
                    data: { id },
                });
                setNotification(response.notification);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchNotificationDetail();
    }, [id]);

    // Hàm lấy lịch sử chỉnh sửa
    const loadHistory = async () => {
        if (!notification?.title || !notification?.data) return;
        try {
            const ma = notification.data.maDoiTac || notification.data.maKhachHang;
            if (!ma) return;

            const res = await callAPI({
                method: "POST",
                endpoint: "/history/by-notification",
                data: { title: notification.title, ma }
            });
            setHistory(res);
            setModalVisible(true);
        } catch (err) {
            console.error("Lỗi lấy lịch sử:", err);
        }
    };

    // Hàm rollback
    const handleRollback = async (logId) => {
        const confirm = window.confirm("Bạn có chắc muốn rollback về phiên bản này?");
        if (!confirm) return;

        try {
            setLoading(true);
            await callAPI({
                method: "POST",
                endpoint: `/rollback/${logId}`
            });
            alert("Rollback thành công!");
            navigate("/customerlist");
        } catch (err) {
            alert("Lỗi rollback: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="text-red-500">Lỗi: {error}</div>;
    if (!notification) return <div>Chưa có thông báo</div>;

    const columns = [
        {
            title: "Thời gian",
            dataIndex: "timestamp",
            key: "timestamp",
            render: (ts) => new Date(ts).toLocaleString(),
        },
        {
            title: "Người chỉnh sửa",
            dataIndex: "changedBy",
            key: "changedBy",
        },
        {
            title: "Hành động",
            dataIndex: "action",
            key: "action",
            render: (action) => {
                switch (action) {
                    case "UPDATE": return "Sửa";
                    case "DELETE": return "Xóa";
                    case "CREATE": return "Thêm";
                    default: return action;
                }
            }
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record, index) => {
                if (index === 0 && record.action === "DELETE") {
                    return (
                        <Button type="primary" onClick={() => handleRollback(record.id)}>
                            Khôi phục
                        </Button>
                    );
                }
                return null;
            },

        },
    ];

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-md shadow-md font-sans mt-10">
            <h2 className="text-2xl font-bold mb-6">Chi tiết thông báo</h2>

            <p className="mb-2">
                <span className="font-semibold">Tiêu đề:</span> {notification.title}
            </p>
            <p className="mb-2">
                <span className="font-semibold">Nội dung:</span> {notification.body}
            </p>
            <p className="mb-2">
                <span className="font-semibold">Người cập nhật:</span> {notification.maNhanSu}
            </p>
            <p className="mb-2">
                <span className="font-semibold">Thời gian gửi:</span> {new Date(notification.sentAt).toLocaleString()}
            </p>
            <p className="mb-6">
                <span className="font-semibold">Trạng thái đọc:</span> {notification.isRead ? "Đã đọc" : "Chưa đọc"}
            </p>

            <h3 className="text-xl font-semibold mb-3">Chi tiết thay đổi:</h3>
            {notification.data?.changes?.length > 0 ? (
                <table className="w-full border border-gray-300 bg-white rounded-md shadow-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left p-3 border-b border-gray-300 font-medium">Trường</th>
                            <th className="text-left p-3 border-b border-gray-300 font-medium w-1/3">Giá trị cũ</th>
                            <th className="text-left p-3 border-b border-gray-300 font-medium w-1/3">Giá trị mới</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notification.data.changes.map(({ field, oldValue, newValue }, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                                <td className="p-3 border-b border-gray-200 text-left">{field}</td>
                                <td className="p-3 border-b border-gray-200 text-gray-600 italic text-left">{oldValue ?? "null"}</td>
                                <td className="p-3 border-b border-gray-200 font-semibold text-left">{newValue ?? "null"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Không có thay đổi nào.</p>
            )}

            <Button type="primary" onClick={loadHistory} className="mt-4">
                Xem lịch sử chỉnh sửa
            </Button>

            <Modal
                title="Lịch sử chỉnh sửa"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table dataSource={history} columns={columns} rowKey="id" pagination={false} />
            </Modal>
        </div>
    );
};

export default NotificationDetail;
