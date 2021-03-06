import React, { useState, useEffect } from "react";
import ReactTable from "react-table";
import { Link, useHistory } from "react-router-dom";
import "react-table/react-table.css";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import "./GlygenTable.css";
import { Form, Col, Row, Button } from "react-bootstrap";
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

  var columnsToRender = Object.assign({}, props.columns);

  useEffect(() => {
    tableElement.state && tableElement.fireFetchData();
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
    setSearchFilter(e.target.value);
  };

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
            <LineTooltip text="Mirage Compliance">
              <Link>
                <img
                  className="tbl-icon-btn image-icon5"
                  src={mirageIcon}
                  alt="Mirage icon"
                  aria-hidden="true"
                  height="40px"
                  width="40px"
                  onClick={() =>
                    wsCall(
                      "ismiragecompliant",
                      "GET",
                      { qsParams: { type: "SAMPLE" }, urlParams: [row.original.id] },
                      true,
                      null,
                      isMirageCheckSuccess,
                      isMirageCheckFailure
                    )
                  }
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

      <ConfirmationModal
        showModal={showMakePublicModal}
        onCancel={() => setShowMakePublicModal(false)}
        onConfirm={() => {
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
        }}
        title="Confirm"
        body="You are going to make this Data Set public. Are you sure you want to proceed?"
      />
    </>
  );

  function fetchSuccess(response, state) {
    response.json().then(responseJson => {
      if (searchFilter !== "" && responseJson.total < 10 && !customOffset) {
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

  function isMirageCheckSuccess(response) {
    console.log(response);
  }

  function isMirageCheckFailure(response) {
    console.log(response);
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
  refreshTable: PropTypes.bool
};

GlygenTable.defaultProps = {
  defaultSortColumn: "dateModified",
  defaultSortOrder: 0
};

export { GlygenTable, getCommentsToolTip };
