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


const ImageAnalysis = props => {
  useEffect(props.authCheckAgent, []);
  const [showSpinner, setShowSpinner] = useState(false);
  return (
    <>
      <Helmet>
        <title>{head.imageAnalysis.title}</title>
        {getMeta(head.imageAnalysis)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Image Analysis Metadata"
            subTitle="The table below displays a list of all image analysis metadata that have been uploaded to your repository. New image analysis metadata may be added, old image analysis  metadatacan be edited, and unused image analysis metadata can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/imageAnalysis/addImageMetadata">
                  <Button className="gg-btn-blue mt-2">Add Image Analysis Metadata</Button>
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
                fetchWS="listimagemetadata"
                showExport
                setShowSpinner={setShowSpinner}
                handleExport={exportFileMetadata}
                exportTitle={"Export metadata to file"}
                deleteWS="imagemetadatadelete"
                editUrl="imageAnalysis/editImageAnalysisMetadata"
                copyUrl="imageAnalysis/copyImageAnalysisMetadata"
                copyPage="copyImageAnalysis"
                keyColumn="id"
                form={"metadata"}
                showRowsInfo
                infoRowsText="Image Analysis Metadata"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

ImageAnalysis.propTypes = { authCheckAgent: PropTypes.func };

export { ImageAnalysis };
