import React, { useState, useEffect, useReducer } from "react";
import Helmet from "react-helmet";
import { useParams, useHistory } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Link } from "react-router-dom";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import Grid from "@material-ui/core/Grid";
import { Card } from "react-bootstrap";
import { StructureImage } from "../components/StructureImage";
import Button from "react-bootstrap/Button";
import { Title } from "../components/FormControls";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Accordion from "react-bootstrap/Accordion";
import { GlycanDetailTable } from "../components/search/GlycanDetailTable";

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
  var dateTime = year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
  return dateTime;
}

const GlycanList = (props) => {
  const { glycanId } = useParams();
  const history = useHistory();

  const [glycanData, setGlycanData] = useState(null);

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();
  const [collapsed, setCollapsed] = useReducer((state, newState) => ({ ...state, ...newState }), {
    general: true,
  });

  useEffect(() => {
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
      {/* <Helmet>
        <title>{head.glycans.title}</title>
        {getMeta(head.glycans)}
      </Helmet> */}

      <Container maxWidth="lg" className="gg-container">
        <div className="content-box-md text-center horizontal-heading">
          <h1 className="page-heading">
            <span>Details for Glycan </span>{" "}
            <strong>{glycanData && glycanData.id && <> {glycanData.id}</>}</strong>
          </h1>
        </div>

        {/* {props.history && props.history.length > 1 && ( */}
        <div className="text-right gg-download-btn-width pb-3">
          <Button
            type="button"
            className="gg-btn-blue"
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </Button>
        </div>
        {/* )} */}
        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="getglycanpublic"
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
                  {/* image */}
                  {glycanData && glycanData.cartoon && (
                    <div className="mt-2 mb-2">
                      <StructureImage base64={glycanData.cartoon}></StructureImage>
                    </div>
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
                      {glycanData.glytoucanId}
                    </div>
                  )}

                  {/* mass */}
                  {glycanData && glycanData.mass && (
                    <div>
                      <strong>Mass: </strong>
                      {parseInt(glycanData.mass).toFixed(2)}
                    </div>
                  )}

                  {/* Creation date/user */}
                  {glycanData && glycanData.dateCreated && (
                    <div>
                      <strong>Creation date/user: </strong>
                      {getDateTime(glycanData.dateCreated)}
                    </div>
                  )}

                  {/* Description */}
                  {glycanData && glycanData.description && (
                    <div>
                      <strong>Description: </strong>
                      {glycanData.description}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
        <Grid container style={{ marginTop: "32px" }}>
          <Grid item xs={12} sm={12} style={{ backgroundColor: "white" }}>
            <Card>
              <GlycanDetailTable
                columns={[
                  {
                    Header: "Glycan ID",
                    accessor: "id",
                    Cell: (row) => (
                      <LineTooltip text="View Dataset Details">
                        <Link to={"/data/dataset/" + row.original.id}>{row.original.id}</Link>
                      </LineTooltip>
                    ),
                  },
                  {
                    Header: "Dataset",
                    accessor: "name",
                  },
                  {
                    Header: "Sample",
                    accessor: "sample.name",
                    minWidth: 300,
                  },
                  {
                    Header: "Owner",
                    accessor: "user.name",
                  },
                  {
                    Header: "Published Date",
                    accessor: "dateCreated",
                    minWidth: 150,
                    Cell: (row) => <>{getDateTime(row.original.dateCreated)}</>,
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
                infoRowsText="Glycans"
                glycanId={glycanId}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default GlycanList;
