import React, { useState } from "react";
import { GlygenTable } from "../components/GlygenTable";
import PropTypes from "prop-types";
import { Button, Col, Row } from "react-bootstrap";
import { SelectedSpotsSlide } from "./SpotInformation";
import "../components/AddBlocktoSlide.css";
import { ErrorSummary } from "./ErrorSummary";

const AddBlocktoSlide = props => {
  let { spotsSelected, setAddBlocks, setSpotsSelected, setBlockCard } = props;

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");

  const selectRadioHandler = row => {
    spotsSelected.forEach(value => {
      if (
        (value.selectCount === 0 && Object.entries(value.blockSelected).length === 0) ||
        (value.selectCount === 1 && Object.entries(value.blockSelected).length > 1)
      ) {
        value.blockSelected = {
          name: row.name,
          id: row.id,
        };
      }
    });
  };

  const addBlocks = () => {
    var blockSelected = true;

    spotsSelected.forEach(value => {
      if (Object.entries(value.blockSelected).length < 1) {
        blockSelected = false;
      } else {
        value.selectCount = 0;
      }
    });
    if (blockSelected) {
      setShowErrorSummary(true);
      setSpotsSelected(spotsSelected);
      setBlockCard();
      setAddBlocks(false);
    } else {
      setShowErrorSummary(true);
      setPageErrorMessage("Please select block to process");
    }
  };

  const returnToGrid = () => {
    spotsSelected.forEach(value => {
      if (value.selectCount === 0) {
        value.blockSelected = {};
      }
    });
    setSpotsSelected(spotsSelected);
    setAddBlocks(false);
  };

  const getButtons = () => {
    return (
      <div className="text-center mb-2 mt-2">
        <Button onClick={() => returnToGrid()} className="gg-btn-blue mt-2 gg-mr-20">
          Back
        </Button>
        <Button onClick={() => addBlocks()} className="gg-btn-blue mt-2 gg-ml-20">
          Finish
        </Button>
      </div>
    );
  };

  return (
    <>
      {showErrorSummary === true && (
        <ErrorSummary show={showErrorSummary} form="addblocktoslide" errorMessage={pageErrorMessage}></ErrorSummary>
      )}

      {getButtons()}
      <Row>
        <Col xs={{ span: 12, order: 1 }} xl={{ span: 4, order: 2 }} className="mt-4">
          <SelectedSpotsSlide currentSpotsSelected={spotsSelected} />
        </Col>
        <Col xs={{ span: 12, order: 2 }} xl={{ span: 8, order: 1 }}>
          <GlygenTable
            columns={[
              {
                Header: "Name",
                accessor: "name",
              },
            ]}
            defaultPageSize={10}
            defaultSortColumn="id"
            showCommentsButton={false}
            showDeleteButton={false}
            showEditButton={false}
            commentsRefColumn="description"
            fetchWS="blocklayoutlist"
            keyColumn="id"
            showRowsInfo
            infoRowsText="Block Layouts"
            showSelectRadio={true}
            selectRadioHandler={selectRadioHandler}
          />
        </Col>
      </Row>
      {getButtons()}
    </>
  );
};

AddBlocktoSlide.propTypes = {
  spotsSelected: PropTypes.object,
  setAddBlocks: PropTypes.func,
  setSpotsSelected: PropTypes.func,
  setBlockCard: PropTypes.func
};

export { AddBlocktoSlide };
