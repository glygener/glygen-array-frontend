/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useReducer } from "react";
import { Row, Col, Accordion, Card, Button, Modal, Form } from "react-bootstrap";
import { ContextAwareToggle, getToolTip, downloadSpinnerBottomSide } from "../utils/commonUtils";
import { useHistory, useParams } from "react-router-dom";
import { LineTooltip } from "./tooltip/LineTooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ResumableUploader } from "./ResumableUploader";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import { downloadFile } from "../utils/commonUtils";
import { FormLabel } from "../components/FormControls";
import { getCommentsToolTip } from "./GlygenTable";
import { ErrorSummary } from "./ErrorSummary";
import CardLoader from "./CardLoader";
import ReactTable from "react-table";
import "react-table/react-table.css";

const FilesOnExp = props => {
  let { experimentId } = useParams();

  const [uploadedFile, setUploadedFile] = useState();
  const [validated, setValidated] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [showFileModal, setShowFileModal] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  var base = process.env.REACT_APP_BASENAME;

  const history = useHistory();

  const fileDetails = {
    type: "",
    description: ""
  };

  const [file, setFile] = useReducer((state, newState) => ({ ...state, ...newState }), fileDetails);

  function downloadFailure(response) {
    props.setEnableErrorDialogue(true);
    props.setErrorMessageDialogueText("");
    props.setShowSpinner(false);
  }

  const getFileBody = () => {
    function handleSubmit(e) {
      uploadedFile.fileFormat = file.type;

      setValidated(true);

      if (e.currentTarget.checkValidity()) {
        setShowLoading(true);

        setShowErrorSummary(false);

        wsCall(
          "addfileonexperiment",
          "POST",
          {
            arraydatasetId: experimentId
          },
          true,
          {
            identifier: uploadedFile.identifier,
            originalName: uploadedFile.originalName,
            fileFolder: uploadedFile.fileFolder,
            fileFormat: uploadedFile.fileFormat,
            description: file.description
          },
          response => {
            setShowFileModal(false);
            props.getExperiment();
            setShowLoading(false);
          },
          fileOnExpFailure
        );
      }

      e.preventDefault();
    }

    function fileOnExpFailure(response) {
      response.json().then(responseJson => {
        setPageErrorsJson(responseJson);
        setShowErrorSummary(true);
        setPageErrorMessage("");
        setShowLoading(false);
      });
    }

    function maxFileSizeErrorCallback() {
      setPageErrorMessage("Max file size of 100MB exceeded");
      setShowErrorSummary(true);
    }

    return (
      <>
        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="supplementaryfiles"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}

        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <Form.Group as={Row} controlId={"file"} className="gg-align-center mt-0 pt-0">
            <Col xs={12} lg={9}>
              <ResumableUploader
                className="mt-0 pt-0"
                history={history}
                headerObject={{
                  Authorization: window.localStorage.getItem(base ? base + "_token" : "token") || "",
                  Accept: "*/*"
                }}
                // fileType={data.fileType}
                uploadService={getWsUrl("upload")}
                maxFiles={1}
                setUploadedFile={setUploadedFile}
                onProcessFile={fileId => {}}
                required={true}
                maxFileSize={100 * 1024 * 1024}
                maxFileSizeErrorCallback={maxFileSizeErrorCallback}
                setShowErrorSummary={setShowErrorSummary}
                // filetypes={["jpg", "jpeg", "png", "tiff"]}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId={"fileType"} className="gg-align-center mt-0 pt-0">
            <Col xs={12} lg={9}>
              <FormLabel label="File Type" />
              <Form.Control
                name="fileType"
                type="text"
                placeholder="File type"
                value={file.type}
                onChange={e => {
                  setFile({ type: e.target.value });
                }}
                maxLength={128}
                isInvalid={validated}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="description" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Comment" />
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                placeholder="Enter description"
                value={file.description}
                onChange={e => {
                  setFile({ description: e.target.value });
                }}
                maxLength={2000}
              />
              <div className="text-right text-muted">{file.description.length}/2000</div>
            </Col>
          </Form.Group>

          <div className="mt-4 mb-4 text-center">
            <Button
              className="gg-btn-outline mt-2 gg-mr-20"
              onClick={() => {
                setShowFileModal(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20" disabled={!uploadedFile || !file.type}>
              Submit
            </Button>
          </div>
        </Form>
      </>
    );
  };

  const getAddFileModal = () => {
    return (
      <>
        <Modal
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={showFileModal}
          onHide={() => setShowFileModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Add File</Modal.Title>
          </Modal.Header>
          <Modal.Body>{getFileBody()} </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </>
    );
  };

  const fileTableOnExp = () => {
    return (
      <>
        {showSpinner && downloadSpinnerBottomSide()}
        <ReactTable
          data={props.files}
          columns={[
            {
              Header: "File Name",
              accessor: "originalName",
              Cell: (row, index) => {
                return getToolTip(row.original.originalName);
              },
              sortable: true
            },
            {
              Header: "File Type",
              accessor: "fileFormat",
              Cell: (row, index) => {
                return getToolTip(row.original.fileFormat);
              },
              sortable: true
            },
            {
              Header: "File Size in KB",
              accessor: "fileSize",
              sortable: true,
              Cell: (row, index) => {
                return row.original && (row.original.fileSize / 1024).toFixed(2);
              }
            },
            {
              Header: "Description",
              sortable: false,
              Cell: (row, index) => {
                return row.value || (row.original.description && row.original.description !== "") ? (
                  getCommentsToolTip(row, false, index)
                ) : (
                  <div key={index}></div>
                );
              }
            },
            {
              Header: "Actions",
              Cell: (row, index) => {
                return (
                  <>
                    <div style={{ textAlign: "center" }}>
                      {!props.fromPublicDatasetPage && <LineTooltip text="Delete File">
                        <span>
                          <FontAwesomeIcon
                            key={"delete" + index}
                            icon={["far", "trash-alt"]}
                            size="lg"
                            title="Delete"
                            className="caution-color table-btn"
                            onClick={() => props.delete(row.original.identifier, props.deleteWsCall)}
                          />
                        </span>
                      </LineTooltip>}

                      {row.original && row.original.originalName && (
                        <LineTooltip text="Download File">
                          <span>
                            <FontAwesomeIcon
                              className="tbl-icon-btn download-btn"
                              icon={["fas", "download"]}
                              size="lg"
                              onClick={() => {
                                downloadFile(
                                  {
                                    fileFolder: row.original.fileFolder,
                                    originalName: row.original.originalName,
                                    identifier: row.original.identifier
                                  },
                                  props.setPageErrorsJson,
                                  props.setPageErrorMessage,
                                  props.setShowErrorSummary,
                                  "filedownload",
                                  setShowSpinner,
                                  downloadFailure
                                );
                              }}
                            />
                          </span>
                        </LineTooltip>
                      )}
                    </div>
                  </>
                );
              },
              minWidth: 60
            }
          ]}
          className={"-striped -highlight MyReactTableClass"}
          defaultPageSize={5}
          minRows={0}
          NoDataComponent={({ state, ...rest }) =>
            !state?.loading ? (
              <p className="pt-2 text-center">
                <strong>No data available </strong>
              </p>
            ) : null
          }
          showPaginationTop
        />
      </>
    );
  };

  return (
    <>
      <Accordion defaultActiveKey={0} className="mb-4">
        <Card>
          <Card.Header>
            <Row>
              <Col className="font-awesome-color" style={{ textAlign: "left" }}>
                <span className="descriptor-header"> {"Supplementary Files"}</span>
              </Col>

              <Col style={{ textAlign: "right" }}>
                <ContextAwareToggle eventKey={0} classname={"font-awesome-color"} />
              </Col>
            </Row>
          </Card.Header>
          <Accordion.Collapse eventKey={0}>
            <Card.Body>
              {!props.fromPublicDatasetPage && (
                <div className="text-center mt-2 mb-4">
                  <Button
                    className="gg-btn-blue"
                    onClick={() => {
                      setFile(fileDetails);
                      setShowFileModal(true);
                    }}
                  >
                    Add File
                  </Button>
                </div>
              )}

              {fileTableOnExp()}

              {showLoading ? <CardLoader pageLoading={showLoading} /> : ""}
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      {showFileModal && getAddFileModal()}
    </>
  );
};

export { FilesOnExp };
