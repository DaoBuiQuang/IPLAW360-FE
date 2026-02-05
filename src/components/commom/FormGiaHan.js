// components/CongBoDon.jsx
import React from 'react';
import Select from "react-select";
import dayjs from 'dayjs';
import { DatePicker, Radio } from 'antd';
import 'dayjs/locale/vi';

const FormGiaHan = ({
    ngayNopYCGiaHan,
    setNgayNopYCGiaHan,
    donGoc,
    setDonGoc,
    ngayKQThamDinh_DuKien,
    setNgayKQThamDinh_DuKien,
    trangThaiThamDinh,
    setTrangThaiThamDinh,
    ngayThongBaoTuChoiGiaHan,
    setNgayThongBaoTuChoiGiaHan,
    hanTraLoiTuChoiGiaHan,
    setHanTraLoiTuChoiGiaHan,
    ngayTraLoiThongBaoTuChoiGiaHan,
    setNgayTraLoiThongBaoTuChoiGiaHan,
    trangThaiTuChoiGiaHan,
    setTrangThaiTuChoiGiaHan,
    ngayQuyetDinhTuChoiGiaHan,
    setNgayQuyetDinhTuChoiGiaHan,
    ngayQuyetDinhGiaHan_DuKien,
    setNgayQuyetDinhGiaHan_DuKien,
    ngayQuyetDinhGiaHan,
    setNgayQuyetDinhGiaHan,
    ngayDangBa,
    setNgayDangBa,
    soDon,
    setSoDon
}) => {

    return (
        <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ngày yêu cầu gia hạn */}
                <div >
                    <label className="block text-gray-700 text-left ">Số đơn</label>
                    <input
                        type="text"
                        value={soDon}
                        placeholder="Nhập số đơn"
                        onChange={(e) => setSoDon(e.target.value)}
                        className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-left">Ngày yêu cầu gia hạn</label>
                    <DatePicker
                        value={ngayNopYCGiaHan ? dayjs(ngayNopYCGiaHan) : null}
                        onChange={(date) =>
                            setNgayNopYCGiaHan(date && date.isValid() ? date.format("YYYY-MM-DD") : null)
                        }
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày nộp yêu cầu gia hạn"
                        className="mt-1 w-full"
                        disabledDate={(current) => current && current > dayjs().endOf("day")}
                    />
                </div>

                {/* Đơn gốc */}
                {/* <div>
                    <label className="block text-gray-700 text-left mt-2">Đơn gốc</label>
                    <Radio.Group
                        onChange={(e) => setDonGoc(e.target.value === "true")}
                        value={donGoc === true ? "true" : donGoc === false ? "false" : null}
                        className="mt-2"
                    >
                        <Radio value="true">Đơn gốc</Radio>
                        <Radio value="false">Không phải đơn gốc</Radio>
                    </Radio.Group>
                </div> */}

                {/* Ngày kết quả thẩm định dự kiến */}
                <div>
                    <label className="block text-gray-700 text-left">Ngày kết quả thẩm định dự kiến</label>
                    <DatePicker
                        value={ngayKQThamDinh_DuKien ? dayjs(ngayKQThamDinh_DuKien) : null}
                        onChange={(date) =>
                            setNgayKQThamDinh_DuKien(date && date.isValid() ? date.format("YYYY-MM-DD") : null)
                        }
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày kết quả thẩm định dự kiến"
                        className="mt-1 w-full"
                        disabledDate={(current) => current && current > dayjs().endOf("day")}
                    />
                </div>

                {/* Trạng thái thẩm định */}
                <div>
                    <label className="block text-gray-700 text-left mt-2">Trạng thái thẩm định</label>
                    <Radio.Group
                        onChange={(e) => setTrangThaiThamDinh(e.target.value === "true")}
                        value={trangThaiThamDinh === true ? "true" : trangThaiThamDinh === false ? "false" : null}
                        className="mt-2"
                    >
                        <Radio value="true">Thành công</Radio>
                        <Radio value="false">Thất bại</Radio>
                    </Radio.Group>
                </div>

                {/* Nếu thất bại mới hiện các input này */}
                {trangThaiThamDinh === false && (
                    <>
                        {/* Ngày thông báo dự định từ chối gia hạn */}
                        <div>
                            <label className="block text-gray-700 text-left">Ngày thông báo dự định từ chối gia hạn</label>
                            <DatePicker
                                value={ngayThongBaoTuChoiGiaHan ? dayjs(ngayThongBaoTuChoiGiaHan) : null}
                                onChange={(date) =>
                                    setNgayThongBaoTuChoiGiaHan(date && date.isValid() ? date.format("YYYY-MM-DD") : null)
                                }
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày thông báo"
                                className="mt-1 w-full"
                                disabledDate={(current) => current && current > dayjs().endOf("day")}
                            />
                        </div>

                        {/* Hạn trả lời từ chối gia hạn */}
                        <div>
                            <label className="block text-gray-700 text-left">Hạn trả lời từ chối gia hạn</label>
                            <DatePicker
                                value={hanTraLoiTuChoiGiaHan ? dayjs(hanTraLoiTuChoiGiaHan) : null}
                                onChange={(date) =>
                                    setHanTraLoiTuChoiGiaHan(date && date.isValid() ? date.format("YYYY-MM-DD") : null)
                                }
                                format="DD/MM/YYYY"
                                placeholder="Chọn hạn trả lời"
                                className="mt-1 w-full"
                                disabledDate={(current) => current && current > dayjs().endOf("day")}
                            />
                        </div>

                        {/* Ngày trả lời thông báo từ chối gia hạn */}
                        <div>
                            <label className="block text-gray-700 text-left">Ngày trả lời thông báo từ chối gia hạn</label>
                            <DatePicker
                                value={ngayTraLoiThongBaoTuChoiGiaHan ? dayjs(ngayTraLoiThongBaoTuChoiGiaHan) : null}
                                onChange={(date) =>
                                    setNgayTraLoiThongBaoTuChoiGiaHan(date && date.isValid() ? date.format("YYYY-MM-DD") : null)
                                }
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày trả lời"
                                className="mt-1 w-full"
                                disabledDate={(current) => current && current > dayjs().endOf("day")}
                            />
                        </div>

                        {/* Trạng thái đồng ý cấp bằng */}
                        <div>
                            <label className="block text-gray-700 text-left mt-2">Trạng thái đồng ý cấp bằng</label>
                            <Radio.Group
                                onChange={(e) => setTrangThaiTuChoiGiaHan(e.target.value === "true")}
                                value={trangThaiTuChoiGiaHan === true ? "true" : trangThaiTuChoiGiaHan === false ? "false" : null}
                                className="mt-2"
                            >
                                <Radio value="true">Đồng ý</Radio>
                                <Radio value="false">Không đồng ý</Radio>
                            </Radio.Group>
                        </div>

                        {/* Nếu đồng ý mới hiện ngày quyết định từ chối gia hạn */}
                        {trangThaiTuChoiGiaHan === false && (
                            <div>
                                <label className="block text-gray-700 text-left">Ngày quyết định từ chối gia hạn</label>
                                <DatePicker
                                    value={ngayQuyetDinhTuChoiGiaHan ? dayjs(ngayQuyetDinhTuChoiGiaHan) : null}
                                    onChange={(date) =>
                                        setNgayQuyetDinhTuChoiGiaHan(date && date.isValid() ? date.format("YYYY-MM-DD") : null)
                                    }
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày quyết định"
                                    className="mt-1 w-full"
                                    disabledDate={(current) => current && current > dayjs().endOf("day")}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Các phần khác */}
                {(trangThaiTuChoiGiaHan === true || trangThaiTuChoiGiaHan === null) && (
                    <>
                        <div>
                            <label className="block text-gray-700 text-left">Ngày quyết định gia hạn dự kiến</label>
                            <DatePicker
                                value={ngayQuyetDinhGiaHan_DuKien ? dayjs(ngayQuyetDinhGiaHan_DuKien) : null}
                                onChange={(date) =>
                                    setNgayQuyetDinhGiaHan_DuKien(date && date.isValid() ? date.format("YYYY-MM-DD") : null)
                                }
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày quyết định dự kiến"
                                className="mt-1 w-full"
                                disabledDate={(current) => current && current > dayjs().endOf("day")}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-left">Ngày quyết định gia hạn</label>
                            <DatePicker
                                value={ngayQuyetDinhGiaHan ? dayjs(ngayQuyetDinhGiaHan) : null}
                                onChange={(date) =>
                                    setNgayQuyetDinhGiaHan(date && date.isValid() ? date.format("YYYY-MM-DD") : null)
                                }
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày quyết định gia hạn"
                                className="mt-1 w-full"
                                disabledDate={(current) => current && current > dayjs().endOf("day")}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-left">Ngày đăng bạ</label>
                            <DatePicker
                                value={ngayDangBa ? dayjs(ngayDangBa) : null}
                                onChange={(date) =>
                                    setNgayDangBa(date && date.isValid() ? date.format("YYYY-MM-DD") : null)
                                }
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày đăng bạ"
                                className="mt-1 w-full"
                                disabledDate={(current) => current && current > dayjs().endOf("day")}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FormGiaHan;
