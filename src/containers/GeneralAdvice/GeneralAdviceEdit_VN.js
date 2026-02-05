import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import callAPI from "../../utils/api";
import Select from "react-select";
import { showSuccess, showError } from "../../components/commom/Notification";
import { DatePicker } from "antd";
import DSVuViec from "../../components/VuViecForm/DSVuViec.js";
import dayjs from "dayjs";

function GeneralAdviceEdit_VN() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isGeneralAdvice = true;

  const [maHoSo, setMaHoSo] = useState("");
  const [idKhachHang, setIdKhachHang] = useState(null);
  const [idDoiTac, setIdDoiTac] = useState(null);
  const [noiDung, setNoiDung] = useState("");
  const [deadline, setDeadline] = useState("");
  const [softDeadline, setSoftDeadline] = useState("");
  const [ngayXuLy, setNgayXuLy] = useState("");
  const [ngayHoanThanh, setNgayHoanThanh] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [vuViecList, setVuViecList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    fetchDetail();
    fetchPartners();
    fetchCustomers();
  }, []);

  const fetchDetail = async () => {
    const res = await callAPI({ method: "post", endpoint: "/generaladvices_vn/detail", data: { id } });
    setMaHoSo(res.maHoSo);
    setIdKhachHang(res.idKhachHang);
    setIdDoiTac(res.idDoiTac);
    setNoiDung(res.noiDung);
    setDeadline(res.deadline);
    setSoftDeadline(res.softDeadline);
    setNgayXuLy(res.ngayXuLy);
    setNgayHoanThanh(res.ngayHoanThanh);
    setTrangThai(res.trangThai);
    setGhiChu(res.ghiChu);
    setVuViecList(res.vuViecs || [])
  };

  const fetchPartners = async () => {
    const res = await callAPI({ method: "post", endpoint: "/partner/all", data: {} });
    setPartners(res);
  };

  const fetchCustomers = async () => {
    const res = await callAPI({ method: "post", endpoint: "/customers/by-name", data: {} });
    setCustomers(res);
  };

  const formatOptions = (data, valueKey, labelKey) =>
    data.map((item) => ({ value: item[valueKey], label: item[labelKey] }));

  const statusOptions = [
    { value: "1", label: "Mới" },
    { value: "2", label: "Đang xử lý" },
    { value: "3", label: "Hoàn thành" },
  ];

  const handleEdit = async () => {
    try {
      await callAPI({
        method: "post",
        endpoint: "/generaladvices_vn/edit",
        data: {
          id,
          maHoSo,
          idKhachHang,
          idDoiTac,
          noiDung,
          deadline,
          softDeadline,
          ngayXuLy,
          ngayHoanThanh,
          trangThai,
          ghiChu,
          vuViecs: vuViecList
        },
      });
      showSuccess("Thành công", "Cập nhật tư vấn chung thành công!");
      navigate(-1);
    } catch (e) {
      showError("Thất bại", "Có lỗi xảy ra");
    }
  };

  const handleVuViecChange = (list) => setVuViecList(list);

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          ✏️ Cập nhật tư vấn chung Việt Nam
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          <div className="flex-1">
            <label className="block text-gray-700 text-left">Mã hồ sơ <span className="text-red-500">*</span></label>
            <input type="text" value={maHoSo} onChange={(e) => setMaHoSo(e.target.value)} className="w-full p-2 mt-1 border rounded-lg text-input h-10" />
          </div>

          <div>
            <label className="block text-gray-700 text-left">Khách hàng <span className="text-red-500">*</span></label>
            <Select options={formatOptions(customers, "id", "tenKhachHang")} value={idKhachHang ? formatOptions(customers, "id", "tenKhachHang").find(x => x.value === idKhachHang) : null} onChange={(v) => setIdKhachHang(v?.value || null)} className="w-full mt-1 rounded-lg text-left" isClearable />
          </div>

          <div>
            <label className="block text-gray-700 text-left">Đối tác</label>
            <Select options={formatOptions(partners, "id", "tenDoiTac")} value={idDoiTac ? formatOptions(partners, "id", "tenDoiTac").find(x => x.value === idDoiTac) : null} onChange={(v) => setIdDoiTac(v?.value || null)} className="w-full mt-1 rounded-lg text-left" isClearable />
          </div>

          <div>
            <label className="block text-gray-700 text-left">Trạng thái</label>
            <Select options={statusOptions} value={statusOptions.find(x => x.value === trangThai) || null} onChange={(v) => setTrangThai(v?.value || "")} className="w-full mt-1 rounded-lg text-left" />
          </div>

          <div>
            <label className="block text-gray-700 text-left">Deadline cứng</label>
            <DatePicker value={deadline ? dayjs(deadline) : null} onChange={d => setDeadline(d?.isValid() ? d.format("YYYY-MM-DD") : null)} format="DD/MM/YYYY" className="mt-1 w-full" />
          </div>

          <div>
            <label className="block text-gray-700 text-left">Deadline mềm</label>
            <DatePicker value={softDeadline ? dayjs(softDeadline) : null} onChange={d => setSoftDeadline(d?.isValid() ? d.format("YYYY-MM-DD") : null)} format="DD/MM/YYYY" className="mt-1 w-full" />
          </div>

          <div>
            <label className="block text-gray-700 text-left">Ngày xử lý</label>
            <DatePicker value={ngayXuLy ? dayjs(ngayXuLy) : null} onChange={d => setNgayXuLy(d?.isValid() ? d.format("YYYY-MM-DD") : null)} format="DD/MM/YYYY" className="mt-1 w-full" />
          </div>

          <div>
            <label className="block text-gray-700 text-left">Ngày hoàn thành</label>
            <DatePicker value={ngayHoanThanh ? dayjs(ngayHoanThanh) : null} onChange={d => setNgayHoanThanh(d?.isValid() ? d.format("YYYY-MM-DD") : null)} format="DD/MM/YYYY" className="mt-1 w-full" />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 text-left">Nội dung</label>
            <textarea value={noiDung} onChange={(e) => setNoiDung(e.target.value)} className="w-full p-2 mt-1 border rounded-lg h-24" />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 text-left">Ghi chú</label>
            <input type="text" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} className="w-full p-2 mt-1 border rounded-lg" />
          </div>

        </div>

        <DSVuViec
          maHoSo={maHoSo}
          onVuViecChange={handleVuViecChange}
          initialVuViecs={vuViecList}
          isGeneralAdvice={isGeneralAdvice}
          maHoSoVuViec={maHoSo}
        />

        <div className="flex justify-center gap-4 mt-4">
          <button className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg" onClick={() => navigate(-1)}>Quay lại</button>
          <button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Cập nhật
          </button>
        </div>

      </div>
    </div>
  );
}

export default GeneralAdviceEdit_VN;
