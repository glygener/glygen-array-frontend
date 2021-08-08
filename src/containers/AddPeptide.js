/* eslint-disable no-fallthrough */
import React, { useReducer, useState, useEffect } from "react";
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
import MultiToggle from "react-multi-toggle";
import { PublicationCard } from "../components/PublicationCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { csvToArray, isValidURL, externalizeUrl, isValidNumber, numberLengthCheck } from "../utils/commonUtils";
import { Button, Step, StepLabel, Stepper, Typography, makeStyles, Link } from "@material-ui/core";
import "../containers/AddGlycan.css";

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
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [validatedSpecificDetails, setValidatedSpecificDetails] = useState(false);
  const [sequenceError, setSequenceError] = useState("");
  const [newPubMedId, setNewPubMedId] = useState("");
  const [invalidUrls, setInvalidUrls] = useState(false);
  const [newURL, setNewURL] = useState("");
  const history = useHistory();

  const peptideInitialState = {
    selectedPeptide: "SequenceDefined",
    name: "",
    sequence: "",
    opensRing: 2,
    publications: [],
    urls: []
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [peptide, setPeptide] = useReducer(reducer, peptideInitialState);

  const reviewFields = {
    name: { label: "Name", type: "text", length: 100 },
    sequence: { label: "Sequence", type: "textarea" },
    comment: { label: "Comments", type: "textarea", length: 10000 },
    opensRing: { label: "Opens Ring", type: "text" }
  };

  const steps = getSteps();

  const handleNext = e => {
    setValidate(false);
    var stepIncrement = 1;

    if (activeStep === 0 && peptide.selectedPeptide === "Unknown") {
      stepIncrement += 1;
    } else if (activeStep === 1) {
      setValidatedSpecificDetails(true);
      if (peptide.sequence === "") {
        return;
      } else {
        var seqError = validateSequence("PEPTIDE_LINKER", peptide.sequence);
        setSequenceError(seqError);
        if (seqError !== "") {
          return;
        }
      }
    } else if (activeStep === 2 && peptide.name === "") {
      setValidate(true);
      return;
    } else if (e.currentTarget.innerText === "FINISH") {
      addPeptide(e);
      return;
    }

    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const opensRingOptions = [
    {
      displayName: "Unknown",
      value: 2
    },
    {
      displayName: "Yes",
      value: 1
    },
    {
      displayName: "No",
      value: 0
    }
  ];

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    setPeptide({ [name]: newValue });
  };

  const handleBack = () => {
    var stepDecrement = 1;
    if (activeStep === 1) {
      setValidate(false);
    }
    if (activeStep === 2) {
      if (peptide.selectedPeptide === "Unknown") {
        stepDecrement += 1;
      }
    }
    setActiveStep(prevActiveStep => prevActiveStep - stepDecrement);
  };

  const handleSelect = e => {
    const newValue = e.target.value;
    setPeptide({ ...peptideInitialState, ...{ selectedPeptide: newValue } });
  };

  function getSteps() {
    return ["Select the Peptide Type", "Type Specific Peptide Info", "Generic peptide Info", "Review and Add"];
  }
  function addPublication() {
    let publications = peptide.publications;
    let pubmedExists = publications.find(i => i.pubmedId === parseInt(newPubMedId));

    if (!pubmedExists) {
      wsCall("getpublication", "GET", [newPubMedId], true, null, addPublicationSuccess, addPublicationError);
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then(responseJson => {
        setShowErrorSummary(false);
        setPeptide({
          publications: peptide.publications.concat([responseJson])
        });
        setNewPubMedId("");
      });
    }

    function addPublicationError(response) {
      response.text().then(resp => {
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
    const publicationToBeDeleted = publications.find(i => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    setPeptide({ publications: publications });
  }

  function addURL() {
    var listUrls = peptide.urls;
    var urlEntered = csvToArray(newURL)[0];
    const urlExists = listUrls.find(i => i === urlEntered);

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

  const urlWidget = enableDelete => {
    return (
      <>
        {peptide.urls && peptide.urls.length > 0
          ? peptide.urls.map((url, index) => {
              return (
                <Row style={{ marginTop: "8px" }} key={index}>
                  <Col md={10}>
                    <Link
                      style={{ fontSize: "0.9em" }}
                      href={externalizeUrl(url)}
                      target="_blank"
                      rel="external noopener noreferrer"
                    >
                      {url}
                    </Link>
                  </Col>
                  {enableDelete && (
                    <Col style={{ marginTop: "2px", textAlign: "center" }} md={2}>
                      <FontAwesomeIcon
                        icon={["far", "trash-alt"]}
                        size="xs"
                        title="Delete Url"
                        className="caution-color table-btn"
                        onClick={() => {
                          const listUrls = peptide.urls;
                          listUrls.splice(index, 1);
                          setPeptide({ urls: listUrls });
                        }}
                      />
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
        if (activeStep === 1 && peptide.selectedPeptide !== "Unknown") {
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
        if (activeStep === 2) {
          return (
            <>
              <Form className="radioform2" validated={validate}>
                <Form.Group as={Row} controlId="name">
                  <FormLabel label="Name" className="required-asterik" />
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="name"
                      value={peptide.name}
                      onChange={handleChange}
                      isInValid={validate}
                      maxLength={100}
                      required
                    />
                    <Feedback message={"Name is required"} />
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
                      value={peptide.comment}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <span className="character-counter">
                      {peptide.comment && peptide.comment.length > 0 ? peptide.comment.length : ""}
                      /2000
                    </span>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="opensRing">
                  <FormLabel label={displayNames.linker.OPENS_RING} />
                  <Col md={4}>
                    <MultiToggle
                      options={opensRingOptions}
                      selectedOption={peptide.opensRing}
                      onSelectOption={value => setPeptide({ opensRing: value })}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="publications">
                  <FormLabel label="Publications" />
                  <Col md={4}>
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
                          placeholder="Enter a Pubmed ID and click +"
                          value={newPubMedId}
                          onChange={e => setNewPubMedId(e.target.value)}
                          maxLength={100}
                          onKeyDown={e => {
                            isValidNumber(e);
                          }}
                          onInput={e => {
                            numberLengthCheck(e);
                          }}
                        />
                      </Col>
                      <Col md={1}>
                        <Button variant="contained" onClick={addPublication} className="add-button">
                          +
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="urls">
                  <FormLabel label="URLs" />
                  <Col md={4}>
                    {urlWidget(true)}
                    <Row>
                      <Col md={10}>
                        <Form.Control
                          as="input"
                          name="urls"
                          placeholder="Enter URL and click +"
                          value={newURL}
                          onChange={e => {
                            setNewURL(e.target.value);
                            setInvalidUrls(false);
                          }}
                          maxLength={2048}
                          isInvalid={invalidUrls}
                        />
                        <Feedback message="Please check the url entered" />
                      </Col>
                      <Col md={1}>
                        <Button variant="contained" onClick={addURL} className="add-button">
                          +
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Form.Group>
              </Form>
            </>
          );
        }
      case 3:
        return (
          <Form className="radioform2">
            {Object.keys(reviewFields).map(key =>
              key === "sequence" && peptide.selectedPeptide === "Unknown" ? (
                ""
              ) : (
                <Form.Group as={Row} controlId={key} key={key}>
                  <FormLabel label={reviewFields[key].label} />
                  <Col md={6}>
                    <Form.Control
                      as={reviewFields[key].type === "textarea" ? "textarea" : "input"}
                      rows={key === "sequence" ? "15" : "4"}
                      name={key}
                      placeholder={"-"}
                      value={
                        key === "opensRing"
                          ? peptide[key] === 2
                            ? "Unknown"
                            : peptide[key] === 1
                            ? "Yes"
                            : "No"
                          : peptide[key]
                      }
                      disabled
                      className={key === "sequence" ? "sequence-text-area" : false}
                    />
                  </Col>
                </Form.Group>
              )
            )}

            <Form.Group as={Row} controlId="publications">
              <FormLabel label="Publications" />
              <Col md={4}>
                {peptide.publications && peptide.publications.length > 0
                  ? peptide.publications.map(pub => {
                      return <PublicationCard key={pub.pubmedId} {...pub} enableDelete={false} />;
                    })
                  : ""}
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="urls">
              <FormLabel label="Urls" />
              <Col md={4}>
                {peptide.urls && peptide.urls.length > 0 ? (
                  peptide.urls.map((url, index) => {
                    return (
                      <div style={{ marginTop: "8px" }} key={index}>
                        <Link
                          style={{ fontSize: "0.9em" }}
                          href={externalizeUrl(url)}
                          target="_blank"
                          rel="external noopener noreferrer"
                        >
                          {url}
                        </Link>
                        <br />
                      </div>
                    );
                  })
                ) : (
                  <div style={{ marginTop: "8px" }}>None</div>
                )}
              </Col>
            </Form.Group>
          </Form>
        );

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
    var peptideObj = {
      type: "PEPTIDE_LINKER",
      name: peptide.name,
      comment: peptide.comment,
      opensRing: peptide.opensRing,
      publications: peptide.publications,
      urls: peptide.urls,
      sequence: peptide.sequence
    };

    wsCall("addlinker", "POST", null, true, peptideObj, response => history.push("/peptides"), addPeptideFailure);

    function addPeptideFailure(response) {
      response.json().then(parsedJson => {
        setPageErrorsJson(parsedJson);
        setShowErrorSummary(true);
      });
    }
  }

  const isStepSkipped = step => {
    return peptide.selectedPeptide === "Unknown" && step === 1 && activeStep === 2;
  };

  return (
    <>
      <Helmet>
        <title>{head.addPeptide.title}</title>
        {getMeta(head.addPeptide)}
      </Helmet>

      <div className="page-container">
        <Title title="Add Peptide to Repository" />
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
        {getNavigationButtons("button - div text-center")}
        &nbsp; &nbsp;
        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="peptides"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
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
