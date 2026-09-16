import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import callAPI from "../../utils/api";

function DsCongViecAdd() {
  const navigate = useNavigate();

  const [maVietTat, setMaVietTat] = useState("");
  const [moTa, setMoTa] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------------------------
  const validateField = (name, value) => {
    let msg = "";
    if (!value || !value.trim()) {
      if (name === "maVietTat") msg = "Ma viet tat la bat buoc";
      if (name === "moTa") msg = "Mo ta la bat buoc";
    }
    setErrors((prev) => ({ ...prev, [name]: msg }));
    return !msg;
  };

  const isFormValid =
    maVietTat.trim().length > 0 && moTa.trim().length > 0;

  // -----------------------------------------------------------------------
  const handleSubmit = async () => {
    const v1 = validateField("maVietTat", maVietTat);
    const v2 = validateField("moTa", moTa);
    if (!v1 || !v2) return;

    setLoading(true);
    try {
      await callAPI({
        method: "post",
        endpoint: "/ds-cong-viec/add",
        data: { maVietTat: maVietTat.trim().toUpperCase(), moTa: moTa.trim() },
      });
      toast.success("Them cong viec thanh cong!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/dscongviec_list");
    } catch {
      // loi da toast boi callAPI
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------------
  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Them Cong Viec Thuong Nhat
        </h2>

        <div className="grid grid-cols-1 gap-5 mb-6">
          {/* Ma viet tat */}
          <div>
            <label className="block text-gray-700 text-left mb-1">
              Ma viet tat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={maVietTat}
              onChange={(e) => {
                setMaVietTat(e.target.value.toUpperCase());
                validateField("maVietTat", e.target.value);
              }}
              placeholder="Vi du: ND, GQ, TV..."
              maxLength={20}
              className="w-full p-2 mt-1 border rounded-lg text-input font-mono uppercase"
            />
            {errors.maVietTat && (
              <p className="text-red-500 text-xs mt-1 text-left">
                {errors.maVietTat}
              </p>
            )}
            <p className="text-gray-400 text-xs mt-1 text-left">
              Tu dong chuyen chu HOA. Toi da 20 ky tu.
            </p>
          </div>

          {/* Mo ta */}
          <div>
            <label className="block text-gray-700 text-left mb-1">
              Mo ta cong viec <span className="text-red-500">*</span>
            </label>
            <textarea
              value={moTa}
              onChange={(e) => {
                setMoTa(e.target.value);
                validateField("moTa", e.target.value);
              }}
              placeholder="Noi dung mo ta cong viec..."
              maxLength={500}
              rows={3}
              className="w-full p-2 mt-1 border rounded-lg text-input resize-none"
            />
            {errors.moTa && (
              <p className="text-red-500 text-xs mt-1 text-left">
                {errors.moTa}
              </p>
            )}
            <p className="text-gray-400 text-xs mt-1 text-right">
              {moTa.length}/500
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg"
            onClick={() => navigate("/dscongviec_list")}
            disabled={loading}
          >
            Quay lai
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className={`px-6 py-2 rounded-lg text-white ${
              isFormValid && !loading
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Dang luu..." : "Them moi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DsCongViecAdd;
