//Chưa đẩy lên 29/09
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
import Select from "react-select";
import { Upload, Button, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import DSVuViec from "../../components/VuViecForm/DSVuViec.js";
import dayjs from 'dayjs';
function GCN_NH_CAMAdd() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // State cho form GCN
    const [soBang, setSoBang] = useState("");
    const [soDon, setSoDon] = useState("");
    const [idKhachHang, setIdKhachHang] = useState("");
    const [idDoiTac, setIdDoiTac] = useState("");
    const [maKhachHang, setMaKhachHang] = useState(null);
    const [maDoiTac, setMaDoiTac] = useState(null);
    const [dsNhomSPDV, setDsNhomSPDV] = useState(null);
    const [maHoSo, setMaHoSo] = useState("");
    const [ghiChu, setGhiChu] = useState("");
    const [quyetDinhSo, setQuyetDinhSo] = useState("");
    const [maUyQuyen, setMaUyQuyen] = useState("");
    const [anhBang, setAnhBang] = useState(null);
    const [anhBangBase64, setAnhBangBase64] = useState(null);
    const [ngayNopDon, setNgayNopDon] = useState(null);
    const [ngayCapBang, setNgayCapBang] = useState(null);
    const [ngayHetHanBang, setNgayHetHanBang] = useState(null);
    const [chiTietNhomSPDV, setChiTietNhomSPDV] = useState("");
    const [mauSac, setMauSac] = useState("");
    const [productAndService, setProductAndService] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [partners, setPartners] = useState([]);
    const [errors, setErrors] = useState({});
    const [maSPDVList, setMaSPDVList] = useState([]);
    const [brands, setBrands] = useState([]);
    const [maNhanHieu, setMaNhanHieu] = useState("");
    const [tenNhanHieu, setTenNhanHieu] = useState("");
    const [hanGiaHanBang, setHanGiaHanBang] = useState(null);
    const [hanNopTuyenThe, setHanNopTuyenThe] = useState(null);
    const [vuViecList, setVuViecList] = useState([]);
    const [maHoSoVuViec, setMaHoSoVuViec] = useState("");
    const [maDonDangKy, setMaDonDangKy] = useState("");
    const [idGUQ, setIdGUQ] = useState(null);
    const [dsGiayUyQuyen, setDsGiayUyQuyen] = useState([]);
    const isFormValid =
        soBang.trim() &&
        soDon.trim() &&
        idKhachHang &&
        idDoiTac
    // Array.isArray(maSPDVList) &&
    // maSPDVList.length > 0;
    const [trangThaiBang, setTrangThaiThaiBang] = useState(null);
    const statusOptions = [
        { value: "1", label: "Chưa làm gì" },
        { value: "2", label: "Đang xử lý gia hạn" },
        { value: "3", label: "Đang xử lý Affidavit" },
        { value: "4", label: "Không xử lý gia hạn" },
        { value: "5", label: "Không xử lý Affidavit" },
    ];
    const handleFileChange = async (file) => {
        setAnhBang(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setAnhBangBase64(reader.result); // Base64 string
        };
        reader.readAsDataURL(file); // đọc file thành base64
        return false; // chặn upload tự động
    };
    // Validate
    const validateField = (field, value) => {
        let error = "";

        // if (field === "maSPDVList") {
        //     if (!Array.isArray(value) || value.length === 0) {
        //         error = "Sản phẩm dịch vụ không được để trống";
        //     }
        // } else {
        if (!value || (typeof value === "string" && !value.trim())) {
            if (field === "soBang") error = "Số bằng không được để trống";
            if (field === "soDon") error = "Số đơn không được để trống";
            if (field === "idKhachHang") error = "Khách hàng không được để trống";
            if (field === "idDoiTac") error = "Đối tác không được để trống";
        }
        // }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: error,
        }));
    };
    useEffect(() => {
        if (ngayNopDon) {
            const baseDate = dayjs(ngayNopDon);
            setNgayHetHanBang(baseDate.add(10, "year").format("YYYY-MM-DD"));
            setHanGiaHanBang(baseDate.add(9.5, "year").format("YYYY-MM-DD"));
        } else {
            setNgayHetHanBang(null);
            setHanGiaHanBang(null);
        }
    }, [ngayNopDon]);

    useEffect(() => {
        if (ngayCapBang) {
            const baseDate = dayjs(ngayCapBang);
            setHanNopTuyenThe(baseDate.add(5, "year").format("YYYY-MM-DD"));
        } else {
            setHanNopTuyenThe(null);
        }
    }, [ngayCapBang]);
    useEffect(() => {
        const fetchGiayUyQuyen = async () => {
            if (!idKhachHang) return;

            try {
                const res = await callAPI({
                    method: "post",
                    endpoint: "/power-of-attorney/all",
                    data: { idKhachHang },
                });

                // res giả sử là array [{ id, soGUQ, ... }]
                setDsGiayUyQuyen(res);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách giấy ủy quyền:", error);
                setDsGiayUyQuyen([]);
            }
        };

        fetchGiayUyQuyen();
    }, [idKhachHang]);
    // Submit
    const handleAddGCN = async () => {
        try {
            const payload = {
                soBang,
                soDon,
                idKhachHang,
                idDoiTac,
                maHoSo,
                ghiChu,
                dsNhomSPDV: dsNhomSPDV,
                maUyQuyen,
                ngayNopDon,
                ngayCapBang,
                ngayHetHanBang,
                chiTietNhomSPDV,
                mauSac,
                maNhanHieu,
                tenNhanHieu,
                hanGiaHanBang,
                hanNopTuyenThe,
                anhBangBase64, // gửi base64 lên server
                vuViecs: vuViecList,
                idGUQ,
            };

            await callAPI({
                method: "post",
                endpoint: "/gcn_nh_cam/add",
                data: payload,
            });

            await showSuccess("Thành công!", "Thêm giấy chứng nhận thành công!");
            navigate(-1);
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
            console.error("Lỗi khi thêm giấy chứng nhận!", error);
        }
    };
    const fetchPartners = async () => {
        try {
            const response = await callAPI({ method: "post", endpoint: "/partner/all", data: {} });
            setPartners(response);
        } catch (error) { console.error(error); }
    };
    const fetchCustomers = async () => {
        try {
            const response = await callAPI({ method: "post", endpoint: "/customers/by-name", data: {} });
            setCustomers(response);
        } catch (error) { console.error(error); }
    };
    const fetchItems = async (searchValue) => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/productsandservices/list",
                data: { search: searchValue },
            });
            setProductAndService(response);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm/dịch vụ:", error);
        }
    };
    const fetchBrands = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/brand/shortlist",
                data: {},
            });
            setBrands(response);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu nhãn hiệu:", error);
        }
    };
    const formatOptions = (data, idKey, valueKey, labelKey) => {
        return data.map(item => ({
            id: item[idKey],
            value: valueKey ? item[valueKey] : item[idKey],
            label: labelKey ? item[labelKey] : item[idKey]
        }));
    };
    const formatOptionsNew = (data, valueKey, labelKey) => {
        return data.map(item => ({
            value: item[valueKey],  // maNhanHieu (khóa chính)
            label: item[labelKey]   // tenNhanHieu (hiển thị)
        }));
    };

    useEffect(() => {
        fetchPartners();
        fetchCustomers();
        fetchItems();
        fetchBrands();
    }, []);

    const handleMaKhachHangChange = (selectedOption) => {
        if (selectedOption) {
            setMaKhachHang({ id: selectedOption.id, ma: selectedOption.value });
            setIdKhachHang(selectedOption.id);
        } else {
            setMaKhachHang(null);
            setIdKhachHang(null);
        }
    };
    const handleMaDoiTacChange = (selectedOption) => {
        if (selectedOption) {
            setMaDoiTac({ id: selectedOption.id, ma: selectedOption.value });
            setIdDoiTac(selectedOption.id);
        } else {
            setMaDoiTac(null);
            setIdDoiTac(null);
        }
    };

    const handleVuViecChange = (list) => {
        setVuViecList(list);
    }
    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    📌 Thêm Giấy chứng nhận (Văn bằng) Campuchia
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-gray-700 text-left">
                            Số bằng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={soBang}
                            onChange={(e) => {
                                setSoBang(e.target.value);
                                validateField("soBang", e.target.value);
                            }}
                            placeholder="Nhập số bằng"
                            className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                        />
                        {errors.soBang && (
                            <p className="text-red-500 text-xs mt-1 text-left">
                                {errors.soBang}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-left">
                            Số đơn <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={soDon}
                            onChange={(e) => {
                                setSoDon(e.target.value);
                                validateField("soDon", e.target.value);
                            }}
                            placeholder="Nhập số đơn"
                            className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                        />
                        {errors.soDon && (
                            <p className="text-red-500 text-xs mt-1 text-left">
                                {errors.soDon}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Ngày nộp đơn</label>
                        <DatePicker
                            value={ngayNopDon ? dayjs(ngayNopDon) : null}
                            onChange={(date) => {
                                if (dayjs.isDayjs(date) && date.isValid()) {
                                    setNgayNopDon(date.format("YYYY-MM-DD"));
                                } else {
                                    setNgayNopDon(null);
                                }
                            }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày nộp đơn"
                            className="mt-1 w-full"
                        />
                    </div>
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
                            className="mt-1 w-full"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-gray-700 text-left">Khách hàng <span className="text-red-500">*</span></label>
                        <Select
                            options={formatOptions(customers, "id", "maKhachHang", "tenKhachHang")}
                            value={idKhachHang ? formatOptions(customers, "id", "maKhachHang", "tenKhachHang").find(opt => opt.id === idKhachHang) : null}
                            onChange={handleMaKhachHangChange}
                            placeholder="Chọn khách hàng"
                            className="w-full mt-1 rounded-lg text-left"
                            isClearable
                        />
                        {errors.maKhachHang && <p className="text-red-500 text-xs mt-1 text-left">{errors.idKhachHang}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Đối tác</label>
                        <Select
                            options={formatOptions(partners, "id", "maDoiTac", "tenDoiTac")}
                            value={idDoiTac ? formatOptions(partners, "id", "maDoiTac", "tenDoiTac").find(opt => opt.id === idDoiTac) : null}
                            onChange={handleMaDoiTacChange}
                            placeholder="Chọn đối tác"
                            className="w-full mt-1 rounded-lg text-left"
                            isClearable
                        />
                    </div>
                    <div className="">
                        <label className="block text-gray-700 text-left mb-1">
                            Chọn nhãn hiệu <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={formatOptionsNew(brands, "maNhanHieu", "tenNhanHieu")}
                            value={
                                maNhanHieu
                                    ? formatOptionsNew(brands, "maNhanHieu", "tenNhanHieu").find(
                                        (opt) => opt.value === maNhanHieu
                                    )
                                    : null
                            }
                            onChange={(selectedOption) => {
                                const value = selectedOption?.value || "";
                                setMaNhanHieu(value);
                                validateField("maNhanHieu", value);

                                const found = brands.find((b) => b.maNhanHieu === value);
                                setTenNhanHieu(found ? found.tenNhanHieu : "");
                            }}
                            isClearable
                            placeholder="Chọn nhãn hiệu"
                            className="mt-1 text-left"
                        />
                        {errors?.maNhanHieu && (
                            <p className="text-red-500 text-xs mt-1 text-left">
                                {errors.maNhanHieu}
                            </p>
                        )}
                    </div>
                    <div className="w-full">
                        <label className="block text-gray-700 text-left">
                            Số giấy ủy quyền
                        </label>
                        <Select
                            options={formatOptionsNew(dsGiayUyQuyen, "id", "soGUQ")}
                            value={
                                idGUQ
                                    ? formatOptionsNew(dsGiayUyQuyen, "id", "soGUQ").find(
                                        (opt) => opt.value === idGUQ
                                    )
                                    : null
                            }
                            onChange={(selectedOption) =>
                                setIdGUQ(selectedOption ? selectedOption.value : null)
                            }
                            placeholder="Chọn số giấy ủy quyền"
                            className="w-full mt-1 rounded-lg text-left"
                            isClearable
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Danh sách nhóm Sản phẩm dịch vụ</label>
                        <input
                            type="text"
                            value={dsNhomSPDV}
                            onChange={(e) => setDsNhomSPDV(e.target.value)}
                            placeholder="Nhập mã hồ sơ"
                            className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Mã hồ sơ</label>
                        <input
                            type="text"
                            value={maHoSo}
                            onChange={(e) => setMaHoSo(e.target.value)}
                            placeholder="Nhập mã hồ sơ"
                            className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-left">Quyết định số</label>
                        <input
                            type="text"
                            value={quyetDinhSo}
                            onChange={(e) => setQuyetDinhSo(e.target.value)}
                            placeholder="Nhập quyết định số"
                            className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-left">Mã ủy quyền</label>
                        <input
                            type="text"
                            value={maUyQuyen}
                            onChange={(e) => setMaUyQuyen(e.target.value)}
                            placeholder="Nhập mã ủy quyền"
                            className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Màu sắc nhãn hiệu</label>
                        <input
                            type="text"
                            value={mauSac}
                            onChange={(e) => setMauSac(e.target.value)}
                            placeholder="Nhập quyết định số"
                            className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Hạn gia hạn bằng</label>
                        <DatePicker
                            value={hanGiaHanBang ? dayjs(hanGiaHanBang) : null}
                            onChange={(date) => {
                                setHanGiaHanBang(
                                    date && date.isValid() ? date.format("YYYY-MM-DD") : null
                                );
                            }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn hạn gia hạn bằng"
                            className="mt-1 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Hạn nộp tuyên thệ</label>
                        <DatePicker
                            value={hanNopTuyenThe ? dayjs(hanNopTuyenThe) : null}
                            onChange={(date) => {
                                setHanNopTuyenThe(
                                    date && date.isValid() ? date.format("YYYY-MM-DD") : null
                                );
                            }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn hạn nộp tuyên thệ"
                            className="mt-1 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">
                            Trạng thái xử lý bằng
                            <span className="text-red-500">*</span>
                        </label>

                        <Select
                            options={statusOptions}
                            value={statusOptions.find(opt => opt.value === String(trangThaiBang))}
                            onChange={(option) => setTrangThaiThaiBang(option?.value || "1")}
                            placeholder="Chọn trạng thái bằng"
                            isClearable
                            className="w-full mt-1 rounded-lg text-left"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-left">Ảnh bằng</label>
                        <Upload
                            beforeUpload={handleFileChange}
                            maxCount={1}
                            accept=".jpg,.jpeg,.png"
                            showUploadList={false}
                            className="w-full"
                        >
                            <Button icon={<UploadOutlined />} className="w-full">
                                Chọn file
                            </Button>
                        </Upload>

                        {anhBang && (
                            <div className="mt-3">
                                <p className="text-green-600">✔️ Đã chọn: {anhBang.name}</p>
                                <img
                                    src={URL.createObjectURL(anhBang)}
                                    alt="preview"
                                    className="mt-2 rounded-lg border w-64 h-auto"
                                />
                            </div>
                        )}
                    </div>


                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-left">Chi tiết nhóm sản phẩm dịch vụ</label>
                        <textarea
                            value={chiTietNhomSPDV}
                            onChange={(e) => setChiTietNhomSPDV(e.target.value)}
                            placeholder="Nhập ghi chú"
                            className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                            rows="3"
                        ></textarea>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-left">Ghi chú</label>
                        <textarea
                            value={ghiChu}
                            onChange={(e) => setGhiChu(e.target.value)}
                            placeholder="Nhập ghi chú"
                            className="w-full p-2 mt-1 border rounded-lg text-input h-10"
                            rows="3"
                        ></textarea>
                    </div>
                </div>
                <div className="col-span-2">
                    <DSVuViec
                        maHoSo={maHoSoVuViec}

                        maDonDangKy={maDonDangKy}
                        onVuViecChange={handleVuViecChange} initialVuViecs={vuViecList}
                        maHoSoVuViec={maHoSoVuViec}
                        maUyQuyen={maUyQuyen}
                        setMaUyQuyen={setMaUyQuyen}
                    />
                </div>
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </button>
                    <button
                        onClick={handleAddGCN}
                        disabled={!isFormValid}
                        className={`px-4 py-2 rounded-lg text-white ${isFormValid
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-300 cursor-not-allowed"
                            }`}
                    >
                        Thêm giấy chứng nhận
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GCN_NH_CAMAdd;
