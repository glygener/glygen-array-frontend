import React, { useState, useReducer } from "react";
import "../containers/AddGlycan.css";
import PropTypes from "prop-types";
import { GlygenTable } from "../components/GlygenTable";
import { Row, Col, Form, FormControl } from "react-bootstrap";
import { FormLabel } from "../components/FormControls";
import "../components/AddFeatureToBlock.css";
import { SelectedSpotsBlock } from "./SpotInformation";
import ReactTable from "react-table";
import { StructureImage } from "../components/StructureImage";
import { ErrorSummary } from "./ErrorSummary";
import { wsCall } from "../utils/wsUtils";
import { Popover } from "react-bootstrap";
import { MetaData } from "../containers/MetaData";
import { Button, makeStyles, Step, StepLabel, Stepper, Typography } from "@material-ui/core";
import { isValidNumber } from "../utils/commonUtils";

const useStyles = makeStyles(theme => ({
  root: {
    width: "90%"
  },
  backButton: {
    marginRight: theme.spacing(1)
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

const AddFeatureToBlock = props => {
  var { setSpotsSelected, spotsSelected, setAddFeatures, setSpotFeatureCard, groupCounter, setGroupCounter } = props;

  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [validate, setValidate] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState();
  const [unitLevels, setUnitLevels] = useState([]);
  var [rowSelected, setRowSelected] = useState([]);
  const [spotMetadataforAddBlockLayout, setSpotMetadataforAddBlockLayout] = useState([]);
  const [spotMetaDataToSubmit, setSpotMetaDataToSubmit] = useState();
  const [spotmetadataUpdated, setSpotmetadataUpdated] = useState(props.spotMetadata);
  const [metadataId, setMetadataId] = useState(props.spotMetadata.id);
  const [idChange, setIdChange] = useState(false);

  const features = {
    featureSelected: {
      feature: "",
      ratio: ""
    }
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [featuresSelected, setFeaturesSelected] = useReducer(reducer, features);

  const concentration = {
    concentration: 0,
    unitlevel: "fmol/spot"
  };

  const concentrationReducer = (state, newState) => ({ ...state, ...newState });
  const [spotConcentration, setSpotConcentration] = useReducer(concentrationReducer, concentration);

  const steps = getSteps();

  const handleNext = e => {
    setValidate(false);
    setPageErrorMessage();
    setShowErrorSummary(false);
    let stepIncrement = 1;

    if (!featuresSelected.featureSelected.length) {
      setPageErrorMessage("Please select Features");
      setShowErrorSummary(true);
      return;
    }

    if (activeStep === 1 && featuresSelected.featureSelected.length !== 1) {
      if (!validFeatureRatios()) {
        setPageErrorMessage("Total Ratios Should be 100%");
        setShowErrorSummary(true);
        return;
      } else {
        setShowErrorSummary(false);
      }
    } else if (activeStep === 0 && featuresSelected.featureSelected.length === 1) {
      stepIncrement += 1;
    }

    if (e.currentTarget.innerText === "FINISH") {
      //increment group counter
      ++groupCounter;

      spotsSelected.forEach(spot => {
        if (spot.selectedFeatures.length < 1) {
          featuresSelected.featureSelected.forEach(feature => {
            spot.selectedFeatures.push({
              feature: feature,
              ratio: feature.ratio
            });
          });
          spot.selectedConcentration = spotConcentration;
          spot.groupAssigned = groupCounter;
          spot.metadata = spotMetaDataToSubmit;
        }
      });

      setSpotsSelected(spotsSelected);
      setSpotFeatureCard();
      setAddFeatures(false);
      setShowErrorSummary(true);
      setGroupCounter(groupCounter);
      return;
    }

    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const handleBack = () => {
    let stepDecrement = 1;
    setPageErrorMessage();
    setShowErrorSummary(false);
    activeStep === 0 && setAddFeatures(false);

    if (activeStep === 2 && featuresSelected.featureSelected.length === 1) {
      stepDecrement += 1;
    }

    setActiveStep(prevActiveStep => prevActiveStep - stepDecrement);
  };

  const handleChange = e => {
    const id = e.currentTarget.id;
    const value = e.currentTarget.value;

    var rowUpdated = [...featuresSelected.featureSelected];

    rowUpdated[id].ratio = Number(value);

    setFeaturesSelected(rowUpdated);
    setShowErrorSummary(false);
  };

  const handleChecboxChange = row => {
    var selectedrow = [...rowSelected];
    var deselectedRow = selectedrow.find(e => e.id === row.id);

    if (deselectedRow) {
      var deselectedRowIndex = selectedrow.indexOf(deselectedRow);
      selectedrow.splice(deselectedRowIndex, 1);
    } else {
      selectedrow.push(row);
      setShowErrorSummary(false);
    }
    setFeaturesSelected({ featureSelected: selectedrow });
    setRowSelected(selectedrow);
  };

  const checkSelection = row => {
    if (featuresSelected && featuresSelected.featureSelected.length > 0) {
      rowSelected = [...featuresSelected.featureSelected];
    }
    return rowSelected.find(e => e.id === row.id);
  };

  const validFeatureRatios = () => {
    let sumOfRatios = 0;
    featuresSelected.featureSelected.forEach(element => {
      if (element.ratio && element.ratio !== "" && element.ratio !== undefined) {
        sumOfRatios = sumOfRatios + element.ratio;
      }
    });

    if (sumOfRatios !== 0 && sumOfRatios !== 100) {
      return false;
    }
    return true;
  };

  const handleConcentration = e => {
    var name = e.currentTarget.name;
    var value = e.currentTarget.value;

    setSpotConcentration({ [name]: value });
  };

  const getSelectedFeatures = () => {
    return (
      <>
        <div className="feature-ratio-div">
          {featuresSelected.featureSelected.map((element, index) => {
            return (
              <div key={index}>
                <Form.Group as={Row} controlId={index}>
                  <FormLabel label={element.name} style={{ textAlign: "right" }} />
                  <Col md={2} style={{ textAlign: "left" }}>
                    <FormControl
                      type="number"
                      name="featureRatio"
                      onChange={handleChange}
                      value={element.ratio}
                      onKeyDown={e => {
                        isValidNumber(e);
                      }}
                    />
                  </Col>
                  <span className="percentage-symbol">%</span>
                </Form.Group>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const getSpotConcentrations = () => {
    return (
      <div className="feature-ratio-div">
        <Form.Group as={Row}>
          <FormLabel label="Spots Selected" />
          <Col md={6}>
            <Popover.Content className="pop-over-custom">
              {spotsSelected.map((element, index) => {
                if (element.selectedFeatures.length < 1) {
                  return (
                    <div key={index}>
                      ({element.selectedRow},{element.selectedCol})
                    </div>
                  );
                }
                return "";
              })}
            </Popover.Content>
          </Col>
        </Form.Group>

        <Form.Group as={Row}>
          <FormLabel label="Concentration" />
          <Col md={2}>
            <FormControl
              type="number"
              name="concentration"
              value={spotConcentration.concentration}
              onChange={handleConcentration}
              onKeyDown={e => {
                isValidNumber(e);
              }}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              as="select"
              name="unitlevel"
              value={spotConcentration.unitlevel}
              onChange={handleConcentration}
              style={{
                marginLeft: "-20px"
              }}
            >
              {unitLevelsSelection()}
            </Form.Control>
          </Col>
        </Form.Group>
      </div>
    );
  };

  const unitLevelsSelection = () => {
    unitLevels.length < 1 && getUnitLevels();

    return (
      <>
        {unitLevels &&
          unitLevels.map((element, index) => {
            return (
              <option key={index} value={element}>
                {element}
              </option>
            );
          })}
      </>
    );
  };

  const handleSpotSelectionChange = e => {
    const id = e.target.value !== "" ? e.target.options[e.target.value].id : "";
    const name = e.target.name;
    const value = e.target.value;

    setSpotMetadataforAddBlockLayout();
    setMetadataId(id);
    setIdChange(true);
    setSpotmetadataUpdated({ id: id, name: name, value: value });
  };

  const getSpotMetadata = () => {
    return (
      <>
        {/* <Form.Group as={Row} controlId={"spotmetadataid"}>
          <FormLabel label={`Spot Metadata`} className="required-asterik" />
          <Col md={5}>
            <Form.Control
              as="select"
              name="spotMetadataSelected"
              value={spotmetadataUpdated.value}
              onChange={handleSpotSelectionChange.bind(this)}
              required
            >
              {props.spotMetadataList.map((element, index) => {
                return (
                  <option key={index} value={element.name} id={element.id} name={element.name}>
                    {element.name}
                  </option>
                );
              })}
            </Form.Control>
          </Col>
        </Form.Group> */}

        {getMetadata()}
      </>
    );
  };

  const getMetadata = () => {
    debugger;
    return (
      <MetaData
        metaID={metadataId}
        isCopy={true}
        type={"SPOT"}
        getMetaData={"getspotmetadata"}
        addMeta={"addspotmetadata"}
        updateMeta={"updatespotmetadata"}
        redirectTo={"spots"}
        metadataType={"Spot"}
        importedInAPage={true}
        importedPageData={spotMetadataforAddBlockLayout}
        setMetadataforImportedPage={setSpotMetadataforAddBlockLayout}
        setImportedPageDataToSubmit={setSpotMetaDataToSubmit}
        handleBack={handleBack}
        handleNext={handleNext}
        idChange={idChange}
      />
    );
  };

  const getReviewPage = () => {
    return (
      <>
        <ReactTable
          data={featuresSelected.featureSelected}
          columns={[
            {
              Header: "Name",
              accessor: "name"
            },
            {
              Header: "Ratio",
              // eslint-disable-next-line react/display-name
              Cell: (row, index) => (
                <>
                  <Col md={6}>
                    {row.original.ratio && row.original.ratio !== "" && row.original.ratio !== 0 ? (
                      <span
                        key={index}
                        style={{
                          marginLeft: "65px"
                        }}
                      >
                        {row.original.ratio}
                        {"%"}
                      </span>
                    ) : (
                      ""
                    )}
                  </Col>
                </>
              )
            },
            {
              Header: "Linker",
              // eslint-disable-next-line react/display-name
              Cell: (row, index) => (
                <input
                  style={{
                    textAlign: "center",
                    border: "none"
                  }}
                  name="linker"
                  key={index}
                  value={row.original.linker && row.original.linker.name ? row.original.linker.name : ""}
                  disabled
                />
              )
            },
            {
              Header: "Sequence",
              Cell: (row, index) =>
                row.original.glycans.map(element => (
                  <StructureImage
                    key={index}
                    base64={element.cartoon}
                    style={{
                      maxWidth: "100px",
                      overflow: "scroll"
                    }}
                  />
                )),
              minWidth: 300
            }
          ]}
          pageSizeOptions={[5, 10, 25]}
          defaultPageSize={5}
          pageSize={featuresSelected.length > 5 ? 5 : featuresSelected.length}
          // loading={loading}
          keyColumn="id"
          showPaginationTop
          sortable={true}
          // filterable={true}
        />
      </>
    );
  };

  const isStepSkipped = step => {
    return featuresSelected.featureSelected && featuresSelected.featureSelected.length === 1
      ? step === 1 && activeStep === 2
      : false;
  };

  return (
    <>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};

          if (isStepSkipped(index)) {
            labelProps.optional = <Typography variant="caption">Not Applicable</Typography>;
            stepProps.completed = false;
          }

          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <div>
        {activeStep !== 3 && getNavigationButtons("button-div line-break-2 text-center")}

        {showErrorSummary === true && (
          <ErrorSummary show={showErrorSummary} form="glycans" errorMessage={pageErrorMessage}></ErrorSummary>
        )}

        <div>
          <Typography className={classes.instructions} component={"span"} variant={"body2"}>
            {getStepContent(activeStep, validate)}
          </Typography>
        </div>

        {activeStep !== 3 && getNavigationButtons("button-div line-break-1 text-center")}
      </div>
    </>
  );

  function getSteps() {
    return ["Select Features", "Add Feature Ratio", "Add Spot Concentrations", "Spot Metadata", "Review and Add"];
  }

  function getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <>
            {/* <div className="spots-selected-featurepage"> */}
            {/* </div> */}
            {/* <div className="glygen-table"> */}
            <Row>
              <Col md={8}>
                <GlygenTable
                  columns={[
                    {
                      Header: "Name",
                      accessor: "name"
                    },
                    {
                      Header: "Feature Id",
                      accessor: "internalId"
                    }
                  ]}
                  defaultPageSize={10}
                  defaultSortColumn="id"
                  showCommentsButton
                  showDeleteButton
                  showEditButton
                  showCheckboxColumn
                  commentsRefColumn="description"
                  fetchWS="featurelist"
                  deleteWS=""
                  editUrl=""
                  keyColumn="id"
                  showRowsInfo
                  infoRowsText="Features"
                  checkboxChangeHandler={handleChecboxChange}
                  defaultCheckboxHandler={checkSelection}
                />
              </Col>
              <Col md={4} style={{ marginTop: "15%" }}>
                <SelectedSpotsBlock currentSpotsSelected={spotsSelected} />
              </Col>
            </Row>
            {/* </div> */}
          </>
        );

      case 1:
        return getSelectedFeatures();

      case 2:
        return getSpotConcentrations();

      case 3:
        return getSpotMetadata();

      case 4:
        return getReviewPage();

      default:
        return "Unknown stepIndex";
    }
  }

  function getNavigationButtons(className) {
    return (
      <div className={className}>
        <Button onClick={handleBack} className="stepper-button">
          Back
        </Button>
        <Button variant="contained" className="stepper-button" onClick={handleNext}>
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    );
  }

  function getUnitLevels() {
    wsCall("unitlevels", "GET", null, true, null, unitLevelsSuccess, unitLevelsFailure);
  }

  function unitLevelsSuccess(response) {
    response.json().then(response => {
      setUnitLevels(response);
    });
  }

  function unitLevelsFailure(response) {
    console.log(response);
    setPageErrorMessage("Error loading Unit of Levels. Please wait or continue while we look into it!");
    setShowErrorSummary(true);
  }
};

AddFeatureToBlock.propTypes = {
  spotsSelected: PropTypes.array,
  setSpotsSelected: PropTypes.func,
  setAddFeatures: PropTypes.func,
  setSpotFeatureCard: PropTypes.func,
  groupCounter: PropTypes.number,
  setGroupCounter: PropTypes.func,
  spotMetadata: PropTypes.object,
  spotMetadataList: PropTypes.array
};

export { AddFeatureToBlock };
