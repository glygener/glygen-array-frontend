/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import "../containers/Features.css";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Link } from "react-router-dom";
import { GlygenTable } from "../components/GlygenTable";
import displayNames from "../appData/displayNames";
import { getToolTip } from "../utils/commonUtils";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Button } from "react-bootstrap";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import { Typography } from "@material-ui/core";
import wikiHelpTooltip from "../appData/wikiHelpTooltip";

const Features = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.features.title}</title>
        {getMeta(head.features)}
      </Helmet>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Your Features"
            subTitle="The table below displays a list of all features that have been uploaded to your repository. New features may be added, old features can be edited, and unused features can be removed."
          />
          <Typography className="text-right" gutterBottom>
            <HelpToolTip
              title={wikiHelpTooltip.feature.feature_management.title}
              text={wikiHelpTooltip.tooltip_text}
              url={wikiHelpTooltip.feature.feature_management.url}
            />
            {wikiHelpTooltip.help_text}
          </Typography>

          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                {!props.isImported && (
                  <>
                    <Link to="/features/addFeature">
                      <Button className="gg-btn-blue mt-2">Add Feature</Button>
                    </Link>

                    <Link
                      to={{
                        pathname: "/features/uploadFeatures",
                        state: {
                          type: "FEATURE",
                        },
                      }}
                    >
                      <Button className="gg-btn-blue mt-2 gg-ml-20">Upload Features</Button>
                    </Link>
                  </>
                )}
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Name",
                    accessor: "name",
                    // eslint-disable-next-line react/display-name
                    Cell: ({ row }, index) => <div key={index}>{getToolTip(row.name ? row.name : row.id)}</div>,
                  },
                  {
                    Header: "Feature ID",
                    accessor: "internalId",
                    Cell: ({ row }, index) => <div key={index}>{getToolTip(row.internalId)}</div>,
                  },
                  {
                    Header: "Type",
                    accessor: "type",
                    Cell: row => getToolTip(displayNames.feature[row.value]),
                  },
                  {
                    Header: "Linker",
                    accessor: "linker",
                    // eslint-disable-next-line react/display-name
                    Cell: ({ value, index }) =>
                      value && value.name ? (
                        <Link key={index} to={"/linkers/editLinker/" + value.id} target="_blank">
                          {getToolTip(value.name)}
                        </Link>
                      ) : (
                        ""
                      ),
                  },
                  {
                    Header: "Linker Type",
                    accessor: "linker",
                    // eslint-disable-next-line react/display-name
                    Cell: ({ row, index }) => {
                      return row.linker ? (
                        <div key={index}>
                          {getToolTip(
                            row.linker.type
                            // && displayNames.linker[row.linker.type]
                          )}
                        </div>
                      ) : (
                        ""
                      );
                    },
                  },
                  {
                    Header: "Glycans",
                    accessor: "glycans",
                    // eslint-disable-next-line react/display-name
                    Cell: (row, index) => (
                      <div key={index}>
                        {row.value
                          ? row.value.map(
                              (glycans, i) =>
                                glycans.glycan && (
                                  <div key={i}>
                                    <Link to={"/glycans/editGlycan/" + glycans.glycan.id} target="_blank">
                                      {getToolTip(glycans.glycan.name)}
                                    </Link>
                                  </div>
                                )
                            )
                          : ""}
                      </div>
                    ),
                  },
                ]}
                defaultPageSize={10}
                showDeleteButton
                showEditButton
                showSearchBox
                showViewIcon
                viewUrl="features/viewFeature"
                commentsRefColumn="name"
                exportData
                exportWsCall={"exportfeatures"}
                fileName={"exportfeatures"}
                fetchWS="featurelist"
                deleteWS="featuredelete"
                editUrl="features/editFeature/:editFeature"
                keyColumn="id"
                form={"features"}
                showRowsInfo
                infoRowsText="Features"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

Features.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Features };
