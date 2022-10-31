import React, { useEffect, useState } from "react";
import "../components/ErrorSummary.css";
import PropTypes from "prop-types";
import { Button, Modal } from "react-bootstrap";
import { batchupload } from "../utils/commonUtils";
import { ErrorPage } from "./ErrorPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const StatusMessage = props => {

  const [errorMessage, setErrorMessage] = useState("");
  const [enableErrorView, setEnableErrorView] = useState(false);
  const [batchUploadResponse, setBatchUploadResponse] = useState();

  const errorMessageTable = props => {
    return (
      <>
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={enableErrorView}
        onHide={() => setEnableErrorView(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Errors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorPage
            experimentId={"experimentId"}
            errorMessage={errorMessage}
            setEnableErrorView={setEnableErrorView}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button className="gg-btn-blue-reg" onClick={() => {
              setEnableErrorView(false);
              updateBatchUpload();
              props.setBatchUpload(false);
            }
          }>
            Mark Read
          </Button>
        </Modal.Footer>
      </Modal>
    </>
    );
  };

  useEffect(() => {
    batchupload("checkbatchupload", "GET", props.uploadtype, props.moleculetype,  setBatchUploadResponse, props.setBatchUpload);
  }, []);

  useEffect(() => {
    if (batchUploadResponse && batchUploadResponse.status === "DONE") {
      setTimeout(()=>{
        updateBatchUpload();
      }, 15000)
    } 
  }, [batchUploadResponse]);


  const updateBatchUpload = () => {
    batchupload("updatebatchupload", "GET", props.uploadtype);
  }

  return (
    <div>
      {enableErrorView && errorMessageTable()}

      <div st1yle={{ textAlign: "center" }}  className="mt-3 mb-3">
        {batchUploadResponse && batchUploadResponse.status !== "DONE" ? (<div style={{ textAlign: "center" }}>
          <span>
            {batchUploadResponse.status &&
            batchUploadResponse.status === "ERROR" &&
            batchUploadResponse.error &&
            batchUploadResponse.error.errors.length > 0 ? (
              <span>
                <strong>Status:</strong>&nbsp;{"Batch upload errors"}
                  &nbsp;&nbsp;
                  <span
                    onClick={() => {
                      setErrorMessage(batchUploadResponse.error);
                      setEnableErrorView(true);
                    }}
                  >
                    <FontAwesomeIcon
                      key={"error"}
                      icon={["fas", "exclamation-triangle"]}
                      size="xs"
                      className={"caution-color table-btn"}
                      style={{
                        paddingTop: "9px"
                      }}
                    />
                  </span>
                </span>
            ) : (
              <span>
              <strong>Status:</strong>&nbsp;{"Batch upload in process"}
              &nbsp;&nbsp;
              <FontAwesomeIcon
                key={"error"}
                icon={["fas", "exclamation-triangle"]}
                size="xs"
                className={"warning-color table-btn"}
                style={{
                  paddingTop: "9px"
                }}
              />
              </span>
            )}
          </span>
        </div>) : (batchUploadResponse && batchUploadResponse.status === "DONE" ? (
          <span>
          <strong>Status:</strong>&nbsp;{"Upload completed successfully"}
          </span>
        ) : (batchUploadResponse && batchUploadResponse.status === "DEFAULT" ? 
            <span><strong>Status:</strong>&nbsp;{"Failed checking active batch uploads"}</span> : <></>
          )
        )}
      </div>
      <div>
      </div>
    </div>
  );
};

StatusMessage.propTypes = {
  setBatchUpload: PropTypes.bool,
  uploadtype: PropTypes.string,
  moleculetype: PropTypes.string,
};

export { StatusMessage };
