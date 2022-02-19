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

const Samples = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.samples.title}</title>
        {getMeta(head.samples)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Samples"
            subTitle="The table below displays a list of all samples that have been uploaded to your repository. New samples may be added, old samples can be edited, and unused samples can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/samples/addSample">
                  <Button className="gg-btn-blue mt-2">Add Sample</Button>
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
                fetchWS="listsamples"
                deleteWS="sampledelete"
                editUrl="samples/editSample"
                copyUrl="samples/copySample"
                copyPage="copySample"
                keyColumn="id"
                form={"metadata"}
                showRowsInfo
                infoRowsText="Samples"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

Samples.propTypes = { authCheckAgent: PropTypes.func };

export { Samples };
