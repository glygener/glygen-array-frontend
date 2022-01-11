/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { head, getMeta } from "../utils/head";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Button } from "react-bootstrap";

const BlockLayouts = (props) => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.blockLayouts.title}</title>
        {getMeta(head.blockLayouts)}
      </Helmet>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Block Layouts"
            subTitle="The table below displays a list of all block layouts that have been uploaded to your repository. New block layouts may be added, old block layouts can be edited, and unused block layouts can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/blockLayouts/addBlock">
                  <Button className="gg-btn-blue mt-2">Add Block Layout</Button>
                </Link>
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Name",
                    accessor: "name",
                  },
                  {
                    Header: "Rows",
                    accessor: "height",
                  },
                  {
                    Header: "Columns",
                    accessor: "width",
                  },
                ]}
                defaultPageSize={10}
                defaultSortColumn="name"
                defaultSortOrder={0}
                showCommentsButton
                showDeleteButton
                showEditButton
                showSearchBox
                commentsRefColumn="description"
                fetchWS="blocklayoutlist"
                deleteWS="blocklayoutdelete"
                editUrl="blockLayouts/editBlock"
                keyColumn="id"
                showRowsInfo
                infoRowsText="Block Layouts"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

BlockLayouts.propTypes = {
  authCheckAgent: PropTypes.func
};

export { BlockLayouts };
