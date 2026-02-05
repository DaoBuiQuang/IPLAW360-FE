// components/CongBoDon.jsx
import React from 'react';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import 'dayjs/locale/vi';
const AnnouncementOfApplication = ({
    ngayCongBo_DuKien,
    setNgayCongBo_DuKien,
    ngayCongBo,
    setNgayCongBo,
    isViewOnly,
}) => {
    return (
        <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-700 mb-2 uppercase">📌 Công bố đơn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 text-left">Ngày công bố đơn dự kiến</label>
                      <DatePicker
                        value={ngayCongBo_DuKien ? dayjs(ngayCongBo_DuKien) : null}
                        onChange={(date) => {
                            if (dayjs.isDayjs(date) && date.isValid()) {
                                setNgayCongBo_DuKien(date.format("YYYY-MM-DD"));
                            } else {
                                setNgayCongBo_DuKien(null);
                            }
                        }}
                        format="DD/MM/YYYY"
                        className="mt-1 w-full"
                        disabled
                    />
                    
                </div>
                <div>
                    <label className="block text-gray-700 text-left">Ngày công bố đơn</label>
                    <DatePicker
                        value={ngayCongBo ? dayjs(ngayCongBo) : null}
                        onChange={(date) => {
                            if (dayjs.isDayjs(date) && date.isValid()) {
                                setNgayCongBo(date.format("YYYY-MM-DD"));
                            } else {
                                setNgayCongBo(null);
                            }
                        }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày công bố đơn"
                        className="mt-1 w-full"
                        disabled={isViewOnly}
                    />
                </div>
            </div>
        </div>
    );
};

export default AnnouncementOfApplication;
