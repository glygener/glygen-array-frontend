import React, { useState } from "react";
import { GlygenTable } from "../components/GlygenTable";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import { SelectedSpotsSlide } from "./SpotInformation";
import "../components/AddBlocktoSlide.css";
import {ErrorSummary} from "./ErrorSummary";

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
          id: row.id
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
      <div className="line-break-1">
        <Button onClick={() => returnToGrid()}>Back</Button>
        &nbsp;
        <Button onClick={() => addBlocks()}>Finish</Button>
      </div>
    );
  };

  return (
    <>
      {showErrorSummary === true && (
        <ErrorSummary show={showErrorSummary} form="addblocktoslide" errorMessage={pageErrorMessage}></ErrorSummary>
      )}

      {getButtons()}
      <div className="spots-selected-block-to-slide">
        <SelectedSpotsSlide currentSpotsSelected={spotsSelected} />
      </div>

      <div className="glygen-table">
        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name"
            }
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
      </div>
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
