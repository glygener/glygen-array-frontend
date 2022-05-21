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
  }, [props.username]);

  return (
    <>
      <ErrorSummary
        show={showErrorSummary}
        form="experiments"
        errorJson={pageErrorsJson}
        errorMessage={pageErrorMessage}
      />
      <CardLoader pageLoading={showloading} />

      {/* Username
    Name (First name, Last name) + Have a website icon that links to the user website

Group name (if provided)

Department (if provided)

Organization/Institution */}

      {submitterinfo ? (
        <>
          <div style={{ textAlign: "left", marginLeft: "15px" }}>
            <span className={"dataset-subheadings"}>Username</span>
            <div>{submitterinfo.userName}</div>
            <br />

            <span className={"dataset-subheadings"}>Name</span>
            <div
              style={{
                textTransform: "uppercase"
              }}
            >
              {`${submitterinfo.firstName}, ${submitterinfo.lastName}`}
            </div>
            <br />

            <span className={"dataset-subheadings"}>Group name</span>
            <div>{submitterinfo.groupName}</div>
            <br />

            <span className={"dataset-subheadings"}>Department</span>
            <div>{submitterinfo.department}</div>
            <br />

            <span className={"dataset-subheadings"}>Institution</span>
            <div>{submitterinfo.affiliation}</div>
            <br />
          </div>
        </>
      ) : (
        <h4 style={{ paddingTop: "50px" }}>No Data Available</h4>
      )}
    </>
  );
};

SubmitterDetails.propTypes = {
  username: PropTypes.string,
  wsCall: PropTypes.string
};

export default SubmitterDetails;
