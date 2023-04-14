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

const PrintRun = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.printRun.title}</title>
        {getMeta(head.printRun)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Print Run Metadata"
            subTitle="The table below displays a list of all printrun metadata that have been uploaded to your repository. New printrun metadata may be added, old printrun metadata can be edited, and unused print run metadata can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/printRun/addPrintRun">
                  <Button className="gg-btn-blue mt-2">Add Print Run Metadata</Button>
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
                showSearchBox
                showMirageCompliance
                commentsRefColumn="description"
                fetchWS="listprintrun"
                deleteWS="printrundelete"
                editUrl="printers/editPrintRun"
                copyUrl="printers/copyPrintRun"
                copyPage="copyPrintRun"
                keyColumn="id"
                form={"metadata"}
                showRowsInfo
                infoRowsText="Printrun Metadata"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

PrintRun.propTypes = { authCheckAgent: PropTypes.func };

export { PrintRun };
