import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { Col, ButtonToolbar } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { Title } from "../components/FormControls";

const ImageAnalysis = props => {
  useEffect(props.authCheckAgent, []);
  return (
    <>
      <Helmet>
        <title>{head.imageanalysis.title}</title>
        {getMeta(head.imageanalysis)}
      </Helmet>

      <div className="page-container">
        <Title title="Image Analysis" />

        <ButtonToolbar>
          <Col className={"col-link-button"}>
            <Link to="/imageanalysis/addImageMetadata" className="link-button" style={{ width: "180px" }}>
              Add Image Metadata
            </Link>
          </Col>
        </ButtonToolbar>

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
          showMirageCompliance
          commentsRefColumn="description"
          fetchWS="listimagemetadata"
          deleteWS="imagemetadatadelete"
          editUrl="imageanalysis/editImageAnalysisMetadata"
          copyUrl="imageanalysis/copyImageAnalysisMetadata"
          copyPage="copyImageAnalysis"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Image Analysis"
        />
      </div>
    </>
  );
};

ImageAnalysis.propTypes = { authCheckAgent: PropTypes.func };

export { ImageAnalysis };
