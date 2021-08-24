import React, { useState, useEffect, useReducer } from "react";
import Helmet from "react-helmet";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import Container from "@material-ui/core/Container";
// import PageLoader from "../components/load/PageLoader";
import { Link } from "react-router-dom";
// import LineTooltip from "../components/tooltip/LineTooltip";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import Grid from "@material-ui/core/Grid";
import { Card, Row, Col } from "react-bootstrap";
import { SearchTable } from "../components/search/SearchTable";
import { StructureImage } from "../components/StructureImage";
import Button from "react-bootstrap/Button";
import { Title } from "../components/FormControls";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Accordion from "react-bootstrap/Accordion";

const GlycanList = (props) => {
  const { searchId } = useParams();
  let { id } = useParams();
  const history = useHistory();

  const [query, setQuery] = useState(null);

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  useEffect(() => {
    wsCall(
      // getdatasetforglycan
      "getglycanpublic",
      "GET",
      {
        offset: 0,
        limit: 0,
        searchId,
        // glycanId
      },
      true,
      null,
      glycanSearchSuccess,
      glycanSearchFailure
    );
  }, []);

  const glycanSearchSuccess = (response) => {
    response.json().then((data) => setQuery(data.input));
  };

  const glycanSearchFailure = (response) => {
    response.json().then((resp) => {
      console.log(resp);
      setPageErrorsJson(resp);
      setShowErrorSummary(true);
      setPageErrorMessage("");
    });
  };
  const [collapsed, setCollapsed] = useReducer((state, newState) => ({ ...state, ...newState }), {
    general: true,
  });

  function toggleCollapse(name, value) {
    setCollapsed({ [name]: !value });
  }
  const expandIcon = <ExpandMoreIcon fontSize="large" />;
  const closeIcon = <ExpandLessIcon fontSize="large" />;
  // const { glytoucanIds, maxMass, minMass, description, dateCreated } = props;

  return (
    <>
      {/* <Helmet>
        <title>{head.glycans.title}</title>
        {getMeta(head.glycans)}
      </Helmet> */}

      <Container maxWidth="lg" className="gg-container">
        <Title title="Details for Glycan" />
        {/* {props.history && props.history.length > 1 && ( */}
        <div className="text-right gg-download-btn-width pb-3">
          <Button
            type="button"
            className="gg-btn-blue"
            // onClick={() => history.push("/glycanList")}
            // onClick={() => {
            //   props.history.goBack();
            // }}
          >
            Back
          </Button>
        </div>
        {/* )} */}
        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="listglycansforsearch"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}
        {/*  general */}
        <Accordion
          id="General"
          defaultActiveKey="0"
          className="panel-width"
          style={{ padding: "20px 0" }}
        >
          <Card>
            <Card.Header className="panelHeadBgr">
              <h4 className="gg-green d-inline">General</h4>
              <div className="float-right">
                <Accordion.Toggle
                  eventKey="0"
                  onClick={() => toggleCollapse("general", collapsed.general)}
                  className="gg-green arrow-btn"
                >
                  <span>{collapsed.general ? closeIcon : expandIcon}</span>
                </Accordion.Toggle>
              </div>
            </Card.Header>
            <Accordion.Collapse eventKey="0">
              <Card.Body>
                <div>
                  <div>
                    {/* <StructureImage base64={row.original.glycan.cartoon}></StructureImage> */}
                    <img
                      className="img-cartoon"
                      // src={getGlycanImageUrl(glytoucan.glytoucan_ac)}
                      alt="Glycan img"
                    />
                  </div>
                  <div>
                    <strong>Glycan ID: </strong>
                    {id}
                  </div>
                  {/* glytoucanIds */}
                  {/* {glytoucanIds && glytoucanIds.length > 0 && ( */}
                  <div>
                    <strong>GlyTouCan ID: </strong>
                    {/* {glytoucanIds.join(", ")} */}
                  </div>
                  {/* )} */}
                  {/* mass */}
                  {/* {minMass && maxMass && ( */}
                  <div>
                    <strong>Mass: </strong>
                    {/* {minMass}&#8209;{maxMass} */}
                  </div>
                  {/* Description */}
                  {/* {description && description.length > 0 && ( */}
                  <div>
                    <strong>Description: </strong>
                    {/* {description} */}
                  </div>
                  {/* )} */}
                  {/* Creation date/user */}
                  {/* {dateCreated && dateCreated.length > 0 && ( */}
                  <div>
                    <strong>Creation date/user: </strong>
                    {/* {dateCreated} */}
                  </div>
                  {/* )} */}
                </div>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
        <Grid container style={{ marginTop: "32px" }}>
          <Grid item xs={12} sm={12} style={{ backgroundColor: "white" }}>
            <Card>
              <SearchTable
                columns={[
                  {
                    Header: "Glycan ID",
                    accessor: "id",
                    Cell: (row) => <Link to={"/data/dataset" + row.id}>{row.id}</Link>,
                  },
                  {
                    Header: "Dataset",
                    accessor: "name",
                  },
                  {
                    Header: "Sample",
                    accessor: "sample.name",
                  },
                  {
                    Header: "Owner",
                    accessor: "user.name",
                  },
                  {
                    Header: "Published Date",
                    accessor: "dateCreated",
                  },
                ]}
                defaultPageSize={10}
                defaultSortColumn="searchId"
                showCommentsButton={false}
                showDeleteButton={false}
                // showSearchBox
                showEditButton={false}
                // commentsRefColumn="description"
                fetchWS="listglycansforsearch"
                // deleteWS="glycandelete"
                // editUrl="glycans/editglycan"
                keyColumn="searchId"
                showRowsInfo
                infoRowsText="Glycans"
                // searchId="1.0mass2000.0981980773glytoucan"
                searchId={searchId}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default GlycanList;
