import { createSlice } from "@reduxjs/toolkit";

export const selection = createSlice({
  name: "selection",
  initialState: {
    start: 0,
    end: 0,
  },
  reducers: {
    setSelectionStart: (state, action) => {
      if (state.start !== action.payload) state.start = action.payload;
      return state;
    },
    setSelectionEnd: (state, action) => {
      if (state.end !== action.payload) state.end = action.payload;
      return state;
    },
    clearSelection: (state, action) => {
      state.start = 0;
      state.end = 0;
      return state;
    },
  },
});

export const { setSelectionStart, setSelectionEnd, clearSelection } =
  selection.actions;

export default selection.reducer;
