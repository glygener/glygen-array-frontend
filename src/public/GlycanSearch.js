/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import "../css/Search.css";
import Helmet from "react-helmet";
import { useParams } from "react-router-dom";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";
import { Tab, Tabs, Container } from "react-bootstrap";
import GlycanAdvancedSearch from "../components/search/GlycanAdvancedSearch";
import GlycanStructureSearch from "../components/search/GlycanStructureSearch";
import GlycanSubstructureSearch from "../components/search/GlycanSubstructureSearch";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";

const GlycanSearch = (props) => {
  const { searchId } = useParams();

  const [currentTab, setCurrentTab] = useState("general");
  const [inputValue, setInputValue] = useState(null);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  useEffect(() => {
    if (searchId) {
      wsCall(
        "listglycansforsearch",
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
        MASS: "general",
        STRUCTURE: "structure",
        SUBSTRUCTURE: "substructure",
      };
      setCurrentTab(tabMaps[data.type]);
      setInputValue(data.input);
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
        <title>{head.glycanSearch.title}</title>
        {getMeta(head.glycanSearch)}
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
          <Title title="Glycan Search" />
          <Tabs
            defaultActiveKey="general"
            transition={false}
            activeKey={currentTab}
            mountOnEnter={true}
            unmountOnExit={true}
            onSelect={(key) => setCurrentTab(key)}
          >
            <Tab eventKey="general" className="pt-2" title="General">
              <div style={{ paddingBottom: "20px" }}></div>
              <Container className="tab-content-border">
                <GlycanAdvancedSearch inputValue={inputValue} />
              </Container>
            </Tab>
            <Tab eventKey="structure" className="tab-content-padding" title="Structure Search">
              <Container className="tab-content-border">
                <GlycanStructureSearch inputValue={inputValue} />
              </Container>
            </Tab>
            <Tab
              eventKey="substructure"
              title="Substructure Search"
              className="tab-content-padding"
            >
              <Container className="tab-content-border">
                <GlycanSubstructureSearch inputValue={inputValue} />
              </Container>
            </Tab>
          </Tabs>
        </Container>
      </div>
    </>
  );
};

export { GlycanSearch };
