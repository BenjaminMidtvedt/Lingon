import { setFocusedColumn, setFocusedRow, setFocusedTrack } from "./state";
import { clearRange, writeNote, writeSlice } from "./noteMap";
import { ActionCreators, GroupByFunction } from "redux-undo";
import {
  clearSelection,
  setSelectionEnd,
  setSelectionStart,
} from "./selection";
import store from "./store";
import { playTrackColumn } from "../audio/context";

let currentlyPlaying = [];

const isDigit = RegExp.prototype.test.bind(/^[0-9]$/);
const isArrow = RegExp.prototype.test.bind(/^Arrow/);
const isValidTrackString = RegExp.prototype.test.bind(/^[* ]$/);
const isUndo = (e) =>
  e.ctrlKey && !e.altKey && !e.shiftKey && /^[zZ]$/.test(e.key);
const isRedo = (e) =>
  e.ctrlKey && !e.altKey && e.shiftKey && /^[zZ]$/.test(e.key);
const isCopy = (e) =>
  e.ctrlKey && !e.altKey && !e.shiftKey && /^[cC]$/.test(e.key);
const isPaste = (e) =>
  e.ctrlKey && !e.altKey && !e.shiftKey && /^[vV]$/.test(e.key);
const isCut = (e) =>
  e.ctrlKey && !e.altKey && !e.shiftKey && /^[xX]$/.test(e.key);

export function keypressHandler(e, dispatch) {
  if (isDigit(e.key)) handleDigit(e, dispatch);
  else if (isArrow(e.key)) handleArrow(e, dispatch);
  else if (isValidTrackString(e.key)) handleTrackString(e, dispatch);
  else if (isUndo(e)) dispatch(ActionCreators.undo());
  else if (isRedo(e)) dispatch(ActionCreators.redo());
  else if (isCopy(e)) copySelection(e, dispatch);
  else if (isPaste(e)) pasteData(e, dispatch);
  else if (isCut(e)) cutSelection(e, dispatch);
}

function handleDigit(e: Event, dispatch) {
  const [track, col, row] = getActiveIndex();
  dispatch(clearSelection());
  if (track >= 0 && col >= 0 && row >= 0) {
    dispatch(
      writeNote({
        id: [track, col, row],
        note: e.key,
      })
    );
  }
  const trackObj = store.getState().noteMap.present[track];
  currentlyPlaying.forEach((v) => v?.stop());
  playTrackColumn(trackObj, col).then((notes) => {
    currentlyPlaying = notes;
  });
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();
}

function handleTrackString(e, dispatch) {
  const [track, col, row] = getActiveIndex();

  if (e.key === " ") {
    const { start, end } = store.getState().selection;
    if (start !== end) {
      return dispatch(clearRange({ start, end, track }));
    }
  }
  handleDigit(e, dispatch);
}

function updateSelection(e, dispatch) {
  const [track, col, row] = getActiveIndex();
  if (!e.shiftKey) dispatch(setSelectionStart(col));
  dispatch(setSelectionEnd(col));
}

function handleArrow(e, dispatch) {
  if (e.key === "ArrowUp") shiftFocusUp(e);
  else if (e.key === "ArrowLeft") shiftFocusLeft(e);
  else if (e.key === "ArrowDown") shiftFocusDown(e);
  else if (e.key === "ArrowRight") shiftFocusRight(e);

  updateSelection(e, dispatch);
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();
}

function shiftFocusUp({ ctrlKey, altKey }) {
  const [track, col, row] = getActiveIndex();
  if (row === 0) return;
  store.dispatch(setFocusedRow(row - 1));
}

function shiftFocusDown({ ctrlKey, altKey }) {
  const [track, col, row] = getActiveIndex();
  if (row >= 5) return;
  store.dispatch(setFocusedRow(row + 1));
}

function shiftFocusRight({ ctrlKey, altKey }) {
  const [track, col, row] = getActiveIndex();
  if (ctrlKey) shiftBar();
  else store.dispatch(setFocusedColumn(col + 1));
}

function shiftFocusLeft({ ctrlKey, altKey }) {
  const [track, col, row] = getActiveIndex();
  if (ctrlKey) shiftBar(false);
  else store.dispatch(setFocusedColumn(Math.max(col - 1, 0)));
}

export function shiftBar(forward = true) {
  //add all elements we want to include in our selection
  const notesPerBar = store.getState().config.notesPerBar;
  const [track, col, row] = getActiveIndex();
  let distance = notesPerBar - (col % notesPerBar);
  if (!forward) distance = distance - notesPerBar;
  if (!forward && distance === 0) distance -= notesPerBar;

  store.dispatch(setFocusedColumn(Math.max(distance + col, 0)));
}

export function getActiveIndex() {
  const { focusedRow, focusedColumn, focusedTrack } = store.getState().state;
  return [focusedTrack, focusedColumn, focusedRow];
}

export function copySelection(e, dispatch) {
  const [track, col, row] = getActiveIndex();
  const notes = store.getState().noteMap.present[track];
  const [start, end] = getSelectionStartEnd();

  if (start === end) return;

  const obj = Array(end - start)
    .fill(0)
    .map((_, i) => {
      let rows = Array(6).fill("");
      rows = rows.map((_, j) => notes[[start + i, j]]);
      return rows;
    });

  window.clipboard = obj;
}

export function cutSelection(e, dispatch) {
  const [start, end] = getSelectionStartEnd();
  const [track, col, row] = getActiveIndex();
  copySelection(e, dispatch);
  dispatch(clearRange({ start, end, track }));
}

export function pasteData(e, dispatch) {
  const [track, col, row] = getActiveIndex();
  dispatch(writeSlice({ slice: window.clipboard, track: track, start: col }));
}

export function getSelectionStartEnd() {
  let { start, end } = store.getState().selection;

  if (end < start) {
    let tmp = end;
    end = start;
    start = tmp;
  }
  return [start, end];
}
