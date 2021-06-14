import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { Col, ButtonToolbar } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { Title } from "../components/FormControls";

const Spots = props => {
  useEffect(props.authCheckAgent, []);
  return (
    <>
      <Helmet>
        <title>{head.spots.title}</title>
        {getMeta(head.spots)}
      </Helmet>

      <div className="page-container">
        <Title title="Spots" />

        <ButtonToolbar>
          <Col className={"col-link-button"}>
            <Link to="/spots/addSpot" className="link-button" style={{ width: "150px" }}>
              Add Spot
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
          fetchWS="listspotmetadata"
          deleteWS="deletespotmetadata"
          editUrl="spots/editSpot"
          copyUrl="spots/copySpot"
          copyPage="copySpot"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Spots"
        />
      </div>
    </>
  );
};

Spots.propTypes = { authCheckAgent: PropTypes.func };

export { Spots };
