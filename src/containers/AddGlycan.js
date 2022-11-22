import React, { useReducer, useState, useEffect } from "react";
import { Button, Step, StepLabel, Stepper, Typography } from "@material-ui/core";
import "../containers/AddGlycan.css";
import { Form, Row, Col } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
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
import RadioGroup from "@material-ui/core/RadioGroup";
import { BlueRadio } from "../components/FormControls";
import moleculeExamples from "../appData/moleculeExamples";
import ExampleSequenceControl from "../components/ExampleSequenceControl";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import wikiHelpTooltip from "../appData/wikiHelpTooltip";
import GlycoGlyph from "../components/search/GlycoGlyph";

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

const AddGlycan = props => {
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
  const [glycoGlyphDialog, setGlycoGlyphDialog] = useState(false);

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
    glycoGlyphName: ""
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [userSelection, setUserSelection] = useReducer(reducer, initialState);
  // const [defaultCheck, setDefaultCheck] = useState(true);

  const steps = getSteps();

  const handleNext = e => {
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
      (userSelection.selectedGlycan === "SequenceDefined" || userSelection.selectedGlycan === "Other") &&
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

    if (e.currentTarget.innerText === "SUBMIT") {
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
    // if (newValue !== "SequenceDefined") {
    //   setDefaultCheck(false);
    // } else {
    //   setDefaultCheck(true);
    // }
    setUserSelection({ ...initialState, ...{ selectedGlycan: newValue } });
  };

  const handleChange = e => {
    setDisableReset(true);

    const name = e.target.name;
    const newValue = e.target.value;

    if (name === "name" && newValue.trim().length < 1 && userSelection.selectedGlycan !== "SequenceDefined") {
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

  function handleSequenceChange(inputSequence) {
    setUserSelection({ sequence: inputSequence, glycoGlyphName: "" });
    setUserSelection({ sequenceType: "GlycoCT" });
  }

  const handleClassSelect = e => {
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
        <Form.Group as={Row} controlId="internalID" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Internal ID" className="required-asterik" />
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
        <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Name" className={userSelection.selectedGlycan === "Unknown" ? "required-asterik" : ""} />
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
        <Form.Group as={Row} controlId="comments" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Comment" className="required-asterik" />
            <Form.Control
              as="textarea"
              rows={4}
              name="comment"
              placeholder="Enter Comment"
              value={userSelection.comment}
              onChange={handleChange}
              maxLength={2000}
            />
            <div className="text-right text-muted">
              {userSelection.comment && userSelection.comment.length > 0 ? userSelection.comment.length : "0"}
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
      <GlycoGlyph
        show={glycoGlyphDialog}
        glySequenceChange={handleSequenceChange}
        glySequence={userSelection.sequence}
        setInputValue={setUserSelection}
        inputValue={userSelection}
        title={"GlycoGlyph"}
        setOpen={(input) => {
          setGlycoGlyphDialog(input)
        }}
      />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading title="Add Glycan to Repository" subTitle="Please provide the information for the new glycan." />
          <Typography className="text-right" gutterBottom>
            <HelpToolTip
              title={getStepHelpTitle(activeStep)}
              text={wikiHelpTooltip.tooltip_text}
              url={getStepHelpURL(activeStep)}
            />
            {wikiHelpTooltip.help_text}
          </Typography>
          <Card>
            <Card.Body>
              <Stepper className="steper-responsive5 text-center" activeStep={activeStep} alternativeLabel>
                {steps.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              {getNavigationButtons()}
              <h5 className="text-center gg-blue mt-4">{getStepLabel(activeStep)}</h5>

              {showErrorSummary === true && (
                <ErrorSummary show={showErrorSummary} form="glycans" errorJson={pageErrorsJson}></ErrorSummary>
              )}
              <div className="mt-4 mb-4">
                {getStepContent(activeStep, validate)}
                <Loading show={showLoading}></Loading>
              </div>
              {getNavigationButtons()}
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );

  function getSteps() {
    return ["Glycan Type", "Glycan Information", "Review and Add"];
  }
  function getGlycanType(typeIndex) {
    switch (typeIndex) {
      case "SequenceDefined":
        return `${displayNames.glycan.SEQUENCE_DEFINED}`;
      case "MassDefined":
        return `${displayNames.glycan.MASS_ONLY}`;
      case "CompositionBased":
        return `${displayNames.glycan.COMPOSITION_BASED}`;
      case "ClassificationBased":
        return `${displayNames.glycan.CLASSIFICATION_BASED}`;
      case "FragmentOnly":
        return `${displayNames.glycan.FRAGMENT_ONLY}`;
      case "Unknown":
        return `${displayNames.glycan.UNKNOWN}`;
      case "Other":
        return `${displayNames.glycan.OTHER}`;
      default:
        return "Unknown typeIndex";
    }
  }

  function getStepLabel(stepIndex) {
    switch (stepIndex) {
      case 0:
        return "Select the Glycan Type";
      case 1:
        return `Add ${getGlycanType(userSelection.selectedGlycan)} Glycan Type Information`;
      case 2:
        return "Review and Add Glycan to Repository";
      default:
        return "Unknown stepIndex";
    }
  }
  function getStepHelpTitle(stepIndex) {
    switch (stepIndex) {
      case 0:
        return `${wikiHelpTooltip.glycan.add_glycan_type.title}`;
      case 1:
        return `${getGlycanType(userSelection.selectedGlycan)} ${wikiHelpTooltip.glycan.add_glycan_type.title}`;
      case 2:
        return `${wikiHelpTooltip.glycan.common_information.title}`;
      default:
        return "Unknown stepIndex";
    }
  }
  function getStepHelpURL(stepIndex) {
    switch (stepIndex) {
      case 0:
        return `${wikiHelpTooltip.glycan.add_glycan_type.url}`;
      case 1:
        return `${getMoleculeTypeURL(userSelection.selectedGlycan)}`;
      case 2:
        return `${wikiHelpTooltip.glycan.common_information.url}`;
      default:
        return "Unknown stepIndex";
    }
  }
  function getMoleculeTypeURL(typeIndex) {
    switch (typeIndex) {
      case "SequenceDefined":
        return `${wikiHelpTooltip.glycan.add_glycan_type.sequence_defined.url}`;
      case "MassDefined":
        return `${wikiHelpTooltip.glycan.add_glycan_type.mass_defined.url}`;
      case "CompositionBased":
        return `${wikiHelpTooltip.glycan.add_glycan_type.composition_based.url}`;
      case "ClassificationBased":
        return `${wikiHelpTooltip.glycan.add_glycan_type.classification_based.url}`;
      case "FragmentOnly":
        return `${wikiHelpTooltip.glycan.add_glycan_type.fragment_only.url}`;
      case "Unknown":
        return `${wikiHelpTooltip.glycan.add_glycan_type.unknown.url}`;
      case "Other":
        return `${wikiHelpTooltip.glycan.add_glycan_type.other.url}`;
      default:
        return "Unknown typeIndex";
    }
  }

  function getStepContent(stepIndex, validate) {
    switch (stepIndex) {
      case 0:
        return (
          <Form>
            <Row className="gg-align-center">
              <Col sm="auto">
                <RadioGroup name="glycan-type" onChange={handleSelect} value={userSelection.selectedGlycan}>
                  <FormControlLabel
                    value="SequenceDefined"
                    control={<BlueRadio />}
                    label={displayNames.glycan.SEQUENCE_DEFINED}
                  />

                  <FormControlLabel
                    value="CompositionBased"
                    disabled
                    control={<BlueRadio />}
                    label={displayNames.glycan.COMPOSITION_BASED}
                  />

                  <FormControlLabel control={<BlueRadio />} value="MassDefined" label={displayNames.glycan.MASS_ONLY} />

                  <FormControlLabel
                    value="ClassificationBased"
                    disabled
                    control={<BlueRadio />}
                    label={displayNames.glycan.CLASSIFICATION_BASED}
                  />

                  <FormControlLabel
                    value="FragmentOnly"
                    disabled
                    control={<BlueRadio />}
                    label={displayNames.glycan.FRAGMENT_ONLY}
                  />

                  <FormControlLabel value="Unknown" control={<BlueRadio />} label={displayNames.glycan.UNKNOWN} />

                  <FormControlLabel value="Other" control={<BlueRadio />} label={displayNames.glycan.OTHER} />
                </RadioGroup>
              </Col>
            </Row>
          </Form>
        );
      case 1:
        if (activeStep === 1 && userSelection.selectedGlycan !== "Unknown") {
          return (
            <>
              <Form>
                <Form.Group
                  as={Row}
                  controlId="glytoucanId"
                  className={`gg-align-center mb-3 ${
                    userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"
                  }`}
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="GlyTouCan ID" />
                    <Form.Control
                      type="text"
                      name="glytoucanId"
                      placeholder="Enter GlyTouCan ID of the glycan"
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
                        className="gg-btn-blue-reg btn-to-lower mt-3"
                      >
                        Insert Information from GlyTouCan
                      </Button>
                    )}
                  </Col>
                </Form.Group>

                {/* Monoisotopic Mass */}
                <Form.Group
                  as={Row}
                  controlId="mass"
                  className={`gg-align-center mb-3 ${
                    userSelection.selectedGlycan === "MassDefined" ? "" : "hide-content"
                  }`}
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="Monoisotopic Mass" className="required-asterik" />
                    <Form.Control
                      type="number"
                      name="mass"
                      placeholder="Enter Monoisotopic Mass of the glycan"
                      value={userSelection.mass}
                      onChange={handleChange}
                      isInvalid={invalidMass}
                      isValid={validate}
                      required={true}
                      onKeyDown={e => {
                        isValidNumber(e);
                      }}
                    />
                    <Feedback
                      message={
                        invalidMass ? "Monoisotopic Mass should be greater than 0" : "Please enter Monoisotopic Mass"
                      }
                    />
                  </Col>
                </Form.Group>

                {/* Internal ID */}
                <Form.Group as={Row} controlId="internalID" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Internal ID" />
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
                <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel
                      label="Name"
                      className={
                        userSelection.selectedGlycan === "Unknown" || userSelection.selectedGlycan === "Other"
                          ? "required-asterik"
                          : ""
                      }
                    />
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter Name of the glycan"
                      value={userSelection.name}
                      onChange={handleChange}
                      isInvalid={
                        userSelection.selectedGlycan === "Unknown" || userSelection.selectedGlycan === "Other"
                          ? validateName
                          : ""
                      }
                      required={userSelection.selectedGlycan === "Unknown" || userSelection.selectedGlycan === "Other"}
                      maxLength={50}
                    />
                    <Feedback message="Name is required." />
                  </Col>
                </Form.Group>

                {/* Sequence Type */}
                <Form.Group
                  as={Row}
                  controlId="sequenceType"
                  className={`gg-align-center mb-3 ${
                    userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"
                  }`}
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="Sequence Type" className="required-asterik" />
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
                  className={`gg-align-center mb-3 ${
                    userSelection.selectedGlycan === "SequenceDefined" || userSelection.selectedGlycan === "Other"
                      ? ""
                      : "hide-content"
                  }`}
                >
                  <Col xs={12} lg={9}>
                    <Row className="gg-align-center mb-3">
                      <Col><FormLabel label="Sequence" className="required-asterik" /></Col>
                      <Col xs="auto">
                        <Button
                          className="gg-btn-blue"
                          onClick={() => setGlycoGlyphDialog(true)}>
                          Draw with Glyco Glyph
                        </Button>
                      </Col>
                    </Row>
                    <Form.Control
                      as="textarea"
                      rows="5"
                      name="sequence"
                      placeholder="Enter glycan sequence"
                      value={userSelection.sequence}
                      onChange={handleChange}
                      required={true}
                      isInvalid={validate}
                      maxLength={5000}
                    />
                    <Feedback message="Please enter Valid Sequence" />
                    <Row>
                      <Col className="gg-align-left">
                        {userSelection.sequenceType && (
                          <ExampleSequenceControl
                            setInputValue={id => {
                              setUserSelection({ sequence: id });
                            }}
                            inputValue={moleculeExamples.glycan[userSelection.sequenceType].examples}
                          />
                        )}
                      </Col>
                      <Col className="text-right text-muted">
                        {userSelection.sequence && userSelection.sequence.length > 0
                          ? userSelection.sequence.length
                          : "0"}
                        /5000
                      </Col>
                    </Row>
                    {/* Register for GlyTouCan */}
                    <Form.Group
                      controlId="formBasicCheckbox"
                      className={
                        userSelection.selectedGlycan === "SequenceDefined"
                          ? getGlytoucanRegistration()
                            ? "hide-content"
                            : "mb-0 pb-0 mt-2"
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
                <Form.Group as={Row} controlId="comments" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Comment" />
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="comment"
                      placeholder="Enter Comment"
                      value={userSelection.comment}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <div className="text-right text-muted">
                      {userSelection.comment && userSelection.comment.length > 0 ? userSelection.comment.length : "0"}
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
                    className="gg-btn-blue btn-to-lower"
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
                  className="gg-btn-blue btn-to-lower"
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
              <Form.Group as={Row} controlId="glycanSelected" className="gg-align-center mb-3">
                <Col xs={12} lg={9}>
                  <FormLabel label="Glycan Type" />
                  <Form.Control
                    type="text"
                    name="glycanType"
                    value={getGlycanType(userSelection.selectedGlycan)}
                    // value={userSelection.selectedGlycan}
                    disabled
                  />
                </Col>
              </Form.Group>

              {/* GlyTouCan ID */}
              <Form.Group
                as={Row}
                controlId="glytoucanId"
                className={`gg-align-center mb-3 ${
                  userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"
                }`}
              >
                <Col xs={12} lg={9}>
                  <FormLabel label={displayNames.glycan.GLYTOUCAN_ID} />
                  <Form.Control type="text" name="glytoucanId" value={userSelection.glytoucanId} disabled />
                </Col>
              </Form.Group>

              {/* Monoisotopic Mass */}
              <Form.Group
                as={Row}
                controlId="mass"
                className={`gg-align-center mb-3 ${
                  userSelection.selectedGlycan === "MassDefined" ? "" : "hide-content"
                }`}
              >
                <Col xs={12} lg={9}>
                  <FormLabel label="Monoisotopic Mass" />
                  <Form.Control type="text" name="mass" value={userSelection.mass} disabled />
                </Col>
              </Form.Group>

              {/* Internal ID */}
              <Form.Group as={Row} controlId="internalId" className="gg-align-center mb-3">
                <Col xs={12} lg={9}>
                  <FormLabel label={displayNames.glycan.INTERNAL_ID} />
                  <Form.Control type="text" name="internalId" value={userSelection.internalId} disabled />
                </Col>
              </Form.Group>

              {/* Name */}
              <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
                <Col xs={12} lg={9}>
                  <FormLabel label="Name" />
                  <Form.Control type="text" name="name" value={userSelection.name} disabled />
                </Col>
              </Form.Group>
              {/* Sequence Type */}
              <Form.Group
                as={Row}
                controlId="sequenceType"
                className={`gg-align-center mb-3 ${
                  userSelection.selectedGlycan === "SequenceDefined" ? "" : "hide-content"
                }`}
              >
                <Col xs={12} lg={9}>
                  <FormLabel label="Sequence Type" />
                  <Form.Control name="sequenceType" value={userSelection.sequenceType} disabled />
                </Col>
              </Form.Group>

              {/* Sequence */}
              <Form.Group
                as={Row}
                controlId="sequence"
                className={`gg-align-center mb-3 ${
                  userSelection.selectedGlycan === "SequenceDefined" || userSelection.selectedGlycan === "Other"
                    ? ""
                    : "hide-content"
                }`}
              >
                <Col xs={12} lg={9}>
                  <FormLabel label={displayNames.glycan.SEQUENCE} />
                  <Form.Control as="textarea" rows={4} name="sequence" value={userSelection.sequence} disabled />
                </Col>
              </Form.Group>

              {/* Comments */}
              <Form.Group as={Row} controlId="comments" className="gg-align-center mb-3">
                <Col xs={12} lg={9}>
                  <FormLabel label="Comment" />
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
    response.text().then(parsedJson => {
      setUserSelection({ sequence: parsedJson });
      setRegistrationCheckFlag(false);
      getGlytoucanRegistration();
      setUserSelection({ glytoucanRegistration: false });
      setDisableReset(true);
    });
    setShowLoading(false);
  }

  function checkGlytoucanFailure(response) {
    response.json().then(parsedJson => {
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
    response.json().then(parsedJson => {
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
          <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Glycans</Button>
        </Link>
        <Button disabled={activeStep === 0} onClick={handleBack} className="gg-btn-blue mt-2 gg-ml-20 gg-mr-20">
          Back
        </Button>
        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={handleNext}>
          {activeStep === steps.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    );
  }
};

AddGlycan.propTypes = {};

export { AddGlycan };
