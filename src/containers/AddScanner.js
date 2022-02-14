import React, { useEffect } from "react";
import { MetaData } from "../containers/MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, useLocation } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";

const AddScanner = props => {
  let type = "SCANNER";
  let { scannerId } = useParams();
  let location = useLocation();
  let isCopyScanner = false;

  if (location.search && location.search === "?copyScanner") {
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

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading title="Add Scanner to Repository" subTitle="Please provide the information for the new scanner." />
          <Card>
            <Card.Body>
              <MetaData
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
