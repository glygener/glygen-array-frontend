import React, { useReducer, useState } from "react";
import { Button, makeStyles, Step, StepLabel, Stepper, Typography } from "@material-ui/core";
import "../containers/AddGlycan.css";
import { Form, FormCheck, Row, Col } from "react-bootstrap";
import { FormLabel, Feedback, Title } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import displayNames from "../appData/displayNames";
import { useHistory } from "react-router-dom";

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

const AddGlycan = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [validate, setValidate] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [registrationCheckFlag, setRegistrationCheckFlag] = useState(true);
  const [disableReset, setDisableReset] = useState(false);
  const [invalidMass, setInvalidMass] = useState(false);
  const history = useHistory();

  const initialState = {
    selectedGlycan: "SequenceDefined",
    internalId: "",
    name: "",
    comment: "",
    mass: "",
    glytoucanId: "",
    sequence: "",
    glytoucanRegistration: true,
    sequenceType: "GlycoCT"
  };

  const reducer = (state, newState) => ({ ...state, ...newState });

  const [userSelection, setUserSelection] = useReducer(reducer, initialState);

  const [defaultCheck, setDefaultCheck] = useState(true);

  const steps = getSteps();

  const handleNext = e => {
    setValidate(false);

    if (
      userSelection.selectedGlycan === "Unknown" &&
      (userSelection.name === " " || userSelection.name.trim().length < 1) &&
      activeStep === 1
    ) {
      setValidate(true);
      return;
    } else if (
      userSelection.selectedGlycan === "MassDefined" &&
      (userSelection.mass === " " || userSelection.mass.trim().length < 1) &&
      activeStep === 1
    ) {
      setValidate(true);
      return;
    } else if (
      userSelection.selectedGlycan === "SequenceDefined" &&
      (userSelection.sequence === " " || userSelection.sequence.trim().length < 1) &&
      activeStep === 1
    ) {
      setValidate(true);
      return;
    }

    if (e.currentTarget.innerText === "FINISH") {
      addGlycan(e);
      return;
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    setShowErrorSummary(false);
  };

  const handleSelect = e => {
    const newValue = e.target.value;
    if (newValue !== "SequenceDefined") {
      setDefaultCheck(false);
    } else {
      setDefaultCheck(true);
    }
    setUserSelection({ ...initialState, ...{ selectedGlycan: newValue } });
  };

  const handleChange = e => {
    setDisableReset(true);

    const name = e.target.name;
    const newValue = e.target.value;
    if (name === "name" && newValue.trim().length < 1 && userSelection.selectedGlycan === "Unknown") {
      setValidate(true);
    } else {
      setValidate(false);
    }

    if (name === "glytoucanCheck") {
      userSelection.glytoucanRegistration = false;
    } else if (name === "mass" && newValue < 1) {
      setInvalidMass(true);
    } else {
      name === "mass" && newValue === "" && setInvalidMass(false);
      setUserSelection({ [name]: newValue });
    }
  };

  const handleClassSelect = e => {
    const select = e.target.options[e.target.selectedIndex].value;
    setUserSelection({ sequenceType: select });
  };

  const clearGlytoucanSequence = () => {
    setUserSelection({ ...initialState, ...{ selectedGlycan: userSelection.selectedGlycan } });
    setDisableReset(false);
  };

  const getUnknownGlycanStep = () => {
    return (
      <Form className="radioform1">
        <Form.Group as={Row} controlId="name">
          <FormLabel label="Name" className={userSelection.selectedGlycan === "Unknown" ? "required-asterik" : ""} />
          <Col md={4}>
            <Form.Control
              type="text"
              name="name"
              placeholder="Name"
              value={userSelection.name}
              onChange={handleChange}
              required={true}
              isInvalid={validate}
              maxLength={50}
            />
            <Feedback message="Please Enter Glycan Name." />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="internalID">
          <FormLabel label="Internal Id" />
          <Col md={4}>
            <Form.Control
              type="text"
              name="internalId"
              placeholder="Internal Id"
              value={userSelection.internalId}
              onChange={handleChange}
              maxLength={30}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="comments">
          <FormLabel label="Comments" />
          <Col md={4}>
            <Form.Control
              as="textarea"
              rows={4}
              name="comment"
              placeholder="Comments"
              value={userSelection.comment}
              onChange={handleChange}
              maxLength={2000}
            />
            <span className="character-counter">
              {userSelection.comment && userSelection.comment.length > 0 ? userSelection.comment.length : ""}
              /2000
            </span>
          </Col>
        </Form.Group>
      </Form>
    );
  };

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
        {getNavigationButtons("button - div")}
        &nbsp; &nbsp;
        {showErrorSummary === true && (
          <ErrorSummary show={showErrorSummary} form="glycans" errorJson={pageErrorsJson}></ErrorSummary>
        )}
        <div>
          <div>
            <Typography className={classes.instructions} component={"span"} variant={"body2"}>
              {getStepContent(activeStep, validate)}
            </Typography>
            {getNavigationButtons("button-div line-break-1")}
          </div>
        </div>
      </div>
    </>
  );

  function getSteps() {
    return ["Select the Glycan Type", "Add Glycan Information", "Review and Add"];
  }

  function getStepContent(stepIndex, validate) {
    switch (stepIndex) {
      case 0:
        return (
          <Form className="radioform">
            <FormCheck className="line-break-1">
              <FormCheck.Label>
                <FormCheck.Input type="radio" value="SequenceDefined" onChange={handleSelect} checked={defaultCheck} />
                {displayNames.glycan.SEQUENCE_DEFINED}
              </FormCheck.Label>
            </FormCheck>

            <FormCheck>
              <FormCheck.Label className="disableradio">
                <FormCheck.Input type="radio" value="CompositionBased" disabled />
                {displayNames.glycan.COMPOSITION_BASED}
              </FormCheck.Label>
            </FormCheck>

            <FormCheck className="line-break-1">
              <FormCheck.Label>
                <FormCheck.Input
                  type="radio"
                  value="MassDefined"
                  onChange={handleSelect}
                  checked={userSelection.selectedGlycan === "MassDefined"}
                />
                {displayNames.glycan.MASS_ONLY}
              </FormCheck.Label>
            </FormCheck>

            <FormCheck>
              <FormCheck.Label className="disableradio">
                <FormCheck.Input type="radio" value="ClassificationBased" disabled label="Classification Based" />
                {displayNames.glycan.CLASSIFICATION_BASED}
              </FormCheck.Label>
            </FormCheck>

            <FormCheck className="line-break-1">
              <FormCheck.Label className="disableradio">
                <FormCheck.Input type="radio" value="FragmentOnly" disabled />
                {displayNames.glycan.FRAGMENT_ONLY}
              </FormCheck.Label>
            </FormCheck>

            <FormCheck>
              <FormCheck.Label>
                <FormCheck.Input
                  type="radio"
                  value="Unknown"
                  onChange={handleSelect}
                  checked={userSelection.selectedGlycan === "Unknown"}
                />
                {displayNames.glycan.UNKNOWN}
              </FormCheck.Label>
            </FormCheck>
          </Form>
        );
      case 1:
        if (activeStep === 1 && userSelection.selectedGlycan !== "Unknown") {
          return (
            <>
              <Form className="radioform1">
                <Form.Group as={Row} controlId="name">
                  <FormLabel
                    label="Name"
                    className={userSelection.selectedGlycan === "Unknown" ? "required-asterik" : ""}
                  />
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={userSelection.name}
                      onChange={handleChange}
                      required={userSelection.selectedGlycan === "Unknown"}
                      maxLength={50}
                    />
                    <Feedback message="Please enter current password." />
                  </Col>
                </Form.Group>

                <Form.Group
                  as={Row}
                  controlId="glytoucanId"
                  className={userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"}
                >
                  <FormLabel label="Glytoucan Id" />
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="glytoucanId"
                      placeholder="Glytoucan Id"
                      value={userSelection.glytoucanId}
                      onChange={handleChange}
                      onFocus={() => setShowErrorSummary(false)}
                      minLength={8}
                    />
                  </Col>
                  {userSelection.glytoucanId !== "" && (
                    <Button
                      variant="contained"
                      onClick={() => getSequenceFromGlytoucan(userSelection.glytoucanId)}
                      className="get-btn"
                    >
                      Get Sequence from Glytoucan
                    </Button>
                  )}
                </Form.Group>

                <Form.Group
                  as={Row}
                  controlId="sequence"
                  className={userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"}
                >
                  <FormLabel label="Sequence" className="required-asterik" />
                  <Col md={4}>
                    <Form.Control
                      as="textarea"
                      rows="15"
                      name="sequence"
                      placeholder="Sequence"
                      value={userSelection.sequence}
                      onChange={handleChange}
                      required={true}
                      isInvalid={validate}
                    />
                    <Feedback message="Please Enter Valid Sequence" />
                  </Col>
                </Form.Group>

                <Form.Group
                  as={Row}
                  controlId="sequenceType"
                  className={userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"}
                >
                  <FormLabel label="Sequence Type" className="required-asterik" />
                  <Col md={4}>
                    <Form.Control
                      as="select"
                      name="sequenceType"
                      placeholder="sequenceType"
                      value={userSelection.sequenceType}
                      onChange={handleClassSelect}
                      required={true}
                    >
                      <option value="GlycoCT">GlycoCT</option>
                      <option value="GlycoWorkbench">GlycoWorkbench</option>
                      <option value="Wurcs">Wurcs</option>
                      <option value="IUPAC">IUPAC</option>
                    </Form.Control>
                    <Feedback message="Sequence Type is required"></Feedback>
                  </Col>
                </Form.Group>

                <Form.Group
                  as={Row}
                  controlId="mass"
                  className={userSelection.selectedGlycan === "MassDefined" ? "" : "hide-content"}
                >
                  <FormLabel label="Mass" className="required-asterik" />
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      name="mass"
                      placeholder="Mass"
                      value={userSelection.mass}
                      onChange={handleChange}
                      isInvalid={invalidMass}
                    />
                    <Feedback message={invalidMass ? "Mass should be greater than 0" : "Please Enter Mass"} />
                  </Col>
                </Form.Group>

                <Form.Group
                  controlId="formBasicCheckbox"
                  className={
                    userSelection.selectedGlycan === "SequenceDefined"
                      ? getGlytoucanRegistration()
                        ? "hide-content"
                        : ""
                      : "hide-content"
                  }
                >
                  <Col md={{ span: 6, offset: 5 }}>
                    <Form.Check
                      name="glytoucanCheck"
                      type="checkbox"
                      label="Register for Glytoucan"
                      defaultChecked
                      onChange={handleChange}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="internalID">
                  <FormLabel label="Internal Id" />
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="internalId"
                      placeholder="InternalId"
                      value={userSelection.internalId}
                      onChange={handleChange}
                      maxLength={30}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="comments">
                  <FormLabel label="Comments" />
                  <Col md={4}>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="comment"
                      placeholder="Comments"
                      value={userSelection.comment}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <span className="character-counter">
                      {userSelection.comment && userSelection.comment.length > 0 ? userSelection.comment.length : ""}
                      /2000
                    </span>
                  </Col>
                </Form.Group>

                <Form.Group as={Row}>
                  <Col md={{ span: 2, offset: 5 }}>
                    <Button
                      variant="contained"
                      disabled={!disableReset}
                      onClick={clearGlytoucanSequence}
                      className="stepper-button"
                    >
                      Reset
                    </Button>
                  </Col>
                </Form.Group>
              </Form>
            </>
          );
        } else {
          return (
            <>
              {getUnknownGlycanStep()}

              <Form.Group as={Row}>
                <Col md={{ span: 1, offset: 5 }}>
                  <Button
                    variant="contained"
                    disabled={!disableReset}
                    onClick={clearGlytoucanSequence}
                    className="stepper-button"
                  >
                    Reset
                  </Button>
                </Col>
              </Form.Group>
            </>
          );
        }

      case 2:
        return (
          <>
            <Form className="radioform3">
              <Form.Group as={Row} controlId="name">
                <FormLabel label="Name" />
                <Col>
                  <Form.Control type="text" name="name" value={userSelection.name} disabled />
                </Col>
              </Form.Group>

              <Form.Group as={Row} controlId="glycanSelected">
                <FormLabel label="Glycan Type" />
                <Col>
                  <Form.Control type="text" name="glycanType" value={userSelection.selectedGlycan} disabled />
                </Col>
              </Form.Group>

              <Form.Group
                as={Row}
                controlId="mass"
                className={userSelection.selectedGlycan === "MassDefined" ? "" : "hide-content"}
              >
                <FormLabel label="Mass" />
                <Col>
                  <Form.Control type="text" name="mass" value={userSelection.mass} disabled />
                </Col>
              </Form.Group>

              <Form.Group
                as={Row}
                controlId="glytoucanId"
                className={userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"}
              >
                <FormLabel label={displayNames.glycan.GLYTOUCAN_ID} />
                <Col>
                  <Form.Control type="text" name="glytoucanId" value={userSelection.glytoucanId} disabled />
                </Col>
              </Form.Group>

              <Form.Group
                as={Row}
                controlId="sequence"
                className={userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"}
              >
                <FormLabel label={displayNames.glycan.SEQUENCE} />
                <Col>
                  <Form.Control as="textarea" rows="15" name="sequence" value={userSelection.sequence} disabled />
                </Col>
              </Form.Group>

              <Form.Group
                as={Row}
                controlId="sequenceType"
                className={userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"}
              >
                <FormLabel label="Sequence Type" />
                <Col>
                  <Form.Control name="sequenceType" value={userSelection.sequenceType} disabled />
                </Col>
              </Form.Group>

              <Form.Group as={Row} controlId="internalId">
                <FormLabel label={displayNames.glycan.INTERNAL_ID} />
                <Col>
                  <Form.Control type="text" name="internalId" value={userSelection.internalId} disabled />
                </Col>
              </Form.Group>

              <Form.Group as={Row} controlId="comments">
                <FormLabel label="Comments" />
                <Col>
                  <Form.Control as="textarea" rows={4} name="comment" value={userSelection.comment} disabled />
                </Col>
              </Form.Group>
            </Form>
          </>
        );

      default:
        return "Unknown stepIndex";
    }
  }

  function getSequenceFromGlytoucan() {
    const glytoucanId = userSelection.glytoucanId.trim();
    if (glytoucanId !== "" && glytoucanId !== null) {
      wsCall(
        "glytoucanid",
        "GET",
        { glytoucanId: glytoucanId },
        false,
        null,
        checkGlytoucanSuccess,
        checkGlytoucanFailure
      );
    }
  }

  function checkGlytoucanSuccess(response) {
    response.text().then(parsedJson => {
      setUserSelection({ sequence: parsedJson });
      setRegistrationCheckFlag(false);
      getGlytoucanRegistration();
      setDisableReset(true);
    });
  }

  function checkGlytoucanFailure(response) {
    response.json().then(parsedJson => {
      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
      setRegistrationCheckFlag(true);
      getGlytoucanRegistration();
    });
  }

  function getGlytoucanRegistration() {
    return !registrationCheckFlag && "hide-content";
  }

  function addGlycan(e) {
    var glycanType = "SEQUENCE_DEFINED";
    if (userSelection.selectedGlycan === "MassDefined") {
      glycanType = "MASS_ONLY";
    } else if (userSelection.selectedGlycan === "Unknown") {
      glycanType = "UNKNOWN";
    }

    wsCall(
      "addglycan",
      "POST",
      { noGlytoucanRegistration: userSelection.glytoucanRegistration },
      true,
      {
        id: userSelection.glytoucanId,
        sequence: userSelection.sequence,
        sequenceType: userSelection.sequenceType,
        internalId: userSelection.internalId,
        name: userSelection.name,
        description: userSelection.comment,
        type: glycanType,
        mass: userSelection.mass
      },
      addGlycanSuccess,
      addGlycanFailure
    );

    e.preventDefault();
  }

  function addGlycanSuccess() {
    history.push("/glycans");
  }

  function addGlycanFailure(response) {
    response.json().then(parsedJson => {
      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
    });
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
};

AddGlycan.propTypes = {};

export { AddGlycan };
