import React, { useState } from "react";
import { Modal, Radio, Upload, Button, message } from "antd";
import { UploadOutlined, PrinterOutlined } from "@ant-design/icons";
import { saveAs } from "file-saver";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import { showError } from "../commom/Notification";

const templates = [
  { label: "FORM-CVBS-GiayUyQuyen", value: "/template/FORM-CVBS-GiayUyQuyen.docx" },
  { label: "Mẫu_CV _ Bổ sung tài liệu đơn", value: "/template/Mẫu_CV _ Bổ sung tài liệu đơn.docx" },
  { label: "Mẫu_CV gia hạn trả lời HT", value: "/template/Mẫu_CV gia hạn trả lời HT.docx" },
  { label: "Mẫu_CV gia hạn trả lời ND", value: "/template/Mẫu_CV gia hạn trả lời ND.docx" },
  { label: "[Eng} Form dịch VBBH", value: "/template/[Eng} Form dịch VBBH.docx" },
];

function ExportWordModal({ data, fileName = "export", open, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].value);
  const [customFile, setCustomFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const handlePrint = async () => {
    try {
      setLoading(true);
      let arrayBuffer;

      if (customFile) {
        arrayBuffer = await customFile.arrayBuffer();
      } else if (selectedTemplate) {
        const res = await fetch(selectedTemplate);
        if (!res.ok) throw new Error("Không thể tải template từ server");
        arrayBuffer = await res.arrayBuffer();
      } else {
        throw new Error("Không có mẫu Word được chọn hoặc tải lên.");
      }

      // ✅ Kiểm tra arrayBuffer đúng định dạng
      if (!(arrayBuffer instanceof ArrayBuffer)) {
        throw new Error("Dữ liệu template không hợp lệ (không phải ArrayBuffer)");
      }

      const zip = new PizZip(arrayBuffer);

      const imageModule = new ImageModule({
        getImage(tagValue) {
          const base64Data = tagValue.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
          const byteArray = new Uint8Array(byteNumbers);
          return Promise.resolve(byteArray);
        },

        getSize(imgData, tagValue) {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const fixedWidth = 150; // chiều ngang cố định
              const ratio = img.height / img.width;
              const fixedHeight = fixedWidth * ratio; // giữ đúng tỷ lệ
              resolve([fixedWidth, fixedHeight]);
            };
            img.src = tagValue;
          });
        },
         align: 'left', // một số bản ImageModule hỗ trợ align
        usePlaceholderAlign: false
      });



      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [imageModule],
      });

      await doc.renderAsync(data); // dùng async vì getImage là Promise

      const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      saveAs(out, `${fileName}.docx`);
      message.success("In file thành công!");
      onClose();
    } catch (err) {
      console.error("Lỗi in file:", err);
      if (err.properties && err.properties.errors) {
        err.properties.errors.forEach((e, i) => {
          console.error(`🔸 [${i + 1}]`, e);
        });
      }
      showError("Thất bại!", "Đã xảy ra lỗi trong quá trình in file.", err);
      message.error("Có lỗi xảy ra khi in file.");
    }
    finally {
      setLoading(false);
    }
  };

  const [showGuideModal, setShowGuideModal] = useState(false);

  return (
    <Modal
      open={open}
      title="Chọn mẫu in Word"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Hủy</Button>,
        <Button
          key="print"
          type="primary"
          loading={loading}
          icon={<PrinterOutlined />}
          onClick={handlePrint}
        >
          In
        </Button>,
      ]}
    >
      <p>Chọn mẫu file:</p>
      <Radio.Group
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        value={selectedTemplate}
        onChange={(e) => {
          setSelectedTemplate(e.target.value);
          setCustomFile(null); // reset custom
        }}
        disabled={customFile !== null}
      >
        {templates.map((tpl) => (
          <Radio key={tpl.value} value={tpl.value}>
            {tpl.label}
          </Radio>
        ))}
      </Radio.Group>

      <div style={{ marginTop: 20 }}>
        <Upload
          beforeUpload={(file) => {
            setCustomFile(file);
            setSelectedTemplate(null); // reset selected template
            return false; // prevent auto upload
          }}
          maxCount={1}
          accept=".docx"
        >
          <Button icon={<UploadOutlined />}>Tải mẫu Word từ máy</Button>
        </Upload>
        {customFile && <p style={{ marginTop: 10 }}>✔️ Đã chọn: {customFile.name}</p>}
        <Button
          type="link"
          style={{ paddingLeft: 0 }}
          onClick={() => setShowGuideModal(true)}
        >
          📘 Xem hướng dẫn chèn tag Word
        </Button>
        <Modal
          open={showGuideModal}
          title="📘 Hướng dẫn chèn tag trong file Word"
          onCancel={() => setShowGuideModal(false)}
          footer={[
            <Button key="close" type="primary" onClick={() => setShowGuideModal(false)}>
              Đóng
            </Button>
          ]}
        >
          <p style={{ fontStyle: "italic", marginBottom: 8 }}>
            Sử dụng các tag sau trong nội dung file Word để hệ thống tự động thay thế:
          </p>
          <ul style={{ paddingLeft: 20, fontSize: 14 }}>
            <li>✔️ <code>{'{ngayHienTai}'}</code> – Ngày hiện tại</li>
            <li>✔️ <code>{'{maHoSoVuViec}'}</code> – Mã hồ sơ vụ việc</li>
            <li>✔️ <code>{'{soDon}'}</code> – Số đơn</li>
            <li>✔️ <code>{'{tenKhachHang}'}</code> – Tên khách hàng</li>
            <li>✔️ <code>{'{tenDaiDien}'}</code> – Tên đại diện</li>
            <li>✔️ <code>{'{tenNhanHieu}'}</code> – Tên nhãn hiệu</li>
            <li>✔️ <code>{'{%%image}'}</code> – Ảnh nhãn hiệu</li>
            <li>✔️ <code>{'{diaChi}'}</code> – Địa chỉ</li>
            <li>✔️ <code>{'{ngayNopDon}'}</code> – Ngày nộp đơn</li>
            <li>✔️ <code>{'{soDon}'}</code> – Số đơn</li>
            <li>✔️ <code>{'{diaChi}'}</code> – Địa chỉ</li>
            <li>✔️ <code>{'{ngayCongBo}'}</code> – Ngày công bố đơn</li>
            <li>✔️ <code>{'{ngayNhanThongBaoTuChoiHT}'}</code> – Ngày thông báo từ chối thẩm định hình thức</li>
            <li>✔️ <code>{'{hanTraLoiHT}'}</code> – Hạn trả lời HT</li>
            <li>✔️ <code>{'{ngayNhanThongBaoTuChoiND}'}</code> – Ngày thông báo từ chối thẩm định nội dung</li>
            <li>✔️ <code>{'{hanTraLoiND}'}</code> – Hạn trả lời ND</li>
            <li>✔️ <code>{'{maSPDVList}'}</code> – Danh sách nhóm sản phẩm & dịch vụ</li>
            <li>✔️ <code>{'{soBang}'}</code> – Số bằng</li>
            <li>✔️ <code>{'{quyetDinhSo}'}</code> – Quyết định số</li>
            <li>✔️ <code>{'{ngayCapBang}'}</code> – Ngày cấp bằng</li>
            <li>✔️ <code>{'{ngayGuiBangChoKH}'}</code> – Ngày gửi bằng cho khách hàng</li>
            <li>✔️ <code>{'{giayUyQuyenGoc}'}</code> – Số đơn của giấy ủy quyền gốc</li>

          </ul>
          <p style={{ fontSize: 13, color: "#888" }}>
            ⚠️ Các tag phải viết đúng chính tả, định dạng sẵn (bôi đậm, nghiêng...) trong Word.
          </p>
        </Modal>


      </div>
    </Modal>
  );
}

export default ExportWordModal;
