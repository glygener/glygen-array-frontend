import glygenNotFoundSmall from "../images/glygenNotFoundSmall.svg";
import glygenNotFound from "../images/glygenNotFound.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAccordionToggle } from "react-bootstrap/AccordionToggle";
import AccordionContext from "react-bootstrap/AccordionContext";
import React, { useContext } from "react";
import { wsCall } from "../utils/wsUtils";
import { includes } from "lodash";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { Spinner } from "react-bootstrap";
import { Button } from "@material-ui/core";
import LoadingImage from "../images/page_loading.gif";

/**
 *
 * @param {String} date Date string returned by backend (format: YYYY-MM-DD hh:mm:ss Z offset)
 * returns date string in MM/DD/YYYY format
 */
export function getDateMMDDYYYY(date) {
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var day = date.slice(8, 10);
  var month = date.slice(4, 7);
  // var monthIndex = parseInt(date.slice(5, 7)) - 1;
  var year = date.slice(24, 28);
  return day + "/" + month + "/" + year;
  // return day + "/" + monthNames[monthIndex] + "/" + year;
}

/**
 * Check logged in status and update app component state
 */
export function getLoginStatus() {
  var token = window.localStorage.getItem("token");
  //if token exists
  if (token) {
    // check if it is expired
    var current_time = Date.now() / 1000;
    var jwt = parseJwt(token);
    if (jwt.exp === "undefined") return true; // never expires
    if (jwt.exp < current_time) {
      /* expired */

      window.localStorage.clear();
      token = null;
      return false;
    }
  }
  //if token does not exist, user hasn't logged in
  else {
    // unauthorizedMessage(DEFAULT_MESSAGES.NOTLOGGEDIN, 'login.html');
    return false;
  }

  //if token was cleared because of expiry
  if (!token) {
    // unauthorizedMessage(DEFAULT_MESSAGES.TIMEDOUT, 'login.html');
    return false;
  }
  return true;
}

export function reLogin(history) {

  var redirectFrom = "";
  if (history.state && history.state.state && history.state.state.redirectedFrom) {
    redirectFrom = history.state.state.redirectedFrom;
  }

  history.push({
    pathname: "/login",
    state: { redirectedFrom: redirectFrom }
  });

}

export function getPageName(history) {
  var path = history.location.pathname;
  var pagename = path.substring(1, path.indexOf("/", 1) > 0 ? path.indexOf("/", 1) : path.length);
  return pagename;
}

