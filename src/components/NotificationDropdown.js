import { useEffect, useRef, useState } from "react";
import callAPI from "../utils/api";
import dayjs from "dayjs"; 
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PAGE_SIZE = 10;

const NotificationDropdown = () => {
  const refreshTrigger = useSelector((state) => state.notification.refreshTrigger);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [offset, setOffset] = useState(0); 
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); 
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     resetAndFetchNotifications();
  //   }, 1000);
  //   return () => clearTimeout(timer);
  // }, [refreshTrigger]);

  // useEffect(() => {
  //   resetAndFetchNotifications();
  // }, []);

  const resetAndFetchNotifications = () => {
    setOffset(0);
    setHasMore(true);
    fetchNotifications(0);
  };
  const fetchNotifications = async (currentOffset) => {
    if (loadingMore || !hasMore) return; 
    setLoadingMore(true);
    const maNhanSu = localStorage.getItem("maNhanSu");

    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/send-notification-to-many",
        data: { maNhanSu, pageSize: PAGE_SIZE, offset: currentOffset },
      });

      const newNotifications = response.notifications || [];

      if (currentOffset === 0) {
        setNotifications(newNotifications);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
      }
      if (newNotifications.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setOffset(currentOffset + newNotifications.length);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thông báo:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Xử lý scroll để detect khi scroll tới cuối list thì load thêm
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      // scroll gần đáy thì load thêm
      fetchNotifications(offset);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (id) => {
    try {
      await callAPI({
        method: "post",
        endpoint: "/notification/mark-read",
        data: { id },
      });

      resetAndFetchNotifications();
      navigate(`/notificationdetail/${id}`);
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
    }
  };

  return (
    <div ref={dropdownRef} className="relative cursor-pointer">
      <div onClick={toggleDropdown}>
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600 hover:text-[#009999] cursor-pointer"
            fill="none"
          
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {notifications.some((noti) => !noti.isRead) && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-md rounded z-50">
          <div className="p-3 font-semibold border-b">Thông báo</div>
          {notifications.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">Không có thông báo</div>
          ) : (
            <ul
              ref={listRef}
              className="max-h-60 overflow-y-auto"
              onScroll={handleScroll}
            >
              {notifications.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleNotificationClick(item.id)}
                  className={`cursor-pointer px-2  py-2 text-sm ${item.isRead
                      ? "text-gray-400"
                      : "text-gray-800 font-semibold"
                    } hover:bg-gray-100`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-base">{item.title}</span>
                    <span className="text-xs text-gray-400 italic ml-4 whitespace-nowrap">
                      {dayjs(item.sentAt).format("HH:mm DD/MM/YYYY")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{item.body}</div>
                </li>
              ))}

              {loadingMore && (
                <li className="px-4 py-2 text-center text-sm text-gray-500">
                  Đang tải...
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
