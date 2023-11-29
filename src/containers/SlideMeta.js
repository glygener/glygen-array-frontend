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


const SlideMeta = props => {
  useEffect(props.authCheckAgent, []);
  const [showSpinner, setShowSpinner] = useState(false);
  return (
    <>
      <Helmet>
        <title>{head.slidemeta.title}</title>
        {getMeta(head.slidemeta)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Slide Metadata"
            subTitle="The table below displays a list of all slide metadata that have been uploaded to your repository. New slide metadata may be added, old slide metadata can be edited, and unused slide metadata can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/listSlideMeta/addSlideMeta">
                  <Button className="gg-btn-blue mt-2">Add Slide Metadata</Button>
                </Link>
                <Link
                  to={{
                    pathname: "/listSlideMeta/importFromFile",
                    state: {
                      templateType: "SLIDE"
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
                templateType={"SLIDE"}
                fileName={"exportslidemetadata"}
                fetchWS="listslidemeta"
                deleteWS="slideMetaDelete"
                editUrl="listSlideMeta/editSlideMeta"
                copyUrl="listSlideMeta/copySlideMeta"
                copyPage="copySlideMeta"
                keyColumn="id"
                form={"metadata"}
                showRowsInfo
                infoRowsText="Slide Metadata"
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

SlideMeta.propTypes = {
  authCheckAgent: PropTypes.func
};

export { SlideMeta };
