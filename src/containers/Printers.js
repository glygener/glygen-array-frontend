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

const Printers = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.printers.title}</title>
        {getMeta(head.printers)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Printers"
            subTitle="The table below displays a list of all printers that have been uploaded to your repository. New printers may be added, old printers can be edited, and unused printers can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/printers/addPrinter">
                  <Button className="gg-btn-blue mt-2">Add Printer</Button>
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
                fetchWS="listprinters"
                deleteWS="printerdelete"
                editUrl="printers/editPrinter"
                copyUrl="printers/copyPrinter"
                copyPage="copyPrinter"
                keyColumn="id"
                showRowsInfo
                infoRowsText="Printers"
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
