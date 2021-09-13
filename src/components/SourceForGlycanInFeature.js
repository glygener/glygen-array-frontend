import React, { useState, useReducer } from "react";
import PropTypes from "prop-types";
import { Stepper, Step, StepLabel, Typography } from "@material-ui/core";
import { Modal, Button } from "react-bootstrap";
import { AddGlycanInfoToFeature } from "./AddGlycanInfoToFeature";

const SourceForGlycanInFeature = props => {
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

  const handleNext = () => {
    var stepIncrement = 1;

    if (activeStep === 2) {
      var glycansList = props.featureAddState.glycans;

      var selectedRow = glycansList.find(e => e.id === props.currentGlycanSelection.id);
      var selectedRowIndex = glycansList.indexOf(selectedRow);

      let source = {
        type: "NOTRECORDED"
      };
      debugger;

      if (addGlycanInfoToFeature.source === "commercial") {
        source.type = "COMMERCIAL";
        source.vendor = addGlycanInfoToFeature.commercial.vendor;
        source.catalogueNumber = addGlycanInfoToFeature.commercial.catalogueNumber;
        source.batchId = addGlycanInfoToFeature.commercial.batchId;
      } else if (addGlycanInfoToFeature.source === "nonCommercial") {
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
          <AddGlycanInfoToFeature
            addGlycanInfoToFeature={addGlycanInfoToFeature}
            setAddGlycanInfoToFeature={setAddGlycanInfoToFeature}
            step2
          />
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
              props.setShowGlycanPicker(false);
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
              {/* <ErrorSummary show={showErrorSummary} form="feature" errorJson={pageErrorsJson} errorMessage={errorMessage} /> */}
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
                  props.setShowGlycanPicker(false);
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
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
