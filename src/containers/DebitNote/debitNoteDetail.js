import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Modal, Radio, Button } from "antd";
import callAPI from "../../utils/api.js";
import { DatePicker } from "antd";
import dayjs from "dayjs";

function DebitNoteDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { idDoiTac, idKhachHang, caseId, maHoSo } = location.state || {};
  const [partner, setPartner] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [selectedCases, setSelectedCases] = useState([]); // danh sách vụ việc đã chọn
  const [availableCases, setAvailableCases] = useState([]); // danh sách vụ việc có thể chọn
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState(null);
  const contactInfo = partner || customer;
  const [deBitNoteNo, setDeBitNoteNo] = useState(""); // debit note number
  const [matterName, setMatterName] = useState(""); // matter name
  const [ngayGui, setNgayGui] = useState("");
  const [ngayThanhToan, setNgayThanhToan] = useState("");
  const [ngayGuiHoaDon, setNgayGuiHoaDon] = useState("");
  const [ngayXuat, setNgayXuat] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);

  const tableRef = useRef(null); // để scroll xuống bảng
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

          setDeBitNoteNo(d.deBitNoteNo || "");
          setMatterName(d.matterName || "");
          setNgayGui(d.ngayGui || "");
          setNgayThanhToan(d.ngayThanhToan || "");
          setNgayGuiHoaDon(d.ngayGuiHoaDon || "");
          setNgayXuat(d.ngayXuat || "");
          setGhiChu(d.ghiChu || "");

          // ✅ mapping các field mới
          setSelectedCases([{ clientsRef: d.yourRef || "" }]);
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

          // ✅ map danh sách vụ việc
          setAvailableCases(
            (d.DeNghiThanhToan_VuViec || []).map((item) => ({
              id: item.idVuViec,
              moTa: item.VuViec?.moTa,
              tenVuViec: item.VuViec?.tenVuViec,
              soTien: item.VuViec?.soTien,
            }))
          );
          setSubtotal(parseFloat(d.tongTien || 0));
          setVat(parseFloat(d.thue || 0));
          setTotal(parseFloat(d.tongTienSauThue || 0));
        }
      } catch (err) {
        console.error("❌ Lỗi gọi API detail:", err);
      }
    };

    if (id) fetchDetail();
  }, [id]);



  return (
    <div className="p-6 bg-gray-100 flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-5xl border border-gray-300">
        {/* Header và thông tin khách hàng */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <img
            src="https://ipac.vn/image/catalog/logo/rsz_1logo.jpg"
            alt="IPAC Logo"
            className="h-16"
          />
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-teal-700 uppercase">
              THÔNG TIN ĐỀ NGHỊ THANH TOÁN (DEBIT NOTE)
            </h1>
          </div>
        </div>

        {/* Thông tin khách hàng */}
        <div className="grid grid-cols-2 gap-8 mb-6 text-left">
          {/* Cột trái */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">To:</span>
              <span className="col-span-2">{contactInfo?.nguoiLienHe}</span>
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
              <span className="col-span-2">{contactInfo?.email || "—"}</span>
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
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">Your Ref:</span>
              <input
                type="text"
                className="border-b border-gray-400 focus:outline-none col-span-2"
                value={selectedCases[0]?.clientsRef || ""}
                onChange={(e) =>
                  setSelectedCases((prev) => [
                    { ...prev[0], clientsRef: e.target.value },
                    ...prev.slice(1),
                  ])
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
              <input
                type="text"
                className="border-b border-gray-400 focus:outline-none col-span-2"
                value={matterName}
                onChange={(e) => setMatterName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="w-full mt-4">
          <h3 className="text-center font-bold text-lg mb-4">PAYMENT INSTRUCTION</h3>
          <table className="mx-auto w-full max-w-3xl text-sm">
            <tbody>
              <tr>
                <td className="w-1/2 text-right pr-4 font-medium">Our bank account No.:</td>
                <td className="w-1/2 text-left pl-4">19037215199020</td>
              </tr>
              <tr>
                <td className="w-1/2 text-right pr-4 font-medium">Our bank:</td>
                <td className="w-1/2 text-left pl-4">
                  The Vietnam Technological and Commercial Joint Stock Bank (TECHCOMBANK)
                </td>
              </tr>
              <tr>
                <td className="w-1/2 text-right pr-4 font-medium">Branch:</td>
                <td className="w-1/2 text-left pl-4">Head Quarter</td>
              </tr>
              <tr>
                <td className="w-1/2 text-right pr-4 font-medium">Address:</td>
                <td className="w-1/2 text-left pl-4">
                  No. 82 Nguyen Tuan, Thanh Xuan Ward, Hanoi, Vietnam
                </td>
              </tr>
              <tr>
                <td className="w-1/2 text-right pr-4 font-medium">SWIFT Code:</td>
                <td className="w-1/2 text-left pl-4">VTCBVNVX</td>
              </tr>
              <tr>
                <td className="w-1/2 text-right pr-4 font-medium">Term of payment:</td>
                <td className="w-1/2 text-left pl-4">30 days from date of Debit Note</td>
              </tr>
              <tr>
                <td className="w-1/2 text-right pr-4 font-medium">Charges up to:</td>
                <td className="w-1/2 text-left pl-4"> {new Date().toLocaleDateString("vi-VN")}</td>
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
              <th className="border border-gray-400 p-2">SERVICE FEE (VND)</th>
              <th className="border border-gray-400 p-2">TOTAL (VND)</th>
              {/* <th className="border border-gray-400 p-2">ACTION</th> */}
            </tr>
          </thead>
          <tbody>
            {availableCases.map((c, idx) => (
              <tr
                key={c.id}
                ref={idx === availableCases.length - 1 ? tableRef : null}
              >
                <td className="border border-gray-400 p-2">{idx + 1}</td>

                <td className="border border-gray-400 p-2">{c.moTa}</td>
                <td className="border border-gray-400 p-2">...</td>
                <td className="border border-gray-400 p-2 text-center">1</td>
                <td className="border border-gray-400 p-2 text-center">
                  {parseFloat(c.soTien || 0).toLocaleString("vi-VN")}
                </td>
                <td className="border border-gray-400 p-2 text-center">
                  {parseFloat(c.soTien || 0).toLocaleString("vi-VN")}
                </td>
                {/* <td className="border border-gray-400 p-2 text-center">
                  <div className="flex justify-center space-x-2">
                    <Button
                      type="primary"
                      danger
                      size="small"
                      className="rounded-md"
                      onClick={() => {
                        setCaseToDelete(c.id); // ✅ lưu id vụ việc
                        setShowDeleteModal(true); // ✅ mở modal
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
                </td> */}


              </tr>
            ))}
          </tbody>
        </table>

        {/* Subtotal, VAT, Total */}
        <div className="text-right space-y-1 mb-6">
          <p>
            <span className="font-semibold">Subtotal amount (VND):</span>{" "}
            {subtotal.toLocaleString("vi-VN")}
          </p>
          <p>
            <span className="font-semibold">VAT (5%):</span>{" "}
            {vat.toLocaleString("vi-VN")}
          </p>
          <p className="text-lg font-bold text-red-600">
            TOTAL AMOUNT DUE (VND): {total.toLocaleString("vi-VN")}
          </p>
        </div>


        {/* Nút thêm vụ việc */}
        <div className="flex justify-end space-x-2">
          <Button
            type="default"
            className="rounded-md"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </div>
        <div className="mt-6 text-sm text-gray-700 leading-relaxed text-left">
          <p className="italic text-red-600 mb-2">
            * Note: The above fee excludes bank charges or PayPal fees.
            Please bear all related wire fees (including local bank fees and intermediary banking fees)
            so that we receive the payment in full to our account.
          </p>

          <p className="mb-2">
            <span className="font-semibold">For further information:</span>
            Email us at <a href="mailto:billing@ipac.vn" className="text-blue-600 underline">billing@ipac.vn</a>
            or call us at <span className="font-semibold">+84 24 6286 8888</span>.
          </p>

          <p className="font-semibold uppercase text-teal-700 mt-4">
            IPAC Intellectual Property Consultancy JSC
          </p>

          <p className="mt-1">
            <span className="font-semibold">Vietnam Office:</span>
            No. 17-LK3, 90 Nguyen Tuan Area, Nguyen Tuan Street, Thanh Xuan, Hanoi, Vietnam
          </p>

          <p className="mt-1">
            <span className="font-semibold">Cambodia Office:</span>
            No. 531, St. 128, Sangkat Psadepo I, Khan Toul Kork, Phnom Penh, Cambodia
          </p>
        </div>

        {/* Ngày gửi */}
        <div className="grid grid-cols-2 gap-8 mb-6 text-left">
          {/* Ngày gửi */}
          {ngayGui && (
            <div className="flex">
              <span className="w-32 font-medium">{dayjs(ngayGui).format("DD/MM/YYYY")}</span>
              <span>Ngày gửi</span>
            </div>
          )}

          {/* Ngày thanh toán */}
          {ngayThanhToan && (
            <div className="flex">
              <span className="w-32 font-medium">{dayjs(ngayThanhToan).format("DD/MM/YYYY")}</span>
              <span>Ngày thanh toán</span>
            </div>
          )}

          {/* Ngày gửi hóa đơn */}
          {ngayGuiHoaDon && (
            <div className="flex">
              <span className="w-32 font-medium">{dayjs(ngayGuiHoaDon).format("DD/MM/YYYY")}</span>
              <span>Ngày gửi hóa đơn</span>
            </div>
          )}

          {/* Ngày xuất */}
          {ngayXuat && (
            <div className="flex">
              <span className="w-32 font-medium">{dayjs(ngayXuat).format("DD/MM/YYYY")}</span>
              <span>Ngày xuất</span>
            </div>
          )}
        </div>


        {/* Ngày xuất */}



        {/* Ghi chú */}
        <div className="mb-6 flex">
          <span className="w-32 font-medium text-gray-700">Ghi chú:</span>
          <span>{ghiChu || "—"}</span>
        </div>


      </div>
    </div>
  );
}

export default DebitNoteDetail;
