import React, { useEffect, useState } from "react";
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
  let { data, experimentId, fromPublicDatasetPage, selectedNode, setSelectedNode } = props;

  const [enableExperimentModal, setEnableExperimentModal] = useState(true);
  const [enableSlideModal, setEnableSlideModal] = useState(false);
  const [enableImageOnSlide, setEnableImageOnSlide] = useState(false);
  const [enableRawdataOnImage, setEnableRawdataOnImage] = useState(false);
  const [enableProcessRawdata, setEnableProcessRawdata] = useState(false);
  const [slideSelected, setSlideSelected] = useState();
  const [imageSelected, setImageSelected] = useState();
  const [rawdataSelected, setRawdataSelected] = useState();
  const [parent, setParent] = useState();
  const [titleExpansion, setTitleExpansion] = useState();
  const [slideView, setSlideView] = useState();
  const [imageView, setImageView] = useState();
  const [rawDataView, setRawDataView] = useState();
  const [processDataView, setProcessDataView] = useState();
  const [enableErrorView, setEnableErrorView] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [enableErrorDialogue, setEnableErrorDialogue] = useState();
  const [errorMessageDialogueText, setErrorMessageDialogueText] = useState();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (selectedNode && selectedNode.slideID && data && data.slides) {
      let sld = data.slides.find(sld => sld.id === selectedNode.slideID);
      if (sld && sld.images && selectedNode.imageID) {
        let img = sld.images.find(img => img.id === selectedNode.imageID);
        if (img && img.rawDataList && selectedNode.rawDataID) {
          let rdl = img.rawDataList.find(rdl => rdl.id === selectedNode.rawDataID);
          if (rdl && rdl.processedDataList && selectedNode.processDataID) {
            let pdl = rdl.processedDataList.find(pdl => pdl.id === selectedNode.processDataID);
            if (pdl) {
              resetEnableModal();
              setProcessDataView(pdl);
              setEnableProcessRawdata(true);      
              setParent({slideID:sld.id, imageID:img.id, rawDataID:rdl.id, processDataID: pdl.id });  
              setSelectedNode();
            }

          } else if (rdl) {
            resetEnableModal();
            setRawDataView(rdl);
            setRawdataSelected(rdl.id);
            setEnableRawdataOnImage(true);
            setSelectedNode();
            setParent({slideID:sld.id, imageID:img.id, rawDataID:rdl.id}); 
          } 
      } else if (img) {
        resetEnableModal();
        setImageSelected(img.id);
        setImageView(img);
        setEnableImageOnSlide(true);
        setSelectedNode();
        setParent({slideID:sld.id, imageID:img.id}); 
      } 
    } else if (sld) {
      resetEnableModal();
      setSlideView(sld);
      setSlideSelected(sld.id);
      setEnableSlideModal(true);
      setSelectedNode();
      setParent({slideID:sld.id});
    } 
  } else if (selectedNode && selectedNode.experimentID) {
    resetEnableModal();
    setEnableExperimentModal(true);
    setSelectedNode();
    setParent();
  }

  }, [data]);


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
    );
  };

  const errorMessageDialogue = props => {
    return (
      <>
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={enableErrorDialogue}
        onHide={() => setEnableErrorDialogue(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Errors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span>{errorMessageDialogueText === undefined || errorMessageDialogueText === "" ? "An unidentified error has occurred. Please be patient while we investigate this." : errorMessageDialogueText}</span>
        </Modal.Body>
        <Modal.Footer>
          <Button className="gg-btn-blue-reg" onClick={() => setEnableErrorDialogue(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
    );
  };

  return (
    <>
      {showSpinner && downloadSpinnerBottomSide()}
      {enableErrorView && errorMessageTable()}
      {enableErrorDialogue && errorMessageDialogue()}

      {/* Experiment */}
      <Row     style={{
          // overflowY: "scroll",
          height: "550px"
        }}>
        <Col 
        
        style={{
          height: "400px"
        }}
        
        xs={8} lg={8}>
      <Tree
        style={{
          paddingTop: "15px",
          overflow: "scroll",
          maxHeight: "580px",
          height: "550px"
        }}
        content={
          <>
            <div style={{ marginTop: "-40px", marginLeft: "30px" }}
              role="button" className={enableExperimentModal ? "button-act" : "button"}
              onClick={() =>  {
                resetEnableModal();
                setEnableExperimentModal(true);  
                setParent();            
              }}
            >
              <div className={"rst__rowWrapper"}>
                <div className={"rst__row"}>
                  <Row className={enableExperimentModal ? "row_headline row_headline_act" : "row_headline"}>
                    <Col style={{ overflow: "hidden", flexBasis: "auto", maxWidth: "100%" }}>
                      <strong>Dataset Name:</strong> {data.name ? data.name : ""}
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
                style={{ paddingTop: "15px", marginLeft: "20px" }}
                content={
                  <>
                    <div
                      style={{ marginTop: "-40px", marginLeft: "30px" }}
                      role="button" className={enableSlideModal ? "button-act" : "button"}
                      onClick={() =>  {
                         resetEnableModal();
                         setSlideView(slide);
                         setSlideSelected(slide.id);
                         setEnableSlideModal(true);
                         setParent({slideID:slide.id});                      
                      }}
                    >
                      <div className="rst__rowWrapper">
                        <div className="rst__row">
                          <Row className={enableSlideModal  && slideView && slideView.id === slide.id ? "row_headline row_headline_act" : "row_headline"}>
                            <Col style={{ overflow: "hidden", flexBasis: "auto", maxWidth: "100%" }}>
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
                        style={{ paddingTop: "15px", marginLeft: "20px" }}
                        content={
                          <>
                            <div
                              style={{ marginTop: "-40px", marginLeft: "30px" }}
                              role="button" className={enableSlideModal ? "button-act" : "button"}
                              onClick={() => {
                                resetEnableModal();
                                setImageSelected(img.id);
                                setImageView(img);
                                setEnableImageOnSlide(true);
                                setParent({slideID:slide.id, imageID:img.id});
                              }}
                            >
                              <div className={"rst__rowWrapper"}>
                                <div className={"rst__row"}>
                                  <Row className={enableImageOnSlide  && imageView && imageView.id === img.id ? "row_headline row_headline_act" : "row_headline"}>
                                    <Col style={{ overflow: "hidden", flexBasis: "auto", maxWidth: "100%" }}>
                                      <strong>Image:</strong>{" "}
                                      {img.file && img.file.originalName ? img.file.originalName : "No Image Provided"}
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
                                style={{ paddingTop: "15px", marginLeft: "20px" }}
                                content={
                                  <>
                                    <div
                                      style={{ marginTop: "-40px", marginLeft: "30px" }}
                                      role="button" className={enableRawdataOnImage ? "button-act" : "button"}
                                      onClick={() =>  {
                                        resetEnableModal();
                                        setRawDataView(rawData);
                                        setRawdataSelected(rawData.id);
                                        setEnableRawdataOnImage(true);         
                                        setParent({slideID:slide.id, imageID:img.id, rawDataID:rawData.id });                            
                                      }}
                                    >
                                      <div className={"rst__rowWrapper"}>
                                        <div className={"rst__row"}>
                                          <Row className={enableRawdataOnImage && rawDataView && rawData.id === rawDataView.id ? "row_headline row_headline_act" : "row_headline"}>
                                            <Col style={{ overflow: "hidden", flexBasis: "auto", maxWidth: rawData.status !== "DONE" ? "80%" : "100%" }}>
                                              <strong>Raw Data:</strong>{" "}
                                              <span>
                                                {rawData.file && rawData.file.originalName ? rawData.file.originalName : "No Raw Data Provided"}
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
                                                          paddingTop: "6px",
                                                          paddingBottome: "6px"
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
                                                    paddingTop: "6px",
                                                    paddingBottome: "6px"
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
                                        style={{ paddingTop: "15px", marginLeft: "20px" }}
                                        content={
                                          <>
                                            <div
                                              style={{ marginTop: "-40px", marginLeft: "30px" }}
                                              role="button" className={enableProcessRawdata ? "button-act" : "button"}
                                              onClick={() =>  {
                                                resetEnableModal();
                                                setProcessDataView(pd);
                                                setEnableProcessRawdata(true);      
                                                setParent({slideID:slide.id, imageID:img.id, rawDataID:rawData.id, processDataID: pd.id});                                                                    
                                              }}
                                            >
                                              <div className={"rst__rowWrapper"}>
                                                <div className={"rst__row"}>
                                                  <Row className={enableProcessRawdata && processDataView && pd.id === processDataView.id ? "row_headline row_headline_act" : "row_headline"}>
                                                    <Col style={{ overflow: "hidden", flexBasis: "auto", maxWidth: pd.status !== "DONE" ? "80%" : "100%" }}>
                                                      <strong>Processed Data:</strong>{" "}
                                                      <span>
                                                        {pd.file && pd.file.originalName ? pd.file.originalName : ""}
                                                      </span>
                                                    </Col>
                                                    {pd.status !== "DONE" && <Col style={{ textAlign: "right"}}>
                                                      {pd.status &&
                                                      pd.status === "ERROR" &&
                                                      pd.error &&
                                                      pd.error.errors.length > 0 ? (
                                                        <>
                                                            <FontAwesomeIcon
                                                              key={"error" + index}
                                                              icon={["fas", "exclamation-triangle"]}
                                                              size="lg"
                                                              className={"caution-color table-btn"}
                                                              style={{
                                                                paddingTop: "6px",
                                                                paddingBottome: "6px"
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
                                                          paddingTop: "6px",
                                                          paddingBottome: "6px"
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
          setEnableExperimentModal={setEnableExperimentModal}
          setParent={setParent}
          deleteRow={props.deleteRow}
          setDeleteMessage={props.setDeleteMessage}
          setShowDeleteModal={props.setShowDeleteModal}
          setSlideSelected={setSlideSelected}
          resetEnableModal={resetEnableModal}
          setEnableImageOnSlide={setEnableImageOnSlide}
          setErrorMessageDialogueText={setErrorMessageDialogueText}
          setEnableErrorDialogue={setEnableErrorDialogue}
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
          parent={parent}
          setParent={setParent}
          setSlideView={setSlideView}
          setSlideSelected={setSlideSelected}
          setEnableSlideModal={setEnableSlideModal}
          setErrorMessageDialogueText={setErrorMessageDialogueText}
          setEnableErrorDialogue={setEnableErrorDialogue}
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
          parent={parent}
          setParent={setParent}
          setImageView={setImageView}
          setEnableImageOnSlide={setEnableImageOnSlide}
          setImageSelected={setImageSelected}
          setErrorMessageDialogueText={setErrorMessageDialogueText}
          setEnableErrorDialogue={setEnableErrorDialogue}
          rawDataView={rawDataView}
          setRawDataView={setRawDataView}
          enableRawdataOnImage={enableRawdataOnImage}
          setEnableRawdataOnImage={setEnableRawdataOnImage}
          setRawdataSelected={setRawdataSelected}
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
          parent={parent}
          setParent={setParent}
          setRawDataView={setRawDataView}
          setEnableRawdataOnImage={setEnableRawdataOnImage}
          setRawdataSelected={setRawdataSelected}
          setErrorMessageDialogueText={setErrorMessageDialogueText}
          setEnableErrorDialogue={setEnableErrorDialogue}
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
