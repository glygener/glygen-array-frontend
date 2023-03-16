import React, { useEffect, useState, useReducer } from "react";
import { wsCall } from "../utils/wsUtils";
import { Link } from "react-router-dom";
import "../public/PublicListDataset.css";
import ReactTable from "react-table";
import { getDateCreated } from "../utils/commonUtils";
import { Row, Form, Col } from "react-bootstrap";
import { ErrorSummary } from "../components/ErrorSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CardLoader from "../components/CardLoader";

const DatasetTable = props => {
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [orderBy, setOrderBy] = useState(1);
  const [showLoading, setShowLoading] = useState(true);
  const [rows, setRows] = useState(0);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [customOffset, setCustomOffset] = useState(false);
  const [curPage, setCurPage] = useState(0);
  const [tableElement, setTableElement] = useState({});
  const [searchFilter, setSearchFilter] = useState("");
  const [descOpen, setDescOpen] = useState(false);
  
  // const { data, onModifySearch } = props;
  // const {id, name, description}= data;

  const dataset = {
    pages: "",
    sortBy: "id"
  };
  const [publicData, setPublicData] = useReducer((state, newState) => ({ ...state, ...newState }), dataset);
  useEffect(() => {
    tableElement.state && tableElement.fireFetchData();
  }, [searchFilter, props, orderBy, publicData.sortBy]);
  /*useEffect(() => {
    setShowLoading(true);

    let params = {
      offset: "0",
      loadAll: false,
      sortBy: publicData.sortBy,
      order: orderBy ? 1 : 0
    };

    if (props.qsParams) {
      params = { ...params, ...props.qsParams };
    }

    wsCall(
      props.wsName,
      "GET",
      params,
      false,
      null,
      response =>
        response.json().then(responseJson => {
          setListDataSet(responseJson.rows);
          setShowLoading(false);
        }),
      errorWscall
    );
  }, [orderBy, publicData.sortBy, props.wsName, props.qsParams]);
*/
  function errorWscall(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setPageErrorMessage("");
    });
    setShowErrorSummary(true);
    setShowLoading(false);
  }

  const handleSelectSortBy = e => {
    const name = e.target.name;
    const selected = e.target.options[e.target.selectedIndex].value;
    setCurPage(0);
    setPublicData({ [name]: selected }); 
  };

  const handleFilterChange = e => {
    setCurPage(0);
    setSearchFilter(e.target.value);
  };

  const getSortByOptions = () => {
    return (
      <>
        <Form>
          <Form.Group as={Row} className="mb-3" controlId={0}>
            <Form.Label column xs={3} sm={4} className="text-xs-left text-sm-left text-md-right">
              Sort by
            </Form.Label>
            <Col xs={9} sm={8}>
              <Form.Control
                as="select"
                name={"sortBy"}
                value={publicData.sortBy}
                onChange={handleSelectSortBy}
                required={true}
              >
                <option value="id">Accession</option>
                <option value="name">Dataset Name</option>
                <option value="dateCreated">Publication Date</option>
              </Form.Control>
            </Col>
          </Form.Group>
        </Form>
      </>
    );
  };

  const getTableDetails = () => {
    return (
      <>
        <div className="m-3">
          <Row>
            <Col className="pt-2 mb-3">
              {" "}
              List&nbsp;of&nbsp;Datasets&nbsp;{"("}
              {rows}
              {")"}
            </Col>
            <Col className="pt-2 mb-3">
              <span>Order&nbsp;by&nbsp;&nbsp;</span>
              <FontAwesomeIcon
                key={"view"}
                icon={["fas", orderBy ? "caret-up" : "caret-down"]}
                title="Order by"
                alt="Caret Icon"
                onClick={() => setOrderBy(!orderBy)}
              />
            </Col>
            <Col md={4}>{getSortByOptions()}</Col>
            {props.showSearchBox && (
              <Col md={2}>
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

          <ReactTable
            columns={[
              {
                Header: "",
                // eslint-disable-next-line react/display-name
                Cell: (row, index) => (
                  <div key={index} style={{ textAlign: "left", margin: "20px" }}>
                    <div>
                      <strong>ID:</strong> <Link to={`/data/dataset/${row.original.id}`}>{row.original.id}</Link>
                    </div>

                    <div>
                      <strong>Dataset Name: </strong>
                      {row.original.name}
                    </div>

                    <div>
                      <strong>Sample:</strong> {row.original.sample.name}
                    </div>

                    {row.original.description && <div style={{whiteSpace: "normal"}}>
                      <strong>Dataset Description:</strong>
                      {getDescription(row.original.description)}
                      <button className={"more-less"} onClick={() => setDescOpen(!descOpen)}>
                        {row.original.description.length > 150 && !descOpen ? `more` : descOpen ? `less` : ``}
                      </button>
                    </div>}

                    <div>
                      <strong>Submitter:</strong> &nbsp;
                      <span style={{ textTransform: "uppercase" }}>
                        {row.original.user.name}
                      </span>
                    </div>

                    <div>
                      <span>
                        <strong>Public since:</strong> {getDateCreated(row.original.dateCreated)}
                      </span>
                    </div>
                  </div>
                )
              }
            ]}
            data={props.data ? props.data : data}
            pageSizeOptions={[5, 10, 25, 50]}
            defaultPageSize={data.length < 5 ? 5 : 1}
            minRows={0}
            NoDataComponent={({ state, ...rest }) =>
              !state?.loading ? (
                <p className="pt-2 text-center">
                  <strong>No data available </strong>
                </p>
              ) : null
            }
            showPaginationTop
            className={"-striped -highlight"}
            pages={pages}
            page={curPage}
            onPageChange={(pageNo) => setCurPage(pageNo)}
            loading={showLoading}
            loadingText={<CardLoader pageLoading={showLoading} />}
            multiSort={false}
            //sortable={true}
            resizable={false}
            manual
            ref={element => setTableElement(element)}
            onFetchData={state => {
              setShowLoading(true);

              let params = {
                offset: customOffset ? 0 : state.page * state.pageSize,
                limit: state.pageSize,
                loadAll: false,
                sortBy: publicData.sortBy,
                filter: searchFilter !== "" ? encodeURIComponent(searchFilter) : "",
                order: orderBy ? 1 : 0
              };

              if (props.qsParams) {
                params = { ...params, ...props.qsParams };
              }

              wsCall(
                props.wsName,
                "GET",
                params,
                false,
                null,
                response =>
                  response.json().then(responseJson => {
                    if (searchFilter !== "" && responseJson.total < 5 && !customOffset) {
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
                  }),
                errorWscall
              );
            }}
          />
        </div>
      </>
    );
  };

  const getDescription = desc => {
    return desc.length > 150 && !descOpen ? `${desc.substring(0, 100)}...` : descOpen ? `${desc}` : desc;
  };

  return (
    <>
      {showErrorSummary === true && (
        <ErrorSummary
          show={showErrorSummary}
          form="experiments"
          errorJson={pageErrorsJson}
          errorMessage={pageErrorMessage}
        />
      )}
      {showLoading ? <CardLoader pageLoading={showLoading} /> : ""}
      {getTableDetails()}
    </>
  );
};

DatasetTable.propTypes = {};

export { DatasetTable };
