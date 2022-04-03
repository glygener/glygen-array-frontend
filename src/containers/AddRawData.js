import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { head, getMeta } from "../utils/head";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import { useHistory, Prompt, useParams, Link } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import React, { useEffect, useState, useReducer } from "react";
import { ResumableUploader } from "../components/ResumableUploader";
import { Form, Row, Col, Modal, Popover } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
import RangeSlider from "react-bootstrap-range-slider";
import { GlygenTable } from "../components/GlygenTable";
import "../components/SpotInformation.css";
import "./AddRawData.css";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Button } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";

const AddRawData = props => {
  let { experimentId } = useParams();

  const history = useHistory();
  const [blocks, setBlocks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [uploadedRawDF, setUploadedRawDF] = useState();
  const [imageUploaded, setImageUploaded] = useState();
  let [blocksSelected, setBlocksSelected] = useState([]);
  const [enablePrompt, setEnablePrompt] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [sliderInvalid, setSliderInvalid] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  let [totalBlocksSelected, setTotalBlocksSelected] = useState([]);
  const [uploadedDF, setUploadedDF] = useState();

  const [listScannerMetas, setListScannerMetas] = useState([]);
  const [listImageAnalysis, setListImageAnalysis] = useState([]);
  const [listSlide, setListSlide] = useState([]);
  const [listSupportedRawFileFormat, setListSupportedRawFileFormat] = useState([]);
  const [listAssayMetas, setListAssayMetas] = useState([]);
  const [listDataProcessing, setListDataProcessing] = useState([]);
  const [statisticalMethods, setStatisticalMethods] = useState([]);
  const [supportedProcessedFF, setSupportedProcessedFF] = useState([]);

  const defaultFileType = "*/*";

  const rawDataState = {
    id: "",
    scanner: "",
    slide: "",
    imageAnalysis: "",
    rawDataFF: "",
    assayMetadata: "",
    fileType: defaultFileType,
    powerLevel: 0,
    processData: {
      dataProcessing: "",
      statisticalMethod: "",
      supportedProcessedFF: "",
      fileType: defaultFileType,
    },
  };

  const [rawData, setRawData] = useReducer((state, newState) => ({ ...state, ...newState }), rawDataState);

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    fetchList("listallprintedslide");
    fetchList("listscanners");
    fetchList("listimagemetadata");
    fetchList("listassaymetadata");
    fetchList("supportedrawfileformats");
    fetchList("statisticalmethods");
    fetchList("listdataprocessing");
    fetchList("supportedprocessedfileformats");
    console.log("byeee");
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
      if (fetch === "listallprintedslide") {
        setListSlide(responseJson);
      } else if (fetch === "listscanners") {
        setListScannerMetas(responseJson);
      } else if (fetch === "listimagemetadata") {
        setListImageAnalysis(responseJson);
      } else if (fetch === "supportedrawfileformats") {
        setListSupportedRawFileFormat(responseJson);
      } else if (fetch === "listassaymetadata") {
        setListAssayMetas(responseJson);
      } else if (fetch === "getslidelayout") {
        if (responseJson.blocks && responseJson.blocks.length > 0) {
          setBlocks(responseJson.blocks);
          setBlocksSelected(responseJson.blocks);
          setShowModal(true);
        } else {
          setBlocks([]);
          setBlocksSelected([]);
        }
      } else if (fetch === "listdataprocessing") {
        setListDataProcessing(responseJson);
      } else if (fetch === "statisticalmethods") {
        setStatisticalMethods(responseJson);
      } else if (fetch === "supportedprocessedfileformats") {
        setSupportedProcessedFF(responseJson);
      }
    });
  }

  const handleSelect = e => {
    const name = e.target.name;
    const selectedValue = e.target.options[e.target.selectedIndex].value;

    if (name === "slide" && selectedValue !== "") {
      let slideLayoutId;

      const SlideSelected = listSlide.rows.filter(i => i.name === selectedValue);

      if (SlideSelected && SlideSelected[0].layout) {
        slideLayoutId = SlideSelected[0].layout.id;
        fetchList("getslidelayout", slideLayoutId);
      }
    } else if (selectedValue === "") {
      setBlocks([]);
      setBlocksSelected([]);
    }

    setRawData({ [name]: selectedValue });
  };

  const handleSelectProcessData = e => {
    const name = e.target.name;
    const selectedValue = e.target.options[e.target.selectedIndex].value;
    setRawData({ processData: { ...rawData.processData, [name]: selectedValue } });
  };

  const handleChangeSlider = changeEvent => {
    setRawData({ powerLevel: parseInt(changeEvent.target.value) });
    parseInt(changeEvent.target.value) === 0 ? setSliderInvalid(true) : setSliderInvalid(false);
  };

  const fileData = [
    {
      controlId: "fileUploader",
      label: "Image",
      fileType: rawData.fileType,
      setUploadedFile: setImageUploaded,
      required: true,
    },
    {
      controlId: "fileUploader2",
      label: "RawData File",
      fileType: rawData.fileType,
      setUploadedFile: setUploadedRawDF,
      required: false,
    },
    {
      controlId: "fileUploader3",
      label: "Process Data File",
      fileType: rawData.processData.fileType,
      setUploadedFile: setUploadedDF,
      required: false,
    },
  ];

  const FormData = [
    {
      label: "Slide",
      name: "slide",
      value: rawData.slide,
      list: listSlide,
      message: "Slide",
      onchange: handleSelect,
    },
    {
      label: "Scanner Meta",
      name: "scanner",
      value: rawData.scanner,
      list: listScannerMetas,
      message: "Scanner Metadata",
      onchange: handleSelect,
    },
    {
      label: "Image Analysis",
      name: "imageAnalysis",
      value: rawData.imageAnalysis,
      list: listImageAnalysis,
      message: "Image Analysis",
      onchange: handleSelect,
    },
    {
      label: "Assay Metadata",
      name: "assayMetadata",
      value: rawData.assayMetadata,
      list: listAssayMetas,
      message: "Assay Metadata",
      onchange: handleSelect,
    },
    {
      label: "Data Processing",
      name: "dataProcessing",
      value: rawData.processData.dataProcessing,
      list: listDataProcessing,
      message: "Data Processing",
      onchange: handleSelectProcessData,
    },
    {
      label: "Raw Data File Format",
      name: "rawDataFF",
      value: rawData.rawDataFF,
      list: listSupportedRawFileFormat,
      message: "Raw Data File Format",
      onchange: handleSelect,
    },
    {
      label: "Statistical Method",
      name: "statisticalMethod",
      value: rawData.processData.statisticalMethod,
      list: statisticalMethods,
      message: "Statistical Method",
      onchange: handleSelectProcessData,
    },
    {
      label: "Supported Processed File Format",
      name: "supportedProcessedFF",
      value: rawData.processData.supportedProcessedFF,
      list: supportedProcessedFF,
      message: "Supported Processed File Format",
      onchange: handleSelectProcessData,
    },
  ];

  const processFile = fileId => {
    console.log(fileId);
  };

  function getBlocksUsed() {
    blocksSelected = blocksSelected.map(block => {
      return block.blockLayout.id.toString();
    });

    return blocksSelected;
  }

  function handleSubmit(e) {
    setValidated(true);

    if (e.currentTarget.checkValidity()) {
      if (rawData.powerLevel === 0) {
        setSliderInvalid(true);
      } else if (imageUploaded && uploadedRawDF) {
        getBlocksUsed();
        setShowErrorSummary(false);
        wsCall(
          "addslide",
          "POST",
          { arraydatasetId: experimentId },
          true,
          {
            printedSlide: {
              name: rawData.slide,
            },
            metadata: {
              name: rawData.assayMetadata,
            },
            blocksUsed: blocksSelected,
            images: getImageData(),
          },
          // eslint-disable-next-line no-unused-vars
          response => {
            setEnablePrompt(false);
            history.push("/experiments/editExperiment/" + experimentId);
            // history.goBack();
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

  function getImageData() {
    uploadedRawDF.fileFormat = rawData.rawDataFF;
    const imageList = [];
    let image = {};

    image.file = imageUploaded;
    image.scanner = { name: rawData.scanner };
    image.rawData = {
      metadata: {
        name: rawData.imageAnalysis,
      },
      file: uploadedRawDF,
      powerLevel: rawData.powerLevel,
      processedDataList: getProcessedDataList(),
    };

    imageList.push(image);
    return imageList;
  }

  function getProcessedDataList() {
    const processDataList = [];
    let processedData = {};
    uploadedDF.fileFormat = rawData.processData.supportedProcessedFF;

    processedData.metadata = {
      name: rawData.processData.dataProcessing,
    };
    processedData.method = { name: rawData.processData.statisticalMethod };
    processedData.file = uploadedDF;
    processDataList.push(processedData);

    return processDataList;
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

  const handleChecboxChange = row => {
    var selectedrow = [...totalBlocksSelected];
    var deselectedRow = selectedrow.find(e => e.id === row.id);

    if (deselectedRow) {
      var deselectedRowIndex = selectedrow.indexOf(deselectedRow);
      selectedrow.splice(deselectedRowIndex, 1);
    } else {
      selectedrow.push(row);
    }

    setBlocksSelected(selectedrow);
    setTotalBlocksSelected(selectedrow);
  };

  const checkSelection = row => {
    if (blocks && blocks.length > 0) {
      totalBlocksSelected = [...blocksSelected];
    }

    return totalBlocksSelected.find(e => e.id === row.id);
  };

  const getBlockSelectTable = () => {
    return (
      <div style={{ height: "450px", overflow: "scroll" }}>
        <GlygenTable
          data={blocks}
          resolveData={data => data.map(row => row)}
          columns={[
            {
              Header: "Id",
              accessor: "id",
            },
            {
              Header: "Row",
              accessor: "row",
            },
            {
              Header: "Column",
              accessor: "column",
            },
            {
              Header: "BlockLayout Name",
              accessor: "blockLayout.name",
            },
          ]}
          pageSizeOptions={[5, 10, 25]}
          defaultPageSize={5}
          pageSize={blocks.length > 5 ? 5 : blocks.length}
          defaultSortColumn="id"
          commentsRefColumn="description"
          keyColumn="id"
          infoRowsText="Blocks"
          showCheckboxColumn
          checkboxChangeHandler={handleChecboxChange}
          defaultCheckboxHandler={checkSelection}
        />
      </div>
    );
  };

  const getBlocksSelectedPanel = () => {
    return (
      <Popover id="popover-basic" className="popover-custom mt-3" style={{ maxWidth: "100%", width: "100%" }}>
        <Popover.Title
          style={{
            backgroundColor: "#e6e6e6",
          }}
        >
          <Row>
            <Col>
              <h5>Blocks Selected</h5>
            </Col>
            <Col>
              <Link onClick={() => setShowModal(true)}>
                <h5>
                  <EditIcon /> Edit{" "}
                </h5>
              </Link>
            </Col>
          </Row>
        </Popover.Title>
        <Popover.Content className="popover-body-custom">
          {blocksSelected.map((block, index) => {
            return (
              <>
                <div
                  key={index + block.id}
                  style={{
                    backgroundColor: "cadetblue",
                    color: "floralwhite",
                    fontSize: "1.1rem",
                    marginBottom: "10px",
                  }}
                >
                  {block.id}
                </div>
              </>
            );
          })}
        </Popover.Content>
      </Popover>
    );
  };

  const rawDataForm = () => {
    return (
      <>
        <Helmet>
          <title>{head.addRawData.title}</title>
          {getMeta(head.addRawData)}
        </Helmet>
        <Container maxWidth="xl">
          <div className="page-container">
            <PageHeading
              title="Add Raw Data to Repository"
              subTitle="Please provide the information for the new raw data."
            />
            <Card>
              <Card.Body>
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
                            Accept: "*/*",
                          }}
                          fileType={data.fileType}
                          uploadService={getWsUrl("upload")}
                          maxFiles={1}
                          setUploadedFile={data.setUploadedFile}
                          onProcessFile={processFile}
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

                          {element.name === "slide" && blocks.length > 0 && !showModal && (
                            <div>
                              {getBlocksSelectedPanel()}
                              {/* <Row style={{ position: "sticky" }}>
                                <Col md={12}>{getBlocksSelectedPanel()}</Col>
                              </Row> */}
                            </div>
                          )}
                        </Col>
                      </Form.Group>
                    );
                  })}

                  {showModal && (
                    <Modal
                      size="lg"
                      aria-labelledby="contained-modal-title-vcenter"
                      centered
                      show={showModal}
                      onHide={() => setShowModal(false)}
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                          Please Select Blocks included in this Experiment:
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>{getBlockSelectTable()} </Modal.Body>
                      <Modal.Footer></Modal.Footer>
                    </Modal>
                  )}

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

                  <div className="text-center mb-2 mt-2">
                    <Button className="gg-btn-outline mt-2 gg-mr-20" onClick={() => history.goBack()}>
                      Cancel
                    </Button>
                    <Button className="gg-btn-blue mt-2 gg-ml-20" type="submit">
                      Submit
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </>
    );
  };

  return <>{rawDataForm()}</>;
};

AddRawData.propTypes = {
  authCheckAgent: PropTypes.func,
  match: PropTypes.object
};

export { AddRawData };
