/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { head, getMeta } from "../utils/head";
import displayNames from "../appData/displayNames";
import { StructureImage } from "../components/StructureImage";
import { getToolTip } from "../utils/commonUtils";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Button } from "react-bootstrap";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import { Typography } from "@material-ui/core";
import wikiHelpTooltip from "../appData/wikiHelpTooltip";
import { StatusMessage } from "../components/StatusMessage";
import property from "../appData/properties";
import FeedbackWidget from "../components/FeedbackWidget";

const Lipids = props => {
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
        <title>{head.lipids.title}</title>
        {getMeta(head.lipids)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className={!props.isImported ? "page-container" : ""}>
          <PageHeading
            title="Your Lipids"
            subTitle="The table below displays a list of all lipids that have been uploaded to your repository. New lipids may be added, old lipids can be edited, and unused lipids can be removed."
          />
          {!props.disableTooltip && (
            <Typography className="text-right" gutterBottom>
              <HelpToolTip
                title={wikiHelpTooltip.lipid.lipid_management.title}
                text={wikiHelpTooltip.tooltip_text}
                url={wikiHelpTooltip.lipid.lipid_management.url}
              />
              {wikiHelpTooltip.help_text}
            </Typography>
          )}
          <Card style={props.cardStyle}>
            <Card.Body>

            <StatusMessage
              moleculetype={linkerProperty.moleculeType.lipid}
              uploadtype={linkerProperty.batch_linker}
              setBatchUpload={setBatchUpload}
            />

              <div className="text-center mb-4">
                {!props.isImported && (
                  <>
                    <Link to="/lipids/addLipid">
                      <Button className="gg-btn-blue mt-2">Add Lipid</Button>
                    </Link>
                    <Link
                      to={{
                        pathname: "/lipids/uploadMolecules",
                        state: {
                          type: "LIPID",
                        },
                      }}
                    >
                      <Button disabled={batchUpload} className="gg-btn-blue mt-2 gg-ml-20">Upload Lipids</Button>
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
                    // minWidth: 50,
                  },
                  {
                    Header: "PubChem ID",
                    accessor: "pubChemId",
                    Cell: row => getToolTip(row.original.pubChemId),
                    // minWidth: 70,
                  },
                  {
                    Header: displayNames.linker.STRUCTURE,
                    accessor: "imageURL",
                    sortable: false,
                    // eslint-disable-next-line react/prop-types
                    Cell: row => <StructureImage zoom={true} imgUrl={row.value}></StructureImage>,
                    minWidth: 150,
                  },
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                showCommentsButton
                showSearchBox
                commentsRefColumn="comment"
                customCommentColumn
                deleteWS="linkerdelete"
                editUrl="lipids/editLipid"
                keyColumn="id"
                form={"linkers"}
                showRowsInfo
                exportData
                exportWsCall={"exportlinkers"}
                moleculeType={"LIPID"}
                fileName={"exportlipids"}
                infoRowsText="Lipids"
                showDeleteButton={props.isImported ? false : true}
                showEditButton={props.isImported ? false : true}
                fetchWS={props.onlyMyLinkers ? "listallmoleculesbytype" : "listmoleculesbytype"}
                paramTypeValue={"LIPID"}
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

Lipids.propTypes = {
  authCheckAgent: PropTypes.func,
  disableTooltip: PropTypes.bool,
  cardStyle: PropTypes.object,
};

export { Lipids };
