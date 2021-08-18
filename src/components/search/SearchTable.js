import React, { useState, useEffect } from "react";
import ReactTable from "react-table";
import { useHistory } from "react-router-dom";
import "react-table/react-table.css";
import { wsCall } from "../../utils/wsUtils";
import PropTypes from "prop-types";
import "../GlygenTable.css";
import {
  OverlayTrigger,
  Popover,
  Form,
  Col,
  Row,
  FormCheck,
} from "react-bootstrap";
import { ConfirmationModal } from "../ConfirmationModal";
import { GlygenTableRowsInfo } from "../GlygenTableRowsInfo";
import { ErrorSummary } from "../ErrorSummary";
import mirageIcon from "../../images/mirageIcon.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CardLoader from "../CardLoader";

const SearchTable = (props) => {
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

  const makePublicPrompt = (id) => {
    setSelectedIdMakePublic(id);
    setShowMakePublicModal(true);
  };

  const cancelDelete = () => setShowDeleteModal(false);
  const confirmDelete = () => {
    setShowLoading(true);
    wsCall(
      props.deleteWS,
      "DELETE",
      queryParamId
        ? { qsParams: { datasetId: queryParamId }, urlParams: [selectedId] }
        : [selectedId],
      true,
      null,
      deleteSuccess,
      deleteError
    );
  };

  const handleFilterChange = (e) => {
    setSearchFilter(e.target.value);
  };

  if (props.showCommentsButton) {
    columnsToRender["commentsColumn"] = {
      Header: "Comments",
      accessor: "description",
      style: {
        textAlign: "center",
      },
      // eslint-disable-next-line react/display-name
      Cell: (row, index) =>
        row.value ? (
          <OverlayTrigger
            key={index}
            trigger="click"
            placement="left"
            rootClose
            overlay={
              <Popover>
                <Popover.Title as="h3" style={{ marginTop: "-70px" }}>
                  Comments for {props.commentsRefColumn}:{" "}
                  {row.original[props.commentsRefColumn]}
                </Popover.Title>
                <Popover.Content>{row.value}</Popover.Content>
              </Popover>
            }
          >
            <FontAwesomeIcon
              key={"comments" + index}
              icon={["fas", "comments"]}
              size="xs"
              title="Comments"
              className="table-btn"
              // onClick={() => deletePrompt(row.original[props.keyColumn], props.queryParamDelete)}
            />
          </OverlayTrigger>
        ) : (
          <div key={index}></div>
        ),
      minWidth: 80,
    };
  }

  if (props.showDeleteButton || props.showEditButton) {
    columnsToRender["actionsColumn"] = {
      Header: "Actions",
      style: {
        textAlign: "center",
      },
      sortable: false,
      // eslint-disable-next-line react/display-name
      Cell: (row, index) => (
        <>
          {props.showEditButton && (
            <>
              <FontAwesomeIcon
                key={"edit" + index}
                icon={["far", "edit"]}
                size="xs"
                title="Edit"
                className="table-btn edit-icon"
                onClick={() =>
                  history.push(
                    "/" + props.editUrl + "/" + row.original[props.keyColumn]
                  )
                }
              />
              &nbsp;
            </>
          )}

          {props.showDeleteButton && !row.original.isPublic ? (
            <>
              <FontAwesomeIcon
                key={"delete" + index}
                icon={["far", "trash-alt"]}
                size="xs"
                title="Delete"
                className="caution-color table-btn"
                onClick={() =>
                  deletePrompt(
                    row.original[props.keyColumn],
                    props.queryParamDelete
                  )
                }
              />
              &nbsp;
            </>
          ) : (
            ""
          )}

          {props.showCopyButton && (
            <>
              <FontAwesomeIcon
                key={"clone" + index}
                icon={["far", "clone"]}
                size="xs"
                title="Clone"
                className="table-btn"
                onClick={() =>
                  history.push(
                    "/" +
                      props.copyUrl +
                      "/" +
                      row.original[props.keyColumn] +
                      "?" +
                      props.copyPage
                  )
                }
              />
              &nbsp;
            </>
          )}

          {props.showMirageCompliance && (
            <img
              className="table-btn image-icon"
              src={mirageIcon}
              alt="Mirage"
              title="Mirage Compliance"
              aria-hidden="true"
              onClick={() =>
                wsCall(
                  "ismiragecompliant",
                  "GET",
                  {
                    qsParams: { type: "SAMPLE" },
                    urlParams: [row.original.id],
                  },
                  true,
                  null,
                  isMirageCheckSuccess,
                  isMirageCheckFailure
                )
              }
            />
          )}

          {props.showMakePublic && !row.original.isPublic && (
            <>
              <FontAwesomeIcon
                key={"makePublic" + index}
                icon={["fas", "users"]}
                size="xs"
                title="Make Public"
                className="table-btn"
                onClick={() => makePublicPrompt(row.original[props.keyColumn])}
              />
              &nbsp;
            </>
          )}
        </>
      ),
      minWidth: 100,
    };
  }

  if (props.showSelectButton) {
    columnsToRender["singleSelectColumn"] = {
      Header:
        props.selectButtonHeader !== undefined
          ? props.selectButtonHeader
          : "Select",
      // eslint-disable-next-line react/display-name
      Cell: (row, index) => (
        <input
          key={index}
          type="button"
          onClick={() => props.selectButtonHandler(row.original)}
          value={props.selectButtonHeader || "Select"}
        />
      ),
    };
  }

  if (props.showCheckboxColumn) {
    columnsToRender["multiSelectColumn"] = {
      Header: "Select",
      // eslint-disable-next-line react/display-name
      Cell: (row, index) => (
        <input
          key={index}
          type="checkbox"
          onChange={props.checkboxChangeHandler.bind(this, row.original)}
          defaultChecked={props.defaultCheckboxHandler(row.original)}
        />
      ),
    };
  }

  if (props.showSelectRadio) {
    columnsToRender["selectRadio"] = {
      Header: "Select",
      // eslint-disable-next-line react/display-name
      Cell: (row, index) => (
        <input
          key={index}
          type="radio"
          onClick={() => setSelectedRadio(row.original.name)}
          onChange={() => props.selectRadioHandler(row.original)}
          checked={row.original.name === selectedRadio ? true : false}
        />
      ),
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
            <Col md={{ span: 3, offset: 4 }}>
              <GlygenTableRowsInfo
                currentPage={tableElement.state ? tableElement.state.page : 0}
                pageSize={tableElement.state ? tableElement.state.pageSize : 0}
                currentRows={data.length}
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
                  <Form.Check
                    type="checkbox"
                    label={
                      <span
                        style={{
                          backgroundColor:
                            props.onlyMyLinkersGlycansCheckBoxLabel.includes(
                              "glycans"
                            )
                              ? "#fff"
                              : "",
                        }}
                      >
                        {props.onlyMyLinkersGlycansCheckBoxLabel}
                      </span>
                    }
                    onChange={props.handleChangeForOnlyMyLinkersGlycans}
                  />
                </Form.Group>
              </Col>
            )}

            {props.showSearchBox && (
              <Col
                md={{
                  span: 3,
                  offset: props.showOnlyMyLinkersOrGlycansCheckBox ? 0 : 2,
                }}
                style={{
                  marginBottom: "10px",
                  marginRight: props.showOnlyMyLinkersOrGlycansCheckBox
                    ? "-50px"
                    : "",
                }}
              >
                <Form.Control
                  type="text"
                  name="search"
                  placeholder="search table"
                  value={searchFilter}
                  onChange={handleFilterChange}
                  style={{ width: "80%" }}
                />
              </Col>
            )}
          </Row>
        </>
      )}
      <ReactTable
        columns={Object.values(columnsToRender)}
        pageSizeOptions={[5, 10, 25, 50]}
        defaultPageSize={props.defaultPageSize}
        data={props.data ? props.data : data}
        pages={pages}
        loading={showLoading}
        loadingText={<CardLoader pageLoading={showLoading} />}
        multiSort={false}
        showPaginationTop
        manual
        ref={(element) => setTableElement(element)}
        onFetchData={(state) => {
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
            var sortColumn =
              state.sorted.length > 0
                ? state.sorted[0].id
                : props.defaultSortColumn;
            var sortOrder =
              state.sorted.length > 0
                ? state.sorted[0].desc === false
                  ? 1
                  : 0
                : props.defaultSortOrder;
            wsCall(
              props.fetchWS,
              "GET",
              {
                offset: state.page * state.pageSize,
                limit: state.pageSize,
                sortBy: sortColumn,
                order: sortOrder,
                // loadAll: false, //only useful for features, blocks and slides
                // filter: searchFilter !== "" ? searchFilter : "",
                searchId: props.searchId,
              },
              true,
              null,
              (response) => fetchSuccess(response, state),
              fetchError
            );
          } else if (props.fetchWSCallFunction) {
            props.fetchWSCallFunction();
          } else if (props.data) {
            setData(props.data.rows);
            setRows(props.data.total);
            // setPages(Math.ceil(props.data.total / state.pageSize));
          } else {
            setPageErrorMessage(
              "GlygenTable must subscribe to one of these two props: ws or wsCallFunction"
            );
            console.error(
              "GlygenTable must subscribe to one of these two props: ws or wsCallFunction"
            );
          }
        }}
      />
      {props.showRowsInfo && (
        <GlygenTableRowsInfo
          currentPage={tableElement.state ? tableElement.state.page : 0}
          pageSize={tableElement.state ? tableElement.state.pageSize : 0}
          currentRows={data.length}
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
    response.json().then((responseJson) => {
      setData(responseJson.rows);
      setRows(responseJson.total);
      setPages(Math.ceil(responseJson.total / state.pageSize));
      setShowLoading(false);
    });
  }

  function fetchError(response) {
    console.log(response);
    response.json().then((response) => {
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
    response.json().then((response) => {
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
    response.json().then((responseJson) => {
      setPageErrorsJson(responseJson);
    });
    setShowErrorSummary(true);
  }
};

SearchTable.propTypes = {
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
  searchId: PropTypes.string,
};

SearchTable.defaultProps = {
  defaultSortColumn: "dateModified",
  defaultSortOrder: 0,
};

export { SearchTable };
