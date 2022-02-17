import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "./utils";

// const notes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " "];

const storedState = loadState();

export const config = createSlice({
  name: "config",
  initialState: storedState?.config || {
    notesPerBar: 16,
    numberOfBars: 128,
  },
  reducers: {
    setFocusedColumn: (state, action) => {
      state.focusedColumn = action.payload;
      return state;
    },
    setFocusedRow: (state, action) => {
      state.focusedRow = action.payload;
      return state;
    },
    setFocusedTrack: (state, action) => {
      state.focusedTrack = action.payload;
      return state;
    },
  },
});

export const { setFocusedColumn, setFocusedRow, setFocusedTrack } =
  config.actions;

export default config.reducer;
