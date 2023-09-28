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


const Scanners = props => {
  useEffect(props.authCheckAgent, []);
  const [showSpinner, setShowSpinner] = useState(false);
  return (
    <>
      <Helmet>
        <title>{head.scanners.title}</title>
        {getMeta(head.scanners)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Scanner Metadata"
            subTitle="The table below displays a list of all scanner metadata that have been uploaded to your repository. New scanner metadata may be added, old scanner metadata can be edited, and unused scanner metadata can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/scanners/addScanner">
                  <Button className="gg-btn-blue mt-2">Add Scanner Metadata</Button>
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
                fetchWS="listscanners"
                deleteWS="scannerdelete"
                editUrl="scanners/editScanner"
                copyUrl="scanners/copyScanner"
                copyPage="copyScanner"
                keyColumn="id"
                form={"metadata"}
                showRowsInfo
                infoRowsText="Scanner Metadata"
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

Scanners.propTypes = { authCheckAgent: PropTypes.func };

export { Scanners };
