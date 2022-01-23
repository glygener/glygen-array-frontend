import React, { useEffect } from "react";
import { MetaData } from "../containers/MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, useLocation } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";

const AddSample = props => {
  let type = "SAMPLE";
  let isCopySample = false;
  let { sampleId } = useParams();
  let location = useLocation();

  if (location.search && location.search === "?copySample") {
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

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading title="Create Sample" subTitle="Please provide the information for the new sample." />
          <Card>
            <Card.Body>
              <MetaData
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
