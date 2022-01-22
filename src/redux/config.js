import { createSlice } from "@reduxjs/toolkit";

// const notes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " "];

export const config = createSlice({
  name: "config",
  initialState: {
    notesPerBar: 16,
    numberOfBars: 16,
  },
  reducers: {},
});

// export const { writeNote, clearNote } = noteMap.actions;

export default config.reducer;
