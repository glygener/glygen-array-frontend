/* eslint-disable no-useless-escape */
import React, { useState, useReducer } from "react";
import "../containers/AddGlycan.css";
import PropTypes from "prop-types";
import { GlygenTable } from "../components/GlygenTable";
import { Row, Col, Form, FormControl, Table } from "react-bootstrap";
import { FormLabel, BlueCheckbox } from "../components/FormControls";
import "../components/AddFeatureToBlock.css";
import { SelectedSpotsBlock } from "./SpotInformation";
import ReactTable from "react-table";
import { StructureImage } from "../components/StructureImage";
import { ErrorSummary } from "./ErrorSummary";
import { wsCall } from "../utils/wsUtils";
import { Popover } from "react-bootstrap";
import { MetaData } from "../containers/MetaData";
import { Button, makeStyles, Step, StepLabel, Stepper, Typography, FormControlLabel } from "@material-ui/core";
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
  // var [rowSelected, setRowSelected] = useState([]);
  const [spotMetadataforAddBlockLayout, setSpotMetadataforAddBlockLayout] = useState([]);
  const [spotMetaDataToSubmit, setSpotMetaDataToSubmit] = useState();
  const [spotmetadataUpdated, setSpotmetadataUpdated] = useState(props.spotMetadata);
  const [metadataId, setMetadataId] = useState(props.spotMetadata.id);
  const [importSpotchange, setImportSpotchange] = useState(false);

  const featuresToBlock = {
    featureSelected: [
      {
        feature: "",
        concentrationInfo: {
          concentration: "",
          unitlevel: "FMOL",
          notReported: false,
          ratio: ""
        }
      }
    ]
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [featuresSelected, setFeaturesSelected] = useReducer(reducer, featuresToBlock);

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
      let ratiosNonEmpty = featuresSelected.featureSelected.filter(
        e => e.concentrationInfo && e.concentrationInfo.ratio && e.concentrationInfo.ratio !== ""
      );

      let ratiosEmpty = featuresSelected.featureSelected.filter(
        e =>
          (e.concentrationInfo && e.concentrationInfo.ratio === "") ||
          !e.concentrationInfo ||
          (e => e.concentrationInfo && !e.concentrationInfo.ratio)
      );

      if (
        (ratiosNonEmpty.length > 0 && featuresSelected.featureSelected.length !== ratiosNonEmpty.length) ||
        (ratiosEmpty.length > 0 && ratiosEmpty.length !== featuresSelected.featureSelected.length)
      ) {
        setShowErrorSummary(true);
        setPageErrorMessage("Enter ratios Either for all features or none.");
        return;
      }

      setShowErrorSummary(false);
    } else if (activeStep === 0 && featuresSelected.featureSelected.length === 1) {
      stepIncrement += 1;
    }

    if (activeStep === 2) {
      let con = featuresSelected.featureSelected.filter(
        e =>
          // (
          e.concentrationInfo && (e.concentrationInfo.concentration !== "" || e.concentrationInfo.notReported)
        //) || !e.concentrationInfo.concentration
      );

      if (con.length !== featuresSelected.featureSelected.length) {
        setPageErrorMessage("Enter Concentration values for all features.");
        setShowErrorSummary(true);
        return;
      }
    }

    if (e.currentTarget.innerText === "SUBMIT") {
      //increment group counter
      ++groupCounter;

      spotsSelected.forEach(spot => {
        if (spot.selectedFeatures.length < 1) {
          featuresSelected.featureSelected.forEach((element, index) => {
            spot.selectedFeatures.push({
              feature: element.feature,
              ratio: element.concentrationInfo && element.concentrationInfo.ratio,
              concentrationInfo: element.concentrationInfo
            });
          });
          // spot.selectedConcentration = feature.concentrationInfo;
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
    let concentrationInfo = {
      concentration: "",
      unitlevel: "FMOL",
      notReported: false,
      ratio: ""
    };

    let rowUpdated = [...featuresSelected.featureSelected];

    if (rowUpdated[id].concentrationInfo) {
      concentrationInfo = { ...rowUpdated[id].concentrationInfo };
    }

    if (value === "") {
      concentrationInfo.ratio = value;
    } else {
      concentrationInfo.ratio = Number(value);
    }

    rowUpdated[id].concentrationInfo = concentrationInfo;

    setFeaturesSelected(rowUpdated);
    setShowErrorSummary(false);
  };

  const handleConcentration = e => {
    const value = e.currentTarget.value;
    const name = e.currentTarget.name;
    const id = e.currentTarget.id;
    let concentrationInfo = {};

    if (featuresSelected.featureSelected[id] && featuresSelected.featureSelected[id].concentrationInfo) {
      concentrationInfo = { ...featuresSelected.featureSelected[id].concentrationInfo };
    }

    let rowUpdated = [...featuresSelected.featureSelected];

    if (name === "notReported") {
      let flag = e.target.checked;

      if (flag) {
        concentrationInfo.concentration = "";
        concentrationInfo.unitlevel = "FMOL";
        // "fmol/spot";
      }
      concentrationInfo.notReported = flag;
    } else if (name === "unitlevel") {
      concentrationInfo.unitlevel = value;
    } else {
      concentrationInfo.concentration = value;
    }

    rowUpdated[id].concentrationInfo = concentrationInfo;
    setFeaturesSelected(rowUpdated);
    setShowErrorSummary(false);
  };

  const handleChecboxChange = row => {
    let featureObj = {};
    let selectedRows = [...featuresSelected.featureSelected];
    let deselectedRow = selectedRows.find(e => e.feature.id === row.id);

    if (deselectedRow) {
      var deselectedRowIndex = selectedRows.indexOf(deselectedRow);
      selectedRows.splice(deselectedRowIndex, 1);
    } else {
      if (
        selectedRows.length === 1 &&
        (!selectedRows[0].feature || (selectedRows[0].feature && !selectedRows[0].feature.id))
      ) {
        selectedRows[0].feature = row;
      } else {
        featureObj.feature = row;
        selectedRows.push(featureObj);
      }
      // selectedRows[selectedRows.length - 1].feature = row;
      setShowErrorSummary(false);
    }

    setFeaturesSelected({ featureSelected: selectedRows });
  };

  const checkSelection = row => {
    let rowSelected = [];

    if (featuresSelected && featuresSelected.featureSelected.length > 0) {
      rowSelected = [...featuresSelected.featureSelected];
    }

    return rowSelected.find(e => e.feature.id === row.id);
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

  const getSelectedFeatures = () => {
    return (
      <>
        <div className="pt-3">
          {featuresSelected.featureSelected.map((element, index) => {
            return (
              <div key={index}>
                <Form.Group as={Row} controlId={index} className="gg-align-center mb-3">
                  <Col md={2} style={{ textAlign: "right" }}>
                    <FormLabel label={element.feature.name} className="mt-2" />
                  </Col>
                  <Col md={2} style={{ textAlign: "left" }}>
                    <FormControl
                      name="featureRatio"
                      onChange={handleChange}
                      placeholder="e.g., 10 or 0.1"
                      value={element.concentrationInfo && element.concentrationInfo.ratio}
                      // pattern={"^d*(.d{0,2})?$"}
                      type="number"
                    />
                  </Col>
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
      <div style={{ padding: "25px" }}>
        <Form.Group as={Row}>
          <Col md={9}>{getConcentrationTable()}</Col>
          <Col md={3}>
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
          </Col>
        </Form.Group>
      </div>
    );
  };

  const getConcentrationTable = () => {
    return (
      <>
        <Table bordered size="lg" className="panel-width">
          <thead className="">
            <tr>
              <th>Feature Selected</th>
              <th>Concentration</th>
              <th>Unit Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {featuresSelected.featureSelected.map((element, index) => {
              return (
                <tr className="table-row" key={index}>
                  <td>
                    <FormLabel label={element.feature.name} className={"required-asterik"} />
                  </td>
                  <td>
                    <Form.Group controlId={index}>
                      <FormControl
                        type="number"
                        name="concentration"
                        placeholder="e.g., 100 fmol/spot"
                        value={element.concentrationInfo ? element.concentrationInfo.concentration : ""}
                        onChange={handleConcentration}
                        onKeyDown={e => {
                          isValidNumber(e);
                        }}
                        disabled={element.concentrationInfo && element.concentrationInfo.notReported}
                      />
                    </Form.Group>
                  </td>
                  <td>
                    <Form.Group controlId={index}>
                      <Form.Control
                        as="select"
                        name="unitlevel"
                        value={element.concentrationInfo ? element.concentrationInfo.unitlevel : ""}
                        onChange={handleConcentration}
                        disabled={element.concentrationInfo && element.concentrationInfo.notReported}
                      >
                        {unitLevelsSelection()}
                      </Form.Control>
                    </Form.Group>
                  </td>
                  <td>
                    <FormControlLabel
                      control={
                        <BlueCheckbox
                          id={index.toString()}
                          // id={index}
                          name="notReported"
                          checked={element.concentrationInfo ? element.concentrationInfo.notReported : false}
                          onChange={handleConcentration}
                          size="medium"
                          // defaultChecked={element.concentrationInfo && element.concentrationInfo.notReported}
                        />
                      }
                      label={"Not reported"}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </>
    );
  };

  const unitLevelsSelection = () => {
    unitLevels.length < 1 && getUnitLevels();

    return (
      <>
        {unitLevels &&
          unitLevels.map((unit, index) => {
            return (
              <option key={index} value={unit.name}>
                {unit.label}
              </option>
            );
          })}
      </>
    );
  };

  const getSpotMetadata = () => {
    return (
      <>
        <Form.Group as={Row} controlId="spotmetadataid" className="gg-align-center mt-2 mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={`Spot Metadata`} className="required-asterik" />

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
        </Form.Group>

        {getMetadata()}
      </>
    );
  };

  const handleSpotSelectionChange = e => {
    const id = e.target.value !== "" ? e.target.options[e.target.value].id : "";
    const name = e.target.name;
    const value = e.target.value;

    setSpotMetadataforAddBlockLayout([]);
    setMetadataId(id);
    setImportSpotchange(true);
    setSpotmetadataUpdated({ id: id, name: name, value: value });
  };

  const getMetadata = () => {
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
        importSpotchange={importSpotchange}
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
              accessor: "feature.name"
            },
            {
              Header: "Ratio",
              // eslint-disable-next-line react/display-name
              Cell: (row, index) => (
                <>
                  <Col md={6}>
                    {row.original &&
                    row.original.concentrationInfo &&
                    row.original.concentrationInfo.ratio &&
                    row.original.concentrationInfo.ratio &&
                    row.original.concentrationInfo.ratio !== "" &&
                    row.original.concentrationInfo.ratio !== 0 ? (
                      <span
                        key={index}
                        style={{
                          marginLeft: "65px"
                        }}
                      >
                        {row.original.concentrationInfo.ratio}
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
                  value={
                    row.original && row.original.feature && row.original.feature.linker
                      ? row.original.feature.linker.name
                      : ""
                  }
                  disabled
                />
              )
            },
            {
              Header: "Sequence",
              Cell: (row, index) => {
                return row.original && row.original.feature.glycans
                  ? row.original.feature.glycans.map(element => (
                      <StructureImage
                        key={index}
                        base64={element.glycan ? element.glycan.cartoon : element.cartoon}
                        style={{
                          maxWidth: "100px",
                          overflow: "scroll"
                        }}
                      />
                    ))
                  : "";
              },
              minWidth: 250
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
      <Stepper activeStep={activeStep} alternativeLabel className="steper-responsive text-center">
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
        {activeStep !== 3 && getNavigationButtons()}
        <h5 className={`text-center`} style={{ whiteSpace: activeStep === 1 ? "pre" : "" }}>
          {getStepLabel(activeStep)}
        </h5>

        {showErrorSummary === true && (
          <ErrorSummary show={showErrorSummary} form="glycans" errorMessage={pageErrorMessage}></ErrorSummary>
        )}

        {getStepContent(activeStep, validate)}

        {activeStep !== 3 && getNavigationButtons("button-div line-break-1 text-center")}
      </div>
    </>
  );

  function getSteps() {
    return ["Select Features", "Add Feature Ratio", "Add Spot Concentrations", "Spot Metadata", "Review and Add"];
  }

  function getStepLabel(stepIndex) {
    let label = "";
    let subLabel = "";

    switch (stepIndex) {
      case 0:
        label = "Select Features";
        break;

      case 1:
        label = "Specify Ratio\n";
        subLabel = (
          <h6 className={'summary-panel pt-1"'}>
            {"Ratio can be specified in the format 1:10:0.1\n"}
            {"For unknown ratio leave fields empty"}
          </h6>
        );
        break;

      case 2:
        label = "Specify Concentration";
        break;

      case 3:
        break;
      case 4:
        label = "Review and Add";
        break;

      default:
        label = "Unknown stepIndex";
    }

    return (
      <>
        <p className={label === "" ? "" : "gg-blue mt-4"}> {label}</p>
        {subLabel}
      </>
    );
  }

  function getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <>
            <Row className="gg-align-center pt-4 pb-2 ">
              <SelectedSpotsBlock currentSpotsSelected={spotsSelected} />
            </Row>

            <GlygenTable
              columns={[
                {
                  Header: "Name",
                  accessor: "name"
                },
                {
                  Header: "Feature ID",
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
      <div className="text-center mb-2">
        <Button onClick={handleBack} className="gg-btn-blue mt-2 gg-ml-20 gg-mr-20">
          Back
        </Button>
        <Button className="gg-btn-blue mt-2 gg-ml-20" onClick={handleNext}>
          {activeStep === steps.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    );
  }

  function getUnitLevels() {
    wsCall("unitlevels", "GET", null, true, null, unitLevelsSuccess, unitLevelsFailure);
  }

  function unitLevelsSuccess(response) {
    response.json().then(respJson => {
      setUnitLevels(respJson);
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
