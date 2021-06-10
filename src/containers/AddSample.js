import React, { useEffect } from "react";
import { MetaData } from "../containers/MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";
import { useParams, useLocation } from "react-router-dom";

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
      <div className="page-container">
        <Title title="Create Sample" />

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
      </div>
    </>
  );
};

AddSample.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddSample };
