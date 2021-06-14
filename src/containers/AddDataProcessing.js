import React, { useEffect } from "react";
import { MetaData } from "../containers/MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";
import { useParams, useLocation } from "react-router-dom";

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
      <div className="page-container">
        <Title title="Create Data Processing" />

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
      </div>
    </>
  );
};

AddDataProcessing.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddDataProcessing };
