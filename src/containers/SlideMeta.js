import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { Col, ButtonToolbar } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { Title } from "../components/FormControls";

const SlideMeta = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.slidemeta.title}</title>
        {getMeta(head.slidemeta)}
      </Helmet>

      <div className="page-container">
        <Title title="Slide Meta" />

        <ButtonToolbar>
          <Col className={"col-link-button"}>
            <Link to="/listslidemeta/addSlideMeta" className="link-button" style={{ width: "150px" }}>
              Add Slide Meta
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
          fetchWS="listslidemeta"
          deleteWS="slideMetaDelete"
          editUrl="listslidemeta/editSlideMeta"
          copyUrl="listslidemeta/copySlideMeta"
          copyPage="copySlideMeta"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Slide Meta"
        />
      </div>
    </>
  );
};

SlideMeta.propTypes = {
  authCheckAgent: PropTypes.func
};

export { SlideMeta };
