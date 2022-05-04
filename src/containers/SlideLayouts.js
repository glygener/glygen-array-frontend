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

const SlideLayouts = props => {
  useEffect(props.authCheckAgent, []);
  const [showSpinner, setShowSpinner] = useState(false);

  return (
    <>
      <Helmet>
        <title>{head.slideLayouts.title}</title>
        {getMeta(head.slideLayouts)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Slide Layouts"
            subTitle="The table below displays a list of all slide layouts that have been uploaded to your repository. New slide layouts may be added, old slide layouts can be edited, and unused slide layouts can be removed."
          />
           <Typography className="text-right" gutterBottom>
            <HelpToolTip
              title={wikiHelpTooltip.slide_layout.slide_layout_management.title}
              text={wikiHelpTooltip.tooltip_text}
              url={wikiHelpTooltip.slide_layout.slide_layout_management.url}
            />
            {wikiHelpTooltip.help_text}
          </Typography>

          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Link to="/slideLayouts/addSlide">
                  <Button className="gg-btn-blue mt-2 gg-mr-20">Add Slide Layout</Button>
                </Link>
                <Link
                  to="/slideLayouts/addMultiple"
                  // title="Upload a GAL/XML file wih Slide Layouts"
                >
                  <Button className="gg-btn-blue mt-2 gg-ml-20">Add Multiple Slide Layouts</Button>
                </Link>
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Name",
                    accessor: "name"
                  }
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                showCommentsButton
                showDeleteButton
                showEditButton
                showSearchBox
                showDownload
                showExport
                setShowSpinner={setShowSpinner}
                downloadTitle={"Download user GAL file"}
                exportTitle={"Export user GAL file"}
                downloadApi="filedownload"
                handleExport={exportFile}
                commentsRefColumn="description"
                fetchWS="slidelayoutlist"
                deleteWS="slidelayoutdelete"
                editUrl="slideLayouts/editSlide"
                keyColumn="id"
                form={"slideLayouts"}
                showRowsInfo
                infoRowsText="Slide Layouts"
              />
            </Card.Body>
          </Card>
        </div>
        {showSpinner && downloadSpinner()}
      </Container>
    </>
  );
};

SlideLayouts.propTypes = {
  authCheckAgent: PropTypes.func
};

export { SlideLayouts };
