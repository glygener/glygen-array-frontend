import React, { useState } from "react";
import Tree from "react-animated-tree";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { downloadSpinnerBottomSide } from "../utils/commonUtils";
import { LineTooltip } from "./tooltip/LineTooltip";
import { SlideOnExperiment } from "../containers/SlideOnExperiment";
import { ImageOnSlideExp } from "../containers/ImageOnSlideExp";
import { RawdataOnImage } from "../containers/RawdataOnImage";
import { ProcessDataOnRd } from "../containers/ProcessDataOnRd";
import "../components/DataTreeView.css";
import { Col, Row, Modal, Button, Form } from "react-bootstrap";
import { ErrorPage } from "./ErrorPage";
import { ExperimentDetails } from "../containers/ExperimentDetails";

const DataTreeView = props => {
  let { data, experimentId, fromPublicDatasetPage } = props;

  const [enableExperimentModal, setEnableExperimentModal] = useState(true);
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
  const [showSpinner, setShowSpinner] = useState(false);


  const resetEnableModal = () => {
    setEnableSlideModal(false);
    setEnableImageOnSlide(false);
    setEnableRawdataOnImage(false);
    setEnableProcessRawdata(false);
    setEnableExperimentModal(false);
    setSlideView();
    setImageView();
    setRawDataView();
    setProcessDataView();
  }


  return (
    <>
      {showSpinner && downloadSpinnerBottomSide()}
      {/* Experiment */}
      <Row     style={{
          // overflowY: "scroll",
          minWidth: "600px",
          height: "550px"
        }}>
        <Col 
        
        style={{
          height: "400px"
        }}
        
        xs={8} lg={8}>
      <Tree
        style={{
          paddingTop: "35px",
          overflow: "scroll",
          maxHeight: "580px",
          height: "550px"
        }}
        content={
          <>
            <div style={{ marginTop: "-60px", marginLeft: "30px" }}
              role="button" className={enableExperimentModal ? "button-act" : "button"}
              onClick={() =>  {
                resetEnableModal();
                setEnableExperimentModal(true);              
              }}
            >
              <div className={"rst__rowWrapper"}>
                <div className={"rst__row"}>
                  <Row className={enableExperimentModal ? "row_headline row_headline_act" : "row_headline"}>
                    <Col>
                      <strong>Experiment</strong>
                    </Col>
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
                style={{ paddingTop: "35px", marginLeft: "20px" }}
                content={
                  <>
                    <div className="rst__rowWrapper">
                    <div
                      style={{ marginTop: "-60px", marginLeft: "30px" }}
                      role="button" className={enableSlideModal ? "button-act" : "button"}
                      onClick={() =>  {
                         resetEnableModal();
                         setSlideView(slide);
                         setSlideSelected(slide.id);
                         setEnableSlideModal(true);                      
                      }}
                    >
                        <div className="rst__row">
                          <Row className={enableSlideModal  && slideView && slideView.id === slide.id ? "row_headline row_headline_act" : "row_headline"}>
                            <Col>
                              <strong>Slide:</strong> {slide.printedSlide && slide.printedSlide.name}
                            </Col>
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
                        style={{ paddingTop: "35px", marginLeft: "20px" }}
                        content={
                          <>
                            <div
                              style={{ marginTop: "-60px", marginLeft: "30px" }}
                              role="button" className={enableSlideModal ? "button-act" : "button"}
                              onClick={() => {
                                resetEnableModal();
                                setImageSelected(img.id);
                                setImageView(img);
                                setEnableImageOnSlide(true);
                              }}
                            >
                              <div className={"rst__rowWrapper"}>
                                <div className={"rst__row"}>
                                  <Row className={enableImageOnSlide  && imageView && imageView.id === img.id ? "row_headline row_headline_act" : "row_headline"}>
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
                                style={{ paddingTop: "35px", marginLeft: "20px" }}
                                content={
                                  <>
                                    <div
                                      style={{ marginTop: "-60px", marginLeft: "30px" }}
                                      role="button" className={enableRawdataOnImage ? "button-act" : "button"}
                                      onClick={() =>  {
                                        resetEnableModal();
                                        setRawDataView(rawData);
                                        setRawdataSelected(rawData.id);
                                        setEnableRawdataOnImage(true);                                      
                                      }}
                                    >
                                      <div className={"rst__rowWrapper"}>
                                        <div className={"rst__row"}>
                                          <Row className={enableRawdataOnImage && rawDataView && rawData.id === rawDataView.id ? "row_headline row_headline_act" : "row_headline"}>
                                            <Col>
                                              <strong>Raw Data</strong>{" "}
                                              <span style={{ marginLeft: "20px" }}>
                                                {rawData.metadata && rawData.metadata.name}
                                              </span>
                                              </Col>
                                              {rawData.status !== "DONE" && <Col style={{ textAlign: "right"}}>
                                                {rawData.status &&
                                                rawData.status === "ERROR" &&
                                                rawData.error &&
                                                rawData.error.errors.length > 0 ? (
                                                  <>
                                                      <FontAwesomeIcon
                                                        key={"error" + index}
                                                        icon={["fas", "exclamation-triangle"]}
                                                        size="lg"
                                                        className={"caution-color table-btn"}
                                                        style={{
                                                          paddingTop: "9px"
                                                        }}
                                                      />
                                                  </>
                                                ) : (
                                                  <FontAwesomeIcon
                                                  key={"error" + index}
                                                  icon={["fas", "exclamation-triangle"]}
                                                  size="lg"
                                                  className={"warning-color table-btn"}
                                                  style={{
                                                    paddingTop: "9px"
                                                  }}
                                                />
                                                )}
                                            </Col>}                      
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
                                        style={{ paddingTop: "35px", marginLeft: "20px" }}
                                        content={
                                          <>
                                            <div
                                              style={{ marginTop: "-60px", marginLeft: "30px" }}
                                              role="button" className={enableProcessRawdata ? "button-act" : "button"}
                                              onClick={() =>  {
                                                resetEnableModal();
                                                setProcessDataView(pd);
                                                setEnableProcessRawdata(true);                                              
                                              }}
                                            >
                                              <div className={"rst__rowWrapper"}>
                                                <div className={"rst__row"}>
                                                  <Row className={enableProcessRawdata && processDataView && pd.id === processDataView.id ? "row_headline row_headline_act" : "row_headline"}>
                                                    <Col>
                                                      <strong>Process Data</strong>{" "}
                                                      <span style={{ marginLeft: "20px" }}>
                                                        {pd.metadata && pd.metadata.name}
                                                      </span>
                                                    </Col>
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
      </Col>
        <Col        
        xs={4} lg={4}
        style={{
          paddingTop: "35px",
          // overflow: "scroll",
          height: "500px"
        }}>

      {enableExperimentModal && (
        <ExperimentDetails
          experiment={data}
          getExperiment={props.getExperiment}
          experimentId={experimentId}
          enableExperimentModal={enableExperimentModal}
          setEnableExperimentModal={setEnableExperimentModal}
          setEnableSlideModal={setEnableSlideModal}
          fromPublicDatasetPage={fromPublicDatasetPage}
          isPublic={data.isPublic}
        />
      )}
          
      {enableSlideModal && (
        <SlideOnExperiment
          slideView={slideView}
          getExperiment={props.getExperiment}
          setSlideView={setSlideView}
          experimentId={experimentId}
          enableSlideModal={enableSlideModal}
          setEnableSlideModal={setEnableSlideModal}
          deleteRow={props.deleteRow}
          setDeleteMessage={props.setDeleteMessage}
          setShowDeleteModal={props.setShowDeleteModal}
          setSlideSelected={setSlideSelected}
          resetEnableModal={resetEnableModal}
          setEnableImageOnSlide={setEnableImageOnSlide}
          fromPublicDatasetPage={fromPublicDatasetPage}
          isPublic={data.isPublic}
          setShowSpinner={setShowSpinner}
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
          setImageSelected={setImageSelected}
          setEnableRawdataOnImage={setEnableRawdataOnImage}
          fromPublicDatasetPage={fromPublicDatasetPage}
          isPublic={data.isPublic}
          deleteRow={props.deleteRow}
          setDeleteMessage={props.setDeleteMessage}
          setShowDeleteModal={props.setShowDeleteModal}
          setErrorMessage={setErrorMessage}
          setEnableErrorView={setEnableErrorView}
          setShowSpinner={setShowSpinner}
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
          setRawdataSelected={setRawdataSelected}
          resetEnableModal={resetEnableModal}
          setEnableProcessRawdata={setEnableProcessRawdata}
          deleteRow={props.deleteRow}
          setDeleteMessage={props.setDeleteMessage}
          setShowDeleteModal={props.setShowDeleteModal}
          setErrorMessage={setErrorMessage}
          setEnableErrorView={setEnableErrorView}
          fromPublicDatasetPage={fromPublicDatasetPage}
          isPublic={data.isPublic}
          setShowSpinner={setShowSpinner}
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
          deleteRow={props.deleteRow}
          setDeleteMessage={props.setDeleteMessage}
          setShowDeleteModal={props.setShowDeleteModal}
          setErrorMessage={setErrorMessage}
          setEnableErrorView={setEnableErrorView}
          fromPublicDatasetPage={fromPublicDatasetPage}
          isPublic={data.isPublic}
          setShowSpinner={setShowSpinner}
        />
      )}
      </Col>
      </Row>
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
  return (
    <>
      {/* <Form.Group as={Row} controlId={"slide"} className="gg-align-center mb-3"> */}

      {/* <FormLabel label={"Slide"} /> */}
      {/* {"Slide"}
      <Form.Control
        type="text"
        name={"slide"}
        value={props.data.printedSlide && props.data.printedSlide.name}
        readOnly
        plaintext
      /> */}

      {/* {props.blocks && props.blocks.length > 0 && <div>{getBlocksSelectedPanel()}</div>} */}
      {/* </Form.Group> */}
      {/* <Form.Group as={Row} controlId={"metadata"} className="gg-align-center mb-3"> */}
      {/* <Col xs={12} lg={9}> */}
      {/* <FormLabel label={"Assay Metadata"} /> */}

      {/* {"Assay Metadata"}
      <Form.Control type="text" name={"metadata"} value={props.data.metadata.name} readOnly plaintext /> */}

      {/* </Col> */}
      {/* </Form.Group> */}
    </>
  );
};

export { DataTreeView, DataView };
