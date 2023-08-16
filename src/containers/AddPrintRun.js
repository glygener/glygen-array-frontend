import React, { useEffect } from "react";
import { MetaData } from "./MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, useLocation } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import FeedbackWidget from "../components/FeedbackWidget";

const AddPrintRun = props => {
  let type = "PRINTRUN";
  let location = useLocation();
  let { printRunId } = useParams();
  let isCopyPrintRun = false;

  if (location.search && location.search === "?copyPrintRun") {
    isCopyPrintRun = true;
  }

  if (location && location.pathname.includes("copyPrintRun")) {
    isCopyPrintRun = true;
  }

  useEffect(() => {
    if (!printRunId || printRunId === "") {
      props.authCheckAgent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.addPrintRun.title}</title>
        {getMeta(head.addPrintRun)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title={printRunId ? "Edit Print Run Metadata" : "Add Print Run Metadata to Repository"}
            subTitle={
              printRunId
                ? "Update Print Run metadata information. Name must be unique in your Print Run metadata repository and cannot be used for more than one Print Run metadata."
                : "Please provide the information for the new Print Run metadata"
            }
          />
          <Card>
            <Card.Body>
              <MetaData
                metaID={printRunId}
                isCopy={isCopyPrintRun}
                type={type}
                getMetaData={"getprintrun"}
                addMeta={"addprintrun"}
                updateMeta={"updateprintrun"}
                redirectTo={"printRun"}
                metadataType={"Printrun"}
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

AddPrintRun.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddPrintRun };
