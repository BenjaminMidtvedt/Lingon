// import logo from "./logo.svg";
// import "./App.css";

import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "react-redux";
import { listInstruments } from "../audio/context";
import { setInstrument, setLetNotesRing } from "../redux/noteMap";
import {
  setFocusedColumn,
  setFocusedRow,
  setFocusedTrack,
} from "../redux/state";

const scale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
export const gridWidth = 18;
export const gridHeight = 23;
export const padding = gridHeight;

function Slot({ track = 0, row = 0, col = 0, bar = 0 }) {
  const value = useSelector(
    (state) => state.noteMap.present[track][[col, row]]
  );
  console.log("redraw");
  return (
    <div
      track={track}
      row={row}
      col={col}
      bar={bar}
      id={`${track},${col},${row}`}
      tabIndex="0"
      className={`slot slot-row-${row} ${
        value || value === 0 || value === "0" ? "slot-row-nobg" : ""
      }`}
    >
      <span className={"slot-text"}>{value}</span>
    </div>
  );
}

connect()(Slot);

function Bar({ track, bar, isLast }) {
  const notesPerBar = useSelector((state) => state.config.notesPerBar);
  let cols = Array(notesPerBar).fill(0);
  cols = cols.map((_, i) => (
    <div
      className={`track-col ${i === 0 ? "bar-start" : ""} ${
        i === notesPerBar - 1 && isLast ? "bar-end" : ""
      }`}
      style={{
        gridRow: track * 2 + 3,
        gridColumn: bar * 16 + i + 1,
      }}
      key={`${track}-${bar * notesPerBar + i}`}
    >
      <Slot track={track} bar={bar} row={0} col={bar * notesPerBar + i}></Slot>
      <Slot track={track} bar={bar} row={1} col={bar * notesPerBar + i}></Slot>
      <Slot track={track} bar={bar} row={2} col={bar * notesPerBar + i}></Slot>
      <Slot track={track} bar={bar} row={3} col={bar * notesPerBar + i}></Slot>
      <Slot track={track} bar={bar} row={4} col={bar * notesPerBar + i}></Slot>
      <Slot track={track} bar={bar} row={5} col={bar * notesPerBar + i}></Slot>
    </div>
  ));
  return <>{cols}</>;
}

function Track({ track = 0 }) {
  return (
    <>
      <Tuning track={track} />
      <TrackSettings track={track} />
      <TrackSvg track={track} />
    </>
  );
}

function InstrumentSelect({ track }) {
  const instruments = listInstruments();
  const currentInstrument = useSelector(
    (state) => state.noteMap.present[track].instrument
  );
  const dispatch = useDispatch();
  return (
    <div
      style={{
        gridRow: track * 2 + 2,
        width: 250,
        height: 30,
      }}
    >
      <select
        className="instrument-select"
        value={currentInstrument}
        onChange={(e) => dispatch(setInstrument({ id: e.target.value, track }))}
      >
        {instruments.map((name, i) => (
          <option value={i} key={name}>
            {i}: {name}
          </option>
        ))}
      </select>
    </div>
  );
}

function SetLetNotesRing({ track }) {
  const letNotesRing = useSelector(
    (store) => store.noteMap.present[track].letNotesRing
  );
  const dispatch = useDispatch();
  return (
    <div className="checkbox">
      <input
        type="checkbox"
        onChange={(v) => {
          dispatch(setLetNotesRing({ track, value: !letNotesRing }));
        }}
        checked={letNotesRing}
      ></input>
      Let notes ring
    </div>
  );
}

function Marker({ track = 0 }) {
  const { focusedRow, focusedColumn, focusedTrack, isPlaying } = useSelector(
    (store) => store.state
  );
  // console.log(focusedColumn, focusedRow, focusedTrack, "on");
  if (track !== focusedTrack) return null;
  return (
    <div
      style={{
        position: "absolute",
        transform: `translate(${focusedColumn * gridWidth}px, ${
          focusedRow * gridHeight - 1
        }px)`,
        top: 0,
        left: 0,
        borderRadius: 5,
        opacity: isPlaying ? 0 : 1,
        width: gridWidth - 4,
        height: gridHeight - 3,
        border: "3px solid white",
        pointerEvents: "none",
        transitionProperty: "transform",
        transitionDuration: "0.05s",
      }}
    ></div>
  );
}

