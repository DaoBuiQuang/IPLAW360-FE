import React, { useState } from 'react';

function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async (url) => {
    setError("");
    if (!file) {
      setError("Vui lòng chọn file Excel trước khi tải lên.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("excel", file);

      const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tải lên file Excel.");
      }

      const result = await response.json();
      alert(result.message || "✅ Tải lên thành công!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setError("❌ Tải lên thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <h3 style={{ marginBottom: "1rem", textAlign: "center" }}>📄 Tải lên file Excel</h3>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        style={{ marginBottom: "0.5rem" }}
      />

      {file && <p>🗂️ File đã chọn: <strong>{file.name}</strong></p>}

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <button
          onClick={() => handleUpload("/upload-excel")}
          disabled={isUploading}
          style={{
            flex: 1,
            padding: "0.5rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          {isUploading ? "Đang tải KH..." : "Upload Khách hàng"}
        </button>

        <button
          onClick={() => handleUpload("/import-doitac")}
          disabled={isUploading}
          style={{
            flex: 1,
            padding: "0.5rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          {isUploading ? "Đang tải ĐT..." : "Upload Đối tác"}
        </button>

        <button
          onClick={() => handleUpload("/import-hsvv")}
          disabled={isUploading}
          style={{
            flex: 1,
            padding: "0.5rem",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          {isUploading ? "Đang tải HS..." : "Upload Hồ sơ Vụ việc"}
        </button>
      </div>


      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}

export default ExcelUpload;
