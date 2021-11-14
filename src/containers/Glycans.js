/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { StructureImage } from "../components/StructureImage";
import { head, getMeta } from "../utils/head";
import { PageHeading } from "../components/FormControls";
import { getToolTip } from "../utils/commonUtils";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";

const Glycans = (props) => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.glycans.title}</title>
        {getMeta(head.glycans)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Glycans"
            subTitle="The table below displays a list of all glycans that have been uploaded to your
            repository. New glycans may be added, old glycans can be edited, and unused glycans can
            be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/glycans/addglycan">
                  <Button className="gg-btn-blue mt-2 gg-mr-20">Add Glycan</Button>
                </Link>

                <Link to="/glycans/addMultipleGlycan">
                  <Button className="gg-btn-blue mt-2 gg-ml-20">Add Multiple Glycans</Button>
                </Link>
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Id",
                    accessor: "id",
                    Cell: (row) => getToolTip(row.original.id),
                    style: {
                      textAlign: "left",
                    },
                  },
                  {
                    Header: "Internal Id",
                    accessor: "internalId",
                    Cell: (row) => getToolTip(row.original.internalId),
                    style: {
                      textAlign: "left",
                    },
                  },
                  {
                    Header: "GlyTouCan ID",
                    accessor: "glytoucanId",
                    Cell: (row) => getToolTip(row.original.glytoucanId),
                  },
                  {
                    Header: "Name",
                    accessor: "name",
                    Cell: (row) => getToolTip(row.original.name),
                  },
                  {
                    Header: "Structure Image",
                    accessor: "cartoon",
                    sortable: false,
                    // eslint-disable-next-line react/prop-types
                    Cell: (row) => <StructureImage base64={row.value}></StructureImage>,
                    minWidth: 300,
                  },
                  {
                    Header: "Mass",
                    accessor: "mass",
                    // eslint-disable-next-line react/prop-types
                    Cell: (row) => (row.value ? parseFloat(row.value).toFixed(2) : ""),
                  },
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                showCommentsButton
                customCommentColumn
                showDeleteButton
                showSearchBox
                showEditButton
                commentsRefColumn="description"
                fetchWS="glycanlist"
                deleteWS="glycandelete"
                editUrl="glycans/editglycan"
                keyColumn="id"
                showRowsInfo
                infoRowsText="Glycans"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

Glycans.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Glycans };
