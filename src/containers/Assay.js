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

const Assay = props => {
  useEffect(props.authCheckAgent, []);
  return (
    <>
      <Helmet>
        <title>{head.assays.title}</title>
        {getMeta(head.assays)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Assay Metadata"
            subTitle="The table below displays a list of all assay metadata that have been uploaded to your repository. New assay metadata may be added, old assay metadata can be edited, and unused assay metadata can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/assays/addAssay">
                  <Button className="gg-btn-blue mt-2">Add Assay Metadata</Button>
                </Link>
              </div>

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
                showSearchBox
                showMirageCompliance
                commentsRefColumn="description"
                fetchWS="listassaymetadata"
                deleteWS="deleteassaymetadata"
                editUrl="assays/editAssay"
                copyUrl="assays/copyAssay"
                copyPage="copyAssay"
                keyColumn="id"
                form={"metadata"}
                showRowsInfo
                infoRowsText="Assay Metadata"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

Assay.propTypes = { authCheckAgent: PropTypes.func };

export { Assay };
