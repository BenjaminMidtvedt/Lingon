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
import {
  getActiveIndex,
  getSelectionStartEnd,
  keypressHandler,
  updateFocus,
} from "./redux/handlers";

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

function App() {
  const dispatch = useDispatch();
  const notesPerBar = useSelector((state) => state.config.notesPerBar);
  const numberOfBars = useSelector((state) => state.config.numberOfBars);

  useEffect(() => {
    let selectionStart = 0;
    let selectionEnd = 0;
    let ismousedown = false;
    let gridPositions = [];
    window.addEventListener("click", (e) => {
      try {
        updateFocus(e, dispatch, true);
      } catch (e) {
        if (!(e instanceof TypeError)) {
          throw e; // re-throw the error unchanged
        }
      }
    });

    window.addEventListener("mousedown", (e) => {
      const onTrack =
        e.target.classList.contains("slot-text") ||
        e.target.classList.contains("slot");
      ismousedown = onTrack;
      if (onTrack) {
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
      } else {
        dispatch(clearSelection());
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
          if (dif !== 0) {
            shiftFocusBy(6 * dif);
            updateFocus(e, dispatch, true);
          }
        }
      }
    });

    window.addEventListener("keydown", (e) => keypressHandler(e, dispatch));
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
      <Overlay
        onPlay={() => {
          Play(store.getState().selection.end);
        }}
      />
    </div>
  );
}

function Overlay({ onPlay = undefined, onStop = undefined }) {
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="overlay-inner">
        <div
          onClick={() => onPlay?.()}
          tabIndex={-1}
          disabled
          className="overlay-button play-button"
        >
          <PlayArrow />
        </div>
        <div
          onClick={() => onStop?.()}
          disabled
          className="overlay-button stop-button"
        >
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
  start = Math.max(start, 0);
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
