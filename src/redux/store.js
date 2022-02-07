import { applyMiddleware, configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import noteMapReducer from "./noteMap";
import config from "./config";
import undoable from "redux-undo";
import noteMap from "./noteMap";
import { saveState } from "./utils";
import { throttle } from "lodash";
import selection from "./selection";

const store = configureStore(
  {
    reducer: {
      noteMap: undoable(noteMapReducer),
      config: config,
      selection: selection,
    },
  },
  [logger]
);

store.subscribe(
  throttle(() => {
    let state = store.getState();
    state = { ...state, noteMap: state.noteMap.present };
    saveState(state);
  }, 500)
);

export default store;
