/* eslint-disable react/display-name */
import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { Popover, OverlayTrigger, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";
import { downloadFile } from "../utils/commonUtils";
import "../containers/ArraydatasetTable.css";
// import CardLoader from "../components/CardLoader";

const ArraydatasetTables = props => {
  const history = useHistory();

  const getSubComponent = (row, subTable) => {
    return (
      <div
        style={{
          textIndent: "12px"
        }}
      >
        <ReactTable
          data={row.images}
          columns={[
            {
              accessor: subTable ? d => d.id : "id",
              id: subTable ? "id" : "",
              Cell: () => "Image",
              minWidth: 80
            },
            {
              accessor: "file.originalName",
              Cell: (row, index) =>
                row.original.file ? (
                  <span key={index} title={row.original.file.originalName}>
                    {row.original.file.originalName}
                  </span>
                ) : (
                  <div key={index} />
                ),
              minWidth: 100
            },
            {
              accessor: "status",
              minWidth: 60
            },
            {
              accessor: "file.originalName",
              Cell: (row, index) =>
                row.original.scanner ? (
                  <div style={{ textAlign: "center" }}>
                    {getComments(row.original.scanner.name, row.original.scanner.id, index)}
                  </div>
                ) : (
                  <div key={index} />
                ),
              style: { textIndent: "27px" },
              minWidth: 60
            },
            {
              Cell: (row, index) =>
                row.original.file ? (
                  <div style={{ textAlign: "center", paddingRight: "7%" }} key={index}>
                    <FontAwesomeIcon
                      className="table-btn download-btn"
                      icon={["fas", "download"]}
                      size="lg"
                      title="Download Metadata"
                      onClick={() => {
                        downloadFile(
                          row.original.file,
                          props.setPageErrorsJson,
                          props.setPageErrorMessage,
                          props.setShowErrorSummary,
                          "filedownload"
                        );
                      }}
                    />
                  </div>
                ) : (
                  <div key={index} />
                ),

              minWidth: 60
            }
          ]}
          showPagination={false}
          defaultPageSize={row.images.length}
          className={"-striped -highlight"}
          SubComponent={row => {
            return (
              <div
                style={{
                  textIndent: "25px"
                }}
              >
                <ReactTable
                  data={[row.original.rawData]}
                  columns={[
                    {
                      accessor: "id",
                      Cell: () => "Raw Data",
                      minWidth: 80
                    },
                    {
                      accessor: "file.originalName",
                      Cell: (row, index) =>
                        row.original.file ? (
                          <span key={index} title={row.original.file.originalName}>
                            {row.original.file.originalName}
                          </span>
                        ) : (
                          <div key={index} />
                        ),

                      minWidth: 100
                    },
                    {
                      accessor: "status",
                      minWidth: 60
                    },

                    {
                      accessor: "file.originalName",
                      Cell: (row, index) =>
                        row.original.metadata && row.original.metadata.name ? (
                          <div style={{ textAlign: "center" }}>
                            {getComments(row.original.metadata.name, row.original.metadata.id, index)}
                          </div>
                        ) : (
                          <div key={index} />
                        ),
                      minWidth: 60
                    },
                    {
                      Cell: (row, index) =>
                        row.original.file ? (
                          <div style={{ textAlign: "center", paddingRight: "12%" }}>
                            <FontAwesomeIcon
                              className="table-btn download-btn"
                              icon={["fas", "download"]}
                              size="lg"
                              title="Download Metadata"
                              onClick={() => {
                                downloadFile(
                                  row.original.file,
                                  props.setPageErrorsJson,
                                  props.setPageErrorMessage,
                                  props.setShowErrorSummary,
                                  "filedownload"
                                );
                              }}
                            />
                          </div>
                        ) : (
                          <div key={index} />
                        ),
                      minWidth: 60
                    }
                  ]}
                  showPagination={false}
                  defaultPageSize={[row.original.rawData].length}
                  className={"-striped -highlight"}
                  SubComponent={row => getProcessedData(row.original.processedDataList)}
                />
              </div>
            );
          }}
        />
      </div>
    );
  };

  const getProcessedData = data => {
    return (
      <ReactTable
        data={data}
        columns={[
          {
            accessor: "id",
            Header: () => <div style={{ height: "0", margin: "0" }}>&nbsp;</div>,
            Cell: () => "Processed Data",
            width: 315,
            style: { textIndent: "110px", maxWidth: "310px" }
          },
          {
            accessor: "file.originalName",

            Cell: (row, index) =>
              row.original.file ? (
                <span key={index} title={row.original.file.originalName}>
                  {row.original.file.originalName}
                </span>
              ) : (
                <div key={index} />
              ),
            style: {
              textIndent: "40px"
            }
          },
          {
            accessor: "status",
            Cell: (row, index) => (
              <>
                {row.original.status &&
                row.original.status === "ERROR" &&
                row.original.error &&
                row.original.error.errors.length > 0 ? (
                  <Col md={12}>
                    {row.original.error.errors.length} {row.original.error.errors.length === 1 ? `Error` : `Errors`}
                    &nbsp;&nbsp;
                    <FontAwesomeIcon
                      key={"error" + index}
                      icon={["fas", "exclamation-triangle"]}
                      size="xs"
                      title="Errors in file"
                      className={"caution-color table-btn"}
                      style={{
                        paddingTop: "9px"
                      }}
                      onClick={() => {
                        history.push({
                          pathname: "/errorProcessData",
                          state: {
                            errorMessage: row.original.error,
                            goBack: `/experiments/editExperiment/${props.experimentId}`,
                          },
                        });
                      }}
                    />
                  </Col>
                ) : (
                  row.original.status
                )}
              </>
            ),
            minWidth: 60
          },
          {
            accessor: "file.originalName",
            Cell: (row, index) =>
              row.original.metadata && row.original.metadata.name ? (
                <div style={{ textAlign: "center" }}>
                  {getComments(row.original.metadata.name, row.original.metadata.id, index)}
                </div>
              ) : (
                <div key={index} />
              ),
            minWidth: 60
          },
          {
            // Cell: () => <span>&nbsp;</span>,
            Cell: (row, index) =>
              row.original.file ? (
                <div style={{ textAlign: "center", paddingRight: "11%" }}>
                  <FontAwesomeIcon
                    className="table-btn download-btn"
                    icon={["fas", "download"]}
                    size="lg"
                    title="Download Metadata"
                    onClick={() => {
                      downloadFile(
                        row.original.file,
                        props.setPageErrorsJson,
                        props.setPageErrorMessage,
                        props.setShowErrorSummary,
                        "filedownload"
                      );
                    }}
                  />
                </div>
              ) : (
                <div key={index} />
              ),

            minWidth: 60
          }
        ]}
        defaultPageSize={data.length}
        showPagination={false}
      />
    );
  };

  const getComments = (name, value, index) => {
    return (
      <>
        <OverlayTrigger
          key={index}
          trigger="click"
          placement="left"
          rootClose
          overlay={
            <Popover>
              <Popover.Title as="h3">Comments for {name}</Popover.Title>
              <Popover.Content>{value}</Popover.Content>
            </Popover>
          }
        >
          <FontAwesomeIcon
            key={"comments" + index}
            icon={["fas", "comments"]}
            size="xs"
            title="Comments"
            className="table-btn"
          />
        </OverlayTrigger>
      </>
    );
  };

  return (
    <>
      <div
        style={{
          textAlign: "left",
          backgroundColor: "white"
        }}
      >
        {/* {showLoading ? <CardLoader pageLoading={showLoading} /> : ""} */}

        <ReactTable
          data={props.dataset.slides}
          columns={[
            {
              Header: () => <p className={"table-header"}>{"Type"}</p>,
              accessor: d => d.id,
              id: "id",
              Cell: () => "Slide",
              minWidth: 80
            },
            {
              Header: () => <p className={"table-header"}>{"Name / FileName"}</p>,
              accessor: "metadata.file.originalName",
              minWidth: 100,
              Cell: row =>
                row.original.printedSlide ? (
                  <span title={row.original.printedSlide.name}>{row.original.printedSlide.name}</span>
                ) : (
                  ""
                )
            },
            {
              Header: () => <p className={"table-header"}>{"Status"}</p>,
              accessor: "status",
              minWidth: 60
            },
            {
              Header: () => <p className={"table-header"}>{"Comment"}</p>,
              accessor: "comment",
              Cell: (row, index) => {
                getComments(row.original.printedSlide.name, row.original.printedSlide.id, index);
              },
              minWidth: 60
            },
            {
              Header: () => <p className={"table-header"}>{"Actions"}</p>,
              Cell: (row, index) => (
                <div style={{ textAlign: "center" }}>
                  <FontAwesomeIcon
                    key={"delete" + index}
                    icon={["far", "trash-alt"]}
                    size="xs"
                    title="Delete"
                    className="caution-color table-btn"
                    onClick={() => props.deleteSlide(row.original.id, "deleteslide")}
                  />
                </div>
              ),
              minWidth: 60
            }
          ]}
          className={"-striped -highlight"}
          // pivotBy={["id"]}
          SubComponent={row => {
            return getSubComponent(row.original, true);
          }}
          defaultPageSize={props.dataset.slides.length}
          showPagination={false}
        />
      </div>
    </>
  );
};

ArraydatasetTables.propTypes = {
  dataset: PropTypes.object,
  deleteSlide: PropTypes.func,
  experimentId: PropTypes.string,
  setPageErrorsJson: PropTypes.func,
  setPageErrorMessage: PropTypes.func,
  setShowErrorSummary: PropTypes.bool
};

export { ArraydatasetTables };
