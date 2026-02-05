import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  role: null,
  authId: null, 
  maNhanSu: null,
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // setRole: (state, action) => {
    //   state.role = action.payload;
    // },
    setAuth: (state, action) => {
      state.authId = action.payload.authId;
      state.role = action.payload.role;
      state.maNhanSu = action.payload.maNhanSu;
    },
    clearAuth: (state) => {
      state.role = null;
      state.authId = null;
      state.maNhanSu = null;
    },
  },
});

export const { setRole, setAuth, clearAuth } = authSlice.actions;

export default authSlice.reducer;
