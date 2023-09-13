import React, { useEffect } from "react";
import { Metadata } from "./Metadata";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, useLocation } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import FeedbackWidget from "../components/FeedbackWidget";

const AddSample = props => {
  let type = "SAMPLE";
  let isCopySample = false;
  let { sampleId } = useParams();
  let location = useLocation();

  /*if (location.search && location.search === "copySample") {
    isCopySample = true;
  }*/
  if (location && location.pathname.includes("copySample")) {
    isCopySample = true;
  }

  useEffect(() => {
    if (!sampleId || sampleId === "") {
      props.authCheckAgent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.addSample.title}</title>
        {getMeta(head.addSample)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title={sampleId ? "Edit Sample" : "Add Sample to Repository"}
            subTitle={
              sampleId
                ? "Update sample information. Name must be unique in your sample repository and cannot be used for more than one sample."
                : "Please provide the information for the new sample."
            }
          />
          <Card>
            <Card.Body>
              <Metadata
                metaID={sampleId}
                isCopy={isCopySample}
                type={type}
                getMetaData={"getsample"}
                addMeta={"addsample"}
                updateMeta={"updatesample"}
                redirectTo={"samples"}
                metadataType={"Sample"}
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

AddSample.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddSample };
