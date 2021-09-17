/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import "../css/Search.css";
import Helmet from "react-helmet";
import { useParams } from "react-router-dom";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";
import { Tab, Tabs, Container } from "react-bootstrap";
import DatasetDetailSearchDataset from "../components/search/DatasetDetailSearchDataset";
import DatasetDetailSearchUser from "../components/search/DatasetDetailSearchUser";
// import GlycanAdvancedSearch from "../components/search/GlycanAdvancedSearch";
// import GlycanStructureSearch from "../components/search/GlycanStructureSearch";
// import GlycanSubstructureSearch from "../components/search/GlycanSubstructureSearch";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";

const DatasetDetailSearch = (props) => {
  const { searchId } = useParams();

  const [currentTab, setCurrentTab] = useState("dataset");
  const [searchData, setSearchData] = useState(null);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  useEffect(() => {
    if (searchId) {
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
    }
  }, [searchId]);

  const glycanSearchSuccess = (response) => {
    response.json().then((data) => {
      const tabMaps = {
        GENERAL: "dataset",
        USER: "user",
      };
      setSearchData(data);
      setCurrentTab(tabMaps[data.type]);
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

  return (
    <>
      <Helmet>
        <title>{head.datasetDetailSearch.title}</title>
        {getMeta(head.datasetDetailSearch)}
      </Helmet>

      <div className="lander">
        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="glycansearch"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}

        <Container>
          <Title title="Dataset Detail Search" />
          <Tabs
            defaultActiveKey="dataset"
            transition={false}
            activeKey={currentTab}
            mountOnEnter={true}
            unmountOnExit={false}
            onSelect={(key) => setCurrentTab(key)}
          >
            <Tab eventKey="dataset" className="pt-2" title="Dataset">
              <div style={{ paddingBottom: "20px" }}></div>
              <Container className="tab-content-border">
                <DatasetDetailSearchDataset searchData={searchData} />
              </Container>
            </Tab>
            <Tab eventKey="user" title="User" className="tab-content-padding">
              <Container className="tab-content-border">
                <DatasetDetailSearchUser searchData={searchData} />
              </Container>
            </Tab>
          </Tabs>
        </Container>
      </div>
    </>
  );
};

export { DatasetDetailSearch };
