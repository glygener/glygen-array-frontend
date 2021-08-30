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
import displayNames from "../appData/displayNames";
import { StructureImage } from "../components/StructureImage";

const Lipids = props => {
  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.lipids.title}</title>
        {getMeta(head.lipids)}
      </Helmet>

      <div className="page-container">
        <Title title="Lipids" />

        <Col className={"col-link-button"}>
          <Link to="/lipids/addlipid" className="link-button" style={{ width: "150px" }}>
            Add Lipid
          </Link>
        </Col>

        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name"
            },
            {
              Header: "PubChem ID",
              accessor: "pubChemId"
            },
            {
              Header: displayNames.linker.STRUCTURE,
              accessor: "imageURL",
              sortable: false,
              // eslint-disable-next-line react/prop-types
              Cell: row => <StructureImage imgUrl={row.value}></StructureImage>,
              minWidth: 150
            },
            {
              Header: "Mass",
              accessor: "mass",
              // eslint-disable-next-line react/prop-types
              Cell: row => (row.value ? parseFloat(row.value).toFixed(4) : "")
            }
          ]}
          defaultPageSize={10}
          defaultSortColumn="id"
          showCommentsButton
          showSearchBox
          commentsRefColumn="description"
          deleteWS="linkerdelete"
          editUrl="linkers/editlinker"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Lipids"
          showDeleteButton={props.showDeleteButton ? props.showDeleteButton : true}
          showEditButton={props.showEditButton ? props.showEditButton : true}
          fetchWS={props.onlyMyLinkers ? "listallmoleculesbytype" : "listmoleculesbytype"}
          paramTypeValue={"LIPID"}
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

Lipids.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Lipids };
