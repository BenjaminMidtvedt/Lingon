import store from "../redux/store";

// Get context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

export function createNote(key) {
  const oscillator = audioContext.createOscillator();
  // console.log(key);

  const freq = 440 * Math.pow(2, (key - 79) / 12);
  oscillator.frequency.setValueAtTime(freq, audioContext.currentTime); // value in hertz

  return oscillator;
}

export function playNote(key, duration = 0.5) {
  const oscillator = createNote(key, duration);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);

  return oscillator;
}

export function playTrackColumn(track, column) {
  let numberOfNotes = 0;

  const tuning = track.tuning;

  const notes = Array(6)
    .fill(0)
    .map((_, i) => {
      let value = track[[column, i]];
      if (Number.isInteger(value)) {
        numberOfNotes += 1;
        return createNote(value + tuning[i]);
      } else {
        return undefined;
      }
    });

  const gainNode = audioContext.createGain();
  gainNode.gain.value = 1 / 6;

  notes.forEach((note) => (note ? note.connect(gainNode) : null));
  gainNode.connect(audioContext.destination);
  console.log(notes);
  notes.forEach((note) => {
    note?.start(audioContext.currentTime);
    note?.stop(audioContext.currentTime + 0.5);
  });

  return notes;
}

export function Play(tracks, start = 0) {
  const allNotes = [];
  const playingNotes = Array(7);
  const { noteMap } = store.getState();

  const startTime = audioContext.currentTime;
  let endTime = startTime;

  noteMap.present.forEach((track) => {
    const { tuning } = track;

    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 1 / 8;

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

        if (val === "*") {
          playingNotes[row] = undefined;
          return;
        }

        let key = val + tuning[row];
        if (key === undefined || isNaN(key)) return;
        const note = createNote(key);
        note.connect(gainNode);
        playingNotes[row] = note;
        note.start(time);

        endTime = Math.max(time, endTime);
      });
    playingNotes.forEach((v) => v?.stop?.(endTime + 1));
  });
}
