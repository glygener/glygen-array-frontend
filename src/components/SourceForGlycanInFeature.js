import React, { useState, useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import { Stepper, Step, StepLabel, Typography } from "@material-ui/core";
import { Modal, Button } from "react-bootstrap";
import { AddGlycanInfoToFeature } from "./AddGlycanInfoToFeature";
import { ErrorSummary } from "./ErrorSummary";

const SourceForGlycanInFeature = props => {
  useEffect(() => {
    if (props.currentGlycanSelection && props.currentGlycanSelection.id) {
      setPageErrorsJson({});
      setErrorMessage("");
      setShowErrorSummary(false);
    }
  }, [props.currentGlycanSelection]);

  const AddGlycanInfoToFeatureIntiState = {
    commercial: { vendor: "", catalogueNumber: "", batchId: "" },
    nonCommercial: { providerLab: "", batchId: "", method: "", sourceComment: "" },
    validatedCommNonComm: false,
    source: "notSpecified",
    urls: [],
    papers: [],
    opensRing: 1,
    equilibriumComment: ""
  };

  const reducer = (state, newState) => ({ ...state, ...newState });

  const [addGlycanInfoToFeature, setAddGlycanInfoToFeature] = useReducer(reducer, AddGlycanInfoToFeatureIntiState);

  const steps = ["Select Glycans", "Add Reducing End Information", "Add Source"];
  const [activeStep, setActiveStep] = useState(0);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleNext = () => {
    var stepIncrement = 1;

    if (activeStep === 0) {
      if (!props.currentGlycanSelection) {
        setPageErrorsJson({});
        setErrorMessage("Glycan Selection is required");
        setShowErrorSummary(true);
        return;
      } else {
        setPageErrorsJson({});
        setErrorMessage("");
        setShowErrorSummary(false);
      }
    }

    if (activeStep === 2) {
      var glycansList = props.featureAddState.glycans;

      var selectedRow = glycansList.find(e => e.id === props.currentGlycanSelection.id && !e.source);
      var selectedRowIndex = glycansList.indexOf(selectedRow);

      let source = {
        type: "NOTRECORDED"
      };

      if (addGlycanInfoToFeature.source === "commercial") {
        if (addGlycanInfoToFeature.commercial.vendor === "") {
          setAddGlycanInfoToFeature({ validatedCommNonComm: true });
          return;
        }

        source.type = "COMMERCIAL";
        source.vendor = addGlycanInfoToFeature.commercial.vendor;
        source.catalogueNumber = addGlycanInfoToFeature.commercial.catalogueNumber;
        source.batchId = addGlycanInfoToFeature.commercial.batchId;
      } else if (addGlycanInfoToFeature.source === "nonCommercial") {
        if (addGlycanInfoToFeature.nonCommercial.providerLab === "") {
          setAddGlycanInfoToFeature({ validatedCommNonComm: true });
          return;
        }

        source.type = "NONCOMMERCIAL";
        source.batchId = addGlycanInfoToFeature.commercial.batchId;
        source.providerLab = addGlycanInfoToFeature.nonCommercial.providerLab;
        source.method = addGlycanInfoToFeature.nonCommercial.method;
        source.comment = addGlycanInfoToFeature.nonCommercial.sourceComment;
      }

      selectedRow.source = source;
      selectedRow.urls = addGlycanInfoToFeature.urls;
      selectedRow.papers = addGlycanInfoToFeature.papers;
      selectedRow.opensRing = addGlycanInfoToFeature.opensRing;

      if (addGlycanInfoToFeature.opensRing === 0) {
        selectedRow.equilibriumComment = addGlycanInfoToFeature.equilibriumComment;
      }

      glycansList[selectedRowIndex] = selectedRow;

      props.setFeatureAddState({
        glycans: glycansList
      });

      props.setShowGlycanPicker(false);
      props.setCurrentGlycanSelection();
    }

    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const handleBack = () => {
    var stepDecrement = 1;

    setActiveStep(prevActiveStep => prevActiveStep - stepDecrement);
  };

  function getStepContent(activeStep) {
    switch (activeStep) {
      case 0:
        return <>{props.getGlycanTabletoSelect(true)}</>;

      case 1:
        return (
          <>
            {props.currentGlycanSelection && <>{props.displaySelectedGlycanInfoInFeature()}</>}
            <AddGlycanInfoToFeature
              addGlycanInfoToFeature={addGlycanInfoToFeature}
              setAddGlycanInfoToFeature={setAddGlycanInfoToFeature}
              step2
            />
          </>
        );
      case 2:
        return (
          <AddGlycanInfoToFeature
            addGlycanInfoToFeature={addGlycanInfoToFeature}
            setAddGlycanInfoToFeature={setAddGlycanInfoToFeature}
          />
        );

      default:
        return "Invalid step";
    }
  }

  function closeModal() {
    if (props.currentGlycanSelection) {
      var glycansList = props.featureAddState.glycans;
      var selectedRow = glycansList.filter(e => e.id === props.currentGlycanSelection.id);

      if (selectedRow.length > 1) {
        selectedRow = selectedRow[selectedRow.length - 1];
      } else {
        selectedRow = selectedRow[0];
      }
      var selectedRowIndex = glycansList.indexOf(selectedRow);
      glycansList.splice(selectedRowIndex, 1);
      props.setFeatureAddState({ glycans: glycansList });
      props.setCurrentGlycanSelection();
    }
    props.setShowGlycanPicker(false);
  }

  return (
    <>
      {props.showGlycanPicker && (
        <>
          <Modal
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={props.showGlycanPicker}
            onHide={() => {
              closeModal();
            }}
            dialogClassName="my-modal"
          >
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
              <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                  const stepProps = {};
                  const labelProps = {};

                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
              <div className="button-div text-center">
                <Button disabled={activeStep === 0} variant="contained" onClick={handleBack} className="stepper-button">
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext} className="stepper-button">
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
              &nbsp;&nbsp;
              <ErrorSummary
                show={showErrorSummary}
                form="feature"
                errorJson={pageErrorsJson}
                errorMessage={errorMessage}
              />
              <Typography component={"span"} variant={"body2"}>
                {getStepContent(activeStep)}
              </Typography>
              <div className="button-div text-center">
                <Button disabled={activeStep === 0} variant="contained" onClick={handleBack} className="stepper-button">
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext} className="stepper-button">
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                onClick={() => {
                  closeModal();
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}

      {props.isMetadata && (
        <>
          <AddGlycanInfoToFeature
            addGlycanInfoToFeature={addGlycanInfoToFeature}
            setAddGlycanInfoToFeature={setAddGlycanInfoToFeature}
            metadata={props.metadata}
            setMetadata={props.setMetadata}
            isMetadata={props.isMetadata}
          />
        </>
      )}
    </>
  );
};

SourceForGlycanInFeature.propTypes = {
  showGlycanPicker: PropTypes.bool,
  setShowGlycanPicker: PropTypes.func,
  getGlycanTabletoSelect: PropTypes.func,
  glycoProteinPepTideListStep4: PropTypes.array,
  setGlycoProteinPepTideListStep4: PropTypes.func
};

export { SourceForGlycanInFeature };
