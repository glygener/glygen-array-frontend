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
import {
  csvToArray,
  isValidURL,
  externalizeUrl,
  isValidNumber,
  numberLengthCheck,
} from "../utils/commonUtils";
import { Button, Step, StepLabel, Stepper, Typography, makeStyles, Link } from "@material-ui/core";
import "../containers/AddLinker.css";
import { Source } from "../components/Source";
import { ViewSourceInfo } from "../components/ViewSourceInfo";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90%",
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const AddLinker = (props) => {
  useEffect(props.authCheckAgent, []);

  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [validate, setValidate] = useState(false);
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
  const [validatedCommNonComm, setValidatedCommNonComm] = useState(false);
  const [isWscalldone, setIsWscalldone] = useState(true);
  const history = useHistory();

  const linkerInitialState = {
    selectedLinker: "SequenceDefined",
    name: "",
    comment: "",
    pubChemId: "",
    inChiKey: "",
    inChiSequence: "",
    iupacName: "",
    imageURL: "",
    mass: "",
    molecularFormula: "",
    canonicalSmiles: "",
    isomericSmiles: "",
    publications: [],
    urls: [],
    source: "notSpecified",
    commercial: { vendor: "", catalogueNumber: "", batchId: "" },
    nonCommercial: { providerLab: "", batchId: "", method: "", sourceComment: "" },
  };

  const reducer = (state, newState) => ({ ...state, ...newState });

  const [linker, setLinker] = useReducer(reducer, linkerInitialState);

  const reviewFields = {
    pubChemId: { label: "PubChem Compound CID", type: "number", length: 12 },
    inChiKey: { label: "InChI Key", type: "text" },
    inChiSequence: { label: "InChI", type: "textarea" },
    iupacName: { label: "IUPAC Name", type: "text" },
    molecularFormula: { label: "Molecular Formula", type: "text" },
    canonicalSmiles: { label: "Canonical SMILES", type: "text" },
    isomericSmiles: { label: "Isomeric SMILES", type: "text" },
    name: { label: "Name", type: "text", length: 100 },
    comment: { label: "Comments", type: "textarea", length: 10000 },
  };

  const sourceSelection = (e) => {
    const newValue = e.target.value;
    setLinker({ source: newValue });
  };

  const sourceChange = (e) => {
    const name = e.target.name;
    const newValue = e.target.value;

    if (linker.source === "commercial") {
      if (name === "vendor") {
        setValidatedCommNonComm(false);
      }
      let comm = linker.commercial;
      comm[name] = newValue;
      setLinker({ [linker.commercial]: comm });
    } else {
      if (name === "providerLab") {
        setValidatedCommNonComm(false);
      }

      let nonComm = linker.nonCommercial;
      nonComm[name] = newValue;
      setLinker({ [linker.nonCommercial]: nonComm });
    }
  };

  const steps = getSteps();

  const handleNext = (e) => {
    setValidate(false);
    var stepIncrement = 1;

    if (activeStep === 0 && linker.selectedLinker === "Unknown") {
      stepIncrement += 1;
    } else if (activeStep === 1) {
      if (linker.inChiSequence === "") {
        setValidate(true);
        return;
      }

      if (!disablePubChemFields) {
        if (linker.pubChemId !== "") {
          populateLinkerDetails(encodeURIComponent(linker.pubChemId.trim()));
        } else if (linker.inChiKey) {
          populateLinkerDetails(encodeURIComponent(linker.inChiKey.trim()));
        }
      }
    } else if (activeStep === 2) {
      let count = 0;

      if (linker.name === "") {
        setValidate(true);
        count++;
      }

      if (
        (linker.source === "commercial" && linker.commercial.vendor === "") ||
        (linker.source === "nonCommercial" && linker.nonCommercial.providerLab === "")
      ) {
        setValidatedCommNonComm(true);
        count++;
      }

      if (count > 0) {
        return;
      }
    } else if (e.currentTarget.innerText === "FINISH") {
      addLinker(e);
      return;
    }

    if (activeStep === 1) {
      if (!isWscalldone && linker.inChiSequence !== "") {
        setShowErrorSummary(false);
        setActiveStep((prevActiveStep) => prevActiveStep + stepIncrement);
      } else if (linker.pubChemId !== "" || linker.inChiKey !== "") {
        return;
      } else {
        setShowErrorSummary(false);
        setActiveStep((prevActiveStep) => prevActiveStep + stepIncrement);
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + stepIncrement);
    }
  };

  const handleChange = (e) => {
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

    setLinker({ [name]: newValue });
  };

  const handleBack = () => {
    setShowErrorSummary(false);

    var stepDecrement = 1;

    setValidate(false);

    if (activeStep === 2) {
      if (linker.selectedLinker === "Unknown") {
        stepDecrement += 1;
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep - stepDecrement);
  };

  const handleSelect = (e) => {
    setDisableReset(true);
    setDisablePubChemFields(false);
    const newValue = e.target.value;
    setLinker({ ...linkerInitialState, ...{ selectedLinker: newValue } });
  };

  function getSteps() {
    return [
      "Select the Linker Type",
      "Type Specific Linker Info",
      "Generic Linker Info",
      "Review and Add",
    ];
  }

  function populateLinkerDetails(pubChemId) {
    setShowLoading(true);
    setIsWscalldone(false);
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
      response.json().then((responseJson) => {
        setLinker({
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
          urls: [`${displayNames.pubchem.url}${responseJson.pubChemId}`],
        });

        setShowErrorSummary(false);
        setValidate(false);
        setDisablePubChemFields(true);
      });

      setDisablePubChemFields(true);
      setShowLoading(false);
    }

    function populateLinkerDetailsError(response) {
      response.json().then((resp) => {
        setIsWscalldone(true);
        setPageErrorsJson(resp);
        setShowErrorSummary(true);
      });

      setShowLoading(false);
    }
  }

  function deletePublication(id, wscall) {
    const publications = linker.publications;
    const publicationToBeDeleted = publications.find((i) => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    setLinker({ publications: publications });
  }

  function addURL() {
    var listUrls = linker.urls;
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

      setLinker({ urls: listUrls });
    }
    setNewURL("");
  }

  const urlWidget = (enableDelete) => {
    return (
      <>
        {linker.urls && linker.urls.length > 0
          ? linker.urls.map((url, index) => {
              return (
                <Row style={{ marginTop: "8px" }} key={index}>
                  <Col
                    md={10}
                    style={{
                      wordBreak: "break-all",
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
                          const listUrls = linker.urls;
                          listUrls.splice(index, 1);
                          setLinker({ urls: listUrls });
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
    setLinker({ ...linkerInitialState, ...{ selectedLinker: linker.selectedLinker } });
    setDisablePubChemFields(false);
    setShowErrorSummary(false);
    setPageErrorsJson({});
  }

  function addPublication() {
    let publications = linker.publications;
    let pubmedExists = publications.find((i) => i.pubmedId === parseInt(newPubMedId));

    if (!pubmedExists) {
      wsCall(
        "getpublication",
        "GET",
        [newPubMedId],
        true,
        null,
        addPublicationSuccess,
        addPublicationError
      );
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then((responseJson) => {
        setShowErrorSummary(false);
        setLinker({
          publications: linker.publications.concat([responseJson]),
        });
        setNewPubMedId("");
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
              value={linker.inChiKey}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={27}
            />
            <Feedback message={`${displayNames.linker.INCHIKEY} is Invalid`} />
          </Col>
          {linker.inChiKey !== "" && !disablePubChemFields && (
            <Button
              variant="contained"
              onClick={() =>
                populateLinkerDetails(encodeURIComponent(linker.inChiKey && linker.inChiKey.trim()))
              }
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
              value={linker.inChiSequence}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={10000}
              isInvalid={validate}
              required
            />
            <div className="text-right text-muted">
              {linker.inChiSequence && linker.inChiSequence.length > 0
                ? linker.inChiSequence.length
                : "0"}
              /10000
            </div>
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
              value={linker.iupacName}
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
              value={linker.mass}
              onChange={handleChange}
              disabled={disablePubChemFields}
              onKeyDown={(e) => isValidNumber(e)}
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
              value={linker.molecularFormula}
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
              value={linker.isomericSmiles}
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
              value={linker.canonicalSmiles}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={10000}
            />
          </Col>
          {linker.canonicalSmiles !== "" && !disablePubChemFields && (
            <Button
              variant="contained"
              onClick={() =>
                populateLinkerDetails(
                  encodeURIComponent(linker.canonicalSmiles && linker.canonicalSmiles.trim())
                )
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
                  checked={linker.selectedLinker === "SequenceDefined"}
                />
                {displayNames.linker.SEQUENCE}
              </FormCheck.Label>
            </FormCheck>

            <FormCheck>
              <FormCheck.Label>
                <FormCheck.Input
                  type="radio"
                  value="Unknown"
                  onChange={handleSelect}
                  checked={linker.selectedLinker === "Unknown"}
                />
                {displayNames.linker.UNKNOWN}
              </FormCheck.Label>
            </FormCheck>
          </Form>
        );
      case 1:
        if (activeStep === 1 && linker.selectedLinker !== "Unknown") {
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
                        value={linker.pubChemId}
                        onChange={handleChange}
                        disabled={disablePubChemFields}
                        onKeyDown={(e) => {
                          if (e.key.length === 1) {
                            if (e.key !== "v" && e.key !== "V") {
                              isValidNumber(e);
                            }
                          }
                        }}
                        maxLength={12}
                        onInput={(e) => {
                          numberLengthCheck(e);
                        }}
                      />
                    </Col>
                    {linker.pubChemId !== "" && !disablePubChemFields && (
                      <Button
                        variant="contained"
                        onClick={() =>
                          populateLinkerDetails(encodeURIComponent(linker.pubChemId.trim()))
                        }
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
                      value={linker.name}
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
                      value={linker.comment}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <div className="text-right text-muted">
                      {linker.comment && linker.comment.length > 0 ? linker.comment.length : "0"}
                      /2000
                    </div>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="publications">
                  <FormLabel label="Publications" />
                  <Col md={4}>
                    {linker.publications.map((pub, index) => {
                      return (
                        <PublicationCard
                          key={index}
                          {...pub}
                          enableDelete
                          deletePublication={deletePublication}
                        />
                      );
                    })}
                    <Row>
                      <Col md={10}>
                        <Form.Control
                          type="number"
                          name="publication"
                          placeholder="Enter a Pubmed ID and click +"
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
                          onChange={(e) => {
                            setNewURL(e.target.value);
                            setInvalidUrls(false);
                          }}
                          maxLength={2048}
                          isInvalid={invalidUrls}
                        />
                        <Feedback message="Please enter a unique URL." />
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
                        checked={linker.source === "commercial"}
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
                        checked={linker.source === "nonCommercial"}
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
                        checked={linker.source === "notSpecified"}
                      />
                      {"Not Specified"}
                    </Form.Check.Label>
                  </Col>
                </Row>
                &nbsp;&nbsp;&nbsp;
                {linker.source === "commercial" ? (
                  <Source
                    isCommercial
                    commercial={linker.commercial}
                    validate={validatedCommNonComm}
                    sourceChange={sourceChange}
                  />
                ) : (
                  linker.source === "nonCommercial" && (
                    <Source
                      isNonCommercial
                      nonCommercial={linker.nonCommercial}
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
            {Object.keys(reviewFields).map((key) =>
              (key === "pubChemId" ||
                key === "inChiKey" ||
                key === "inChiSequence" ||
                key === "iupacName" ||
                key === "molecularFormula" ||
                key === "canonicalSmiles" ||
                key === "isomericSmiles") &&
              linker.selectedLinker === "Unknown" ? (
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
                      value={linker[key]}
                      disabled
                      className={key === "sequence" ? "sequence-text-area" : false}
                    />
                  </Col>
                </Form.Group>
              )
            )}

            {linker.publications && linker.publications.length > 0 && (
              <Form.Group as={Row} controlId="publications">
                <FormLabel label="Publications" />
                <Col md={4}>
                  {linker.publications && linker.publications.length > 0
                    ? linker.publications.map((pub) => {
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

            {linker.urls && linker.urls.length > 0 && (
              <Form.Group as={Row} controlId="urls">
                <FormLabel label="Urls" />
                <Col md={4}>
                  {linker.urls && linker.urls.length > 0 ? (
                    linker.urls.map((url, index) => {
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

            <ViewSourceInfo
              source={linker.source}
              commercial={linker.commercial}
              nonCommercial={linker.nonCommercial}
            />
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

  function addLinker(e) {
    let unknownLinker = linker.selectedLinker === "Unknown" ? true : false;

    var source = {
      type: "NOTRECORDED",
    };

    if (linker.source === "commercial") {
      source.type = "COMMERCIAL";
      source.vendor = linker.commercial.vendor;
      source.catalogueNumber = linker.commercial.catalogueNumber;
      source.batchId = linker.commercial.batchId;
    } else if (linker.source === "nonCommercial") {
      source.type = "NONCOMMERCIAL";
      source.batchId = linker.commercial.batchId;
      source.providerLab = linker.nonCommercial.providerLab;
      source.method = linker.nonCommercial.method;
      source.comment = linker.nonCommercial.sourceComment;
    }

    var linkerObj = {
      type: "SMALLMOLECULE",
      name: linker.name,
      pubChemId: linker.pubChemId,
      classification: linker.classification,
      inChiKey: linker.inChiKey,
      inChiSequence: linker.inChiSequence,
      iupacName: linker.iupacName,
      mass: linker.mass,
      molecularFormula: linker.molecularFormula,
      smiles: linker.canonicalSmiles,
      isomericSmiles: linker.isomericSmiles,
      comment: linker.comment,
      publications: linker.publications,
      urls: linker.urls,
      source: source,
    };

    wsCall(
      "addlinker",
      "POST",
      { unknown: unknownLinker },
      true,
      linkerObj,
      (response) => history.push("/linkers"),
      addLinkerFailure
    );

    function addLinkerFailure(response) {
      response.json().then((parsedJson) => {
        setPageErrorsJson(parsedJson);
        setShowErrorSummary(true);
      });
    }
  }

  const isStepSkipped = (step) => {
    return (
      linker.selectedLinker === "Unknown" && step === 1 && (activeStep === 2 || activeStep === 3)
    );
  };

  return (
    <>
      <Helmet>
        <title>{head.addLinker.title}</title>
        {getMeta(head.addLinker)}
      </Helmet>

      <div className="page-container">
        <Title title="Add Linker to Repository" />
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

AddLinker.propTypes = {};

export { AddLinker };
