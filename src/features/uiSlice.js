import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openMenu: {
    root: null,
    vietnam: null,
    cambodia: null,
    timkiem: null,
    system: null,
    settings: null,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setOpenAtLevel: (state, { payload: { parent, key } }) => {
      state.openMenu[parent] = state.openMenu[parent] === key ? null : key;
    },
    openPath: (state, { payload: { path } }) => {
      path.forEach(({ parent, key }) => {
        state.openMenu[parent] = key;
      });
    },
    resetMenuOpen: (state) => {
      state.openMenu = { ...initialState.openMenu };
    },
  },
});

export const { setOpenAtLevel, openPath, resetMenuOpen } = uiSlice.actions;
export default uiSlice.reducer;
