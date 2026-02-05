import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, Select, Radio } from 'antd';
import 'dayjs/locale/vi';

const { Option } = Select;

const DiphimaProcess = ({
    ngayThongBaoCapBang,
    setNgayThongBaoCapBang,
    ngayNopPhiCapBang,
    setNgayNopPhiCapBang,
    ngayNhanBang,
    setNgayNhanBang,
    isViewOnly,
    trangThaiCapBang,
    setTrangThaiCapBang,
    hanNopYKien,
    setHanNopYKien,
    ngayNopYKien,
    setNgayNopYKien,
    ngayNhanKQYKien,
    setNgayNhanKQYKien,
    ketQuaYKien,
    setKetQuaYKien,
    hanNopPhiCapBang,
    setHanNopPhiCapBang
}) => {
    useEffect(() => {
        console.log("Trạng thái cấp bằng:", trangThaiCapBang)
    }, [trangThaiCapBang])
    const showOptions = !!ngayThongBaoCapBang;

    const showNgayYKienVaKetQua = trangThaiCapBang === false;
    const showNgayNopVaNhanBang =
        trangThaiCapBang === true || (trangThaiCapBang === false && ketQuaYKien === true);

    return (
        <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">📌 Hoàn tất nhận bằng</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 text-left">Ngày thông báo cấp bằng</label>
                    <DatePicker
                        value={ngayThongBaoCapBang ? dayjs(ngayThongBaoCapBang) : null}
                        onChange={(date) => {
                            if (dayjs.isDayjs(date) && date.isValid()) {
                                setNgayThongBaoCapBang(date.format("YYYY-MM-DD"));
                            } else {
                                setNgayThongBaoCapBang(null);
                                setTrangThaiCapBang(null);
                                setNgayNopYKien(null);
                                setKetQuaYKien(null);
                            }
                        }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày thông báo cấp bằng"
                        disabled={isViewOnly}
                        className="mt-1 w-full"
                    />
                </div>

                {/* Chọn trạng thái cấp bằng */}
                {showOptions && (
                    <div>
                        <label className="block text-gray-700 text-left mt-2">Trạng thái đồng ý cấp bằng</label>
                        <Radio.Group
                            onChange={(e) => {
                                const value = e.target.value === "true"; // Convert string to boolean
                                setTrangThaiCapBang(value);
                                if (value === true) {
                                    setNgayNopYKien(null);
                                    setKetQuaYKien(null);
                                }
                            }}
                            value={trangThaiCapBang === true ? "true" : trangThaiCapBang === false ? "false" : null}
                            className="mt-2"
                            disabled={isViewOnly}
                        >
                            <Radio value="true">Đồng ý</Radio>
                            <Radio value="false">Không đồng ý</Radio>
                        </Radio.Group>

                    </div>
                )}
                {/* Ngày nộp ý kiến & kết quả ý kiến */}
                {showNgayYKienVaKetQua && (
                    <>
                        <div>
                            <label className="block text-gray-700 text-left">Hạn nộp ý kiến</label>
                            <DatePicker
                                value={hanNopYKien ? dayjs(hanNopYKien) : null}
                                onChange={(date) => {
                                    if (dayjs.isDayjs(date) && date.isValid()) {
                                        setHanNopYKien(date.format("YYYY-MM-DD"));
                                    } else {
                                        setHanNopYKien(null);
                                    }
                                }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn hạn nộp ý kiến"
                                disabled
                                className="mt-1 w-full disabled"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">Ngày nộp ý kiến</label>
                            <DatePicker
                                value={ngayNopYKien ? dayjs(ngayNopYKien) : null}
                                onChange={(date) => {
                                    if (dayjs.isDayjs(date) && date.isValid()) {
                                        setNgayNopYKien(date.format("YYYY-MM-DD"));
                                    } else {
                                        setNgayNopYKien(null);
                                    }
                                }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày nộp ý kiến"
                                disabled={isViewOnly}
                                className="mt-1 w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">Ngày thông báo cấp bằng lần 2</label>
                            <DatePicker
                                value={ngayNhanKQYKien ? dayjs(ngayNhanKQYKien) : null}
                                onChange={(date) => {
                                    if (dayjs.isDayjs(date) && date.isValid()) {
                                        setNgayNhanKQYKien(date.format("YYYY-MM-DD"));
                                    } else {
                                        setNgayNhanKQYKien(null);
                                    }
                                }}
                                format="DD/MM/YYYY"
                                placeholder="Nhâp ngày thông báo cấp bằng"
                                disabled={isViewOnly}
                                className="mt-1 w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">Kết quả ý kiến</label>
                            <Radio.Group
                                onChange={(e) => setKetQuaYKien(e.target.value === "true")}
                                value={ketQuaYKien === true ? "true" : ketQuaYKien === false ? "false" : null}
                                className="mt-2"
                                disabled={isViewOnly}
                            >
                                <Radio value="true">Thỏa đáng</Radio>
                                <Radio value="false">Không thỏa đáng</Radio>
                            </Radio.Group>
                        </div>
                    </>
                )}
                {showNgayNopVaNhanBang && (
                    <>
                        <div>
                            <label className="block text-gray-700 text-left">Hạn nộp phí cấp bằng</label>
                            <DatePicker
                                value={hanNopPhiCapBang ? dayjs(hanNopPhiCapBang) : null}
                                onChange={(date) => {
                                    if (dayjs.isDayjs(date) && date.isValid()) {
                                        setHanNopPhiCapBang(date.format("YYYY-MM-DD"));
                                    } else {
                                        setHanNopPhiCapBang(null);
                                    }
                                }}
                                format="DD/MM/YYYY"
                                placeholder="Hạn nộp phí cấp bằng"
                                disabled
                                className="mt-1 w-full disabled"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">Ngày nộp phí cấp bằng</label>
                            <DatePicker
                                value={ngayNopPhiCapBang ? dayjs(ngayNopPhiCapBang) : null}
                                onChange={(date) => {
                                    if (dayjs.isDayjs(date) && date.isValid()) {
                                        setNgayNopPhiCapBang(date.format("YYYY-MM-DD"));
                                    } else {
                                        setNgayNopPhiCapBang(null);
                                    }
                                }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày nộp phí cấp bằng"
                                disabled={isViewOnly}
                                className="mt-1 w-full"
                            />
                             <label className="block text-gray-700 text-left"><span className="text-red-500">*</span> Luật sư phải tạo vụ việc nộp phí cấp bằng và yêu cầu xuất bill, nếu chưa thu phí cấp bằng của khách hàng</label>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-left">Ngày nhận bằng</label>
                            <DatePicker
                                value={ngayNhanBang ? dayjs(ngayNhanBang) : null}
                                onChange={(date) => {
                                    if (dayjs.isDayjs(date) && date.isValid()) {
                                        setNgayNhanBang(date.format("YYYY-MM-DD"));
                                    } else {
                                        setNgayNhanBang(null);
                                    }
                                }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày nhận bằng"
                                disabled={isViewOnly}
                                className="mt-1 w-full"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DiphimaProcess;
