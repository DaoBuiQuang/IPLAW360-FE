import React from 'react';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import 'dayjs/locale/vi';
const ReplyContentRating = ({
    ngayTraLoiKQThamDinhND_DuKien,
    setNgayTraLoiKQThamDinhND_DuKien,
    ngayTraLoiKQThamDinhND,
    setNgayTraLoiKQThamDinhND,
    isViewOnly
}) => {
    return (
        <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">📌Phàn hồi kết quả thẩm định nội dung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 text-left">Hạn trả lời kết quả thẩm định nội dung đơn dự kiến</label>
                    <DatePicker
                        value={ngayTraLoiKQThamDinhND_DuKien ? dayjs(ngayTraLoiKQThamDinhND_DuKien) : null}
                        onChange={(date) => {
                            if (dayjs.isDayjs(date) && date.isValid()) {
                                setNgayTraLoiKQThamDinhND_DuKien(date.format("YYYY-MM-DD"));
                            } else {
                                setNgayTraLoiKQThamDinhND_DuKien(null);
                            }
                        }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày kết quả thẩm định nội dung đơn"
                        disabled
                        className="mt-1 w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-left">Ngày trả lời kết quả thẩm định nội dung đơn</label>
                    
                    <DatePicker
                        value={ngayTraLoiKQThamDinhND ? dayjs(ngayTraLoiKQThamDinhND) : null}
                        onChange={(date) => {
                            if (dayjs.isDayjs(date) && date.isValid()) {
                                setNgayTraLoiKQThamDinhND(date.format("YYYY-MM-DD"));
                            } else {
                                setNgayTraLoiKQThamDinhND(null);
                            }
                        }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày kết quả thẩm định nội dung đơn"
                        disabled={isViewOnly}
                        className="mt-1 w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default ReplyContentRating;
