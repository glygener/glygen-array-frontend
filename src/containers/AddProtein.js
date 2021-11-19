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
import { csvToArray, isValidURL, externalizeUrl, isValidNumber, numberLengthCheck } from "../utils/commonUtils";
import { Button, Step, StepLabel, Stepper, Typography, makeStyles } from "@material-ui/core";
import "../containers/AddLinker.css";
import { Source } from "../components/Source";
import { ViewSourceInfo } from "../components/ViewSourceInfo";
import moleculeExamples from "../appData/moleculeExamples";
import ExampleExploreControl from "../components/ExampleExploreControl";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { Link } from "react-router-dom";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import { BlueRadio } from "../components/FormControls";
import { Image } from "react-bootstrap";
import plusIcon from "../images/icons/plus.svg";

const AddProtein = (props) => {
  useEffect(props.authCheckAgent, []);

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
    nonCommercial: { providerLab: "", batchId: "", method: "", sourceComment: "" },
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [protein, setProtein] = useReducer(reducer, proteinInitialState);

  const reviewFields = {
    name: { label: "Name", type: "text", length: 100 },
    sequence: { label: "Sequence", type: "textarea" },
    comment: { label: "Comments", type: "textarea", length: 10000 },
    uniProtId: { label: "UniProt Id", type: "text", length: 100 },
    pdbIds: { label: "PDB Ids", type: "text" },
  };

  const sourceSelection = (e) => {
    const newValue = e.target.value;
    setProtein({ source: newValue });
  };

  const sourceChange = (e) => {
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
    if (activeStep === 1) {
      setDisableReset(true);
    }
    if (activeStep === 2) {
      setDisableResetSecondStep(true);
    }
  };

  const steps = getSteps();

  const handleNext = (e) => {
    setValidate(false);
    var stepIncrement = 1;

    if (activeStep === 0 && protein.selectedProtein === "Unknown") {
      stepIncrement += 1;
    } else if (activeStep === 1) {
      setValidatedSpecificDetails(true);
      if (protein.sequence === "") {
        return;
      } else {
        var seqError = validateSequence("", protein.sequence.trim());
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
    } else if (e.currentTarget.innerText === "SUBMIT") {
      addProtein(e);
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + stepIncrement);
  };

  const handleChange = (e) => {
    setValidate(false);
    const name = e.target.name;
    const newValue = e.target.value;

    if ((name === "uniProtId" || name === "sequence") && newValue !== "") {
      setShowErrorSummary(false);
    }
    setProtein({ [name]: newValue.trim() });
    if (activeStep === 1) {
      setDisableReset(true);
    }
    if (activeStep === 2) {
      setDisableResetSecondStep(true);
    }
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
    setActiveStep((prevActiveStep) => prevActiveStep - stepDecrement);
  };

  const handleSelect = (e) => {
    const newValue = e.target.value;
    setProtein({ ...proteinInitialState, ...{ selectedProtein: newValue } });
  };

  const clearFields = () => {
    if (activeStep === 1) {
      setProtein({ ...proteinInitialState, ...{ selectedPeptide: protein.selectedPeptide } });

      setDisableReset(false);
    }
    if (activeStep === 2) {
      setProtein({
        ...proteinInitialState,
        commercial: proteinInitialState.commercial,
        nonCommercial: proteinInitialState.nonCommercial,
        ...{
          selectedPeptide: protein.selectedPeptide,
          sequence: protein.sequence,
          source: protein.source,
          uniProtId: protein.uniProtId,
          pdbIds: protein.pdbIds,
        },
      });
      setNewURL("");
      setNewPubMedId("");
      setDisableResetSecondStep(false);
    }
  };

  function getSteps() {
    return ["Protein Type", "Type Specific Information", "Generic Information", "Review and Add"];
  }
  function getPeptideType(typeIndex) {
    switch (typeIndex) {
      case "SequenceDefined":
        return `${displayNames.protein.SEQUENCE}`;
      case "Unknown":
        return `${displayNames.protein.UNKNOWN}`;
      default:
        return "Unknown typeIndex";
    }
  }
  function getStepLabel(stepIndex) {
    switch (stepIndex) {
      case 0:
        return "Select the Protein Type";
      case 1:
        return `Add Type Specific Protein Information (${getPeptideType(protein.selectedProtein)})`;
      case 2:
        return `Add Generic Protein Information (${getPeptideType(protein.selectedProtein)})`;
      case 3:
        return "Review and Add Protein to Repository";
      default:
        return "Unknown stepIndex";
    }
  }
  function addPublication() {
    let publications = protein.publications;
    let pubmedExists = publications.find((i) => i.pubmedId === parseInt(newPubMedId));

    if (!pubmedExists) {
      wsCall("getpublication", "GET", [newPubMedId], true, null, addPublicationSuccess, addPublicationError);
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then((responseJson) => {
        setShowErrorSummary(false);
        setProtein({
          publications: protein.publications.concat([responseJson]),
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
      response.text().then((sequence) => {
        setProtein({
          sequence: sequence,
        });
      });
      setShowLoading(false);
      setValidatedSpecificDetails(false);
    }

    function getSequenceFromUniprotError(response) {
      let status = response.status;

      response.text().then(function (text) {
        if (text) {
          setPageErrorMessage(JSON.parse(text));
        } else {
          if (status === 406) {
            setPageErrorMessage("Not a valid Input. Please try again.");
            setShowErrorSummary(true);
          }
        }
      });

      setShowLoading(false);
    }
  }

  function deletePublication(id, wscall) {
    const publications = protein.publications;
    const publicationToBeDeleted = publications.find((i) => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    setProtein({ publications: publications });
  }

  function addURL() {
    var listUrls = protein.urls;
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

      setProtein({ urls: listUrls });
    }
    setNewURL("");
  }

  const urlWidget = (enableDelete) => {
    return (
      <>
        {protein.urls && protein.urls.length > 0
          ? protein.urls.map((url, index) => {
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
                            size="lg"
                            title="Delete URL"
                            className="caution-color tbl-icon-btn"
                            onClick={() => {
                              const listUrls = protein.urls;
                              listUrls.splice(index, 1);
                              setProtein({ urls: listUrls });
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
                <RadioGroup name="peptide-type" onChange={handleSelect} value={protein.selectedProtein}>
                  {/* SEQUENCE_DEFINED */}
                  <FormControlLabel
                    value="SequenceDefined"
                    control={<BlueRadio />}
                    label={displayNames.protein.SEQUENCE}
                  />
                  {/* UNKNOWN */}
                  <FormControlLabel value="Unknown" control={<BlueRadio />} label={displayNames.protein.UNKNOWN} />
                </RadioGroup>
              </Col>
            </Row>
          </Form>
        );
      case 1:
        if (activeStep === 1 && protein.selectedProtein !== "Unknown") {
          return (
            <>
              <Form.Group as={Row} controlId="uniProtId">
                <Form.Label column xs={12} md={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                  <strong>UniProt ID</strong>
                </Form.Label>
                <Col xs={12} lg={9}>
                  <Form.Control
                    type="text"
                    name="uniProtId"
                    placeholder="Enter UniProt ID"
                    value={protein.uniProtId}
                    onChange={handleChange}
                    maxLength={100}
                  />

                  {protein.uniProtId !== "" && (
                    <Button
                      variant="contained"
                      onClick={() => getSequenceFromUniprot(encodeURIComponent(protein.uniProtId.trim()))}
                      className="gg-btn-blue-reg btn-to-lower mt-3"
                    >
                      Insert Information from UniProt
                    </Button>
                  )}
                </Col>
              </Form.Group>
              <Form.Group as={Row} controlId="pdbIds">
                <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                  <strong>PDB IDs</strong>
                </Form.Label>
                <Col xs={12} lg={9}>
                  <Form.Control
                    type="text"
                    name="pdbIds"
                    placeholder="Enter PDB IDs separated by ';'"
                    value={protein.pdbIds.join(";")}
                    onChange={(e) => {
                      setShowErrorSummary(false);
                      setProtein({
                        pdbIds: csvToArray(e.target.value),
                      });
                    }}
                    maxLength={100}
                  />
                </Col>
              </Form.Group>
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
                    placeholder="Enter Protein Sequence"
                    value={protein.sequence}
                    onChange={handleChange}
                    className="sequence-text-area"
                    isInvalid={validatedSpecificDetails && (protein.sequence === "" || sequenceError !== "")}
                    spellCheck="false"
                    maxLength={10000}
                  />
                  {protein.sequence === "" && <Feedback message="Sequence is required"></Feedback>}
                  {sequenceError !== "" && <Feedback message={sequenceError}></Feedback>}
                  <Row>
                    <Col className="gg-align-left">
                      <ExampleExploreControl
                        setInputValue={funcSetInputValues}
                        inputValue={moleculeExamples.protein.examples}
                      />
                    </Col>
                    <Col className="text-right text-muted">
                      {protein.sequence && protein.sequence.length > 0 ? protein.sequence.length : "0"}
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
              <Form validated={validate && validatedCommNonComm}>
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
                      placeholder="Enter Name of the protein"
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
                  <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                    <strong>Comment</strong>
                  </Form.Label>
                  <Col xs={12} lg={9}>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="comment"
                      placeholder="Enter Comment"
                      value={protein.comment}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <div className="text-right text-muted">
                      {protein.comment && protein.comment.length > 0 ? protein.comment.length : "0"}
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
                          placeholder="Enter URL and click +"
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
                    <RadioGroup row name="protein-type" onChange={sourceSelection} value={protein.source}>
                      {/* Commercial */}
                      <FormControlLabel value="commercial" control={<BlueRadio />} label="Commercial" />
                      {/* Non Commercial */}
                      <FormControlLabel value="nonCommercial" control={<BlueRadio />} label="Non Commercial" />
                      {/* Not Specified */}
                      <FormControlLabel value="notSpecified" control={<BlueRadio />} label="Not Specified" />
                    </RadioGroup>
                  </Col>
                </Row>

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
                {/* Bottom Reset / Clear fields  Button */}
                <div className="text-center mb-2 mt-2">
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
              (key === "sequence" || key === "uniProtId" || key === "pdbIds") &&
              protein.selectedProtein === "Unknown" ? (
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
                      value={protein[key]}
                      disabled
                      className={key === "sequence" ? "sequence-text-area" : false}
                    />
                  </Col>
                </Form.Group>
              )
            )}
            {protein.urls && protein.urls.length > 0 && (
              <Form.Group as={Row} controlId="urls">
                <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                  <strong>URLs</strong>
                </Form.Label>
                <Col xs={12} lg={9}>
                  {protein.urls.map((url, index) => {
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
            {protein.publications && protein.publications.length > 0 && (
              <Form.Group as={Row} controlId="publications">
                <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                  <strong>Publication</strong>
                </Form.Label>
                <Col xs={12} lg={9}>
                  {protein.publications && protein.publications.length > 0
                    ? protein.publications.map((pub) => {
                        return (
                          <diiv>
                            <PublicationCard key={pub.pubmedId} {...pub} enableDelete={false} />
                          </diiv>
                        );
                      })
                    : ""}
                </Col>
              </Form.Group>
            )}

            <ViewSourceInfo
              source={protein.source}
              commercial={protein.commercial}
              nonCommercial={protein.nonCommercial}
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
        <Link to="/proteins">
          <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Proteins</Button>
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
   * Function to set protein id value.
   * @param {string} addProteinSequenceSuccess - input protein id value.
   **/
  function funcSetInputValues(value) {
    setProtein({ sequence: value });
    if (activeStep === 1) {
      setDisableReset(true);
    }
    if (activeStep === 2) {
      setDisableResetSecondStep(true);
    }
  }

  function addProtein(e) {
    let unknownProtien = protein.selectedProtein === "Unknown" ? true : false;

    var source = {
      type: "NOTRECORDED",
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
      sequence: protein.sequence.trim(),
      source: source,
    };

    wsCall(
      "addlinker",
      "POST",
      { unknown: unknownProtien },
      true,
      proteinObj,
      (response) => history.push("/proteins"),
      addProteinFailure
    );

    function addProteinFailure(response) {
      response.json().then((parsedJson) => {
        setPageErrorsJson(parsedJson);
        setShowErrorSummary(true);
      });
    }
  }

  const isStepSkipped = (step) => {
    return protein.selectedProtein === "Unknown" && step === 1 && (activeStep === 2 || activeStep === 3);
  };

  return (
    <>
      <Helmet>
        <title>{head.addProtein.title}</title>
        {getMeta(head.addProtein)}
      </Helmet>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Add Protein to Repository"
            subTitle="Please provide the information for the new protein."
          />
          <Card>
            <Card.Body>
              <Stepper className="steper-responsive text-center" activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => {
                  const stepProps = {};
                  const labelProps = {};
                  if (isStepSkipped(index)) {
                    labelProps.optional = <Typography variant="caption">Unknown Protein</Typography>;
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

AddProtein.propTypes = {};

export { AddProtein };
