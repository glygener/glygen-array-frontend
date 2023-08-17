import React, { useState, useEffect } from "react";
import ReactTable from "react-table";
import { Link, useHistory } from "react-router-dom";
import "react-table/react-table.css";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import "./GlygenTable.css";
import { Form, Col, Row, Button, Modal } from "react-bootstrap";
import { ConfirmationModal } from "./ConfirmationModal";
import { GlygenTableRowsInfo } from "./GlygenTableRowsInfo";
import { ErrorSummary } from "./ErrorSummary";
import mirageIcon from "../images/mirageIcon.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CardLoader from "./CardLoader";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { BlueCheckbox } from "../components/FormControls";
import { BlueRadio } from "../components/FormControls";
import { downloadFile, fileDownloadFailure, fileExportSuccess } from "../utils/commonUtils";
import { Tooltip } from "@material-ui/core";
import "../css/HelpToolTip.css";
import { ErrorMessageDialogue } from "../components/ErrorMessageDialogue";
// import CommentIcon from "@material-ui/icons/Comment";
// import EditIcon from "@material-ui/icons/Edit";

const GlygenTable = props => {
  const history = useHistory();
  const [rows, setRows] = useState(0);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [queryParamId, setQueryParamId] = useState("");
  const [tableElement, setTableElement] = useState({});
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedRadio, setSelectedRadio] = useState("");
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [selectedIdMakePublic, setSelectedIdMakePublic] = useState("");
  const [showMakePublicModal, setShowMakePublicModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [customOffset, setCustomOffset] = useState(false);
  const [curPage, setCurPage] = useState(0);
  const [pageDiaErrorsJson, setPageDiaErrorsJson] = useState({});
  const [pageDiaErrorMessage, setPageDiaErrorMessage] = useState("");
  const [pageDiaTitle, setPageDiaTitle] = useState("");
  const [pageDiaTitleMessage, setPageDiaTitleMessage] = useState("");
  const [showErrorDialogue, setShowErrorDialogue] = useState(false);

  var columnsToRender = Object.assign({}, props.columns);

  useEffect(() => {
    tableElement.state && !customOffset && tableElement.fireFetchData();
  }, [searchFilter, props]);

  const deletePrompt = (id, queryParamDelete) => {
    setSelectedId(id);
    if (queryParamDelete) {
      setQueryParamId(queryParamDelete);
    }
    setShowDeleteModal(true);
  };

  const makePublicPrompt = id => {
    setSelectedIdMakePublic(id);
    setShowMakePublicModal(true);
  };

  const cancelDelete = () => setShowDeleteModal(false);
  const confirmDelete = () => {
    setShowDeleteModal(false);
    setShowLoading(true);
    wsCall(
      props.deleteWS,
      "DELETE",
      queryParamId ? { qsParams: { datasetId: queryParamId }, urlParams: [selectedId] } : [selectedId],
      true,
      null,
      deleteSuccess,
      deleteError
    );
  };

  const handleFilterChange = e => {
    setCurPage(0);
    setSearchFilter(e.target.value);
  };

  if (props.showStatus) {
    columnsToRender["statusColumn"] = {
      Header: "Status",
      accessor: props.commentsRefColumn,
      style: {
        textAlign: "center"
      },
      // eslint-disable-next-line react/display-name
      Cell: (row, index) => {
        return (row.original.status && row.original.status !== "" && row.original.status !== "ERROR") ? (
          <div key={index}>{row.original.status}</div>
        ) : (row.original.status === "ERROR" && row.original.error &&
             row.original.error.errors.length > 0 ) ? (
              <>
                {row.original.status}
                &nbsp;&nbsp;
                <LineTooltip text="Click to see error details.">
                  <span
                    onClick={() => {
                      setPageDiaErrorsJson(row.original.error);
                      setShowErrorDialogue(true);
                    }}
                  >
                    <FontAwesomeIcon
                      key={"error"}
                      icon={["fas", "exclamation-triangle"]}
                      size="xs"
                      className={"caution-color table-btn"}
                      style={{
                        paddingTop: "9px"
                      }}
                    />
                  </span>
                </LineTooltip>
              </>
        ) : (
          <div key={index}>{row.original.status}</div>
        );
      },
      minWidth: 80
    };
  }

  if (props.experimentStatus) {
    columnsToRender["statusColumn"] = {
      Header: "Status",
      accessor: props.commentsRefColumn,
      style: {
        textAlign: "center"
      },
      // eslint-disable-next-line react/display-name
      Cell: (row, index) => {
        return (row.original.uploadStatus && row.original.uploadStatus !== "" && (row.original.uploadStatus === "ERROR" || row.original.uploadStatus === "PROCESSING")) ?
        (row.original.uploadStatus === "ERROR" ? 
          <>
            <span key={index}>{"DATA ERROR"}</span>
            &nbsp;&nbsp;
            <LineTooltip text="Error in uploaded data files (eg Raw data, Processed Data). Click edit to verify.">
              <span>
                <FontAwesomeIcon
                  key={"error"}
                  icon={["fas", "exclamation-triangle"]}
                  size="xs"
                  className={"caution-color table-btn"}
                  style={{
                    paddingTop: "9px"
                  }}
                />
              </span>
            </LineTooltip>
          </>
          : (<div key={index}>{"DATA UPLOADING"}</div>)
        ) 
        : (row.original.status && row.original.status !== "" && row.original.status !== "ERROR") ? 
        row.original.status === "PROCESSING" ? <div key={index}>{"PUBLISHING"}</div>
        : row.original.isPublic ?  <div key={index}>{"PUBLIC"}</div> : <div key={index}>{"PRIVATE"}</div>
        : (row.original.status === "ERROR" && row.original.error &&
             row.original.error.errors.length > 0 ) ? (
              <>
                {row.original.status}
                &nbsp;&nbsp;
                <span
                  onClick={() => {
                    setPageDiaErrorsJson(row.original.error);
                    setShowErrorDialogue(true);
                  }}
                >
                <LineTooltip text="Click to see error details.">
                  <span>
                    <FontAwesomeIcon
                      key={"error"}
                      icon={["fas", "exclamation-triangle"]}
                      size="xs"
                      className={"caution-color table-btn"}
                      style={{
                        paddingTop: "9px"
                      }}
                    />
                  </span>
                </LineTooltip>
              </span>
            </>
        ) : (
          <div key={index}>{row.original.status}</div>
        )
      },
      minWidth: 100
    };
  }

  if (props.showCommentsButton) {
    columnsToRender["commentsColumn"] = {
      Header: "Comments",
      accessor: props.commentsRefColumn,
      style: {
        textAlign: "center"
      },
      // eslint-disable-next-line react/display-name
      Cell: (row, index) => {
        return row.value || (row.original.description && row.original.description !== "") ? (
          getCommentsToolTip(row, props.customCommentColumn, index)
        ) : (
          <div key={index}></div>
        );
      },
      minWidth: 80
    };
  }

  if (props.showDeleteButton || props.showEditButton || props.showViewIcon) {
    columnsToRender["actionsColumn"] = {
      Header: "Actions",
      style: {
        textAlign: "center"
      },
      sortable: false,
      // eslint-disable-next-line react/display-name
      Cell: (row, index) => (
        <>
          {props.showViewIcon && !row.original.isPublic && (
            <>
              <LineTooltip text="View Details">
                <Link>
                  <FontAwesomeIcon
                    key={"view" + index}
                    icon={["far", "eye"]}
                    alt="View icon"
                    size="lg"
                    color="#45818e"
                    className="tbl-icon-btn"
                    onClick={() =>
                      props.customViewonClick
                        ? props.viewOnClick(row)
                        : history.push("/" + props.viewUrl + "/" + row.original[props.keyColumn])
                    }
                  />
                </Link>
              </LineTooltip>
            </>
          )}

          {props.showEditButton && (
            <>
              <LineTooltip text="Edit">
                <span>
                  <FontAwesomeIcon
                    key={"edit" + index}
                    icon={["far", "edit"]}
                    alt="Edit icon"
                    size="lg"
                    className="gg-blue tbl-icon-btn"
                    onClick={() => history.push("/" + props.editUrl + "/" + row.original[props.keyColumn])}
                  />
                </span>
              </LineTooltip>
            </>
          )}

          {props.showCopyButton && (
            <>
              <LineTooltip text="Clone">
                <Link>
                  <FontAwesomeIcon
                    key={"clone" + index}
                    icon={["far", "clone"]}
                    alt="Clone icon"
                    size="lg"
                    color="#536C82"
                    className="tbl-icon-btn"
                    onClick={() =>
                      history.push("/" + props.copyUrl + "/" + row.original[props.keyColumn] + "?" + props.copyPage)
                    }
                  />
                </Link>
              </LineTooltip>
            </>
          )}

          {props.showMirageCompliance && (
            <LineTooltip text="Check for Mirage Compliance">
              <Link>
                <img
                  className="tbl-icon-btn image-icon5"
                  src={mirageIcon}
                  alt="Mirage icon"
                  aria-hidden="true"
                  height="40px"
                  width="40px"
                  onClick={() => {
                    setShowLoading(true);
                    wsCall(
                      "ismiragecompliant",
                      "GET",
                      { qsParams: { type: getMetadataType(row.original.template) }, urlParams: [row.original.id] },
                      true,
                      null,
                      response => isMirageCheckSuccess(response, row.original.name),
                      response => isMirageCheckFailure(response, row.original.name)
                    )
                  }}
                />
              </Link>
            </LineTooltip>
          )}

          {props.showMakePublic && !row.original.isPublic && (
            <>
              <LineTooltip text="Make Public">
                <Link>
                  <FontAwesomeIcon
                    key={"makePublic" + index}
                    icon={["fas", "users"]}
                    alt="Public icon"
                    size="lg"
                    color="#777"
                    className="tbl-icon-btn"
                    onClick={() => makePublicPrompt(row.original[props.keyColumn])}
                  />
                </Link>
              </LineTooltip>
            </>
          )}

          {props.showDeleteButton && (
            <>
              <LineTooltip text="Delete">
                <Link>
                  <FontAwesomeIcon
                    key={"delete" + index}
                    icon={["far", "trash-alt"]}
                    alt="Delete icon"
                    size="lg"
                    className="caution-color tbl-icon-btn"
                    onClick={() => {
                      props.deleteOnClick
                        ? props.deleteOnClick(row.original)
                        : deletePrompt(row.original[props.keyColumn], props.queryParamDelete);
                    }}
                  />
                </Link>
              </LineTooltip>
            </>
          )}

          {props.showDownload && (
            <>
              <LineTooltip text={props.downloadTitle ? props.downloadTitle : "Download"}>
                <span>
                  <FontAwesomeIcon
                    className={`gg-blue tbl-icon-btn download-btn ${
                      row.original.file || (row.original.layout && row.original.layout.file) ? "" : "fa-disabled"
                    }`}
                    icon={["fas", "download"]}
                    size="lg"
                    onClick={() => {
                      let fileInfo =
                        row.original && row.original.file
                          ? row.original.file
                          : row.original && row.original.layout && row.original.layout.file
                          ? row.original.layout.file
                          : "";

                      downloadFile(
                        fileInfo,
                        props.setPageErrorsJson,
                        props.setPageErrorMessage,
                        props.setShowErrorSummary,
                        props.downloadApi,
                        props.setShowSpinner
                      );
                    }}
                  />
                </span>
              </LineTooltip>
            </>
          )}

          {props.showExport && (
            <>
              <LineTooltip text={props.exportTitle ? props.exportTitle : "Export"}>
                <span>
                  <FontAwesomeIcon
                    className={"gg-blue tbl-icon-btn"}
                    icon={["fas", "file-export"]}
                    size="lg"
                    onClick={() =>
                      props.handleExport(
                        row.original.file || !props.isPrintedSlide ? row.original : row.original.layout,
                        setPageErrorsJson,
                        setPageErrorMessage,
                        setShowErrorSummary,
                        props.setShowSpinner
                      )
                    }
                  />
                </span>
              </LineTooltip>
            </>
          )}
        </>
      ),
      minWidth: 170
    };
  }

  if (props.showSelectButton) {
    columnsToRender["singleSelectColumn"] = {
      Header: props.selectButtonHeader !== undefined ? props.selectButtonHeader : "Select",
      // eslint-disable-next-line react/display-name
      Cell: (row, index) => (
        <Button
          className="gg-btn-outline-reg"
          key={index}
          onClick={() => props.selectButtonHandler(row.original, props.isModal)}
        >
          {props.selectButtonHeader || "Select"}
        </Button>
      )
    };
  }

  if (props.showCheckboxColumn) {
    columnsToRender["multiSelectColumn"] = {
      Header: "Select",
      style: {
        textAlign: "center"
      },
      // eslint-disable-next-line react/display-name
      Cell: (row, index) => (
        // <input
        //   key={index}
        //   type="checkbox"
        //   onChange={props.checkboxChangeHandler.bind(this, row.original)}
        //   defaultChecked={props.defaultCheckboxHandler(row.original)}
        // />
        <FormControlLabel
          control={
            <BlueCheckbox
              key={index}
              name="multiSelectColumn"
              defaultChecked={props.defaultCheckboxHandler(row.original)}
              onChange={props.checkboxChangeHandler.bind(this, row.original)}
            />
          }
          className="mb-0 pb-0 mt-0 pt-0"
        />
      )
    };
  }

  if (props.showSelectRadio) {
    columnsToRender["selectRadio"] = {
      Header: "Select",
      // eslint-disable-next-line react/display-name
      Cell: (row, index) => (
        // <input
        //   key={index}
        //   type="radio"
        //   onClick={() => setSelectedRadio(row.original.name)}
        //   onChange={() => props.selectRadioHandler(row.original)}
        //   checked={row.original.name === selectedRadio ? true : false}
        // />

        <FormControlLabel
          control={<BlueRadio />}
          name={"selectRadio"}
          onChange={() => {
            props.selectRadioHandler(row.original);
            setSelectedRadio(row.original.name);
          }}
          checked={row.original.name === selectedRadio ? true : false}
        />
      )
    };
  }

  return (
    <>
      {showErrorSummary === true && (
        <ErrorSummary
          show={showErrorSummary}
          form={props.form}
          errorJson={pageErrorsJson}
          errorMessage={pageErrorMessage}
        />
      )}

      {showErrorDialogue && <ErrorMessageDialogue
          showErrorSummary={showErrorDialogue}
          setShowErrorSummary={setShowErrorDialogue}
          form="glygentable"
          customMessage={true}
          pageErrorsJson={pageDiaErrorsJson}
          pageErrorMessage={pageDiaErrorMessage}
        title={pageDiaTitle}
        titleMessage={pageDiaTitleMessage}
        />
      }

      {props.showRowsInfo && (
        <>
          <Row>
            <Col>
              {/* <Col style={{ textAlign: "right", marginBottom: "1em" }}> */}
              {props.exportData && (
                <div className="text-right mb-3">
                  {/* <LineTooltip text="Download"> */}
                  <Link>
                    <button
                      type="button"
                      alt="Download results"
                      className="btn btn-link gg-download-btn"
                      onClick={() => {
                        wsCall(
                          props.exportWsCall,
                          "GET",
                          props.moleculeType ? { type: props.moleculeType } : "",
                          true,
                          null,
                          response => fileExportSuccess(response, props.fileName),
                          response =>
                            fileDownloadFailure(response, setPageErrorsJson, setPageErrorMessage, setShowErrorSummary)
                        );
                      }}
                    >
                      <FontAwesomeIcon
                        className="table-btn download-btn"
                        icon={["fas", "download"]}
                        size="lg"
                        title="Download"
                      />
                      DOWNLOAD
                    </button>
                  </Link>
                  {/* </LineTooltip> */}
                </div>
              )}
            </Col>
          </Row>

          <Row>
            <Col>
              <GlygenTableRowsInfo
                currentPage={tableElement.state ? tableElement.state.page : 0}
                pageSize={tableElement.state ? tableElement.state.pageSize : 0}
                currentRows={data && data.length}
                totalRows={rows}
                infoRowsText={props.infoRowsText}
                show={props.showRowsInfo}
              />
            </Col>

            {props.showOnlyMyLinkersOrGlycansCheckBox && (
              <Col
                style={{
                  marginTop: "10px",
                  marginLeft: "40px",
                }}
              >
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                  {/* <Form.Check
                    type="checkbox"
                    label={props.onlyMyLinkersGlycansCheckBoxLabel}
                    onChange={props.handleChangeForOnlyMyLinkersGlycans}
                  /> */}
                  <FormControlLabel
                    control={
                      <BlueCheckbox
                        name="formBasicCheckbox"
                        onChange={props.handleChangeForOnlyMyLinkersGlycans}
                        checked={props.showOnlyMyLinkersOrGlycansCheckBox["formBasicCheckbox"]}
                        size="large"
                      />
                    }
                    label={props.onlyMyLinkersGlycansCheckBoxLabel}
                  />
                </Form.Group>
              </Col>
            )}

            {props.showSearchBox && (
              <Col md={4}>
                <Form.Control
                  type="text"
                  name="search"
                  placeholder="Search Table"
                  value={searchFilter}
                  onChange={handleFilterChange}
                />
              </Col>
            )}
          </Row>
        </>
      )}

      <ReactTable
        columns={Object.values(columnsToRender)}
        pageSizeOptions={[5, 10, 25, 50]}
        minRows={0}
        className="MyReactTableClass"
        NoDataComponent={({ state, ...rest }) =>
          !state?.loading ? (
            <p className="pt-2 text-center">
              <strong>No data available</strong>
            </p>
          ) : null
        }
        defaultPageSize={props.defaultPageSize}
        data={props.data ? props.data : data}
        pages={pages}
        page={curPage}
        onPageChange={(pageNo) => setCurPage(pageNo)}
        loading={showLoading}
        loadingText={<CardLoader pageLoading={showLoading} />}
        multiSort={false}
        showPaginationTop
        manual
        ref={element => setTableElement(element)}
        onFetchData={state => {
          /*state obj structure:
          {
            sorted: [
              {
                id: <column_name>
                desc: <bool>
              }
            ],
            page: <current page number, 0-based
            pageSize: <page size of table>
          }*/

          if (props.fetchWS) {
            setShowLoading(true);
            var sortColumn = state.sorted.length > 0 ? state.sorted[0].id : props.defaultSortColumn;
            var sortOrder = state.sorted.length > 0 ? (state.sorted[0].desc === false ? 1 : 0) : props.defaultSortOrder;
            wsCall(
              props.fetchWS,
              "GET",
              {
                urlParams: props.urlParams || [],
                qsParams: {
                  offset: customOffset ? 0 : state.page * state.pageSize,
                  limit: state.pageSize,
                  sortBy: sortColumn,
                  order: sortOrder,
                  loadAll: false, //only useful for features, blocks and slides
                  filter: searchFilter !== "" ? encodeURIComponent(searchFilter) : "",
                  type: props.paramTypeValue,
                  ...props.qsParams,
                },
              },
              // {
              //   offset: state.page * state.pageSize,
              //   limit: state.pageSize,
              //   sortBy: sortColumn,
              //   order: sortOrder,
              //   loadAll: false, //only useful for features, blocks and slides
              //   filter: searchFilter !== "" ? searchFilter : "",
              //   type: props.paramTypeValue
              // },
              true,
              null,
              response => fetchSuccess(response, state),
              fetchError
            );
          } else if (props.fetchWSCallFunction) {
            props.fetchWSCallFunction();
          } else if (props.data) {
            if (props.data.rows) {
              setData(props.data.rows);
              setRows(props.data.total);
            } else {
              setData(props.data);
              setRows(props.data.length);
            }
            // setPages(Math.ceil(props.data.total / state.pageSize));
          } else {
            setPageErrorMessage("GlygenTable must subscribe to one of these two props: ws or wsCallFunction");
            console.error("GlygenTable must subscribe to one of these two props: ws or wsCallFunction");
          }
        }}
      />

      {props.showRowsInfo && (
        <GlygenTableRowsInfo
          currentPage={tableElement.state ? tableElement.state.page : 0}
          pageSize={tableElement.state ? tableElement.state.pageSize : 0}
          currentRows={data && data.length}
          totalRows={rows}
          infoRowsText={props.infoRowsText}
        />
      )}

      <ConfirmationModal
        showModal={showDeleteModal}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        body="Are you sure you want to delete?"
      />

      <Modal
        show={showMakePublicModal}
        animation={false}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered>

        <Modal.Header closeButton>
          <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>You are going to make this Data Set public. When releasing datasets to the public all information will be accessible under the Creative Commons  Attribution 4.0 International (CC BY 4.0). Users can freely access, share and adapt the data. But are required to give appropriate credit.
          Detailed information on the license can be found <a href="https://creativecommons.org/licenses/by/4.0/">here</a>.</Modal.Body>
        <Modal.Footer>
          <Button className="gg-btn-outline-reg" onClick={() => setShowMakePublicModal(false)}>
            Decline
          </Button>
          <Button className="gg-btn-blue-reg" onClick={() => {
            setShowMakePublicModal(false);
            wsCall(
              "makearraydatasetpublic",
              "POST",
              [selectedIdMakePublic],
              true,
              null,
              isMakePublicSuccess,
              isMakePublicFailure
            );
          }}>
            Accept
          </Button>
        </Modal.Footer>
      </Modal>

    </>
  );

  function fetchSuccess(response, state) {
    response.json().then(responseJson => {
      if (searchFilter !== "" && responseJson.total < state.pageSize && !customOffset) {
        setCustomOffset(true);
        tableElement.fireFetchData();
      } else {
        setCustomOffset(false);
        if (responseJson.rows) {
          setData(responseJson.rows);
          setRows(responseJson.total);
        } else {
          setData(responseJson);
          setRows(responseJson.length);
        }
        setPages(Math.ceil(responseJson.total / state.pageSize));
        setShowLoading(false);
      }
    });
  }

  function getMetadataType(template) {
    if (template.includes("Printer")) {
      return "PRINTER";
    } else if (template.includes("Sample")) {
      return "SAMPLE";
    } else if (template.includes("Data")) {
      return "DATAPROCESSINGSOFTWARE";
    } else if (template.includes("Image")) {
      return "IMAGEANALYSISSOFTWARE";
    } else if (template.includes("Scanner")) {
      return "SCANNER";
    } else if (template.includes("Slide")) {
      return "SLIDE";
    } else if (template.includes("Assay")) {
      return "ASSAY";
    } else if (template.includes("Spot")) {
      return "SPOT";
    } else if (template.includes("Printrun")) {
      return "PRINTRUN";
    }
  }

  function fetchError(response) {
    response.json().then(response => {
      setPageErrorsJson(response);
    });
    setShowErrorSummary(true);
    setShowLoading(false);
  }

  function deleteSuccess() {
    props.enableRefreshOnAction && props.enableRefreshOnAction(true);
    setShowDeleteModal(false);
    tableElement.fireFetchData();

    setShowLoading(false);
  }

  function deleteError(response) {
    response.json().then(response => {
      setPageErrorsJson(response);
    });
    setShowErrorSummary(true);
    setShowDeleteModal(false);
    setShowLoading(false);
  }

  function isMirageCheckSuccess(response, sampleName) {
    console.log(response);
    setPageDiaTitle(sampleName + " is MIRAGE compliant!");
    setPageDiaErrorMessage(" ");  // no message should be displayed
    setShowErrorDialogue(true);
    setShowLoading(false);
  }

  function isMirageCheckFailure(response, sampleName) {
    response.json().then(responseJson => {
      setPageDiaErrorsJson(responseJson);
    });
    setPageDiaTitle(sampleName + " is not MIRAGE compliant");
    setPageDiaTitleMessage("Errors:");
    //setPageErrorMessage("");
    //setShowErrorSummary(false);
    setShowErrorDialogue(true);
    setShowLoading(false);
  }

  function isMakePublicSuccess() {
    tableElement.fireFetchData();
  }

  function isMakePublicFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
    });
    setShowErrorSummary(true);
  }
};

