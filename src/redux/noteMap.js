import { createSlice } from "@reduxjs/toolkit";
import { playNote, playTrackColumn } from "../audio/context";

const notes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const characters = [" ", "*"];

let playingNotes = [];

export const noteMap = createSlice({
  name: "noteMap",
  initialState: [
    {
      tuning: [50, 55, 60, 65, 69, 74].reverse(),
    },
  ],
  reducers: {
    writeNote: (state, action) => {
      const { id, note } = action.payload;
      const [trackid, column, row] = id;
      const index = [column, row];

      const track = state[trackid];
      if (notes.includes(note)) {
        let digit = parseInt(note);

        if (isNaN(digit)) {
          state[id] = undefined;
          return;
        }

        let currentNote = track[index] || 0;

        if (currentNote === 0) {
          track[index] = digit;
        } else if (currentNote * 10 + digit <= 24) {
          track[index] = currentNote * 10 + digit;
        } else {
          track[index] = digit;
        }

        playingNotes.forEach((n) => n?.stop());

        playingNotes = playTrackColumn(track, column);
      } else if (characters.includes(note)) {
        track[index] = note.trim();
      }
    },
    clearNote: (state, { id, note }) => {
      state[id] = undefined;
    },
  },
});

export const { writeNote, clearNote } = noteMap.actions;

export default noteMap.reducer;
