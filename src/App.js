import logo from "./logo.svg";
import "./App.css";
import Track, { gridHeight, gridWidth, numberToNote } from "./components/Track";
import { useEffect, useRef, useState } from "react";
import store from "./redux/store";
import { useDispatch, useSelector } from "react-redux";
import { writeNote, clearNote, addTrack } from "./redux/noteMap";
import { ActionCreators } from "redux-undo";
import {
  Play,
  playNote,
  playTrackColumn,
  Stop as StopPlay,
} from "./audio/context";
import {
  setFocusedColumn,
  setFocusedRow,
  setFocusedTrack,
} from "./redux/state";

import { Add, PlayArrow, Stop } from "@mui/icons-material";
import {
  clearSelection,
  setSelectionEnd,
  setSelectionStart,
} from "./redux/selection";
import {
  getActiveIndex,
  getSelectionStartEnd,
  keypressHandler,
} from "./redux/handlers";

const version = require("../package.json").version;

function App() {
  const dispatch = useDispatch();
  const notesPerBar = useSelector((state) => state.config.notesPerBar);
  const numberOfBars = useSelector((state) => state.config.numberOfBars);

  useEffect(() => {
    let selectionStart = 0;
    let selectionEnd = 0;
    let ismousedown = false;
    let [top, left] = [0, 0];
    let gridPositions = [];

    window.addEventListener("mousedown", (e) => {
      const parentSvg = e.composedPath().find((v) => v.localName === "svg");

      const onTrack = parentSvg !== undefined;
      ismousedown = onTrack;
      if (onTrack) {
        const app = document.getElementById("App");
        const rect = parentSvg.getBoundingClientRect();
        left = rect.left;
        top = rect.top;
        const x = e.pageX - left;
        const y = e.pageY - top;

        const xPos = Math.floor(x / gridWidth);
        const yPos = Math.floor(y / gridHeight);

        dispatch(setFocusedTrack(parentSvg.attributes.track.value - 0));
        dispatch(setFocusedColumn(xPos));
        dispatch(setFocusedRow(yPos));
        if (!e.shiftKey) dispatch(setSelectionStart(xPos));
        dispatch(setSelectionEnd(xPos));
      } else {
        dispatch(clearSelection());
      }
    });

    window.addEventListener("mouseup", (e) => {
      ismousedown = false;
    });

    window.addEventListener("mousemove", (e) => {
      if (ismousedown) {
        const app = document.getElementById("App");
        const x = e.pageX - left;
        const y = e.pageY - top;

        const xPos = Math.max(Math.floor(x / gridWidth), 0);
        const yPos = Math.floor(y / gridHeight);
        dispatch(setSelectionEnd(xPos));
        dispatch(setFocusedColumn(xPos));

        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
      }
    });

    window.addEventListener("keydown", (e) => keypressHandler(e, dispatch));
  }, []);

  const numberOfTracks = useSelector((state) => state.noteMap.present.length);

  return (
    <div className="App" id="App">
      <Lingon />
      <div
        className="home-body"
        style={{
          display: "grid",
          gridTemplateRows: `70px repeat(${numberOfTracks}, 50px 200px)`,
        }}
      >
        <Beat />
        {Array(numberOfTracks)
          .fill(0)
          .map((_, i) => (
            <Track track={i} key={i}></Track>
          ))}

        <Selection></Selection>
      </div>
      <Overlay
        onPlay={(playActiveTrack) => {
          Play(store.getState().selection.end, playActiveTrack);
        }}
        onStop={StopPlay}
      />
      <Footer></Footer>
    </div>
  );
}

