import React from "react";
import { useParams } from "react-router-dom";
import { AddBlockLayout } from "../containers/AddBlockLayout";

const PublicBlockLayout = () => {
    let { blockLayoutId } = useParams();

    return (
        <>
            <AddBlockLayout publicView={blockLayoutId} />
        </>
    );
};

PublicBlockLayout.propTypes = {};

export { PublicBlockLayout };