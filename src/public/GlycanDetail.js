import React, { useState, useEffect, useReducer } from "react";
import Helmet from "react-helmet";
import { getMetaID, getTitle } from "../utils/head";
import { useParams, useHistory } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Link } from "react-router-dom";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import Grid from "@material-ui/core/Grid";
import { Card } from "react-bootstrap";
import { StructureImage } from "../components/StructureImage";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Accordion from "react-bootstrap/Accordion";
import { GlygenTable } from "../components/GlygenTable";
import glygenNotFoundSmall from "../images/glygenNotFoundSmall.svg";
import { Loading } from "../components/Loading";
import { Title } from "../components/FormControls";
import { SlideTable } from "../components/SlideTable";

function getDateTime(date) {
  var now = new Date(date);
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();

  if (month.toString().length === 1) {
    month = "0" + month;
  }
  if (day.toString().length === 1) {
    day = "0" + day;
  }
  if (hour.toString().length === 1) {
    hour = "0" + hour;
  }
  if (minute.toString().length === 1) {
    minute = "0" + minute;
  }
  if (second.toString().length === 1) {
    second = "0" + second;
  }
  var dateTime = year + "/" + month + "/" + day;
  // var dateTime = year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
  return dateTime;
}

const GlycanList = (props) => {
  const { glycanId } = useParams();
  const history = useHistory();

  const [glycanData, setGlycanData] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();
  const [collapsed, setCollapsed] = useReducer((state, newState) => ({ ...state, ...newState }), {
    general: true,
  });

  useEffect(() => {
    setShowLoading(true);

    wsCall(
      "getglycanpublic",
      "GET",
      [glycanId],
      true,
      null,
      glycanSearchSuccess,
      glycanSearchFailure
    );
  }, []);

  const glycanSearchSuccess = (response) => {
    setShowLoading(false);
    response.json().then((data) => setGlycanData(data));
  };

  const glycanSearchFailure = (response) => {
    response.json().then((resp) => {
      console.log(resp);
      setPageErrorsJson(resp);
      setShowErrorSummary(true);
      setPageErrorMessage("");
    });
  };

  function toggleCollapse(name, value) {
    setCollapsed({ [name]: !value });
  }
  const expandIcon = <ExpandMoreIcon fontSize="large" />;
  const closeIcon = <ExpandLessIcon fontSize="large" />;

  return (
    <>
      <Helmet>
        {getTitle("glycanDetail", {
          glytoucanID: glycanData && glycanData.id ? glycanData.id : "",
        })}
        {getMetaID("glycanDetail")}
      </Helmet>

      <Container maxWidth="lg" className="gg-container">
        <Loading show={showLoading} />
        <div className="content-box-md text-center horizontal-heading">
          <h1 className="page-heading">
            <span>Details for Glycan </span> <strong>{glycanData && glycanData.id && <> {glycanData.id}</>}</strong>
          </h1>
        </div>

        {/* <div className="text-right gg-download-btn-width pb-3">
          <Button
            type="button"
            className="gg-btn-blue"
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </Button>
        </div> */}
        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="getglycanpublic"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}
        {/*  general */}
        <Accordion id="General" defaultActiveKey="0" className="panel-width" style={{ padding: "20px 0" }}>
          <Card>
            <Card.Header className="panelHeadBgr">
              <h4 className="gg-green d-inline">General</h4>
              {/* <div className="float-right">
                <Accordion.Toggle
                  eventKey="0"
                  onClick={() => toggleCollapse("general", collapsed.general)}
                  className="gg-green arrow-btn"
                >
                  <span>{collapsed.general ? closeIcon : expandIcon}</span>
                </Accordion.Toggle>
              </div> */}
            </Card.Header>
            <Accordion.Collapse eventKey="0">
              <Card.Body>
                {/* image */}
                {glycanData && glycanData.cartoon ? (
                  // <div className="mb-1">
                  <StructureImage style={{ maxWidth: "30%" }} base64={glycanData.cartoon}></StructureImage>
                ) : (
                  // </div>
                  <StructureImage style={{ minWidth: "20%" }} imgUrl={glygenNotFoundSmall}></StructureImage>
                )}
                {/* glycanID */}
                {glycanData && glycanData.id && (
                  <div>
                    <strong>Glycan ID: </strong>
                    {glycanData.id}
                  </div>
                )}
                {/* glytoucanIds */}
                {glycanData && glycanData.glytoucanId && (
                  <div>
                    <strong>GlyTouCan ID: </strong>
                    <a
                      href={"https://glytoucan.org/Structures/Glycans/" + glycanData.glytoucanId}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {glycanData.glytoucanId}
                    </a>
                  </div>
                )}
                {/* mass */}
                {glycanData && glycanData.mass && (
                  <div>
                    <strong>Monoisotopic Mass: </strong>
                    {Number(parseFloat(glycanData.mass).toFixed(2)).toLocaleString('en-US')} Da
                  </div>
                )}
                {/* Creation date/user */}
                {glycanData && glycanData.dateCreated && (
                  <div>
                    <strong>Creation Date: </strong>
                    {getDateTime(glycanData.dateCreated)}{" "}
                    {glycanData && glycanData.dateCreated && (
                      <span>
                        {"("}By user: {glycanData.user.name}
                        {")"}
                      </span>
                    )}
                  </div>
                )}
                {/* Description */}
                {glycanData && glycanData.description && (
                  <div>
                    <strong>Description: </strong>
                    {glycanData.description}
                  </div>
                )}
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
        <Grid container>
          <Grid item xs={12} sm={12}>
            <div style={{ marginBottom: "30px" }}>
              <Card style={{ height: "100%" }}>
                <Card.Body>
                  <Title title="Datasets" />
              <GlygenTable
                columns={[
                  {
                    // Header: "Dataset ID",
                   Header: row => (
                      <LineTooltip text="Dataset ID">
                        <span>Dataset ID</span>
                      </LineTooltip>
                    ),
                    accessor: "id",
                    Cell: row => (
                      <LineTooltip text="View Dataset Details">
                        <Link to={"/data/dataset/" + row.original.id}>{row.original.id}</Link>
                      </LineTooltip>
                    ),
                  },
                  {
                    // Header: "Dataset Name",
                    Header: row => (
                      <LineTooltip text="Dataset Name">
                        <span>Dataset Name</span>
                      </LineTooltip>
                    ),
                    accessor: "name",
                    minWidth: 150,
                    Cell: row => (
                      <LineTooltip text={row.original.name}>
                        <span>{row.original.name}</span>
                      </LineTooltip>
                    ),
                  },
                  {
                    // Header: "Sample",
                    Header: row => (
                      <LineTooltip text="Sample">
                        <span>Sample</span>
                      </LineTooltip>
                    ),
                    accessor: "sample.name",
                    minWidth: 300,
                    Cell: row => (
                      <LineTooltip text={row.original.sample.name}>
                        <span>{row.original.sample.name}</span>
                      </LineTooltip>
                    ),
                  },
                  {
                    // Header: "Owner",
                    Header: row => (
                      <LineTooltip text="Owner">
                        <span>Owner</span>
                      </LineTooltip>
                    ),
                    accessor: "user.name",
                  },
                  {
                    // Header: "Date Published",
                    Header: row => (
                      <LineTooltip text="Date Published">
                        <span>Date Published</span>
                      </LineTooltip>
                    ),
                    accessor: "dateCreated",
                    minWidth: 150,
                    Cell: row => <>{getDateTime(row.original.dateCreated)}</>,
                  },
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                showCommentsButton={false}
                showDeleteButton={false}
                showEditButton={false}
                fetchWS="getdatasetforglycan"
                keyColumn="id"
                showRowsInfo
                infoRowsText="Datasets"
                urlParams={[glycanId]}
              />
                </Card.Body>
              </Card>
            </div>
            <div style={{ marginBottom: "30px" }}>
              <Card style={{ height: "100%" }}>
                <Card.Body>
                  <Title title="Slides" />
                  <SlideTable wsName="getslideforglycan" urlParams={[glycanId]} showSearchBox={false} showHeading={false} />
                </Card.Body>
              </Card>
            </div>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default GlycanList;
