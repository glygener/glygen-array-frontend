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

const RawdataOnImage = props => {
  let { experimentId } = useParams();
  let { imageId, enableRawdataOnImage, setEnableRawdataOnImage } = props;

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

    fetchList("listimagemetadata");
    fetchList("supportedrawfileformats");
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
      label: "RawData File",
      fileType: rawData.fileType,
      setUploadedFile: setUploadedRawDF,
      required: false
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
      label: "Raw Data File Format",
      name: "rawDataFF",
      value: rawData.rawDataFF,
      list: listSupportedRawFileFormat,
      message: "Raw Data File Format",
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
          response => {
            setEnablePrompt(false);
            history.push("/experiments/editExperiment/" + experimentId);
          },
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

  const rawDataForm = () => {
    return (
      <>
        <Modal
          show={enableRawdataOnImage}
          onHide={() => setEnableRawdataOnImage(false)}
          animation={false}
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{"Add Raw Data to Repository"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Helmet>
              <title>{head.addRawData.title}</title>
              {getMeta(head.addRawData)}
            </Helmet>
            <Container maxWidth="xl">
              <div className="page-container">
                {/* <PageHeading
                  title="Add Raw Data to Repository"
                  subTitle="Please provide the information for the new raw data."
                /> */}
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
                      <FormLabel label={"Wavelength"} />
                      <div>
                        <Form.Control
                          type="text"
                          value={rawData.wavelength}
                          name="wavelength"
                          onChange={e => setRawData({ wavelength: e.target.value })}
                        />
                      </div>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} controlId="powerLevel" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label={"Power Level"} className="required-asterik" />
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
                    <Button className="gg-btn-outline-reg" onClick={() => setEnableRawdataOnImage(false)}>
                      Cancel
                    </Button>
                    &nbsp;
                    <Button type="submit" className="gg-btn-blue-reg">
                      Submit
                    </Button>
                  </div>
                </Form>
              </div>
            </Container>
          </Modal.Body>
          <Loading show={showLoading} />
        </Modal>
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
