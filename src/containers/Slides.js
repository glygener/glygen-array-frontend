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

const Slides = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.slides.title}</title>
        {getMeta(head.slide)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Slides"
            subTitle="The table below displays a list of all slides that have been uploaded to your repository. New slides may be added, old slides can be edited, and unused slides can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/slides/addSlide">
                  <Button className="gg-btn-blue mt-2">Add Slide</Button>
                </Link>
              </div>

              <GlygenTable
                columns={[
                  { Header: "Name", accessor: "name" },
                  { Header: "Slidelayout", accessor: "layout.name" },
                  { Header: "Printer", accessor: "printer.name" },
                  { Header: "Slide Metadata", accessor: "metadata.name" }
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                showDeleteButton
                showEditButton
                showMakePublic
                showSearchBox
                showDownload
                downloadApi="filedownload"
                commentsRefColumn="description"
                fetchWS="slidelist"
                deleteWS="slidedelete"
                editUrl="slide/editSlide"
                keyColumn="id"
                showRowsInfo
                infoRowsText="Slides"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

Slides.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Slides };
