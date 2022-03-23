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

const DataTreeView = props => {
  let { data, experimentId } = props;

  const [enableSlideModal, setEnableSlideModal] = useState(false);
  const [enableImageOnSlide, setEnableImageOnSlide] = useState(false);
  const [enableRawdataOnImage, setEnableRawdataOnImage] = useState(false);
  const [enableProcessRawdata, setEnableProcessRawdata] = useState(false);
  const [slideSelected, setSlideSelected] = useState();
  const [imageSelected, setImageSelected] = useState();
  const [rawdataSelected, setRawdataSelected] = useState();

  const slideView = row => {};
  return (
    <>
      <Tree
        style={{ paddingTop: "15px" }}
        content={
          <>
            <div style={{ marginTop: "-45px", marginLeft: "30px" }}>
              <div className={"rst__rowWrapper"}>
                <div className={"rst__row"}>
                  <div className={"row_headline"}>
                    <span style={{ marginLeft: "10px" }}>{"Experiment"}</span>
                    <span style={{ marginLeft: "40px" }}>
                      <LineTooltip text="Add Slide">
                        <span>
                          <FontAwesomeIcon
                            icon={["fas", "plus"]}
                            size="lg"
                            title="Add Slide"
                            alt="Add Slide"
                            onClick={() => {
                              setEnableSlideModal(true);
                            }}
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
        {/* {data.map(exp => { 
          return */}
        {data.slides &&
          data.slides.map((slide, index) => {
            return (
              <Tree
                style={{ paddingTop: "15px", marginLeft: "30px" }}
                content={
                  <>
                    {/*  */}
                    <div style={{ marginTop: "-45px", marginLeft: "30px" }}>
                      <div className={"rst__rowWrapper"}>
                        <div className={"rst__row"}>
                          <div className={"row_headline"}>
                            <span>{"Slide"}</span>
                            <span style={{ marginLeft: "20px" }}>{slide.printedSlide.name}</span>
                            <span style={{ marginLeft: "75px" }}>
                              <LineTooltip text="Add Image">
                                <span>
                                  <FontAwesomeIcon
                                    icon={["fas", "plus"]}
                                    size="lg"
                                    title="Add Image"
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
                                <FontAwesomeIcon
                                  className="tbl-icon-btn download-btn"
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
                                      className="caution-color tbl-icon-btn"
                                      onClick={() => props.deleteSlide(slide.id, "deleteslide")}
                                    />
                                  </LineTooltip>
                                  <LineTooltip text="View Details">
                                    <FontAwesomeIcon
                                      key={"view" + index}
                                      icon={["far", "eye"]}
                                      alt="View icon"
                                      size="lg"
                                      color="#45818e"
                                      className="tbl-icon-btn"
                                      onClick={() => slideView(slide)}
                                    />
                                  </LineTooltip>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/*  */}
                  </>
                }
              >
                {slide.images &&
                  slide.images.map(img => {
                    return (
                      <Tree
                        style={{ paddingTop: "15px", marginLeft: "50px" }}
                        content={
                          <>
                            {/*  */}
                            <div style={{ marginTop: "-45px", marginLeft: "30px" }}>
                              <div className={"rst__rowWrapper"}>
                                <div className={"rst__row"}>
                                  <div className={"row_headline"}>
                                    <span>{"Images"}</span>
                                    <span style={{ marginLeft: "20px" }}>{img.scanner.name}</span>
                                    <span style={{ marginLeft: "40px" }}>
                                      <LineTooltip text="Add Rawdata">
                                        <span>
                                          <FontAwesomeIcon
                                            icon={["fas", "plus"]}
                                            size="lg"
                                            title="Add Rawdata"
                                            alt="Add Rawdata"
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
                                          <LineTooltip text="Delete Slide">
                                            <FontAwesomeIcon
                                              key={"delete" + index}
                                              icon={["far", "trash-alt"]}
                                              size="lg"
                                              title="Delete"
                                              className="caution-color tbl-icon-btn"
                                              onClick={() => props.deleteSlide(slide.id, "deleteslide")}
                                            />
                                          </LineTooltip>
                                        </>
                                      )}

                                      <LineTooltip text="View Details">
                                        <FontAwesomeIcon
                                          key={"view" + index}
                                          icon={["far", "eye"]}
                                          alt="View icon"
                                          size="lg"
                                          color="#45818e"
                                          className="tbl-icon-btn"
                                          // onClick={() => imageView(slide)}
                                        />
                                      </LineTooltip>

                                      {img.file && (
                                        <FontAwesomeIcon
                                          icon={["fas", "download"]}
                                          size="lg"
                                          title="Download Metadata"
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
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        }
                      >
                        {img.rawDataList &&
                          img.rawDataList.map(rawData => {
                            return (
                              <Tree
                                style={{ paddingTop: "15px", marginLeft: "80px" }}
                                content={
                                  <>
                                    <div style={{ marginTop: "-45px", marginLeft: "30px" }}>
                                      <div className={"rst__rowWrapper"}>
                                        <div className={"rst__row"}>
                                          <div className={"row_headline"}>
                                            <span>{"Rawdata"}</span>
                                            <span style={{ marginLeft: "20px" }}>{rawData.metadata.name}</span>
                                            <span style={{ marginLeft: "10px" }}>
                                              {"Status"}
                                              <br />
                                              {rawData.status}
                                            </span>

                                            <span style={{ marginLeft: "5px" }}>
                                              <LineTooltip text="Add Processdata">
                                                <span>
                                                  <FontAwesomeIcon
                                                    icon={["fas", "plus"]}
                                                    size="lg"
                                                    title="Add Processdata"
                                                    className="tbl-icon-btn"
                                                    onClick={() => {
                                                      setRawdataSelected(rawData.id);
                                                      setEnableProcessRawdata(true);
                                                    }}
                                                  />

                                                  {rawData.id && (
                                                    <>
                                                      <LineTooltip text="Delete RawData">
                                                        <FontAwesomeIcon
                                                          key={"delete" + index}
                                                          icon={["far", "trash-alt"]}
                                                          size="lg"
                                                          title="Delete"
                                                          className="caution-color tbl-icon-btn"
                                                          onClick={() => props.deleteRawData(slide.id, "deleteRawData")}
                                                        />
                                                      </LineTooltip>
                                                    </>
                                                  )}

                                                  <LineTooltip text="View Details">
                                                    <FontAwesomeIcon
                                                      key={"view" + index}
                                                      icon={["far", "eye"]}
                                                      alt="View icon"
                                                      size="lg"
                                                      color="#45818e"
                                                      className="tbl-icon-btn"
                                                      // onClick={() => rawDataView(slide)}
                                                    />
                                                  </LineTooltip>

                                                  {rawData.file && (
                                                    <FontAwesomeIcon
                                                      icon={["fas", "download"]}
                                                      size="lg"
                                                      title="Download Metadata"
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
                                                  )}
                                                </span>
                                              </LineTooltip>
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                }
                              >
                                {rawData.processedDataList &&
                                  rawData.processedDataList.map(processData => {
                                    return (
                                      <Tree
                                        open
                                        style={{ paddingTop: "15px", marginLeft: "100px" }}
                                        content={
                                          <>
                                            <div style={{ marginTop: "-45px", marginLeft: "30px" }}>
                                              <div className={"rst__rowWrapper"}>
                                                <div className={"rst__row"}>
                                                  <div className={"row_headline"}>
                                                    <span>{"Process Data"}</span>
                                                    <span style={{ marginLeft: "10px" }}>
                                                      {processData.metadata.name}
                                                    </span>
                                                    <span style={{ marginLeft: "5px" }}>
                                                      <LineTooltip text="Add Processdata">
                                                        <span>
                                                          {processData.id && (
                                                            <>
                                                              <LineTooltip text="Delete RawData">
                                                                <FontAwesomeIcon
                                                                  key={"delete" + index}
                                                                  icon={["far", "trash-alt"]}
                                                                  size="lg"
                                                                  title="Delete"
                                                                  className="caution-color tbl-icon-btn"
                                                                  onClick={() =>
                                                                    props.deleteRawData(slide.id, "deleteRawData")
                                                                  }
                                                                />
                                                              </LineTooltip>
                                                            </>
                                                          )}

                                                          <LineTooltip text="View Details">
                                                            <FontAwesomeIcon
                                                              key={"view" + index}
                                                              icon={["far", "eye"]}
                                                              alt="View icon"
                                                              size="lg"
                                                              color="#45818e"
                                                              className="tbl-icon-btn"
                                                              // onClick={() => processDataView(slide)}
                                                            />
                                                          </LineTooltip>

                                                          {processData.file && (
                                                            <FontAwesomeIcon
                                                              icon={["fas", "download"]}
                                                              size="lg"
                                                              title="Download Metadata"
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
                                                          )}
                                                        </span>
                                                      </LineTooltip>
                                                    </span>
                                                  </div>
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
        {/* })} */}
      </Tree>

      {enableSlideModal && (
        <SlideOnExperiment
          experimentId={experimentId}
          enableSlideModal={enableSlideModal}
          setEnableSlideModal={setEnableSlideModal}
        />
      )}

      {enableImageOnSlide && (
        <ImageOnSlideExp
          experimentId={experimentId}
          slideId={slideSelected}
          enableImageOnSlide={enableImageOnSlide}
          setEnableImageOnSlide={setEnableImageOnSlide}
        />
      )}

      {enableRawdataOnImage && (
        <RawdataOnImage
          experimentId={experimentId}
          imageId={imageSelected}
          enableRawdataOnImage={enableRawdataOnImage}
          setEnableRawdataOnImage={setEnableRawdataOnImage}
        />
      )}

      {enableProcessRawdata && (
        <ProcessDataOnRd
          experimentId={experimentId}
          rawDataId={rawdataSelected}
          enableProcessRawdata={enableProcessRawdata}
          setEnableProcessRawdata={setEnableProcessRawdata}
        />
      )}
    </>
  );
};

export { DataTreeView };
