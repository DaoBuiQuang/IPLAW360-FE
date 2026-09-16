import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Modal, Pagination, Spin } from "antd";
import { toast } from "react-toastify";
import callAPI from "../../utils/api";

function DsCongViecList() {
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);
  const staffRoles = ["admin", "staff"];

  const [rows, setRows] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 50,
    totalItems: 0,
    totalPages: 0,
  });
  const [deleting, setDeleting] = useState(null);

  // -----------------------------------------------------------------------
  const fetchList = useCallback(async (page = 1, size = 50, kw = "") => {
    setLoading(true);
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/ds-cong-viec/list",
        data: { keyword: kw, pageIndex: page, pageSize: size },
      });
      setRows(res.data || []);
      setPagination(
        res.pagination || {
          pageIndex: page,
          pageSize: size,
          totalItems: 0,
          totalPages: 0,
        }
      );
    } catch {
      // loi da toast boi callAPI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(1, 50, "");
  }, [fetchList]);

  // -----------------------------------------------------------------------
  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await callAPI({
        method: "delete",
        endpoint: "/ds-cong-viec/delete",
        data: { id: deleting.id },
      });
      toast.success("Xóa công việc thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
      setDeleting(null);
      fetchList(pagination.pageIndex, pagination.pageSize, keyword);
    } catch {
      setDeleting(null);
    }
  };

  // -----------------------------------------------------------------------
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Danh sách công việc thường nhật
        </h2>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchList(1, pagination.pageSize, keyword);
            }}
            placeholder="Tìm theo mã viết tắt hoặc mô tả..."
            className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
          />
          <div className="flex gap-3">
            <button
              onClick={() => fetchList(1, pagination.pageSize, keyword)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Tìm kiếm
            </button>
            {staffRoles.includes(role) && (
              <button
                onClick={() => navigate("/dscongviec_add")}
                className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
              >
                + Thêm mới
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mt-4 rounded-lg border shadow">
        <Spin spinning={loading}>
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr className="text-[#667085] text-center font-normal bg-gray-50">
                <th className="p-3 text-table">STT</th>
                <th className="p-3 text-table text-left">Mã viết tắt</th>
                <th className="p-3 text-table text-left">Mô tả công việc</th>
                <th className="p-3 text-table">Người tạo</th>
                <th className="p-3 text-table"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((item, index) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-gray-100 text-center border-b relative"
                  >
                    <td className="p-2 text-table">
                      {(pagination.pageIndex - 1) * pagination.pageSize +
                        index +
                        1}
                    </td>
                    <td
                      className="p-2 text-table text-left text-blue-500 cursor-pointer hover:underline font-mono font-semibold"
                      onClick={() =>
                        navigate(`/dscongviec_detail/${item.id}`)
                      }
                    >
                      {item.maVietTat}
                    </td>
                    <td className="p-2 text-table text-left">{item.moTa}</td>
                    <td className="p-2 text-table">
                      {item.nhanSu?.hoTen || item.maNhanSu || "-"}
                    </td>
                    <td className="p-2 relative">
                      {staffRoles.includes(role) && (
                        <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                          <button
                            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
                            onClick={() =>
                              navigate(`/dscongviec_edit/${item.id}`)
                            }
                          >
                            Sửa
                          </button>
                          <button
                            className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300 text-sm"
                            onClick={() =>
                              setDeleting({
                                id: item.id,
                                maVietTat: item.maVietTat,
                              })
                            }
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-gray-400"
                  >
                    {loading ? "Đang tải..." : "Không có dữ liệu"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Spin>
      </div>

      <div className="mt-4 flex justify-center">
        <Pagination
          current={pagination.pageIndex}
          total={pagination.totalItems}
          pageSize={pagination.pageSize}
          showSizeChanger
          pageSizeOptions={["20", "50", "100"]}
          showTotal={(total) => `Tổng ${total} bản ghi`}
          onChange={(page, size) =>
            fetchList(page, Math.min(size, 200), keyword)
          }
        />
      </div>

      <Modal
        title="Xác nhận xóa"
        open={Boolean(deleting)}
        onOk={handleDelete}
        onCancel={() => setDeleting(null)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600 text-white",
        }}
      >
        <p>
          Bạn có chắc muốn xóa công việc{" "}
          <strong>"{deleting?.maVietTat}"</strong> không?
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Bản ghi sẽ bị xóa và có thể khôi phục sau.
        </p>
      </Modal>
    </div>
  );
}

export default DsCongViecList;
