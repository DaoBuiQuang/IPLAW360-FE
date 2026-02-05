import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../features/uiSlice';                 // <-- import đúng reducer UI
import authReducer from '../features/authSlice';
import notificationReducer from '../features/notificationSlice';  // <-- sửa tên

export const store = configureStore({
  reducer: {
    ui: uiReducer,               // <-- dùng đúng biến
    auth: authReducer,
    notification: notificationReducer,
  },
});
