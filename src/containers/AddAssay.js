import React, { useEffect } from "react";
import { Metadata } from "../containers/Metadata";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, useLocation } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import FeedbackWidget from "../components/FeedbackWidget";

const AddAssay = props => {
  let type = "ASSAY";
  let { assayId } = useParams();
  let isCopyAssay = false;
  let location = useLocation();

  if (location.search && location.search === "?copyAssay") {
    isCopyAssay = true;
  }

  if (location && location.pathname.includes("copyAssay")) {
    isCopyAssay = true;
  }

  if (props.location && props.location.search && props.location.search === "?copyAssay") {
    isCopyAssay = true;
  }



  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.addAssay.title}</title>
        {getMeta(head.addAssay)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title={assayId ? "Edit Assay Metadata" : "Add Assay Metadata to Repository"}
            subTitle={
              assayId
                ? "Update assay metadata information. Name must be unique in your assay metadata repository and cannot be used for more than one assay metadata."
                : "Please provide the information for the new assay metadata."
            }
          />
          <Card>
            <Card.Body>
              <Metadata
                metaID={assayId}
                isCopy={isCopyAssay}
                type={type}
                getMetaData={"getassaymetadata"}
                addMeta={"addassaymetadata"}
                updateMeta={"updateassaymetadata"}
                redirectTo={"assays"}
                metadataType={"Assay"}
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

AddAssay.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddAssay };
