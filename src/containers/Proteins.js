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

const Proteins = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.proteins.title}</title>
        {getMeta(head.proteins)}
      </Helmet>

      <div className="page-container">
        <Title title="Proteins" />

        <Col className={"col-link-button"}>
          <Link to="/proteins/addprotein" className="link-button" style={{ width: "150px" }}>
            Add Protein
          </Link>
        </Col>

        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name"
            },
            {
              Header: "UniProtID",
              accessor: "uniProtId"
            }
          ]}
          defaultPageSize={10}
          defaultSortColumn="id"
          showCommentsButton
          showDeleteButton
          showSearchBox
          showEditButton
          commentsRefColumn="description"
          fetchWS="listmoleculesbytype"
          paramTypeValue={"PROTEIN"}
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

Proteins.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Proteins };
