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

const DataProcessing = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.dataProcessing.title}</title>
        {getMeta(head.dataProcessing)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Data Processing"
            subTitle="The table below displays a list of all data processing that have been uploaded to your repository. New data processing may be added, old data processing can be edited, and unused data processing can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/dataProcessing/addDataProcessing">
                  <Button className="gg-btn-blue mt-2">Add Data Processing</Button>
                </Link>
              </div>

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
                editUrl="dataProcessing/editDataProcessing"
                copyUrl="dataProcessing/copyDataProcessing"
                copyPage="copyDataProcessing"
                keyColumn="id"
                form={"metadata"}
                showRowsInfo
                infoRowsText="Data Processing"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

DataProcessing.propTypes = { authCheckAgent: PropTypes.func };

export { DataProcessing };
