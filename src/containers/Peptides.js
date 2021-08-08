/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Col } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";

const Peptides = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.peptides.title}</title>
        {getMeta(head.peptides)}
      </Helmet>

      <div className="page-container">
        <Title title="Peptides" />

        <Col className={"col-link-button"}>
          <Link to="/peptides/addpeptide" className="link-button" style={{ width: "150px" }}>
            Add Peptide
          </Link>
        </Col>

        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name"
            },
            {
              Header: "Sequence",
              accessor: "sequence"
            }
          ]}
          defaultPageSize={10}
          defaultSortColumn="id"
          showCommentsButton
          showDeleteButton
          showSearchBox
          showEditButton
          commentsRefColumn="description"
          fetchWS="peptidelist"
          deleteWS="peptidedelete"
          editUrl="peptides/editpeptide"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Peptides"
        />
      </div>
    </>
  );
};

Peptides.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Peptides };
