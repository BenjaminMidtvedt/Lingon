import logo from "./logo.svg";
import "./App.css";
import Track from "./components/Track";
import { useEffect, useState } from "react";
import store from "./redux/store";
import { useDispatch, useSelector } from "react-redux";
import { writeNote, clearNote } from "./redux/noteMap";
import { ActionCreators } from "redux-undo";
import { Play, playNote, playTrackColumn } from "./audio/context";
import {
  setFocusedColumn,
  setFocusedRow,
  setFocusedTrack,
} from "./redux/config";

import { PlayArrow, Stop } from "@mui/icons-material";
import {
  clearSelection,
  setSelectionEnd,
  setSelectionStart,
} from "./redux/selection";

function shiftBar(forward = true) {
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

function shiftFocusBy(i) {
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

function updateFocus(dispatch) {
  const active_el = document.activeElement;

  let row = parseInt(active_el?.attributes?.row?.value);
  let col = parseInt(active_el?.attributes?.col?.value);
  let track = parseInt(active_el?.attributes?.track?.value);

  dispatch(setFocusedColumn(col));
  dispatch(setFocusedRow(row));
  dispatch(setFocusedTrack(track));
}

function App() {
  const dispatch = useDispatch();
  const notesPerBar = useSelector((state) => state.config.notesPerBar);
  const numberOfBars = useSelector((state) => state.config.numberOfBars);

  useEffect(() => {
    let selectionStart = 0;
    let selectionEnd = 0;
    let selectionTrack = 0;
    let ismousedown = false;
    let gridPositions = [];
    window.addEventListener("click", (e) => {
      updateFocus(dispatch);
    });

    window.addEventListener("mousedown", (e) => {
      const onTrack =
        e.target.classList.contains("slot-text") ||
        e.target.classList.contains("slot");
      ismousedown = onTrack;
      if (onTrack) {
        let idx = 0;
        let slots = Array.from(document.getElementsByClassName("slot"));
        gridPositions = slots
          .filter(
            (v) =>
              (v.attributes.track.value === "0") &
              (v.attributes.row.value === "0")
          )
          .sort(
            (a, b) =>
              parseInt(a.attributes.col.value) -
              parseInt(b.attributes.col.value)
          )
          .map((v) => v.offsetLeft);

        selectionStart = gridPositions.findIndex((v) => v >= e.x) - 1;
        selectionEnd = selectionStart;

        dispatch(setSelectionStart(selectionStart));
        dispatch(setSelectionEnd(selectionEnd));

        console.log(selectionStart);
      }
    });

    window.addEventListener("mouseup", (e) => {
      ismousedown = false;
    });

    window.addEventListener("mousemove", (e) => {
      if (ismousedown) {
        selectionEnd = gridPositions.findIndex((v) => v >= e.x) - 1;
        dispatch(setSelectionEnd(selectionEnd));

        let focusedCol = document.activeElement.attributes.col?.value;
        if (focusedCol !== undefined) {
          let dif = parseInt(selectionEnd) - focusedCol;
          shiftFocusBy(6 * dif);
          updateFocus(dispatch);
        }
      }
    });

    window.addEventListener("keydown", (e) => {
      const active_el = document.activeElement;
      let stopProp = false;
      if (
        (e.key === "z" || e.key === "Z") &&
        e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        stopProp = true;
        dispatch(ActionCreators.undo());
      } else if (
        (e.key === "z" || e.key === "Z") &&
        e.ctrlKey &&
        e.shiftKey &&
        !e.altKey
      ) {
        dispatch(ActionCreators.redo());
        stopProp = true;
      } else if (active_el.classList.contains("slot")) {
        // Active element is a slot

        let row = parseInt(active_el.attributes.row.value);
        let col = parseInt(active_el.attributes.col.value);
        let track = parseInt(active_el.attributes.track.value);

        if (e.code === "ArrowDown") {
          if (row < 5) {
            shiftFocusBy(1);
            stopProp = true;
          }
        } else if (e.code === "ArrowUp") {
          if (row > 0) {
            shiftFocusBy(-1);
            stopProp = true;
          }
        } else if (e.code === "ArrowRight") {
          if (!e.altKey && e.ctrlKey) {
            shiftBar(true);
          } else if (e.altKey && e.ctrlKey) {
            shiftFocusBy(6 * 4);
          } else if (e.altKey && !e.ctrlKey) {
            shiftFocusBy(6 * 2);
          } else {
            shiftFocusBy(6);
          }
          stopProp = true;
        } else if (e.code === "ArrowLeft") {
          if (!e.altKey && e.ctrlKey) {
            shiftBar(false);
          } else if (e.altKey && e.ctrlKey) {
            shiftFocusBy(-6 * 4);
          } else if (e.altKey && !e.ctrlKey) {
            shiftFocusBy(-6 * 2);
          } else {
            shiftFocusBy(-6);
          }
          stopProp = true;
        } else {
          dispatch(
            writeNote({
              id: [track, col, row],
              note: e.key,
            })
          );
          // stopProp = true;
        }

        updateFocus(dispatch);

        if (stopProp) {
          if (!e.shiftKey) {
            dispatch(clearSelection());
          } else {
            const newCol = document.activeElement.attributes?.col?.value;
            if (newCol !== undefined) {
              dispatch(setSelectionEnd(parseInt(newCol)));
            }
          }

          e.stopPropagation();
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      }
    });
  }, []);

  const numberOfTracks = useSelector((state) => state.noteMap.present.length);

  return (
    <div className="App">
      <Lingon />
      <div
        className="home-body"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${
            numberOfBars * notesPerBar
          }, fit-content(25px)`,
          gridTemplateRows: `50px auto`,
        }}
      >
        <Beat />
        <Track track={0}></Track>
        <Selection></Selection>
        {/* <Track track={1}></Track> */}
      </div>
      <Overlay onPlay={Play} />
    </div>
  );
}

function Overlay({ onPlay = undefined, onStop = undefined }) {
  return (
    <div className="overlay">
      <div className="overlay-inner">
        <div onClick={() => onPlay?.()} className="overlay-button play-button">
          <PlayArrow />
        </div>
        <div onClick={() => onStop?.()} className="overlay-button stop-button">
          <Stop />
        </div>
      </div>
    </div>
  );
}

function Beat() {
  const numberOfBars = useSelector((state) => state.config.numberOfBars);
  const notesPerBar = useSelector((state) => state.config.notesPerBar);
  const col = useSelector((state) => state.config.focusedColumn);

  const beats = Array(numberOfBars * notesPerBar)
    .fill(0)
    .map((_, i) => {
      let in_bar_beat = i % notesPerBar;
      let sub_beat = in_bar_beat % 4;

      let beat_size = 7;
      if (sub_beat === 2) beat_size = 10;
      if (sub_beat === 0) beat_size = 15;
      if (in_bar_beat === 0) beat_size = 20;

      return (
        <div
          key={i}
          style={{
            margin: "auto",
            marginTop: 0,
            width: 2,
            height: beat_size,
            backgroundColor: col === i ? "#b6ec4b" : "white",
            gridColumn: 1 + i,
            gridRow: 1,
          }}
        ></div>
      );
    });
  return <>{beats}</>;
}

function Lingon() {
  return <span className="lingon">Lingon</span>;
}

function Selection() {
  let { start, end } = useSelector((state) => state.selection);
  if (start === end) return <div></div>;

  if (end < start) {
    let tmp = end;
    end = start;
    start = tmp;
  }
  return (
    <div
      style={{
        gridRow: 2,
        gridColumn: `${start + 1} / ${end + 1}`,
        marginTop: -7,
        marginBottom: -7,
        backgroundColor: "#bb97e710",
        borderTop: "2px solid #bb97e7",
        borderBottom: "2px solid #bb97e7",
        // backgroundColor: "red",
      }}
    ></div>
  );
}

export default App;
