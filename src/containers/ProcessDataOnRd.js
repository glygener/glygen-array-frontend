import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { head, getMeta } from "../utils/head";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import { useHistory, Prompt, useParams } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import React, { useEffect, useState, useReducer } from "react";
import { ResumableUploader } from "../components/ResumableUploader";
import { Form, Row, Col } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
import Container from "@material-ui/core/Container";
import "../components/SpotInformation.css";
import { Modal, Button } from "react-bootstrap";
import { Loading } from "../components/Loading";
import "./AddRawData.css";
import { downloadFile, exportFileProcessData } from "../utils/commonUtils";
import { DownloadButton } from "../components/DownloadButton";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { ViewDescriptor } from "../components/ViewDescriptor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ProcessDataOnRd = props => {
  let { experimentId } = useParams();
  let { rawDataId, enableProcessRawdata, setEnableProcessRawdata, processDataView, setProcessDataView } = props;

  const history = useHistory();

  const [uploadedDF, setUploadedDF] = useState();
  const [uploadedExclusiveFile, setUploadedExclusiveFile] = useState();
  const [showLoading, setShowLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [enablePrompt, setEnablePrompt] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [listDataProcessing, setListDataProcessing] = useState([]);
  const [statisticalMethods, setStatisticalMethods] = useState([]);
  const [supportedProcessedFF, setSupportedProcessedFF] = useState([]);
  const [showDescriptos, setShowDescriptos] = useState(false);

  const defaultFileType = "*/*";

  const processedDataState = {
    id: "",
    dataProcessing: "",
    statisticalMethod: "",
    supportedProcessedFF: "",
    fileType: defaultFileType
  };

  const [processData, setProcessDataState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    processedDataState
  );

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    if (!props.fromPublicDatasetPage && !props.isPublic) {
      fetchList("statisticalmethods");
      fetchList("listdataprocessing");
      fetchList("supportedprocessedfileformats");
    }
  }, [experimentId]);

  const fetchList = (fetch, id) => {
    wsCall(
      fetch,
      "GET",
      !id ? { offset: "0", loadAll: false } : { qsParams: { loadAll: false }, urlParams: [id] },
      true,
      null,
      response => listSuccess(response, fetch),
      wsCallFail
    );
  };

  function wsCallFail(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setShowErrorSummary(true);
    });
  }

  function listSuccess(response, fetch) {
    response.json().then(responseJson => {
      if (fetch === "listdataprocessing") {
        setListDataProcessing(responseJson);
      } else if (fetch === "statisticalmethods") {
        setStatisticalMethods(responseJson);
      } else if (fetch === "supportedprocessedfileformats") {
        setSupportedProcessedFF(responseJson);
      }
    });
  }

  const handleSelectProcessData = e => {
    const name = e.target.name;
    const selectedValue = e.target.options[e.target.selectedIndex].value;
    setProcessDataState({ [name]: selectedValue });
  };

  const fileData = [
    {
      controlId: "fileUploader",
      label: "Process Data File",
      fileType: processData.fileType,
      setUploadedFile: setUploadedDF,
      required: false,
      maxFileSize: 20 * 1024 * 1024
    },
    {
      controlId: "fileUploader",
      label: "Exclusion List File",
      fileType: processData.fileType,
      setUploadedFile: setUploadedExclusiveFile,
      required: false
    }
  ];

  const FormData = [
    {
      label: "Data Processing",
      name: "dataProcessing",
      value: processData.dataProcessing,
      list: listDataProcessing,
      message: "Data Processing",
      onchange: handleSelectProcessData
    },
    {
      label: "Statistical Method",
      name: "statisticalMethod",
      value: processData.statisticalMethod,
      list: statisticalMethods,
      message: "Statistical Method",
      onchange: handleSelectProcessData
    },
    {
      label: "Supported Processed File Format",
      name: "supportedProcessedFF",
      value: processData.supportedProcessedFF,
      list: supportedProcessedFF,
      message: "Supported Processed File Format",
      onchange: handleSelectProcessData
    }
  ];

  function handleSubmit(e) {
    setValidated(true);

    uploadedDF.fileFormat = processData.supportedProcessedFF;

    if (e.currentTarget.checkValidity()) {
      setShowErrorSummary(false);
      wsCall(
        "addprocessdatafromexcel",
        "POST",
        {
          arraydatasetId: experimentId,
          rawdataId: rawDataId,
          metadataId: processData.dataProcessing,
          methodName: processData.statisticalMethod,
          exclusionFile: uploadedExclusiveFile.identifier
        },
        true,
        {
          identifier: uploadedDF.identifier,
          originalName: uploadedDF.originalName,
          fileFolder: uploadedDF.fileFolder,
          fileFormat: uploadedDF.fileFormat,
          fileSize: uploadedDF.fileSize
        },
        // eslint-disable-next-line no-unused-vars
        response => {
          setEnablePrompt(false);
          props.setEnableProcessRawdata(false);
          // history.push("/experiments/editExperiment/" + experimentId);
          props.getExperiment();
        },
        addRawDataFailure
      );
    }
    e.preventDefault();
  }

  function addRawDataFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setShowErrorSummary(true);
      setPageErrorMessage("");
    });
  }

  const getSelectionList = select => {
    return select.list.rows
      ? select.list.rows.map((element, index) => {
          return (
            <option key={index} value={element.id}>
              {element.name}
            </option>
          );
        })
      : select.name === "statisticalMethod"
      ? select.list.map((element, index) => {
          return (
            <option key={index} value={element.name}>
              {element.name}
            </option>
          );
        })
      : select.list.map((element, index) => {
          return (
            <option key={index} value={element}>
              {element}
            </option>
          );
        });
  };

  const getProcessDataView = () => {

    function handleDownload(type) {
      if (type === "export") {
        exportFileProcessData(
          processDataView,
          setPageErrorsJson,
          setPageErrorMessage,
          setShowErrorSummary,
          props.setShowSpinner,
          !props.fromPublicDatasetPage && !props.isPublic ? "exportprocesseddata" : "publicexportprocesseddata",
        )
      } else if (type === "download") {
        downloadFile(
          processDataView.file,
          props.setPageErrorsJson,
          props.setPageErrorMessage,
          props.setShowErrorSummary,
          !props.fromPublicDatasetPage && !props.isPublic ? "filedownload" : "publicfiledownload",
          props.setShowSpinner
        );
      }
    }

    return (
      <div>
        {showDescriptos && <ViewDescriptor metadataId={processDataView.metadata.id} showModal={showDescriptos} setShowModal={setShowDescriptos} 
          wsCall={ !props.fromPublicDatasetPage ? "getdataprocessing" : "getpublicdataprocessing"} useToken={ !props.fromPublicDatasetPage ? true : true} name={"Data Processing"}/>}
      <div style={{
          overflow: "auto",
          height: "350px",
          width: "100%"
        }}>        <Form.Group as={Row} controlId={"processdata"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Process Data"} className="required-asterik" />
          </Col>
          <Col xs={12} lg={9}>
            <span>{processDataView.file ? processDataView.file.originalName : "No data available"}</span>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"dataProcessing"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Data Processing"} className="required-asterik" />
          </Col>
          <Col xs={12} lg={9}>
            {processDataView.metadata ? <LineTooltip text="View Details">
              <Button 
                  className={"lnk-btn"}
                  variant="link"
                  onClick={() => {
                    setShowDescriptos(true);
                  }}
                >
                  {processDataView.metadata.name}
              </Button>
            </LineTooltip> : 
              <span>{"No data available"}</span>
            }
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"processDataFF"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"ProcessData Fileformat"} className="required-asterik" />
          </Col>
          <Col xs={12} lg={9}>
            <span>{processDataView.file ? processDataView.file.fileFormat : "No data available"}</span>
          </Col>
        </Form.Group>
        </div>

        <Row st1yle={{ textAlign: "center" }}  className="mt-3"  cla1ssName="gg-align-center mb-3" clas1sName={props.enableImageOnSlide ? "row_headline row_headline_act" : "row_headline"}>
        {processDataView.status !== "DONE" && <Col style={{ textAlign: "center" }}>
          <span>
            {processDataView.status &&
            processDataView.status === "ERROR" &&
            processDataView.error &&
            processDataView.error.errors.length > 0 ? (
              <>
                <Button className="gg-btn-outline mt-2 gg-mr-20"
                  onClick={() => {
                    props.setErrorMessage(processDataView.error);
                    props.setEnableErrorView(true);
                  }}
                >Show Error Details
                &nbsp;&nbsp;
                <FontAwesomeIcon
                  key={"error"}
                  icon={["fas", "exclamation-triangle"]}
                  size="xs"
                  className={"caution-color table-btn"}
                  style={{
                    paddingTop: "9px"
                  }}
                />
                </Button>
              </>
            ) : (
              <span>
              <strong>Status:</strong>&nbsp;{processDataView.status}
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
        </Col>}
        {!props.fromPublicDatasetPage && !props.isPublic && (<>
            {processDataView.id && (
              <>
                <Col style={{ textAlign: "center" }}>
                  <Button className="gg-btn-outline mt-2 gg-mr-20"                      
                      onClick={() => {
                        props.deleteRow(processDataView.id, "deleteprocessdata");
                        props.setDeleteMessage(
                          "This will remove the selected processed data. Do you want to continue?"
                        );
                        props.setShowDeleteModal(true);
                      }}>                                 
                  Delete Process Data</Button>
                </Col>
              </>
            )}
          </>)}
          <Col style={{ textAlign: "center" }}>
            <DownloadButton
              showExport={true}
              showDownload={processDataView.file !== undefined}
              handleDownload={handleDownload}
            />
          </Col>
        </Row>
        </div>
    );
  };

  function maxFileSizeErrorCallback() {
    setPageErrorMessage("Max file size of 20MB exceeded");
    setShowErrorSummary(true);
  }

  const processDataForm = () => {
    return (
      <>
        <Modal
          show={enableProcessRawdata && !processDataView}
          onHide={() => {
            setProcessDataView();
            setEnableProcessRawdata(false);
          }}
          animation={false}
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {!processDataView ? "Add Process Data to Repository" : "View Process Data Details"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Helmet>
              <title>{head.addProcessData.title}</title>
              {getMeta(head.addProcessData)}
            </Helmet>
            <Container maxWidth="xl">
              <div>
                {showErrorSummary === true && (
                  <ErrorSummary
                    show={showErrorSummary}
                    form="processdata"
                    errorJson={pageErrorsJson}
                    errorMessage={pageErrorMessage}
                  />
                )}
                {showErrorSummary === true && window.scrollTo({ top: 0, behavior: "smooth" })}
                {enablePrompt && <Prompt message="If you leave you will lose this data!" />}

                {!processDataView ? (
                  <>
                    {fileData.map((data, index) => {
                      return (
                        <Form.Group
                          as={Row}
                          controlId={data.controlId}
                          key={index + data.controlId}
                          className="gg-align-center mt-0 pt-0"
                        >
                          <Col xs={12} lg={9}>
                            <FormLabel label={data.label} className="required-asterik pb-0 mb-0" />
                            <ResumableUploader
                              className="mt-0 pt-0"
                              history={history}
                              headerObject={{
                                Authorization: window.localStorage.getItem("token") || "",
                                Accept: "*/*"
                              }}
                              fileType={data.fileType}
                              uploadService={getWsUrl("upload")}
                              maxFiles={1}
                              setUploadedFile={data.setUploadedFile}
                              onProcessFile={() => {}}
                              required={data.required}
                              maxFileSize={data.maxFileSize}
                              maxFileSizeErrorCallback={maxFileSizeErrorCallback}
                              setShowErrorSummary={setShowErrorSummary}

                              // filetypes={["jpg", "jpeg", "png", "tiff"]}
                            />
                          </Col>
                        </Form.Group>
                      );
                    })}
                    <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
                      {FormData.map((element, index) => {
                        return (
                          <Form.Group as={Row} controlId={index} key={index} className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                              <FormLabel label={element.label} className="required-asterik" />
                              <Form.Control
                                as="select"
                                name={element.name}
                                value={element.value}
                                onChange={element.onchange}
                                required={true}
                              >
                                <option value="">Select {element.label}</option>
                                {(element.list.length > 0 || (element.list.rows && element.list.rows.length > 0)) &&
                                  getSelectionList(element)}
                              </Form.Control>
                              <Feedback message={`${element.message} is required`} />
                            </Col>
                          </Form.Group>
                        );
                      })}

                      <div className="text-center mb-4 mt-4">
                        <Button
                          className="gg-btn-outline mt-2 gg-mr-20"
                          onClick={() => {
                            setProcessDataView();
                            setEnableProcessRawdata(false);
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
                ) : (
                  getProcessDataView()
                )}
              </div>
            </Container>
          </Modal.Body>
          {processDataView && (
            <Modal.Footer>
              <Button
                className="gg-btn-blue-reg"
                onClick={() => {
                  setProcessDataView();
                  setEnableProcessRawdata(false);
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          )}
          <Loading show={showLoading} />
        </Modal>
        <div>
      {processDataView && getProcessDataView()}
      </div>
      </>
    );
  };

  return <>{processDataForm()}</>;
};

ProcessDataOnRd.propTypes = {
  authCheckAgent: PropTypes.func,
  match: PropTypes.object
};

export { ProcessDataOnRd };
