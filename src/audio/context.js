import store from "../redux/store";
import WebAudioFontPlayer from "webaudiofont";
import {
  setFocusedColumn,
  setPlayingFalse,
  setPlayingTrue,
} from "../redux/state";
// Get context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const player = new WebAudioFontPlayer();
player.loader.decodeAfterLoading(audioContext, "_tone_0300_Chaos_sf2_file");

export function listInstruments() {
  return player.loader.instrumentTitles();
}

export async function loadInstrument(instrumentId, onDone) {
  const instrumentInfo = player.loader.instrumentInfo(instrumentId);
  player.loader.startLoad(
    audioContext,
    instrumentInfo.url,
    instrumentInfo.variable
  );

  player.loader.waitLoad(() => onDone(window[instrumentInfo.variable]));
}

export function playTrackColumn(track, column) {
  let numberOfNotes = 0;

  const tuning = track.tuning;
  const instrumentId = track.instrument || 0;
  const out = player.loader.findInstrument(instrumentId);
  console.log(track);

  return new Promise((resolve, reject) => {
    loadInstrument(out, (instrument) => {
      const synch_latency = 1 / 20;
      const currentTime = audioContext.currentTime;
      const notes = Array(6)
        .fill(0)
        .map((_, i) => {
          let value = track[[column, i]];
          if (Number.isInteger(value)) {
            const pitch = tuning[i] + value - 10;
            const envelope = player.queueWaveTable(
              audioContext,
              audioContext.destination,
              instrument,
              currentTime + synch_latency,
              pitch,
              0.5,
              1 / 6
            );
            return envelope.audioBufferSourceNode;
          }
          return undefined;
        });
      resolve(notes);
    });
  });
}

export function Play(start = 0) {
  store.dispatch(setPlayingTrue());

  const { noteMap } = store.getState();

  const startTime = audioContext.currentTime + 0.01;
  let endTime = startTime;

  noteMap.present.forEach((track, trackid) => {
    const playingNotes = Array(7);
    const playingNotesId = {};
    const { tuning } = track;
    const instrumentId = track.instrument || 0;
    const out = player.loader.findInstrument(instrumentId);

    loadInstrument(out, (instrument) => {
      Object.entries(track)
        .filter(([key, _]) => key.includes(","))
        .map(([key, val]) => [...key.split(","), val])
        .filter(
          ([col, row, val]) => col >= start && val !== "" && val !== undefined
        )
        .sort(([col, row, val], [col2, row2, val2]) => col - col2)
        .forEach(([col, row, val]) => {
          const time = startTime + ((col - start) / 120 / 4) * 60;
          playingNotes[row]?.stop?.(time);

          if (playingNotesId[row]) {
            const [slotId, startTime] = playingNotesId[row];
            // highlightNote(slotId, startTime, time);
          }
          if (val === "*") {
            playingNotes[row] = undefined;
            playingNotesId[row] = undefined;
            return;
          }

          const pitch = tuning[row] + val - 10;
          if (pitch === undefined || isNaN(pitch)) return;
          const envelope = player.queueWaveTable(
            audioContext,
            audioContext.destination,
            instrument,
            time,
            pitch,
            100,
            1 / 12
          );
          playingNotes[row] = envelope.audioBufferSourceNode;
          playingNotesId[row] = [`${trackid},${col},${row}`, time];
          endTime = Math.max(time, endTime);
        });
      moveFocusDuringPlay(startTime, start, endTime + 1);
    });
  });
}

export function Stop() {
  store.dispatch(setPlayingFalse());
  player.cancelQueue(audioContext);
}

function moveFocusDuringPlay(startTime, start, end) {
  let stepTime = 60 / 120 / 4;
  let nextStep = startTime;
  let nextRow = start;

  function step() {
    if (!store.getState().state.isPlaying) return;
    if (audioContext.currentTime < nextStep)
      return window.requestAnimationFrame(step);

    store.dispatch(setFocusedColumn(nextRow));
    nextStep += stepTime;
    nextRow += 1;
    return window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
}

function highlightNote(id, start, end) {
  const el = document.getElementById(id).children[0];
  let didadd = false;

  function step() {
    if (!store.getState().state.isPlaying || audioContext.currentTime > end)
      return el.classList.remove("slot-highlight");
    if (audioContext.currentTime < start)
      return window.requestAnimationFrame(step);

    if (!didadd) {
      console.log("added highligh");
      el.classList.add("slot-highlight");
      didadd = true;
    }

    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
}
