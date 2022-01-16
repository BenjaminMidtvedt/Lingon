// import logo from "./logo.svg";
// import "./App.css";

import { useState } from "react";

function shiftBar(forward = true) {
  //add all elements we want to include in our selection

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
            parseInt(e.attributes.col.value) === 0 &&
            parseInt(e.attributes.row.value) === row
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

window.addEventListener("keydown", (e) => {
  const active_el = document.activeElement;
  if (active_el.classList.contains("slot")) {
    // Active element is a slot

    const row = parseInt(active_el.attributes.row.value);

    let stopProp = false;
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
      if (e.ctrlKey) {
        shiftBar(true);
      } else {
        shiftFocusBy(6);
      }
      stopProp = true;
    } else if (e.code === "ArrowLeft") {
      if (e.ctrlKey) {
        shiftBar(false);
      } else {
        shiftFocusBy(-6);
      }
      stopProp = true;
    }

    if (stopProp) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }
});

const scale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function Slot({ value = "0", row = 0, col = 0 }) {
  return (
    <div row={row} col={col} tabindex="0" className={`slot`}>
      <span className={"slot-text"}>{value}</span>
    </div>
  );
}

function Bar({ notes = [] }) {
  let cols = Array(16).fill(0);
  cols = cols.map((_, i) => (
    <div key={i} className="bar-col">
      <Slot row={0} col={i}></Slot>
      <Slot row={1} col={i}></Slot>
      <Slot row={2} col={i}></Slot>
      <Slot row={3} col={i}></Slot>
      <Slot row={4} col={i}></Slot>
      <Slot row={5} col={i}></Slot>
    </div>
  ));
  return <div className="bar">{cols}</div>;
}

function Track({
  numberOfBars = 64,
  notes = [],
  tuning = [50, 55, 60, 65, 69, 74],
}) {
  let scale_chars = tuning.map((i) => scale[i % scale.length]);
  let bars = Array(numberOfBars).fill(0);
  bars = bars.map(() => <Bar></Bar>);

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
