import { createSlice } from "@reduxjs/toolkit";
import { playNote, playTrackColumn } from "../audio/context";
import { getActiveIndex } from "./handlers";
import { loadState } from "./utils";

const notes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const characters = [" ", "*"];

let playingNotes = [];

const defaultTrack = () => ({
  tuning: [50, 55, 60, 65, 69, 74].reverse(),
  instrument: 0,
});

const initialState = loadState();
export const noteMap = createSlice({
  name: "noteMap",
  initialState: initialState?.noteMap || [defaultTrack()],
  reducers: {
    writeNote: (state, action) => {
      const { id, note } = action.payload;
      const [trackid, column, row] = id;
      const index = [column, row];

      const track = state[trackid];
      if (notes.includes(note)) {
        let digit = parseInt(note);

        if (isNaN(digit)) {
          track[index] = "";
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
      } else if (characters.includes(note)) {
        track[index] = note.trim();
      }
    },

    writeSlice: (state, action) => {
      const { slice, start, track } = action.payload;

      slice.forEach((rows, i) => {
        rows.forEach((value, j) => {
          state[track][[start + i, j]] = value;
        });
      });
      return state;
    },

    clearNote: (state, { id, note }) => {
      state[id] = undefined;
    },

    clearRange: (state, { payload }) => {
      let { start, end, track } = payload;
      if (end < start) {
        let tmp = end;
        end = start;
        start = tmp;
      }
      for (let col = start; col < end; col++) {
        for (let row = 0; row < 6; row++) {
          state[track][[col, row]] = "";
        }
      }
      return state;
    },

    setInstrument: (state, { payload }) => {
      state[payload.track].instrument = payload.id;
    },

    addTrack: (state) => {
      state.push(defaultTrack());
    },
  },
});

export const {
  writeNote,
  writeSlice,
  clearNote,
  clearRange,
  setInstrument,
  addTrack,
} = noteMap.actions;

export default noteMap.reducer;
