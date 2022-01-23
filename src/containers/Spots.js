import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Button } from "react-bootstrap";

const Spots = props => {
  useEffect(props.authCheckAgent, []);
  return (
    <>
      <Helmet>
        <title>{head.spots.title}</title>
        {getMeta(head.spots)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Spots"
            subTitle="The table below displays a list of all spots that have been uploaded to your repository. New spots may be added, old spots can be edited, and unused spots can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/spots/addSpot">
                  <Button className="gg-btn-blue mt-2">Add Spot</Button>
                </Link>
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Name",
                    accessor: "name",
                  },
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
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

Spots.propTypes = { authCheckAgent: PropTypes.func };

export { Spots };
