import React, { useState, useEffect } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { ErrorSummary } from "../components/ErrorSummary";
import CardLoader from "../components/CardLoader";

const SubmitterDetails = props => {
  const [submitterinfo, setSubmitterinfo] = useState();
  const [showloading, setShowloading] = useState(true);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  useEffect(() => {
    wsCall(
      props.wsCall,
      "GET",
      [props.username],
      false,
      null,
      response =>
        response.json().then(responseJson => {
          setSubmitterinfo(responseJson);
          setShowloading(false);
        }),
      errorWscall
    );

    function errorWscall(response) {
      response.json().then(responseJson => {
        console.log(responseJson);
        setPageErrorsJson(responseJson);
        setPageErrorMessage("");
        setShowErrorSummary(true);
        setShowloading(false);
      });
    }
  }, [props.username, props.wsCall]);

  return (
    <>
      <ErrorSummary
        show={showErrorSummary}
        form="experiments"
        errorJson={pageErrorsJson}
        errorMessage={pageErrorMessage}
      />
      <CardLoader pageLoading={showloading} />

      {submitterinfo ? (
        <>
          <div>
            <strong>Username: </strong>
            {submitterinfo.userName}
          </div>
          <div>
            <strong>Full Name: </strong>
            <span
              style={{ textTransform: "capitalize" }}
            >{`${submitterinfo.firstName} ${submitterinfo.lastName}`}</span>
          </div>
          {submitterinfo.groupName && (
            <div>
              <strong>Group Name: </strong>
              {submitterinfo.groupName}
            </div>
          )}
          {submitterinfo.department && (
            <div>
              <strong>Department: </strong>
              {submitterinfo.department}
            </div>
          )}
          {submitterinfo.affiliation && (
            <div>
              <strong>Institution: </strong>
              {submitterinfo.affiliation}
            </div>
          )}
        </>
      ) : (
        <span>No data available</span>
      )}
    </>
  );
};

SubmitterDetails.propTypes = {
  username: PropTypes.string,
  wsCall: PropTypes.string
};

export default SubmitterDetails;
