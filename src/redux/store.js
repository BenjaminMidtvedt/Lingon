import { applyMiddleware, configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import noteMapReducer from "./noteMap";
import config from "./config";

export default configureStore(
  {
    reducer: {
      noteMap: noteMapReducer,
      config: config,
    },
  },
  [logger]
);
