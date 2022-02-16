import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "./utils";

export const state = createSlice({
  name: "state",
  initialState: {
    focusedColumn: 0,
    focusedRow: 0,
    focusedTrack: 0,
    isPlaying: false,
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
    setPlayingTrue: (state) => {
      state.isPlaying = true;
      return state;
    },
    setPlayingFalse: (state) => {
      state.isPlaying = false;
      return state;
    },
    togglePlaying: (state) => {
      state.isPlaying = !state.isPlaying;
      return state;
    },
  },
});

export const {
  setFocusedColumn,
  setFocusedRow,
  setFocusedTrack,
  setPlayingFalse,
  setPlayingTrue,
  togglePlaying,
} = state.actions;

export default state.reducer;
