import React, { useEffect, useState, useReducer } from "react";
import "../containers/AddLinker.css";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { Stepper, StepLabel, Step, Typography, Button, Link } from "@material-ui/core";
import { Form, Row, Col, FormCheck } from "react-bootstrap";
import { FormLabel, Feedback, Title } from "../components/FormControls";
import MultiToggle from "react-multi-toggle";
import { wsCall } from "../utils/wsUtils";
import { csvToArray, isValidURL, externalizeUrl, isValidNumber, numberLengthCheck } from "../utils/commonUtils";
import { Loading } from "../components/Loading";
import { PublicationCard } from "../components/PublicationCard";
import { head, getMeta } from "../utils/head";
import { useHistory } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { validateSequence } from "../utils/sequence";
import displayNames from "../appData/displayNames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AddLinker = props => {
  useEffect(props.authCheckAgent, []);

  const [activeStep, setActiveStep] = useState(0);
  const [classifications, setClassifications] = useState([]);
  const [disableClassification, setDisableClassification] = useState(false);
  const [disablePubChemFields, setDisablePubChemFields] = useState(false);
  const [disableReset, setDisableReset] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [newPubMedId, setNewPubMedId] = useState("");
  const [validatedSpecificDetails, setValidatedSpecificDetails] = useState(false);
  const [invalidUrls, setInvalidUrls] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [sequenceError, setSequenceError] = useState("");
  const [newURL, setNewURL] = useState("");
  const history = useHistory();

  const linkerAddInitState = {
    pubChemId: "",
    uniProtId: "",
    pdbIds: [],
    classification: null,
    inChiKey: "",
    inChiSequence: "",
    iupacName: "",
    imageURL: "",
    molecularFormula: "",
    canonicalSmiles: "",
    isomericSmiles: "",
    name: "",
    comment: "",
    description: "",
    mass: "",
    sequence: "",
    opensRing: 2,
    publications: [],
    urls: []
  };

  const [linkerAddState, setLinkerAddState] = useReducer((oldState, newState) => ({ ...oldState, ...newState }), {
    ...linkerAddInitState,
    ...{ type: "SMALLMOLECULE_LINKER" }
  });

  const reviewFields = {
    type: { label: "Linker Type", type: "text" },
    pubChemId: { label: "PubChem Compound CID", type: "text", length: 12 },
    classification: { label: "Classification", type: "text" },
    inChiKey: { label: "InChI Key", type: "text" },
    inChiSequence: { label: "InChI", type: "textarea" },
    iupacName: { label: "IUPAC Name", type: "text" },
    molecularFormula: { label: "Molecular Formula", type: "text" },
    canonicalSmiles: { label: "Canonical SMILES", type: "text" },
    isomericSmiles: { label: "Isomeric SMILES", type: "text" },
    name: { label: "Name", type: "text", length: 100 },
    comment: { label: "Comments", type: "textarea", length: 10000 },
    description: { label: "Description", type: "textarea", length: 250 },
    mass: { label: "Mass", type: "text" },
    uniProtId: { label: "UniProt Id", type: "text", length: 100 },
    pdbIds: { label: "PDB Ids", type: "text" },
    sequence: { label: "Sequence", type: "textarea" },
    opensRing: { label: "Opens Ring", type: "text" }
  };

  const steps = ["Select Linker Type", "Type Specific Linker Info", "Generic Linker Info", "Review and Add"];

  const linkerTypes = {
    SMALLMOLECULE_LINKER: displayNames.linker.SMALLMOLECULE_LINKER,
    PROTEIN_LINKER: displayNames.linker.PROTEIN_LINKER,
    PEPTIDE_LINKER: displayNames.linker.PEPTIDE_LINKER
  };

  const smLinkerPubChemFields = {
    inChiKey: { label: displayNames.linker.INCHIKEY, type: "text", length: 27 },
    inChiSequence: {
      label: displayNames.linker.INCHI_SEQUENCE,
      type: "textarea",
      length: 10000,
      enableCharacterCounter: true
    },
    iupacName: { label: "IUPAC Name", type: "text", length: 2000 },
    mass: { label: "Mass", type: "text" },
    molecularFormula: { label: "Molecular Formula", type: "text", length: 256 },
    isomericSmiles: { label: displayNames.linker.ISOMERIC_SMILES, type: "text", length: 10000 },
    canonicalSmiles: { label: displayNames.linker.CANONICAL_SMILES, type: "text", length: 10000 }
  };

  const commonFields = {
    name: { label: "Name", type: "text", length: 100 },
    comment: { label: "Comments", type: "textarea", length: 2000, enableCharacterCounter: true },
    description: { label: "Description", type: "textarea", length: 250, enableCharacterCounter: true }
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
    setDisableReset(true);
    const name = e.target.name;
    const newValue = e.target.value;
    setLinkerAddState({ [name]: newValue });
  };

  const handleTypeSelect = e => {
    setDisableReset(true);
    const newValue = e.target.value;
    setLinkerAddState({ ...linkerAddInitState, ...{ type: newValue } });
    setDisableClassification(false);
    setDisablePubChemFields(false);
  };

  const handleClassSelect = e => {
    const select = e.target;
    const chebiIdValue = select.value;
    const classificationValue = select.options[select.selectedIndex].text;
    setLinkerAddState({
      classification: {
        chebiId: chebiIdValue,
        classification: classificationValue
      }
    });
    setDisableReset(true);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      populateClassifications();
      setValidatedSpecificDetails(false);
    } else if (activeStep === 1) {
      setValidatedSpecificDetails(true);
      if (
        linkerAddState.type === "SMALLMOLECULE_LINKER" &&
        (linkerAddState.classification == null || linkerAddState.classification.chebiId === "0")
      ) {
        return;
      }
      if (
        (linkerAddState.type === "PROTEIN_LINKER" || linkerAddState.type === "PEPTIDE_LINKER") &&
        linkerAddState.sequence === ""
      ) {
        return;
      } else {
        if (!disablePubChemFields) {
          if (linkerAddState.pubChemId !== "") {
            populateLinkerDetails(encodeURIComponent(linkerAddState.pubChemId.trim()));
          } else if (linkerAddState.canonicalSmiles) {
            populateLinkerDetails(encodeURIComponent(linkerAddState.canonicalSmiles.trim()));
          } else if (linkerAddState.inChiKey) {
            populateLinkerDetails(encodeURIComponent(linkerAddState.inChiKey.trim()));
          }
        }

        var seqError = validateSequence(linkerAddState.type, linkerAddState.sequence);
        setSequenceError(seqError);
        if (seqError !== "") {
          return;
        }
      }
    } else if (activeStep === 2) {
      if (invalidUrls) {
        return;
      }
      linkerAddState.urls && linkerAddState.urls.length > 0 && removeEmptyElementsAtEnd(linkerAddState.urls);
      linkerAddState.pdbIds && linkerAddState.pdbIds.length > 0 && removeEmptyElementsAtEnd(linkerAddState.pdbIds);
    } else if (activeStep === 3) {
      addLinker();
      return;
    }
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    setShowErrorSummary(false);
  };

  const urlWidget = enableDelete => {
    return (
      <>
        {linkerAddState.urls && linkerAddState.urls.length > 0
          ? linkerAddState.urls.map((url, index) => {
              return (
                <Row style={{ marginTop: "8px" }} key={index}>
                  <Col>
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
                    <Col style={{ marginTop: "2px" }}>
                      <FontAwesomeIcon
                        icon={["far", "trash-alt"]}
                        size="xs"
                        title="Delete Url"
                        className="caution-color table-btn"
                        onClick={() => {
                          const listUrls = linkerAddState.urls;
                          listUrls.splice(index, 1);
                          setLinkerAddState({ urls: listUrls });
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

  function deletePublication(id, wscall) {
    const publications = linkerAddState.publications;
    const publicationToBeDeleted = publications.find(i => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    setLinkerAddState({ publications: publications });
  }

  function addURL() {
    var listUrls = linkerAddState.urls;
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

      setLinkerAddState({ urls: listUrls });
    }
    setNewURL("");
  }

  function populateClassifications() {
    wsCall(
      "linkerclassifications",
      "GET",
      null,
      true,
      null,
      populateClassificationsSuccess,
      populateClassificationsError
    );

    function populateClassificationsSuccess(response) {
      response.json().then(responseJson => {
        var classificationSelectOption = {
          chebiId: undefined,
          classification: "Select Classification"
        };
        responseJson.splice(0, 0, classificationSelectOption);
        setClassifications(responseJson);
        setLinkerAddState({ classification: null });
      });
    }

    function populateClassificationsError() {
      console.log("Classification fetch error");
    }
  }

  function populateLinkerDetails(pubChemId) {
    setShowLoading(true);
    wsCall(
      "linkerfrompubchem",
      "GET",
      [pubChemId],
      true,
      null,
      populateLinkerDetailsSuccess,
      populateLinkerDetailsError
    );

    function populateLinkerDetailsSuccess(response) {
      response.json().then(responseJson => {
        setLinkerAddState({
          type: responseJson.type,
          pubChemId: responseJson.pubChemId,
          classification: responseJson.classification,
          inChiKey: responseJson.inChiKey,
          inChiSequence: responseJson.inChiSequence,
          iupacName: responseJson.iupacName,
          name: responseJson.iupacName,
          imageURL: responseJson.imageURL,
          molecularFormula: responseJson.molecularFormula,
          isomericSmiles: responseJson.isomericSmiles,
          canonicalSmiles: responseJson.smiles,
          mass: responseJson.mass,
          urls: responseJson.urls
        });

        if (responseJson.classification) {
          setClassifications([responseJson.classification]);
          setDisableClassification(true);
        }
        setDisablePubChemFields(true);
      });

      setDisablePubChemFields(true);
      setShowLoading(false);
    }

    function populateLinkerDetailsError(response) {
      response.json().then(resp => {
        console.log(resp);
        setPageErrorsJson(resp);
        setShowErrorSummary(true);
      });
      setShowLoading(false);
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
        setLinkerAddState({
          sequence: sequence
        });
      });
      setShowLoading(false);
      setValidatedSpecificDetails(false);
    }

    function getSequenceFromUniprotError(response) {
      response.text().then(function(text) {
        return text ? console.log(JSON.parse(text)) : "helo";
        // setPageErrorsJson(text);
        // setShowErrorSummary(true);
      });

      console.log("Sequence fetch error");
      setShowLoading(false);
    }
  }

  function addPublication() {
    let publications = linkerAddState.publications;
    let pubmedExists = publications.find(i => i.pubmedId === parseInt(newPubMedId));

    if (!pubmedExists) {
      wsCall("getpublication", "GET", [newPubMedId], true, null, addPublicationSuccess, addPublicationError);
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then(responseJson => {
        setShowErrorSummary(false);
        setLinkerAddState({
          publications: linkerAddState.publications.concat([responseJson])
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

  function addLinker() {
    var linkerObj = {
      type: linkerAddState.type,
      name: linkerAddState.name,
      comment: linkerAddState.comment,
      description: linkerAddState.description,
      opensRing: linkerAddState.opensRing,
      publications: linkerAddState.publications,
      urls: linkerAddState.urls
    };

    if (linkerAddState.type === "SMALLMOLECULE_LINKER") {
      linkerObj.pubChemId = linkerAddState.pubChemId;
      linkerObj.classification = linkerAddState.classification;
      linkerObj.inChiKey = linkerAddState.inChiKey;
      linkerObj.inChiSequence = linkerAddState.inChiSequence;
      linkerObj.iupacName = linkerAddState.iupacName;
      linkerObj.mass = linkerAddState.mass;
      linkerObj.molecularFormula = linkerAddState.molecularFormula;
      linkerObj.smiles = linkerAddState.canonicalSmiles;
      linkerObj.isomericSmiles = linkerAddState.isomericSmiles;
    } else if (linkerAddState.type === "PROTEIN_LINKER") {
      linkerObj.uniProtId = linkerAddState.uniProtId;
      linkerObj.pdbIds = linkerAddState.pdbIds;
      linkerObj.sequence = linkerAddState.sequence;
    } else {
      linkerObj.sequence = linkerAddState.sequence;
    }

    wsCall("addlinker", "POST", null, true, linkerObj, addLinkerSuccess, addLinkerError);

    function addLinkerSuccess() {
      history.push("/linkers");
    }

    function addLinkerError(response) {
      response.json().then(responseJson => {
        console.log(responseJson);
        setPageErrorsJson(responseJson);
        setShowErrorSummary(true);
      });
    }
  }

  function removeEmptyElementsAtEnd(arr) {
    if (arr.length > 0 && arr[arr.length - 1] === "") {
      arr.pop();
    }
  }

  function getReviewDisplay(field, value) {
    switch (field) {
      case "type":
        return linkerTypes[value];
      case "classification":
        return value ? value.classification : "-";
      case "opensRing":
        return value === 2 ? "Unknown" : value === 1 ? "Yes" : "No";
      case "pdbIds":
        return value.join(", ");
      default:
        return [value];
    }
  }

  function clearPubChemFields() {
    setLinkerAddState({
      ...linkerAddInitState,
      ...{ type: "SMALLMOLECULE_LINKER" }
    });

    populateClassifications();
    setDisableClassification(false);
    setDisablePubChemFields(false);
    setShowErrorSummary(false);
    setDisableReset(false);
    setPageErrorsJson({});
    setValidatedSpecificDetails(false);
  }

  return (
    <>
      <Helmet>
        <title>{head.addLinker.title}</title>
        {getMeta(head.addLinker)}
      </Helmet>
      <div className="page-container">
        <Title title="Add Linker to Repository" />

        <Stepper activeStep={activeStep}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div>
          <div>
            <div className="button-div text-center">
              <Button disabled={activeStep === 0} variant="contained" onClick={handleBack} className="stepper-button">
                Back
              </Button>
              <Button variant="contained" onClick={handleNext} className="stepper-button">
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>

            {showErrorSummary === true && (
              <ErrorSummary
                show={showErrorSummary}
                form="linkers"
                errorMessage={pageErrorMessage}
                errorJson={pageErrorsJson}
              />
            )}

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
          </div>
        </div>
      </div>

      <Loading show={showLoading} />
    </>
  );

  function getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <Form className="radioform">
            {Object.keys(linkerTypes).map(key => {
              return (
                <FormCheck key={key} className="line-break-2">
                  <FormCheck.Label>
                    <FormCheck.Input
                      type="radio"
                      value={key}
                      onChange={handleTypeSelect}
                      checked={linkerAddState.type === key}
                    />
                    {linkerTypes[key]}
                  </FormCheck.Label>
                </FormCheck>
              );
            })}
          </Form>
        );
      case 1:
        return (
          <>
            <Form className="radioform1">
              {linkerAddState.type === "SMALLMOLECULE_LINKER" && (
                <>
                  <Form.Group as={Row} controlId="pubChemId">
                    <FormLabel label="PubChem Compound CID" />
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        name="pubChemId"
                        placeholder="PubChem Compound CID"
                        value={linkerAddState.pubChemId}
                        onChange={handleChange}
                        disabled={disablePubChemFields}
                        onKeyDown={e => {
                          isValidNumber(e);
                        }}
                        maxLength={12}
                        onInput={e => {
                          numberLengthCheck(e);
                        }}
                      />
                    </Col>
                    {linkerAddState.pubChemId !== "" && !disablePubChemFields && (
                      <Button
                        variant="contained"
                        onClick={() => populateLinkerDetails(encodeURIComponent(linkerAddState.pubChemId.trim()))}
                        className="get-btn "
                      >
                        Get Details from PubChem
                      </Button>
                    )}
                  </Form.Group>
                  <Form.Group as={Row} controlId="classification">
                    <FormLabel
                      label="Classification"
                      {...(!disablePubChemFields && { className: "required-asterik" })}
                    />
                    <Col md={4}>
                      <Form.Control
                        as="select"
                        name="classification"
                        placeholder="classification"
                        value={linkerAddState.classification ? linkerAddState.classification.chebiId : 0}
                        onChange={handleClassSelect}
                        disabled={disableClassification}
                        isInvalid={
                          validatedSpecificDetails &&
                          (linkerAddState.classification == null || linkerAddState.classification.chebiId === "0")
                        }
                      >
                        {classifications.map((option, index) => {
                          return (
                            <option key={index} value={option.chebiId || 0}>
                              {option.classification}
                            </option>
                          );
                        })}
                      </Form.Control>
                      <Feedback message="Classification is required"></Feedback>
                    </Col>
                  </Form.Group>
                  {Object.keys(smLinkerPubChemFields).map(key => {
                    return (
                      // eslint-disable-next-line react/jsx-key
                      <Form.Group as={Row} controlId={key} key={key}>
                        <FormLabel label={smLinkerPubChemFields[key].label} />
                        <Col md={4}>
                          <Form.Control
                            as={smLinkerPubChemFields[key].type === "textarea" ? "textarea" : "input"}
                            type={key === "mass" ? "number" : "string"}
                            rows="4"
                            name={key}
                            placeholder={smLinkerPubChemFields[key].label}
                            value={linkerAddState[key] ? linkerAddState[key] : undefined}
                            onChange={handleChange}
                            disabled={disablePubChemFields}
                            maxLength={smLinkerPubChemFields[key].length}
                            onKeyDown={
                              key === "mass"
                                ? e => {
                                    isValidNumber(e);
                                  }
                                : e => {}
                            }
                          />

                          {smLinkerPubChemFields[key].enableCharacterCounter && (
                            <span className="character-counter">
                              {linkerAddState[key] && linkerAddState[key].length > 0 ? linkerAddState[key].length : ""}/
                              {smLinkerPubChemFields[key].length}
                            </span>
                          )}
                        </Col>
                        {(key === "inChiKey" || key === "canonicalSmiles") &&
                          linkerAddState[key] !== "" &&
                          !disablePubChemFields && (
                            <Button
                              variant="contained"
                              onClick={() => populateLinkerDetails(encodeURIComponent(linkerAddState[key].trim()))}
                              className="get-btn "
                            >
                              Get Details from PubChem
                            </Button>
                          )}
                      </Form.Group>
                    );
                  })}
                  <Form.Group as={Row}>
                    <Col md={{ span: 2, offset: 5 }}>
                      <Button
                        variant="contained"
                        disabled={!disableReset}
                        onClick={clearPubChemFields}
                        className="stepper-button"
                      >
                        Reset
                      </Button>
                    </Col>
                  </Form.Group>
                </>
              )}
              {linkerAddState.type === "PROTEIN_LINKER" && (
                <>
                  <Form.Group as={Row} controlId="uniProtId">
                    <FormLabel label="UniProt Id" />
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        name="uniProtId"
                        placeholder="UniProt Id"
                        value={linkerAddState.uniProtId}
                        onChange={handleChange}
                        maxLength={100}
                      />
                    </Col>
                    {linkerAddState.uniProtId !== "" && (
                      <Button
                        variant="contained"
                        onClick={() => getSequenceFromUniprot(encodeURIComponent(linkerAddState.uniProtId.trim()))}
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
                        value={linkerAddState.pdbIds.join(";")}
                        onChange={e =>
                          setLinkerAddState({
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
                        value={linkerAddState.sequence}
                        onChange={handleChange}
                        className="sequence-text-area"
                        isInvalid={validatedSpecificDetails && (linkerAddState.sequence === "" || sequenceError !== "")}
                        spellCheck="false"
                        maxLength={10000}
                      />
                      {linkerAddState.sequence === "" && <Feedback message="Sequence is required"></Feedback>}
                      {sequenceError !== "" && <Feedback message={sequenceError}></Feedback>}
                    </Col>
                  </Form.Group>
                </>
              )}
              {linkerAddState.type === "PEPTIDE_LINKER" && (
                <>
                  <Form.Group as={Row} controlId="sequence">
                    <FormLabel label="Sequence" className="required-asterik" />
                    <Col md={6}>
                      <Form.Control
                        as="textarea"
                        rows="15"
                        name="sequence"
                        placeholder="Sequence"
                        value={linkerAddState.sequence}
                        onChange={handleChange}
                        className="sequence-text-area"
                        isInvalid={validatedSpecificDetails && (linkerAddState.sequence === "" || sequenceError !== "")}
                        spellCheck="false"
                        maxLength={10000}
                      />
                      {linkerAddState.sequence === "" && <Feedback message="Sequence is required"></Feedback>}
                      {sequenceError !== "" && <Feedback message={sequenceError}></Feedback>}
                    </Col>
                  </Form.Group>
                </>
              )}
            </Form>
          </>
        );
      case 2:
        return (
          <>
            <Form className="radioform2">
              {Object.keys(commonFields).map(key => {
                return (
                  // eslint-disable-next-line react/jsx-key
                  <Form.Group as={Row} controlId={key} key={key}>
                    <FormLabel label={commonFields[key].label} />
                    <Col md={4}>
                      <Form.Control
                        as={commonFields[key].type === "textarea" ? "textarea" : "input"}
                        rows="4"
                        name={key}
                        placeholder={commonFields[key].label}
                        value={linkerAddState[key]}
                        onChange={handleChange}
                        maxLength={commonFields[key].length}
                      />
                      {commonFields[key].enableCharacterCounter && (
                        <span className="character-counter">
                          {linkerAddState[key] && linkerAddState[key].length > 0 ? linkerAddState[key].length : ""}/
                          {commonFields[key].length}
                        </span>
                      )}
                    </Col>
                  </Form.Group>
                );
              })}
              <Form.Group as={Row} controlId="opensRing">
                <FormLabel label={displayNames.linker.OPENS_RING} />
                <Col md={4}>
                  <MultiToggle
                    options={opensRingOptions}
                    selectedOption={linkerAddState.opensRing}
                    onSelectOption={value => setLinkerAddState({ opensRing: value })}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} controlId="publications">
                <FormLabel label="Publications" />
                <Col md={4}>
                  {linkerAddState.publications.map((pub, index) => {
                    return <PublicationCard key={index} {...pub} enableDelete deletePublication={deletePublication} />;
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
      case 3:
        return (
          <Form className="radioform2">
            {Object.keys(reviewFields).map(key =>
              // eslint-disable-next-line react/jsx-key
              linkerAddState.type === "SMALLMOLECULE_LINKER" &&
              (reviewFields[key].label === "UniProt Id" ||
                reviewFields[key].label === "PDB Ids" ||
                reviewFields[key].label === "Sequence") ? (
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
                      value={getReviewDisplay(key, linkerAddState[key])}
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
                {linkerAddState.publications && linkerAddState.publications.length > 0
                  ? linkerAddState.publications.map(pub => {
                      return <PublicationCard key={pub.pubmedId} {...pub} enableDelete={false} />;
                    })
                  : ""}
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="urls">
              <FormLabel label="Urls" />
              <Col md={4}>
                {linkerAddState.urls && linkerAddState.urls.length > 0 ? (
                  linkerAddState.urls.map((url, index) => {
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
};

AddLinker.propTypes = {
  authCheckAgent: PropTypes.func
};

export { AddLinker };