function Overlay({ onPlay = undefined, onStop = undefined }) {
  const dispatch = useDispatch();

  const { isPlaying } = useSelector((state) => state.state);

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="overlay-inner">
        <div
          onClick={() => dispatch(addTrack())}
          disabled
          className="overlay-button play-button"
        >
          <Add />
        </div>
        <div
          onClick={() => onPlay?.(true)}
          tabIndex={-1}
          disabled
          className={`overlay-button play-button ${
            isPlaying ? "overlay-button-disabled" : ""
          }`}
        >
          <PlayArrow />
        </div>
        <div
          onClick={() => onPlay?.(false)}
          tabIndex={-1}
          disabled
          className={`overlay-button play-button ${
            isPlaying ? "overlay-button-disabled" : ""
          }`}
        >
          <PlayArrow style={{ transform: "translate(-9px, -7px)" }} />
          <PlayArrow
            style={{
              position: "absolute",
              transform: "translate(-21px, 7px)",
            }}
          />
        </div>
        <div
          onClick={() => onStop?.()}
          disabled
          className={`overlay-button stop-button ${
            !isPlaying ? "overlay-button-disabled" : ""
          }`}
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
  let col = useSelector((state) => state.state.focusedColumn);
  col = Math.min(col, numberOfBars * notesPerBar - 1);
  const focusedRef = useRef(null);

  const beats = Array(numberOfBars * notesPerBar)
    .fill(0)
    .map((_, i) => {
      let in_bar_beat = i % notesPerBar;
      let sub_beat = in_bar_beat % 4;

      let beat_size = 5;
      if (sub_beat === 2) beat_size = 10;
      if (sub_beat === 0) beat_size = 15;
      if (in_bar_beat === 0) beat_size = 20;

      return (
        <div
          key={i}
          ref={col === i ? focusedRef : undefined}
          style={{
            margin: "auto",
            marginTop: 0,
            width: 2,
            height: beat_size,
            backgroundColor: col === i ? "#b6ec4b" : "white",
          }}
        ></div>
      );
    });

  useEffect(() => {
    const { isPlaying } = store.getState().state;
    try {
      if (
        focusedRef.current.getBoundingClientRect().right >
        window.innerWidth - 100
      ) {
        focusedRef.current.scrollIntoView({
          inline: isPlaying ? "center" : "center",
        });
      }

      if (focusedRef.current.getBoundingClientRect().left < 100) {
        focusedRef.current.scrollIntoView({
          inline: isPlaying ? "center" : "center",
        });
      }
    } catch {}
  });

  return (
    <div
      style={{
        gridColumn: 1,
        display: "flex",
        width: gridWidth * numberOfBars * notesPerBar,
      }}
    >
      {beats}
    </div>
  );
}

function Lingon() {
  return (
    <span className="lingon">
      Lingon <span className="version">v{version + ""}</span>
    </span>
  );
}

function Selection() {
  let { start, end } = useSelector(
    (state) => state.selection,
    (a, b) => a.start === b.start && a.end === b.end
  );
  let focusedTrack = useSelector((state) => state.state.focusedTrack);
  let isPlaying = useSelector((state) => state.state.isPlaying);
  console.log("se", start, end, focusedTrack, isPlaying);
  start = Math.max(start, 0);
  return (
    <div
      style={{
        gridRow: 2 * focusedTrack + 3,
        gridColumn: 1,
        marginTop: -6,
        width: 250,
        height: 6 * gridHeight + 8,
        left: 0,
        display: isPlaying ? "none" : "initial",
        pointerEvents: "none",
        transformOrigin: "left",
        transform: `translateX(${start * gridWidth}px) scaleX(${
          ((end - start) * gridWidth) / 250
        })`,
        backgroundColor: "#bb97e710",
        borderTop: "2px solid #bb97e7",
        borderBottom: "2px solid #bb97e7",
        transitionProperty: "transform",
        transitionDuration: "0.05s",
      }}
    ></div>
  );
}

function Footer() {
  const { focusedColumn, focusedRow, focusedTrack, isPlaying } = useSelector(
    (store) => store.state
  );

  const { tuning } = useSelector(
    (store) => store.noteMap.present[focusedTrack]
  );

  const value = useSelector(
    (store) => store.noteMap.present[focusedTrack][[focusedColumn, focusedRow]]
  );

  const note =
    Number.isInteger(value) && !isPlaying
      ? numberToNote(value + tuning[focusedRow])
      : "";

  return (
    <div id="footer">
      <div className="footer-item footer-note">{note}</div>
    </div>
  );
}

export default App;