function TrackSettings({ track = 0 }) {
  return (
    <div style={{ display: "flex" }}>
      <InstrumentSelect track={track} />
      <SetLetNotesRing track={track} />
    </div>
  );
}

function TrackSvg({ track = 0 }) {
  const numberOfBars = useSelector((state) => state.config.numberOfBars);
  const notesPerBar = useSelector((state) => state.config.notesPerBar);
  const notes = useSelector((state) => state.noteMap.present[track]);

  const colors = [
    "#bb97e744",
    "#bb97e760",
    "#bb97e773",
    "#bb97e773",
    "#bb97e760",
    "#bb97e744",
  ];
  const width = gridWidth * numberOfBars * notesPerBar;

  const svgref = useRef(null);

  let ds = Array(6)
    .fill("")
    .map((_, i) => `M 0 ${i * gridHeight + padding / 2}`);
  let texts = [];

  Object.entries(notes)
    .filter(([key, _]) => key.includes(","))
    .map(([key, val]) => [...key.split(","), val])
    .filter(([col, row, val]) => val !== "" && val !== undefined)
    .sort(([col, row, val], [col2, row2, val2]) => col - col2)
    .forEach(([col, row, val]) => {
      const h = row * gridHeight + padding / 2;
      const l = col * gridWidth + 2;
      const r = l + gridWidth - 2;
      ds[row] = ds[row] + `T ${l} ${h} M ${r} ${h}`;
      texts.push(
        <text
          x={col * gridWidth + gridWidth / 2 + 1}
          y={row * gridHeight + gridHeight / 2}
          fill="white"
          fontSize={(val + "").length === 1 ? 16 : 13}
          width={gridWidth}
          height={gridHeight}
          textAnchor={"middle"}
          alignmentBaseline={"central"}
          key={col + "," + row}
        >
          {val}
        </text>
      );
    });

  return (
    <div
      ref={svgref}
      style={{
        position: "relative",
        gridRow: track * 2 + 3,
        gridColumn: 1,
      }}
    >
      <Marker track={track}></Marker>
      <svg
        track={track}
        height={gridHeight * 5 + padding}
        width={gridWidth * numberOfBars * notesPerBar}
      >
        {ds.map((d, i) => (
          <path
            key={i}
            d={d + `H ${width}`}
            stroke={colors[i]}
            strokeWidth={2}
          ></path>
        ))}

        {Array(numberOfBars + 1)
          .fill(0)
          .map((_, i) => (
            <path
              key={i}
              d={`M ${notesPerBar * i * gridWidth} 0 T ${
                notesPerBar * i * gridWidth
              } ${gridHeight * 5 + padding}`}
              stroke={"#bb97e7"}
              strokeWidth={2}
            ></path>
          ))}
        {texts}
      </svg>
    </div>
  );
}

function Tuning({ track }) {
  const tuning = useSelector((state) => state.noteMap.present[track]);
  console.log(track, tuning);
  let scale_chars = tuning.tuning.map((i) => scale[(i + 2) % scale.length]);

  return (
    <div
      style={{
        gridRow: track * 2 + 3,
        gridColumn: 1,
        height: gridHeight * 6,
        width: 20,
        display: "flex",
        color: "white",
        flexDirection: "column",
        alignContent: "stretch",
        justifyContent: "space-between",
        marginLeft: -25,
      }}
    >
      {scale_chars.map((v, i) => (
        <div key={i}>{v}</div>
      ))}
    </div>
  );
}

export function numberToNote(number) {
  return scale[(number + 2) % scale.length];
}

export default Track;
