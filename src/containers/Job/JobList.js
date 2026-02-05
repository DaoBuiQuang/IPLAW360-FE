import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useSelector } from 'react-redux';
import { Modal } from "antd";
function JobList() {
  const role = useSelector((state) => state.auth.role);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const fetchJobs = async (searchValue) => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/industry/list",
        data: { search: searchValue },
      });
      setJobs(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu ngành nghề:", error);
    }
  };

  useEffect(() => {
    fetchJobs("");
  }, []);
  const handleDeleteJob = async () => {
    try {
      await callAPI({
        method: "post",
        endpoint: "/industry/delete",
        data: { maNganhNghe: jobToDelete },
      });
      setShowDeleteModal(false);
      setJobToDelete(null);
      fetchJobs(searchTerm);
    } catch (error) {
      console.error("Lỗi khi xóa đối tác:", error);
    }
  };
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Danh sách Ngành nghề</h2>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchJobs(searchTerm);
              }
            }}
            placeholder="🔍 Nhập tên ngành nghề"
            className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
          />

          <div className="flex gap-3">
            <button
              onClick={() => fetchJobs(searchTerm)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Tìm kiếm
            </button>
            <button
              onClick={() => navigate("/jobadd")} // Chuyển hướng khi bấm nút
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Thêm mới
            </button>
          </div>
        </div>


      </div>
      <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow">
        <thead>
          <tr className=" text-[#667085] text-center font-normal">
            <th className="p-2 text-table">STT</th>
            <th className="p-2 text-table">Mã ngành nghề</th>
            <th className="p-2 text-table">Tên ngành nghề</th>
            <th className="p-2 text-center text-table"></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, index) => (
            <tr
              key={job.id}
              className="group hover:bg-gray-100 text-center border-b relative"
            >
              <td className="p-2 text-table">{index + 1}</td>
              <td
                className="p-2 text-table text-blue-500 cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/jobdetail/${job.maNganhNghe}`);
                }}
              >
                {job.maNganhNghe}
              </td>
              <td className="p-2 text-table">{job.tenNganhNghe}</td>
              <td className="p-2 relative">
                {(role === 'admin' || role === 'staff') && (
                  <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                    <button
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                      onClick={() => navigate(`/jobedit/${job.maNganhNghe}`)}
                    >
                      📝
                    </button>
                    <button className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                      onClick={() => {
                        setJobToDelete(job.maNganhNghe);
                        setShowDeleteModal(true);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        title="Xác nhận xóa"
        open={showDeleteModal}
        onOk={handleDeleteJob}
        onCancel={() => setShowDeleteModal(false)}
        okText="Xác nhận xóa"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600 text-white",
        }}
      >
        <p>Bạn có chắc chắn muốn xóa ngành nghề này không?</p>
      </Modal>
    </div>
  );
}

export default JobList;
