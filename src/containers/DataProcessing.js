import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { Col, ButtonToolbar } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { Title } from "../components/FormControls";

const DataProcessing = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.dataprocessing.title}</title>
        {getMeta(head.dataprocessing)}
      </Helmet>

      <div className="page-container">
        <Title title="Data Processing" />

        <ButtonToolbar>
          <Col md={{ span: 3 }}>
            <Link to="/dataprocessing/addDataProcessing" className="link-button">
              Add Data Processing
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
          fetchWS="listdataprocessing"
          deleteWS="dataprocessingdelete"
          editUrl="dataprocessing/editDataProcessing"
          copyUrl="dataprocessing/copyDataProcessing"
          copyPage="copyDataProcessing"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Data Processing"
        />
      </div>
    </>
  );
};

DataProcessing.propTypes = { authCheckAgent: PropTypes.func };

export { DataProcessing };
