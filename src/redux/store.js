import { applyMiddleware, configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import noteMapReducer from "./noteMap";
import config from "./config";
import undoable from "redux-undo";
import noteMap from "./noteMap";
import { saveState } from "./utils";

const store = configureStore(
  {
    reducer: {
      noteMap: undoable(noteMapReducer),
      config: config,
    },
  },
  [logger]
);

store.subscribe(() => {
  let state = store.getState();
  state = { ...state, noteMap: state.noteMap.present };
  saveState(state);
});

export default store;
