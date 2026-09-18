import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin } from "antd";
import { toast } from "react-toastify";
import callAPI from "../../utils/api";

const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function DsCongViecEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [maVietTat, setMaVietTat] = useState("");
  const [moTa, setMoTa] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // -----------------------------------------------------------------------
  // Fetch detail khi mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    const fetchDetail = async () => {
      setFetching(true);
      try {
        const res = await callAPI({
          method: "post",
          endpoint: "/ds-cong-viec/detail",
          data: { id: Number(id) },
        });
        const item = res.data;
        setMaVietTat(item.maVietTat || "");
        setMoTa(item.moTa || "");
      } catch {
        navigate("/dscongviec_list");
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchDetail();
  }, [id, navigate]);

  // -----------------------------------------------------------------------
  const validateField = (name, value) => {
    let msg = "";
    if (!value || !value.trim()) {
      if (name === "maVietTat") msg = "Mã viết tắt là bắt buộc";
    }
    setErrors((prev) => ({ ...prev, [name]: msg }));
    return !msg;
  };

  const isFormValid = maVietTat.trim().length > 0;

  // -----------------------------------------------------------------------
  const handleSubmit = async () => {
    const v1 = validateField("maVietTat", maVietTat);
    validateField("moTa", moTa); // trigger clear error if any
    if (!v1) return;

    setLoading(true);
    try {
      await callAPI({
        method: "put",
        endpoint: "/ds-cong-viec/edit",
        data: {
          id: Number(id),
          maVietTat: maVietTat.trim().toUpperCase(),
          moTa: moTa.trim() ? moTa.trim().charAt(0).toUpperCase() + moTa.trim().slice(1) : "",
        },
      });
      toast.success("Cập nhật công việc thành công!", {
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
  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center min-h-screen">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl"
      >
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Sửa công việc
        </h2>

        <div className="grid grid-cols-1 gap-5 mb-6">
          {/* Ma viet tat */}
          <div>
            <label className="block text-gray-700 text-left mb-1">
              Mã viết tắt <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={maVietTat}
              onChange={(e) => {
                setMaVietTat(e.target.value.toUpperCase());
                validateField("maVietTat", e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
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
              Tự động viết hoa. Tối đa 20 ký tự.
            </p>
          </div>

          {/* Mo ta */}
          <div>
            <label className="block text-gray-700 text-left mb-1">
              Mô tả công việc
            </label>
            <textarea
              value={moTa}
              onChange={(e) => {
                const val = e.target.value;
                const formatted = val ? val.charAt(0).toUpperCase() + val.slice(1) : "";
                setMoTa(formatted);
                validateField("moTa", formatted);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Nội dung mô tả công việc..."
              maxLength={500}
              rows={3}
              className="w-full p-2 mt-1 border rounded-lg text-input resize-none"
            />
            {errors.moTa && (
              <p className="text-red-500 text-xs mt-1 text-left">
                {errors.moTa}
              </p>
            )}
            <div className="flex justify-between items-center mt-1">
              <p className="text-gray-400 text-xs text-left">
                Tự động viết hoa chữ cái đầu. Nhấn Enter để lưu, Shift + Enter để xuống dòng.
              </p>
              <p className="text-gray-400 text-xs text-right">
                {moTa.length}/500
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-2">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Quay lại
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className={`px-6 py-2 rounded-lg text-white ${
              isFormValid && !loading
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Đang lưu..." : "Cập nhật"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DsCongViecEdit;
