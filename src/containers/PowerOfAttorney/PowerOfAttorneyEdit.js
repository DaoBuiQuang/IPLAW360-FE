import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import callAPI from "../../utils/api";
import Select from "react-select";
import { showSuccess, showError } from "../../components/commom/Notification";
import { DatePicker, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

function PowerOfAttorneyEdit() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();

    const [soGUQ, setSoGUQ] = useState("");
    const [idKhachHang, setIdKhachHang] = useState(null);
    const [idDoiTac, setIdDoiTac] = useState(null);
    const [maQuocGia, setMaQuocGia] = useState("");
    const [soDonGoc, setSoDonGoc] = useState("");
    const [ngayUyQuyen, setNgayUyQuyen] = useState(null);
    const [ngayHetHan, setNgayHetHan] = useState(null);

    // 🔑 BÂY GIỜ LÀ FILENAME
    const [linkAnh, setLinkAnh] = useState("");

    const [ghiChu, setGhiChu] = useState("");
    const [loaiGUQ, setLoaiGUQ] = useState(null);
    const [nguoiKy, setNguoiKy] = useState("");
    const [chucDanh, setChucDanh] = useState("");

    const [countries, setCountries] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [partners, setPartners] = useState([]);
    const [applications, setApplications] = useState([]);

    /* ================== FETCH ================== */
    useEffect(() => {
        fetchDetail();
        fetchCountries();
        fetchPartners();
        fetchCustomers();
        fetchApplicationsByGUQ();
        // eslint-disable-next-line
    }, []);

    const fetchDetail = async () => {
        try {
            const res = await callAPI({
                method: "post",
                endpoint: "/power-of-attorney/detail",
                data: { id },
            });

            setIdKhachHang(res.idKhachHang || null);
            setIdDoiTac(res.idDoiTac || null);
            setMaQuocGia(res.maQuocGia || "");
            setSoDonGoc(res.soDonGoc || "");
            setNgayUyQuyen(res.ngayUyQuyen || null);
            setNgayHetHan(res.ngayHetHan || null);
            setLinkAnh(res.linkAnh || ""); // filename
            setGhiChu(res.ghiChu || "");
            setSoGUQ(res.soGUQ || "");
            setLoaiGUQ(res.loaiGUQ || null);
            setNguoiKy(res.nguoiKy || "");
            setChucDanh(res.chucDanh || "");
        } catch {
            showError("Lỗi", "Không tải được dữ liệu giấy ủy quyền");
        }
    };

    const fetchCountries = async () => {
        const res = await callAPI({ method: "post", endpoint: "/country/list" });
        setCountries(res || []);
    };

    const fetchPartners = async () => {
        const res = await callAPI({ method: "post", endpoint: "/partner/all" });
        setPartners(res || []);
    };

    const fetchCustomers = async () => {
        const res = await callAPI({
            method: "post",
            endpoint: "/customers/by-name",
        });
        setCustomers(res || []);
    };

    const fetchApplicationsByGUQ = async () => {
        try {
            const res = await callAPI({
                method: "post",
                endpoint: "/application/guq",
                data: { idGUQ: id },
            });
            setApplications(res.data || []);
        } catch {
            showError("Lỗi", "Không lấy được danh sách đơn");
        }
    };

    /* ================== UPLOAD FILE ================== */
    const uploadProps = {
        name: "file",
        action: `${process.env.REACT_APP_API_URL}/upload`,
        method: "post",
        maxCount: 1,
        multiple: false,
        onChange(info) {
            if (info.file.status === "done") {
                const res = info.file.response;
                setLinkAnh(res.fileName);
                showSuccess("Thành công", "Upload file thành công");
            } else if (info.file.status === "error") {
                showError("Lỗi", "Upload file thất bại");
            }
        },
    };

    /* ================== SAVE ================== */
    const handleEdit = async () => {
        try {
            await callAPI({
                method: "put",
                endpoint: "/power-of-attorney/update",
                data: {
                    id,
                    idKhachHang,
                    idDoiTac,
                    maQuocGia,
                    soDonGoc,
                    ngayUyQuyen,
                    ngayHetHan,
                    linkAnh, // filename
                    ghiChu,
                    soGUQ,
                    loaiGUQ,
                    nguoiKy,
                    chucDanh,
                },
            });

            showSuccess("Thành công", "Cập nhật giấy ủy quyền thành công");
            navigate(-1);
        } catch {
            showError("Lỗi", "Cập nhật thất bại");
        }
    };

    const loaiGUQOptions = [
        { value: 1, label: "Ủy quyền chung" },
        { value: 2, label: "Ủy quyền theo vụ việc" },
    ];

    const formatOptions = (data, v, l) =>
        data.map((i) => ({ value: i[v], label: i[l] }));

    return (
        <div className="p-1 bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    ✏️ Cập nhật giấy ủy quyền
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ===== UI GIỮ NGUYÊN TỪ ĐÂY ===== */}

                    {/* SỐ GIẤY ỦY QUYỀN */}
                    <div>
                        <label className="block text-gray-700 text-left">
                            Số giấy ủy quyền
                        </label>
                        <input
                            type="text"
                            value={soGUQ}
                            onChange={(e) => setSoGUQ(e.target.value)}
                            className="w-full p-2 mt-1 border rounded-lg text-input"
                            placeholder="Nhập số giấy ủy quyền"
                        />
                    </div>

                    {/* KHÁCH HÀNG */}
                    <div>
                        <label className="block text-gray-700 text-left">
                            Khách hàng <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={formatOptions(customers, "id", "tenKhachHang")}
                            value={
                                idKhachHang
                                    ? formatOptions(customers, "id", "tenKhachHang")
                                          .find((x) => x.value === idKhachHang)
                                    : null
                            }
                            onChange={(v) => setIdKhachHang(v?.value || null)}
                            className="w-full mt-1 rounded-lg text-left"
                            placeholder="Chọn khách hàng"
                        />
                    </div>

                    {/* ĐỐI TÁC */}
                    <div>
                        <label className="block text-gray-700 text-left">
                            Đối tác
                        </label>
                        <Select
                            options={formatOptions(partners, "id", "tenDoiTac")}
                            value={
                                idDoiTac
                                    ? formatOptions(partners, "id", "tenDoiTac")
                                          .find((x) => x.value === idDoiTac)
                                    : null
                            }
                            onChange={(v) => setIdDoiTac(v?.value || null)}
                            className="w-full mt-1 rounded-lg text-left"
                            placeholder="Chọn đối tác"
                        />
                    </div>

                    {/* QUỐC GIA */}
                    <div>
                        <label className="block text-gray-700 text-left">
                            {t("tenQuocGia")}
                        </label>
                        <Select
                            options={formatOptions(countries, "maQuocGia", "tenQuocGia")}
                            value={
                                maQuocGia
                                    ? formatOptions(
                                          countries,
                                          "maQuocGia",
                                          "tenQuocGia"
                                      ).find((opt) => opt.value === maQuocGia)
                                    : null
                            }
                            onChange={(v) => setMaQuocGia(v?.value || "")}
                            className="w-full mt-1 rounded-lg text-left"
                            isClearable
                        />
                    </div>

                    {/* SỐ ĐƠN GỐC */}
                    <div>
                        <label className="block text-gray-700 text-left">
                            Số đơn gốc
                        </label>
                        <input
                            type="text"
                            value={soDonGoc}
                            onChange={(e) => setSoDonGoc(e.target.value)}
                            className="w-full p-2 mt-1 border rounded-lg text-input"
                            placeholder="Nhập số đơn gốc"
                        />
                    </div>

                    {/* NGÀY ỦY QUYỀN */}
                    <div>
                        <label className="block text-gray-700 text-left">
                            Ngày ủy quyền <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            value={ngayUyQuyen ? dayjs(ngayUyQuyen) : null}
                            onChange={(d) =>
                                setNgayUyQuyen(d ? d.format("YYYY-MM-DD") : "")
                            }
                            format="DD/MM/YYYY"
                            className="w-full"
                        />
                    </div>

                    {/* NGÀY HẾT HẠN */}
                    <div>
                        <label className="block text-gray-700 text-left">
                            Ngày hết hạn
                        </label>
                        <DatePicker
                            value={ngayHetHan ? dayjs(ngayHetHan) : null}
                            onChange={(d) =>
                                setNgayHetHan(d ? d.format("YYYY-MM-DD") : "")
                            }
                            format="DD/MM/YYYY"
                            className="w-full"
                        />
                    </div>

                    {/* LOẠI GUQ */}
                    <div>
                        <label className="block text-gray-700 text-left">
                            Loại giấy ủy quyền <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={loaiGUQOptions}
                            value={
                                loaiGUQ
                                    ? loaiGUQOptions.find((x) => x.value === loaiGUQ)
                                    : null
                            }
                            onChange={(v) => setLoaiGUQ(v?.value || null)}
                            className="w-full mt-1 rounded-lg text-left"
                            isClearable
                        />
                    </div>

                    {/* NGƯỜI KÝ */}
                    <div>
                        <label className="block text-gray-700 text-left">
                            Người ký <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={nguoiKy}
                            onChange={(e) => setNguoiKy(e.target.value)}
                            className="w-full p-2 mt-1 border rounded-lg text-input"
                            placeholder="Nhập người ký"
                        />
                    </div>

                    {/* CHỨC DANH */}
                    <div>
                        <label className="block text-gray-700 text-left">
                            Chức danh
                        </label>
                        <input
                            type="text"
                            value={chucDanh}
                            onChange={(e) => setChucDanh(e.target.value)}
                            className="w-full p-2 mt-1 border rounded-lg text-input"
                            placeholder="Nhập chức danh"
                        />
                    </div>

                    {/* UPLOAD FILE */}
                    <label className="block font-medium">Ảnh / File</label>
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>

                    {linkAnh && (
                        <div className="mt-2 flex gap-4">
                            <a
                                href={`${process.env.REACT_APP_API_URL.replace(
                                    "/api",
                                    ""
                                )}/api/files/view/${linkAnh}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline"
                            >
                                Xem file
                            </a>
                            <a
                                href={`${process.env.REACT_APP_API_URL.replace(
                                    "/api",
                                    ""
                                )}/api/files/download/${linkAnh}`}
                                download
                                className="text-green-600 underline"
                            >
                                Tải file
                            </a>
                        </div>
                    )}

                    {/* DANH SÁCH ĐƠN */}
                    <div className="col-span-2">
                        <label className="block text-gray-900 mb-2">
                            Danh sách đơn đã chỉ định
                        </label>

                        {applications.length === 0 ? (
                            <p className="text-gray-500 text-sm">
                                Chưa có đơn nào được chỉ định cho giấy ủy quyền này.
                            </p>
                        ) : (
                            <table className="w-full border border-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th className="border px-2 py-1 text-left">
                                            Mã đơn đăng ký
                                        </th>
                                        <th className="border px-2 py-1 text-left">
                                            Số đơn
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.maDonDangKy}>
                                            <td className="border px-2 py-1">
                                                {app.maDonDangKy}
                                            </td>
                                            <td className="border px-2 py-1">
                                                {app.soDon}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* GHI CHÚ */}
                    <div className="col-span-2">
                        <label className="block text-gray-700 text-left">
                            Nội dung Giấy ủy quyền
                        </label>
                        <textarea
                            value={ghiChu}
                            onChange={(e) => setGhiChu(e.target.value)}
                            className="w-full p-2 border rounded-lg h-20 mt-1"
                        />
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                    <button
                        className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </button>
                    <button
                        onClick={handleEdit}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Cập nhật
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PowerOfAttorneyEdit;
