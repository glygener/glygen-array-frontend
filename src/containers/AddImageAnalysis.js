import React, { useEffect } from "react";
import { MetaData } from "../containers/MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";
import { useParams, useLocation } from "react-router-dom";

const AddImageAnalysis = props => {
  let type = "IMAGEANALYSISSOFTWARE";
  let { imageAnalysisId } = useParams();
  let location = useLocation();
  let isCopyImageAnalysis = false;

  if (location.search && location.search === "?copyImageAnalysis") {
    isCopyImageAnalysis = true;
  }

  useEffect(() => {
    if (!imageAnalysisId || imageAnalysisId === "") {
      props.authCheckAgent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.addImageAnalysis.title}</title>
        {getMeta(head.addImageAnalysis)}
      </Helmet>
      <Title title="Create Image Analysis" />
      <MetaData
        metaID={imageAnalysisId}
        isCopy={isCopyImageAnalysis}
        type={type}
        getMetaData={"getimageanalysis"}
        addMeta={"addimageanalysis"}
        updateMeta={"updateimageanalysis"}
        redirectTo={"imageanalysis"}
        metadataType={"Image Analysis"}
      />
    </>
  );
};

AddImageAnalysis.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddImageAnalysis };
