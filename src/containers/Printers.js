import React, { useEffect, useState } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Button } from "react-bootstrap";
import FeedbackWidget from "../components/FeedbackWidget";
import { exportFileMetadata } from "../utils/commonUtils";

const Printers = props => {
  useEffect(props.authCheckAgent, []);

  const [showSpinner, setShowSpinner] = useState(false);

  return (
    <>
      <Helmet>
        <title>{head.printers.title}</title>
        {getMeta(head.printers)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Printer Metadata"
            subTitle="The table below displays a list of all printer metadata that have been uploaded to your repository. New printer metadata may be added, old printer metadata can be edited, and unused printer metadata can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/printers/addPrinter">
                  <Button className="gg-btn-blue mt-2">Add Printer Metadata</Button>
                </Link>
                <Link
                  to={{
                    pathname: "/printers/importFromFile",
                    state: {
                      templateType: "PRINTER"
                    },
                  }}
                >
                  <Button className="gg-btn-blue mt-2 gg-ml-20">Add Metadata from file</Button>
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
                exportData
                exportWsCall={"contributeexportmetadata"}
                templateType={"PRINTER"}
                fileName={"exportprinters"}
                fetchWS="listprinters"
                showExport
                setShowSpinner={setShowSpinner}
                handleExport={exportFileMetadata}
                exportTitle={"Export metadata to file"}
                deleteWS="printerdelete"
                editUrl="printers/editPrinter"
                copyUrl="printers/copyPrinter"
                copyPage="copyPrinter"
                keyColumn="id"
                form={"metadata"}
                showRowsInfo
                infoRowsText="Printer Metadata"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

Printers.propTypes = { authCheckAgent: PropTypes.func };

export { Printers };
