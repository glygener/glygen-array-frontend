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
import { getToolTip } from "../utils/commonUtils";

const Proteins = props => {
  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.proteins.title}</title>
        {getMeta(head.proteins)}
      </Helmet>

      <div className={!props.isImported ? "page-container" : ""}>
        <Title title="Proteins" />

        <Col className={"col-link-button"}>
          {!props.isImported && (
            <Link to="/proteins/addprotein" className="link-button" style={{ width: "150px" }}>
              Add Protein
            </Link>
          )}
        </Col>

        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name",
              Cell: row => getToolTip(row.original.name)
            },
            {
              Header: "UniProtID",
              accessor: "uniProtId",
              Cell: row => getToolTip(row.original.uniProtId)
            }
          ]}
          defaultPageSize={10}
          defaultSortColumn="id"
          showCommentsButton
          showSearchBox
          commentsRefColumn="comment"
          customCommentColumn
          deleteWS="linkerdelete"
          editUrl="proteins/editlinker"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Proteins"
          showDeleteButton={props.isImported ? false : true}
          showEditButton={props.isImported ? false : true}
          fetchWS={props.onlyMyLinkers ? "listallmoleculesbytype" : "listmoleculesbytype"}
          paramTypeValue={"PROTEIN"}
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

Proteins.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Proteins };
