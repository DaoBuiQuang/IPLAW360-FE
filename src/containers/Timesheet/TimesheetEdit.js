import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TimesheetForm from "./TimesheetForm";
import callAPI from "../../utils/api";

export default function TimesheetEdit() {
  const { id } = useParams();
  const [values, setValues] = useState(null);
  useEffect(() => { callAPI({ method: "post", endpoint: "/timesheet/detail", data: { id } }).then(setValues).catch(() => setValues(null)); }, [id]);
  if (!values) return <div className="text-center p-8">Đang tải...</div>;
  if (["APPROVED", "LOCKED"].includes(values.status)) return <div className="text-center p-8 text-red-600">Timesheet đã được duyệt/chốt và không thể sửa.</div>;
  return <TimesheetForm mode="edit" initialValues={values} />;
}
