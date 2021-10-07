/* eslint-disable no-fallthrough */
import React, { useReducer, useState, useEffect } from "react";
import { Form, FormCheck, Row, Col } from "react-bootstrap";
import { FormLabel, Feedback, Title } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import displayNames from "../appData/displayNames";
import { useHistory } from "react-router-dom";
import { Loading } from "../components/Loading";
import { PublicationCard } from "../components/PublicationCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { csvToArray, isValidURL, externalizeUrl, isValidNumber, numberLengthCheck } from "../utils/commonUtils";
import { Button, Step, StepLabel, Stepper, Typography, makeStyles, Link } from "@material-ui/core";
import "../containers/AddLinker.css";
import { Source } from "../components/Source";
import { ViewSourceInfo } from "../components/ViewSourceInfo";

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

const AddLipid = props => {
  useEffect(props.authCheckAgent, []);

  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [validate, setValidate] = useState(false);
  const [validatedCommNonComm, setValidatedCommNonComm] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [invalidUrls, setInvalidUrls] = useState(false);
  const [invalidMass, setInvalidMass] = useState(false);
  const [disablePubChemFields, setDisablePubChemFields] = useState(false);
  const [newURL, setNewURL] = useState("");
  const [disableReset, setDisableReset] = useState(false);
  const [newPubMedId, setNewPubMedId] = useState("");
  const history = useHistory();

  const lipidInitialState = {
    selectedLipid: "SequenceDefined",
    name: "",
    comment: "",
    mass: "",
    pubChemId: "",
    inChiKey: "",
    inChiSequence: "",
    iupacName: "",
    imageURL: "",
    molecularFormula: "",
    canonicalSmiles: "",
    isomericSmiles: "",
    publications: [],
    urls: [],
    source: "notSpecified",
    commercial: { vendor: "", catalogueNumber: "", batchId: "" },
    nonCommercial: { providerLab: "", batchId: "", method: "", sourceComment: "" }
  };

  const reducer = (state, newState) => ({ ...state, ...newState });

  const [lipid, setLipid] = useReducer(reducer, lipidInitialState);

  const reviewFields = {
    pubChemId: { label: "PubChem Compound CID", type: "number", length: 12 },
    inChiKey: { label: "InChI Key", type: "text" },
    inChiSequence: { label: "InChI", type: "textarea" },
    iupacName: { label: "IUPAC Name", type: "text" },
    molecularFormula: { label: "Molecular Formula", type: "text" },
    canonicalSmiles: { label: "Canonical SMILES", type: "text" },
    isomericSmiles: { label: "Isomeric SMILES", type: "text" },
    name: { label: "Name", type: "text", length: 100 },
    comment: { label: "Comments", type: "textarea", length: 10000 }
  };

  const sourceSelection = e => {
    const newValue = e.target.value;
    setLipid({ source: newValue });
  };

  const sourceChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    if (lipid.source === "commercial") {
      if (name === "vendor") {
        setValidatedCommNonComm(false);
      }
      let comm = lipid.commercial;
      comm[name] = newValue;
      setLipid({ [lipid.commercial]: comm });
    } else {
      if (name === "providerLab") {
        setValidatedCommNonComm(false);
      }

      let nonComm = lipid.nonCommercial;
      nonComm[name] = newValue;
      setLipid({ [lipid.nonCommercial]: nonComm });
    }
  };

  const steps = getSteps();

  const handleNext = e => {
    setValidate(false);
    var stepIncrement = 1;

    if (activeStep === 0 && lipid.selectedLipid === "Unknown") {
      stepIncrement += 1;
    } else if (activeStep === 1) {
      if (lipid.inChiSequence === "") {
        setValidate(true);
        return;
      }

      if (!disablePubChemFields) {
        if (lipid.pubChemId !== "") {
          populateLinkerDetails(encodeURIComponent(lipid.pubChemId.trim()));
        } else if (lipid.inChiKey) {
          populateLinkerDetails(encodeURIComponent(lipid.inChiKey.trim()));
        }
      }
    } else if (activeStep === 2) {
      let count = 0;

      if (lipid.name === "") {
        setValidate(true);
        count++;
      }

      if (
        (lipid.source === "commercial" && lipid.commercial.vendor === "") ||
        (lipid.source === "nonCommercial" && lipid.nonCommercial.providerLab === "")
      ) {
        setValidatedCommNonComm(true);
        count++;
      }

      if (count > 0) {
        return;
      }
    } else if (e.currentTarget.innerText === "FINISH") {
      addLipid(e);
      return;
    }

    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const handleChange = e => {
    setDisableReset(true);

    const name = e.target.name;
    const newValue = e.target.value;

    if (name === "mass" && newValue === "") {
      setInvalidMass(true);
    } else if (name === "mass" && newValue !== "") {
      setInvalidMass(false);
    }

    if (name === "inChiSequence" || name === "name") {
      setValidate(false);
    }

    setLipid({ [name]: newValue });
  };

  const handleBack = () => {
    setShowErrorSummary(false);

    var stepDecrement = 1;

    setValidate(false);

    if (activeStep === 2) {
      if (lipid.selectedLipid === "Unknown") {
        stepDecrement += 1;
      }
    }
    setActiveStep(prevActiveStep => prevActiveStep - stepDecrement);
  };

  const handleSelect = e => {
    setDisableReset(true);
    setDisablePubChemFields(false);

    const newValue = e.target.value;
    setLipid({ ...lipidInitialState, ...{ selectedLipid: newValue } });
  };

  function getSteps() {
    return ["Select the Lipid Type", "Type Specific Lipid Info", "Generic Lipid Info", "Review and Add"];
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
        setLipid({
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
          urls: [`${displayNames.pubchem.url}${responseJson.pubChemId}`]
        });

        setShowErrorSummary(false);
        setValidate(false);
        // setDisablePubChemFields(true);
      });

      setDisablePubChemFields(true);
      setShowLoading(false);
    }

    function populateLinkerDetailsError(response) {
      response.json().then(resp => {
        setPageErrorsJson(resp);
        setShowErrorSummary(true);
      });
      setShowLoading(false);
    }
  }

  function deletePublication(id, wscall) {
    const publications = lipid.publications;
    const publicationToBeDeleted = publications.find(i => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    setLipid({ publications: publications });
  }

  function addURL() {
    var listUrls = lipid.urls;
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

      setLipid({ urls: listUrls });
    }
    setNewURL("");
  }

  const urlWidget = enableDelete => {
    return (
      <>
        {lipid.urls && lipid.urls.length > 0
          ? lipid.urls.map((url, index) => {
              return (
                <Row style={{ marginTop: "8px" }} key={index}>
                  <Col
                    md={10}
                    style={{
                      wordBreak: "break-all"
                    }}
                  >
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
                          const listUrls = lipid.urls;
                          listUrls.splice(index, 1);
                          setLipid({ urls: listUrls });
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

  function clearPubChemFields() {
    setDisablePubChemFields(false);
    setLipid({ ...lipidInitialState, ...{ selectedLipid: lipid.selectedLipid } });
    setShowErrorSummary(false);
    setPageErrorsJson({});
  }

  function addPublication() {
    let publications = lipid.publications;
    let pubmedExists = publications.find(i => i.pubmedId === parseInt(newPubMedId));

    if (!pubmedExists) {
      wsCall("getpublication", "GET", [newPubMedId], true, null, addPublicationSuccess, addPublicationError);
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then(responseJson => {
        setShowErrorSummary(false);
        setLipid({
          publications: lipid.publications.concat([responseJson])
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

  const getStep2 = () => {
    return (
      <>
        <Form.Group as={Row} controlId={"inChiKey"}>
          <FormLabel label={displayNames.linker.INCHIKEY} />
          <Col md={4}>
            <Form.Control
              type={"text"}
              name={"inChiKey"}
              placeholder={displayNames.linker.INCHIKEY}
              value={lipid.inChiKey}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={27}
            />
            <Feedback message={`${displayNames.linker.INCHIKEY} is Invalid`} />
          </Col>
          {lipid.inChiKey !== "" && !disablePubChemFields && (
            <Button
              variant="contained"
              onClick={() => populateLinkerDetails(encodeURIComponent(lipid.inChiKey && lipid.inChiKey.trim()))}
              className="get-btn "
            >
              Get Details from PubChem
            </Button>
          )}
        </Form.Group>

        <Form.Group as={Row} controlId={"inChiSequence"}>
          <FormLabel label={displayNames.linker.INCHI_SEQUENCE} className={"required-asterik"} />
          <Col md={4}>
            <Form.Control
              as={"textarea"}
              rows="4"
              name={"inChiSequence"}
              placeholder={displayNames.linker.INCHI_SEQUENCE}
              value={lipid.inChiSequence}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={10000}
              isInvalid={validate}
              required
            />
            <span className="character-counter">
              {lipid.inChiSequence && lipid.inChiSequence.length > 0 ? lipid.inChiSequence.length : ""}/10000
            </span>
            <Feedback message={`${displayNames.linker.INCHI_SEQUENCE} is Invalid`} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"iupacName"}>
          <FormLabel label={"IUPAC Name"} />
          <Col md={4}>
            <Form.Control
              type={"text"}
              name={"iupacName"}
              placeholder={"iupacName"}
              value={lipid.iupacName}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={2000}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId={"Mass"}>
          <FormLabel label={"Mass"} />
          <Col md={4}>
            <Form.Control
              type={"number"}
              name={"mass"}
              placeholder={"Mass"}
              value={lipid.mass}
              onChange={handleChange}
              disabled={disablePubChemFields}
              onKeyDown={e => isValidNumber(e)}
              isInvalid={invalidMass}
            />
            <Feedback message={`Mass is Invalid`} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"Molecular Formula"}>
          <FormLabel label={"Molecular Formula"} />
          <Col md={4}>
            <Form.Control
              type={"text"}
              name={"molecularFormula"}
              placeholder={"molecular formula"}
              value={lipid.molecularFormula}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={256}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"isomericSmiles"}>
          <FormLabel label={displayNames.linker.ISOMERIC_SMILES} />
          <Col md={4}>
            <Form.Control
              type={"text"}
              name={"isomericSmiles"}
              placeholder={"isomeric smiles"}
              value={lipid.isomericSmiles}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={10000}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"canonicalSmiles"}>
          <FormLabel label={displayNames.linker.CANONICAL_SMILES} />
          <Col md={4}>
            <Form.Control
              type={"text"}
              name={"canonicalSmiles"}
              placeholder={"canonical smiles"}
              value={lipid.canonicalSmiles}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={10000}
            />
          </Col>
          {lipid.canonicalSmiles !== "" && !disablePubChemFields && (
            <Button
              variant="contained"
              onClick={() =>
                populateLinkerDetails(encodeURIComponent(lipid.canonicalSmiles && lipid.canonicalSmiles.trim()))
              }
              className="get-btn "
            >
              Get Details from PubChem
            </Button>
          )}
        </Form.Group>
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
                  checked={lipid.selectedLipid === "SequenceDefined"}
                />
                {displayNames.lipid.SEQUENCE}
              </FormCheck.Label>
            </FormCheck>

            <FormCheck>
              <FormCheck.Label>
                <FormCheck.Input
                  type="radio"
                  value="Unknown"
                  onChange={handleSelect}
                  checked={lipid.selectedLipid === "Unknown"}
                />
                {displayNames.lipid.UNKNOWN}
              </FormCheck.Label>
            </FormCheck>
          </Form>
        );
      case 1:
        if (activeStep === 1 && lipid.selectedLipid !== "Unknown") {
          return (
            <>
              <Form className="radioform1">
                <>
                  <Form.Group as={Row} controlId="pubChemId">
                    <FormLabel label="PubChem Compound CID" />
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        name="pubChemId"
                        placeholder="PubChem Compound CID"
                        value={lipid.pubChemId}
                        onChange={handleChange}
                        disabled={disablePubChemFields}
                        onKeyDown={e => {
                          if (e.key.length === 1) {
                            if (e.key !== "v" && e.key !== "V") {
                              isValidNumber(e);
                            }
                          }
                        }}
                        maxLength={12}
                        onInput={e => {
                          numberLengthCheck(e);
                        }}
                      />
                    </Col>
                    {lipid.pubChemId !== "" && !disablePubChemFields && (
                      <Button
                        variant="contained"
                        onClick={() => populateLinkerDetails(encodeURIComponent(lipid.pubChemId.trim()))}
                        className="get-btn "
                      >
                        Get Details from PubChem
                      </Button>
                    )}
                  </Form.Group>

                  {getStep2()}

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
              </Form>
            </>
          );
        }
      case 2:
        if (activeStep === 2) {
          return (
            <>
              <Form noValidate className="radioform2" validated={validate && validatedCommNonComm}>
                <Form.Group as={Row} controlId="name">
                  <FormLabel label="Name" className="required-asterik" />
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="name"
                      value={lipid.name}
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
                      value={lipid.comment}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <span className="character-counter">
                      {lipid.comment && lipid.comment.length > 0 ? lipid.comment.length : ""}
                      /2000
                    </span>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="publications">
                  <FormLabel label="Publications" />
                  <Col md={4}>
                    {lipid.publications.map((pub, index) => {
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
                        checked={lipid.source === "commercial"}
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
                        checked={lipid.source === "nonCommercial"}
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
                        checked={lipid.source === "notSpecified"}
                      />
                      {"Not Specified"}
                    </Form.Check.Label>
                  </Col>
                </Row>
                &nbsp;&nbsp;&nbsp;
                {lipid.source === "commercial" ? (
                  <Source
                    isCommercial
                    commercial={lipid.commercial}
                    validate={validatedCommNonComm}
                    sourceChange={sourceChange}
                  />
                ) : (
                  lipid.source === "nonCommercial" && (
                    <Source
                      isNonCommercial
                      nonCommercial={lipid.nonCommercial}
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
              (key === "pubChemId" ||
                key === "inChiKey" ||
                key === "inChiSequence" ||
                key === "iupacName" ||
                key === "molecularFormula" ||
                key === "canonicalSmiles" ||
                key === "isomericSmiles") &&
              lipid.selectedLipid === "Unknown" ? (
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
                      value={lipid[key]}
                      disabled
                      className={key === "sequence" ? "sequence-text-area" : false}
                    />
                  </Col>
                </Form.Group>
              )
            )}

            {lipid.publications && lipid.publications.length > 0 && (
              <Form.Group as={Row} controlId="publications">
                <FormLabel label="Publications" />
                <Col md={4}>
                  {lipid.publications && lipid.publications.length > 0
                    ? lipid.publications.map(pub => {
                        return (
                          <li>
                            <PublicationCard key={pub.pubmedId} {...pub} enableDelete={false} />
                          </li>
                        );
                      })
                    : ""}
                </Col>
              </Form.Group>
            )}

            {lipid.urls && lipid.urls.length > 0 && (
              <Form.Group as={Row} controlId="urls">
                <FormLabel label="Urls" />
                <Col md={4}>
                  {lipid.urls && lipid.urls.length > 0 ? (
                    lipid.urls.map((url, index) => {
                      return (
                        <li style={{ marginTop: "8px" }} key={index}>
                          <Link
                            style={{ fontSize: "0.9em" }}
                            href={externalizeUrl(url)}
                            target="_blank"
                            rel="external noopener noreferrer"
                          >
                            {url}
                          </Link>
                          <br />
                        </li>
                      );
                    })
                  ) : (
                    <div style={{ marginTop: "8px" }} />
                  )}
                </Col>
              </Form.Group>
            )}

            <ViewSourceInfo source={lipid.source} commercial={lipid.commercial} nonCommercial={lipid.nonCommercial} />
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

  function addLipid(e) {
    setShowLoading(true);
    let unknownLipid = lipid.selectedLipid === "Unknown" ? true : false;

    var source = {
      type: "NOTRECORDED"
    };

    if (lipid.source === "commercial") {
      source.type = "COMMERCIAL";
      source.vendor = lipid.commercial.vendor;
      source.catalogueNumber = lipid.commercial.catalogueNumber;
      source.batchId = lipid.commercial.batchId;
    } else if (lipid.source === "nonCommercial") {
      source.type = "NONCOMMERCIAL";
      source.batchId = lipid.commercial.batchId;
      source.providerLab = lipid.nonCommercial.providerLab;
      source.method = lipid.nonCommercial.method;
      source.comment = lipid.nonCommercial.sourceComment;
    }

    var lipidObj = {
      type: "LIPID",
      name: lipid.name,
      pubChemId: lipid.pubChemId,
      classification: lipid.classification,
      inChiKey: lipid.inChiKey,
      inChiSequence: lipid.inChiSequence,
      iupacName: lipid.iupacName,
      mass: lipid.mass,
      molecularFormula: lipid.molecularFormula,
      smiles: lipid.canonicalSmiles,
      isomericSmiles: lipid.isomericSmiles,
      comment: lipid.comment,
      publications: lipid.publications,
      urls: lipid.urls,
      source: source
    };

    wsCall(
      "addlinker",
      "POST",
      { unknown: unknownLipid },
      true,
      lipidObj,
      response => history.push("/lipids"),
      addLipidFailure
    );

    function addLipidFailure(response) {
      response.json().then(parsedJson => {
        setPageErrorsJson(parsedJson);
        setShowErrorSummary(true);
      });
      setShowLoading(false);
    }
  }

  const isStepSkipped = step => {
    return lipid.selectedLipid === "Unknown" && step === 1 && (activeStep === 2 || activeStep === 3);
  };

  return (
    <>
      <Helmet>
        <title>{head.addLipid.title}</title>
        {getMeta(head.addLipid)}
      </Helmet>

      <div className="page-container">
        <Title title="Add Lipid to Repository" />
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

AddLipid.propTypes = {};

export { AddLipid };
