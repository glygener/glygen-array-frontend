/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import { getToolTip } from "../utils/commonUtils";
import { PageHeading } from "../components/FormControls";

const Peptides = (props) => {
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

      <div className={!props.isImported ? "page-container" : ""}>
        <PageHeading title="Peptides" subTitle="The subheader placeholder." />

        <div className="text-center mb-4">
          {!props.isImported && (
            <Link to="/peptides/addpeptide">
              <Button className="gg-btn-blue mt-2 gg-mr-20">Add Peptide</Button>
            </Link>
          )}
        </div>

        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name",
              Cell: (row) => getToolTip(row.original.name),
            },
            {
              Header: "Sequence",
              accessor: "sequence",
              Cell: (row) => getToolTip(row.original.sequence),
            },
          ]}
          defaultPageSize={10}
          defaultSortColumn="id"
          showCommentsButton
          customCommentColumn
          showSearchBox
          commentsRefColumn="comment"
          deleteWS="linkerdelete"
          editUrl="peptides/editlinker"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Peptides"
          showDeleteButton={props.isImported ? false : true}
          showEditButton={props.isImported ? false : true}
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
  authCheckAgent: PropTypes.func,
};

export { Peptides };
