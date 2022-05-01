/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { head, getMeta } from "../utils/head";
import { getToolTip } from "../utils/commonUtils";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Button } from "react-bootstrap";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import { Typography } from "@material-ui/core";
import wikiHelpTooltip from "../appData/wikiHelpTooltip";

const OtherMolecules = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.otherMolecules.title}</title>
        {getMeta(head.otherMolecules)}
      </Helmet>
      <Container maxWidth="xl">
        <div className={!props.isImported ? "page-container" : ""}>
          <PageHeading
            title="Other Molecules"
            subTitle="The table below displays a list of all lipids that have been uploaded to your repository. New lipids may be added, old lipids can be edited, and unused lipids can be removed."
          />
          <Typography className="text-right" gutterBottom>
            <HelpToolTip
              title={wikiHelpTooltip.other_molecules.other_molecules_management.title}
              text={wikiHelpTooltip.tooltip_text}
              url={wikiHelpTooltip.other_molecules.other_molecules_management.url}
            />
            {wikiHelpTooltip.help_text}
          </Typography>

          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                {!props.isImported && (
                  <>
                    <Link to="/otherMolecules/addOtherMolecule">
                      <Button className="gg-btn-blue mt-2">Add Other Molecule</Button>
                    </Link>

                    <Link
                      to={{
                        pathname: "/otherMolecules/uploadMolecules",
                        state: {
                          type: "OTHER",
                        },
                      }}
                    >
                      <Button className="gg-btn-blue mt-2 gg-ml-20">Upload Other Molecules</Button>
                    </Link>
                  </>
                )}
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Name",
                    accessor: "name",
                    Cell: row => getToolTip(row.original.name),
                  },
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                showCommentsButton
                customCommentColumn
                showDeleteButton
                showSearchBox
                showEditButton
                exportData
                exportWsCall={"exportlinkers"}
                moleculeType={"OTHER"}
                fileName={"exportotherlinkers"}
                commentsRefColumn="comment"
                fetchWS="listmoleculesbytype"
                paramTypeValue={"OTHER"}
                deleteWS="linkerdelete"
                editUrl="otherMolecules/editOtherMolecule"
                keyColumn="id"
                form={"linkers"}
                showRowsInfo
                infoRowsText="Peptides"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

OtherMolecules.propTypes = {
  authCheckAgent: PropTypes.func
};

export { OtherMolecules };
