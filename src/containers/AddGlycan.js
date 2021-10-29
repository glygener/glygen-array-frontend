import React, { useReducer, useState, useEffect } from "react";
import {
  Button,
  makeStyles,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useFormControl,
} from "@material-ui/core";
import "../containers/AddGlycan.css";
import { Form, FormCheck, Row, Col } from "react-bootstrap";
import { Feedback, Title } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import displayNames from "../appData/displayNames";
import { useHistory } from "react-router-dom";
import { isValidNumber } from "../utils/commonUtils";
import { Loading } from "../components/Loading";
import { ScrollToTop } from "../components/ScrollToTop";
import { PageHeading } from "../components/FormControls";
import { Link } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { BlueCheckbox } from "../components/FormControls";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

// const useStyles = makeStyles((theme) => ({
//   root: {
//     width: "90%",
//   },
//   backButton: {
//     marginRight: theme.spacing(1),
//   },
//   instructions: {
//     marginTop: theme.spacing(1),
//     marginBottom: theme.spacing(1),
//   },
// }));

const AddGlycan = (props) => {
  useEffect(props.authCheckAgent, []);

  // const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [validate, setValidate] = useState(false);
  const [validateName, setValidateName] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [registrationCheckFlag, setRegistrationCheckFlag] = useState(true);
  const [disableReset, setDisableReset] = useState(false);
  const [invalidMass, setInvalidMass] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
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
    sequenceType: "GlycoCT",
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [userSelection, setUserSelection] = useReducer(reducer, initialState);
  const [defaultCheck, setDefaultCheck] = useState(true);

  const steps = getSteps();

  const handleNext = (e) => {
    setValidate(false);
    setValidateName(false);

    if (
      userSelection.selectedGlycan === "Unknown" &&
      (userSelection.name === " " || userSelection.name.trim().length < 1) &&
      activeStep === 1
    ) {
      setValidateName(true);
      return;
    } else if (
      userSelection.selectedGlycan === "MassDefined" &&
      (userSelection.mass === " " || userSelection.mass.trim().length < 1) &&
      activeStep === 1
    ) {
      setValidate(false);
      setInvalidMass(true);
      return;
    } else if (
      (userSelection.selectedGlycan === "SequenceDefined" ||
        userSelection.selectedGlycan === "Other") &&
      activeStep === 1
    ) {
      if (userSelection.sequence === "" || userSelection.sequence.trim().length < 1) {
        setValidate(true);
      }

      if (userSelection.name === "") {
        setValidateName(true);
      }

      if (
        userSelection.sequence === "" ||
        userSelection.sequence.trim().length < 1 ||
        (userSelection.name === "" && userSelection.selectedGlycan !== "SequenceDefined")
      ) {
        return;
      }
    }

    if (e.currentTarget.innerText === "FINISH") {
      addGlycan(e);
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setShowErrorSummary(false);
  };

  const handleSelect = (e) => {
    const newValue = e.target.value;
    if (newValue !== "SequenceDefined") {
      setDefaultCheck(false);
    } else {
      setDefaultCheck(true);
    }
    setUserSelection({ ...initialState, ...{ selectedGlycan: newValue } });
  };

  const handleChange = (e) => {
    setDisableReset(true);

    const name = e.target.name;
    const newValue = e.target.value;

    if (
      name === "name" &&
      newValue.trim().length < 1 &&
      userSelection.selectedGlycan !== "SequenceDefined"
    ) {
      setValidateName(true);
    } else if (userSelection.selectedGlycan !== "SequenceDefined" && name === "name") {
      setValidateName(false);
    }

    if (name === "glytoucanRegistration") {
      setUserSelection({ [name]: e.target.checked });
    } else if (name === "mass" && newValue !== "" && newValue < 1) {
      setInvalidMass(true);
    } else {
      if (name === "mass" && (newValue === "" || newValue > 0)) {
        setInvalidMass(false);
      }

      if (name === "sequence" && newValue.trim().length > 1) {
        setValidate(false);
        setShowErrorSummary(false);
      }
      setUserSelection({ [name]: newValue });
    }
  };

  const handleClassSelect = (e) => {
    const select = e.target.options[e.target.selectedIndex].value;
    setUserSelection({ sequenceType: select });
  };

  const clearGlytoucanSequence = () => {
    setUserSelection({ ...initialState, ...{ selectedGlycan: userSelection.selectedGlycan } });
    setRegistrationCheckFlag(true);
    setDisableReset(false);
  };

  const getUnknownGlycanStep = () => {
    return (
      <Form>
        {/* Internal ID */}
        <Form.Group as={Row} controlId="internalID">
          <Form.Label
            column
            xs={12}
            sm={6}
            lg={4}
            className="text-xs-left text-sm-right text-md-right"
          >
            <strong>Internal ID</strong>
          </Form.Label>
          <Col xs={12} sm={6} lg={8}>
            <Form.Control
              type="text"
              name="internalId"
              placeholder="Enter ID used by your group"
              value={userSelection.internalId}
              onChange={handleChange}
              maxLength={30}
            />
          </Col>
        </Form.Group>

        {/* Name */}
        <Form.Group as={Row} controlId="name">
          <Form.Label
            column
            xs={12}
            sm={6}
            lg={4}
            className={
              userSelection.selectedGlycan === "Unknown"
                ? "required-asterik text-xs-left text-sm-right text-md-right"
                : "text-xs-left text-sm-right text-md-right"
            }
          >
            <strong>Name</strong>
          </Form.Label>
          <Col xs={12} sm={6} lg={8}>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter Name of the glycan"
              value={userSelection.name}
              onChange={handleChange}
              required={true}
              isInvalid={validateName}
              maxLength={50}
            />
            <Feedback message="Please enter Glycan Name." />
          </Col>
        </Form.Group>

        {/* Comment */}
        <Form.Group as={Row} controlId="comments">
          <Form.Label
            column
            xs={12}
            sm={6}
            lg={4}
            className="text-xs-left text-sm-right text-md-right"
          >
            <strong>Comment</strong>
          </Form.Label>
          <Col xs={12} sm={6} lg={8}>
            <Form.Control
              as="textarea"
              rows={4}
              name="comment"
              placeholder="Enter your comments"
              value={userSelection.comment}
              onChange={handleChange}
              maxLength={2000}
            />
            <div className="text-right text-muted">
              {userSelection.comment && userSelection.comment.length > 0
                ? userSelection.comment.length
                : "0"}
              /2000
            </div>
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
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Add Glycan to Repository"
            subTitle="Please provide the information for the new glycan."
          />
          <Card>
            <Card.Body>
              <Stepper activeStep={activeStep}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              {getNavigationButtons()}

              {showErrorSummary === true && (
                <ErrorSummary
                  show={showErrorSummary}
                  form="glycans"
                  errorJson={pageErrorsJson}
                ></ErrorSummary>
              )}
              <div className="mt-4 mb-4">
                <Typography component={"div"} variant="body1">
                  <>
                    {getStepContent(activeStep, validate)}
                    <Loading show={showLoading}></Loading>
                  </>
                </Typography>
              </div>
              {getNavigationButtons()}
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );

  function getSteps() {
    return ["Select the Glycan Type", "Add Glycan Information", "Review and Add"];
  }

  function getStepContent(stepIndex, validate) {
    switch (stepIndex) {
      case 0:
        return (
          <Form>
            <Row className="gg-align-center">
              <Col sm="auto">
                {/* <RadioGroup name="use-radio-group" onChange={handleSelect} checked={defaultCheck}>
                  <FormControlLabel
                    value="SequenceDefined"
                    control={<Radio />}
                    label={displayNames.glycan.SEQUENCE_DEFINED}
                  />
                  <FormControlLabel value="CompositionBased" control={<Radio />} label="Male" />
                </RadioGroup> */}
                <FormCheck className="line-break-1 gg-align-center">
                  <FormCheck.Label>
                    <FormCheck.Input
                      type="radio"
                      value="SequenceDefined"
                      onChange={handleSelect}
                      checked={defaultCheck}
                    />
                    {displayNames.glycan.SEQUENCE_DEFINED}
                  </FormCheck.Label>
                </FormCheck>

                <FormCheck className="line-break-1">
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

                <FormCheck className="line-break-1">
                  <FormCheck.Label className="disableradio">
                    <FormCheck.Input
                      type="radio"
                      value="ClassificationBased"
                      disabled
                      label="Classification Based"
                    />
                    {displayNames.glycan.CLASSIFICATION_BASED}
                  </FormCheck.Label>
                </FormCheck>

                <FormCheck className="line-break-1">
                  <FormCheck.Label className="disableradio">
                    <FormCheck.Input type="radio" value="FragmentOnly" disabled />
                    {displayNames.glycan.FRAGMENT_ONLY}
                  </FormCheck.Label>
                </FormCheck>

                <FormCheck className="line-break-1">
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

                <FormCheck className="line-break-15">
                  <FormCheck.Label>
                    <FormCheck.Input
                      type="radio"
                      value="Other"
                      onChange={handleSelect}
                      checked={userSelection.selectedGlycan === "Other"}
                    />
                    {displayNames.glycan.OTHER}
                  </FormCheck.Label>
                </FormCheck>
              </Col>
            </Row>
          </Form>
        );
      case 1:
        if (activeStep === 1 && userSelection.selectedGlycan !== "Unknown") {
          return (
            <>
              <Form>
                {/* Top Reset/ Clear Fields Button */}
                <div className="text-center mb-4 mt-1">
                  <Button
                    variant="contained"
                    disabled={!disableReset}
                    onClick={clearGlytoucanSequence}
                    // className="gg-btn-outline mt-2"
                    className="gg-btn-blue mt-2"
                  >
                    Clear Fields
                  </Button>
                </div>

                {/* GlyTouCan ID */}
                <Form.Group
                  as={Row}
                  controlId="glytoucanId"
                  className={
                    userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"
                  }
                >
                  <Form.Label
                    column
                    xs={12}
                    sm={6}
                    lg={4}
                    className="text-xs-left text-sm-right text-md-right"
                  >
                    <strong>GlyTouCan ID</strong>
                  </Form.Label>

                  <Col xs={12} sm={6} lg={8}>
                    <Form.Control
                      type="text"
                      name="glytoucanId"
                      placeholder="Enter GlyTouCan ID"
                      value={userSelection.glytoucanId}
                      onChange={handleChange}
                      onFocus={() => setShowErrorSummary(false)}
                      minLength={8}
                      maxLength={10}
                    />

                    {userSelection.glytoucanId !== "" && userSelection.glytoucanId.length > 7 && (
                      <Button
                        variant="contained"
                        onClick={() => getSequenceFromGlytoucan(userSelection.glytoucanId)}
                        // className="get-btn"
                        className="gg-btn-blue-reg mt-3"
                      >
                        Get Sequence from Glytoucan
                      </Button>
                    )}
                  </Col>
                </Form.Group>

                {/* Monoisotopic Mass */}
                <Form.Group
                  as={Row}
                  controlId="mass"
                  className={userSelection.selectedGlycan === "MassDefined" ? "" : "hide-content"}
                >
                  <Form.Label
                    column
                    xs={12}
                    sm={6}
                    lg={4}
                    className="required-asterik text-xs-left text-sm-right text-md-right"
                  >
                    <strong>Monoisotopic Mass</strong>
                  </Form.Label>
                  <Col xs={12} sm={6} lg={8}>
                    <Form.Control
                      type="number"
                      name="mass"
                      placeholder="Enter Monoisotopic Mass of the glycan"
                      value={userSelection.mass}
                      onChange={handleChange}
                      isInvalid={invalidMass}
                      isValid={validate}
                      required={true}
                      onKeyDown={(e) => {
                        isValidNumber(e);
                      }}
                    />
                    <Feedback
                      message={
                        invalidMass
                          ? "Monoisotopic Mass should be greater than 0"
                          : "Please enter Monoisotopic Mass"
                      }
                    />
                  </Col>
                </Form.Group>

                {/* Internal ID */}
                <Form.Group as={Row} controlId="internalID">
                  <Form.Label
                    column
                    xs={12}
                    sm={6}
                    lg={4}
                    className="text-xs-left text-sm-right text-md-right"
                  >
                    <strong>Internal ID</strong>
                  </Form.Label>
                  <Col xs={12} sm={6} lg={8}>
                    <Form.Control
                      type="text"
                      name="internalId"
                      placeholder="Enter ID used by your group"
                      value={userSelection.internalId}
                      onChange={handleChange}
                      maxLength={30}
                    />
                  </Col>
                </Form.Group>

                {/* Name */}
                <Form.Group as={Row} controlId="name">
                  <Form.Label
                    column
                    xs={12}
                    sm={6}
                    lg={4}
                    className={
                      userSelection.selectedGlycan === "Unknown" ||
                      userSelection.selectedGlycan === "Other"
                        ? "required-asterik text-xs-left text-sm-right text-md-right"
                        : "text-xs-left text-sm-right text-md-right"
                    }
                  >
                    <strong>Name</strong>
                  </Form.Label>
                  <Col xs={12} sm={6} lg={8}>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter Name of the glycan"
                      value={userSelection.name}
                      onChange={handleChange}
                      isInvalid={
                        userSelection.selectedGlycan === "Unknown" ||
                        userSelection.selectedGlycan === "Other"
                          ? validateName
                          : ""
                      }
                      required={
                        userSelection.selectedGlycan === "Unknown" ||
                        userSelection.selectedGlycan === "Other"
                      }
                      maxLength={50}
                    />
                    <Feedback message="Name is required." />
                  </Col>
                </Form.Group>

                {/* Sequence Type */}
                <Form.Group
                  as={Row}
                  controlId="sequenceType"
                  className={
                    userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"
                  }
                >
                  <Form.Label
                    column
                    xs={12}
                    sm={6}
                    lg={4}
                    className="required-asterik text-xs-left text-sm-right text-md-right"
                  >
                    <strong>Sequence Type</strong>
                  </Form.Label>
                  <Col xs={12} sm={6} lg={8}>
                    <Form.Control
                      as="select"
                      name="sequenceType"
                      placeholder="GlycoCT (first dropdown by default)"
                      value={userSelection.sequenceType}
                      onChange={handleClassSelect}
                      required={true}
                    >
                      <option value="GlycoCT">GlycoCT</option>
                      <option value="GlycoWorkbench">GlycoWorkbench</option>
                      <option value="Wurcs">WURCS</option>
                      <option value="IUPAC">CFG IUPAC Condensed</option>
                    </Form.Control>
                    <Feedback message="Sequence Type is required"></Feedback>
                  </Col>
                </Form.Group>

                {/* Sequence */}
                <Form.Group
                  as={Row}
                  controlId="sequence"
                  className={
                    userSelection.selectedGlycan === "SequenceDefined" ||
                    userSelection.selectedGlycan === "Other"
                      ? ""
                      : "hide-content"
                  }
                >
                  <Form.Label
                    column
                    xs={12}
                    sm={6}
                    lg={4}
                    className="required-asterik text-xs-left text-sm-right text-md-right"
                  >
                    <strong>Sequence</strong>
                  </Form.Label>
                  <Col xs={12} sm={6} lg={8}>
                    <Form.Control
                      as="textarea"
                      rows="5"
                      name="sequence"
                      placeholder="Enter Sequence"
                      value={userSelection.sequence}
                      onChange={handleChange}
                      required={true}
                      isInvalid={validate}
                      maxLength={5000}
                    />
                    <Feedback message="Please enter Valid Sequence" />
                    <div className="text-right text-muted">
                      {userSelection.sequence && userSelection.sequence.length > 0
                        ? userSelection.sequence.length
                        : "0"}
                      /5000
                    </div>
                    {/* Register for GlyTouCan */}
                    <Form.Group
                      controlId="formBasicCheckbox"
                      className={
                        userSelection.selectedGlycan === "SequenceDefined"
                          ? getGlytoucanRegistration()
                            ? "hide-content"
                            : "mb-0 pb-0"
                          : "hide-content"
                      }
                    >
                      <FormControlLabel
                        control={
                          <BlueCheckbox
                            name="glytoucanRegistration"
                            checked={userSelection.glytoucanRegistration}
                            onChange={handleChange}
                            size="large"
                          />
                        }
                        label="Register for GlyTouCan"
                      />
                    </Form.Group>
                  </Col>
                </Form.Group>

                {/* Comment */}
                <Form.Group as={Row} controlId="comments">
                  <Form.Label
                    column
                    xs={12}
                    sm={6}
                    lg={4}
                    className="text-xs-left text-sm-right text-md-right"
                  >
                    <strong>Comment</strong>
                  </Form.Label>
                  <Col xs={12} sm={6} lg={8}>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="comment"
                      placeholder="Enter your comments"
                      value={userSelection.comment}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <div className="text-right text-muted">
                      {userSelection.comment && userSelection.comment.length > 0
                        ? userSelection.comment.length
                        : "0"}
                      /2000
                    </div>
                  </Col>
                </Form.Group>

                {/* Bottom Reset / Clear fields  Button */}
                <div className="text-center mb-2">
                  <Button
                    variant="contained"
                    disabled={!disableReset}
                    onClick={clearGlytoucanSequence}
                    // className="gg-btn-outline mt-2"
                    className="gg-btn-blue"
                  >
                    Clear Fields
                  </Button>
                </div>
              </Form>
            </>
          );
        } else {
          return (
            <>
              {getUnknownGlycanStep()}
              {/* Reset Button */}
              <div className="text-center mb-2">
                <Button
                  variant="contained"
                  disabled={!disableReset}
                  onClick={clearGlytoucanSequence}
                  // className="gg-btn-outline mt-2"
                  className="gg-btn-blue"
                >
                  Clear Fields
                </Button>
              </div>
            </>
          );
        }

      case 2:
        return (
          <>
            <Form>
              {/* Glycan Type */}
              <Form.Group as={Row} controlId="glycanSelected">
                <Form.Label
                  column
                  xs={12}
                  sm={6}
                  lg={4}
                  className="text-xs-left text-sm-right text-md-right"
                >
                  <strong>Glycan Type</strong>
                </Form.Label>
                <Col xs={12} sm={6} lg={8}>
                  <Form.Control
                    type="text"
                    name="glycanType"
                    value={userSelection.selectedGlycan}
                    disabled
                  />
                </Col>
              </Form.Group>

              {/* GlyTouCan ID */}
              <Form.Group
                as={Row}
                controlId="glytoucanId"
                className={userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"}
              >
                <Form.Label
                  column
                  xs={12}
                  sm={6}
                  lg={4}
                  className="text-xs-left text-sm-right text-md-right"
                >
                  <strong>{displayNames.glycan.GLYTOUCAN_ID} </strong>
                </Form.Label>
                <Col xs={12} sm={6} lg={8}>
                  <Form.Control
                    type="text"
                    name="glytoucanId"
                    value={userSelection.glytoucanId}
                    disabled
                  />
                </Col>
              </Form.Group>

              {/* Monoisotopic Mass */}
              <Form.Group
                as={Row}
                controlId="mass"
                className={userSelection.selectedGlycan === "MassDefined" ? "" : "hide-content"}
              >
                <Form.Label
                  column
                  xs={12}
                  sm={6}
                  lg={4}
                  className="text-xs-left text-sm-right text-md-right"
                >
                  <strong>Monoisotopic Mass</strong>
                </Form.Label>
                <Col xs={12} sm={6} lg={8}>
                  <Form.Control type="text" name="mass" value={userSelection.mass} disabled />
                </Col>
              </Form.Group>

              {/* Internal ID */}
              <Form.Group as={Row} controlId="internalId">
                <Form.Label
                  column
                  xs={12}
                  sm={6}
                  lg={4}
                  className="text-xs-left text-sm-right text-md-right"
                >
                  <strong>{displayNames.glycan.INTERNAL_ID}</strong>
                </Form.Label>
                <Col xs={12} sm={6} lg={8}>
                  <Form.Control
                    type="text"
                    name="internalId"
                    value={userSelection.internalId}
                    disabled
                  />
                </Col>
              </Form.Group>

              {/* Name */}
              <Form.Group as={Row} controlId="name">
                <Form.Label
                  column
                  xs={12}
                  sm={6}
                  lg={4}
                  className="text-xs-left text-sm-right text-md-right"
                >
                  <strong>Name</strong>
                </Form.Label>
                <Col xs={12} sm={6} lg={8}>
                  <Form.Control type="text" name="name" value={userSelection.name} disabled />
                </Col>
              </Form.Group>

              {/* Sequence Type */}
              <Form.Group
                as={Row}
                controlId="sequenceType"
                className={userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"}
              >
                <Form.Label
                  column
                  xs={12}
                  sm={6}
                  lg={4}
                  className="text-xs-left text-sm-right text-md-right"
                >
                  <strong>Sequence Type</strong>
                </Form.Label>
                <Col xs={12} sm={6} lg={8}>
                  <Form.Control name="sequenceType" value={userSelection.sequenceType} disabled />
                </Col>
              </Form.Group>

              {/* Sequence */}
              <Form.Group
                as={Row}
                controlId="sequence"
                className={
                  userSelection.selectedGlycan === "SequenceDefined" ||
                  userSelection.selectedGlycan === "Other"
                    ? ""
                    : "hide-content"
                }
              >
                <Form.Label
                  column
                  xs={12}
                  sm={6}
                  lg={4}
                  className="text-xs-left text-sm-right text-md-right"
                >
                  <strong>{displayNames.glycan.SEQUENCE}</strong>
                </Form.Label>
                <Col xs={12} sm={6} lg={8}>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="sequence"
                    value={userSelection.sequence}
                    disabled
                  />
                </Col>
              </Form.Group>

              {/* Comments */}
              <Form.Group as={Row} controlId="comments">
                <Form.Label
                  column
                  xs={12}
                  sm={6}
                  lg={4}
                  className="text-xs-left text-sm-right text-md-right"
                >
                  <strong>Comment</strong>
                </Form.Label>
                <Col xs={12} sm={6} lg={8}>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="comment"
                    value={userSelection.comment}
                    disabled
                  />
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
    setShowLoading(true);
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
    response.text().then((parsedJson) => {
      setUserSelection({ sequence: parsedJson });
      setRegistrationCheckFlag(false);
      getGlytoucanRegistration();
      setUserSelection({ glytoucanRegistration: false });
      setDisableReset(true);
    });
    setShowLoading(false);
  }

  function checkGlytoucanFailure(response) {
    response.json().then((parsedJson) => {
      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
      setRegistrationCheckFlag(true);
      getGlytoucanRegistration();
    });
    setShowLoading(false);
  }

  function getGlytoucanRegistration() {
    return !registrationCheckFlag && "hide-content";
  }

  function addGlycan(e) {
    setShowLoading(true);
    var glycanType = "SEQUENCE_DEFINED";
    if (userSelection.selectedGlycan === "MassDefined") {
      glycanType = "MASS_ONLY";
    } else if (userSelection.selectedGlycan === "Unknown") {
      glycanType = "UNKNOWN";
    } else if (userSelection.selectedGlycan === "Other") {
      glycanType = "OTHER";
    }

    wsCall(
      "addglycan",
      "POST",
      { noGlytoucanRegistration: !userSelection.glytoucanRegistration },
      true,
      {
        // id: userSelection.glytoucanId,
        glytoucanId: userSelection.glytoucanId.trim(),
        sequence: userSelection.sequence,
        sequenceType: userSelection.sequenceType,
        internalId: userSelection.internalId,
        name: userSelection.name,
        description: userSelection.comment,
        type: glycanType,
        mass: userSelection.mass,
      },
      addGlycanSuccess,
      addGlycanFailure
    );

    e.preventDefault();
  }

  function addGlycanSuccess() {
    setShowLoading(false);
    history.push("/glycans");
  }

  function addGlycanFailure(response) {
    response.json().then((parsedJson) => {
      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
    });
    setShowLoading(false);
    ScrollToTop();
  }

  function getNavigationButtons() {
    return (
      <div className="text-center mb-2">
        <Link to="/glycans">
          <Button className="gg-btn-outline mt-2 gg-mr-20">Back to Glycans</Button>
        </Link>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          className="gg-btn-blue mt-2 gg-ml-20 gg-mr-20"
        >
          Back
        </Button>
        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={handleNext}>
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    );
  }
};

AddGlycan.propTypes = {};

export { AddGlycan };
