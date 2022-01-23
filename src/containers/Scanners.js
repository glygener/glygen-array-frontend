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

const Scanners = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.scanners.title}</title>
        {getMeta(head.scanners)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Scanners"
            subTitle="The table below displays a list of all scanners that have been uploaded to your repository. New scanners may be added, old scanners can be edited, and unused scanners can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/scanners/addScanner">
                  <Button className="gg-btn-blue mt-2">Add Scanner</Button>
                </Link>
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Name",
                    accessor: "name",
                  },
                  {
                    Header: "Template",
                    accessor: "template",
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
                fetchWS="listscanners"
                deleteWS="scannerdelete"
                editUrl="scanners/editScanner"
                copyUrl="scanners/copyScanner"
                copyPage="copyScanner"
                keyColumn="id"
                showRowsInfo
                infoRowsText="Scanners"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

Scanners.propTypes = { authCheckAgent: PropTypes.func };

export { Scanners };
