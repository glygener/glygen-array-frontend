import React, { useState, useEffect } from "react";
import "../components/ErrorSummary.css";
import Alert from "react-bootstrap/Alert";
import PropTypes from "prop-types";
import { getFormErrorMessage } from "../utils/errorHandling";

const ErrorSummary = props => {
  const [summary, setSummary] = useState("");
  useEffect(updateSummary, [props.errorJson], [props.errorMessage]);

  function updateSummary() {
    var aggregatedSummary = "";
    if (props.show) {
      if (props.errorJson && null != props.errorJson.errors && props.errorJson.errors.length > 0) {
        // getAlert();
        props.errorJson.errors.forEach(error => {
          if (props.customMessage) {
            aggregatedSummary += "\n" + error.objectName + " - " + error.defaultMessage + "\n";
          } else {
            aggregatedSummary += getFormErrorMessage(props.form, error) + "\n";
          }
        });
        setSummary(aggregatedSummary);
      } else if (null !== props.errorMessage && "" !== props.errorMessage) {
        setSummary(props.errorMessage);
      } else {
        console.log(props.errorJson.errorCode + " - " + props.errorJson.statusCode + " - Bad Request");
        setSummary(getFormErrorMessage());
      }
    }
  }

  return (
    <div style={{ textAlign: "-webkit-center" }}>
      <Alert
        variant="danger"
        show={props.show}
        className="alert-message"
        // style={{ marginLeft: "35%" }}
      >
        {summary}
      </Alert>
    </div>
  );
};

ErrorSummary.propTypes = {
  show: PropTypes.bool,
  form: PropTypes.string,
  errorJson: PropTypes.object,
  errorMessage: PropTypes.string,
  customMessage: PropTypes.bool
};

export { ErrorSummary };
