import React, { useState } from "react";
import Tree from "react-animated-tree";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { downloadFile } from "../utils/commonUtils";
import { LineTooltip } from "./tooltip/LineTooltip";
import { SlideOnExperiment } from "../containers/SlideOnExperiment";
import { ImageOnSlideExp } from "../containers/ImageOnSlideExp";
import { RawdataOnImage } from "../containers/RawdataOnImage";
import { ProcessDataOnRd } from "../containers/ProcessDataOnRd";
import "../components/DataTreeView.css";
import { Col, Row, Modal, Button, Form, FormLabel } from "react-bootstrap";
import { ErrorPage } from "./ErrorPage";

const DataTreeView = props => {
  let { data, experimentId, isPublic } = props;

  const [enableSlideModal, setEnableSlideModal] = useState(false);
  const [enableImageOnSlide, setEnableImageOnSlide] = useState(false);
  const [enableRawdataOnImage, setEnableRawdataOnImage] = useState(false);
  const [enableProcessRawdata, setEnableProcessRawdata] = useState(false);
  const [slideSelected, setSlideSelected] = useState();
  const [imageSelected, setImageSelected] = useState();
  const [rawdataSelected, setRawdataSelected] = useState();
  const [titleExpansion, setTitleExpansion] = useState();
  const [slideView, setSlideView] = useState();
  const [imageView, setImageView] = useState();
  const [rawDataView, setRawDataView] = useState();
  const [processDataView, setProcessDataView] = useState();
  const [enableErrorView, setEnableErrorView] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  return (
    <>
      {/* Experiment */}
      <Tree
        style={{
          paddingTop: "35px",
          overflow: "scroll",
          maxHeight: "580px"
        }}
        content={
          <>
            <div style={{ marginTop: "-60px", marginLeft: "30px" }}>
              <div className={"rst__rowWrapper"}>
                <div className={"rst__row"}>
                  <Row className={"row_headline"}>
                    <Col>
                      <strong>Experiment</strong>
                    </Col>

                    {!isPublic && (
                      <Col style={{ textAlign: "right" }}>
                        <LineTooltip text="Add Slide">
                          <span>
                            <FontAwesomeIcon
                              icon={["fas", "plus"]}
                              size="lg"
                              alt="Add Slide"
                              className="tbl-icon-btn"
                              onClick={() => {
                                setEnableSlideModal(true);
                              }}
                            />
                          </span>
                        </LineTooltip>
                      </Col>
                    )}
                  </Row>
                </div>
              </div>
            </div>
          </>
        }
        // type="Experiment
        open
        visible
      >
        {/* Slide */}
        {data.slides &&
          data.slides.map((slide, index) => {
            return (
              <Tree
                open
                style={{ paddingTop: "35px", marginLeft: "50px" }}
                content={
                  <>
                    <div
                      style={{ marginTop: "-60px", marginLeft: "30px" }}
                      onClick={() => (isPublic ? props.setSelectedTreeData(slide) : "")}
                    >
                      <div className="rst__rowWrapper">
                        <div className="rst__row">
                          <Row className="row_headline">
                            <Col>
                              <strong>Slide:</strong> {slide.printedSlide.name}
                            </Col>
                            {!isPublic && (
                              <Col style={{ textAlign: "right" }}>
                                <LineTooltip text="Add Image">
                                  <span>
                                    <FontAwesomeIcon
                                      icon={["fas", "plus"]}
                                      size="lg"
                                      alt="Add Image"
                                      className="tbl-icon-btn"
                                      onClick={() => {
                                        setSlideSelected(slide.id);
                                        setEnableImageOnSlide(true);
                                      }}
                                    />
                                  </span>
                                </LineTooltip>

                                {slide.file && (
                                  <LineTooltip text="Download Metadata">
                                    <span>
                                      <FontAwesomeIcon
                                        className="tbl-icon-btn download-btn"
                                        icon={["fas", "download"]}
                                        size="lg"
                                        onClick={() => {
                                          downloadFile(
                                            slide.file,
                                            props.setPageErrorsJson,
                                            props.setPageErrorMessage,
                                            props.setShowErrorSummary,
                                            "filedownload"
                                          );
                                        }}
                                      />
                                    </span>
                                  </LineTooltip>
                                )}

                                {slide.id && (
                                  <>
                                    <LineTooltip text="Delete Slide">
                                      <span>
                                        <FontAwesomeIcon
                                          key={"delete" + index}
                                          icon={["far", "trash-alt"]}
                                          size="lg"
                                          className="caution-color tbl-icon-btn"
                                          onClick={() => {
                                            props.deleteRow(slide.id, "deleteslide");
                                            props.setDeleteMessage(
                                              "This will remove all images, raw data and processed data that belongs to this slide. Do you want to continue?"
                                            );
                                            props.setShowDeleteModal(true);
                                          }}
                                        />
                                      </span>
                                    </LineTooltip>

                                    <LineTooltip text="View Details">
                                      <span>
                                        <FontAwesomeIcon
                                          key={"view" + index}
                                          icon={["far", "eye"]}
                                          alt="View icon"
                                          size="lg"
                                          color="#45818e"
                                          className="tbl-icon-btn"
                                          onClick={() => {
                                            setSlideView(slide);
                                            setEnableSlideModal(true);
                                          }}
                                        />
                                      </span>
                                    </LineTooltip>
                                  </>
                                )}
                              </Col>
                            )}
                          </Row>
                        </div>
                      </div>
                    </div>
                  </>
                }
              >
                {slide.images &&
                  slide.images.map(img => {
                    return (
                      <Tree
                        open
                        style={{ paddingTop: "35px", marginLeft: "60px" }}
                        content={
                          <>
                            <div
                              style={{ marginTop: "-60px", marginLeft: "30px" }}
                              onClick={() => (isPublic ? props.setSelectedTreeData(img) : "")}
                            >
                              <div className={"rst__rowWrapper"}>
                                <div className={"rst__row"}>
                                  <Row className={"row_headline"}>
                                    <Col>
                                      <strong>Image:</strong>{" "}
                                      {img.file && img.file.originalName && titleExpansion === img.file.originalName ? (
                                        <>
                                          <span onClick={() => setTitleExpansion()}>{img.file.originalName}</span>
                                        </>
                                      ) : (
                                        <>
                                          {img.file && img.file.originalName.slice(0, 20)}
                                          <span onClick={() => setTitleExpansion(img.file.originalName)}>{"..."}</span>
                                        </>
                                      )}
                                    </Col>

                                    {!isPublic && (
                                      <>
                                        <Col style={{ textAlign: "right" }}>
                                          <LineTooltip text="Add Raw Data">
                                            <span>
                                              <FontAwesomeIcon
                                                icon={["fas", "plus"]}
                                                size="lg"
                                                className="tbl-icon-btn"
                                                onClick={() => {
                                                  setImageSelected(img.id);
                                                  setEnableRawdataOnImage(true);
                                                }}
                                              />
                                            </span>
                                          </LineTooltip>

                                          {img.id && (
                                            <>
                                              <LineTooltip text="Delete Image">
                                                <span>
                                                  <FontAwesomeIcon
                                                    key={"delete" + index}
                                                    icon={["far", "trash-alt"]}
                                                    size="lg"
                                                    className="caution-color tbl-icon-btn"
                                                    onClick={() => {
                                                      props.deleteRow(img.id, "deleteimage");
                                                      props.setDeleteMessage(
                                                        "This will remove all raw data and processed data that belongs to this image. Do you want to continue?"
                                                      );
                                                      props.setShowDeleteModal(true);
                                                    }}
                                                  />
                                                </span>
                                              </LineTooltip>
                                            </>
                                          )}

                                          <LineTooltip text="View Details">
                                            <span>
                                              <FontAwesomeIcon
                                                key={"view" + index}
                                                icon={["far", "eye"]}
                                                alt="View icon"
                                                size="lg"
                                                color="#45818e"
                                                className="tbl-icon-btn"
                                                onClick={() => {
                                                  setImageView(img);
                                                  setEnableImageOnSlide(true);
                                                }}
                                              />
                                            </span>
                                          </LineTooltip>

                                          {img.file && (
                                            <LineTooltip text="Download Metadata">
                                              <span>
                                                <FontAwesomeIcon
                                                  icon={["fas", "download"]}
                                                  size="lg"
                                                  className="tbl-icon-btn download-btn"
                                                  onClick={() => {
                                                    downloadFile(
                                                      img.file,
                                                      props.setPageErrorsJson,
                                                      props.setPageErrorMessage,
                                                      props.setShowErrorSummary,
                                                      "filedownload"
                                                    );
                                                  }}
                                                />
                                              </span>
                                            </LineTooltip>
                                          )}
                                        </Col>
                                      </>
                                    )}
                                  </Row>
                                </div>
                              </div>
                            </div>
                          </>
                        }
                      >
                        {img.rawDataList &&
                          img.rawDataList.map(rawData => {
                            if (rawData.status === "ERROR") {
                            }

                            return (
                              <Tree
                                open
                                style={{ paddingTop: "35px", marginLeft: "70px" }}
                                content={
                                  <>
                                    <div
                                      style={{ marginTop: "-60px", marginLeft: "30px" }}
                                      onClick={() => (isPublic ? props.setSelectedTreeData(rawData) : "")}
                                    >
                                      <div className={"rst__rowWrapper"}>
                                        <div className={"rst__row"}>
                                          <Row className={"row_headline"}>
                                            <Col>
                                              <strong>Raw Data</strong>{" "}
                                              <span style={{ marginLeft: "20px" }}>
                                                <strong>{rawData.metadata.name}</strong>
                                              </span>
                                              <span style={{ marginLeft: "20px" }}>
                                                <strong>Status:</strong>

                                                {rawData.status &&
                                                rawData.status === "ERROR" &&
                                                rawData.error &&
                                                rawData.error.errors.length > 0 ? (
                                                  <>
                                                    {rawData.error.errors.length}{" "}
                                                    {rawData.error.errors.length === 1 ? `Error` : `Errors`}
                                                    &nbsp;&nbsp;
                                                    <LineTooltip text={"View Errors in file"}>
                                                      <FontAwesomeIcon
                                                        key={"error" + index}
                                                        icon={["fas", "exclamation-triangle"]}
                                                        size="xs"
                                                        className={"caution-color table-btn"}
                                                        style={{
                                                          paddingTop: "9px"
                                                        }}
                                                        onClick={() => {
                                                          // alert(rawData.error);
                                                          setErrorMessage(rawData.error);
                                                          setEnableErrorView(true);
                                                        }}
                                                      />
                                                    </LineTooltip>
                                                  </>
                                                ) : (
                                                  rawData.status
                                                )}
                                              </span>
                                            </Col>

                                            {!isPublic && (
                                              <>
                                                <Col style={{ textAlign: "right" }}>
                                                  {rawData.status === "DONE" && (
                                                    <LineTooltip text="Add Process Data">
                                                      <span>
                                                        <FontAwesomeIcon
                                                          icon={["fas", "plus"]}
                                                          size="lg"
                                                          className="tbl-icon-btn"
                                                          onClick={() => {
                                                            setRawdataSelected(rawData.id);
                                                            setEnableProcessRawdata(true);
                                                          }}
                                                        />
                                                      </span>
                                                    </LineTooltip>
                                                  )}

                                                  {rawData.id && (
                                                    <>
                                                      <LineTooltip text="Delete Raw Data">
                                                        <span>
                                                          <FontAwesomeIcon
                                                            key={"delete" + index}
                                                            icon={["far", "trash-alt"]}
                                                            size="lg"
                                                            className="caution-color tbl-icon-btn"
                                                            onClick={() => {
                                                              props.deleteRow(rawData.id, "deleterawdata");
                                                              props.setDeleteMessage(
                                                                "This will remove all processed data that belongs to this raw data. Do you want to continue?"
                                                              );
                                                              props.setShowDeleteModal(true);
                                                            }}
                                                          />
                                                        </span>
                                                      </LineTooltip>
                                                    </>
                                                  )}

                                                  <LineTooltip text="View Details">
                                                    <span>
                                                      <FontAwesomeIcon
                                                        key={"view" + index}
                                                        icon={["far", "eye"]}
                                                        alt="View icon"
                                                        size="lg"
                                                        color="#45818e"
                                                        className="tbl-icon-btn"
                                                        onClick={() => {
                                                          setRawDataView(rawData);
                                                          setEnableRawdataOnImage(true);
                                                        }}
                                                      />
                                                    </span>
                                                  </LineTooltip>

                                                  {rawData.file && (
                                                    <LineTooltip text={"Download Metadata"}>
                                                      <span>
                                                        <FontAwesomeIcon
                                                          icon={["fas", "download"]}
                                                          size="lg"
                                                          className="tbl-icon-btn download-btn"
                                                          onClick={() => {
                                                            downloadFile(
                                                              rawData.file,
                                                              props.setPageErrorsJson,
                                                              props.setPageErrorMessage,
                                                              props.setShowErrorSummary,
                                                              "filedownload"
                                                            );
                                                          }}
                                                        />
                                                      </span>
                                                    </LineTooltip>
                                                  )}
                                                </Col>
                                              </>
                                            )}
                                          </Row>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                }
                              >
                                {rawData.processedDataList &&
                                  rawData.processedDataList.map(pd => {
                                    return (
                                      <Tree
                                        open
                                        style={{ paddingTop: "35px", marginLeft: "70px" }}
                                        content={
                                          <>
                                            <div
                                              style={{ marginTop: "-60px", marginLeft: "30px" }}
                                              onClick={() => (isPublic ? props.setSelectedTreeData(pd) : "")}
                                            >
                                              <div className={"rst__rowWrapper"}>
                                                <div className={"rst__row"}>
                                                  <Row className={"row_headline"}>
                                                    <Col>
                                                      <strong>Process Data</strong>{" "}
                                                      <span style={{ marginLeft: "20px" }}>{pd.metadata.name}</span>
                                                    </Col>

                                                    {!isPublic && (
                                                      <Col style={{ textAlign: "right" }}>
                                                        {pd.id && (
                                                          <>
                                                            <LineTooltip text="Delete Process Data">
                                                              <span>
                                                                <FontAwesomeIcon
                                                                  key={"delete" + index}
                                                                  icon={["far", "trash-alt"]}
                                                                  size="lg"
                                                                  className="caution-color tbl-icon-btn"
                                                                  onClick={() => {
                                                                    props.deleteRow(pd.id, "deleteprocessdata");
                                                                    props.setDeleteMessage(
                                                                      "This will remove the selected processed data. Do you want to continue?"
                                                                    );
                                                                    props.setShowDeleteModal(true);
                                                                  }}
                                                                />
                                                              </span>
                                                            </LineTooltip>
                                                          </>
                                                        )}

                                                        <LineTooltip text="View Details">
                                                          <span>
                                                            <FontAwesomeIcon
                                                              key={"view" + index}
                                                              icon={["far", "eye"]}
                                                              alt="View icon"
                                                              size="lg"
                                                              color="#45818e"
                                                              className="tbl-icon-btn"
                                                              onClick={() => {
                                                                setProcessDataView(pd);
                                                                setEnableProcessRawdata(true);
                                                              }}
                                                            />
                                                          </span>
                                                        </LineTooltip>

                                                        {pd.file && (
                                                          <LineTooltip text="Download Metadata">
                                                            <span>
                                                              <FontAwesomeIcon
                                                                icon={["fas", "download"]}
                                                                size="lg"
                                                                className="tbl-icon-btn download-btn"
                                                                onClick={() => {
                                                                  downloadFile(
                                                                    pd.file,
                                                                    props.setPageErrorsJson,
                                                                    props.setPageErrorMessage,
                                                                    props.setShowErrorSummary,
                                                                    "filedownload"
                                                                  );
                                                                }}
                                                              />
                                                            </span>
                                                          </LineTooltip>
                                                        )}
                                                      </Col>
                                                    )}
                                                  </Row>
                                                </div>
                                              </div>
                                            </div>
                                          </>
                                        }
                                      ></Tree>
                                    );
                                  })}
                              </Tree>
                            );
                          })}
                      </Tree>
                    );
                  })}
              </Tree>
            );
          })}
      </Tree>

      {enableSlideModal && (
        <SlideOnExperiment
          slideView={slideView}
          getExperiment={props.getExperiment}
          setSlideView={setSlideView}
          experimentId={experimentId}
          enableSlideModal={enableSlideModal}
          setEnableSlideModal={setEnableSlideModal}
        />
      )}

      {enableImageOnSlide && (
        <ImageOnSlideExp
          experimentId={experimentId}
          getExperiment={props.getExperiment}
          slideId={slideSelected}
          imageView={imageView}
          setImageView={setImageView}
          enableImageOnSlide={enableImageOnSlide}
          setEnableImageOnSlide={setEnableImageOnSlide}
        />
      )}

      {enableRawdataOnImage && (
        <RawdataOnImage
          experimentId={experimentId}
          getExperiment={props.getExperiment}
          imageId={imageSelected}
          rawDataView={rawDataView}
          setRawDataView={setRawDataView}
          enableRawdataOnImage={enableRawdataOnImage}
          setEnableRawdataOnImage={setEnableRawdataOnImage}
        />
      )}

      {enableProcessRawdata && (
        <ProcessDataOnRd
          experimentId={experimentId}
          getExperiment={props.getExperiment}
          rawDataId={rawdataSelected}
          processDataView={processDataView}
          setProcessDataView={setProcessDataView}
          enableProcessRawdata={enableProcessRawdata}
          setEnableProcessRawdata={setEnableProcessRawdata}
        />
      )}

      {
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
                experimentId={experimentId}
                errorMessage={errorMessage}
                setEnableErrorView={setEnableErrorView}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button className="gg-btn-blue-reg" onClick={() => setEnableErrorView(false)}>
                OK
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      }
    </>
  );
};

const DataView = props => {
  debugger;
  return (
    <>
      {/* <Form.Group as={Row} controlId={"slide"} className="gg-align-center mb-3"> */}

      {/* <FormLabel label={"Slide"} /> */}
      {"Slide"}
      <Form.Control
        type="text"
        name={"slide"}
        value={props.data.printedSlide && props.data.printedSlide.name}
        readOnly
        plaintext
      />

      {/* {props.blocks && props.blocks.length > 0 && <div>{getBlocksSelectedPanel()}</div>} */}
      {/* </Form.Group> */}
      {/* <Form.Group as={Row} controlId={"metadata"} className="gg-align-center mb-3"> */}
      {/* <Col xs={12} lg={9}> */}
      {/* <FormLabel label={"Assay Metadata"} /> */}
      {"Assay Metadata"}
      <Form.Control type="text" name={"metadata"} value={props.data.metadata.name} readOnly plaintext />
      {/* </Col> */}
      {/* </Form.Group> */}
    </>
  );
};

export { DataTreeView, DataView };
