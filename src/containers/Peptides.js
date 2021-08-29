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
  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
  }, []);

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
          showSearchBox
          commentsRefColumn="description"
          deleteWS="peptidedelete"
          editUrl="peptides/editpeptide"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Peptides"
          showDeleteButton={props.showDeleteButton}
          showEditButton={props.showEditButton}
          fetchWS={props.onlyMyLinkers ? "listallmoleculesbytype" : "listmoleculesbytype"}
          paramTypeValue={"PEPTIDE"}
          isModal={props.isModal}
          selectButtonHeader={props.selectButtonHeader ? "Select" : ""}
          showSelectButton={props.showSelectButton}
          selectButtonHandler={props.selectButtonHandler}
          showOnlyMyLinkersOrGlycansCheckBox={props.showOnlyMyLinkersOrGlycansCheckBox}
          handleChangeForOnlyMyLinkersGlycans={props.handleChangeForOnlyMyLinkersGlycans}
          onlyMyLinkersGlycans={props.onlyMyLinkersGlycans}
          onlyMyLinkersGlycansCheckBoxLabel={
            props.onlyMyLinkersGlycansCheckBoxLabel ? props.onlyMyLinkersGlycansCheckBoxLabel : ""
          }
        />
      </div>
    </>
  );
};

Peptides.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Peptides };