const getCommentsToolTip = (row, customCommentColumn, index) => {
  return (
    <>
      <Tooltip
        disableTouchListener
        interactive
        arrow
        placement={"bottom"}
        classes={{
          tooltip: "gg-tooltip"
        }}
        title={
          <span className="text-overflow text-max-height">
            <h5>
              <strong>
                Comments for{" "}
                {customCommentColumn
                  ? row.original.name
                    ? row.original.name
                    : row.original.glytoucanId
                    ? row.original.glytoucanId
                    : row.original.internalId
                  : ""}
              </strong>
            </h5>
            {row.value ? row.value : row.original.description ? row.original.description : ""}
          </span>
        }
      >
        {/* <CommentIcon className={"gg-blue tbl-icon-btn5"} fontSize="medium" /> */}
        <span>
          <FontAwesomeIcon
            key={"comments" + index}
            icon={["fas", "comments"]}
            size="lg"
            title="Comments"
            className="gg-blue tbl-icon-btn"
            style={{ cursor: "pointer" }}
          />
        </span>
      </Tooltip>
    </>
  );
};

GlygenTable.propTypes = {
  columns: PropTypes.array.isRequired,
  defaultPageSize: PropTypes.number,
  defaultSortColumn: PropTypes.string,
  defaultSortOrder: PropTypes.number,
  showCommentsButton: PropTypes.bool,
  showEditButton: PropTypes.bool,
  showDeleteButton: PropTypes.bool,
  commentsRefColumn: PropTypes.string,
  fetchWS: PropTypes.string,
  deleteWS: PropTypes.string,
  fetchWSCallFunction: PropTypes.func,
  editUrl: PropTypes.string,
  keyColumn: PropTypes.string,
  infoRowsText: PropTypes.string,
  showRowsInfo: PropTypes.bool,
  showCheckboxColumn: PropTypes.bool,
  checkboxChangeHandler: PropTypes.func,
  defaultCheckboxHandler: PropTypes.func,
  showSelectButton: PropTypes.bool,
  selectButtonHandler: PropTypes.func,
  selectButtonHeader: PropTypes.string,
  showSelectRadio: PropTypes.bool,
  selectRadioHandler: PropTypes.func,
  showCopyButton: PropTypes.bool,
  copyUrl: PropTypes.string,
  copyPage: PropTypes.string,
  showMirageCompliance: PropTypes.bool,
  showMakePublic: PropTypes.bool,
  setSelectedIdMakePublic: PropTypes.func,
  data: PropTypes.array,
  queryParamDelete: PropTypes.string,
  enableRefreshOnAction: PropTypes.func,
  form: PropTypes.string,
  showSearchBox: PropTypes.bool,
  showOnlyMyLinkersOrGlycansCheckBox: PropTypes.bool,
  handleChangeForOnlyMyLinkersGlycans: PropTypes.func,
  onlyMyLinkersGlycans: PropTypes.bool,
  onlyMyLinkersGlycansCheckBoxLabel: PropTypes.string,
  isModal: PropTypes.bool,
  paramTypeValue: PropTypes.string,
  deleteOnClick: PropTypes.func,
  customCommentColumn: PropTypes.bool,
  showViewIcon: PropTypes.bool,
  viewUrl: PropTypes.string,
  customViewonClick: PropTypes.bool,
  viewOnClick: PropTypes.func,
  refreshTable: PropTypes.bool,
  authCheckAgent: PropTypes.func
};

GlygenTable.defaultProps = {
  defaultSortColumn: "dateModified",
  defaultSortOrder: 0
};

export { GlygenTable, getCommentsToolTip };
