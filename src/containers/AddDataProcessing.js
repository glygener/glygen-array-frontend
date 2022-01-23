import React, { useEffect } from "react";
import { MetaData } from "../containers/MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, useLocation } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";

const AddDataProcessing = props => {
  let type = "DATAPROCESSINGSOFTWARE";
  let { dataProcessingId } = useParams();
  let location = useLocation();
  let isCopyDataProcessing = false;

  if (location.search && location.search === "?copyDataProcessing") {
    isCopyDataProcessing = true;
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
        <title>{head.addDataProcessing.title}</title>
        {getMeta(head.addDataProcessing)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading title="Create Data Processing" subTitle="Please provide the information for the new data processing." />
          <Card>
            <Card.Body>
              <MetaData
                metaID={dataProcessingId}
                isCopy={isCopyDataProcessing}
                type={type}
                getMetaData={"getdataprocessing"}
                addMeta={"adddataprocessing"}
                updateMeta={"updatedataprocessing"}
                redirectTo={"dataprocessing"}
                metadataType={"Data Processing"}
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

AddDataProcessing.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddDataProcessing };
