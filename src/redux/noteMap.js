import { createSlice } from "@reduxjs/toolkit";

const notes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " "];

export const noteMap = createSlice({
  name: "noteMap",
  initialState: {},
  reducers: {
    writeNote: (state, action) => {
      const { id, note } = action.payload;
      if (notes.includes(note)) {
        let digit = parseInt(note);

        if (isNaN(digit)) {
          state[id] = undefined;
          return;
        }

        let currentNote = state[id] || 0;

        if (currentNote === 0) {
          state[id] = digit;
        } else if (currentNote * 10 + digit <= 24) {
          state[id] = currentNote * 10 + digit;
        } else {
          state[id] = digit;
        }
      }
    },
    clearNote: (state, { id, note }) => {
      state[id] = undefined;
    },
  },
});

export const { writeNote, clearNote } = noteMap.actions;

export default noteMap.reducer;
