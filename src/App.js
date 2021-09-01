import React, { useState, useEffect } from "react";
import "./App.css";
import "./Responsive.css";
import { Routes } from "./Routes";
import { useHistory, useLocation } from "react-router-dom";
import { TopNavBar } from "./components/TopNavBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { getLoginStatus, getPageName } from "./utils/commonUtils";
import { library } from "@fortawesome/fontawesome-svg-core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import ScrollToTopBtn from "./components/ScrollToTop";
import {
  faEdit,
  faTrashAlt,
  faClone,
  faEyeSlash,
  faEye,
} from "@fortawesome/free-regular-svg-icons";
import {
  faUsers,
  faComments,
  faBookOpen,
  faAngleDown,
  faAngleUp,
  faCog,
  faPlus,
  faMinus,
  faRedoAlt,
  faExclamationTriangle,
  faDownload,
  faArrowCircleUp,
  faCaretRight,
  faCaretDown,
  faCopy,
  faSignInAlt,
  faUserPlus,
  faTable,
  faCaretUp,
  faVial,
} from "@fortawesome/free-solid-svg-icons";
import { CssBaseline } from "@material-ui/core";
import { ResponsiveEmbed } from "react-bootstrap";

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      '"Fira Sans"',
      '"Droid Sans"',
      '"Helvetica Neue"',
      "sans-serif",
    ].join(","),
  },
});

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const loginUpdater = (flag) => setLoggedIn(flag);
  const logoutHandler = (e) => logout(e);
  const history = useHistory();
  const location = useLocation();

  useEffect(checkAuthorization, [loggedIn]);

  const setRouting = () => {
    library.add(
      faTrashAlt,
      faEdit,
      faClone,
      faUsers,
      faComments,
      faBookOpen,
      faAngleDown,
      faAngleUp,
      faCog,
      faPlus,
      faMinus,
      faRedoAlt,
      faExclamationTriangle,
      faDownload,
      faArrowCircleUp,
      faCaretRight,
      faCaretDown,
      faCopy,
      faEyeSlash,
      faEye,
      faSignInAlt,
      faUserPlus,
      faTable,
      faCaretUp,
      faVial
    );

    return (
      <div className="app">
        <ThemeProvider theme={theme}>
          <TopNavBar loggedInFlag={loggedIn} logoutHandler={logoutHandler} />
          <CssBaseline />
          <ScrollToTopBtn />
          {location &&
          location.pathname &&
          (location.pathname === "/data" ||
            location.pathname === "/glycanSearch" ||
            location.pathname === "/glycanList" ||
            location.pathname === "/glycanDetail" ||
            location.pathname === "/submitterSearch" ||
            location.pathname === "/") ? (
            <Routes updateLogin={loginUpdater} authCheckAgent={checkAuthorization} />
          ) : (
            <Routes updateLogin={loginUpdater} authCheckAgent={checkAuthorization} />
          )}
        </ThemeProvider>
      </div>
    );
  };

  return setRouting();

  function checkAuthorization() {
    var authorized = getLoginStatus();
    setLoggedIn(authorized); //async
    var loginNotRequiredPages = [
      "",
      "login",
      "forgotUsername",
      "forgotPassword",
      "signup",
      "emailConfirmation",
      "data",
      "verifyToken",
      "submitterSearch",
      "glycanSearch",
      "glycanList",
      "glycanDetail",
    ];
    var pagename = getPageName(history);

    var redirectFrom = "";
    if (history.location.state && history.location.state.redirectFrom) {
      redirectFrom = history.location.state.redirectFrom;
    } else {
      if (authorized && history.location.pathname === "/login") {
        redirectFrom = "/";
        history.push({
          pathname: "/",
          state: { redirectedFrom: redirectFrom },
        });
      } else {
        redirectFrom = history.location.pathname;
      }
    }

    if (!authorized && !loginNotRequiredPages.includes(pagename)) {
      history.push({
        pathname: "/login",
        state: { redirectedFrom: redirectFrom },
      });
    }
  }
  function logout(e) {
    e.preventDefault();
    window.localStorage.clear();
    setLoggedIn(false);
    history.push("/");
  }
};

export { App };
