import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, message } from "antd";
import callAPI from "../../utils/api";
import { showSuccess, showError } from "../../components/commom/Notification";
import FormAffidavit from "../../components/commom/FormAffidavit";
import GCN_NH_Info from "../../components/commom/GCN_NH_Info";
import DocumentSection_KH from "../../components/TrademarkRegistrationProcess/KH/DocumentSection_KH";
function AffdavitEdit() {
    const navigate = useNavigate();
    const { id } = useParams(); // id của affidavit
    const [affidavit, setAffidavit] = useState(null);
    const [gcnData, setGcnData] = useState(null);

    // Form state
    const [soAffidavit, setSoAffidavit] = useState("");
    const [idGCN_NH, setIdGCN_NH] = useState(null);
    const [lanNop, setLanNop] = useState(1);
    const [ngayNop, setNgayNop] = useState(null);
    const [ngayGhiNhan, setNgayGhiNhan] = useState(null);
    const [ghiChu, setGhiChu] = useState("");
    const [isAutoImport, setIsAutoImport] = useState(false);
    const [taiLieuList, setTaiLieuList] = useState([]);
    // 🔹 Lấy chi tiết affidavit (đã chứa luôn GCN)
    const fetchAffidavitDetail = async () => {
        try {
            const res = await callAPI({
                method: "post",
                endpoint: "/affidavit/detail",
                data: { id },
            });

            const detail = res?.data;
            setAffidavit(detail);
            setGcnData(detail?.gcn);

            // Gán dữ liệu vào form
            setSoAffidavit(detail?.soAffidavit || "");
            setIdGCN_NH(detail?.idGCN_NH || null);
            setLanNop(detail?.lanNop || 1);
            setNgayNop(detail?.ngayNop || null);
            setNgayGhiNhan(detail?.ngayGhiNhan || null);
            setGhiChu(detail?.ghiChu || "");
            setIsAutoImport(detail?.isAutoImport || false);
            setTaiLieuList(detail?.taiLieu || []);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết affidavit:", error);
            message.error("Không thể tải thông tin affidavit!");
        }
    };

    useEffect(() => {
        if (id) fetchAffidavitDetail();
    }, [id]);

    if (!affidavit) return <div className="p-4">Đang tải dữ liệu...</div>;

    // 🔹 Cập nhật affidavit
    const handleSubmitAffidavit = async () => {
        const payload = {
            id,
            idGCN_NH,
            soAffidavit,
            lanNop,
            ngayNop,
            ngayGhiNhan,
            ghiChu,
            isAutoImport,
            taiLieus: taiLieuList,
        };
        try {
            await callAPI({
                method: "put",
                endpoint: "/affidavit/update",
                data: payload,
            });
            await showSuccess("Thành công!", "Cập nhật affidavit thành công!");
            message.success("Cập nhật affidavit thành công!");
        } catch (error) {
            showError("Thất bại!", "Đã xảy ra lỗi.", error);
            console.error("Lỗi khi cập nhật affidavit:", error);
            message.error("Không thể cập nhật affidavit!");
        }
    };
    const handleTaiLieuChange = (list) => {
        setTaiLieuList(list);
    };
    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-5xl">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
                    Chi tiết Affidavit
                </h2>

                {/* Hiển thị thông tin GCN */}
                {gcnData && (
                    <>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                            Thông tin GCN Nhãn hiệu
                        </h3>
                        <GCN_NH_Info data={gcnData} />
                    </>
                )}

                {/* Form affidavit */}
                <div className="mt-10 border-t pt-6">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Cập nhật Affidavit
                    </h3>
                    <div className="col-span-2">
                        <DocumentSection_KH onTaiLieuChange={handleTaiLieuChange} initialTaiLieus={taiLieuList}
                        />
                    </div>
                    <FormAffidavit
                        soAffidavit={soAffidavit}
                        setSoAffidavit={setSoAffidavit}
                        idGCN_NH={idGCN_NH}
                        setIdGCN_NH={setIdGCN_NH}
                        lanNop={lanNop}
                        setLanNop={setLanNop}
                        ngayNop={ngayNop}
                        setNgayNop={setNgayNop}
                        ngayGhiNhan={ngayGhiNhan}
                        setNgayGhiNhan={setNgayGhiNhan}
                        ghiChu={ghiChu}
                        setGhiChu={setGhiChu}
                        isAutoImport={isAutoImport}
                        setIsAutoImport={setIsAutoImport}
                    />

                    <div className="flex justify-end mt-6 gap-3">
                        <Button onClick={() => navigate(-1)}>← Quay lại</Button>
                        <Button
                            type="primary"
                            className="bg-[#009999]"
                            onClick={handleSubmitAffidavit}
                        >
                            Lưu Thay Đổi
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AffdavitEdit;
