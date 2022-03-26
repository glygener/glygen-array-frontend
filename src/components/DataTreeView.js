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
  const [titleExpansion, setTitleExpansion] = useState();
  const [slideView, setSlideView] = useState();
  const [imageView, setImageView] = useState();
  const [rawDataView, setRawDataView] = useState();

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
                    <span style={{ textAlign: "left" }}>{"Experiment"}</span>
                    <span style={{ textAlign: "right" }}>
                      <LineTooltip text="Add Slide">
                        <span>
                          <FontAwesomeIcon
                            icon={["fas", "plus"]}
                            size="lg"
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
                            <span>{`Slide: ${slide.printedSlide.name}`}</span>
                            <span
                              style={{
                                marginRight: "50%"
                              }}
                            >
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
                                <LineTooltip text={"Download Metadata"}>
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
                                </LineTooltip>
                              )}

                              {slide.id && (
                                <>
                                  <LineTooltip text="Delete Slide">
                                    <FontAwesomeIcon
                                      key={"delete" + index}
                                      icon={["far", "trash-alt"]}
                                      size="lg"
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
                                      onClick={() => {
                                        setSlideView(slide);
                                        setEnableSlideModal(true);
                                      }}
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
                                    <span>
                                      Image:
                                      {img.file.originalName && titleExpansion === img.file.originalName ? (
                                        <>
                                          <span onClick={() => setTitleExpansion()}>{img.file.originalName}</span>
                                        </>
                                      ) : (
                                        <>
                                          {img.file.originalName.slice(0, 20)}
                                          <span onClick={() => setTitleExpansion(img.file.originalName)}>{"..."}</span>
                                        </>
                                      )}
                                    </span>

                                    <span style={{ marginLeft: "40%" }}>
                                      <LineTooltip text="Add Rawdata">
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
                                          <LineTooltip text="Delete Slide">
                                            <FontAwesomeIcon
                                              key={"delete" + index}
                                              icon={["far", "trash-alt"]}
                                              size="lg"
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
                                          onClick={() => {
                                            setImageView(img);
                                            setEnableImageOnSlide(true);
                                          }}
                                        />
                                      </LineTooltip>

                                      {img.file && (
                                        <LineTooltip text="Download Metadata">
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
                                        </LineTooltip>
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
                                                      onClick={() => {
                                                        setRawDataView(rawData);
                                                        setEnableRawdataOnImage(true);
                                                      }}
                                                    />
                                                  </LineTooltip>

                                                  {rawData.file && (
                                                    <LineTooltip text={"Download Metadata"}>
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
                                                    </LineTooltip>
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
                                                            <LineTooltip text={"Download Metadata"}>
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
                                                            </LineTooltip>
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
          slideView={slideView}
          setSlideView={setSlideView}
          experimentId={experimentId}
          enableSlideModal={enableSlideModal}
          setEnableSlideModal={setEnableSlideModal}
        />
      )}

      {enableImageOnSlide && (
        <ImageOnSlideExp
          experimentId={experimentId}
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
          rawDataId={rawdataSelected}
          enableProcessRawdata={enableProcessRawdata}
          setEnableProcessRawdata={setEnableProcessRawdata}
        />
      )}
    </>
  );
};

export { DataTreeView };
