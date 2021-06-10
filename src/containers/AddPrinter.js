import React, { useEffect } from "react";
import { MetaData } from "./MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";
import { useParams, useLocation } from "react-router-dom";

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

      <div className="page-container">
        <Title title="Create Printer" />
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
      </div>
    </>
  );
};

AddPrinter.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddPrinter };
