import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { Col, ButtonToolbar } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { Title } from "../components/FormControls";

const Samples = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.samples.title}</title>
        {getMeta(head.samples)}
      </Helmet>

      <div className="page-container">
        <Title title="Samples" />

        <ButtonToolbar>
          <Col md={{ span: 2 }}>
            <Link to="/samples/addSample" className="link-button">
              Add Sample
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
          fetchWS="listsamples"
          deleteWS="sampledelete"
          editUrl="samples/editSample"
          copyUrl="samples/copySample"
          copyPage="copySample"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Samples"
        />
      </div>
    </>
  );
};

Samples.propTypes = { authCheckAgent: PropTypes.func };

export { Samples };
