import logo from "./logo.svg";
import "./App.css";
import Track from "./components/Track";
import { useEffect, useState } from "react";
import store from "./redux/store";
import { useDispatch, useSelector } from "react-redux";
import { writeNote, clearNote } from "./redux/noteMap";

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

function App() {
  const dispatch = useDispatch();
  const notesPerBar = useSelector((state) => state.config.notesPerBar);
  const numberOfBars = useSelector((state) => state.config.numberOfBars);

  useEffect(() => {
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
        } else {
          const col = parseInt(active_el.attributes.col.value);
          const bar = parseInt(active_el.attributes.bar.value);
          const track = parseInt(active_el.attributes.track.value);
          dispatch(
            writeNote({
              id: [track, bar, col, row],
              note: e.key,
            })
          );

          // stopProp = true;
        }

        if (stopProp) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      }
    });
  }, []);

  return (
    <div className="App">
      <div
        className="home-body"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numberOfBars * notesPerBar}, 20px)`,
          gridTemplateRows: `repeat(${2}, 200px)`,
        }}
      >
        <Track track={0}></Track>
        <Track track={1}></Track>

        {/* <Track track={1}></Track> */}
      </div>
    </div>
  );
}

export default App;
