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

const AddScanner = props => {
  let type = "SCANNER";
  let { scannerId } = useParams();
  let location = useLocation();
  let isCopyScanner = false;

  if (location.search && location.search === "?copyScanner") {
    isCopyScanner = true;
  }

  if (location && location.pathname.includes("copyScanner")) {
    isCopyScanner = true;
  }

  useEffect(() => {
    if (!scannerId || scannerId === "") {
      props.authCheckAgent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.addScanner.title}</title>
        {getMeta(head.addScanner)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title={scannerId ? "Edit Scanner Metadata" : "Add Scanner Metadata to Repository"}
            subTitle={
              scannerId
                ? "Update scanner metadata information. Name must be unique in your scanner metadata repository and cannot be used for more than one scanner metadata."
                : "Please provide the information for the new scanner metadata."
            }
          />
          <Card>
            <Card.Body>
              <Metadata
                metaID={scannerId}
                isCopy={isCopyScanner}
                type={type}
                getMetaData={"getscanner"}
                addMeta={"addscanner"}
                updateMeta={"updatescanner"}
                redirectTo={"scanners"}
                metadataType={"Scanner"}
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

AddScanner.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddScanner };
