import { applyMiddleware, configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import noteMapReducer from "./noteMap";

export default configureStore(
  {
    reducer: {
      noteMap: noteMapReducer,
    },
  },
  [logger]
);
