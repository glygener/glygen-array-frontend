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
import { PublicationCard } from "../components/PublicationCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { csvToArray, isValidURL, externalizeUrl, isValidNumber, numberLengthCheck } from "../utils/commonUtils";
import { Button, Step, StepLabel, Stepper, Typography, makeStyles, Link } from "@material-ui/core";
import "../containers/AddLinker.css";
import { Source } from "../components/Source";

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

const AddProtein = props => {
  useEffect(props.authCheckAgent, []);

  const classes = useStyles();
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
  const history = useHistory();

  const proteinInitialState = {
    selectedProtein: "SequenceDefined",
    name: "",
    sequence: "",
    comment: "",
    uniProtId: "",
    pdbIds: [],
    publications: [],
    urls: [],
    source: "notSpecified",
    commercial: { vendor: "", catalogueNumber: "", batchId: "" },
    nonCommercial: { providerLab: "", batchId: "", method: "", sourceComment: "" }
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [protein, setProtein] = useReducer(reducer, proteinInitialState);

  const reviewFields = {
    name: { label: "Name", type: "text", length: 100 },
    sequence: { label: "Sequence", type: "textarea" },
    comment: { label: "Comments", type: "textarea", length: 10000 },
    uniProtId: { label: "UniProt Id", type: "text", length: 100 },
    pdbIds: { label: "PDB Ids", type: "text" },
    vendor: { label: "Vendor", type: "text" },
    catalogueNumber: { label: "Catalogue Number", type: "text" },
    commercialBatchId: { label: "Batch Id", type: "text" },
    providerLab: { label: "Provider Lab", type: "text" },
    nonCommercialBatchId: { label: "Batch Id", type: "text" },
    method: { label: "Method", type: "text" },
    sourceComment: { label: "Source Comments", type: "text" }
  };

  const sourceSelection = e => {
    const newValue = e.target.value;
    setProtein({ source: newValue });
  };

  const sourceChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    if (protein.source === "commercial") {
      if (name === "vendor") {
        setValidatedCommNonComm(false);
      }
      let comm = protein.commercial;
      comm[name] = newValue;
      setProtein({ [protein.commercial]: comm });
    } else {
      if (name === "providerLab") {
        setValidatedCommNonComm(false);
      }

      let nonComm = protein.nonCommercial;
      nonComm[name] = newValue;
      setProtein({ [protein.nonCommercial]: nonComm });
    }
  };

  const steps = getSteps();

  const handleNext = e => {
    setValidate(false);
    var stepIncrement = 1;

    if (activeStep === 0 && protein.selectedProtein === "Unknown") {
      stepIncrement += 1;
    } else if (activeStep === 1) {
      setValidatedSpecificDetails(true);
      if (protein.sequence === "") {
        return;
      } else {
        var seqError = validateSequence("", protein.sequence);
        setSequenceError(seqError);
        if (seqError !== "") {
          return;
        }
      }
    } else if (activeStep === 2) {
      let count = 0;

      if (protein.name === "") {
        setValidate(true);
        count++;
      }

      if (
        (protein.source === "commercial" && protein.commercial.vendor === "") ||
        (protein.source === "nonCommercial" && protein.nonCommercial.providerLab === "")
      ) {
        setValidatedCommNonComm(true);
        count++;
      }

      if (count > 0) {
        return;
      }
    } else if (e.currentTarget.innerText === "FINISH") {
      addProtein(e);
      return;
    }

    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const handleChange = e => {
    setValidate(false);

    const name = e.target.name;
    const newValue = e.target.value;

    setProtein({ [name]: newValue });
  };

  const handleBack = () => {
    setShowErrorSummary(false);
    setValidate(false);

    var stepDecrement = 1;

    if (activeStep === 1) {
      setValidate(false);
    }
    if (activeStep === 2) {
      if (protein.selectedProtein === "Unknown") {
        stepDecrement += 1;
      }
    }
    setActiveStep(prevActiveStep => prevActiveStep - stepDecrement);
  };

  const handleSelect = e => {
    const newValue = e.target.value;
    setProtein({ ...proteinInitialState, ...{ selectedProtein: newValue } });
  };

  function getSteps() {
    return ["Select the Protein Type", "Type Specific Protein Info", "Generic Protein Info", "Review and Add"];
  }
  function addPublication() {
    let publications = protein.publications;
    let pubmedExists = publications.find(i => i.pubmedId === parseInt(newPubMedId));

    if (!pubmedExists) {
      wsCall("getpublication", "GET", [newPubMedId], true, null, addPublicationSuccess, addPublicationError);
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then(responseJson => {
        setShowErrorSummary(false);
        setProtein({
          publications: protein.publications.concat([responseJson])
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

  function getSequenceFromUniprot(uniprotId) {
    setShowLoading(true);
    wsCall(
      "getsequencefromuniprot",
      "GET",
      [uniprotId],
      true,
      null,
      getSequenceFromUniprotSuccess,
      getSequenceFromUniprotError,
      { Accept: "text/plain" }
    );

    function getSequenceFromUniprotSuccess(response) {
      response.text().then(sequence => {
        setProtein({
          sequence: sequence
        });
      });
      setShowLoading(false);
      setValidatedSpecificDetails(false);
    }

    function getSequenceFromUniprotError(response) {
      response.text().then(function(text) {
        return text ? setPageErrorMessage(JSON.parse(text)) : "";
      });

      setShowLoading(false);
    }
  }

  function deletePublication(id, wscall) {
    const publications = protein.publications;
    const publicationToBeDeleted = publications.find(i => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    setProtein({ publications: publications });
  }

  function addURL() {
    var listUrls = protein.urls;
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

      setProtein({ urls: listUrls });
    }
    setNewURL("");
  }

  const urlWidget = enableDelete => {
    return (
      <>
        {protein.urls && protein.urls.length > 0
          ? protein.urls.map((url, index) => {
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
                          const listUrls = protein.urls;
                          listUrls.splice(index, 1);
                          setProtein({ urls: listUrls });
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
                  checked={protein.selectedProtein === "SequenceDefined"}
                />
                {displayNames.protein.SEQUENCE}
              </FormCheck.Label>
            </FormCheck>

            <FormCheck>
              <FormCheck.Label>
                <FormCheck.Input
                  type="radio"
                  value="Unknown"
                  onChange={handleSelect}
                  checked={protein.selectedProtein === "Unknown"}
                />
                {displayNames.protein.UNKNOWN}
              </FormCheck.Label>
            </FormCheck>
          </Form>
        );
      case 1:
        if (activeStep === 1 && protein.selectedProtein !== "Unknown") {
          return (
            <>
              <Form.Group as={Row} controlId="uniProtId">
                <FormLabel label="UniProt Id" />
                <Col md={4}>
                  <Form.Control
                    type="text"
                    name="uniProtId"
                    placeholder="UniProt Id"
                    value={protein.uniProtId}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </Col>
                {protein.uniProtId !== "" && (
                  <Button
                    variant="contained"
                    onClick={() => getSequenceFromUniprot(encodeURIComponent(protein.uniProtId.trim()))}
                    className="get-btn "
                  >
                    Get Sequence from Uniprot
                  </Button>
                )}
              </Form.Group>
              <Form.Group as={Row} controlId="pdbIds">
                <FormLabel label="PDB Ids" />
                <Col md={4}>
                  <Form.Control
                    type="text"
                    name="pdbIds"
                    placeholder="PDB Ids separated by ';'"
                    value={protein.pdbIds.join(";")}
                    onChange={e =>
                      setProtein({
                        pdbIds: csvToArray(e.target.value)
                      })
                    }
                    maxLength={100}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} controlId="sequence">
                <FormLabel label="Sequence" className="required-asterik" />
                <Col md={6}>
                  <Form.Control
                    as="textarea"
                    rows="15"
                    name="sequence"
                    placeholder="Sequence"
                    value={protein.sequence}
                    onChange={handleChange}
                    className="sequence-text-area"
                    isInvalid={validatedSpecificDetails && (protein.sequence === "" || sequenceError !== "")}
                    spellCheck="false"
                    maxLength={10000}
                  />
                  {protein.sequence === "" && <Feedback message="Sequence is required"></Feedback>}
                  {sequenceError !== "" && <Feedback message={sequenceError}></Feedback>}
                </Col>
              </Form.Group>
            </>
          );
        }

      case 2:
        if (activeStep === 2) {
          return (
            <>
              <Form className="radioform2" validated={validate && validatedCommNonComm}>
                <Form.Group as={Row} controlId="name">
                  <FormLabel label="Name" className="required-asterik" />
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="name"
                      value={protein.name}
                      onChange={handleChange}
                      isInvalid={validate}
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
                      value={protein.comment}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <span className="character-counter">
                      {protein.comment && protein.comment.length > 0 ? protein.comment.length : ""}
                      /2000
                    </span>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="publications">
                  <FormLabel label="Publications" />
                  <Col md={4}>
                    {protein.publications.map((pub, index) => {
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
                <Row>
                  <FormLabel label="Source" />

                  <Col md={{ span: 6 }} style={{ marginLeft: "20px" }}>
                    <Form.Check.Label>
                      <Form.Check.Input
                        type="radio"
                        value={"commercial"}
                        label={"Commercial"}
                        onChange={sourceSelection}
                        checked={protein.source === "commercial"}
                      />
                      {"Commercial"}&nbsp;&nbsp;&nbsp;&nbsp;
                    </Form.Check.Label>
                    &nbsp;&nbsp; &nbsp;&nbsp;
                    <Form.Check.Label>
                      <Form.Check.Input
                        type="radio"
                        label={"Non Commercial"}
                        value={"nonCommercial"}
                        onChange={sourceSelection}
                        checked={protein.source === "nonCommercial"}
                      />
                      {"Non Commercial"}&nbsp;&nbsp;&nbsp;&nbsp;
                    </Form.Check.Label>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Form.Check.Label>
                      <Form.Check.Input
                        type="radio"
                        value={"notSpecified"}
                        label={"Not Specified"}
                        onChange={sourceSelection}
                        checked={protein.source === "notSpecified"}
                      />
                      {"Not Specified"}
                    </Form.Check.Label>
                  </Col>
                </Row>
                &nbsp;&nbsp;&nbsp;
                {protein.source === "commercial" ? (
                  <Source
                    isCommercial
                    commercial={protein.commercial}
                    validate={validatedCommNonComm}
                    sourceChange={sourceChange}
                  />
                ) : (
                  protein.source === "nonCommercial" && (
                    <Source
                      isNonCommercial
                      nonCommercial={protein.nonCommercial}
                      validate={validatedCommNonComm}
                      sourceChange={sourceChange}
                    />
                  )
                )}
              </Form>
            </>
          );
        }
      case 3:
        return (
          <Form className="radioform2">
            {Object.keys(reviewFields).map(key =>
              ((key === "sequence" || key === "uniProtId" || key === "pdbIds") &&
                protein.selectedProtein === "Unknown") ||
              (protein.source !== "commercial" &&
                (key === "vendor" || key === "catalogueNumber" || key === "commercialBatchId")) ||
              (protein.source !== "nonCommercial" &&
                (key === "providerLab" ||
                  key === "method" ||
                  key === "nonCommercialBatchId" ||
                  key === "sourceComment")) ||
              (protein.source === "notSpecified" &&
                (key === "vendor" ||
                  key === "catalogueNumber" ||
                  key === "commercialBatchId" ||
                  key === "nonCommercialBatchId" ||
                  key === "providerLab" ||
                  key === "method" ||
                  key === "sourceComment")) ? (
                ""
              ) : (
                <Form.Group as={Row} controlId={key} key={key}>
                  <FormLabel label={reviewFields[key].label} />
                  <Col md={6}>
                    <Form.Control
                      as={reviewFields[key].type === "textarea" ? "textarea" : "input"}
                      rows={key === "sequence" ? "15" : "4"}
                      name={key}
                      placeholder={""}
                      value={protein[key]}
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
                {protein.publications && protein.publications.length > 0
                  ? protein.publications.map(pub => {
                      return <PublicationCard key={pub.pubmedId} {...pub} enableDelete={false} />;
                    })
                  : ""}
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="urls">
              <FormLabel label="Urls" />
              <Col md={4}>
                {protein.urls && protein.urls.length > 0 ? (
                  protein.urls.map((url, index) => {
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

  function addProtein(e) {
    var source = {
      type: "NOTRECORDED"
    };

    if (protein.source === "commercial") {
      source.type = "COMMERCIAL";
      source.vendor = protein.commercial.vendor;
      source.catalogueNumber = protein.commercial.catalogueNumber;
      source.batchId = protein.commercial.batchId;
    } else if (protein.source === "nonCommercial") {
      source.type = "NONCOMMERCIAL";
      source.batchId = protein.commercial.batchId;
      source.providerLab = protein.nonCommercial.providerLab;
      source.method = protein.nonCommercial.method;
      source.comment = protein.nonCommercial.sourceComment;
    }

    var proteinObj = {
      type: "PROTEIN",
      name: protein.name,
      comment: protein.comment,
      publications: protein.publications,
      urls: protein.urls,
      sequence: protein.sequence,
      source: source
    };

    wsCall("addlinker", "POST", null, true, proteinObj, response => history.push("/proteins"), addProteinFailure);

    function addProteinFailure(response) {
      response.json().then(parsedJson => {
        setPageErrorsJson(parsedJson);
        setShowErrorSummary(true);
      });
    }
  }

  const isStepSkipped = step => {
    return protein.selectedProtein === "Unknown" && step === 1 && activeStep === 2;
  };

  return (
    <>
      <Helmet>
        <title>{head.addProtein.title}</title>
        {getMeta(head.addProtein)}
      </Helmet>

      <div className="page-container">
        <Title title="Add Protein to Repository" />
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
            form="linkers"
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

AddProtein.propTypes = {};

export { AddProtein };
