/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Col } from "react-bootstrap";
import { StructureImage } from "../components/StructureImage";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";
import { Container } from "react-bootstrap";

const SubmitterSearch = (props) => {
  // useEffect(props.authCheckAgent, []);

  return (
    <>
      {/* <Helmet>
        <title>{head.glycans.title}</title>
        {getMeta(head.glycans)}
      </Helmet> */}

      <Container maxWidth="md">
        <Title title="Submittter" />
        <div className="card-page-sm">
          <p>Is coming soon</p>
        </div>
      </Container>
    </>
  );
};

SubmitterSearch.propTypes = {
  authCheckAgent: PropTypes.func,
};

export { SubmitterSearch };
