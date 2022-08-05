import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { head, getMeta } from "../utils/head";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import { useHistory, Prompt, useParams } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import React, { useEffect, useState, useReducer } from "react";
import { ResumableUploader } from "../components/ResumableUploader";
import { Form, Row, Col, Modal, Button } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
import RangeSlider from "react-bootstrap-range-slider";
import "../components/SpotInformation.css";
import Container from "@material-ui/core/Container";
import { Loading } from "../components/Loading";
import "./AddRawData.css";
import { downloadFile } from "../utils/commonUtils";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spacing from "material-ui/styles/spacing";
import { DownloadButton } from "../components/DownloadButton";
import { ViewDescriptor } from "../components/ViewDescriptor";

const RawdataOnImage = props => {
  let { experimentId } = useParams();
  let { imageId, enableRawdataOnImage, setEnableRawdataOnImage, rawDataView, setRawDataView } = props;

  const history = useHistory();
  const [validated, setValidated] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [uploadedRawDF, setUploadedRawDF] = useState();
  const [enablePrompt, setEnablePrompt] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [sliderInvalid, setSliderInvalid] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [listImageAnalysis, setListImageAnalysis] = useState([]);
  const [listSupportedRawFileFormat, setListSupportedRawFileFormat] = useState([]);
  const [showDescriptos, setShowDescriptos] = useState(false);

  const [listChannelUsageTypes, setListChannelUsageTypes] = useState(["Data", "Alignment", "Data_and_Alignment"]);

  const defaultFileType = "*/*";

  const rawDataState = {
    id: "",
    imageAnalysis: "",
    rawDataFF: "",
    fileType: defaultFileType,
    wavelength: "",
    channelUsageType: "",
    powerLevel: 0
  };

  const [rawData, setRawData] = useReducer((state, newState) => ({ ...state, ...newState }), rawDataState);

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    if (!props.fromPublicDatasetPage && !props.isPublic) {
      fetchList("listimagemetadata");
      fetchList("supportedrawfileformats");
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
      if (fetch === "listimagemetadata") {
        setListImageAnalysis(responseJson);
      } else if (fetch === "supportedrawfileformats") {
        setListSupportedRawFileFormat(responseJson);
      }
    });
  }

  const handleChangeSlider = changeEvent => {
    setRawData({ powerLevel: parseInt(changeEvent.target.value) });
    parseInt(changeEvent.target.value) === 0 ? setSliderInvalid(true) : setSliderInvalid(false);
  };

  const fileData = [
    {
      controlId: "fileUploader",
      label: "Raw Data File",
      fileType: rawData.fileType,
      setUploadedFile: setUploadedRawDF,
      required: false,
      maxFileSize: 20 * 1024 * 1024
    }
  ];

  const handleSelect = e => {
    const name = e.target.name;
    const selectedValue = e.target.options[e.target.selectedIndex].value;

    setRawData({ [name]: selectedValue });
  };

  const FormData = [
    {
      label: "Image Analysis",
      name: "imageAnalysis",
      value: rawData.imageAnalysis,
      list: listImageAnalysis,
      message: "Image Analysis",
      onchange: handleSelect
    },
    {
      label: "Channel Usage Type",
      name: "channelUsageType",
      value: rawData.channelUsageType,
      list: listChannelUsageTypes,
      message: "Channel Usage Type",
      onchange: handleSelect
    }
  ];

  const getChannelType = type => {
    switch (type) {
      case "Data":
        return "DATA";
      case "Alignment":
        return "ALIGNMENT";
      case "Data_and_Alignment":
        return "DATA_AND_ALIGNMENT";

      default:
        return "DATA";
    }
  };

  function handleSubmit(e) {
    setValidated(true);
    uploadedRawDF.fileFormat = rawData.rawDataFF;

    if (e.currentTarget.checkValidity()) {
      if (rawData.powerLevel === 0) {
        setSliderInvalid(true);
      } else if (uploadedRawDF) {
        setShowErrorSummary(false);
        wsCall(
          "addrawdata",
          "POST",
          { arraydatasetId: experimentId, imageId: imageId },
          true,
          {
            metadata: {
              name: rawData.imageAnalysis
            },
            file: uploadedRawDF,
            channel: {
              wavelength: rawData.wavelength,
              usage: getChannelType(rawData.channelUsageType)
            },
            powerLevel: rawData.powerLevel
          },
          // eslint-disable-next-line no-unused-vars
          response => response.text().then((body) => {
            setEnablePrompt(false);
            setEnableRawdataOnImage(false);
            props.getExperiment({slideID:props.parent.slideID, imageID:props.parent.imageID, rawDataID:body});
          }),
          addRawDataFailure
        );
      } else {
        setValidated(false);
        setPageErrorMessage("File is required. Please choose a file.");
        setShowErrorSummary(true);
      }
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
            <option key={index} value={element.name}>
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

  function downloadFailure(response) {
    props.setEnableErrorDialogue(true);
    props.setErrorMessageDialogueText("");
    props.setShowSpinner(false);
  }

  const getRawDataView = () => {

    function handleDownload(type) {
      if (type === "download") {
        downloadFile(
          rawDataView.file,
          null,
          null,
          null,
          !props.fromPublicDatasetPage ? "filedownload" : "publicfiledownload",
          props.setShowSpinner,
          downloadFailure
        );
      }
    }

    return (
      <div>
        {showDescriptos && <ViewDescriptor metadataId={rawDataView.metadata.id} showModal={showDescriptos} setShowModal={setShowDescriptos} 
          wsCall={ !props.fromPublicDatasetPage ? "getimageanalysis" : "getpublicimageanalysis"} useToken={ !props.fromPublicDatasetPage ? true : true} name={"Image Analysis"}/>} 
      <div style={{
          overflow: "auto",
          height: "350px",
          width: "100%"
        }}>
        <Form.Group as={Row} controlId={"rawdataFF"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Raw Data File Format"} className="required-asterik" />
          </Col>
          <Col xs={12} lg={9}>
            <span>{rawDataView.file ? rawDataView.file.fileFormat : "No data available"}</span>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"image"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Raw Data"} className="required-asterik" />
          </Col>
          <Col xs={12} lg={9}>
            <span>{rawDataView.file ? rawDataView.file.originalName : "No data available"}</span>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"imageAnalysis"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Image Analysis"} className="required-asterik" />
          </Col>
          <Col xs={12} lg={9}>
            {rawDataView.metadata ? <LineTooltip text="View Details">
                <Button 
                    className={"lnk-btn lnk-btn-left"}
                    variant="link"
                    onClick={() => {
                      setShowDescriptos(true);
                    }}
                  >
                    {rawDataView.metadata.name}
                </Button>
              </LineTooltip> : 
                <span>{"No data available"}</span>
              }
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"powerLevel"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Power Level"} className="required-asterik" />
          </Col>
          <Col xs={12} lg={9}>
            <span>{rawDataView.powerLevel ? rawDataView.powerLevel : "No data available"}</span>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"channelUsageType"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Channel Usage Type"} className="required-asterik" />
          </Col>
          <Col xs={12} lg={9}>
            <span>{rawDataView.channel ? rawDataView.channel.usage : "No data available"}</span>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"wavelength"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Wave Length"} className="required-asterik" />
          </Col>
          <Col xs={12} lg={9}>
            <span>{rawDataView.channel ? rawDataView.channel.wavelength : "No data available"}</span>
          </Col>
        </Form.Group>
        </div>

        <Row style={{ textAlign: "center" }} className="mt-3">            
          {!props.fromPublicDatasetPage && !props.isPublic && (<>
              {rawDataView.status !== "DONE" && <Col style={{ textAlign: "center" }}>
              <span>
                {rawDataView.status &&
                rawDataView.status === "ERROR" &&
                rawDataView.error &&
                rawDataView.error.errors.length > 0 ? (
                  <>
                    <Button className="gg-btn-outline mt-2 gg-mr-20"
                      onClick={() => {
                        props.setErrorMessage(rawDataView.error);
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
                  <strong>Status:</strong>&nbsp;{rawDataView.status}
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

            {rawDataView.status === "DONE" && <Col style={{ textAlign: "center" }}>
            <Button className="gg-btn-outline mt-2 gg-mr-20"
              onClick={() => {
                props.setRawdataSelected(rawDataView.id);
                props.setEnableProcessRawdata(true);
              }}
            >Add Process Data</Button>
            </Col>}
            {rawDataView.id && (
              <>
                <Col style={{ textAlign: "center" }}>
                <Button className="gg-btn-outline mt-2 gg-mr-20"
                  onClick={() => {
                    props.deleteRow(rawDataView.id, "deleterawdata", {slideID:props.parent.slideID, imageID:props.parent.imageID});
                    props.setDeleteMessage(
                      "This will remove all processed data that belongs to this raw data. Do you want to continue?"
                    );
                    props.setShowDeleteModal(true);
                  }}
                >Delete Raw Data</Button>
                </Col>
                </>)}
            </>)}
            {rawDataView.file && (
              <Col style={{ textAlign: "center" }}>
                <DownloadButton
                  showExport={false}
                  showDownload={rawDataView.file !== undefined}
                  defaultType="download"
                  handleDownload={handleDownload}
                />
              </Col>
            )}
        </Row>
      </div>
    );
  };

  function maxFileSizeErrorCallback() {
    setPageErrorMessage("Max file size of 20MB exceeded");
    setShowErrorSummary(true);
  }

  const rawDataForm = () => {
    return (
      <>
        <Modal
          show={enableRawdataOnImage && !rawDataView}
          onHide={() => {
            setRawDataView();
            setEnableRawdataOnImage(false);
          }}
          animation={false}
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{!rawDataView ? "Add Raw Data to Repository" : "View Raw Data Details"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Helmet>
              <title>{head.addRawData.title}</title>
              {getMeta(head.addRawData)}
            </Helmet>
            <Container maxWidth="xl">
              <div>
                {showErrorSummary === true && (
                  <ErrorSummary
                    show={showErrorSummary}
                    form="rawdata"
                    errorJson={pageErrorsJson}
                    errorMessage={pageErrorMessage}
                  />
                )}
                {showErrorSummary === true && window.scrollTo({ top: 0, behavior: "smooth" })}
                {enablePrompt && <Prompt message="If you leave you will lose this data!" />}

                {!rawDataView ? (
                  <>
                    <Form.Group as={Row} controlId={"fileFormat"} className="gg-align-center mb-3">
                      <Col xs={12} lg={9}>
                        <FormLabel label={"Raw Data File Format"} className="required-asterik" />
                        <Form.Control
                          as="select"
                          name={"rawDataFF"}
                          value={rawData.rawDataFF}
                          onChange={handleSelect}
                          required={true}
                        >
                          <option value="">Select {"Raw Data File Format"}</option>
                          {(listSupportedRawFileFormat.length > 0 ||
                            (listSupportedRawFileFormat.rows && listSupportedRawFileFormat.rows.length > 0)) &&
                            getSelectionList({
                              label: "Raw Data File Format",
                              name: "rawDataFF",
                              value: rawData.rawDataFF,
                              list: listSupportedRawFileFormat,
                              message: "Raw Data File Format",
                              onchange: handleSelect,
                              maxFileSize: 20 * 1024 * 1024
                            })}
                        </Form.Control>
                        <Feedback message={"Raw Data File Format is required"} />
                      </Col>
                    </Form.Group>

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
                              onProcessFile={fileId => {}}
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

                      <Form.Group as={Row} controlId="wavelengths" className="gg-align-center mb-3">
                        <Col xs={12} lg={9}>
                          <FormLabel label="Wave Length" />
                          <Form.Control
                            type="text"
                            value={rawData.wavelength}
                            name="wavelength"
                            onChange={e => setRawData({ wavelength: e.target.value })}
                          />
                        </Col>
                      </Form.Group>

                      <Form.Group as={Row} controlId="powerLevel" className="gg-align-center mb-3">
                        <Col xs={12} lg={9}>
                          <FormLabel label="Power Level" className="required-asterik" />
                          <div>
                            <RangeSlider
                              value={rawData.powerLevel}
                              name="powerLevel"
                              onChange={changeEvent => handleChangeSlider(changeEvent)}
                              tooltipLabel={currentValue => `${currentValue}%`}
                              tooltip="on"
                              variant="danger"
                            />
                          </div>
                          <p className={sliderInvalid ? "error-form-invalid" : "range-slider-errorMessage"}>
                            Power Level is required
                          </p>
                        </Col>
                      </Form.Group>
                      <div className="mt-4 mb-4 text-center">
                        <Button
                          className="gg-btn-outline mt-2 gg-mr-20"
                          onClick={() => {
                            setRawDataView();
                            setEnableRawdataOnImage(false);
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
                  getRawDataView()
                )}
              </div>
            </Container>
          </Modal.Body>
          {rawDataView && (
            <Modal.Footer>
              <Button
                className="gg-btn-blue-reg"
                onClick={() => {
                  setRawDataView();
                  setEnableRawdataOnImage(false);
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          )}
          <Loading show={showLoading} />
        </Modal>
        <div>
      {rawDataView && getRawDataView()}
      </div>
      </>
    );
  };

  return <>{rawDataForm()}</>;
};

RawdataOnImage.propTypes = {
  authCheckAgent: PropTypes.func,
  match: PropTypes.object
};

export { RawdataOnImage };
