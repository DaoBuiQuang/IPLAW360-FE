import React from "react";

function AddDocumentModal({
    isOpen,
    onClose,
    onAdd,
    fileName,
    setFileName,
    file,
    setFile,
    editingIndex
}) {
    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const maxSize = 2 * 1024 * 1024; // 5MB

        if (selectedFile && selectedFile.size > maxSize) {
            alert("Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.");
            e.target.value = ""; // Reset input
            setFile(null);
        } else {
            setFile(selectedFile);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                <h2 className="text-lg font-semibold mb-4">📎{editingIndex !== null ? "Cập nhật" : "Thêm"} tài liệu</h2>

                <label className="block text-sm font-medium text-gray-700">Tên tài liệu</label>
                <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />

                <label className="block text-sm font-medium text-gray-700">Tệp tài liệu (không bắt buộc)</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />

                <div className="flex justify-end mt-6 gap-3">
                    <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md">Hủy</button>
                    <button onClick={onAdd} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        {editingIndex !== null ? "Cập nhật" : "Thêm"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddDocumentModal;
