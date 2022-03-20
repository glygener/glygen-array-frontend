import React from "react";
import Tree from "react-animated-tree";
import { Button, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { downloadFile } from "../utils/commonUtils";
import { LineTooltip } from "./tooltip/LineTooltip";
import "../components/DataTreeView.css";

const DataTreeView = props => {
  let { data } = props;

  function handleAddImage(slideId, image) {
    debugger;
  }

  const handleAddSlide = experimentId => {};

  return (
    <>
      <Tree
        style={{ paddingTop: "25px" }}
        content={
          <>
            <div style={{ marginTop: "-45px", marginLeft: "30px" }}>
              <div className={"rst__rowWrapper"}>
                <div className={"rst__row"}>
                  <div className={"handle_bar "} />
                  <div className={"row_headline"}>
                    <span style={{ marginLeft: "10px" }}>{"Experiment"}</span>
                    <span style={{ marginLeft: "110px" }}>
                      <LineTooltip text="Add Slide">
                        <span>
                          <FontAwesomeIcon
                            icon={["fas", "plus"]}
                            size="lg"
                            title="Add Slide"
                            alt="Add Slide"
                            onClick={() => handleAddSlide(props.experimentId)}
                          />
                        </span>
                      </LineTooltip>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        }
        // type="Experiment"
        open
        visible
      >
        {data.map(exp => {
          return exp.slides.map((slide, index) => {
            return (
              <Tree
                style={{ paddingTop: "25px" }}
                content={
                  <>
                    {/*  */}
                    <div style={{ marginTop: "-45px", marginLeft: "30px" }}>
                      <div className={"rst__rowWrapper"}>
                        <div className={"rst__row"}>
                          <div className={"handle_bar "} />
                          <div className={"row_headline"}>
                            <span style={{ marginLeft: "10px" }}>{"Slide"}</span>
                            <span style={{ marginLeft: "110px" }}>
                              <LineTooltip text="Add Image">
                                <span>
                                  <FontAwesomeIcon
                                    icon={["fas", "plus"]}
                                    size="lg"
                                    title="Add Slide"
                                    alt="Add Slide"
                                    onClick={() => handleAddSlide(props.experimentId)}
                                  />
                                </span>
                              </LineTooltip>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/*  */}

                    <div
                      style={{
                        marginLeft: "30px"
                      }}
                    >
                      <Row style={{ fontWeight: "bold" }}>
                        <Col>Name/File Name</Col>
                        <Col>Status</Col>
                        <Col>Comment</Col>
                        <Col>{"Action"}</Col>
                      </Row>
                      <Row>
                        <Col>{slide.originalName}</Col>
                        <Col>{slide.status}</Col>
                        <Col>{slide.comment}</Col>
                        <Col>
                          {slide.file && (
                            <FontAwesomeIcon
                              className="table-btn download-btn"
                              icon={["fas", "download"]}
                              size="lg"
                              title="Download Metadata"
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
                          )}

                          {slide.id && (
                            <>
                              <LineTooltip text="Delete Slide">
                                <FontAwesomeIcon
                                  key={"delete" + index}
                                  icon={["far", "trash-alt"]}
                                  size="lg"
                                  title="Delete"
                                  className="caution-color table-btn"
                                  onClick={() => props.deleteSlide(slide.id, "deleteslide")}
                                />
                              </LineTooltip>
                            </>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </>
                }
              >
                {slide.images &&
                  slide.images.map(img => {
                    return (
                      <Tree
                        style={{ paddingTop: "25px" }}
                        content={
                          <>
                            {/*  */}
                            <div style={{ marginTop: "-45px", marginLeft: "30px" }}>
                              <div className={"rst__rowWrapper"}>
                                <div className={"rst__row"}>
                                  <div className={"handle_bar "} />
                                  <div className={"row_headline"}>
                                    <span style={{ marginLeft: "10px" }}>{"Images"}</span>
                                    <span style={{ marginLeft: "110px" }}>
                                      <LineTooltip text="Add Rawdata">
                                        <span>
                                          <FontAwesomeIcon
                                            icon={["fas", "plus"]}
                                            size="lg"
                                            title="Add Rawdata"
                                            alt="Add Rawdata"
                                            onClick={() => handleAddImage(slide.id, img)}
                                          />
                                        </span>
                                      </LineTooltip>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* <Row>
                              <Col>Images</Col>
                              <Col>
                                <Button
                                  style={{ color: "grey", backgroundColor: "white" }}
                                  onClick={() => handleAddImage(slide.id, img)}
                                >
                                  {"Add Image"}
                                </Button>
                              </Col>
                            </Row> */}
                          </>
                        }
                      >
                        {img.rawDataList &&
                          img.rawDataList.map(rawData => {
                            return (
                              <Tree
                                style={{ paddingTop: "25px" }}
                                content={
                                  <>
                                    {/*  */}
                                    <div style={{ marginTop: "-45px", marginLeft: "30px" }}>
                                      <div className={"rst__rowWrapper"}>
                                        <div className={"rst__row"}>
                                          <div className={"handle_bar "} />
                                          <div className={"row_headline"}>
                                            <span style={{ marginLeft: "10px" }}>{"Rawdata"}</span>
                                            <span style={{ marginLeft: "110px" }}>
                                              <LineTooltip text="Add Processdata">
                                                <span>
                                                  <FontAwesomeIcon
                                                    icon={["fas", "plus"]}
                                                    size="lg"
                                                    title="Add Processdata"
                                                    alt="Add Processdata"
                                                    onClick={() => handleAddImage(slide.id, img)}
                                                  />
                                                </span>
                                              </LineTooltip>
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {/* <Row>
                                    <Col>Rawdata</Col>
                                    <Col>
                                      <Button
                                        style={{ color: "grey", backgroundColor: "white" }}
                                        onClick={() => handleAddImage(slide.id, img)}
                                      >
                                        {"Add Image"}
                                      </Button>
                                    </Col>
                                  </Row> */}
                                  </>
                                }
                              >
                                {rawData.processedDataList &&
                                  rawData.processedDataList.map(processData => {
                                    return (
                                      <Tree
                                        style={{ paddingTop: "25px" }}
                                        content={
                                          <>
                                            <div style={{ marginTop: "-45px", marginLeft: "30px" }}>
                                              <div className={"rst__rowWrapper"}>
                                                <div className={"rst__row"}>
                                                  <div className={"handle_bar "} />
                                                  <div className={"row_headline"}>
                                                    <span style={{ marginLeft: "10px" }}>{"Process Data"}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            {/* <Row>
                                            <Col>Process Data</Col>
                                            <Col>
                                              <Button
                                                style={{ color: "grey", backgroundColor: "white" }}
                                                onClick={() => handleAddImage(slide.id, img)}
                                              >
                                                {"Add Image"}
                                              </Button>
                                            </Col>
                                          </Row> */}
                                          </>
                                        }
                                      >
                                        <Tree content={processData.id} />
                                        <Tree content={processData.name} />
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
            );
          });
        })}
      </Tree>
    </>
  );
};

export { DataTreeView };
