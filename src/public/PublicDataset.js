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
import { Link } from "react-router-dom";

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
        <div>
          <strong>Dataset Name: </strong>
          {dataset.name} (<Link to={`/data/dataset/${datasetId}/metadata`}>{"Dataset Metadata"}</Link>)
        </div>
        <div>
          <strong>Submission Date: </strong>
          {getDateCreated(dataset.dateAddedToLibrary)}
        </div>
        <div>
          <strong>Release Date: </strong>
          {getDateCreated(dataset.dateCreated)}
        </div>
        {!dataset.keywords ? (
          <div>
            <strong>Keywords: </strong>
            <KeywordsOnExp keywords={dataset.keywords} fromPublicDatasetPage={true} />
          </div>
        ) : (
          ""
        )}
        {dataset.description && (
          <div>
            <strong>Description: </strong>
            {getDescription(dataset.description)}
            <button className={"more-less"} onClick={() => setDescOpen(!descOpen)}>
              {dataset.description.length > 150 && !descOpen ? `more` : descOpen ? `less` : ``}
            </button>
          </div>
        )}
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

      <div className="ml-4 mr-3 mt-3 mb-3">
        {!enableMetadata && dataset ? (
          <>
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Body>
                    <Title title="Summary" />
                    {getDetails()}
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    <Title title="Samples" />
                    {dataset.sample && dataset.sample.id ? (
                      <MetadataKeyPairs metadataId={dataset.sample.id} wsCall={"getpublicsample"} />
                    ) : null}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Card className="mb-3">
              <Card.Body>
                <HistogramTable dataset={dataset} />
              </Card.Body>
            </Card>
            <Card className="mb-3">
              <Card.Body>
                <Title title="Files" />
                {/* <Files
                    dataset={dataset}
                    setEnableMetadata={setEnableMetadata}
                    setPageErrorsJson={setPageErrorsJson}
                    setPageErrorMessage={setPageErrorMessage}
                    setShowErrorSummary={setShowErrorSummary}
                  /> */}
                <Row>
                  <Col md={12}>
                    <DataTreeView
                      data={dataset}
                      experimentId={dataset.id}
                      fromPublicDatasetPage={true}
                      setSelectedTreeData={setSelectedTreeData}
                    />
                  </Col>
                  <Col>{selectedTreeData && <DataView data={selectedTreeData} />}</Col>
                </Row>
              </Card.Body>
            </Card>
            <Card className="mb-3">
              <Card.Body>
                <Title title="Supplementary Files" />
                {!dataset.files ? (
                  <FilesOnExp files={dataset.files} fromPublicDatasetPage={true} />
                ) : (
                  <span>No data available</span>
                )}
              </Card.Body>
            </Card>
            <Card className="mb-3">
              <Card.Body>
                <Title title="Publications" />
                {!dataset.publications ? (
                  <PubOnExp publications={dataset.publications} fromPublicDatasetPage={true} />
                ) : (
                  <span>No data available</span>
                )}
              </Card.Body>
            </Card>
            <Card className="mb-3">
              <Card.Body>
                <Title title="Submitter" />
                {dataset.user && dataset.user.name ? (
                  <SubmitterDetails wsCall={"getuserdetails"} username={dataset.user.name} />
                ) : null}
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <Title title="Grants" />
                {!dataset.grants ? (
                  <GrantsOnExp grants={dataset.grants} fromPublicDatasetPage={true} />
                ) : (
                  <span>No data available</span>
                )}
              </Card.Body>
            </Card>
            <div className="text-center mb-2 mt-2">
              <Button className="gg-btn-blue" onClick={() => history.push("/data")}>
                Back
              </Button>
            </div>
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
