import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Modal, Button } from "antd";
import callAPI from "../../utils/api.js";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import CaseSelectModal from "../../components/commom/CaseSelectModal.js";
import { showSuccess, showError } from "../../components/commom/Notification";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function DebitNoteEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await callAPI({
                    method: "post",
                    endpoint: "/denghithanhtoan/detail",
                    data: { id },
                });

                if (response?.data) {
                    const d = response.data;
                    setMaHoSo(d.maHoSo || "");
                    setDeBitNoteNo(d.deBitNoteNo || "");
                    setMatterName(d.matterName || "");
                    setNgayGui(d.ngayGui || "");
                    setNgayThanhToan(d.ngayThanhToan || "");
                    setNgayGuiHoaDon(d.ngayGuiHoaDon || "");
                    setNgayXuat(d.ngayXuat || "");
                    setGhiChu(d.ghiChu || "");

                    setCustomer({
                        tenKhachHang: d.tenKhachHang,
                        nguoiNhan: d.nguoiNhan,
                        diaChi: d.diaChiNguoiNhan,
                        email: d.email,
                        quocGia: { tenQuocGia: d.maQuocGia },
                    });
                    setPartner({
                        tenDoiTac: d.tenKhachHang,
                        diaChi: d.diaChiNguoiNhan,
                        email: d.email,
                        nguoiLienHe: d.nguoiNhan,
                        quocGia: { tenQuocGia: d.maQuocGia },
                    });

                    setSelectedCases(
                        (d.DeNghiThanhToan_VuViec || []).map((item) => ({
                            id: item.idVuViec,
                            moTa: item.VuViec?.moTa,
                            tenVuViec: item.VuViec?.tenVuViec,
                            soTien: item.VuViec?.soTien,
                            clientsRef: item.clientsRef || d.yourRef || "",
                        }))
                    );
                    setNguoiNhan(d.nguoiNhan || "");
                }
            } catch (err) {
                console.error("❌ Lỗi gọi API detail:", err);
            }
        };

        if (id) fetchDetail();
    }, [id]);

    const [maHoSo, setMaHoSo] = useState(null);
    const [partner, setPartner] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [selectedCases, setSelectedCases] = useState([]);
    const [caseOptions, setCaseOptions] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState(null);
    const contactInfo = partner || customer;

    const [deBitNoteNo, setDeBitNoteNo] = useState("");
    const [matterName, setMatterName] = useState("");
    const [ngayGui, setNgayGui] = useState(null);
    const [ngayThanhToan, setNgayThanhToan] = useState(null);
    const [ngayGuiHoaDon, setNgayGuiHoaDon] = useState(null);
    const [ngayXuat, setNgayXuat] = useState(null);
    const [ghiChu, setGhiChu] = useState("");
    const [nguoiNhan, setNguoiNhan] = useState("");

    const tableRef = useRef(null);

    const fetchCaseOptions = async () => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/case/getCaseByHoSo",
                data: { maHoSo: maHoSo },
            });
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error("Lỗi khi lấy danh sách vụ việc:", error);
            return [];
        }
    };

    const fetchCaseDetail = async (cId) => {
        try {
            const response = await callAPI({
                method: "post",
                endpoint: "/case/detail",
                data: { id: cId },
            });
            return response;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin vụ việc:", error);
            return null;
        }
    };

    const handleAddCaseClick = async () => {
        const allCases = await fetchCaseOptions();
        const existingIds = new Set(selectedCases.map((c) => c.id));
        const options = allCases.filter((c) => !existingIds.has(c.id));
        setCaseOptions(options);
        setSelectedCaseId(null);
        setIsModalVisible(true);
    };

    const handleConfirmAddCase = async () => {
        if (!selectedCaseId) return;

        const newCase = await fetchCaseDetail(selectedCaseId);
        if (!newCase) return;

        if (!selectedCases.some((c) => c.id === newCase.id)) {
            setSelectedCases((prev) => [...prev, newCase]);
            setCaseOptions((prev) => prev.filter((c) => c.id !== newCase.id));

            setTimeout(() => {
                tableRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }

        setSelectedCaseId(null);
        setIsModalVisible(false);
    };

    const handleRemoveCase = (id) => {
        const removed = selectedCases.find((c) => c.id === id);
        setSelectedCases((prev) => prev.filter((c) => c.id !== id));
        if (removed) {
            setCaseOptions((prev) => {
                if (prev.some((c) => c.id === removed.id)) return prev;
                return [...prev, removed];
            });
        }
    };

    const confirmDelete = () => {
        if (caseToDelete) {
            handleRemoveCase(caseToDelete);
            setCaseToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const subtotal = selectedCases.reduce(
        (sum, c) => sum + parseFloat(c.soTien || 0),
        0
    );
    const vat = subtotal * 0.05;
    const total = subtotal + vat;

    const saveDebitNote = async () => {
        try {
            const payload = {
                id: id,
                deBitNoteNo,
                maHoSo,
                matterName,
                yourRef: selectedCases[0]?.clientsRef || "",
                contactInfo: {
                    id: contactInfo?.id || null,
                    ten: contactInfo?.tenDoiTac || contactInfo?.tenKhachHang || "",
                    diaChi: contactInfo?.diaChi || "",
                    email: contactInfo?.email || "",
                },
                cases: selectedCases.map((c) => ({
                    id: c.id,
                    tenVuViec: c.tenVuViec,
                    moTa: c.moTa,
                    soTien: c.soTien,
                    clientsRef: c.clientsRef || "",
                })),
                subtotal,
                vat,
                total,
                ngayGui: ngayGui || null,
                ngayThanhToan: ngayThanhToan || null,
                ngayGuiHoaDon: ngayGuiHoaDon || null,
                ngayXuat: ngayXuat || null,
                ghiChu,
                nguoiNhan,
            };

            const response = await callAPI({
                method: "post",
                endpoint: "/denghithanhtoan/edit",
                data: payload,
            });

            console.log("Đã lưu đề nghị thanh toán:", response);
            await showSuccess(
                "Thành công!",
                "Cập nhật đề nghị thanh toán thành công!"
            );
            navigate(-1);
        } catch (error) {
            console.error("Lỗi khi lưu đề nghị thanh toán:", error);
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
        }
    };

    const handleSave = () => saveDebitNote();
    // =================== EXPORT EXCEL TỪ TEMPLATE ===================
    const exportToExcel = async () => {
        try {
            // file nằm trong public/templates => URL như dưới
            const url = "/templates/mau-debitnote-excel.xlsx";
            console.log("[EXPORT] Template URL:", url);

            const res = await fetch(url);

            if (!res.ok) {
                const msg = `HTTP ${res.status} ${res.statusText}`;
                console.error("[EXPORT] Fetch failed:", msg);
                showError("Lỗi", "Không tải được file Excel mẫu: " + msg);
                return;
            }

            const arrayBuffer = await res.arrayBuffer();
            console.log("[EXPORT] Size (bytes):", arrayBuffer.byteLength);

            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                console.error("[EXPORT] Empty file");
                showError("Lỗi", "File Excel mẫu trả về rỗng.");
                return;
            }

            // Kiểm tra không phải HTML
            const firstBytes = new Uint8Array(arrayBuffer.slice(0, 40));
            const asciiPreview = String.fromCharCode(...firstBytes).trim();
            console.log("[EXPORT] First bytes preview:", asciiPreview);

            if (asciiPreview.startsWith("<") || asciiPreview.toLowerCase().startsWith("<!doctype")) {
                console.error("[EXPORT] Looks like HTML, not XLSX");
                showError(
                    "Lỗi",
                    "Server đang trả về HTML (index.html / 404) thay vì file Excel mẫu.\n" +
                    "Hãy chắc chắn file nằm trong thư mục public/templates."
                );
                return;
            }

            // Đọc workbook
            const wb = XLSX.read(arrayBuffer, { type: "array" });
            const sheetName = wb.SheetNames[0];
            const ws = wb.Sheets[sheetName];

            // ---- Gán dữ liệu (giữ như bạn đã làm) ----
            const todayStr = new Date().toLocaleDateString("vi-VN");

            ws["C6"] = { t: "s", v: todayStr };
            ws["C7"] = { t: "s", v: deBitNoteNo || "" };
            ws["C8"] = { t: "s", v: maHoSo || "" };
            ws["C9"] = { t: "s", v: selectedCases[0]?.clientsRef || "" };
            ws["C10"] = { t: "s", v: contactInfo?.quocGia?.tenQuocGia || "" };

            ws["B13"] = { t: "s", v: nguoiNhan || "" };
            ws["B14"] = {
                t: "s",
                v: contactInfo?.tenDoiTac || contactInfo?.tenKhachHang || "",
            };
            ws["B15"] = { t: "s", v: contactInfo?.diaChi || "" };
            ws["B16"] = { t: "s", v: contactInfo?.email || "" };

            ws["C18"] = { t: "s", v: matterName || "" };

            const startRow = 22;
            selectedCases.forEach((c, index) => {
                const row = startRow + index;
                const price = parseFloat(c.soTien || 0);

                ws[`B${row}`] = { t: "s", v: c.moTa || "" }; // ITEM
                ws[`E${row}`] = { t: "n", v: 1 };            // QTY
                ws[`F${row}`] = { t: "n", v: price };        // PRICE
                ws[`G${row}`] = { t: "n", v: price };        // TOTAL
            });

            const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const blob = new Blob([wbOut], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const fileName = `DebitNote_${deBitNoteNo || "nonumber"}.xlsx`;
            saveAs(blob, fileName);
        } catch (error) {
            console.error("Lỗi export excel:", error);
            showError("Lỗi", "Xuất Excel thất bại. Xem chi tiết trong console.");
        }
    };



    return (
        <div className="p-6 bg-gray-100 flex justify-center">
            {/* CHỈ PHẦN NÀY SẼ ĐƯỢC IN RA PDF */}
            <div
                id="print-area"
                className="bg-white p-8 rounded-lg shadow-lg w-full max-w-5xl border border-gray-300"
            >
                {/* Header và thông tin khách hàng */}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <img
                        src="https://ipac.vn/image/catalog/logo/rsz_1logo.jpg"
                        alt="IPAC Logo"
                        className="h-16"
                    />
                    <div className="text-center flex-1">
                        <h1 className="text-2xl font-bold text-teal-700 uppercase">
                            CẬP NHẬT ĐỀ NGHỊ THANH TOÁN (DEBIT NOTE)
                        </h1>
                    </div>
                </div>

                {/* Thông tin khách hàng */}
                <div className="grid grid-cols-2 gap-8 mb-6 text-left">
                    {/* Cột trái */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold">To:</span>
                            <input
                                type="text"
                                className="border-b border-gray-400 focus:outline-none col-span-2"
                                value={nguoiNhan}
                                onChange={(e) => setNguoiNhan(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold">Name:</span>
                            <span className="col-span-2">
                                {contactInfo?.tenDoiTac || contactInfo?.tenKhachHang}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold">Address:</span>
                            <span className="col-span-2">{contactInfo?.diaChi}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold">Email:</span>
                            <span className="col-span-2">
                                {contactInfo?.email || "—"}
                            </span>
                        </div>
                    </div>

                    {/* Cột phải */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold">Date:</span>
                            <input
                                type="text"
                                className="border-b border-gray-400 focus:outline-none col-span-2"
                                value={new Date().toLocaleDateString("vi-VN")}
                                readOnly
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold">Debit Note No:</span>
                            <input
                                type="text"
                                className="border-b border-gray-400 focus:outline-none col-span-2"
                                value={deBitNoteNo}
                                onChange={(e) => setDeBitNoteNo(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold">Our Ref:</span>
                            <input
                                type="text"
                                className="border-b border-gray-400 focus:outline-none col-span-2"
                                value={maHoSo || ""}
                                readOnly
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold">Your Ref:</span>
                            <input
                                type="text"
                                className="border-b border-gray-400 focus:outline-none col-span-2"
                                value={selectedCases[0]?.clientsRef || ""}
                                onChange={(e) =>
                                    setSelectedCases((prev) =>
                                        prev.length
                                            ? [
                                                {
                                                    ...prev[0],
                                                    clientsRef: e.target.value,
                                                },
                                                ...prev.slice(1),
                                            ]
                                            : prev
                                    )
                                }
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold">Country:</span>
                            <span className="col-span-2">
                                {contactInfo?.quocGia?.tenQuocGia || "—"}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold">Matter name:</span>
                            <textarea
                                className="border border-gray-400 rounded-md focus:outline-none col-span-2 p-2"
                                rows={3}
                                value={matterName}
                                onChange={(e) => setMatterName(e.target.value)}
                                placeholder="Nhập Matter name..."
                            />
                        </div>
                    </div>
                </div>

                {/* PAYMENT INSTRUCTION */}
                <div className="w-full mt-4">
                    <h3 className="text-center font-bold text-lg mb-4">
                        PAYMENT INSTRUCTION
                    </h3>
                    <table className="mx-auto w-full max-w-3xl text-sm">
                        <tbody>
                            <tr>
                                <td className="w-1/2 text-right pr-4 font-medium">
                                    Our bank account No.:
                                </td>
                                <td className="w-1/2 text-left pl-4">19037215199020</td>
                            </tr>
                            <tr>
                                <td className="w-1/2 text-right pr-4 font-medium">
                                    Our bank:
                                </td>
                                <td className="w-1/2 text-left pl-4">
                                    The Vietnam Technological and Commercial Joint Stock
                                    Bank (TECHCOMBANK)
                                </td>
                            </tr>
                            <tr>
                                <td className="w-1/2 text-right pr-4 font-medium">
                                    Branch:
                                </td>
                                <td className="w-1/2 text-left pl-4">Head Quarter</td>
                            </tr>
                            <tr>
                                <td className="w-1/2 text-right pr-4 font-medium">
                                    Address:
                                </td>
                                <td className="w-1/2 text-left pl-4">
                                    No. 82 Nguyen Tuan, Thanh Xuan Ward, Hanoi, Vietnam
                                </td>
                            </tr>
                            <tr>
                                <td className="w-1/2 text-right pr-4 font-medium">
                                    SWIFT Code:
                                </td>
                                <td className="w-1/2 text-left pl-4">VTCBVNVX</td>
                            </tr>
                            <tr>
                                <td className="w-1/2 text-right pr-4 font-medium">
                                    Term of payment:
                                </td>
                                <td className="w-1/2 text-left pl-4">
                                    30 days from date of Debit Note
                                </td>
                            </tr>
                            <tr>
                                <td className="w-1/2 text-right pr-4 font-medium">
                                    Charges up to:
                                </td>
                                <td className="w-1/2 text-left pl-4">
                                    {new Date().toLocaleDateString("vi-VN")}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Bảng dịch vụ */}
                <table className="w-full border border-gray-400 text-sm mb-6">
                    <thead className="bg-teal-600 text-white">
                        <tr>
                            <th className="border border-gray-400 p-2">#</th>
                            <th className="border border-gray-400 p-2">ITEM</th>
                            <th className="border border-gray-400 p-2">Your Ref</th>
                            <th className="border border-gray-400 p-2">QTY</th>
                            <th className="border border-gray-400 p-2">
                                SERVICE FEE (VND)
                            </th>
                            <th className="border border-gray-400 p-2">TOTAL (VND)</th>
                            {/* Cột ACTION: chỉ hiển thị trên màn hình */}
                            <th className="border border-gray-400 p-2 no-print">
                                ACTION
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedCases.map((c, idx) => (
                            <tr
                                key={c.id || idx}
                                ref={idx === selectedCases.length - 1 ? tableRef : null}
                            >
                                <td className="border border-gray-400 p-2">
                                    {idx + 1}
                                </td>
                                <td className="border border-gray-400 p-2">{c.moTa}</td>
                                <td className="border border-gray-400 p-2">
                                    {c.clientsRef || "..."}
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                    1
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                    {parseFloat(c.soTien || 0).toLocaleString("vi-VN")}
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                    {parseFloat(c.soTien || 0).toLocaleString("vi-VN")}
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                    <div className="flex justify-center space-x-2">
                                        <Button
                                            type="primary"
                                            danger
                                            size="small"
                                            className="rounded-md"
                                            onClick={() => {
                                                setCaseToDelete(c.id);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            Xóa
                                        </Button>
                                        <Button
                                            type="default"
                                            size="small"
                                            className="rounded-md text-blue-600 border-blue-500 hover:bg-blue-50"
                                            onClick={() => console.log("Sửa", c.id)}
                                        >
                                            Sửa
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Subtotal, VAT, Total */}
                <div className="text-right space-y-1 mb-6">
                    <p>
                        <span className="font-semibold">
                            Subtotal amount (VND):
                        </span>{" "}
                        {subtotal.toLocaleString("vi-VN")}
                    </p>
                    <p>
                        <span className="font-semibold">VAT (5%):</span>{" "}
                        {vat.toLocaleString("vi-VN")}
                    </p>
                    <p className="text-lg font-bold text-red-600">
                        TOTAL AMOUNT DUE (VND):{" "}
                        {total.toLocaleString("vi-VN")}
                    </p>
                </div>

                {/* Nút thao tác – không in ra PDF */}
                <div className="flex justify-end space-x-2 no-print">
                    <Button
                        type="default"
                        className="rounded-md"
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>

                    <Button
                        type="dashed"
                        className="rounded-md"
                        icon={<span style={{ fontWeight: "bold" }}>＋</span>}
                        onClick={handleAddCaseClick}
                    >
                        Thêm ITEM
                    </Button>

                    <Button
                        type="primary"
                        className="rounded-md bg-teal-600 hover:bg-teal-700"
                        onClick={handleSave}
                    >
                        Lưu
                    </Button>

                    <Button
                        type="primary"
                        className="rounded-md bg-red-500 hover:bg-red-600"
                        onClick={() => window.print()}
                    >
                        Xuất PDF
                    </Button>
                    <Button
                        type="primary"
                        className="rounded-md bg-yellow-500 hover:bg-yellow-600"
                        onClick={exportToExcel}
                    >
                        Xuất Excel
                    </Button>
                </div>

                {/* Note & Contact */}
                <div className="mt-6 text-sm text-gray-700 leading-relaxed text-left">
                    <p className="italic text-red-600 mb-2">
                        * Note: The above fee excludes bank charges or PayPal fees.
                        Please bear all related wire fees (including local bank fees
                        and intermediary banking fees) so that we receive the payment
                        in full to our account.
                    </p>

                    <p className="mb-2">
                        <span className="font-semibold">
                            For further information:
                        </span>{" "}
                        Email us at{" "}
                        <a
                            href="mailto:billing@ipac.vn"
                            className="text-blue-600 underline"
                        >
                            billing@ipac.vn
                        </a>{" "}
                        or call us at{" "}
                        <span className="font-semibold">+84 24 6286 8888</span>.
                    </p>

                    <p className="font-semibold uppercase text-teal-700 mt-4">
                        IPAC Intellectual Property Consultancy JSC
                    </p>

                    <p className="mt-1">
                        <span className="font-semibold">Vietnam Office:</span> No.
                        17-LK3, 90 Nguyen Tuan Area, Nguyen Tuan Street, Thanh Xuan,
                        Hanoi, Vietnam
                    </p>

                    <p className="mt-1">
                        <span className="font-semibold">Cambodia Office:</span> No.
                        531, St. 128, Sangkat Psadepo I, Khan Toul Kork, Phnom Penh,
                        Cambodia
                    </p>
                </div>

                {/* Ngày tháng */}
                <div className="grid grid-cols-2 gap-8 mb-6 text-left">
                    <div>
                        <label className="block text-gray-700 text-left">
                            Ngày gửi
                        </label>
                        <DatePicker
                            value={ngayGui ? dayjs(ngayGui) : null}
                            onChange={(date) => {
                                if (dayjs.isDayjs(date) && date.isValid()) {
                                    setNgayGui(date.format("YYYY-MM-DD"));
                                } else {
                                    setNgayGui(null);
                                }
                            }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày gửi"
                            className="mt-1 w-full"
                            style={{ height: "38px" }}
                            disabledDate={(current) =>
                                current && current > dayjs().endOf("day")
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-left">
                            Ngày thanh toán
                        </label>
                        <DatePicker
                            value={ngayThanhToan ? dayjs(ngayThanhToan) : null}
                            onChange={(date) => {
                                if (dayjs.isDayjs(date) && date.isValid()) {
                                    setNgayThanhToan(date.format("YYYY-MM-DD"));
                                } else {
                                    setNgayThanhToan(null);
                                }
                            }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày thanh toán"
                            className="mt-1 w-full"
                            style={{ height: "38px" }}
                            disabledDate={(current) =>
                                current && current > dayjs().endOf("day")
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-left">
                            Ngày gửi hóa đơn
                        </label>
                        <DatePicker
                            value={ngayGuiHoaDon ? dayjs(ngayGuiHoaDon) : null}
                            onChange={(date) => {
                                if (dayjs.isDayjs(date) && date.isValid()) {
                                    setNgayGuiHoaDon(date.format("YYYY-MM-DD"));
                                } else {
                                    setNgayGuiHoaDon(null);
                                }
                            }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày gửi hóa đơn"
                            className="mt-1 w-full"
                            style={{ height: "38px" }}
                            disabledDate={(current) =>
                                current && current > dayjs().endOf("day")
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-left">
                            Ngày xuất
                        </label>
                        <DatePicker
                            value={ngayXuat ? dayjs(ngayXuat) : null}
                            onChange={(date) => {
                                if (dayjs.isDayjs(date) && date.isValid()) {
                                    setNgayXuat(date.format("YYYY-MM-DD"));
                                } else {
                                    setNgayXuat(null);
                                }
                            }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày xuất"
                            className="mt-1 w-full"
                            style={{ height: "38px" }}
                            disabledDate={(current) =>
                                current && current > dayjs().endOf("day")
                            }
                        />
                    </div>
                </div>

                {/* Ghi chú */}
                <div className="mb-6">
                    <label className="block text-gray-700 text-left">
                        Ghi chú
                    </label>
                    <textarea
                        className="border border-gray-400 rounded-md p-2 w-full"
                        rows={3}
                        value={ghiChu}
                        onChange={(e) => setGhiChu(e.target.value)}
                        placeholder="Nhập ghi chú..."
                    />
                </div>

                {/* Modal / CaseSelect – không in */}
                <div className="no-print">
                    <CaseSelectModal
                        open={isModalVisible}
                        options={caseOptions}
                        value={selectedCaseId}
                        onChange={setSelectedCaseId}
                        onOk={handleConfirmAddCase}
                        onCancel={() => setIsModalVisible(false)}
                    />
                    <Modal
                        title="Xác nhận xóa"
                        open={showDeleteModal}
                        onOk={confirmDelete}
                        onCancel={() => setShowDeleteModal(false)}
                        okText="Xác nhận xóa"
                        cancelText="Hủy"
                        okButtonProps={{
                            className: "bg-red-500 hover:bg-red-600 text-white",
                        }}
                    >
                        <p>
                            Bạn có chắc chắn muốn xóa vụ việc này khỏi danh sách đề
                            nghị thanh toán không?
                        </p>
                    </Modal>
                </div>
            </div>
        </div>
    );
}

export default DebitNoteEdit;
