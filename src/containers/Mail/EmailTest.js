import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space } from 'antd';
import callAPI from '../../utils/api';

const defaults = { to: 'daobqit@gmail.com', country: 'Vietnam', applicant: 'Ren Chenying', trademarkName: 'ZHA 7 GONG logo', classes: '43', applicationNumber: '4-2026-24533', ourRef: 'R00010-00001', yourRef: 'PS26-1199', recipientName: 'Tina', filingDate: '2026-05-27', publicationDate: '2026-09-15', address: 'Room 202, Unit 1, Building 2, Milan Ge, Milan Sunshine, Sanjiang Subdistrict, Shengzhou City, Zhejiang Province, China' };
const fields = [['country', 'Nước'], ['applicant', 'Người nộp đơn'], ['trademarkName', 'Tên nhãn hiệu'], ['classes', 'Nhóm'], ['applicationNumber', 'Số đơn'], ['ourRef', 'Mã hồ sơ'], ['yourRef', 'Mã hồ sơ khách hàng'], ['recipientName', 'Tên người nhận'], ['filingDate', 'Ngày nộp đơn'], ['publicationDate', 'Ngày công bố'], ['address', 'Địa chỉ người nộp đơn']];
export default function EmailTest() {
  const [form] = Form.useForm();
  const [status, setStatus] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [files, setFiles] = useState({});
  useEffect(() => {
    callAPI({ method: 'get', endpoint: '/mail/status' }).then(value => {
      setStatus(value);
      if (value.to && !form.isFieldTouched('to')) form.setFieldsValue({ to: value.to });
    }).catch(error => setNotice({ type: 'error', message: String(error) }));
  }, [form]);
  const chooseFile = async (key, event) => {
    const file = event.target.files[0];
    setPreview(null); setNotice(null);
    setFiles(previous => ({ ...previous, [key]: null }));
    if (!file) return;
    const allowed = key === 'trademarkImage' ? ['image/png', 'image/jpeg'] : ['application/pdf', 'image/png', 'image/jpeg'];
    if (file.size > 5 * 1024 * 1024 || !allowed.includes(file.type)) {
      event.target.value = '';
      setNotice({ type: 'error', message: 'Chọn PNG/JPEG hoặc PDF (trang công bố), tối đa 5 MB/tệp.' }); return;
    }
    setReading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error('Không đọc được tệp.'));
        reader.readAsDataURL(file);
      });
      setFiles(previous => ({ ...previous, [key]: { name: file.name, type: file.type, base64 } }));
    } catch { setNotice({ type: 'error', message: 'Không đọc được tệp. Vui lòng chọn lại.' }); }
    finally { setReading(false); }
  };
  const generate = async values => {
    setBusy(true); setNotice(null); setPreview(null);
    try {
      const data = { ...values, ...files };
      const draft = await callAPI({ endpoint: '/mail/preview', data });
      const html = data.trademarkImage ? draft.html.replace('cid:trademark-logo', `data:${data.trademarkImage.type};base64,${data.trademarkImage.base64}`) : draft.html;
      setPreview({ ...draft, html, values: data });
    } catch (error) { setNotice({ type: 'error', message: String(error) }); }
    finally { setBusy(false); }
  };
  const send = async () => {
    setBusy(true); setNotice(null);
    try {
      const result = await callAPI({ endpoint: '/mail/test', data: preview.values });
      setNotice({ type: result.rejected?.length ? 'warning' : 'success', message: result.message, description: result.rejected?.length ? `Bị từ chối: ${result.rejected.join(', ')}` : undefined }); setPreview(null);
    } catch (error) { setNotice({ type: 'error', message: String(error) }); }
    finally { setBusy(false); }
  };
  return <Card title="Gửi email báo cáo công bố đơn" style={{ maxWidth: 1100, margin: '0 auto' }}>
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Alert type="info" showIcon message="Dữ liệu mẫu đã điền sẵn để test. Nhập email người nhận, kiểm tra thông tin, xem trước rồi bấm Gửi email."
        description="Ngày hết hạn phản đối = ngày công bố + 3 tháng (nếu tháng đích thiếu ngày thì lấy ngày cuối tháng). Nội dung theo mẫu bạn cung cấp; chưa tự lấy dữ liệu từ hồ sơ." />
      {status && <Alert showIcon type={status.enabled && status.configured ? 'success' : 'warning'}
        message={status.enabled && status.configured ? `Gửi từ: ${status.from}` : 'Chưa bật gửi mail hoặc thiếu cấu hình SMTP. Bạn vẫn có thể xem trước.'} />}
      {notice && <Alert showIcon {...notice} />}
      <Form form={form} layout="vertical" onFinish={generate} disabled={busy || reading} onValuesChange={() => setPreview(null)} initialValues={defaults}>
        <Form.Item name="to" label="Email người nhận" rules={[{ required: true, type: 'email', message: 'Nhập một email hợp lệ.' }]}><Input placeholder="Email muốn gửi đến" maxLength={254} /></Form.Item>
        <Form.Item name="cc" label="CC — gửi bản sao (không bắt buộc)" extra="Nhập từng email rồi nhấn Enter, hoặc dán nhiều email cách nhau bằng dấu phẩy/chấm phẩy. Địa chỉ trùng sẽ được loại bỏ."
          rules={[{ validator: (_, values = []) => values.length <= 50 && values.every(value => value.trim().length <= 254 && /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(value.trim())) ? Promise.resolve() : Promise.reject(new Error('Nhập tối đa 50 địa chỉ email CC hợp lệ.')) }]}>
          <Select mode="tags" tokenSeparators={[',', ';', ' ', '\n', '\t']} open={false} allowClear placeholder="Nhập email CC rồi nhấn Enter" />
        </Form.Item>
        <Row gutter={16}>{fields.map(([key, label]) => <Col xs={24} md={key === 'address' ? 24 : 12} key={key}>
          <Form.Item name={key} label={label} rules={[{ required: key !== 'yourRef', whitespace: true, message: `Nhập ${label.toLowerCase()}.` }]}>
            <Input type={key.endsWith('Date') ? 'date' : 'text'} maxLength={1000} />
          </Form.Item>
        </Col>)}</Row>
        <Form.Item label="Mẫu nhãn hiệu (PNG/JPEG, tối đa 5 MB)"><input aria-label="Mẫu nhãn hiệu" type="file" accept="image/png,image/jpeg" disabled={busy || reading} onChange={event => chooseFile('trademarkImage', event)} /></Form.Item>
        <Form.Item label="Trang công bố đính kèm (PDF/PNG/JPEG, tối đa 5 MB)"><input aria-label="Trang công bố" type="file" accept="application/pdf,image/png,image/jpeg" disabled={busy || reading} onChange={event => chooseFile('publicationFile', event)} /></Form.Item>
        <Button htmlType="submit" loading={busy || reading}>Xem trước email</Button>
      </Form>
      {preview && <Card size="small" title="Kiểm tra trước khi gửi">
        <p><strong>Đến:</strong> {preview.to}</p><p><strong>Tiêu đề:</strong> {preview.subject}</p>
        {preview.cc?.length > 0 && <p><strong>CC:</strong> {preview.cc.join(', ')}</p>}
        <p><strong>Hết hạn phản đối:</strong> {preview.oppositionDeadline}</p>
        <p><strong>Trang công bố:</strong> {preview.values.publicationFile?.name || 'Chưa đính kèm (email sẽ bỏ câu nhắc tệp đính kèm).'}</p>
        <iframe title="Nội dung email" sandbox="" srcDoc={preview.html} style={{ width: '100%', height: 620, border: '1px solid #ddd', marginBottom: 16 }} />
        <Button type="primary" loading={busy} disabled={!status?.configured || !status?.enabled} onClick={send}>Gửi email đến {preview.to}</Button>
      </Card>}
    </Space>
  </Card>;
}
