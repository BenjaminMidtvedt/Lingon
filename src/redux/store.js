import { applyMiddleware, configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import noteMapReducer from "./noteMap";
import config from "./config";
import undoable from "redux-undo";

export default configureStore(
  {
    reducer: {
      noteMap: undoable(noteMapReducer),
      config: config,
    },
  },
  [logger]
);
