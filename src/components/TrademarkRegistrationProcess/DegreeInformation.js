// components/CongBoDon.jsx
import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import 'dayjs/locale/vi';
import callAPI from '../../utils/api';
import Select from "react-select";

const DegreeInformation = ({
    soBang,
    setSoBang,
    quyetDinhSo,
    setQuyetDinhSo,
    ngayCapBang,
    setNgayCapBang,
    ngayHetHanBang,
    setNgayHetHanBang,
    ngayGuiBangChoKH,
    setNgayGuiBangChoKH,
    isViewOnly,
    idSoBangOld, setIdSoBangOld
}) => {

    const [degrees, setDegrees] = React.useState([]);
    const [showSelectExisting, setShowSelectExisting] = React.useState(false);

    const fetchDegrees = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/degree/shortlist",
                data: {},
            });
            setDegrees(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu giấy chứng nhận", error);
        }
    };

    useEffect(() => {
        fetchDegrees();
    }, []);

    const handleToggleMode = () => {
        setShowSelectExisting(prev => !prev);
        setIdSoBangOld(null);
        setSoBang("");
    };

    const formatOptions = (data, valueField, labelField) =>
        data.map(item => ({
            value: item[valueField],
            label: item[labelField]
        }));

    return (
        <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">📌 Thông tin bằng</h3>

            {/* <div className="col-span-1 flex justify-end">
                <button
                    type="button"
                    onClick={handleToggleMode}
                    className="text-blue-600 underline text-sm"
                >
                    {showSelectExisting
                        ? "← Tạo giấy chứng nhận (văn bằng) mới"
                        : "→ Chọn giấy chứng nhận (văn bằng) có sẵn?"}
                </button>
            </div> */}

            {showSelectExisting && !soBang ? (
                <div className="mt-2">
                    <label className="block text-gray-700 text-left mb-1">
                        Chọn giấy chứng nhận (văn bằng) có sẵn{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <Select
                        options={formatOptions(degrees, "id", "soBang")}
                        value={
                            idSoBangOld
                                ? formatOptions(degrees, "id", "soBang").find(
                                    (opt) => opt.value === idSoBangOld
                                )
                                : null
                        }
                        onChange={(opt) => setIdSoBangOld(opt ? opt.value : null)}
                        isClearable
                        placeholder="Chọn văn bằng"
                        className="mt-1 text-left"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex-1">
                        <label className="block text-gray-700 text-left">Số bằng</label>
                        <input
                            type="text"
                            value={soBang}
                            onChange={(e) => setSoBang(e.target.value)}
                            className={`w-full p-2 mt-1 border rounded-lg text-input ${isViewOnly ? "bg-gray-200" : ""
                                }`}
                            disabled={isViewOnly}
                            placeholder="Nhập số bằng"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-gray-700 text-left">Quyết định số</label>
                        <input
                            type="text"
                            value={quyetDinhSo}
                            onChange={(e) => setQuyetDinhSo(e.target.value)}
                            className={`w-full p-2 mt-1 border rounded-lg text-input ${isViewOnly ? "bg-gray-200" : ""
                                }`}
                            disabled={isViewOnly}
                            placeholder="Nhập quyết định số"
                        />
                    </div>

                </div>
            )}

            {/* Luôn hiển thị 2 field này */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="block text-gray-700 text-left">Ngày hết hạn bằng</label>
                    <DatePicker
                        value={ngayHetHanBang ? dayjs(ngayHetHanBang) : null}
                        onChange={(date) => {
                            setNgayHetHanBang(
                                date && date.isValid() ? date.format("YYYY-MM-DD") : null
                            );
                        }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày hết hạn bằng"
                        disabled={isViewOnly}
                        className="mt-1 w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-left">Ngày cấp bằng</label>
                    <DatePicker
                        value={ngayCapBang ? dayjs(ngayCapBang) : null}
                        onChange={(date) => {
                            setNgayCapBang(
                                date && date.isValid() ? date.format("YYYY-MM-DD") : null
                            );
                        }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày cấp bằng"
                        disabled={isViewOnly}
                        className="mt-1 w-full"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-left">
                        Ngày gửi bằng cho khách hàng
                    </label>
                    <DatePicker
                        value={ngayGuiBangChoKH ? dayjs(ngayGuiBangChoKH) : null}
                        onChange={(date) => {
                            setNgayGuiBangChoKH(
                                date && date.isValid() ? date.format("YYYY-MM-DD") : null
                            );
                        }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày gửi bằng cho khách hàng"
                        disabled={isViewOnly}
                        className="mt-1 w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default DegreeInformation;
