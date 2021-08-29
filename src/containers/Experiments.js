import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { Col, ButtonToolbar } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { Title } from "../components/FormControls";
import { CoOwnedExperiments } from "./CoOwnedExperiments";

const Experiments = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.experiments.title}</title>
        {getMeta(head.experiments)}
      </Helmet>

      <div className="page-container">
        <Title title="Experiments" />

        <ButtonToolbar>
          <Col md={{ span: 2 }}>
            <Link to="/experiments/addExperiment" className="link-button">
              Add Experiment
            </Link>
          </Col>
        </ButtonToolbar>

        <GlygenTable
          columns={[
            {
              Header: "Id",
              accessor: "id"
            },
            { Header: "Public ID", accessor: "publicId" },
            {
              Header: "Name",
              accessor: "name"
            },
            {
              Header: "Date Created",
              accessor: "dateCreated",
              Cell: row => new Intl.DateTimeFormat("en-US").format(new Date(row.original.dateCreated))
            },
            {
              Header: "Status",
              accessor: "status"
            }
          ]}
          defaultPageSize={5}
          defaultSortColumn="id"
          showDeleteButton
          showEditButton
          showMakePublic
          setShowDeleteModal
          commentsRefColumn="description"
          fetchWS="listexperiments"
          deleteWS="deletedataset"
          editUrl="experiments/editExperiment"
          keyColumn="id"
          showRowsInfo
          showSearchBox
          infoRowsText="Experiments"
          form={"experiments"}
        />

        <div style={{ marginTop: "10%", marginBottom: "10%" }}>
          <CoOwnedExperiments />
        </div>
      </div>
    </>
  );
};

Experiments.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Experiments };
