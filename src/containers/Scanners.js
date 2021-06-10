import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { Col, ButtonToolbar } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { Title } from "../components/FormControls";

const Scanners = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.scanners.title}</title>
        {getMeta(head.scanners)}
      </Helmet>

      <div className="page-container">
        <Title title="Scanners" />

        <ButtonToolbar>
          <Col md={{ span: 2 }}>
            <Link to="/scanners/addScanner" className="link-button">
              Add Scanner
            </Link>
          </Col>
        </ButtonToolbar>

        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name"
            },
            {
              Header: "Template",
              accessor: "template"
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
          fetchWS="listscanners"
          deleteWS="scannerdelete"
          editUrl="scanners/editScanner"
          copyUrl="scanners/copyScanner"
          copyPage="copyScanner"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Scanners"
        />
      </div>
    </>
  );
};

Scanners.propTypes = { authCheckAgent: PropTypes.func };

export { Scanners };
