import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import 'dayjs/locale/vi';
const ContentReview = ({
    ngayKQThamDinhND_DuKien,
    setNgayKQThamDinhND_DuKien,
    ngayKQThamDinhND,
    setNgayKQThamDinhND,
    lichSuThamDinhND,
    setLichSuThamDinhND,
    ngayKQThamDinhND_DK_SauKN,
    setNgayKQThamDinhND_DK_SauKN,
    buocXuLy,
    setBuocXuLy,
    isViewOnly
}) => {
    const [daDat, setDaDat] = useState(false);
    const [daKNThanhCong, setDaKNThanhCong] = useState(false);
    const [showLichSu, setShowLichSu] = useState(true);

    useEffect(() => {
        lichSuThamDinhND.forEach((item, index) => {
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
                setBuocXuLy(`Chờ trả lời thông báo từ chối thẩm định nội dung lần: ${item.lanThamDinh}`);
            }
            if (item.ngayNhanThongBaoTuChoiTD && !item.trangThaiBiNhanQuyetDinhTuChoi && item.ngayTraLoiThongBaoTuChoi) {
                setBuocXuLy(`Chờ cục phản hồi trả lời thông báo từ chối thẩm định nội dung lần: ${item.lanThamDinh}`);
            }
            if ((item.ketQuaKhieuNaiCSHTT === "ThatBai" || !item.ketQuaKhieuNaiCSHTT) && item.ngayKhieuNaiCSHTT) {
                setBuocXuLy("Chờ kết quả khiếu nại cục sở hữu trí tuệ");
            }
            if ((item.ketQuaKhieuNaiBKHCN === "ThatBai" || !item.ketQuaKhieuNaiBKHCN) && item.ngayKhieuNaiBKHCN) {
                setBuocXuLy("Chờ kết quả khiếu nại bộ khoa học và công nghệ");
            }
        });
    }, [lichSuThamDinhND]);
    const handleFailure = () => {
        const today = dayjs();
        const hanTraLoi = today.add(2, 'month').format('YYYY-MM-DD');

        setLichSuThamDinhND(prev => [
            ...prev,
            {
                loaiThamDinh: 'NoiDung',
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
        setNgayKQThamDinhND(today);
        setDaDat(true);
    };
    const handleKNThanhCong = () => {
        setDaKNThanhCong(true);
        setDaDat(true);
    };
    const handleKNThatBai = () => {
        setDaKNThanhCong(false);
        setDaDat(false);
        setNgayKQThamDinhND_DK_SauKN(null);
    };
    const updateRefusal = (index, field, value) => {
        const updated = [...lichSuThamDinhND];
        updated[index][field] = value;
        if (field === "ngayNhanThongBaoTuChoiTD") {
            if (value) {
                const newHan = dayjs(value).add(59, 'day').format('YYYY-MM-DD');
                updated[index].hanTraLoi = newHan;
            } else {
                updated[index].hanTraLoi = null;
            }
        }
        if (field === "giaHan") {
            const refusal = updated[index];
            let hanTraLoi = dayjs(refusal.hanTraLoi);

            if (value) {
                hanTraLoi = hanTraLoi.add(3, 'month');
            } else {
                hanTraLoi = hanTraLoi.subtract(3, 'month');
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
        setLichSuThamDinhND(updated);
    };

    const deleteRefusal = (index) => {
        const updated = lichSuThamDinhND.filter((_, i) => i !== index);
        setLichSuThamDinhND(updated);
        setDaDat(true);
    };
    const addGiaHan = (refusalIndex) => {
        setLichSuThamDinhND((prev) => {
            const updated = [...prev];
            if (!updated[refusalIndex].giaHanList) {
                updated[refusalIndex].giaHanList = [];
            }
            // Xác định số lần gia hạn hiện tại + 1
            const lanGiaHanMoi = updated[refusalIndex].giaHanList.length + 1;

            updated[refusalIndex].giaHanList.push({
                lanGiaHan: lanGiaHanMoi,
                ngayYeuCauGiaHan: null,
                ngayCapGiaHan: null,
                hanTraLoiGiaHan: null
            });

            return updated;
        });
    };


    const updateGiaHan = (refusalIndex, giaHanIndex, field, value) => {
        setLichSuThamDinhND((prev) => {
            const updated = [...prev];
            updated[refusalIndex].giaHanList[giaHanIndex][field] = value;
            return updated;
        });
    };

    return (
        <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">📌 Thẩm định</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 text-left">
                        Ngày kết quả thẩm định dự kiến
                    </label>
                    <DatePicker
                        value={ngayKQThamDinhND_DuKien ? dayjs(ngayKQThamDinhND_DuKien) : null}
                        onChange={(date) => {
                            if (dayjs.isDayjs(date) && date.isValid()) {
                                setNgayKQThamDinhND_DuKien(date.format("YYYY-MM-DD"));
                            } else {
                                setNgayKQThamDinhND_DuKien(null);
                            }
                        }}
                        format="DD/MM/YYYY"
                        disabled
                        className="mt-1 w-full"
                    />
                </div>
                {(daDat || ngayKQThamDinhND) && (
                    <>
                        {(daKNThanhCong || ngayKQThamDinhND_DK_SauKN) && (
                            <div>
                                <label className="block text-gray-700 text-left">
                                    Ngày KQ thẩm định sau KN dự kiến
                                </label>
                                <DatePicker
                                    value={ngayKQThamDinhND_DK_SauKN ? dayjs(ngayKQThamDinhND_DK_SauKN) : null}
                                    onChange={(date) => {
                                        if (dayjs.isDayjs(date) && date.isValid()) {
                                            setNgayKQThamDinhND_DK_SauKN(date.format("YYYY-MM-DD"));
                                        } else {
                                            setNgayKQThamDinhND_DK_SauKN(null);
                                        }
                                    }}
                                    placeholder='Chọn ngày KQ thẩm định nội dung sau KN'
                                    format="DD/MM/YYYY"
                                    className="mt-1 w-full"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-gray-700 text-left">
                                Ngày kết quả thẩm định
                            </label>

                            <DatePicker
                                value={ngayKQThamDinhND ? dayjs(ngayKQThamDinhND) : null}
                                onChange={(date) => {
                                    if (dayjs.isDayjs(date) && date.isValid()) {
                                        setNgayKQThamDinhND(date.format("YYYY-MM-DD"));
                                    } else {
                                        setNgayKQThamDinhND(null);
                                    }
                                }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày kết quả thẩm định nội dung"
                                className="mt-1 w-full"
                            />
                        </div>
                    </>
                )}
            </div>
            {lichSuThamDinhND.length > 0 && (
                <button
                    type="button"
                    onClick={() => setShowLichSu(!showLichSu)} // <-- đúng
                    className="text-blue-600 underline text-sm"
                >
                    {showLichSu ? "Ẩn lịch sử thẩm định" : "Hiển thị lịch sử thẩm định"}
                </button>
            )}
            {lichSuThamDinhND.length === 0 && !isViewOnly && (
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
                        onClick={handleFailure}
                        disabled={isViewOnly}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                        Không đạt
                    </button>
                </div>
            )}
            {lichSuThamDinhND.length > 0 && showLichSu && (
                <div className="mt-4 border">
                    {lichSuThamDinhND.map((refusal, index) => {
                        const hanTraLoi = refusal.hanTraLoi;

                        // const baseHanTraLoi = dayjs(refusal.ngayNhanThongBaoTuChoiTD).add(3, 'month');
                        // const ngayTraLoiThongBaoTuChoi = refusal.ngayTraLoiThongBaoTuChoi;
                        // const hanTraLoi = baseHanTraLoi.format('YYYY-MM-DD');
                        //  const basengayYeuCauGiaHan= dayjs(refusal.ngayYeuCauGiaHan).add(3, 'month');
                        const hanTraLoiGiaHan = refusal.hanTraLoiGiaHan;

                        return (
                            <div key={index} className="p-1  rounded-md bg-gray-50 text-sm">
                                <div className="flex justify-between items-center ">
                                    <span className="font-semibold text-gray-700">Lần từ chối #{index + 1}</span>
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
                                            className="mt-1 w-full"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-gray-600 text-left">Hạn trả lời</label>
                                        <DatePicker
                                            value={hanTraLoi ? dayjs(hanTraLoi) : null}
                                            format="DD/MM/YYYY"
                                            className="w-full disabled"
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
                                    {/* Danh sách các lần gia hạn */}
                                    {refusal.giaHanList
                                        ?.slice() // copy mảng tránh mutate trực tiếp
                                        .sort((a, b) => {
                                            // ưu tiên sort theo lanGiaHan nếu có
                                            if (a.lanGiaHan != null && b.lanGiaHan != null) {
                                                return a.lanGiaHan - b.lanGiaHan;
                                            }
                                            // nếu không có lanGiaHan, sort theo ngày yêu cầu gia hạn
                                            if (a.ngayYeuCauGiaHan && b.ngayYeuCauGiaHan) {
                                                return new Date(a.ngayYeuCauGiaHan) - new Date(b.ngayYeuCauGiaHan);
                                            }
                                            return 0;
                                        })
                                        .map((gh, ghIndex) => (
                                            <div
                                                key={ghIndex}
                                                className="md:col-span-10 border border-gray-300 rounded-lg p-3 my-2 bg-white shadow-sm"
                                            >
                                                <h4 className="text-sm font-semibold text-blue-600 mb-2">
                                                    📅 Lần gia hạn #{ghIndex + 1}
                                                </h4>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {/* Ngày yêu cầu gia hạn */}
                                                    <div>
                                                        <label className="block text-gray-600 text-left text-xs">Ngày yêu cầu gia hạn</label>
                                                        <DatePicker
                                                            value={gh.ngayYeuCauGiaHan ? dayjs(gh.ngayYeuCauGiaHan) : null}
                                                            onChange={(date) => {
                                                                if (dayjs.isDayjs(date) && date.isValid()) {
                                                                    updateGiaHan(index, ghIndex, 'ngayYeuCauGiaHan', date.format("YYYY-MM-DD"));
                                                                    const baseDate = ghIndex === 0 ? hanTraLoi : refusal.giaHanList[ghIndex - 1].hanTraLoiGiaHan;
                                                                    const newHan = dayjs(baseDate).add(59, 'day').format('YYYY-MM-DD');
                                                                    updateGiaHan(index, ghIndex, 'hanTraLoiGiaHan', newHan);
                                                                } else {
                                                                    updateGiaHan(index, ghIndex, 'ngayYeuCauGiaHan', null);
                                                                    updateGiaHan(index, ghIndex, 'hanTraLoiGiaHan', null);
                                                                }
                                                            }}
                                                            format="DD/MM/YYYY"
                                                            placeholder="Chọn ngày yêu cầu"
                                                            disabled={isViewOnly}
                                                            className="w-full"
                                                        />
                                                    </div>

                                                    {/* Ngày cấp gia hạn */}
                                                    <div>
                                                        <label className="block text-gray-600 text-left text-xs">Ngày cấp gia hạn</label>
                                                        <DatePicker
                                                            value={gh.ngayCapGiaHan ? dayjs(gh.ngayCapGiaHan) : null}
                                                            onChange={(date) => {
                                                                if (dayjs.isDayjs(date) && date.isValid()) {
                                                                    updateGiaHan(index, ghIndex, 'ngayCapGiaHan', date.format("YYYY-MM-DD"));
                                                                } else {
                                                                    updateGiaHan(index, ghIndex, 'ngayCapGiaHan', null);
                                                                }
                                                            }}
                                                            format="DD/MM/YYYY"
                                                            placeholder="Chọn ngày cấp"
                                                            disabled={isViewOnly}
                                                            className="w-full"
                                                        />
                                                    </div>

                                                    {/* Hạn trả lời sau gia hạn */}
                                                    <div>
                                                        <label className="block text-gray-600 text-left text-xs">Hạn trả lời sau gia hạn</label>
                                                        <DatePicker
                                                            value={gh.hanTraLoiGiaHan ? dayjs(gh.hanTraLoiGiaHan) : null}
                                                            format="DD/MM/YYYY"
                                                            disabled
                                                            className="w-full"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Nút Xóa lần gia hạn */}
                                                {!isViewOnly && (
                                                    <div className="flex justify-end mt-2">
                                                        <button
                                                            type="button"
                                                            className="text-red-500 hover:text-red-700 text-xs"
                                                            onClick={() => {
                                                                setLichSuThamDinhND(prev => {
                                                                    const updated = [...prev];
                                                                    updated[index].giaHanList.splice(ghIndex, 1);
                                                                    return updated;
                                                                });
                                                            }}
                                                        >
                                                            🗑 Xóa
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    {!isViewOnly && (
                                        <div className="md:col-span-10">
                                            <button
                                                type="button"
                                                onClick={() => addGiaHan(index)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs"
                                            >
                                                + Thêm gia hạn
                                            </button>
                                        </div>
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
                                            placeholder="Chọn trả lời"
                                            disabled={isViewOnly}
                                            className="mt-1 w-full"
                                        />
                                    </div>

                                </div>
                                {!isViewOnly && index === lichSuThamDinhND.length - 1 && !refusal.showKhieuNaiForm && (
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
                                                    onClick={handleFailure}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                                                >
                                                    Không đạt
                                                </button>
                                            </>)}

                                    </div>
                                )
                                }
                            </div>
                        );
                    })}
                </div>
            )
            }

        </div >
    );
};

export default ContentReview;
