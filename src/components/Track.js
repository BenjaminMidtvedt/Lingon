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
      className={`slot`}
    >
      <span className={"slot-text"}>{value}</span>
    </div>
  );
}

connect()(Slot);

function Bar({ track, bar }) {
  let cols = Array(16).fill(0);
  cols = cols.map((_, i) => (
    <div key={i} className="bar-col">
      <Slot track={track} bar={bar} row={0} col={i}></Slot>
      <Slot track={track} bar={bar} row={1} col={i}></Slot>
      <Slot track={track} bar={bar} row={2} col={i}></Slot>
      <Slot track={track} bar={bar} row={3} col={i}></Slot>
      <Slot track={track} bar={bar} row={4} col={i}></Slot>
      <Slot track={track} bar={bar} row={5} col={i}></Slot>
    </div>
  ));
  return <div className="bar">{cols}</div>;
}

function Track({
  numberOfBars = 64,
  track = 0,
  tuning = [50, 55, 60, 65, 69, 74],
}) {
  let scale_chars = tuning.map((i) => scale[i % scale.length]);
  let bars = Array(numberOfBars).fill(0);
  bars = bars.map((_, i) => <Bar track={track} key={i} bar={i}></Bar>);

  return (
    <div className="track">
      <div>
        <div className="bar-row bar-scale">{scale_chars[0]}</div>
        <div className="bar-row bar-scale">{scale_chars[1]}</div>
        <div className="bar-row bar-scale">{scale_chars[2]}</div>
        <div className="bar-row bar-scale">{scale_chars[3]}</div>
        <div className="bar-row bar-scale">{scale_chars[4]}</div>
        <div className="bar-row bar-scale">{scale_chars[5]}</div>
      </div>

      {bars}
    </div>
  );
}

export default Track;
