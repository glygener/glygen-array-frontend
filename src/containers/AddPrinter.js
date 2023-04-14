import React, { useEffect } from "react";
import { MetaData } from "./MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, useLocation } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";

const AddPrinter = props => {
  let type = "PRINTER";
  let location = useLocation();
  let { printerId } = useParams();
  let isCopyPrinter = false;

  if (location.search && location.search === "?copyPrinter") {
    isCopyPrinter = true;
  }

  useEffect(() => {
    if (!printerId || printerId === "") {
      props.authCheckAgent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.addPrinter.title}</title>
        {getMeta(head.addPrinter)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title={printerId ? "Edit Printer Metadata" : "Add Printer Metadata to Repository"}
            subTitle={
              printerId
                ? "Update printer metadata information. Name must be unique in your printer metadata repository and cannot be used for more than one printer metadata."
                : "Please provide the information for the new printer metadata."
            }
          />
          <Card>
            <Card.Body>
              <MetaData
                metaID={printerId}
                isCopy={isCopyPrinter}
                type={type}
                getMetaData={"getprinter"}
                addMeta={"addprinter"}
                updateMeta={"updateprinter"}
                redirectTo={"printers"}
                metadataType={"Printer"}
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

AddPrinter.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddPrinter };
