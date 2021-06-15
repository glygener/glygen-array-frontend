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

const Linkers = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.linkers.title}</title>
        {getMeta(head.linkers)}
      </Helmet>

      <div className="page-container">
        <Title title="Linkers" />

        <Col className={"col-link-button"}>
          <Link to="/linkers/addlinker" className="link-button" style={{ width: "150px" }}>
            Add Linker
          </Link>
        </Col>

        <GlygenTable
          columns={[
            {
              Header: displayNames.linker.PUBCHEM_ID,
              accessor: "pubChemId",
              // eslint-disable-next-line react/prop-types
              Cell: row =>
                row.value ? (
                  <a href={row.original.pubChemUrl} target="_blank" rel="noopener noreferrer">
                    {row.value}
                  </a>
                ) : (
                  ""
                ),
              minWidth: 70
            },
            {
              Header: "Name",
              accessor: "name",
              minWidth: 50
            },
            {
              Header: "Type",
              accessor: "type",
              Cell: row => displayNames.linker[row.value]
            },
            {
              Header: "Classification",
              accessor: "classification",
              Cell: row =>
                row.value ? (
                  <a href={row.value.uri} target="_blank" rel="noopener noreferrer" title={row.value.classification}>
                    {row.value.classification}
                  </a>
                ) : (
                  ""
                )
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
            },
            {
              Header: displayNames.linker.INCHIKEY,
              accessor: "inChiKey",
              minWidth: 150
            },
            {
              Header: "Sequence",
              accessor: "sequence",
              minWidth: 70
            }
          ]}
          defaultPageSize={10}
          showCommentsButton
          showDeleteButton
          showEditButton
          showSearchBox
          commentsRefColumn="pubChemId"
          fetchWS="linkerlist"
          deleteWS="linkerdelete"
          editUrl="linkers/editlinker"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Linkers"
        />
      </div>
    </>
  );
};

Linkers.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Linkers };
