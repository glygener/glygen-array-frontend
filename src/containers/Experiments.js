import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { CoOwnedExperiments } from "./CoOwnedExperiments";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Button } from "react-bootstrap";

const Experiments = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.experiments.title}</title>
        {getMeta(head.experiments)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Experiments"
            subTitle="The table below displays a list of all experiments that have been uploaded to your repository. New experiments may be added, old experiments can be edited, and unused experiments can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/experiments/addExperiment">
                  <Button className="gg-btn-blue mt-2">Add Experiment</Button>
                </Link>
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Id",
                    accessor: "id",
                  },
                  { Header: "Public ID", accessor: "publicId" },
                  {
                    Header: "Name",
                    accessor: "name",
                  },
                  {
                    Header: "Date Created",
                    accessor: "dateCreated",
                    Cell: row => new Intl.DateTimeFormat("en-US").format(new Date(row.original.dateCreated)),
                  }
                ]}
                defaultPageSize={5}
                defaultSortColumn="id"
                experimentStatus
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

              <div className="mb-4">
                <CoOwnedExperiments />
              </div>
              <div className="text-center mb-4">
                <Link to="/experiments/addExperiment">
                  <Button className="gg-btn-blue mt-2">Add Experiment</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

Experiments.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Experiments };
