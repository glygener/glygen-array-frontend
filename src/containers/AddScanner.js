import React, { useEffect } from "react";
import { MetaData } from "../containers/MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";
import { useParams, useLocation } from "react-router-dom";

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

      <div className="page-container">
        <Title title="Create Scanner" />
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
      </div>
    </>
  );
};

AddScanner.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddScanner };
