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

const Proteins = (props) => {
  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.proteins.title}</title>
        {getMeta(head.proteins)}
      </Helmet>
      <Container maxWidth="xl">
        <div className={!props.isImported ? "page-container" : ""}>
          <PageHeading
            title="Your Proteins"
            subTitle="The table below displays a list of all proteins that have been uploaded to your repository. New proteins may be added, old proteins can be edited, and unused proteins can be removed."
          />
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                {!props.isImported && (
                  <Link to="/proteins/addprotein">
                    <Button className="gg-btn-blue mt-2 gg-mr-20">Add Protein</Button>
                  </Link>
                )}
              </div>

              <GlygenTable
                columns={[
                  {
                    Header: "Name",
                    accessor: "name",
                    Cell: (row) => getToolTip(row.original.name),
                  },
                  {
                    Header: "UniProtID",
                    accessor: "uniProtId",
                    Cell: (row) => getToolTip(row.original.uniProtId),
                  },
                ]}
                defaultPageSize={10}
                defaultSortColumn="id"
                showCommentsButton
                showSearchBox
                commentsRefColumn="comment"
                customCommentColumn
                deleteWS="linkerdelete"
                editUrl="proteins/editlinker"
                keyColumn="id"
                showRowsInfo
                infoRowsText="Proteins"
                showDeleteButton={props.isImported ? false : true}
                showEditButton={props.isImported ? false : true}
                fetchWS={props.onlyMyLinkers ? "listallmoleculesbytype" : "listmoleculesbytype"}
                paramTypeValue={"PROTEIN"}
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

Proteins.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Proteins };
