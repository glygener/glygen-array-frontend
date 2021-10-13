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
import displayNames from "../appData/displayNames";
import { Title } from "../components/FormControls";
import { getToolTip } from "../utils/commonUtils";

const Linkers = props => {
  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.linkers.title}</title>
        {getMeta(head.linkers)}
      </Helmet>

      <div className={!props.isImported ? "page-container" : ""}>
        <Title title="Linkers" />

        <Col className={"col-link-button"}>
          {!props.isImported && (
            <Link to="/linkers/addlinker" className="link-button" style={{ width: "150px" }}>
              Add Linker
            </Link>
          )}
        </Col>

        <GlygenTable
          columns={[
            {
              Header: displayNames.linker.PUBCHEM_ID,
              accessor: "pubChemId",
              // eslint-disable-next-line react/prop-types
              Cell: row =>
                row.value && !props.isImported ? (
                  <a href={row.original.pubChemUrl} target="_blank" rel="noopener noreferrer">
                    {getToolTip(row.value)}
                  </a>
                ) : (
                  getToolTip(row.value)
                ),
              minWidth: 70
            },
            {
              Header: "Name",
              accessor: "name",
              Cell: row => getToolTip(row.original.name),
              minWidth: 50
            },
            {
              Header: displayNames.linker.STRUCTURE,
              accessor: "imageURL",
              // eslint-disable-next-line react/prop-types
              Cell: row => <StructureImage imgUrl={row.value}></StructureImage>,
              minWidth: 150
            },
            {
              Header: "Mass",
              accessor: "mass",
              // eslint-disable-next-line react/prop-types
              Cell: row => (row.value ? parseFloat(row.value).toFixed(4) : ""),
              minWidth: 70
            }
          ]}
          defaultPageSize={10}
          showCommentsButton
          showSearchBox
          commentsRefColumn="comment"
          customCommentColumn
          deleteWS="linkerdelete"
          editUrl="linkers/editlinker"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Linkers"
          showDeleteButton={props.isImported ? false : true}
          showEditButton={props.isImported ? false : true}
          fetchWS={props.onlyMyLinkers ? "listallmoleculesbytype" : "listmoleculesbytype"}
          paramTypeValue={"SMALLMOLECULE"}
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

Linkers.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Linkers };
