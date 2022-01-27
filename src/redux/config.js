import { createSlice } from "@reduxjs/toolkit";

// const notes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " "];

export const config = createSlice({
  name: "config",
  initialState: {
    notesPerBar: 16,
    numberOfBars: 16,
    focusedColumn: 0,
    focusedRow: 0,
    focusedTrack: 0,
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

// export const { writeNote, clearNote } = noteMap.actions;

export const { setFocusedColumn, setFocusedRow, setFocusedTrack } =
  config.actions;

export default config.reducer;
