import React, { useEffect } from "react";
import { MetaData } from "../containers/MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useLocation, useParams } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";

const AddSlideMeta = props => {
  let type = "SLIDE";
  let { slideMetaId } = useParams();
  let location = useLocation();
  let isCopySlideMeta = false;

  if (location.search && location.search === "?copySlideMeta") {
    isCopySlideMeta = true;
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
        <title>{head.addSlideMeta.title}</title>
        {getMeta(head.addSlideMeta)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading title="Create Slide Metadata" subTitle="Please provide the information for the new printer." />
          <Card>
            <Card.Body>
              <MetaData
                metaID={slideMetaId}
                isCopy={isCopySlideMeta}
                type={type}
                getMetaData={"getslidemeta"}
                addMeta={"addslidemeta"}
                updateMeta={"updateslidemeta"}
                redirectTo={"listslidemeta"}
                metadataType={"Slide Metadata"}
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

AddSlideMeta.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddSlideMeta };
