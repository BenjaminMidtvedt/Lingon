// import logo from "./logo.svg";
// import "./App.css";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "react-redux";
import { listInstruments } from "../audio/context";
import { setInstrument } from "../redux/noteMap";

const scale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function Slot({ track = 0, row = 0, col = 0, bar = 0 }) {
  const value = useSelector(
    (state) => state.noteMap.present[track][[col, row]]
  );

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

function Track({ track = 0, tuning = [50, 55, 60, 65, 69, 74] }) {
  const numberOfBars = useSelector((state) => state.config.numberOfBars);
  let bars = Array(numberOfBars).fill(0);
  bars = bars.map((_, i) => (
    <Bar track={track} key={i} bar={i} isLast={i === numberOfBars - 1}></Bar>
  ));

  return (
    <>
      <Tuning track={track} />
      <InstrumentSelect track={track} />
      {bars}
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
        gridColumn: "1 / 12",
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

function Tuning({ track }) {
  const tuning = useSelector((state) => state.noteMap.present[track].tuning);

  let scale_chars = tuning.map((i) => scale[(i + 2) % scale.length]);

  return (
    <div
      style={{
        gridRow: track * 2 + 3,
        gridColumn: "1",
        height: 135,
        display: "flex",
        color: "white",
        flexDirection: "column",
        alignContent: "stretch",
        justifyContent: "space-between",
        marginLeft: -50,
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
