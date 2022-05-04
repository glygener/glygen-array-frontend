/* eslint-disable react/display-name */
import React, { useState, useEffect } from "react";
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
import { exportFile, downloadSpinner } from "../utils/commonUtils";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import { Typography } from "@material-ui/core";
import wikiHelpTooltip from "../appData/wikiHelpTooltip";

const Slides = props => {
  useEffect(props.authCheckAgent, []);
  const [showSpinner, setShowSpinner] = useState(false);

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
          <Typography className="text-right" gutterBottom>
            <HelpToolTip
              title={wikiHelpTooltip.slide.slide_management.title}
              text={wikiHelpTooltip.tooltip_text}
              url={wikiHelpTooltip.slide.slide_management.url}
            />
            {wikiHelpTooltip.help_text}
          </Typography>
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
                  { Header: "Slide Metadata", accessor: "metadata.name" },
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                showDeleteButton
                showEditButton
                showMakePublic
                showSearchBox
                showDownload
                showExport
                isPrintedSlide
                downloadApi="filedownload"
                handleExport={exportFile}
                setShowSpinner={setShowSpinner}
                downloadTitle={"Download user GAL file"}
                exportTitle={"Export user GAL file"}
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
        {showSpinner && downloadSpinner()}
      </Container>
    </>
  );
};

Slides.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Slides };
