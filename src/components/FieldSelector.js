import React from "react";
import { Modal } from "antd";

function FieldSelector({
    allFieldOptions,
    selectedFields,
    setSelectedFields,
    onClose,
    onConfirm,
    visible
}) {
    return (
        <Modal
            title="🗂️ Chọn cột muốn hiển thị"
            visible={visible}
            onCancel={onClose}
            onOk={onConfirm}
            okText="Xác nhận"
            cancelText="Hủy"
            width={500}
        >
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {allFieldOptions.map(field => (
                    <label key={field.key} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={selectedFields.includes(field.key)}
                            onChange={() => {
                                setSelectedFields(prev =>
                                    prev.includes(field.key)
                                        ? prev.filter(f => f !== field.key)
                                        : [...prev, field.key]
                                );
                            }}
                            style={{ accentColor: "#009999" }} 
                        />

                        {field.label}
                    </label>
                ))}
            </div>
        </Modal>
    );
}

export default FieldSelector;
