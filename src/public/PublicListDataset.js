import React, { useEffect, useState, useReducer } from "react";
import { wsCall } from "../utils/wsUtils";
import { Link } from "react-router-dom";
import "./PublicListDataset.css";
import ReactTable from "react-table";
import { getDateCreated } from "../utils/commonUtils";
import { Row, Form, Col, Card } from "react-bootstrap";
import { ErrorSummary } from "../components/ErrorSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CardLoader from "../components/CardLoader";

const PublicListDataset = () => {
  const [listDataSet, setListDataSet] = useState([]);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [orderBy, setOrderBy] = useState();
  const [showLoading, setShowLoading] = useState(true);

  const dataset = {
    pages: "",
    sortBy: ""
  };
  const [publicData, setPublicData] = useReducer((state, newState) => ({ ...state, ...newState }), dataset);

  useEffect(() => {
    setShowLoading(true);
    wsCall(
      "listpublicdataset",
      "GET",
      { offset: "0", loadAll: false, sortBy: publicData.sortBy, order: orderBy ? 1 : 0 },
      false,
      null,
      response =>
        response.json().then(responseJson => {
          setListDataSet(responseJson.rows);
          setShowLoading(false);
        }),
      errorWscall
    );
  }, [orderBy, publicData.sortBy]);

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
        <Form.Group controlId={0} style={{ marginLeft: "70px", marginTop: "-28px" }}>
          <Form.Control
            style={{ width: "33%", height: "33px" }}
            as="select"
            name={"sortBy"}
            value={publicData.sortBy}
            onChange={handleSelectSortBy}
            required={true}
          >
            {/* <option value=""></option> */}
            <option value="id">Accession</option>
            <option value="label">Dataset Name</option>
            <option value="dateAddedToLibrary">Submission Date</option>
            <option value="dateCreated">Publication Date</option>
          </Form.Control>
        </Form.Group>
      </>
    );
  };

  const getTableDetails = () => {
    return (
      <>
        <div
          style={{
            margin: "10px"
          }}
        >
          <Row>
            <Col
              md={{ span: 3 }}
              style={{ marginTop: "10px", textAlign: "right", marginLeft: "14.5%" }}
            >{`List of Datasets (${listDataSet.length})`}</Col>

            <span style={{ width: "5%" }} />
            <span style={{ marginTop: "10px" }}>Order by &nbsp;</span>

            <FontAwesomeIcon
              style={{ textAlign: "left", marginTop: "6px" }}
              key={"view"}
              icon={["fas", orderBy ? "caret-up" : "caret-down"]}
              size="2x"
              title="Order by"
              onClick={() => setOrderBy(!orderBy)}
            />

            <span style={{ width: "5%" }} />

            <Col md={5} style={{ textAlign: "left", marginTop: "10px", marginLeft: "-1%" }}>
              <span>Sort by </span>
              {getSortByOptions()}
            </Col>
          </Row>
          <ReactTable
            columns={[
              {
                Header: "",
                // eslint-disable-next-line react/display-name
                Cell: (row, index) => (
                  <div key={index} style={{ textAlign: "left", margin: "20px" }}>
                    <div>
                      <Link to={`/data/dataset/${row.original.id}`}>{row.original.id}</Link>
                    </div>
                    <div>
                      <strong>{row.original.name}</strong>
                    </div>
                    <div>Sample: {row.original.sample.name}</div>
                    <div>
                      Dataset Description:
                      <h5 style={{ fontSize: "1.25rem", color: "#4a4a4a" }}>
                        <strong>{row.original.description}</strong>
                      </h5>
                    </div>
                    <div>
                      Submitter: &nbsp;
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
                      <span>Public since: {getDateCreated(row.original.dateCreated)}</span>
                    </div>
                  </div>
                )
              }
            ]}
            data={listDataSet}
            pageSizeOptions={[5, 10, 25]}
            defaultPageSize={listDataSet.length < 5 ? 5 : 15}
            showPaginationTop
            // className={"-striped -highlight"}
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

PublicListDataset.propTypes = {};

export { PublicListDataset };
