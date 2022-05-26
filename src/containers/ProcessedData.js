import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "../containers/ProcessedData.css";
import { wsCall } from "../utils/wsUtils";
import { Col } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ProcessedData = props => {
  const history = useHistory();
  const [selectedId, setSelectedId] = useState("");
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [processDataRestart, setProcessDataRestart] = useState({});
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [timeRemainingInMins, setTimeRemainingInMins] = useState();
  const [timeDelay, setTimeDelay] = useState();

  const cancelDelete = () => setShowDeleteModal(false);
  const cancelRestart = () => setShowRestartModal(false);

  useEffect(() => {
    wsCall(
      "delaysetting",
      "GET",
      null,
      true,
      null,
      response =>
        response.json().then(responseJson => {
          setTimeDelay(responseJson);
          // validateTimeDelay(responseJson, processData);
        }),
      wsCallFail
    );
  }, [props.experimentId]);

  const confirmDelete = () => {
    setShowDeleteModal(false);
    wsCall(
      "deleteprocesseddata",
      "DELETE",
      { qsParams: { datasetId: props.experimentId }, urlParams: [selectedId] },
      true,
      null,
      () => {
        props.enableRefreshOnAction(true);
      },
      wsCallFail
    );
  };

  const confirmRestart = () => {
    setShowRestartModal(false);
    wsCall(
      "updateprocesseddata",
      "POST",
      { arraydatasetId: props.experimentId },
      true,
      processDataRestart,
      () => {},
      wsCallFail
    );
  };

  const validateTimeDelay = processData => {
    let currentDate = new Date();
    let startDate = new Date(processData.startDate);

    let currentTime = currentDate.getTime();
    let startTime = startDate.getTime();

    let startAndCurrentTimeDifferenceInMilliSeconds = currentTime - startTime;
    let timeDelayInMilliSeconds = timeDelay * 1000;

    // if (startAndCurrentTimeDifferenceInMilliSeconds > timeDelayInMilliSeconds) {
    //   setShowRestartModal(true);
    //   setProcessDataRestart(processData);
    // } else {

    let timeRemaining = ((timeDelayInMilliSeconds - startAndCurrentTimeDifferenceInMilliSeconds) / 60000).toFixed(0);
    if (timeRemaining < 0) {
      setTimeRemainingInMins(timeRemaining);
    }
    // }
  };

  function wsCallFail(response) {
    response.json().then(response => {
      setPageErrorsJson(response);
      setPageErrorMessage("");
    });

    setShowErrorSummary(true);
    setShowDeleteModal(false);
  }

  return (
    <>
      {showErrorSummary === true && (
        <ErrorSummary
          show={showErrorSummary}
          form="glygenTable"
          errorJson={pageErrorsJson}
          errorMessage={pageErrorMessage}
        />
      )}

      {/* {timeRemainingInMins !== 0 && (
        <Alert key={0} variant={"warning"}>
          {`Please wait for ${timeRemainingInMins} minutes to Resubmit the process data!`}
        </Alert>
      )} */}

      <ReactTable
        data={props.data}
        columns={[
          {
            Header: "ID",
            accessor: "id"
          },
          {
            Header: "Status",
            accessor: "status"
          },

          {
            Header: "Errors in File",
            // eslint-disable-next-line react/display-name
            Cell: (row, index) => (
              <>
                {row.original.status === "ERROR" && row.original.error && row.original.error.errors.length > 0 && (
                  <Col md={12}>
                    {row.original.error.errors.length} {row.original.error.errors.length === 1 ? `Error` : `Errors`}
                    &nbsp;&nbsp;
                    <FontAwesomeIcon
                      key={"error" + index}
                      icon={["fas", "exclamation-triangle"]}
                      size="xs"
                      title="Errors in file"
                      className={"caution-color table-btn"}
                      style={{
                        paddingTop: "9px"
                      }}
                      onClick={() => {
                        history.push({
                          pathname: "/errorProcessData",
                          state: {
                            errorMessage: row.original.error,
                            goBack: `/experiments/editExperiment/${props.experimentId}`,
                          },
                        });
                      }}
                    />
                  </Col>
                )}
              </>
            )
          },
          {
            Header: "Action",
            // eslint-disable-next-line react/display-name
            Cell: (row, index) => (
              <>
                <Col md={12}>
                  <FontAwesomeIcon
                    key={"delete" + index}
                    icon={["far", "trash-alt"]}
                    size="lg"
                    title="Delete"
                    className="caution-color table-btn"
                    onClick={() => {
                      setShowDeleteModal(true);
                      setSelectedId(row.original["id"]);
                    }}
                  />

                  {row.original.status === "PROCESSING" && validateTimeDelay(row.original)}

                  {row.original.status === "PROCESSING" && (
                    <FontAwesomeIcon
                      key={"delete" + index}
                      icon={["fas", "redo-alt"]}
                      size="xs"
                      title="Resubmit ProcessData"
                      className={`${
                        !timeRemainingInMins || (timeRemainingInMins && timeRemainingInMins > 0)
                          ? `cursorBlock`
                          : `cursorUnblock`
                      }`}
                      onClick={() => {
                        if (timeRemainingInMins) {
                          setShowRestartModal(true);
                          setProcessDataRestart(row.original);
                        }
                      }}
                    />
                  )}
                </Col>
              </>
            )
          }
        ]}
        pageSizeOptions={[5, 10, 25]}
        defaultPageSize={5}
        pageSize={5}
        minRows={0}
        className="MyReactTableClass"
        NoDataComponent={({ state, ...rest }) =>
          !state?.loading ? (
            <p className="pt-2 text-center">
              <strong>No data available</strong>
            </p>
          ) : null
        }
        keyColumn="id"
        showPaginationTop
        sortable={true}
      />

      <ConfirmationModal
        showModal={showDeleteModal}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        body="Are you sure you want to delete?"
      />

      <ConfirmationModal
        showModal={showRestartModal}
        onCancel={cancelRestart}
        onConfirm={confirmRestart}
        title="Confirm Re-submit"
        body="Are you sure you want to Re-submit the processed Data ?"
      />
    </>
  );
};

ProcessedData.propTypes = {
  experimentId: PropTypes.string,
  data: PropTypes.array,
  enableRefreshOnAction: PropTypes.func
};

export { ProcessedData };
