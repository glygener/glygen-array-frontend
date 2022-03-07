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
  const [listDataSet, setListDataSet] = useState([]);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [orderBy, setOrderBy] = useState();
  const [showLoading, setShowLoading] = useState(true);

  // const { data, onModifySearch } = props;
  // const {id, name, description}= data;

  const dataset = {
    pages: "",
    sortBy: ""
  };
  const [publicData, setPublicData] = useReducer((state, newState) => ({ ...state, ...newState }), dataset);
  useEffect(() => {
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

  function errorWscall(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setPageErrorMessage("");
      setShowErrorSummary(true);
    });
  }

  const handleSelectSortBy = e => {
    const name = e.target.name;
    const selected = e.target.options[e.target.selectedIndex].value;
    setPublicData({ [name]: selected });
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
                <option value="label">Dataset Name</option>
                <option value="dateAddedToLibrary">Submission Date</option>
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
              {listDataSet.length}
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
            <Col md={6}>{getSortByOptions()}</Col>
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
                    <div>
                      <strong>Dataset Description:</strong> {row.original.description}
                    </div>
                    <div>
                      <strong>Submitter:</strong> &nbsp;
                      <Link
                        to={""}
                        style={{
                          color: "dodgerblue",
                          textDecoration: "underline",
                          textTransform: "uppercase"
                        }}
                      >
                        {row.original.user.name}
                      </Link>
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
            data={listDataSet}
            pageSizeOptions={[5, 10, 25]}
            defaultPageSize={listDataSet.length < 5 ? 5 : 1}
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
            sortable={true}
          />
        </div>
      </>
    );
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
