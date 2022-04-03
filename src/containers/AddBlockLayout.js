import React, { useReducer, useState, useEffect } from "react";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Form, Row, Col, Button } from "react-bootstrap";
import "../containers/AddGlycan.css";
import { GlygenGrid } from "../components/GlygenGrid";
import { AddFeatureToBlock } from "../components/AddFeatureToBlock";
import { SpotInformation, SelectedSpotsBlock } from "../components/SpotInformation";
import { wsCall } from "../utils/wsUtils";
import "../containers/AddBlockLayout.css";
import { ErrorSummary } from "../components/ErrorSummary";
import { useHistory, Prompt, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { Loading } from "../components/Loading";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { ColorNotation } from "../components/ColorNotation";
import { GridForm } from "../components/GridForm";
import MetadataKeyPairs from "../public/MetadataKeyPairs";
// import { scrollToTopIcon } from "../utils/commonUtils";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";

const AddBlockLayout = props => {
  let { blockLayoutId } = useParams();
  // var count = 0;

  useEffect(() => {
    if (props.authCheckAgent && !props.publicView) {
      props.authCheckAgent();
    }

    if (blockLayoutId && blockLayoutId !== "") {
      // count = 1;
      setShowLoading(true);
      wsCall(
        "getblocklayout",
        "GET",
        { qsParams: { loadAll: true }, urlParams: [blockLayoutId] },
        true,
        null,
        getBlockLayoutSuccess,
        getBlockLayoutFailure
      );
      setTitle("Edit Block Layout");
      setSubTitle(
        "Update block layout information. Name must be unique in your block layout repository and cannot be used for more than one block layout."
      );
    } else if (props.publicView) {
      setShowLoading(true);
      wsCall(
        "getpublicblocklayout",
        "GET",
        { qsParams: { loadAll: true }, urlParams: [props.publicView] },
        true,
        null,
        getBlockLayoutSuccess,
        getBlockLayoutFailure
      );
    }

    wsCall(
      "listspotmetadata",
      "GET",
      { offset: 0 },
      true,
      null,
      response =>
        response.json().then(responseJson => {
          setListSpots(responseJson.rows);
        }),
      getBlockLayoutFailure
    );
    if (!arraySelected.length > 0) {
      setArraySelected(spotsSelected);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockLayoutId]);

  const gridSize = {
    cols: "",
    rows: "",
    name: "",
    description: " "
  };

  const gridSizeUpdated = {
    cols: "",
    rows: "",
    name: "",
    description: " "
  };

  const [gridParams, setGridParams] = useReducer((state, newState) => ({ ...state, ...newState }), gridSize);
  const [updatedGridParams, setUpdatedGridParams] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    gridSizeUpdated
  );

  const [arraySelected, setArraySelected] = useState([]);
  const [spotsSelected, setSpotsSelected] = useState([]);

  const [title, setTitle] = useState("Add Block Layout to Repository");
  const [subTitle, setSubTitle] = useState(
    "Please provide the information and create the grid for the new block layout."
  );
  const [spotFeatureCard, setSpotFeatureCard] = useState();
  const [loadGrid, setLoadGrid] = useState(false);
  const [addFeatures, setAddFeatures] = useState(false);
  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [groupCounter, setGroupCounter] = useState(0);
  const [isUpdateBlock, setIsUpdateBlock] = useState(false); //flag to enable update block code
  const [enableUpdateButton, setEnableUpdateButton] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [enablePrompt, setEnablePrompt] = useState(false);
  const [duplicateName, setDuplicateName] = useState(false);
  const [characterCounter, setCharacterCounter] = useState();
  const [accordionDrop, setAccordionDrop] = useState(false);
  const [selectedSpotMetadata, setSelectedSpotMetadata] = useState("");
  const [listSpots, setListSpots] = useState([]);

  const history = useHistory();

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    setGridParams({ [name]: newValue });

    if (isUpdateBlock) {
      if (newValue !== updatedGridParams[name]) {
        setDuplicateName(false);
        setEnableUpdateButton(true);
      } else {
        setEnableUpdateButton(false);
      }
    }
    if (name === "description") {
      setCharacterCounter(newValue.length);
    }

    setEnablePrompt(true);
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

  const changeRowsandColumns = () => {
    setUpdatedGridParams(gridParams);

    var spotsSelected = [...arraySelected];
    var changedGridSpots = [...arraySelected];

    spotsSelected.map(spot => {
      if (spot.selectedRow > gridParams.rows || spot.selectedCol > gridParams.cols) {
        changedGridSpots.splice(changedGridSpots.indexOf(spot), 1);
      }
      return "";
    });

    setSpotsSelected(changedGridSpots);
    setArraySelected(changedGridSpots);
  };

  const updateSelectedArray = (row, col) => {
    var spots = [...arraySelected];

    var selectedSpot = spots.find(i => i.selectedRow === row && i.selectedCol === col);
    var selectedSpotIndex;

    if (isUpdateBlock && selectedSpot) {
      gridUpdateforUpdateBlock(spots, selectedSpot);
      return;
    } else if (isUpdateBlock && !selectedSpot) {
      return;
    }

    if (selectedSpot) {
      if (selectedSpot.selectedFeatures.length > 0) {
        if (!spotFeatureCard && selectedSpot.selectedFeatures.length < 1) {
          spots = updateGroupColor(selectedSpot, spots);
          setSpotFeatureCard(selectedSpot);
          createSpot(spots, row, col);
        } else {
          var selectedSpotLastIndex;

          spots.forEach(element => {
            if (
              selectedSpot.selectedRow === element.selectedRow &&
              selectedSpot.selectedCol === element.selectedCol &&
              element.selectedFeatures.length < 1
            ) {
              selectedSpotLastIndex = spots.indexOf(element);
            }
          });

          selectedSpotIndex = spots.indexOf(selectedSpot);

          if (selectedSpotLastIndex && selectedSpotLastIndex !== selectedSpotIndex) {
            setSpotFeatureCard();

            spots.splice(selectedSpotLastIndex, 1);

            spots.map(element => {
              if (
                element.selectedRow === selectedSpot.selectedRow &&
                element.selectedCol === selectedSpot.selectedCol &&
                element.selectedFeatures.length > 0
              ) {
                element.color = "";
                spots.map(spotObject => {
                  if (spotObject.groupAssigned === element.groupAssigned) {
                    spotObject.color = "";
                  }
                  return "";
                });
              } else if (
                element.selectedRow !== selectedSpot.selectedRow &&
                element.selectedCol !== selectedSpot.selectedCol &&
                element.selectedFeatures.length > 0 &&
                element.color === "orange"
              ) {
                spots.map(spotObject => {
                  if (spotObject.groupAssigned === element.groupAssigned) {
                    spotObject.color = "";
                  }
                  return "";
                });
              }
              return "";
            });
          } else {
            spots = updateGroupColor(selectedSpot, spots);
            setSpotFeatureCard(selectedSpot);
            setShowErrorSummary(false);
            createSpot(spots, row, col);
          }
        }
      } else {
        setSpotFeatureCard();
        selectedSpotIndex = spots.indexOf(selectedSpot);
        spots.splice(selectedSpotIndex, 1);
        spots = updateGroupColor(selectedSpot, spots);
      }
    } else {
      setSpotFeatureCard();
      createSpot(spots, row, col);
      spots = updateGroupColor(selectedSpot, spots);
    }

    setArraySelected(spots);
    setSpotsSelected(spots);
  };

  const createSpot = (spots, row, col) => {
    spots.push({
      selectedRow: row,
      selectedCol: col,
      selectedFeatures: [],
      selectedConcentration: {},
      groupAssigned: 0,
      color: "" //background color of a spot is updated using this property
    });
    return spots;
  };

  const updateGroupColor = (selectedSpot, spots) => {
    spots.forEach(element => {
      element.color =
        selectedSpot &&
        selectedSpot.groupAssigned > 0 &&
        element.groupAssigned &&
        element.groupAssigned === selectedSpot.groupAssigned
          ? "orange"
          : "";
    });

    return spots;
  };

  const setBackGroundColor = (row, col) => {
    var spots = [...arraySelected];

    var selectedSpot = spots.find(i => i.selectedRow === row && i.selectedCol === col);

    if (selectedSpot) {
      if (selectedSpot.selectedFeatures.length > 0) {
        if (selectedSpot.color) {
          return "orange";
        } else {
          return "darkgreen";
        }
      } else {
        return "#B1B4B2";
      }
    }
    return "";
  };

  const selectedColor = (row, col) => {
    if (isUpdateBlock) {
      var xMarkColor = selectedColorForUpdateBlock(row, col);
      return xMarkColor;
    }
    // var markXColor = "#f5f5f5"; // before using the card for blocklayout grid we changed the bg color of the body for the app so we swtiched from white to this color to hide x

    var markXColor = "white"; // using default page color to hide x
    var spots = [...arraySelected];

    const selectedSpot = spots.filter(spot => spot.selectedRow === row && spot.selectedCol === col);

    if (selectedSpot.length > 0) {
      if (selectedSpot.length > 1) {
        // markXColor = "#f5f5f5";
        markXColor = "white";
      } else if (selectedSpot[0].color === "orange") {
        markXColor = "orange";
      } else if (selectedSpot[0].selectedFeatures.length > 0 && !selectedSpot[0].color) {
        markXColor = "darkgreen";
      } else if (!selectedSpot.featureSelected) {
        if (selectedSpot[0].color) {
          // markXColor = "#f5f5f5";
          markXColor = "white";
        }
      }
    }
    return markXColor;
  };

  const selectedColorForUpdateBlock = (row, col) => {
    let markXColor = "white";
    // xMarkColor = "#f5f5f5";
    let spots = [...arraySelected];
    let selectedSpot = spots.find(i => i.selectedRow === row && i.selectedCol === col);

    if (selectedSpot) {
      if (spotFeatureCard && spotFeatureCard.selectedRow === row && spotFeatureCard.selectedCol === col) {
        if (selectedSpot.color && selectedSpot.color === "orange") {
          // xMarkColor = "#f5f5f5";
          markXColor = "white";
        }
      } else {
        if (!selectedSpot.color) {
          markXColor = "darkgreen";
        } else {
          markXColor = "orange";
        }
      }
    }
    return markXColor;
  };

  const setBackGroundColorForUpdateBlock = () => {
    arraySelected.forEach(spot => {
      setBackGroundColor(spot.selectedRow, spot.selectedCol);
      updateSelectedArray(spot.selectedRow, spot.selectedCol);
    });
  };

  const gridUpdateforUpdateBlock = (spots, selectedSpot) => {
    if (
      spotFeatureCard &&
      spotFeatureCard.selectedRow === selectedSpot.selectedRow &&
      spotFeatureCard.selectedCol === selectedSpot.selectedCol
    ) {
      spots.map(element => {
        if (element.color) {
          element.color = "";
        }
        return "";
      });
      setSpotFeatureCard();
    } else if (blockLayoutId || props.publicView) {
      spots = updateGroupColor(selectedSpot, spots);
      setSpotFeatureCard(selectedSpot);
    }

    setSpotsSelected(spots);
    setArraySelected(spots);
  };

  const removeDuplicateSpots = () => {
    var spots = [...spotsSelected];
    var countForConfirm = 0;

    spots.forEach(element => {
      if (element.selectedFeatures.length < 1) {
        spots.forEach(spot => {
          if (
            spot.selectedRow === element.selectedRow &&
            spot.selectedCol === element.selectedCol &&
            spot.selectedFeatures.length > 0
          ) {
            countForConfirm = 1;
          }
        });
      }
    });

    if (countForConfirm > 0) {
      setShowAddFeatureModal(true);
    } else {
      confirmModal();
    }
  };

  const cancelModal = () => setShowAddFeatureModal(false);

  const confirmModal = () => {
    setShowAddFeatureModal(false);

    var emptySpotCount = 0;
    var updatedSpots = [...spotsSelected];

    spotsSelected.forEach(element => {
      if (element.selectedFeatures.length < 1) {
        spotsSelected.forEach(value => {
          if (
            value.selectedRow === element.selectedRow &&
            value.selectedCol === element.selectedCol &&
            value.selectedFeatures.length > 0
          ) {
            updatedSpots.splice(updatedSpots.indexOf(value), 1);
          }
        });
        emptySpotCount = emptySpotCount + 1;
      }
    });

    updatedSpots.forEach(element => {
      element.color = "";
    });

    setSpotsSelected(updatedSpots);
    setArraySelected(updatedSpots);

    if (emptySpotCount > 0) {
      setSpotFeatureCard();
      setAddFeatures(true);
      setShowErrorSummary(false);
    } else {
      setPageErrorMessage("Please select spots to add features");
      setShowErrorSummary(true);
    }
  };

  const getButtons = () => {
    debugger;
    return (
      <div className="text-center mb-2 mt-2">
        <Button
          onClick={() => removeDuplicateSpots()}
          disabled={spotsSelected.length < 1 || !selectedSpotMetadata.value}
          className="gg-btn-blue mt-2 gg-mr-20"
        >
          Add Features
        </Button>
        <Button
          type="submit"
          className={loadGrid ? "gg-btn-blue mt-2 gg-ml-20" : "hide-content"}
          disabled={spotsSelected.length < 1 || !selectedSpotMetadata.value}
        >
          Submit
        </Button>
      </div>
    );
  };

  const getUpdateButtons = () => {
    return (
      <div className="text-center mb-2">
        <Button onClick={() => history.push("/blockLayouts")} className="gg-btn-outline mt-2 gg-mr-20">
          Cancel
        </Button>
        <Button disabled={!enableUpdateButton} type="submit" className="gg-btn-blue mt-2 gg-ml-20">
          Submit
        </Button>
      </div>
    );
  };

  const handleSpotSelectionChange = e => {
    const id = e.target.value !== "" ? e.target.options[e.target.value].id : "";
    const name = e.target.name;
    const value = e.target.value;
    setSelectedSpotMetadata({ id: id, name: name, value: value });
  };

  return (
    <>
      <Container maxWidth="xl">
        <div className="page-container">
          {!props.publicView && (
            <>
              <Helmet>
                <title>{head.addBlockLayout.title}</title>
                {getMeta(head.addBlockLayout)}
              </Helmet>

              <PageHeading title={title} subTitle={subTitle} />

              {showErrorSummary === true && (
                <ErrorSummary
                  show={showErrorSummary}
                  form="blockLayouts"
                  errorJson={pageErrorsJson}
                  errorMessage={pageErrorMessage}
                ></ErrorSummary>
              )}
              {enablePrompt && <Prompt message="If you leave you will lose this data!" />}
            </>
          )}
          <Card>
            <Card.Body>
              {!addFeatures && (
                <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
                  <GridForm
                    gridParams={gridParams}
                    updatedGridParams={updatedGridParams}
                    handleChange={handleChange}
                    isUpdate={isUpdateBlock}
                    loadGrid={loadGrid}
                    changeRowsandColumns={changeRowsandColumns}
                    validateForm={validateForm}
                    duplicateName={duplicateName}
                    characterCounter={characterCounter}
                    accordionDrop={accordionDrop}
                    publicView={props.publicView}
                    selectedSpotMetadata={selectedSpotMetadata}
                    spotList={listSpots}
                    handleSpotSelection={handleSpotSelectionChange}
                    enableSpotMetadataSelection={!isUpdateBlock}
                  />

                  {!props.publicView ? loadGrid && (isUpdateBlock ? getUpdateButtons() : getButtons()) : ""}

                  {/*loading addfeature and submit button */}
                  {loadGrid && (
                    <>
                      <Row className="gg-align-center text-center">
                        <Col xs={12} md={12} lg={8} className="pb-3 pt-3" style={{ width: "800px" }}>
                          <div
                            className="grid-table"
                            style={{
                              height: gridParams.rows > 30 ? "600px" : "fit-content"
                            }}
                          >
                            {createGrid()}
                          </div>
                        </Col>

                        <Col xs={12} md={12} lg={3} className="ml-3 pl-3 pb-3 pt-3">
                          <ColorNotation pageLabels={"blocklayout"} isUpdate={isUpdateBlock} />

                          {!isUpdateBlock && !props.publicView && (
                            <div className="spots-selected">
                              {spotsSelected && spotsSelected.length > 0 ? (
                                <SelectedSpotsBlock currentSpotsSelected={spotsSelected} />
                              ) : null}
                            </div>
                          )}

                          {spotFeatureCard && (
                            <>
                              <div className="selected-spot-info">
                                <SpotInformation spotFeaturedCard={spotFeatureCard} />
                              </div>
                              <div
                                style={{
                                  border: "1px solid rgba(0, 0, 0, 0.1)",
                                  borderRadius: "8px"
                                }}
                              >
                                <div className={"summary-border"}>
                                  <h4>Spot Metadata</h4>
                                </div>
                                {isUpdateBlock && spotFeatureCard.metadata ? (
                                  <MetadataKeyPairs metadata={spotFeatureCard.metadata} showLoading={false} />
                                ) : (
                                  <h6>No Data Available</h6>
                                )}
                              </div>
                            </>
                          )}
                        </Col>
                      </Row>
                      {!props.publicView ? (isUpdateBlock ? getUpdateButtons() : getButtons()) : ""}
                    </>
                  )}
                </Form>
              )}

              {addFeatures && (
                <AddFeatureToBlock
                  setSpotsSelected={setSpotsSelected}
                  spotsSelected={spotsSelected}
                  setAddFeatures={setAddFeatures}
                  setSpotFeatureCard={setSpotFeatureCard}
                  groupCounter={groupCounter}
                  setGroupCounter={setGroupCounter}
                  spotMetadata={selectedSpotMetadata}
                  spotMetadataList={listSpots}
                />
              )}

              <Loading show={showLoading} />
              <ConfirmationModal
                showModal={showAddFeatureModal}
                onCancel={cancelModal}
                onConfirm={confirmModal}
                title="Confirm"
                body="You are going to replace features in some Spots. Are you sure you want to proceed?"
              />
            </Card.Body>
          </Card>
        </div>
      </Container>
      {/* <Col>{scrollToTopIcon()}</Col> */}
    </>
  );

  function handleSubmit(e) {
    setValidated(true);

    setShowLoading(true);

    if (isUpdateBlock) {
      wsCall(
        "updateblocklayout",
        "POST",
        null,
        true,
        {
          id: blockLayoutId,
          name: gridParams.name,
          description: gridParams.description
        },
        updateBlockLayoutSuccess,
        updateBlockLayoutFailure
      );
    } else {
      var spotsData = getSpotsData();

      if (e.currentTarget.checkValidity() && spotsData.length > 0) {
        wsCall(
          "addblocklayout",
          "POST",
          null,
          true,
          {
            name: gridParams.name,
            description: gridParams.description,
            width: updatedGridParams.cols,
            height: updatedGridParams.rows,
            spots: spotsData
          },
          addBlockLayoutSuccess,
          addBlockLayoutFailure
        );
      } else {
        setShowLoading(false);
        setShowErrorSummary(true);
        setPageErrorMessage("Cannot submit empty block");
      }
    }

    e.preventDefault();
  }

  function getSpotsData() {
    var spots = [];
    arraySelected.forEach(element => {
      if (element.selectedFeatures.length > 0) {
        spots.push({
          row: element.selectedRow,
          column: element.selectedCol,
          features: element.selectedFeatures.map(e => e.feature),
          group: element.groupAssigned,
          // concentration: element.selectedConcentration,
          ratioConcentrationMap: getFeatureToRatioConcentrationMap(element.selectedFeatures),
          metadata: element.metadata
        });
      }
    });

    return spots;
  }

  function getFeatureToRatioConcentrationMap(features) {
    let featureToRatioConcentrationMap = {};

    features.forEach(element => {
      let ratioConcentration = element.concentrationInfo;

      ratioConcentration &&
        !ratioConcentration.notReported &&
        Object.assign(featureToRatioConcentrationMap, {
          [element.feature.id]: {
            ratio: ratioConcentration.ratio,
            concentration: {
              concentration: ratioConcentration.concentration,
              levelUnit: ratioConcentration.unitlevel
            }
          }
        });
    });
    return featureToRatioConcentrationMap;
  }

  function addBlockLayoutSuccess(response) {
    console.log(response);
    setShowLoading(false);
    setEnablePrompt(false);
    history.push("/blockLayouts");
  }

  function addBlockLayoutFailure(response) {
    response.json().then(response => {
      setPageErrorsJson(response);
      setShowErrorSummary(true);
      setShowLoading(false);
    });
  }

  function updateBlockLayoutSuccess(response) {
    console.log(response);
    setShowLoading(false);
    setEnablePrompt(false);
    history.push("/blockLayouts");
  }

  function updateBlockLayoutFailure(response) {
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

  function getBlockLayoutSuccess(response) {
    response.json().then(parsedResponse => {
      setBlockLayoutData(parsedResponse);
      console.log(parsedResponse);
    });
    setShowLoading(false);
  }

  function getBlockLayoutFailure(response) {
    setShowLoading(false);
  }

  function setBlockLayoutData(blocklayout) {
    setGridParams(updateBlockGridParams(blocklayout));
    setUpdatedGridParams(updateBlockGridParams(blocklayout));

    blocklayout.spots.forEach(spotElement => {
      var spot = [];
      spot.selectedRow = spotElement.row;
      spot.selectedCol = spotElement.column;
      spot.groupAssigned = spotElement.group;
      spot.selectedFeatures = [];
      spot.metadata = spotElement.metadata;
      // spot.color = "";

      spotElement.features.forEach(feature => {
        let concen = spotElement.ratioConcentrationMap[feature.id];

        var featureSelected = {
          feature: feature,
          concentrationInfo: {
            concentration: concen && concen.concentration.concentration,
            unitlevel: concen && concen.concentration.levelUnit,
            ratio: concen && concen.ratio
          }
        };
        spot.selectedFeatures.push(featureSelected);
      });
      spotsSelected.push(spot);
    });

    setArraySelected(spotsSelected);
    setAddFeatures(false);
    setLoadGrid(true);
    setBackGroundColorForUpdateBlock();
    setAccordionDrop(true);
    setIsUpdateBlock(true);
  }
};

function updateBlockGridParams(blocklayout) {
  return {
    name: blocklayout.name,
    description: blocklayout.description,
    cols: blocklayout.width,
    rows: blocklayout.height
  };
}

AddBlockLayout.propTypes = {
  blocklayoutId: PropTypes.string,
  match: PropTypes.object,
  authCheckAgent: PropTypes.func,
  publicView: PropTypes.string
};

export { AddBlockLayout };
