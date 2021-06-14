//import "../src/components/wdyr";

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { App } from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router } from "react-router-dom";
// import "font-awesome/css/font-awesome.min.css";
import { Loading } from "./components/Loading";

ReactDOM.render(
  <Router basename="/ggarray">
    <App />
    {/* <Loading />s */}
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
