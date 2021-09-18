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
        props.errorJson.errors.forEach(error => {
          if (props.customMessage) {
            aggregatedSummary += "\n" + error.objectName + " - " + error.defaultMessage + "\n";
          } else {
            aggregatedSummary += getFormErrorMessage(props.form, error) + "\n";
          }
        });
        setSummary(aggregatedSummary);
      } else if (props.errorMessage) {
        setSummary(props.errorMessage);
      } else {
        setSummary(getFormErrorMessage());
      }
    }
  }

  return (
    <div>
      <Alert variant="danger" show={props.show}>
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
