import React from "react";
import { Spin } from "antd";
import DSVuViec from "../VuViecForm/DSVuViec";


const ThongTinHoSo = ({
    loading,
    maHoSoVuViec,
    loaiDon,
    noiDungVuViec,
    maKhachHang,
    tenKhachHang,
    diaChi,
    soDienThoai,
    soDon,
    ngayNopDon,
    tenNhanHieu,
    maSPDVList,
    linkAnh,
    ghiChu,
    ngayHoanThanhHSTL,
    ngayKQThamDinhHinhThuc,
    ngayKQThamDinhHinhThuc_DK_SauKN,
    ngayCongBo,
    ngayKQThamDinhND,
    ngayKQThamDinhND_DK_SauKN,
    ngayTraLoiKQThamDinhND,
    ngayThongBaoCapBang,
    ngayNopYKien,
    ngayNhanKQYKien,
    ngayPhanHoiKQYKien,
    ngayNopPhiCapBang,
    ngayNhanBang,
    ngayGuiBangChoKH,
    ngayCapBang,
    ngayHetHanBang,
    ngayHoanThanhHSTL_DuKien,
    ngayKQThamDinhHinhThuc_DuKien,
    ngayCongBo_DuKien,
    ngayKQThamDinhND_DuKien,
    ngayTraLoiKQThamDinhND_DuKien,
    taiLieuList,
    vuViecList,
    handleVuViecChange,
    handleTaiLieuChange,
    giayUyQuyenGoc,
    setGiayUyQuyenGoc,
    maUyQuyen,
    setMaUyQuyen,
    isViewOnly,
}) => {
    const formatDateVN = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };
    return (
        <Spin spinning={loading} tip="Loading..." size="large">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-800 text-sm">
                    {/* Thông tin chung */}
                    <div className="text-left"><span className="font-medium">Mã hồ sơ:</span> {maHoSoVuViec}</div>
                    <div className="text-left"><span className="font-medium">Loại đơn:</span> {loaiDon === 1 ? "Đơn gốc" : loaiDon === 2 ? "Đơn sửa đổi" : loaiDon === 3 ? "Đơn tách" : loaiDon === 4 ? "Đơn chuyển nhượng" : ""}</div>
                    <div className="text-left"><span className="font-medium">Client ref's:</span> {noiDungVuViec}</div>
                    <div className="text-left"><span className="font-medium">Mã khách hàng:</span> {maKhachHang}</div>
                    <div className="text-left"><span className="font-medium">Tên khách hàng:</span> {tenKhachHang}</div>
                    <div className="text-left"><span className="font-medium">Địa chỉ:</span> {diaChi}</div>
                    <div className="text-left"><span className="font-medium">Số điện thoại:</span> {soDienThoai}</div>
                    <div className="text-left"><span className="font-medium">Số đơn:</span> {soDon}</div>
                    <div className="text-left"><span className="font-medium">Ngày nộp đơn: </span>{formatDateVN(ngayNopDon)}</div>
                    {/* <div className="text-left"><span className="font-medium">Mã nhãn hiệu:</span> {maNhanHieu}</div> */}
                    <div className="text-left"><span className="font-medium">Tên nhãn hiệu:</span> {tenNhanHieu}</div>
                    <div className="md:col-span-2 text-left">
                        <span className="font-medium">Danh sách nhóm Sản phẩm dịch vụ:</span>{" "}
                        <span className="text-gray-700">
                            {maSPDVList?.length > 0
                                ? maSPDVList.join(", ")
                                : "Không có dữ liệu"}
                        </span>
                    </div>

                    {/* Ảnh + Ghi chú */}
                    <div className="col-span-1 md:col-span-2 my-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Ghi chú bên trái */}


                            {/* Ảnh bên phải */}
                            <div className="flex justify-center items-center">
                                {linkAnh ? (
                                    <img
                                        src={linkAnh}
                                        alt="Ảnh nhãn hiệu"
                                        className="h-40 border rounded-md shadow-sm"
                                    />
                                ) : (
                                    <div className="italic text-gray-400">Không có ảnh</div>
                                )}
                            </div>
                            <div className="text-left">
                                <span className="font-medium">Ghi chú:</span>
                                <p className="mt-1 text-gray-700 italic">
                                    {ghiChu || "Chưa có ghi chú"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Khối 2 cột */}
                    <div className="col-span-1 md:col-span-2 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tình trạng xử lý */}
                        <div>
                            <h2 className="text-base font-semibold mb-2 text-left">Tình trạng xử lý</h2>
                            <div className="space-y-2 text-sm text-gray-800">
                                {ngayNopDon && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayNopDon)}</span>
                                        <span>Ngày nộp đơn</span>
                                    </div>
                                )}
                                {ngayHoanThanhHSTL && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayHoanThanhHSTL)}</span>
                                        <span>Ngày hoàn thành hồ sơ</span>
                                    </div>
                                )}
                                {ngayKQThamDinhHinhThuc && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhHinhThuc)}</span>
                                        <span>Ngày KQ TĐ hình thức</span>
                                    </div>
                                )}
                                {ngayKQThamDinhHinhThuc_DK_SauKN && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhHinhThuc_DK_SauKN)}</span>
                                        <span>Ngày KQ TĐ hình thức sau khiếu nại</span>
                                    </div>
                                )}
                                {ngayCongBo && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayCongBo)}</span>
                                        <span>Ngày công bố</span>
                                    </div>
                                )}
                                {ngayKQThamDinhND && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhND)}</span>
                                        <span>Ngày KQ TĐ nội dung</span>
                                    </div>
                                )}
                                {ngayKQThamDinhND_DK_SauKN && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhHinhThuc_DK_SauKN)}</span>
                                        <span>Ngày KQ TĐ nội dung sau khiếu nại</span>
                                    </div>
                                )}
                                {ngayTraLoiKQThamDinhND && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayTraLoiKQThamDinhND)}</span>
                                        <span>Ngày trả lời TĐND</span>
                                    </div>
                                )}
                                {ngayThongBaoCapBang && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayThongBaoCapBang)}</span>
                                        <span>Ngày thông báo cấp bằng</span>
                                    </div>
                                )}
                                {ngayNopYKien && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayNopYKien)}</span>
                                        <span>Ngày nộp ý kiến</span>
                                    </div>
                                )}
                                {ngayNhanKQYKien && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayNhanKQYKien)}</span>
                                        <span>Ngày nhận KQ ý kiến</span>
                                    </div>
                                )}
                                {ngayPhanHoiKQYKien && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayPhanHoiKQYKien)}</span>
                                        <span>Ngày phản hồi KQ ý kiến</span>
                                    </div>
                                )}
                                {ngayNopPhiCapBang && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayNopPhiCapBang)}</span>
                                        <span>Ngày nộp phí cấp bằng</span>
                                    </div>
                                )}
                                {ngayNhanBang && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayNhanBang)}</span>
                                        <span>Ngày nhận bằng</span>
                                    </div>
                                )}
                                {ngayGuiBangChoKH && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayGuiBangChoKH)}</span>
                                        <span>Ngày gửi bằng cho KH</span>
                                    </div>
                                )}
                                {ngayCapBang && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayCapBang)}</span>
                                        <span>Ngày cấp bằng</span>
                                    </div>
                                )}
                                {ngayHetHanBang && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayHetHanBang)}</span>
                                        <span>Ngày hết hạn bằng</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ngày dự kiến */}
                        <div>
                            <h2 className="text-base font-semibold mb-2 text-left">Ngày dự kiến</h2>
                            <div className="space-y-2 text-sm text-gray-800">
                                <div className="flex " style={{ height: '20px' }}>
                                    <span className="w-32 font-medium"> </span>
                                    <span> </span>
                                </div>
                                {ngayHoanThanhHSTL_DuKien && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayHoanThanhHSTL_DuKien)}</span>
                                        <span>Hoàn thành hồ sơ (dự kiến)</span>
                                    </div>
                                )}
                                {ngayKQThamDinhHinhThuc_DuKien && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhHinhThuc_DuKien)}</span>
                                        <span>KQ TĐ hình thức (dự kiến)</span>
                                    </div>
                                )}
                                {ngayCongBo_DuKien && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayCongBo_DuKien)}</span>
                                        <span>Công bố (dự kiến)</span>
                                    </div>
                                )}
                                {ngayKQThamDinhND_DuKien && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayKQThamDinhND_DuKien)}</span>
                                        <span>KQ TĐ nội dung (dự kiến)</span>
                                    </div>
                                )}
                                {ngayTraLoiKQThamDinhND_DuKien && (
                                    <div className="flex">
                                        <span className="w-32 font-medium">{formatDateVN(ngayTraLoiKQThamDinhND_DuKien)}</span>
                                        <span>Trả lời TĐND (dự kiến)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                </div>
                {/* Danh sách tài liệu */}
                <div className="mt-8">
                    <div className="text-lg font-semibold text-gray-700 mb-2">Danh sách tài liệu</div>
                    <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="px-3 py-2 border-b">Tên tài liệu</th>
                                <th className="px-3 py-2 border-b">Trạng thái</th>
                                <th className="px-3 py-2 border-b">Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taiLieuList?.length > 0 ? taiLieuList.map((item) => (
                                <tr key={item.maTaiLieu} className="hover:bg-gray-50 text-left">
                                    <td className="px-3 py-2 border-b">{item.tenTaiLieu}</td>
                                    <td className="px-3 py-2 border-b">{item.trangThai}</td>
                                    <td className="px-3 py-2 border-b">
                                        {item.linkTaiLieu ? (
                                            <button
                                                className="text-blue-600 underline"
                                                onClick={() => {
                                                    const fileName = item.tenTaiLieu || "tai_lieu.docx";

                                                    // Nếu là PDF thì mở tab mới
                                                    // if (item.linkTaiLieu.startsWith("data:application/pdf")) {
                                                    //     window.open(item.linkTaiLieu, "_blank");
                                                    // } else {
                                                    // Còn lại thì tự động tải về
                                                    const link = document.createElement("a");
                                                    link.href = item.linkTaiLieu;
                                                    link.download = fileName;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);

                                                }}
                                            >
                                                Xem tài liệu
                                            </button>
                                        ) : (
                                            <span className="italic text-gray-400">Chưa có</span>
                                        )}
                                    </td>

                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center text-gray-500 italic py-4">Không có tài liệu</td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                    <div className="col-span-2">
                        <DSVuViec
                            maHoSo={maHoSoVuViec}
                            onVuViecChange={handleVuViecChange} initialVuViecs={vuViecList}
                            maHoSoVuViec={maHoSoVuViec}
                            giayUyQuyenGoc={giayUyQuyenGoc}
                            setGiayUyQuyenGoc={setGiayUyQuyenGoc}
                            maUyQuyen={maUyQuyen}
                            setMaUyQuyen={setMaUyQuyen}
                            isViewOnly={isViewOnly}
                        />
                    </div>
                </div>
            </div>
           

        </Spin>
    );
};

export default ThongTinHoSo;
