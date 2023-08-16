import React, { useEffect, useState, useReducer } from "react";
import PropTypes from "prop-types";
import { Loading } from "../components/Loading";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { GridForm } from "../components/GridForm";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { useHistory, Prompt, useParams } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import { SelectedSpotsSlide, SpotInformationBlock } from "../components/SpotInformation";
import { ColorNotation } from "../components/ColorNotation";
import { GlygenGrid } from "../components/GlygenGrid";
import { AddBlocktoSlide } from "../components/AddBlocktoSlide";
import "../containers/AddSlideLayout.css";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import { Typography } from "@material-ui/core";
import wikiHelpTooltip from "../appData/wikiHelpTooltip";
import FeedbackWidget from "../components/FeedbackWidget";

const AddSlideLayout = props => {
  let { slideLayoutId } = useParams();

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    if (slideLayoutId && slideLayoutId !== "") {
      setShowLoading(true);
      wsCall(
        "getslidelayout",
        "GET",
        { qsParams: { loadAll: false }, urlParams: [slideLayoutId] },
        true,
        null,
        getSlideLayoutSuccess,
        getSlideLayoutFailure
      );
      setTitle("Edit Slide Layout");
      setSubTitle(
        "Update slide layout information. Name must be unique in your slide layout repository and cannot be used for more than one slide layout."
      );
    }

    if (!arraySelected.length > 0) {
      setArraySelected(spotsSelected);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideLayoutId]);

  const gridSize = {
    name: "",
    description: "",
    cols: "",
    rows: "",
  };

  const gridSizeUpdated = {
    name: "",
    description: "",
    cols: "",
    rows: "",
  };

  const [gridParams, setGridParams] = useReducer((state, newState) => ({ ...state, ...newState }), gridSize);

  const [updatedGridParams, setUpdatedGridParams] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    gridSizeUpdated
  );

  const [arraySelected, setArraySelected] = useState(new Map());
  const [spotsSelected, setSpotsSelected] = useState(new Map());
  const [blockCard, setBlockCard] = useState();

  const [showLoading, setShowLoading] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [enablePrompt, setEnablePrompt] = useState(false);
  const [loadGrid, setLoadGrid] = useState(false);
  const [validated, setValidated] = useState(false);
  const [addBlocks, setAddBlocks] = useState(false);
  const [isUpdateSlide, setIsUpdateSlide] = useState(false);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [enableUpdateButton, setEnableUpdateButton] = useState(false);
  const [title, setTitle] = useState("Add Slide Layout to Repository");
  const [subTitle, setSubTitle] = useState(
    "Please provide the information and create the grid for the new slide layout."
  );
  const [duplicateName, setDuplicateName] = useState(false);
  const history = useHistory();
  const [characterCounter, setCharacterCounter] = useState();

  useEffect(() => {
    if (!arraySelected.length > 0) {
      setArraySelected(spotsSelected);
    }
  });

  const handleChange = e => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    setGridParams({ [name]: value });

    if (isUpdateSlide) {
      if (value !== updatedGridParams[name]) {
        setEnableUpdateButton(true);
      } else {
        setEnableUpdateButton(false);
      }
    }

    if (name === "description") {
      setCharacterCounter(value.length);
    }

    setEnablePrompt(true);
  };

  const changeRowsandColumns = () => {
    setUpdatedGridParams(gridParams);

    var spotsSel = new Map(arraySelected);
    var changedGridSpots = new Map(arraySelected);

    var itr = spotsSel.entries();

    for (var pair of itr) {
      var value = pair[1];
      if (value.selectedRow > gridParams.rows || value.selectedCol > gridParams.cols) {
        changedGridSpots.delete(value.selectedRow + "," + value.selectedCol);
      }
    }

    setSpotsSelected(changedGridSpots);
    setArraySelected(changedGridSpots);
  };

  const validateForm = () => {
    if (gridParams.name === "" || gridParams.rows === "" || gridParams.cols === "") {
      setValidated(true);
    } else {
      setUpdatedGridParams(gridParams);
      setLoadGrid(true);
    }
  };

  const createGrid = () => {
    return (
      <>
        <GlygenGrid
          gridParams={updatedGridParams}
          selectedArray={updateSelectedArray}
          setBackGroundColor={setBackGroundColor}
          selectedColor={selectedColor}
        />
      </>
    );
  };

  // Update the object with selected and deselected spots
  const updateSelectedArray = (row, col) => {
    var spots = new Map(arraySelected);
    var selectedSpot = spots.get(row + "," + col);

    if (isUpdateSlide) {
      return selectedSpot ? gridForUpdateSlide(spots, selectedSpot) : "";
    }

    if (spots.has(row + "," + col)) {
      if (Object.entries(selectedSpot.blockSelected).length > 0) {
        if (selectedSpot.selectCount > 0) {
          selectedSpot.selectCount = 0;
          setBlockCard();
        } else {
          selectedSpot.selectCount = 1;
          setBlockCard(selectedSpot);
        }
      } else {
        spots.delete(row + "," + col);
      }
    } else {
      setBlockCard();
      spots.set(row + "," + col, {
        selectedRow: row,
        selectedCol: col,
        blockSelected: {},
        selectCount: 0,
        // color: ""
      });
    }

    setArraySelected(spots);
    setSpotsSelected(spots);
    setShowErrorSummary(false);
  };

  const gridForUpdateSlide = (spots, selectedSpot) => {
    if (blockCard) {
      var itr = spots.entries();

      for (var pair of itr) {
        var value = pair[1];
        if (
          value.selectCount === 1 &&
          blockCard.selectedRow === selectedSpot.selectedRow &&
          blockCard.selectedCol === selectedSpot.selectedCol
        ) {
          selectedSpot.selectCount = 0;
          setBlockCard();
        } else if (
          value.selectCount === 0 &&
          value.selectedRow === selectedSpot.selectedRow &&
          value.selectedCol === selectedSpot.selectedCol
        ) {
          selectedSpot.selectCount = 1;
          setBlockCard(selectedSpot);
        } else {
          value.selectCount = 0;
        }
      }
    } else {
      selectedSpot.selectCount = 1;
      setBlockCard(selectedSpot);
    }

    setSpotsSelected(spots);
    setArraySelected(spots);
  };

  // Update all spots bg color
  const setBackGroundColor = (row, col) => {
    var spots = new Map(arraySelected);
    var selectedSpot = spots.get(row + "," + col);
    var bgColor = "";

    if (selectedSpot) {
      if (Object.entries(selectedSpot.blockSelected).length > 0) {
        bgColor = "darkgreen";
      } else {
        bgColor = "#B1B4B2";
      }
    }
    return bgColor;
  };

  // Update selection x mark color
  const selectedColor = (row, col) => {
    // var markXColor = "white";
    var markXColor = "#f5f5f5"; // as we changed the bg color of the body for the app so we swtiched from white to this color to hide x
    var spots = new Map(arraySelected);
    var selectedSpot = spots.get(row + "," + col);

    if (
      selectedSpot &&
      Object.entries(selectedSpot.blockSelected).length > 1 &&
      // !selectedSpot.color &&
      selectedSpot.selectCount === 0
    ) {
      markXColor = "darkgreen";
    }
    return markXColor;
  };

  const removeDuplicateSpots = () => {
    var enableModal = false;
    var emptySpotValidation = false;

    if (spotsSelected.size > 0) {
      spotsSelected.forEach(value => {
        if (value.selectCount === 1) {
          enableModal = true;
        } else if (Object.entries(value.blockSelected).length < 1 && value.selectCount === 0) {
          emptySpotValidation = true;
        }
      });

      if (enableModal) {
        setShowAddBlockModal(true);
      } else {
        if (emptySpotValidation) {
          confirmModal();
        } else {
          setPageErrorMessage("Please select spots to add block");
          setShowErrorSummary(true);
        }
      }
    }
  };

  const cancelModal = () => setShowAddBlockModal(false);

  const confirmModal = () => {
    setShowAddBlockModal(false);
    setShowErrorSummary(false);
    setAddBlocks(true);
  };

  const getButtons = () => {
    return (
      <div className="text-center mb-2 mt-2">
        <Button
          onClick={() => removeDuplicateSpots()}
          disabled={spotsSelected.size < 1}
          className="gg-btn-blue mt-2 gg-mr-20"
        >
          Add Blocks
        </Button>
        <Button
          type="submit"
          className={loadGrid ? "gg-btn-blue mt-2 gg-ml-20" : "hide-content"}
          disabled={spotsSelected.length < 1}
        >
          Submit
        </Button>
      </div>
    );
  };

  const getUpdateButtons = () => {
    return (
      <div className="text-center mb-2">
        <Button onClick={() => history.push("/slideLayouts")} className="gg-btn-outline mt-2 gg-mr-20">
          Cancel
        </Button>
        <Button disabled={!enableUpdateButton} type="submit" className="gg-btn-blue mt-2 gg-ml-20">
          Submit
        </Button>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{head.addSlideLayout.title}</title>
        {getMeta(head.addSlideLayout)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading title={title} subTitle={subTitle} />
          <Typography className="text-right" gutterBottom>
            <HelpToolTip
              title={
                !addBlocks
                  ? wikiHelpTooltip.slide_layout.generic_information.title
                  : wikiHelpTooltip.slide_layout.adding_block.title
              }
              text={wikiHelpTooltip.tooltip_text}
              url={
                !addBlocks
                  ? wikiHelpTooltip.slide_layout.generic_information.url
                  : wikiHelpTooltip.slide_layout.adding_block.url
              }
            />
            {wikiHelpTooltip.help_text}
          </Typography>

          <Card>
            <Card.Body>
              {showErrorSummary === true && (
                <ErrorSummary
                  show={showErrorSummary}
                  form="slideLayouts"
                  errorJson={pageErrorsJson}
                  errorMessage={pageErrorMessage}
                ></ErrorSummary>
              )}

              {enablePrompt && <Prompt message="If you leave you will lose this data!" />}

              {!addBlocks && (
                <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
                  <GridForm
                    gridParams={gridParams}
                    updatedGridParams={updatedGridParams}
                    handleChange={handleChange}
                    loadGrid={loadGrid}
                    changeRowsandColumns={changeRowsandColumns}
                    validateForm={validateForm}
                    isUpdate={isUpdateSlide}
                    duplicateName={duplicateName}
                    layoutType={"slidelayout"}
                    characterCounter={characterCounter}
                  />

                  {loadGrid && (isUpdateSlide ? getUpdateButtons() : getButtons())}
                  {/*loading addfeature and submit button */}

                  {loadGrid && (
                    <>
                      <Row className="gg-align-center text-center">
                        <Col xs={12} md={12} lg={8} className="pb-3 pt-3" style={{ width: "800px" }}>
                          <div
                            className="grid-table"
                            style={{
                              height: gridParams.rows > 30 ? "600px" : "fit-content",
                            }}
                          >
                            {createGrid()}
                          </div>
                        </Col>

                        <Col xs={12} md={12} lg={3} className="ml-3 pl-3 pb-3 pt-3">
                          <ColorNotation pageLabels={"slidelayout"} isUpdate={isUpdateSlide} />

                          {!isUpdateSlide && (
                            <div className="spots-selected">
                              {spotsSelected && spotsSelected.size > 0 ? (
                                <SelectedSpotsSlide currentSpotsSelected={spotsSelected} />
                              ) : null}
                            </div>
                          )}

                          {blockCard && (
                            <div className="selected-spot-info">
                              <SpotInformationBlock blockCard={blockCard} />
                            </div>
                          )}
                        </Col>
                      </Row>
                      {isUpdateSlide ? getUpdateButtons() : getButtons()}
                    </>
                  )}
                </Form>
              )}

              {addBlocks && (
                <AddBlocktoSlide
                  spotsSelected={spotsSelected}
                  setSpotsSelected={setSpotsSelected}
                  setAddBlocks={setAddBlocks}
                  setBlockCard={setBlockCard}
                />
              )}

              <Loading show={showLoading}></Loading>

              <ConfirmationModal
                showModal={showAddBlockModal}
                onCancel={cancelModal}
                onConfirm={confirmModal}
                title="Confirm"
                body="You are going to replace blocks in some Spots. Are you sure you want to proceed?"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);
    setShowLoading(true);

    if (isUpdateSlide) {
      wsCall(
        "updateslidelayout",
        "POST",
        null,
        true,
        {
          id: slideLayoutId,
          name: gridParams.name,
          description: gridParams.description,
        },
        updateSlideLayoutSuccess,
        updateSlideLayoutFailure
      );
    } else {
      var spotsData = getSpotsData();

      if (e.currentTarget.checkValidity()) {
        wsCall(
          "addslidelayout",
          "POST",
          null,
          true,
          {
            name: gridParams.name,
            description: gridParams.description,
            width: updatedGridParams.cols,
            height: updatedGridParams.rows,
            blocks: spotsData,
          },
          addSlideSuccess,
          addSlideFailure
        );
      } else {
        setShowLoading(false);
        setShowErrorSummary(true);
        setPageErrorMessage("Cannot submit empty slide");
      }
    }
    e.preventDefault();
  }

  function getSpotsData() {
    const iterator_ob = arraySelected.entries();
    var spots = [];

    for (const pair of iterator_ob) {
      const value = pair[1];
      if (value.blockSelected.name.length > 0) {
        spots.push({
          row: value.selectedRow,
          column: value.selectedCol,
          blockLayout: {
            name: value.blockSelected.name,
            id: value.blockSelected.id,
          },
        });
      }
    }
    return spots;
  }

  function addSlideSuccess(response) {
    console.log(response);
    setShowLoading(false);
    setEnablePrompt(false);
    history.push("/slideLayouts");
  }

  function addSlideFailure(response) {
    setShowLoading(false);
    setValidated(false);
    setDuplicateName(true);
    response.json().then(response => {
      console.log(response);
      setShowErrorSummary(true);
      setPageErrorsJson(response);
    });
  }

  function updateSlideLayoutSuccess(response) {
    console.log(response);
    setShowLoading(false);
    setEnablePrompt(false);
    history.push("/slideLayouts");
  }

  function updateSlideLayoutFailure(response) {
    setEnableUpdateButton(false);
    var formError = false;

    response.json().then(parsedJson => {
      parsedJson.errors.forEach(element => {
        if (element.objectName === "name") {
          setValidated(false);
          setDuplicateName(true);
          formError = true;
        }
      });

      if (!formError) {
        setPageErrorsJson(parsedJson);
        setShowErrorSummary(true);
      }
    });
    setShowLoading(false);
  }

  function getSlideLayoutSuccess(response) {
    response.json().then(parsedResponse => {
      setSlideLayoutData(parsedResponse);
    });
    setShowLoading(false);
  }

  function getSlideLayoutFailure(response) {
    setShowLoading(false);
    console.log(response);
  }

  function setSlideLayoutData(slidelayout) {
    setGridParams(updateBlockGridParams(slidelayout));
    setUpdatedGridParams(updateBlockGridParams(slidelayout));

    var spots = new Map();

    slidelayout.blocks.forEach(spotElement => {
      spots.set(spotElement.row + "," + spotElement.column, {
        selectedRow: spotElement.row,
        selectedCol: spotElement.column,
        blockSelected: {
          name: spotElement.blockLayout.name,
          id: spotElement.blockLayout.id,
        },
        selectCount: 0,
      });
    });

    setArraySelected(spots);
    setSpotsSelected(spots);
    setAddBlocks(false);
    setLoadGrid(true);
    setIsUpdateSlide(true);
  }
};

function updateBlockGridParams(slidelayout) {
  return {
    name: slidelayout.name,
    description: slidelayout.description,
    cols: slidelayout.width,
    rows: slidelayout.height
  };
}

AddSlideLayout.propTypes = {
  authCheckAgent: PropTypes.func,
  match: PropTypes.object,
  slidelayoutId: PropTypes.string
};

export { AddSlideLayout };
