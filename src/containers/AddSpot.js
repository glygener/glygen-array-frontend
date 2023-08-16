import React, { useEffect } from "react";
import { MetaData } from "../containers/MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, useLocation } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import FeedbackWidget from "../components/FeedbackWidget";

const AddSpot = props => {
  let type = "SPOT";
  let { spotId } = useParams();
  let location = useLocation();
  let isCopySpot = false;

  if (location.search && location.search === "?copySpot") {
    isCopySpot = true;
  }

  if (location && location.pathname.includes("copySpot")) {
    isCopySpot = true;
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
        <title>{head.addSpot.title}</title>
        {getMeta(head.addSpot)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title={spotId ? "Edit Spot Metadata" : "Add Spot Metadata to Repository"}
            subTitle={
              spotId
                ? "Update spot metadata information. Name must be unique in your spot metadata repository and cannot be used for more than one spot metadata."
                : "Please provide the information for the new spot metadata."
            }
          />

          <Card>
            <Card.Body>
              <MetaData
                metaID={spotId}
                isCopy={isCopySpot}
                type={type}
                getMetaData={"getspotmetadata"}
                addMeta={"addspotmetadata"}
                updateMeta={"updatespotmetadata"}
                redirectTo={"spots"}
                metadataType={"Spot"}
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

AddSpot.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddSpot };
