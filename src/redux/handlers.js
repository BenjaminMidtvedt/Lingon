import { setFocusedColumn, setFocusedRow, setFocusedTrack } from "./config";
import { clearRange, writeNote } from "./noteMap";
import { ActionCreators } from "redux-undo";
import {
  clearSelection,
  setSelectionEnd,
  setSelectionStart,
} from "./selection";
import store from "./store";

const isDigit = RegExp.prototype.test.bind(/^[0-9]$/);
const isArrow = RegExp.prototype.test.bind(/^Arrow/);
const isValidTrackString = RegExp.prototype.test.bind(/^[* ]$/);
const isUndo = (e) =>
  e.ctrlKey && !e.altKey && !e.shiftKey && /^[zZ]$/.test(e.key);
const isRedo = (e) =>
  e.ctrlKey && !e.altKey && e.shiftKey && /^[zZ]$/.test(e.key);

export function keypressHandler(e, dispatch) {
  if (isDigit(e.key)) handleDigit(e, dispatch);
  else if (isArrow(e.key)) handleArrow(e, dispatch);
  else if (isValidTrackString(e.key)) handleTrackString(e, dispatch);
  else if (isUndo(e)) dispatch(ActionCreators.undo());
  else if (isRedo(e)) dispatch(ActionCreators.redo());
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
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();
}

function handleTrackString(e, dispatch) {
  if (e.key === " ") {
    const { start, end } = store.getState().selection;
    if (start !== end) {
      console.log("clearing range", start, end);
      return dispatch(clearRange({ start, end }));
    }
  }
  handleDigit(e, dispatch);
}

function handleArrow(e, dispatch) {
  if (e.key === "ArrowUp") shiftFocusUp(e);
  else if (e.key === "ArrowLeft") shiftFocusLeft(e);
  else if (e.key === "ArrowDown") shiftFocusDown(e);
  else if (e.key === "ArrowRight") shiftFocusRight(e);

  updateFocus(e, dispatch);
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();
}

function shiftFocusUp({ ctrlKey, altKey }) {
  const [track, col, row] = getActiveIndex();
  if (row === 0) return;
  shiftFocusBy(-1);
}

function shiftFocusDown({ ctrlKey, altKey }) {
  const [track, col, row] = getActiveIndex();
  if (row >= 5) return;
  shiftFocusBy(1);
}

function shiftFocusRight({ ctrlKey, altKey }) {
  const [track, col, row] = getActiveIndex();
  if (ctrlKey) shiftBar();
  else shiftFocusBy(6);
}

function shiftFocusLeft({ ctrlKey, altKey }) {
  const [track, col, row] = getActiveIndex();
  if (ctrlKey) shiftBar(false);
  else shiftFocusBy(-6);
}

export function shiftFocusBy(i) {
  //add all elements we want to include in our selection
  if (document.activeElement) {
    const slots = Array.from(document.getElementsByClassName("slot"));
    const index = slots.indexOf(document.activeElement);
    if (index > -1) {
      var nextElement = slots[index + i] || slots[index];
      nextElement.focus();
    }
  }
}

export function shiftBar(forward = true) {
  //add all elements we want to include in our selection
  const notesPerBar = store.getState().config.notesPerBar;
  if (document.activeElement) {
    const row = parseInt(document.activeElement.attributes.row.value);
    const slots = Array.from(document.getElementsByClassName("slot"));
    if (!forward) {
      slots.reverse();
    }
    const elemIndex = slots.indexOf(document.activeElement);

    let index =
      slots
        .slice(elemIndex + 1, -1)
        .findIndex(
          (e) =>
            parseInt(e.attributes.col.value) % notesPerBar === 0 &&
            parseInt(e.attributes.row.value) % notesPerBar === row
        ) +
      elemIndex +
      1;

    if (index > -1) {
      var nextElement = slots[index] || document.activeElement;
      nextElement.focus();
    }
  }
}

export function updateFocus(e, dispatch) {
  const active_el = document.activeElement;

  let row = parseInt(active_el?.attributes?.row?.value);
  let col = parseInt(active_el?.attributes?.col?.value);
  let track = parseInt(active_el?.attributes?.track?.value);

  dispatch(setFocusedColumn(col));
  dispatch(setFocusedRow(row));
  dispatch(setFocusedTrack(track));

  dispatch(setSelectionEnd(col));
  if (!e.shiftKey) dispatch(setSelectionStart(col));
}

export function getActiveIndex() {
  const active_el = document.activeElement;
  let row = parseInt(active_el.attributes.row.value);
  let col = parseInt(active_el.attributes.col.value);
  let track = parseInt(active_el.attributes.track?.value);
  return [track, col, row];
}
