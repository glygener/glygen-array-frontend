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

const OtherMolecules = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.othermolecules.title}</title>
        {getMeta(head.othermolecules)}
      </Helmet>

      <div className={!props.isImported ? "page-container" : ""}>
        <Title title="Other Molecules" />

        <Col className={"col-link-button"}>
          {!props.isImported && (
            <Link to="/othermolecules/addothermolecule" className="link-button" style={{ width: "180px" }}>
              Add Other Molecule
            </Link>
          )}
        </Col>

        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name"
            }
          ]}
          defaultPageSize={10}
          defaultSortColumn="id"
          showCommentsButton
          customCommentColumn
          showDeleteButton
          showSearchBox
          showEditButton
          commentsRefColumn="comment"
          fetchWS="listmoleculesbytype"
          paramTypeValue={"OTHER"}
          deleteWS="linkerdelete"
          editUrl="othermolecules/editlinker"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Peptides"
        />
      </div>
    </>
  );
};

OtherMolecules.propTypes = {
  authCheckAgent: PropTypes.func
};

export { OtherMolecules };
