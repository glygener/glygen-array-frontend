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

const Glycans = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.glycans.title}</title>
        {getMeta(head.glycans)}
      </Helmet>

      <div className="page-container">
        <Title title="Your glycans" />
        <p className={"page-description"}>
          The table shows the list of all glycans added to your repository. It is possible to add new glycans, edit
          existing glycans and remove glycans that are not used.
        </p>

        <Col className={"col-link-button"}>
          <Link to="/glycans/addglycan" className="link-button" style={{ width: "150px" }}>
            Add Glycan
          </Link>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Link
            to="/glycans/addMultiple"
            className="link-button"
            title="Upload a GAL/XML file wih Glycans"
            style={{ width: "150px" }}
          >
            Upload Glycans
          </Link>
        </Col>

        <GlygenTable
          columns={[
            {
              Header: "Id",
              accessor: "id",
              style: {
                textAlign: "left"
              }
            },
            {
              Header: "Internal Id",
              accessor: "internalId",
              style: {
                textAlign: "left"
              }
            },
            {
              Header: "GlyTouCan ID",
              accessor: "glytoucanId"
            },
            {
              Header: "Name",
              accessor: "name"
            },
            {
              Header: "Structure Image",
              accessor: "cartoon",
              sortable: false,
              // eslint-disable-next-line react/prop-types
              Cell: row => <StructureImage base64={row.value}></StructureImage>,
              minWidth: 300
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
          customCommentColumn
          showDeleteButton
          showSearchBox
          showEditButton
          commentsRefColumn="description"
          fetchWS="glycanlist"
          deleteWS="glycandelete"
          editUrl="glycans/editglycan"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Glycans"
        />
      </div>
    </>
  );
};

Glycans.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Glycans };
