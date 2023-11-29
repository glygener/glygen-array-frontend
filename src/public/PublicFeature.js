import React from "react";
import { useParams } from "react-router-dom";
import { FeatureView } from "../containers/FeatureView";

const PublicFeature = () => {
    let { featureId } = useParams();

    return (
        <>
            <FeatureView publicView={featureId} />
        </>
    );
};

PublicFeature.propTypes = {};

export { PublicFeature };