function parseJwt(token) {
  var token1 = token.split(" ")[1];
  var base64Url = token1.split(".")[1];
  var base64 = decodeURIComponent(
    atob(base64Url)
      .split("")
      .map(function(c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(base64);
}

/**
 * Loads a default image on an image element
 * @param {Object} img DOM object of the image element to load the default image into. Pass 'this' in the call to this method from an event handler
 * @param {boolean} smallVersion Whether to load the smaller version image or not
 */
export function loadDefaultImage(img, smallVersion) {
  img.onerror = "";
  img.src = smallVersion ? glygenNotFoundSmall : glygenNotFound;
  img.classList.add("img-not-found-error");
  return true;
}

/**
 * Converts a semi colon separated string of values to an array
 * @param {String} csv Semi colon separated string of values
 */
export function csvToArray(csv) {
  var splitChar = /\s*(?:;|$)\s*/;
  var arr = csv.replace(new RegExp("^[" + splitChar + "]+"), "").split(splitChar);
  if (arr[arr.length - 1] === "" && arr[arr.length - 2] === "") arr.pop();
  return arr;
}

/**
 * Checks if a url is well-formed
 * @param {string} str
 */
export function isValidURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

/**
 * Externalizes a url(Adds https://)
 * @param {string} url
 */
export function externalizeUrl(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "https://" + url;
  }
  return url;
}

/**
 * Externalizes a date
 * @param {Date} date
 */
export function getDateCreated(dateCreated) {
  const d = new Date(dateCreated);
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let day = d.getDate();
  return `${month}/${day}/${year}`;
}

// eslint-disable-next-line react/prop-types
export function ContextAwareToggle({ children, eventKey, callback, classname }) {
  const currentEventKey = useContext(AccordionContext);

  const decoratedOnClick = useAccordionToggle(eventKey, () => callback && callback(eventKey));
  const isCurrentEventKey = currentEventKey === eventKey;

  return (
    <FontAwesomeIcon
      icon={["fas", isCurrentEventKey ? "angle-up" : "angle-down"]}
      size="2x"
      title="Collapse and Expand"
      onClick={decoratedOnClick}
      className={classname ? "font-awesome-color" : ""}
    >
      {children}
    </FontAwesomeIcon>
  );
}

export function scrollToTopIcon() {
  return (
    <>
      <span>
        <FontAwesomeIcon
          key={"scrollToTopIcon"}
          icon={["fas", "arrow-circle-up"]}
          size="3x"
          title="Scroll To Top"
          style={{
            color: "steelblue",
            position: "absolute",
            float: "left",
            left: 0,
            bottom: 0
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
      </span>
    </>
  );
}

export function downloadFile(
  file,
  setPageErrorsJson,
  setPageErrorMessage,
  setShowErrorSummary,
  wscall,
  setShowSpinner,
  downloadFailure
) {
  setShowSpinner && setShowSpinner(true);
  wsCall(
    wscall,
    "GET",
    {
      fileFolder: file.fileFolder,
      fileIdentifier: file.identifier,
      originalName: file.originalName
    },
    true,
    undefined,
    response => fileDownloadSuccess(response, setShowSpinner),
    response => {
      downloadFailure ? downloadFailure(response) : fileDownloadFailure(response, setPageErrorsJson, setPageErrorMessage, setShowErrorSummary, setShowSpinner)
    },
    {
      Accept: "*/*",
      "Content-Type": "application/json"
    },
    response => downloadFailure(response)
  );
}

export function fileDownloadSuccess(response, setShowSpinner) {
  response.headers.forEach(console.log);

  const contentDisposition = response.headers.get("content-disposition");
  const fileNameIndex = contentDisposition.indexOf("filename=") + 10;
  const fileName = contentDisposition.substring(fileNameIndex, contentDisposition.length - 1);

  //   window.location.href = fileUrl;
  response.blob().then(blob => {
    var fileUrl = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = fileUrl;
    a.download = fileName;
    a.click();

    setShowSpinner && setShowSpinner(false);
    window.URL.revokeObjectURL(fileUrl);
  });
}

export function fileExportSuccess(response, fileName) {
  response.json().then(respJson => {
    const blob = new Blob(
      [JSON.stringify(respJson)]
      //  { type: "application/json" }
    );

    let fileUrl = URL.createObjectURL(blob);
    let a = document.createElement("a");

    document.body.appendChild(a);
    a.style = "display: none";
    a.href = fileUrl;
    a.download = `${fileName}.json`;
    a.click();

    window.URL.revokeObjectURL(fileUrl);
  });
}

export function fileDownloadFailure(
  response,
  setPageErrorsJson,
  setPageErrorMessage,
  setShowErrorSummary,
  setShowSpinner
) {
  response.json().then(responseJson => {
    setPageErrorsJson(responseJson);
    setPageErrorMessage("");
    setShowErrorSummary(true);
    setShowSpinner(false);
  })
  .catch(()=>{
    setShowSpinner(false);
});
}

export function exportFile(row, setPageErrorsJson, setPageErrorMessage, setShowErrorSummary, setShowSpinner, wscall = "exportslidelayout", downloadFailure) {
  setShowSpinner(true);
  wsCall(
    wscall,
    "GET",
    { slidelayoutid: row.id, filename: "" },
    true,
    null,
    response => fileDownloadSuccess(response, setShowSpinner),
    response => {
      downloadFailure ? downloadFailure(response) : fileDownloadFailure(response, setPageErrorsJson, setPageErrorMessage, setShowErrorSummary, setShowSpinner)
    },
    null,
    response => downloadFailure(response)
  );
}

export function exportFileProcessData(row, setPageErrorsJson, setPageErrorMessage, setShowErrorSummary, setShowSpinner, wscall = "exportprocesseddata", downloadFailure) {
  setShowSpinner(true);
  wsCall(
    wscall,
    "GET",
    { processeddataid: row.id, filename: "" },
    true,
    null,
    response => fileDownloadSuccess(response, setShowSpinner),
    response => {
      downloadFailure ? downloadFailure(response) : fileDownloadFailure(response, setPageErrorsJson, setPageErrorMessage, setShowErrorSummary, setShowSpinner)
    },
    null,
    response => downloadFailure(response)
  );
}

export function exportMetadata(datasetid, setPageErrorsJson, setPageErrorMessage, setShowErrorSummary, setShowSpinner, wscall = "exportmetadata", downloadFailure) {
  setShowSpinner(true);
  wsCall(
    wscall,
    "GET",
    { datasetId: datasetid, filename: "" },
    wscall.startsWith("public") ? false : true,
    null,
    response => fileDownloadSuccess(response, setShowSpinner),
    response => {
      downloadFailure ? downloadFailure(response) : fileDownloadFailure(response, setPageErrorsJson, setPageErrorMessage, setShowErrorSummary, setShowSpinner)
    },
    null,
    response => downloadFailure(response)
  );
}

export function downloadSpinner() {
  return (
    <>
      <Spinner animation="border" role="status" style={{ marginLeft: "100%" }} />
    </>
  );
}

export function downloadSpinnerBottomSide() {
  return (
    <div className="download-spinner">
      <Button className="gg-btn-outline-reg">
        <img src={LoadingImage} alt="loadingImage" className={"download-spinner-image"} />
      </Button>
    </div>
  );
}

const alphabets = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  " "
];

export function isValidNumber(e) {
  if (includes(alphabets, e.key)) {
    e.preventDefault();
    e.stopPropagation();
  }
}

export function numberLengthCheck(e) {
  if (e.target.value.length > e.target.maxLength) {
    e.target.value = e.target.value.slice(0, e.target.maxLength);
  }
}
/**
 * Function to sort dropdown.
 * @param {object} a input value.
 * @param {object} b input value.
 **/
export function sortDropdown(a, b) {
  if (a.name < b.name) {
    return -1;
  } else if (b.name < a.name) {
    return 1;
  }
  return 0;
}
/**
 * Function to sort based on order.
 * @param {object} a input value.
 * @param {object} b input value.
 **/
export function sortDropdownIgnoreCase(a, b) {
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1;
  } else if (b.name.toLowerCase() < a.name.toLowerCase()) {
    return 1;
  }
  return 0;
}

/**
 * Function to sort based on order.
 * @param {object} a input value.
 * @param {object} b input value.
 **/
export function sortIgnoreCase(a, b) {
  if (a.toLowerCase() > b.toLowerCase()) {
    return 1;
  }
  if (b.toLowerCase() > a.toLowerCase()) {
    return -1;
  }
  return 0;
}

/**
 * Function to sort based on order.
 * @param {object} a input value.
 * @param {object} b input value.
 **/
export function sortByOrder(a, b) {
  return a.order - b.order;
}

// function capitalizeFirstLetter(string) {
//   return string.charAt(0).toUpperCase() + string.slice(1);
// }
/*export function addCommas(nStr) {
  nStr += "";
  var x = nStr.split(".");
  var x1 = x[0];
  var x2 = x.length > 1 ? "." + x[1] : "";
  var rgx = /(\d+)(\d{3})/;

  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + "," + "$2");
  }
  return x1 + x2;
}*/

export function getToolTip(displayValue) {
  return (
    <>
      <LineTooltip text={displayValue}>
        <span>{displayValue}</span>
      </LineTooltip>
    </>
  );
}

export function getPath(type) {
  switch (type) {
    case "PROTEIN":
      return "proteins";
    case "PEPTIDE":
      return "peptides";
    case "LIPID":
      return "lipids";
    case "OTHER":
      return "otherMolecules";

    default:
      return "linkers";
  }
}

export function batchupload(wscall, methodType, uploadtype, moleculetype, setPageErrorsJson, setBatchUpload) {
  let jsobj = {}
  if (moleculetype) {
    jsobj = { uploadtype: uploadtype, moleculetype: moleculetype }
  } else {
    jsobj = { uploadtype: uploadtype }
  }
  wsCall(
    wscall,
    methodType,
    jsobj,
    true,
    null,
    response => {
      response && response.json().then(resp => {
        setPageErrorsJson && setPageErrorsJson(resp);
        setBatchUpload && setBatchUpload(true);
      });
    },
    response => {
      if (response.status === 404) {
        response && response.text().then(resp => {
          console.log(JSON.parse(resp));
        });
      } else {
        if (response) {
          setPageErrorsJson && setPageErrorsJson({status:"DEFAULT"});
          console.log(response);
        };
      }
    }
  );
}
