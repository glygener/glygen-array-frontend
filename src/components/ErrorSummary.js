import React, { useState, useEffect } from "react";
import "../components/ErrorSummary.css";
import Alert from "react-bootstrap/Alert";
import PropTypes from "prop-types";
import { getFormErrorMessage } from "../utils/errorHandling";

const ErrorSummary = props => {
  const [summary, setSummary] = useState("");
  const [listAlerts, setListAlerts] = useState([]);
  const [listSummary, setListSummary] = useState();

  useEffect(updateSummary, [props.errorJson], [props.errorMessage]);

  function updateSummary() {
    var aggregatedSummary = "";

    if (props.errorJson && props.errorJson.errors && props.errorJson.errors.length > 1) {
      aggregatedSummary += "There have been multiple errors submitting the entry: \n";
    }

    if (props.show) {
      let alerts = [];
      if (props.errorJson && null != props.errorJson.errors && props.errorJson.errors.length > 0) {
        props.errorJson.errors.forEach(error => {
          if (props.customMessage) {
            if (props.errorJson.errors.length > 1) {
              alerts.push(error.objectName + " - " + error.defaultMessage);
            } else {
              aggregatedSummary += "\n" + error.objectName + " - " + error.defaultMessage + "\n";
            }
          } else {
            if (props.errorJson.errors.length > 1) {
              alerts.push(getFormErrorMessage(props.form, error));
            } else {
              aggregatedSummary += getFormErrorMessage(props.form, error);
            }
          }
        });
        setSummary(aggregatedSummary);
      } else if (props.errorMessage) {
        setSummary(props.errorMessage);
      } else {
        setSummary(getFormErrorMessage());
      }

      setListSummary(aggregatedSummary);
      alerts.length > 1 && setListAlerts(alerts);
    }
  }

  return (
    <div>
      {props.showText ? 
        <div>
          {listAlerts.length > 0 ? (
            <>
              {listSummary}
              <ul>
                {listAlerts.map((line, index) => {
                  return <li key={index}>{line}</li>;
                })}
              </ul>
            </>
          ) : (
            summary
        )}
      </div> :
      <Alert variant="danger" show={props.show}>
        {listAlerts.length > 0 ? (
          <>
            {listSummary}
            <ul>
              {listAlerts.map((line, index) => {
                return <li key={index}>{line}</li>;
              })}
            </ul>
          </>
        ) : (
          summary
        )}
      </Alert>
    }
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
