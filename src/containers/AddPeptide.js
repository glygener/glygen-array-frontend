import React, { useReducer, useState, useEffect } from "react";
import { Button, Step, StepLabel, Stepper, Typography, makeStyles } from "@material-ui/core";
import "../containers/AddGlycan.css";
import { Form, FormCheck, Row, Col } from "react-bootstrap";
import { FormLabel, Feedback, Title } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import displayNames from "../appData/displayNames";
import { validateSequence } from "../utils/sequence";
import { useHistory } from "react-router-dom";
import { Loading } from "../components/Loading";

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

const AddPeptide = props => {
  useEffect(props.authCheckAgent, []);

  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [validate, setValidate] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [showLoading, setShowLoading] = useState(false);
  const [defaultCheck, setDefaultCheck] = useState(true);
  const [validatedSpecificDetails, setValidatedSpecificDetails] = useState(false);
  const [sequenceError, setSequenceError] = useState("");
  const history = useHistory();

  const peptideInitialState = {
    selectedPeptide: "SequenceDefined",
    name: "",
    sequence: ""
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [peptide, setPeptide] = useReducer(reducer, peptideInitialState);

  const steps = getSteps();

  const handleNext = e => {
    var stepIncrement = 1;
    if (activeStep === 0) {
      stepIncrement += 1;
      setValidate(true);
    } else if (activeStep === 1) {
      setValidatedSpecificDetails(true);
      if (peptide.sequence === "") {
        return;
      } else {
        var seqError = validateSequence(displayNames.peptide.TYPE, peptide.sequence);
        setSequenceError(seqError);
        if (seqError !== "") {
          return;
        }
      }
    }

    if (e.currentTarget.innerText === "FINISH") {
      addPeptide(e);
      return;
    }
    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    setPeptide({ [name]: newValue });
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    setShowErrorSummary(false);
  };

  const handleSelect = e => {
    debugger;
    const newValue = e.target.value;
    if (newValue !== "SequenceDefined") {
      setDefaultCheck(false);
    } else {
      setDefaultCheck(true);
    }

    setPeptide({ ...peptideInitialState, ...{ selectedPeptide: newValue } });
  };

  function getSteps() {
    return ["Select the Peptide Type", "Add Peptide Information", "Review and Add"];
  }

  function getStepContent(stepIndex, validate) {
    switch (stepIndex) {
      case 0:
        return (
          <Form className="radioform">
            <FormCheck className="line-break-1">
              <FormCheck.Label>
                <FormCheck.Input
                  type="radio"
                  value="SequenceDefined"
                  onChange={handleSelect}
                  checked={peptide.selectedPeptide === "SequenceDefined"}
                />
                {displayNames.peptide.SEQUENCE}
              </FormCheck.Label>
            </FormCheck>

            <FormCheck>
              <FormCheck.Label>
                <FormCheck.Input
                  type="radio"
                  value="Unknown"
                  onChange={handleSelect}
                  checked={peptide.selectedPeptide === "Unknown"}
                />
                {displayNames.peptide.UNKNOWN}
              </FormCheck.Label>
            </FormCheck>
          </Form>
        );
      case 1:
        if (activeStep === 1 && peptide.selectedGlycan !== "Unknown") {
          return (
            <>
              <Form.Group as={Row} controlId="sequence">
                <FormLabel label="Sequence" className="required-asterik" />
                <Col md={6}>
                  <Form.Control
                    as="textarea"
                    rows="15"
                    name="sequence"
                    placeholder="Sequence"
                    value={peptide.sequence}
                    onChange={handleChange}
                    className="sequence-text-area"
                    isInvalid={validatedSpecificDetails && (peptide.sequence === "" || sequenceError !== "")}
                    spellCheck="false"
                    maxLength={10000}
                  />
                  {peptide.sequence === "" && <Feedback message="Sequence is required" />}
                  {sequenceError !== "" && <Feedback message={sequenceError} />}
                </Col>
              </Form.Group>
            </>
          );
        }

      case 2:
        return <></>;

      default:
        return "Unknown stepIndex";
    }
  }

  function getNavigationButtons(className) {
    return (
      <div className={className}>
        <Button disabled={activeStep === 0} onClick={handleBack} className="stepper-button">
          Back
        </Button>
        <Button variant="contained" className="stepper-button" onClick={handleNext}>
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    );
  }

  function addPeptide(e) {
    var peptideType = "SEQUENCE_DEFINED";

    if (peptide.selectedGlycan === "Unknown") {
      peptideType = "UNKNOWN";
    }

    wsCall(
      "addpeptide",
      "POST",
      null,
      true,
      {
        type: peptideType
      },
      response => history.push("/peptides"),
      addPeptideFailure
    );
    e.preventDefault();
  }

  function addPeptideFailure(response) {
    response.json().then(parsedJson => {
      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
    });
  }

  return (
    <>
      <Helmet>
        <title>{head.addGlycan.title}</title>
        {getMeta(head.addGlycan)}
      </Helmet>

      <div className="page-container">
        <Title title="Add Glycan to Repository" />
        <Stepper activeStep={activeStep}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getNavigationButtons("button - div text-center")}
        &nbsp; &nbsp;
        {showErrorSummary === true && (
          <ErrorSummary show={showErrorSummary} form="peptides" errorJson={pageErrorsJson}></ErrorSummary>
        )}
        <div>
          <div>
            <Typography className={classes.instructions} component={"span"} variant={"body2"}>
              {getStepContent(activeStep, validate)}
            </Typography>
            {getNavigationButtons("button-div line-break-1 text-center")}
          </div>
        </div>
      </div>
      <Loading show={showLoading} />
    </>
  );
};

AddPeptide.propTypes = {};

export { AddPeptide };
