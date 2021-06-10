import React, { useEffect } from "react";
import { MetaData } from "../containers/MetaData";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";
import { useParams, useLocation } from "react-router-dom";

const AddSpot = props => {
  let type = "SPOT";
  let { spotId } = useParams();
  let location = useLocation();
  let isCopySpot = false;

  if (location.search && location.search === "?copySpot") {
    isCopySpot = true;
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
        <title>{head.addSpot.title}</title>
        {getMeta(head.addSpot)}
      </Helmet>
      <div className="page-container">
        <Title title="Create Spot" />
        <MetaData
          metaID={spotId}
          isCopy={isCopySpot}
          type={type}
          getMetaData={"getspotmetadata"}
          addMeta={"addspotmetadata"}
          updateMeta={"updatespotmetadata"}
          redirectTo={"spots"}
          metadataType={"Spot"}
        />
      </div>
    </>
  );
};

AddSpot.propTypes = {
  authCheckAgent: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object
};

export { AddSpot };
