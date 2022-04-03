import React, { useState, useReducer } from "react";
import { Row, Col, Accordion, Card, Button, Modal, Form } from "react-bootstrap";
import { ContextAwareToggle } from "../utils/commonUtils";
import ReactTable from "react-table";
import { useHistory, useParams } from "react-router-dom";
import { LineTooltip } from "./tooltip/LineTooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ResumableUploader } from "./ResumableUploader";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import { FormLabel } from "../components/FormControls";

const FilesOnExp = props => {
  let { experimentId } = useParams();

  const [uploadedFile, setUploadedFile] = useState();
  const [validated, setValidated] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [showFileModal, setShowFileModal] = useState(false);

  const history = useHistory();

  const fileDetails = {
    type: "",
    description: ""
  };

  const [file, setFile] = useReducer((state, newState) => ({ ...state, ...newState }), fileDetails);

  const getFileBody = () => {
    function handleSubmit(e) {
      debugger;
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
            fileFormat: uploadedFile.fileFormat
            // description: file.description
          },
          response => {
            setShowLoading(false);
            setShowFileModal(false);
            history.push("/experiments/editExperiment/" + experimentId);
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

    return (
      <>
        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <Form.Group as={Row} controlId={"file"} className="gg-align-center mt-0 pt-0">
            <Col xs={12} lg={9}>
              <ResumableUploader
                className="mt-0 pt-0"
                history={history}
                headerObject={{
                  Authorization: window.localStorage.getItem("token") || "",
                  Accept: "*/*"
                }}
                // fileType={data.fileType}
                uploadService={getWsUrl("upload")}
                maxFiles={1}
                setUploadedFile={setUploadedFile}
                onProcessFile={fileId => {}}
                required={true}
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

          <Form.Group as={Row} controlId={"description"} className="gg-align-center mt-0 pt-0">
            <Col xs={12} lg={9}>
              <FormLabel label="Description" />
              <Form.Control
                name="description"
                type="textbox"
                placeholder="description"
                value={file.description}
                onChange={() => {}}
              />
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
            <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
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
        <ReactTable
          data={props.files}
          columns={[
            {
              Header: "File name",
              accessor: "originalName"
            },
            {
              Header: "File type",
              accessor: "fileFormat"
            },
            {
              Header: "Size",
              accessor: "fileSize"
            },
            {
              Header: "Description",
              accessor: "fileDescription"
            },
            {
              Header: "Actions",
              Cell: (row, index) => (
                <div style={{ textAlign: "center" }}>
                  <LineTooltip text="Delete File">
                    <span>
                      <FontAwesomeIcon
                        key={"delete" + index}
                        icon={["far", "trash-alt"]}
                        size="lg"
                        title="Delete"
                        className="caution-color table-btn"
                        onClick={() => props.delete(row.original.id, props.deleteWsCall)}
                      />
                    </span>
                  </LineTooltip>
                </div>
              ),
              minWidth: 60
            }
          ]}
          className={"-striped -highlight"}
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
                <span className="descriptor-header"> {"Other file"}</span>
              </Col>

              <Col style={{ textAlign: "right" }}>
                <ContextAwareToggle eventKey={0} classname={"font-awesome-color"} />
              </Col>
            </Row>
          </Card.Header>
          <Accordion.Collapse eventKey={0}>
            <Card.Body>
              <div className="text-center mt-2 mb-4">
                <Button className="gg-btn-blue" onClick={() => setShowFileModal(true)}>
                  Add File
                </Button>
              </div>
              {fileTableOnExp()}
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      {showFileModal && getAddFileModal()}
    </>
  );
};

export { FilesOnExp };
