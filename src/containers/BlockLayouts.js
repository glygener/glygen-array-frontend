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

const BlockLayouts = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.blockLayouts.title}</title>
        {getMeta(head.blockLayouts)}
      </Helmet>

      <div className="page-container">
        <Title title="Block Layouts" />
        <Col md={{ span: 2 }}>
          <Link to="/blocklayouts/addBlock" className="link-button">
            Add Block Layout
          </Link>
        </Col>
        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name"
            },
            {
              Header: "Rows",
              accessor: "height"
            },
            {
              Header: "Columns",
              accessor: "width"
            }
          ]}
          defaultPageSize={10}
          defaultSortColumn="name"
          defaultSortOrder={0}
          showCommentsButton
          showDeleteButton
          showEditButton
          showSearchBox
          commentsRefColumn="description"
          fetchWS="blocklayoutlist"
          deleteWS="blocklayoutdelete"
          editUrl="blocklayouts/editBlock"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Block Layouts"
        />
      </div>
    </>
  );
};

BlockLayouts.propTypes = {
  authCheckAgent: PropTypes.func
};

export { BlockLayouts };
