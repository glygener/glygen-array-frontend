import React, { useEffect } from "react";
import { MetaData } from "../containers/MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";

const AddAssay = props => {
  let type = "ASSAY";
  let { assayId } = useParams();
  let isCopyAssay = false;

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

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading title="Add Assay to Repository" subTitle="Please provide the information for the new assay." />
          <Card>
            <Card.Body>
              <MetaData
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
