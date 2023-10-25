/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { StructureImage } from "../components/StructureImage";
import { head, getMeta } from "../utils/head";
import { PageHeading } from "../components/FormControls";
import { getToolTip, batchupload } from "../utils/commonUtils";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import { Typography } from "@material-ui/core";
import wikiHelpTooltip from "../appData/wikiHelpTooltip";
import property from "../appData/properties";
import { ErrorSummary } from "../components/ErrorSummary";
import { StatusMessage } from "../components/StatusMessage";
import FeedbackWidget from "../components/FeedbackWidget";


const Glycans = props => {
  useEffect(props.authCheckAgent, []);

  const [batchUpload, setBatchUpload] = useState(false);


  return (
    <>
      <Helmet>
        <title>{head.glycans.title}</title>
        {getMeta(head.glycans)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Glycans"
            subTitle="The table below displays a list of all glycans that have been uploaded to your
            repository. New glycans may be added, old glycans can be edited, and unused glycans can
            be removed."
          />
          <Typography className="text-right" gutterBottom>
            <HelpToolTip
              title={wikiHelpTooltip.glycan.glycan_management.title}
              text={wikiHelpTooltip.tooltip_text}
              url={wikiHelpTooltip.glycan.glycan_management.url}
            />
            {wikiHelpTooltip.help_text}
          </Typography>

          <Card>
            <Card.Body>
              <StatusMessage
                moleculetype={undefined}
                uploadtype={property["glycan"].batch_glycan}
                setBatchUpload={setBatchUpload}
              />

              <div className="text-center mb-4">
                <Link to="/glycans/addGlycan">
                  <Button className="gg-btn-blue mt-2 gg-mr-20">Add Glycan</Button>
                </Link>

                <Link to="/glycans/addMultipleGlycan">
                  <Button disabled={batchUpload} className="gg-btn-blue mt-2 gg-ml-20">Add Multiple Glycans</Button>
                </Link>
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Id",
                    accessor: "id",
                    Cell: row => getToolTip(row.original.id),
                    style: {
                      textAlign: "left",
                    }
                  },
                  {
                    Header: "Internal Id",
                    accessor: "internalId",
                    Cell: row => getToolTip(row.original.internalId),
                    style: {
                      textAlign: "left"
                    }
                  },
                  {
                    Header: "GlyTouCan ID",
                    accessor: "glytoucanId",
                    Cell: row => getToolTip(row.original.glytoucanId)
                  },
                  {
                    Header: "Name",
                    accessor: "name",
                    Cell: row => getToolTip(row.original.name)
                  },
                  {
                    Header: "Structure Image",
                    accessor: "cartoon",
                    sortable: false,
                    // eslint-disable-next-line react/prop-types
                    Cell: row => <StructureImage zoom={true} base64={row.value}></StructureImage>,
                    minWidth: 300
                  },
                  {
                    Header: "Mass",
                    accessor: "mass",
                    // eslint-disable-next-line react/prop-types
                    Cell: row => (row.value ? Number(parseFloat(row.value).toFixed(2)).toLocaleString('en-US') : "")
                  }
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                defaultSortOrder={1}
                showCommentsButton
                customCommentColumn
                showDeleteButton
                showSearchBox
                showEditButton
                exportData
                exportWsCall={"exportglycans"}
                fileName={"exportglycans"}
                commentsRefColumn="description"
                fetchWS="glycanlist"
                deleteWS="glycandelete"
                editUrl="glycans/editGlycan"
                keyColumn="id"
                showRowsInfo
                form={"glycans"}
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
