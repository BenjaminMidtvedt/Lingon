// import logo from "./logo.svg";
// import "./App.css";

import { useState } from "react";
import { useSelector } from "react-redux";
import { connect } from "react-redux";

const scale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function Slot({ track = 0, row = 0, col = 0, bar = 0 }) {
  const value = useSelector((state) => state.noteMap[[track, bar, col, row]]);
  return (
    <div
      track={track}
      row={row}
      col={col}
      bar={bar}
      tabIndex="0"
      className={`slot slot-row-${row}`}
    >
      <span className={"slot-text"}>{value}</span>
    </div>
  );
}

connect()(Slot);

function Bar({ track, bar }) {
  const notesPerBar = useSelector((state) => state.config.notesPerBar);
  let cols = Array(notesPerBar).fill(0);
  cols = cols.map((_, i) => (
    <div
      className={`track-col ${i === 0 ? "bar-start" : ""}`}
      style={{ gridRow: track + 1, gridColumn: bar * 16 + i + 1 }}
      key={`${track}-${bar * notesPerBar + i}`}
    >
      <Slot track={track} bar={bar} row={0} col={i}></Slot>
      <Slot track={track} bar={bar} row={1} col={i}></Slot>
      <Slot track={track} bar={bar} row={2} col={i}></Slot>
      <Slot track={track} bar={bar} row={3} col={i}></Slot>
      <Slot track={track} bar={bar} row={4} col={i}></Slot>
      <Slot track={track} bar={bar} row={5} col={i}></Slot>
    </div>
  ));
  return <>{cols}</>;
}

function Track({ track = 0, tuning = [50, 55, 60, 65, 69, 74] }) {
  const numberOfBars = useSelector((state) => state.config.numberOfBars);

  let scale_chars = tuning.map((i) => scale[i % scale.length]);
  let bars = Array(numberOfBars).fill(0);
  bars = bars.map((_, i) => <Bar track={track} key={i} bar={i}></Bar>);

  return <>{bars}</>;
}

export default Track;
