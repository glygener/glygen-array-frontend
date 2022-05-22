/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import "./PublicDataset.css";
import { getDateCreated } from "../utils/commonUtils";
import { Row, Col, Button, Card } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import { useParams, useHistory } from "react-router-dom";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import HistogramTable from "./HistogramTable";
import SubmitterDetails from "./SubmitterDetails";
import PublicMetadata from "./PublicMetadata";
import MetadataKeyPairs from "../public/MetadataKeyPairs";
import { Title } from "../components/FormControls";
import { DataTreeView, DataView } from "../components/DataTreeView";
import { FilesOnExp } from "../components/FilesOnExp";
import { KeywordsOnExp } from "../components/KeywordsOnExp";
import { GrantsOnExp } from "../components/GrantsOnExp";
import { PubOnExp } from "../components/PubOnExp";

// const Files = React.lazy(() => import("./Files"));
// const SubmitterDetails = React.lazy(() => import("./SubmitterDetails"));
// const PublicMetadata = React.lazy(() => import("./PublicMetadata"));
// const HistogramTable = React.lazy(() => import("./HistogramTable"));
// const MetadataKeyPairs = React.lazy(() => import("../public/MetadataKeyPairs"));

const PublicDataset = () => {
  let { datasetId } = useParams();

  const history = useHistory();
  const [dataset, setDataset] = useState();
  const [descOpen, setDescOpen] = useState(false);
  const [enableMetadata, setEnableMetadata] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [selectedTreeData, setSelectedTreeData] = useState(false);
  // const [pageLoading, setPageLoading] = useState(true);
  // let count = 0;

  useEffect(() => {
    wsCall(
      "getpublicdataset",
      "GET",
      { qsParams: { offset: "0", loadAll: false }, urlParams: [datasetId] },
      false,
      null,
      response =>
        response.json().then(responseJson => {
          setDataset(responseJson);
        }),
      errorWscall
    );
  }, [datasetId]);

  function errorWscall(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setPageErrorMessage("");
      setShowErrorSummary(true);
    });
  }

  const getDetails = () => {
    return (
      <>
        <div style={{ textAlign: "left", marginLeft: "15px" }}>
          <span className={"dataset-subheadings"}>Title</span>
          <br />
          {dataset.name && <div>{dataset.name}</div>}
          <br />

          <span className={"dataset-subheadings"}>Description</span>
          <br />
          {dataset.description && (
            <div className={"description"}>
              {getDescription(dataset.description)}
              <button className={"more-less"} onClick={() => setDescOpen(!descOpen)}>
                {dataset.description.length > 150 && !descOpen ? `more` : descOpen ? `less` : ``}
              </button>
            </div>
          )}
          <br />

          <span className={"dataset-subheadings"}>Submission Date</span>
          <br />
          {dataset.dateCreated && <div>{getDateCreated(dataset.dateCreated)}</div>}
          <br />

          <span className={"dataset-subheadings"}>Release Date</span>
          <br />
          {dataset.dateAddedToLibrary && <div>{getDateCreated(dataset.dateAddedToLibrary)}</div>}

          <br />
          <span className={"dataset-subheadings"}>Keywords</span>
          <KeywordsOnExp keywords={dataset.keywords} fromPublicDatasetPage={true} />

          <br />
        </div>
      </>
    );
  };

  const getDescription = desc => {
    return desc.length > 150 && !descOpen ? `${desc.substring(0, 100)}...` : descOpen ? `${desc}` : desc;
  };

  return (
    <>
      <Helmet>
        <title>{head.publicdatalist.title}</title>
        {getMeta(head.publicdatalist)}
      </Helmet>

      {showErrorSummary === true && (
        <ErrorSummary
          show={showErrorSummary}
          form="experiments"
          errorJson={pageErrorsJson}
          errorMessage={pageErrorMessage}
        />
      )}

      <div
        style={{
          margin: "0 20px 25px"
        }}
      >
        {!enableMetadata && dataset ? (
          <>
            <Row>
              <Col md={8}>
                <Card>
                  <Title title={"Summary"} />
                  {getDetails()}
                </Card>
              </Col>
              <Col md={4}>
                <Card>
                  <Title title={"Submitter"} />
                  {dataset.user && dataset.user.name ? (
                    <SubmitterDetails wsCall={"getuserdetails"} username={dataset.user.name} />
                  ) : null}
                </Card>
              </Col>
            </Row>
            &nbsp;
            <Row>
              <Col md={8}>
                <Card>
                  <HistogramTable dataset={dataset} />
                </Card>
              </Col>
              <Col>
                <Card>
                  <Title title={"Samples"} />
                  {dataset.sample && dataset.sample.id ? (
                    <MetadataKeyPairs metadataId={dataset.sample.id} wsCall={"getpublicsample"} />
                  ) : null}
                </Card>
                <br />
                <Card>
                  <Title title={"Grants"} />
                  {/* Grants */}
                  <GrantsOnExp grants={dataset.grants} fromPublicDatasetPage={true} />
                </Card>
              </Col>
            </Row>
            &nbsp;
            <Row>
              <Col md={8}>
                <Card>
                  <Title title={"Files"} />
                  {/* <Files
                    dataset={dataset}
                    setEnableMetadata={setEnableMetadata}
                    setPageErrorsJson={setPageErrorsJson}
                    setPageErrorMessage={setPageErrorMessage}
                    setShowErrorSummary={setShowErrorSummary}
                  /> */}
                  <Row>
                    <div
                      style={{
                        width: "70%"
                      }}
                    >
                      <DataTreeView
                        data={dataset}
                        experimentId={dataset.id}
                        fromPublicDatasetPage={true}
                        setSelectedTreeData={setSelectedTreeData}
                      />
                    </div>
                    <div>{selectedTreeData && <DataView data={selectedTreeData} />}</div>
                  </Row>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col md={8}>
                <FilesOnExp files={dataset.files} fromPublicDatasetPage={true} />
              </Col>
            </Row>
            <Row>
              <Col md={8}>
                <PubOnExp publications={dataset.publications} fromPublicDatasetPage={true} />
              </Col>
            </Row>
            <br />
            <Row>
              <Col md={{ span: 2, offset: 5 }}>
                <Button style={{ width: "60%" }} onClick={() => history.push("/data")}>
                  Back
                </Button>
              </Col>
            </Row>
          </>
        ) : (
          enableMetadata && <PublicMetadata dataset={dataset} setEnableMetadata={setEnableMetadata} />
        )}
      </div>
    </>
  );
};

PublicDataset.propTypes = {};

export { PublicDataset };
