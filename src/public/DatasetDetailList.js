import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, Link, useHistory } from "react-router-dom";
import Container from "@material-ui/core/Container";
import DatasetDettailListSummary from "../components/DatasetDettailListSummary";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import Grid from "@material-ui/core/Grid";
import { Card } from "react-bootstrap";
import { SearchTable } from "../components/search/SearchTable";
import { StructureImage } from "../components/StructureImage";
import glygenNotFoundSmall from "../images/glygenNotFoundSmall.svg";
import { PublicListDataset } from "./PublicListDataset";

const DatasetDetailList = () => {
  const { searchId } = useParams();
  const history = useHistory();

  const [query, setQuery] = useState(null);
  const [timestamp, setTimeStamp] = useState();

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  const handleModifySearch = () => {
    history.push("/datasetDetailSearch/" + searchId);
  };
  useEffect(() => {
    wsCall(
      "listdatasetsforsearch",
      "GET",
      {
        offset: 0,
        limit: 1,
        searchId,
      },
      true,
      null,
      glycanSearchSuccess,
      glycanSearchFailure
    );
  }, [searchId]);

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

  return (
    <>
      <Helmet>
        <title>{head.publicdatalist.title}</title>
        {getMeta(head.publicdatalist)}
      </Helmet>
      <Container maxWidth="xl" className="gg-container">
        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="listdatasetsforsearch"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}
        <section className="content-box-md">
          {query && (
            <DatasetDettailListSummary
              data={query}
              timestamp={timestamp}
              onModifySearch={handleModifySearch}
              searchId={searchId}
            />
          )}
        </section>
      </Container>

      <Card
        style={{
          width: "95%",
          margin: "2%",
        }}
      >
        <PublicListDataset />
      </Card>
    </>
  );
};

DatasetDetailList.propTypes = {};

export { DatasetDetailList };
