/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { StructureImage } from "../components/StructureImage";
import { head, getMeta } from "../utils/head";
import displayNames from "../appData/displayNames";
import { getToolTip } from "../utils/commonUtils";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Button } from "react-bootstrap";

const Linkers = props => {
  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.linkers.title}</title>
        {getMeta(head.linkers)}
      </Helmet>

      <Container maxWidth="xl">
        <div className={!props.isImported ? "page-container" : ""}>
          <PageHeading
            title="Your Chemicals/Linkers"
            subTitle="The table below displays a list of all chemicals/linkers that have been uploaded to your repository. New chemicals/linkers may be added, old chemicals/linkers can be edited, and unused chemicals/linkers can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                {!props.isImported && (
                  <Link to="/linkers/addLinker">
                    <Button className="gg-btn-blue mt-2">Add Chemical/Linker</Button>
                  </Link>
                )}
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Name",
                    accessor: "name",
                    Cell: row => getToolTip(row.original.name)
                    // minWidth: 50,
                  },
                  {
                    Header: displayNames.linker.PUBCHEM_ID,
                    accessor: "pubChemId",
                    Cell: row => getToolTip(row.original.pubChemId)
                    // minWidth: 70,
                  },
                  {
                    Header: displayNames.linker.STRUCTURE,
                    accessor: "imageURL",
                    // eslint-disable-next-line react/prop-types
                    Cell: row => <StructureImage imgUrl={row.value}></StructureImage>,
                    minWidth: 150
                  }
                ]}
                defaultPageSize={10}
                showCommentsButton
                showSearchBox
                commentsRefColumn="comment"
                customCommentColumn
                deleteWS="linkerdelete"
                editUrl="linkers/editLinker"
                keyColumn="id"
                showRowsInfo
                infoRowsText="Chemicals/Linkers"
                showDeleteButton={props.isImported ? false : true}
                showEditButton={props.isImported ? false : true}
                fetchWS={props.onlyMyLinkers ? "listallmoleculesbytype" : "listmoleculesbytype"}
                paramTypeValue={props.linkerType ? props.linkerType : "SMALLMOLECULE"}
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

Linkers.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Linkers };
