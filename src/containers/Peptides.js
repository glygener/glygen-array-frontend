/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import { getToolTip } from "../utils/commonUtils";
import { PageHeading } from "../components/FormControls";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import { Typography } from "@material-ui/core";
import wikiHelpTooltip from "../appData/wikiHelpTooltip";
import { StatusMessage } from "../components/StatusMessage";
import property from "../appData/properties";

const Peptides = props => {
  let linkerProperty = property["linker"];

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
  }, []);

  const [batchUpload, setBatchUpload] = useState(false);

  return (
    <>
      <Helmet>
        <title>{head.peptides.title}</title>
        {getMeta(head.peptides)}
      </Helmet>

      <Container maxWidth="xl">
        <div className={!props.isImported ? "page-container" : ""}>
          <PageHeading
            title="Your Peptides"
            subTitle="The table below displays a list of all peptides that have been uploaded to your repository. New peptides may be added, old peptides can be edited, and unused peptides can be removed."
          />
          {!props.disableTooltip && (
            <Typography className="text-right" gutterBottom>
              <HelpToolTip
                title={wikiHelpTooltip.peptide.peptide_management.title}
                text={wikiHelpTooltip.tooltip_text}
                url={wikiHelpTooltip.peptide.peptide_management.url}
              />
              {wikiHelpTooltip.help_text}
            </Typography>
          )}

          <Card style={props.cardStyle}>
            <Card.Body>

              <StatusMessage
                moleculetype={linkerProperty.moleculeType.peptide}
                uploadtype={linkerProperty.batch_linker}
                setBatchUpload={setBatchUpload}
              />

              <div className="text-center mb-4">
                {!props.isImported && (
                  <>
                    <Link to="/peptides/addPeptide">
                      <Button className="gg-btn-blue mt-2">Add Peptide</Button>
                    </Link>

                    <Link
                      to={{
                        pathname: "/peptides/uploadMolecules",
                        state: {
                          type: "PEPTIDE",
                        },
                      }}
                    >
                      <Button disabled={batchUpload} className="gg-btn-blue mt-2 gg-ml-20">Upload Peptides</Button>
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
                  {
                    Header: "Sequence",
                    accessor: "sequence",
                    Cell: row => getToolTip(row.original.sequence),
                  },
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                showCommentsButton
                customCommentColumn
                showSearchBox
                commentsRefColumn="comment"
                deleteWS="linkerdelete"
                editUrl="peptides/editPeptide"
                keyColumn="id"
                form={"linkers"}
                showRowsInfo
                exportData
                exportWsCall={"exportlinkers"}
                moleculeType={"PEPTIDE"}
                fileName={"exportpeptides"}
                infoRowsText="Peptides"
                showDeleteButton={props.isImported ? false : true}
                showEditButton={props.isImported ? false : true}
                fetchWS={props.onlyMyLinkers ? "listallmoleculesbytype" : "listmoleculesbytype"}
                paramTypeValue={"PEPTIDE"}
                isModal={props.isModal}
                selectButtonHeader={props.selectButtonHeader ? "Select" : ""}
                showSelectButton={props.showSelectButton}
                selectButtonHandler={props.selectButtonHandler}
                showOnlyMyLinkersOrGlycansCheckBox={props.showOnlyMyLinkersOrGlycansCheckBox}
                handleChangeForOnlyMyLinkersGlycans={props.handleChangeForOnlyMyLinkersGlycans}
                onlyMyLinkersGlycans={props.onlyMyLinkersGlycans}
                onlyMyLinkersGlycansCheckBoxLabel={
                  props.onlyMyLinkersGlycansCheckBoxLabel ? props.onlyMyLinkersGlycansCheckBoxLabel : ""
                }
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

Peptides.propTypes = {
  authCheckAgent: PropTypes.func,
  disableTooltip: PropTypes.bool,
  cardStyle: PropTypes.object,
};

export { Peptides };
