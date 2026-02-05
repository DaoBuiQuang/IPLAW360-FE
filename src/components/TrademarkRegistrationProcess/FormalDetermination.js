import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import 'dayjs/locale/vi';
const FormalDetermination = ({
    ngayKQThamDinhHinhThuc_DuKien,
    setNgayKQThamDinhHinhThuc_DuKien,
    ngayKQThamDinhHinhThuc,
    setNgayKQThamDinhHinhThuc,
    lichSuThamDinhHT,
    setLichSuThamDinhHT,
    ngayKQThamDinhHinhThuc_DK_SauKN,
    setNgayKQThamDinhHinhThuc_DK_SauKN,
    buocXuLy,
    setBuocXuLy,
    isViewOnly
}) => {
    const [daDat, setDaDat] = useState(false);
    const [daKNThanhCong, setDaKNThanhCong] = useState(false);
    const [showLichSu, setShowLichSu] = useState(true);
    useEffect(() => {

        lichSuThamDinhHT.forEach((item, index) => {
            if (item.hanKhieuNaiCSHTT && !item.showKhieuNaiCSHCTForm) {
                updateRefusal(index, 'showKhieuNaiCSHCTForm', true);
            }
            if (item.hanKhieuNaiBKHCN && !item.showKhieuNaiBKHCNForm) {
                updateRefusal(index, 'showKhieuNaiBKHCNForm', true);
            }
            if (item.ketQuaKhieuNaiBKHCN === "ThanhCong" || item.ketQuaKhieuNaiCSHTT === "ThanhCong") {
                handleKNThanhCong();
            }

            if (item.ngayNhanThongBaoTuChoiTD && !item.ngayNhanQuyetDinhTuChoi && !item.trangThaiBiNhanQuyetDinhTuChoi && !item.ngayTraLoiThongBaoTuChoi) {
                setBuocXuLy(`Chờ trả lời thông báo từ chối thẩm định hình thức lần: ${item.lanThamDinh}`);
            }

            if (item.ngayNhanThongBaoTuChoiTD && !item.trangThaiBiNhanQuyetDinhTuChoi && item.ngayTraLoiThongBaoTuChoi) {
                setBuocXuLy(`Chờ cục phản hồi trả lời thông báo từ chối thẩm định hình thức lần: ${item.lanThamDinh}`);
            }
            if ((item.ketQuaKhieuNaiCSHTT === "ThatBai" || !item.ketQuaKhieuNaiCSHTT) && item.ngayKhieuNaiCSHTT) {
                setBuocXuLy("Chờ kết quả khiếu nại cục sở hữu trí tuệ");
            }
            if ((item.ketQuaKhieuNaiBKHCN === "ThatBai" || !item.ketQuaKhieuNaiBKHCN) && item.ngayKhieuNaiBKHCN) {
                setBuocXuLy("Chờ kết quả khiếu nại bộ khoa học và công nghệ");
            }
        });
    }, [lichSuThamDinhHT]);

    const handleThatBaiure = () => {
        const today = dayjs();
        const hanTraLoi = today.add(2, 'month').format('YYYY-MM-DD');

        setLichSuThamDinhHT(prev => [
            ...prev,
            {
                loaiThamDinh: 'HinhThuc',
                lanThamDinh: prev.length + 1,
                ngayNhanThongBaoTuChoiTD: today,
                hanTraLoi: hanTraLoi,
                giaHan: false,
                ghiChu: ""
            }
        ]);
    };
    const handleDat = () => {
        const today = dayjs().format('YYYY-MM-DD');
        setNgayKQThamDinhHinhThuc(today);
        setDaDat(true);
    };
    const handleKNThanhCong = () => {
        setDaKNThanhCong(true);
        setDaDat(true);
    };
    const handleKNThatBai = () => {
        setDaKNThanhCong(false);
        setDaDat(false);
        setNgayKQThamDinhHinhThuc_DK_SauKN(null);
    };
    const updateRefusal = (index, field, value) => {
        const updated = [...lichSuThamDinhHT];
        updated[index][field] = value;
        if (field === "ngayNhanThongBaoTuChoiTD") {
            if (value) {
                const newHan = dayjs(value).add(2, 'month').format('YYYY-MM-DD');
                updated[index].hanTraLoi = newHan;
            } else {
                updated[index].hanTraLoi = null;
            }
        }

        if (field === "giaHan") {
            const refusal = updated[index];
            let hanTraLoi = dayjs(refusal.hanTraLoi);

            if (value) {
                hanTraLoi = hanTraLoi.add(2, 'month');
                if (refusal.ngayGiaHan) {
                    updated[index].hanTraLoiGiaHan = dayjs(refusal.ngayGiaHan).add(2, 'month').format('YYYY-MM-DD');
                }
            } else {
                hanTraLoi = hanTraLoi.subtract(2, 'month');
                updated[index].hanTraLoiGiaHan = null; // reset nếu không gia hạn nữa
            }

            updated[index].hanTraLoi = hanTraLoi.format('YYYY-MM-DD');
        }

        if (field === 'showKhieuNaiCSHCTForm' && value === true) {
            const ngayTuChoi = updated[index].ngayNhanQuyetDinhTuChoi;
            if (ngayTuChoi) {
                const newHan = dayjs(ngayTuChoi).add(90, 'day').format('YYYY-MM-DD');
                updated[index].hanKhieuNaiCSHTT = newHan;
            }
        }
        if (field === 'showKhieuNaiBKHCNForm' && value === true) {
            const ngayTuChoi = updated[index].ngayKQ_KN_CSHTT;
            if (ngayTuChoi) {
                const newHan = dayjs(ngayTuChoi).add(30, 'day').format('YYYY-MM-DD');
                updated[index].hanKhieuNaiBKHCN = newHan;
            }
        }
        setLichSuThamDinhHT(updated);
    };

    const deleteRefusal = (index) => {
        const updated = lichSuThamDinhHT.filter((_, i) => i !== index);
        setLichSuThamDinhHT(updated);
    };
    const resetKhieuNaiBKHCN = (updateRefusal, index) => {
        updateRefusal(index, 'showKhieuNaiBKHCNForm', false);
        updateRefusal(index, 'hanKhieuNaiBKHCN', null);
        updateRefusal(index, 'ngayKhieuNaiBKHCN', null);
        updateRefusal(index, 'ketQuaKhieuNaiBKHCN', null);
        updateRefusal(index, 'ngayKQ_KN_BKHCN', null);
        updateRefusal(index, 'ghiChuKetQuaKNBKHCN', null);
    };
    const resetKhieuNaiCSHTT = (updateRefusal, index) => {
        updateRefusal(index, 'showKhieuNaiCSHCTForm', false);
        updateRefusal(index, 'hanKhieuNaiCSHTT', null);
        updateRefusal(index, 'ngayKhieuNaiCSHTT', null);
        updateRefusal(index, 'ketQuaKhieuNaiCSHTT', null);
        updateRefusal(index, 'ngayKQ_KN_CSHTT', null);
        updateRefusal(index, 'ghiChuKetQuaKNCSHTT', null);
    };

    return (
        <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-700 mb-2 uppercase">📌 Thẩm định hình thức</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 text-left">Ngày kết quả thẩm định hình thức dự kiến</label>
                    <DatePicker
                        value={ngayKQThamDinhHinhThuc_DuKien ? dayjs(ngayKQThamDinhHinhThuc_DuKien) : null}
                        onChange={(date) => {
                            if (dayjs.isDayjs(date) && date.isValid()) {
                                setNgayKQThamDinhHinhThuc_DuKien(date.format("YYYY-MM-DD"));
                            } else {
                                setNgayKQThamDinhHinhThuc_DuKien(null);
                            }
                        }}
                        format="DD/MM/YYYY"
                        disabled
                        className="mt-1 w-full"
                    />
                </div>
                {(daDat || ngayKQThamDinhHinhThuc) && (
                    <>
                        {(daKNThanhCong || ngayKQThamDinhHinhThuc_DK_SauKN) && (
                            <div>
                                <label className="block text-gray-700 text-left">
                                    Ngày KQ thẩm định hình thức sau KN dự kiến
                                </label>
                                <DatePicker
                                    value={ngayKQThamDinhHinhThuc_DK_SauKN ? dayjs(ngayKQThamDinhHinhThuc_DK_SauKN) : null}
                                    onChange={(date) => {
                                        if (dayjs.isDayjs(date) && date.isValid()) {
                                            setNgayKQThamDinhHinhThuc_DK_SauKN(date.format("YYYY-MM-DD"));
                                        } else {
                                            setNgayKQThamDinhHinhThuc_DK_SauKN(null);
                                        }
                                    }}
                                    format="DD/MM/YYYY"
                                    className="mt-1 w-full"
                                    disabled={isViewOnly}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-gray-700 text-left">Ngày chấp nhận đơn hợp lệ</label>
                            <DatePicker
                                value={ngayKQThamDinhHinhThuc ? dayjs(ngayKQThamDinhHinhThuc) : null}
                                onChange={(date) => {
                                    if (dayjs.isDayjs(date) && date.isValid()) {
                                        setNgayKQThamDinhHinhThuc(date.format("YYYY-MM-DD"));
                                    } else {
                                        setNgayKQThamDinhHinhThuc(null);
                                    }
                                }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày chấp nhận đơn hợp lệ"
                                className="mt-1 w-full"
                                disabled={isViewOnly}
                            />
                        </div>
                    </>
                )}
            </div>
            {lichSuThamDinhHT.length > 0 && (
                <button
                    type="button"
                    onClick={() => setShowLichSu(!showLichSu)}
                    className="text-blue-600 underline text-sm"
                >
                    {showLichSu ? "Ẩn lịch sử thẩm định" : "Hiển thị lịch sử thẩm định"}
                </button>
            )}
            {lichSuThamDinhHT.length === 0 && !isViewOnly && (
                <div className="mt-4 flex space-x-2">
                    <button
                        type="button"
                        onClick={() => {
                            handleDat(); // gọi logic cũ nếu cần 
                        }}
                        disabled={isViewOnly}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                        Đạt
                    </button>
                    <button
                        type="button"
                        onClick={handleThatBaiure}
                        disabled={isViewOnly}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                        Không đạt
                    </button>
                </div>
            )}
            {lichSuThamDinhHT.length > 0 && showLichSu && (
                <div className="mt-4 border">
                    {lichSuThamDinhHT.map((refusal, index) => {
                        const hanTraLoi = refusal.hanTraLoi;

                        // const baseHanTraLoi = dayjs(refusal.ngayNhanThongBaoTuChoiTD).add(3, 'month');
                        // const ngayTraLoiThongBaoTuChoi = refusal.ngayTraLoiThongBaoTuChoi;
                        // const hanTraLoi = baseHanTraLoi.format('YYYY-MM-DD');
                        //  const basengayGiaHan= dayjs(refusal.ngayGiaHan).add(3, 'month');
                        const hanTraLoiGiaHan = refusal.hanTraLoiGiaHan;

                        return (
                            <div key={index} className="p-1  rounded-md bg-gray-50 text-sm">
                                <div className="flex justify-between items-center ">
                                    <span className="font-semibold text-gray-700">Lần nhận thông báo từ chối #{index + 1}</span>
                                    {!isViewOnly && (
                                        <button
                                            type="button"
                                            onClick={() => deleteRefusal(index)}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                            disabled={isViewOnly}
                                        >
                                            🗑 Xóa
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-10 gap-3 items-center">
                                    <div className="md:col-span-3">
                                        <label className="block text-gray-600 text-left">Ngày thông báo từ chối</label>
                                        <DatePicker
                                            value={refusal.ngayNhanThongBaoTuChoiTD ? dayjs(refusal.ngayNhanThongBaoTuChoiTD) : null}
                                            onChange={(date) => {
                                                if (dayjs.isDayjs(date) && date.isValid()) {
                                                    updateRefusal(index, 'ngayNhanThongBaoTuChoiTD', date.format("YYYY-MM-DD"));
                                                } else {
                                                    updateRefusal(index, 'ngayNhanThongBaoTuChoiTD', null);
                                                }
                                            }}
                                            format="DD/MM/YYYY"
                                            placeholder="Chọn ngày thông báo từ chối"
                                            disabled={isViewOnly}
                                            className="mt-1 w-full text-left"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-gray-600 text-left">Hạn trả lời</label>
                                        <DatePicker
                                            value={hanTraLoi ? dayjs(hanTraLoi) : null}
                                            format="DD/MM/YYYY"
                                            className="w-full disabled"
                                            placeholder='Hạn trả lời'
                                            disabled
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-gray-600 text-left">Ghi chú</label>
                                        <input
                                            type="text"
                                            placeholder='Nhập ghi chú...'
                                            value={refusal.ghiChu || ''}
                                            onChange={(e) => updateRefusal(index, 'ghiChu', e.target.value)}
                                            disabled={isViewOnly}
                                            className="w-full p-2 mt-1 border rounded-md text-input"
                                        />
                                    </div>
                                    {!isViewOnly && refusal.ngayNhanThongBaoTuChoiTD && (
                                        <>
                                            <div className="md:col-span-1">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={refusal.giaHan}
                                                        onChange={(e) => updateRefusal(index, 'giaHan', e.target.checked)}
                                                        className="mr-2"
                                                    />
                                                    Gia hạn
                                                </label>
                                            </div>

                                            {refusal.giaHan && (
                                                <>
                                                    <div className="md:col-span-3">
                                                        <label className="block text-gray-600 text-left">Ngày yêu cầu gia hạn</label>
                                                        <DatePicker
                                                            value={refusal.ngayGiaHan ? dayjs(refusal.ngayGiaHan) : null}
                                                            onChange={(date) => {
                                                                if (dayjs.isDayjs(date) && date.isValid()) {
                                                                    updateRefusal(index, 'ngayGiaHan', date.format("YYYY-MM-DD"));
                                                                    const newHanGiaHan = dayjs(hanTraLoi).add(2, 'month').format('YYYY-MM-DD'); // ← Cập nhật theo hạn trả lời
                                                                    updateRefusal(index, 'hanTraLoiGiaHan', newHanGiaHan);
                                                                } else {
                                                                    updateRefusal(index, 'ngayGiaHan', null);
                                                                    updateRefusal(index, 'hanTraLoiGiaHan', null);
                                                                }
                                                            }}
                                                            placeholder='Chọn ngày yêu cầu gia hạn'
                                                            format="DD/MM/YYYY"
                                                            className="w-full disabled"

                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <label className="block text-gray-600 text-left">Hạn trả lời sau khi gia hạn</label>
                                                        <DatePicker
                                                            value={hanTraLoiGiaHan ? dayjs(hanTraLoiGiaHan) : null}
                                                            format="DD/MM/YYYY"
                                                            className="w-full disabled"
                                                            disabled
                                                        />
                                                    </div>
                                                    {/* <div className="md:col-span-3">
                                                        <label className="block text-gray-600 text-left">Hạn trả lời sau khi gia hạn</label>
                                                        <DatePicker
                                                            value={refusal.hanTraLoiGiaHan ? dayjs(refusal.hanTraLoiGiaHan) : null}
                                                            onChange={(date) => {
                                                                if (dayjs.isDayjs(date) && date.isValid()) {
                                                                    updateRefusal(index, 'hanTraLoiGiaHan', date.format("YYYY-MM-DD"));
                                                                } else {
                                                                    updateRefusal(index, 'hanTraLoiGiaHan', null);
                                                                }
                                                            }}
                                                            format="DD/MM/YYYY"
                                                            className="w-full disabled"
                                                            disabled
                                                        />
                                                    </div> */}
                                                </>
                                            )}
                                        </>
                                    )}
                                    <div className="md:col-span-3">
                                        <label className="block text-gray-600 text-left">Ngày trả lời</label>
                                        <DatePicker
                                            value={refusal.ngayTraLoiThongBaoTuChoi ? dayjs(refusal.ngayTraLoiThongBaoTuChoi) : null}
                                            onChange={(date) => {
                                                if (dayjs.isDayjs(date) && date.isValid()) {
                                                    updateRefusal(index, 'ngayTraLoiThongBaoTuChoi', date.format("YYYY-MM-DD"));
                                                } else {
                                                    updateRefusal(index, 'ngayTraLoiThongBaoTuChoi', null);
                                                }
                                            }}
                                            format="DD/MM/YYYY"
                                            placeholder="Chọn ngày trả lời"
                                            disabled={isViewOnly}
                                            className="mt-1 w-full"
                                        />
                                    </div>
                                </div>
                                {!isViewOnly && index === lichSuThamDinhHT.length - 1 && !refusal.showKhieuNaiForm && (
                                    <div className="flex space-x-2 mt-3">
                                        {!refusal.trangThaiBiNhanQuyetDinhTuChoi && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleDat}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                                                >
                                                    Đạt
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleThatBaiure}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                                                >
                                                    Không đạt
                                                </button>
                                            </>)}
                                        <button
                                            type="button"
                                            onClick={() => updateRefusal(index, 'trangThaiBiNhanQuyetDinhTuChoi', true)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-xs"
                                        >
                                            Nhận quyết định từ chối
                                        </button>
                                    </div>
                                )}
                                {refusal.trangThaiBiNhanQuyetDinhTuChoi && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="mt-3">
                                            <label className="block text-gray-600 text-left">Ngày nhận quyết định từ chối</label>
                                            <DatePicker
                                                value={refusal.ngayNhanQuyetDinhTuChoi ? dayjs(refusal.ngayNhanQuyetDinhTuChoi) : null}
                                                onChange={(date) =>
                                                    updateRefusal(index, 'ngayNhanQuyetDinhTuChoi', date?.format('YYYY-MM-DD'))
                                                }
                                                format="DD/MM/YYYY"
                                                placeholder='Chọn ngày nhận quyết định từ chối'
                                                className="w-full"
                                                disabled={isViewOnly}
                                            />
                                        </div>
                                        <div className="mt-8 flex justify-between items-center col-span-2">
                                            <button
                                                type="button"
                                                onClick={() => updateRefusal(index, 'showKhieuNaiCSHCTForm', true)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                                            >
                                                Khiếu nại Cục sở hữu Trí tuệ
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    resetKhieuNaiCSHTT(updateRefusal, index);
                                                    resetKhieuNaiBKHCN(updateRefusal, index);
                                                    updateRefusal(index, 'trangThaiBiNhanQuyetDinhTuChoi', false);
                                                    updateRefusal(index, 'showKhieuNaiCSHCTForm', false);
                                                }}
                                                className="text-red-500 hover:text-red-700 text-xs ml-auto"
                                                disabled={isViewOnly}
                                            >
                                                🗑 Xóa
                                            </button>

                                        </div>
                                    </div>
                                )}
                                <div className="mt-4">
                                    {refusal.showKhieuNaiCSHCTForm && (

                                        <div className="mt-3 p-3 border rounded bg-white shadow-sm">
                                            <span className="font-semibold text-gray-700 text-left">Khiếu nại Cục sở hữu Trí tuệ</span>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-gray-600 text-left">Hạn khiếu nại</label>
                                                    <DatePicker
                                                        value={refusal.hanKhieuNaiCSHTT ? dayjs(refusal.hanKhieuNaiCSHTT) : null}
                                                        onChange={(date) =>
                                                            updateRefusal(index, 'hanKhieuNaiCSHTT', date?.format('YYYY-MM-DD'))
                                                        }
                                                        format="DD/MM/YYYY"
                                                        className="w-full disabled"
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-600 text-left">Ngày khiếu nại</label>
                                                    <DatePicker
                                                        value={refusal.ngayKhieuNaiCSHTT ? dayjs(refusal.ngayKhieuNaiCSHTT) : null}
                                                        onChange={(date) =>
                                                            updateRefusal(index, 'ngayKhieuNaiCSHTT', date?.format('YYYY-MM-DD'))
                                                        }
                                                        format="DD/MM/YYYY"
                                                        className="w-full"
                                                        placeholder='Chọn ngày khiếu nại'
                                                        disabled={isViewOnly}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        resetKhieuNaiCSHTT(updateRefusal, index);
                                                        resetKhieuNaiBKHCN(updateRefusal, index);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 text-xs ml-auto"
                                                    disabled={isViewOnly}
                                                >
                                                    🗑 Xóa
                                                </button>
                                            </div>

                                            <div className="mt-3">

                                                <div className="flex space-x-4 mt-1">
                                                    <label className="block text-gray-600 text-left">Kết quả khiếu nại: </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name={`ketQuaCSHTT-${index}`}
                                                            value="ThanhCong"
                                                            checked={refusal.ketQuaKhieuNaiCSHTT === 'ThanhCong'}
                                                            onChange={() => {
                                                                updateRefusal(index, 'ketQuaKhieuNaiCSHTT', 'ThanhCong');
                                                                updateRefusal(index, 'ngayKQ_KN_CSHTT', null);
                                                                updateRefusal(index, 'ghiChuKetQuaKNCSHTT', '');
                                                                updateRefusal(index, 'showKhieuNaiBKHCNForm', false);
                                                                resetKhieuNaiBKHCN(updateRefusal, index);
                                                                handleKNThanhCong();
                                                            }}
                                                            className="mr-2"
                                                            disabled={isViewOnly}
                                                        />
                                                        Thành công
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name={`ketQuaCSHTT-${index}`}
                                                            value="ThatBai"
                                                            checked={refusal.ketQuaKhieuNaiCSHTT === 'ThatBai'}
                                                            onChange={() => { updateRefusal(index, 'ketQuaKhieuNaiCSHTT', 'ThatBai'); handleKNThatBai(); }}
                                                            className="mr-2"
                                                            disabled={isViewOnly}
                                                        />
                                                        Thất bại
                                                    </label>
                                                </div>
                                                {['ThatBai', 'ThanhCong'].includes(refusal.ketQuaKhieuNaiCSHTT) && (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="mt-3">
                                                            <label className="block text-gray-600 text-left">
                                                                {refusal.ketQuaKhieuNaiCSHTT === 'ThatBai'
                                                                    ? 'Ngày nhận kết quả khiếu nại thất bại'
                                                                    : 'Ngày quyết định khiếu nại thành công'}
                                                            </label>
                                                            <DatePicker
                                                                value={refusal.ngayKQ_KN_CSHTT ? dayjs(refusal.ngayKQ_KN_CSHTT) : null}
                                                                onChange={(date) =>
                                                                    updateRefusal(index, 'ngayKQ_KN_CSHTT', date?.format('YYYY-MM-DD'))
                                                                }
                                                                format="DD/MM/YYYY"
                                                                className="w-full mt-1 "
                                                                placeholder='Chọn ngày kết quả khiếu nại'
                                                                disabled={isViewOnly}
                                                            />
                                                        </div>

                                                        <div className="mt-3">
                                                            <label className="block text-gray-600 text-left">Ghi chú </label>
                                                            <input
                                                                value={refusal.ghiChuKetQuaKNCSHTT || ''}
                                                                onChange={(e) => updateRefusal(index, 'ghiChuKetQuaKNCSHTT', e.target.value)}
                                                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                                                rows={3}
                                                                placeholder="Nhập ghi chú..."
                                                                disabled={isViewOnly}
                                                            />
                                                        </div>
                                                        {refusal.ketQuaKhieuNaiCSHTT === 'ThatBai' ? (
                                                            <>
                                                                <div className="mt-8 flex justify-between items-center col-span-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateRefusal(index, 'showKhieuNaiBKHCNForm', true)}
                                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                                                                    >
                                                                        Khiếu nại Bộ khoa học và công nghệ
                                                                    </button>
                                                                </div>

                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="mt-3">
                                                                    <label className="block text-gray-600 text-left">
                                                                        Ngày nộp yêu cầu chấp nhận đơn hợp lệ
                                                                    </label>
                                                                    <DatePicker
                                                                        value={refusal.ngayNopYeuCauSauKN ? dayjs(refusal.ngayNopYeuCauSauKN) : null}
                                                                        onChange={(date) =>
                                                                            updateRefusal(index, 'ngayNopYeuCauSauKN', date?.format('YYYY-MM-DD'))
                                                                        }
                                                                        format="DD/MM/YYYY"
                                                                        placeholder='Chọn ngày nộp yêu cầu chấp nhận đơn hợp lệ'
                                                                        className="w-full mt-1"
                                                                        disabled={isViewOnly}
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {refusal.showKhieuNaiBKHCNForm && (
                                                <div className="mt-4 ">
                                                    <span className="font-semibold text-gray-700 mt-4">Khiếu nại bộ khoa học và Công nghệ</span>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-gray-600 text-left">Hạn khiếu nại</label>
                                                            <DatePicker
                                                                value={refusal.hanKhieuNaiBKHCN ? dayjs(refusal.hanKhieuNaiBKHCN) : null}
                                                                onChange={(date) =>
                                                                    updateRefusal(index, 'hanKhieuNaiBKHCN', date?.format('YYYY-MM-DD'))
                                                                }
                                                                format="DD/MM/YYYY"
                                                                className="w-full"
                                                                disabled
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-600 text-left">Ngày khiếu nại</label>
                                                            <DatePicker
                                                                value={refusal.ngayKhieuNaiBKHCN ? dayjs(refusal.ngayKhieuNaiBKHCN) : null}
                                                                onChange={(date) =>
                                                                    updateRefusal(index, 'ngayKhieuNaiBKHCN', date?.format('YYYY-MM-DD'))
                                                                }
                                                                format="DD/MM/YYYY"
                                                                className="w-full"
                                                                placeholder='Chọn ngày khiếu nại'
                                                                disabled={isViewOnly}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => resetKhieuNaiBKHCN(updateRefusal, index)}
                                                            className="text-red-500 hover:text-red-700 text-xs ml-auto"
                                                            disabled={isViewOnly}
                                                        >
                                                            🗑 Xóa
                                                        </button>
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="flex space-x-4 mt-1">
                                                            <label className="block text-gray-600 text-left">Kết quả khiếu nại</label>
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name={`ketQuaBKHCN-${index}`}
                                                                    value="ThanhCong"
                                                                    checked={refusal.ketQuaKhieuNaiBKHCN === 'ThanhCong'}
                                                                    onChange={() => {
                                                                        updateRefusal(index, 'ketQuaKhieuNaiBKHCN', 'ThanhCong');
                                                                        updateRefusal(index, 'ngayKQ_KN_BKHCN', null);
                                                                        updateRefusal(index, 'ghiChuKetQuaKNBKHCN', '');
                                                                        handleKNThanhCong();
                                                                    }}
                                                                    className="mr-2"
                                                                    disabled={isViewOnly}
                                                                />
                                                                Thành công
                                                            </label>
                                                            <label className="flex items-center text-left">
                                                                <input
                                                                    type="radio"
                                                                    name={`ketQuaBKHCN-${index}`}
                                                                    value="ThatBai"
                                                                    checked={refusal.ketQuaKhieuNaiBKHCN === 'ThatBai'}
                                                                    onChange={() => {
                                                                        updateRefusal(index, 'ketQuaKhieuNaiBKHCN', 'ThatBai');
                                                                        handleKNThatBai();
                                                                    }}
                                                                    className="mr-2"
                                                                    disabled={isViewOnly}
                                                                />
                                                                Thất bại
                                                            </label>
                                                        </div>
                                                        {['ThatBai', 'ThanhCong'].includes(refusal.ketQuaKhieuNaiBKHCN) && (
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="mt-3">
                                                                    <label className="block text-gray-600 text-left">
                                                                        {refusal.ketQuaKhieuNaiBKHCN === 'ThatBai'
                                                                            ? 'Ngày nhận kết quả khiếu nại thất bại'
                                                                            : 'Ngày quyết định khiếu nại thành công'}
                                                                    </label>
                                                                    <DatePicker
                                                                        value={refusal.ngayKQ_KN_BKHCN ? dayjs(refusal.ngayKQ_KN_BKHCN) : null}
                                                                        onChange={(date) =>
                                                                            updateRefusal(index, 'ngayKQ_KN_BKHCN', date?.format('YYYY-MM-DD'))
                                                                        }
                                                                        format="DD/MM/YYYY"
                                                                        className="w-full mt-1 "
                                                                        placeholder='Chọn ngày kết quả khiếu nại'
                                                                        disabled={isViewOnly}
                                                                    />
                                                                </div>

                                                                <div className="mt-3">
                                                                    <label className="block text-gray-600 text-left">Ghi chú kết quả</label>
                                                                    <input
                                                                        value={refusal.ghiChuKetQuaKNBKHCN || ''}
                                                                        onChange={(e) => updateRefusal(index, 'ghiChuKetQuaKNBKHCN', e.target.value)}
                                                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md text-input"
                                                                        rows={3}
                                                                        placeholder="Nhập ghi chú..."
                                                                        disabled={isViewOnly}
                                                                    />
                                                                </div>
                                                                {(refusal.ketQuaKhieuNaiBKHCN === 'ThanhCong' || refusal.ketQuaKhieuNaiCSHTT === 'ThanhCong') && (
                                                                    <div className="mt-3">
                                                                        <label className="block text-gray-600 text-left">Ngày nộp yêu cầu chấp nhận đơn hợp lệ</label>
                                                                        <DatePicker
                                                                            value={refusal.ngayNopYeuCauSauKN ? dayjs(refusal.ngayNopYeuCauSauKN) : null}
                                                                            onChange={(date) =>
                                                                                updateRefusal(index, 'ngayNopYeuCauSauKN', date?.format('YYYY-MM-DD'))
                                                                            }
                                                                            format="DD/MM/YYYY"
                                                                            placeholder='Chọn ngày nộp yêu cầu chấp nhận đơn hợp lệ'
                                                                            className="w-full mt-1 "
                                                                            disabled={isViewOnly}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FormalDetermination;
