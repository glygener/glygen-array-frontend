import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { Col, ButtonToolbar } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { Title } from "../components/FormControls";

const Assay = props => {
  useEffect(props.authCheckAgent, []);
  return (
    <>
      <Helmet>
        <title>{head.assays.title}</title>
        {getMeta(head.assays)}
      </Helmet>

      <div className="page-container">
        <Title title="Assays" />

        <ButtonToolbar>
          <Col md={{ span: 2 }}>
            <Link to="/assays/addAssay" className="link-button">
              Add Assay
            </Link>
          </Col>
        </ButtonToolbar>

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
          showDeleteButton
          showEditButton
          showCopyButton
          showMirageCompliance
          commentsRefColumn="description"
          fetchWS="listassaymetadata"
          deleteWS="deleteassaymetadata"
          editUrl="assays/editAssay"
          copyUrl="assays/copyAssay"
          copyPage="copyAssay"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Assays"
        />
      </div>
    </>
  );
};

Assay.propTypes = { authCheckAgent: PropTypes.func };

export { Assay };
