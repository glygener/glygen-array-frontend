import React, { useEffect } from "react";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { head, getMeta } from "../utils/head";

const Contribute = props => {
  useEffect(props.authCheckAgent);

  return (
    <>
      <Helmet>
        <title>{head.contribute.title}</title>
        {getMeta(head.contribute)}
      </Helmet>
      <div className="lander">
        <h1>Glycan Array data</h1>
        <p>To add your data into the repository, please choose one of the items on the left.</p>
      </div>
    </>
  );
};

Contribute.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Contribute };
