import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Button } from "react-bootstrap";

const ImageAnalysis = props => {
  useEffect(props.authCheckAgent, []);
  return (
    <>
      <Helmet>
        <title>{head.imageAnalysis.title}</title>
        {getMeta(head.imageAnalysis)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Image Analysis"
            subTitle="The table below displays a list of all image analysis that have been uploaded to your repository. New printers may be added, old image analysis can be edited, and unused image analysis can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/imageAnalysis/addImageMetadata">
                  <Button className="gg-btn-blue mt-2">Add Image Metadata</Button>
                </Link>
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Name",
                    accessor: "name",
                  },
                  {
                    Header: "Template",
                    accessor: "template",
                  },
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                showCommentsButton
                showDeleteButton
                showEditButton
                showCopyButton
                showMirageCompliance
                commentsRefColumn="description"
                fetchWS="listimagemetadata"
                deleteWS="imagemetadatadelete"
                editUrl="imageAnalysis/editImageAnalysisMetadata"
                copyUrl="imageAnalysis/copyImageAnalysisMetadata"
                copyPage="copyImageAnalysis"
                keyColumn="id"
                showRowsInfo
                infoRowsText="Image Analysis"
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
