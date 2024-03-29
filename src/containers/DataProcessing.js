import React, { useEffect, useState } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Button } from "react-bootstrap";
import FeedbackWidget from "../components/FeedbackWidget";
import { exportFileMetadata } from "../utils/commonUtils";


const DataProcessing = props => {
  useEffect(props.authCheckAgent, []);
  const [showSpinner, setShowSpinner] = useState(false);
  return (
    <>
      <Helmet>
        <title>{head.dataProcessing.title}</title>
        {getMeta(head.dataProcessing)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Data Processing Software Metadata"
            subTitle="The table below displays a list of all data processing software metadata that have been uploaded to your repository. New data processing software metadata may be added, old data processing software metadata can be edited, and unused data processing software metadata can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/dataProcessing/addDataProcessing">
                  <Button className="gg-btn-blue mt-2">Add Data Processing Software Metadata</Button>
                </Link>
                <Link
                  to={{
                    pathname: "/dataProcessing/importFromFile",
                    state: {
                      templateType: "DATAPROCESSINGSOFTWARE"
                    },
                  }}
                >
                  <Button className="gg-btn-blue mt-2 gg-ml-20">Add Metadata from file</Button>
                </Link>
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Name",
                    accessor: "name"
                  },
                  {
                    Header: "Template",
                    accessor: "template"
                  }
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                showCommentsButton
                showDeleteButton
                showEditButton
                showCopyButton
                showSearchBox
                showMirageCompliance
                commentsRefColumn="description"
                exportData
                exportWsCall={"contributeexportmetadata"}
                templateType={"DATAPROCESSINGSOFTWARE"}
                fileName={"exportdataprocessingmetadata"}
                fetchWS="listdataprocessing"
                deleteWS="dataprocessingdelete"
                editUrl="dataProcessing/editDataProcessing"
                copyUrl="dataProcessing/copyDataProcessing"
                copyPage="copyDataProcessing"
                keyColumn="id"
                form={"metadata"}
                showRowsInfo
                infoRowsText="Data Processing Software Metadata"
                showExport
                setShowSpinner={setShowSpinner}
                handleExport={exportFileMetadata}
                exportTitle={"Export metadata to file"}
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

DataProcessing.propTypes = { authCheckAgent: PropTypes.func };

export { DataProcessing };
