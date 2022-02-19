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
            title="Your Assays"
            subTitle="The table below displays a list of all assays that have been uploaded to your repository. New assays may be added, old assays can be edited, and unused assays can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/assays/addAssay">
                  <Button className="gg-btn-blue mt-2">Add Assay</Button>
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
                infoRowsText="Assays"
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
