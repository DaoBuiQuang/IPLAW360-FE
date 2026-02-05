// src/components/common/Notification.js
import Swal from "sweetalert2";

export const showSuccess = (title = "Thành công!", text = "") => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText: "OK",
  });
};

export const showError = (title, defaultMessage, error) => {
    console.error(error);
    const message =
      error || defaultMessage;
    Swal.fire({
      icon: "error",
      title,
      text: message,
    });
  };
  

export const showWarning = (title = "Cảnh báo!", text = "") => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonText: "OK",
  });
};
