import React, { useState } from "react";
import Helmet from "react-helmet";
import { useParams } from "react-router-dom";
import Container from "@material-ui/core/Container";
// import PageLoader from "../components/load/PageLoader";
import GlycanListSummary from "../components/GlycanListSummary";
// import { Link } from "react-router-dom";
// import LineTooltip from "../components/tooltip/LineTooltip";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import Grid from "@material-ui/core/Grid";
import { PublicListDataset } from "../public/PublicListDataset";
import { Card } from "react-bootstrap";

const GlycanList = (props) => {
  let { id } = useParams();

  const [query, setQuery] = useState([]);
  const [timestamp, setTimeStamp] = useState();
  const [totalSize, setTotalSize] = useState();

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  const listGlycans = (glytoucanIds, minMass, maxMass) => {
    wsCall(
      "listglycansforsearch",
      "GET",
      // null,
      false,
      {
        glytoucanIds: [glytoucanIds],
        maxMass,
        minMass,
      },
      glycanSearchSuccess,
      glycanSearchFailure
    );
  };

  const glycanSearchSuccess = (response) => {
    response.json().then((resp) => {
      console.log(resp);
    });
  };

  const glycanSearchFailure = (response) => {
    response.json().then((resp) => {
      console.log(resp);
      setPageErrorsJson(resp);
      setShowErrorSummary(true);
      setPageErrorMessage("");
    });
  };

  // const handleModifySearch = () => {
  //   props.history.push(routeConstants.idMapping + id);
  // };

  return (
    <>
      {/* <Helmet>
        <title>{head.glycans.title}</title>
        {getMeta(head.glycans)}
      </Helmet> */}

      <Container maxWidth="xl" className="gg-container">
        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="listglycansforsearch"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}
        <section className="content-box-md">
          {query && (
            <GlycanListSummary
              data={query}
              totalSize={totalSize}
              timestamp={timestamp}
              // onModifySearch={handleModifySearch}
            />
          )}
        </section>

        <section>Table</section>
        <Grid container style={{ marginTop: "32px" }}>
          <Grid item xs={12} sm={12} style={{ backgroundColor: "white" }}>
            {/* <Card>
              <PublicListDataset />
            </Card> */}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default GlycanList;
