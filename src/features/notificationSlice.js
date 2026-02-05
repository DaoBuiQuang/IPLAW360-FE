// src/features/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    refreshTrigger: 0,
  },
  reducers: {
    triggerNotificationRefresh: (state) => {
      state.refreshTrigger += 1; // tăng để force reload
    },
  },
});

export const { triggerNotificationRefresh } = notificationSlice.actions;
export default notificationSlice.reducer;
