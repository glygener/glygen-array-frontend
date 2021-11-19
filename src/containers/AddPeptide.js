/* eslint-disable no-fallthrough */
import React, { useReducer, useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { Feedback } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import displayNames from "../appData/displayNames";
import { validateSequence } from "../utils/sequence";
import { useHistory } from "react-router-dom";
import { Loading } from "../components/Loading";
import { PublicationCard } from "../components/PublicationCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  csvToArray,
  isValidURL,
  externalizeUrl,
  isValidNumber,
  numberLengthCheck,
} from "../utils/commonUtils";
import { Button, Step, StepLabel, Stepper, Typography, makeStyles } from "@material-ui/core";
import "../containers/AddLinker.css";
import { Source } from "../components/Source";
import { ViewSourceInfo } from "../components/ViewSourceInfo";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Image } from "react-bootstrap";
import plusIcon from "../images/icons/plus.svg";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import { BlueRadio } from "../components/FormControls";
import { Link } from "react-router-dom";
import ExampleExploreControl from "../components/ExampleExploreControl";
import moleculeExamples from "../appData/moleculeExamples";

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

const AddPeptide = (props) => {
  useEffect(props.authCheckAgent, []);

  // const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [validate, setValidate] = useState(false);
  const [validatedCommNonComm, setValidatedCommNonComm] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [validatedSpecificDetails, setValidatedSpecificDetails] = useState(false);
  const [sequenceError, setSequenceError] = useState("");
  const [newPubMedId, setNewPubMedId] = useState("");
  const [invalidUrls, setInvalidUrls] = useState(false);
  const [newURL, setNewURL] = useState("");
  const [disableReset, setDisableReset] = useState(false);
  const [disableResetSecondStep, setDisableResetSecondStep] = useState(false);
  const history = useHistory();

  const peptideInitialState = {
    selectedPeptide: "SequenceDefined",
    name: "",
    sequence: "",
    comment: "",
    publications: [],
    urls: [],
    source: "notSpecified",
    commercial: { vendor: "", catalogueNumber: "", batchId: "" },
    nonCommercial: { providerLab: "", batchId: "", method: "", sourceComment: "" },
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [peptide, setPeptide] = useReducer(reducer, peptideInitialState);

  const reviewFields = {
    name: { label: "Name", type: "text", length: 100 },
    sequence: { label: "Sequence", type: "textarea" },
    comment: { label: "Comment", type: "textarea", length: 10000 },
  };

  const sourceSelection = (e) => {
    const newValue = e.target.value;
    setPeptide({ source: newValue });
  };

  const sourceChange = (e) => {
    const name = e.target.name;
    const newValue = e.target.value;

    if (peptide.source === "commercial") {
      if (name === "vendor") {
        setValidatedCommNonComm(false);
      }
      let comm = peptide.commercial;
      comm[name] = newValue;
      setPeptide({ [peptide.commercial]: comm });
    } else {
      if (name === "providerLab") {
        setValidatedCommNonComm(false);
      }

      let nonComm = peptide.nonCommercial;
      nonComm[name] = newValue;
      setPeptide({ [peptide.nonCommercial]: nonComm });
    }
  };

  const steps = getSteps();

  const handleNext = (e) => {
    setValidate(false);
    var stepIncrement = 1;

    if (activeStep === 0 && peptide.selectedPeptide === "Unknown") {
      stepIncrement += 1;
    } else if (activeStep === 1) {
      setValidatedSpecificDetails(true);
      if (peptide.sequence === "") {
        return;
      } else {
        var seqError = validateSequence("PEPTIDE_LINKER", peptide.sequence.trim());
        setSequenceError(seqError);
        if (seqError !== "") {
          return;
        }
      }
    } else if (activeStep === 2) {
      let count = 0;

      if (peptide.name === "") {
        setValidate(true);
        count++;
      }

      if (
        (peptide.source === "commercial" && peptide.commercial.vendor === "") ||
        (peptide.source === "nonCommercial" && peptide.nonCommercial.providerLab === "")
      ) {
        setValidatedCommNonComm(true);
        count++;
      }

      if (count > 0) {
        return;
      }
    } else if (e.currentTarget.innerText === "SUBMIT") {
      addPeptide(e);
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + stepIncrement);
  };

  const handleChange = (e) => {
    const name = e.target.name;
    const newValue = e.target.value;

    setPeptide({ [name]: newValue });
    setValidate(false);
    if (activeStep === 1) {
      setDisableReset(true);
    }
    if (activeStep === 2) {
      setDisableResetSecondStep(true);
    }
  };

  const handleBack = () => {
    setShowErrorSummary(false);
    var stepDecrement = 1;
    if (activeStep === 1) {
      setValidate(false);
    }
    if (activeStep === 2) {
      if (peptide.selectedPeptide === "Unknown") {
        stepDecrement += 1;
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep - stepDecrement);
  };

  const handleSelect = (e) => {
    const newValue = e.target.value;
    setPeptide({ ...peptideInitialState, ...{ selectedPeptide: newValue } });
  };

  const clearFields = () => {
    if (activeStep === 1) {
      setPeptide({ ...peptideInitialState, ...{ selectedPeptide: peptide.selectedPeptide } });

      setDisableReset(false);
    }
    if (activeStep === 2) {
      setPeptide({
        ...peptideInitialState,
        commercial: peptideInitialState.commercial,
        nonCommercial: peptideInitialState.nonCommercial,
        ...{
          selectedPeptide: peptide.selectedPeptide,
          sequence: peptide.sequence,
          source: peptide.source,
        },
      });
      setNewURL("");
      setNewPubMedId("");
      setDisableResetSecondStep(false);
    }
  };

  function getSteps() {
    return ["Peptide Type", "Type Specific Information", "Generic Information", "Review and Add"];
  }

  function getPeptideType(typeIndex) {
    switch (typeIndex) {
      case "SequenceDefined":
        return `${displayNames.peptide.SEQUENCE}`;
      case "Unknown":
        return `${displayNames.peptide.UNKNOWN}`;
      default:
        return "Unknown typeIndex";
    }
  }
  function getStepLabel(stepIndex) {
    switch (stepIndex) {
      case 0:
        return "Select the Peptide Type";
      case 1:
        return `Add Type Specific Peptide Information (${getPeptideType(peptide.selectedPeptide)})`;
      case 2:
        return `Add Generic Peptide Information (${getPeptideType(peptide.selectedPeptide)})`;
      case 3:
        return "Review and Add Peptide to Repository";
      default:
        return "Unknown stepIndex";
    }
  }

  function addPublication() {
    let publications = peptide.publications;
    let pubmedExists = publications.find((i) => i.pubmedId === parseInt(newPubMedId));

    if (!pubmedExists) {
      wsCall("getpublication", "GET", [newPubMedId], true, null, addPublicationSuccess, addPublicationError);
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then((responseJson) => {
        setShowErrorSummary(false);
        setPeptide({
          publications: peptide.publications.concat([responseJson]),
        });
        setNewPubMedId("");
        if (activeStep === 1) {
          setDisableReset(true);
        }
        if (activeStep === 2) {
          setDisableResetSecondStep(true);
        }
      });
    }

    function addPublicationError(response) {
      response.text().then((resp) => {
        if (resp) {
          setPageErrorsJson(JSON.parse(resp));
        } else {
          setPageErrorMessage("The PubMed Id entered is invalid. Please try again.");
        }
        setShowErrorSummary(true);
      });
    }
  }

  function deletePublication(id, wscall) {
    const publications = peptide.publications;
    const publicationToBeDeleted = publications.find((i) => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    setPeptide({ publications: publications });
  }

  function addURL() {
    var listUrls = peptide.urls;
    var urlEntered = csvToArray(newURL)[0];
    const urlExists = listUrls.find((i) => i === urlEntered);

    if (!urlExists) {
      if (urlEntered !== "" && !isValidURL(urlEntered)) {
        setInvalidUrls(true);
        return;
      } else {
        listUrls.push(urlEntered);
        setInvalidUrls(false);
      }

      setPeptide({ urls: listUrls });
    }
    setNewURL("");
  }

  const urlWidget = (enableDelete) => {
    return (
      <>
        {peptide.urls && peptide.urls.length > 0
          ? peptide.urls.map((url, index) => {
              return (
                <Row key={index}>
                  <Col
                    md={10}
                    style={{
                      wordBreak: "break-all",
                    }}
                    className="pb-2"
                  >
                    <a href={externalizeUrl(url)} target="_blank" rel="external noopener noreferrer">
                      {url}
                    </a>
                  </Col>
                  {enableDelete && (
                    <Col className="pb-2 text-center" md={2}>
                      <LineTooltip text="Delete URL">
                        <Link>
                          <FontAwesomeIcon
                            icon={["far", "trash-alt"]}
                            alt="Delete url"
                            size="lg"
                            className="caution-color tbl-icon-btn"
                            onClick={() => {
                              const listUrls = peptide.urls;
                              listUrls.splice(index, 1);
                              setPeptide({ urls: listUrls });
                            }}
                          />
                        </Link>
                      </LineTooltip>
                    </Col>
                  )}
                </Row>
              );
            })
          : ""}
      </>
    );
  };

  function getStepContent(stepIndex, validate) {
    switch (stepIndex) {
      case 0:
        return (
          <Form>
            <Row className="gg-align-center">
              <Col sm="auto">
                <RadioGroup name="peptide-type" onChange={handleSelect} value={peptide.selectedPeptide}>
                  {/* SEQUENCE_DEFINED */}
                  <FormControlLabel
                    value="SequenceDefined"
                    control={<BlueRadio />}
                    label={displayNames.peptide.SEQUENCE}
                  />
                  {/* UNKNOWN */}
                  <FormControlLabel value="Unknown" control={<BlueRadio />} label={displayNames.peptide.UNKNOWN} />
                </RadioGroup>
              </Col>
            </Row>
          </Form>
        );
      case 1:
        if (activeStep === 1 && peptide.selectedPeptide !== "Unknown") {
          return (
            <>
              <Form.Group as={Row} controlId="sequence">
                <Form.Label
                  column
                  xs={12}
                  lg={3}
                  xl={2}
                  className="required-asterik text-xs-left text-md-left text-lg-right"
                >
                  <strong>Sequence</strong>
                </Form.Label>
                <Col xs={12} lg={9}>
                  <Form.Control
                    as="textarea"
                    rows="5"
                    name="sequence"
                    placeholder="Enter Peptide Sequence"
                    value={peptide.sequence}
                    onChange={handleChange}
                    className="sequence-text-area"
                    isInvalid={validatedSpecificDetails && (peptide.sequence === "" || sequenceError !== "")}
                    spellCheck="false"
                    maxLength={10000}
                  />
                  {peptide.sequence === "" && <Feedback message="Sequence is required" />}
                  {sequenceError !== "" && <Feedback message={sequenceError} />}
                  <Feedback message="Please Enter Valid Sequence" />
                  <Row>
                    <Col className="gg-align-left">
                      <ExampleExploreControl
                        setInputValue={funcSetInputValues}
                        inputValue={moleculeExamples.peptide.examples}
                      />
                    </Col>
                    <Col className="text-right text-muted">
                      {peptide.sequence && peptide.sequence.length > 0 ? peptide.sequence.length : "0"}
                      /10000
                    </Col>
                  </Row>
                </Col>
              </Form.Group>
              {/* Bottom Reset / Clear fields  Button */}
              <div className="text-center mb-2">
                <Button
                  variant="contained"
                  disabled={!disableReset}
                  onClick={clearFields}
                  className="gg-btn-blue btn-to-lower"
                >
                  Clear Fields
                </Button>
              </div>
            </>
          );
        }

      case 2:
        if (activeStep === 2) {
          return (
            <>
              <Form noValidate className="radioform2" validated={validate && validatedCommNonComm}>
                <Form.Group as={Row} controlId="name">
                  <Form.Label
                    column
                    xs={12}
                    lg={3}
                    xl={2}
                    className="required-asterik text-xs-left text-md-left text-lg-right"
                  >
                    <strong>Name</strong>
                  </Form.Label>
                  <Col xs={12} lg={9}>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter Name of the peptide"
                      value={peptide.name}
                      onChange={handleChange}
                      isInvalid={validate}
                      maxLength={100}
                      required
                    />
                    <Feedback message={"Name is required"} />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="comments">
                  <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                    <strong>Comment</strong>
                  </Form.Label>
                  <Col xs={12} lg={9}>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="comment"
                      placeholder="Enter Comment"
                      value={peptide.comment}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <div className="text-right text-muted">
                      {peptide.comment && peptide.comment.length > 0 ? peptide.comment.length : "0"}
                      /2000
                    </div>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="urls">
                  <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                    <strong>URLs</strong>
                  </Form.Label>
                  <Col xs={12} lg={9}>
                    {urlWidget(true)}
                    <Row>
                      <Col md={10}>
                        <Form.Control
                          as="input"
                          name="urls"
                          placeholder="Enter the URL and click +"
                          value={newURL}
                          onChange={(e) => {
                            setNewURL(e.target.value);
                            setInvalidUrls(false);
                          }}
                          maxLength={2048}
                          isInvalid={invalidUrls}
                        />
                        <Feedback message="Please enter a valid and unique URL." />
                      </Col>
                      <Col md={1}>
                        <Button onClick={addURL} className="gg-reg-btn-outline">
                          <LineTooltip text="Add URL">
                            <Link>
                              <Image src={plusIcon} alt="plus button" />
                            </Link>
                          </LineTooltip>
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="publications">
                  <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                    <strong>Publications</strong>
                  </Form.Label>
                  <Col xs={12} lg={9}>
                    {peptide.publications.map((pub, index) => {
                      return (
                        <PublicationCard key={index} {...pub} enableDelete deletePublication={deletePublication} />
                      );
                    })}
                    <Row>
                      <Col md={10}>
                        <Form.Control
                          type="number"
                          name="publication"
                          placeholder="Enter the Pubmed ID and click +"
                          value={newPubMedId}
                          onChange={(e) => setNewPubMedId(e.target.value)}
                          maxLength={100}
                          onKeyDown={(e) => {
                            isValidNumber(e);
                          }}
                          onInput={(e) => {
                            numberLengthCheck(e);
                          }}
                        />
                      </Col>
                      <Col md={1}>
                        <Button onClick={addPublication} className="gg-reg-btn-outline">
                          <LineTooltip text="Add Publication">
                            <Link>
                              <Image src={plusIcon} alt="plus button" />
                            </Link>
                          </LineTooltip>
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Form.Group>
                <Row>
                  <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                    <strong>Source</strong>
                  </Form.Label>
                  <Col xs={12} lg={9}>
                    <RadioGroup row name="glycan-type" onChange={sourceSelection} value={peptide.source}>
                      {/* Commercial */}
                      <FormControlLabel value="commercial" control={<BlueRadio />} label="Commercial" />
                      {/* Non Commercial */}
                      <FormControlLabel value="nonCommercial" control={<BlueRadio />} label="Non Commercial" />
                      {/* Not Specified */}
                      <FormControlLabel value="notSpecified" control={<BlueRadio />} label="Not Specified" />
                    </RadioGroup>
                  </Col>
                </Row>

                {peptide.source === "commercial" ? (
                  <Source
                    isCommercial
                    commercial={peptide.commercial}
                    validate={validatedCommNonComm}
                    sourceChange={sourceChange}
                  />
                ) : (
                  peptide.source === "nonCommercial" && (
                    <Source
                      isNonCommercial
                      nonCommercial={peptide.nonCommercial}
                      validate={validatedCommNonComm}
                      sourceChange={sourceChange}
                    />
                  )
                )}
                {/* Bottom Reset / Clear fields  Button */}
                <div className="text-center mb-2">
                  <Button
                    variant="contained"
                    disabled={!disableResetSecondStep}
                    onClick={clearFields}
                    className="gg-btn-blue btn-to-lower"
                  >
                    Clear Fields
                  </Button>
                </div>
              </Form>
            </>
          );
        }
      case 3:
        return (
          <Form>
            {Object.keys(reviewFields).map((key) =>
              key === "sequence" && peptide.selectedPeptide === "Unknown" ? (
                ""
              ) : (
                <Form.Group as={Row} controlId={key} key={key}>
                  <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                    <strong>{reviewFields[key].label}</strong>
                  </Form.Label>
                  <Col xs={12} lg={9}>
                    <Form.Control
                      as={reviewFields[key].type === "textarea" ? "textarea" : "input"}
                      rows={key === "sequence" ? "10" : "4"}
                      name={key}
                      placeholder={""}
                      value={peptide[key]}
                      disabled
                      className={key === "sequence" ? "sequence-text-area" : false}
                    />
                  </Col>
                </Form.Group>
              )
            )}
            {peptide.urls && peptide.urls.length > 0 && (
              <Form.Group as={Row} controlId="urls">
                <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                  <strong>URLs</strong>
                </Form.Label>
                <Col xs={12} lg={9}>
                  {peptide.urls.map((url, index) => {
                    return (
                      <div key={index}>
                        <a href={externalizeUrl(url)} target="_blank" rel="external noopener noreferrer">
                          {url}
                        </a>
                      </div>
                    );
                  })}
                </Col>
              </Form.Group>
            )}

            {peptide.publications && peptide.publications.length > 0 && (
              <Form.Group as={Row} controlId="publications">
                <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                  <strong>Publication</strong>
                </Form.Label>
                <Col xs={12} lg={9}>
                  {peptide.publications && peptide.publications.length > 0
                    ? peptide.publications.map((pub) => {
                        return (
                          <div>
                            <PublicationCard key={pub.pubmedId} {...pub} enableDelete={false} />
                          </div>
                        );
                      })
                    : ""}
                </Col>
              </Form.Group>
            )}

            <ViewSourceInfo
              source={peptide.source}
              commercial={peptide.commercial}
              nonCommercial={peptide.nonCommercial}
            />
          </Form>
        );

      default:
        return "Unknown stepIndex";
    }
  }

  function getNavigationButtons(className) {
    return (
      <div className="text-center mb-2">
        <Link to="/peptides">
          <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Peptides</Button>
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

  /**
   * Function to set glycan id value.
   * @param {string} glycanSearchSuccess - input glycan id value.
   **/
  function funcSetInputValues(value) {
    setPeptide({ sequence: value });
    if (activeStep === 1) {
      setDisableReset(true);
    }
    if (activeStep === 2) {
      setDisableResetSecondStep(true);
    }
  }

  function addPeptide(e) {
    setShowLoading(true);

    let unknownPeptide = peptide.selectedPeptide === "Unknown" ? true : false;

    var source = {
      type: "NOTRECORDED",
    };

    if (peptide.source === "commercial") {
      source.type = "COMMERCIAL";
      source.vendor = peptide.commercial.vendor;
      source.catalogueNumber = peptide.commercial.catalogueNumber;
      source.batchId = peptide.commercial.batchId;
    } else if (peptide.source === "nonCommercial") {
      source.type = "NONCOMMERCIAL";
      source.batchId = peptide.nonCommercial.batchId;
      source.providerLab = peptide.nonCommercial.providerLab;
      source.method = peptide.nonCommercial.method;
      source.comment = peptide.nonCommercial.sourceComment;
    }

    var peptideObj = peptide.selectedPeptide === "Unknown" ? getUnknownSubmitData() : getPeptideSubmitData();

    wsCall(
      "addlinker",
      "POST",
      { unknown: unknownPeptide },
      true,
      peptideObj,
      (response) => history.push("/peptides"),
      addPeptideFailure
    );

    function addPeptideFailure(response) {
      response.json().then((parsedJson) => {
        setPageErrorsJson(parsedJson);
        setShowErrorSummary(true);
      });
      setShowLoading(false);
    }

    function getPeptideSubmitData() {
      var peptideseq = {
        type: "PEPTIDE",
        name: peptide.name,
        comment: peptide.comment,
        publications: peptide.publications,
        urls: peptide.urls,
        sequence: peptide.sequence.trim(),
        source: source,
      };

      return peptideseq;
    }

    function getUnknownSubmitData() {
      var unknownpep = {
        type: "PEPTIDE",
        name: peptide.name,
        comment: peptide.comment,
        publications: peptide.publications,
        urls: peptide.urls,
        sequence: "",
        source: source,
      };

      return unknownpep;
    }
  }

  const isStepSkipped = (step) => {
    return peptide.selectedPeptide === "Unknown" && step === 1 && activeStep === 2;
  };

  return (
    <>
      <Helmet>
        <title>{head.addPeptide.title}</title>
        {getMeta(head.addPeptide)}
      </Helmet>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Add Peptide to Repository"
            subTitle="Please provide the information for the new peptide."
          />
          <Card>
            <Card.Body>
              <Stepper className="steper-responsive text-center" activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => {
                  const stepProps = {};
                  const labelProps = {};
                  if (isStepSkipped(index)) {
                    labelProps.optional = <Typography variant="caption">Unknown Peptide</Typography>;
                    stepProps.completed = false;
                  }
                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
              {getNavigationButtons()}
              <h5 className="text-center gg-blue mt-4">{getStepLabel(activeStep)}</h5>

              {showErrorSummary === true && (
                <ErrorSummary
                  show={showErrorSummary}
                  form="linkers"
                  errorJson={pageErrorsJson}
                  errorMessage={pageErrorMessage}
                />
              )}

              <div className="mt-4 mb-4">
                <span>{getStepContent(activeStep, validate)}</span>
                {getNavigationButtons()}
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
      <Loading show={showLoading} />
    </>
  );
};

AddPeptide.propTypes = {};

export { AddPeptide };
