/* eslint-disable no-fallthrough */
import React, { useReducer, useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
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
import { Button, Step, StepLabel, Stepper, Typography } from "@material-ui/core";
import "../containers/AddLinker.css";
import { Source } from "../components/Source";
import { ViewSourceInfo } from "../components/ViewSourceInfo";
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

const AddLipid = (props) => {
  useEffect(props.authCheckAgent, []);

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
  const [isWscalldone, setIsWscalldone] = useState(true);
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
    nonCommercial: { providerLab: "", batchId: "", method: "", sourceComment: "" },
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
    comment: { label: "Comment", type: "textarea", length: 10000 },
  };

  const sourceSelection = (e) => {
    const newValue = e.target.value;
    setLipid({ source: newValue });
  };

  const sourceChange = (e) => {
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

  const handleNext = (e) => {
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

        if (lipid.inChiSequence !== "" && showErrorSummary) {
          setShowErrorSummary(false);
        }
      }
    } else if (activeStep === 2) {
      let count = 0;
      setShowErrorSummary(false);

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
    } else if (e.currentTarget.innerText === "SUBMIT") {
      addLipid(e);
      return;
    }

    if (activeStep === 1) {
      if (!isWscalldone && lipid.inChiSequence !== "") {
        setShowErrorSummary(false);
        setActiveStep((prevActiveStep) => prevActiveStep + stepIncrement);
      } else if (lipid.pubChemId !== "" || lipid.inChiKey !== "") {
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
    setActiveStep((prevActiveStep) => prevActiveStep - stepDecrement);
  };

  const handleSelect = (e) => {
    setDisableReset(true);
    setDisablePubChemFields(false);

    const newValue = e.target.value;
    setLipid({ ...lipidInitialState, ...{ selectedLipid: newValue } });
  };

  function getSteps() {
    return ["Lipid Type", "Type Specific Information", "Generic Information", "Review and Add"];
  }
  function getMoleculeType(typeIndex) {
    switch (typeIndex) {
      case "SequenceDefined":
        return `${displayNames.lipid.SEQUENCE}`;
      case "Unknown":
        return `${displayNames.lipid.UNKNOWN}`;
      default:
        return "Unknown typeIndex";
    }
  }
  function getStepLabel(stepIndex) {
    switch (stepIndex) {
      case 0:
        return "Select the Lipid Type";
      case 1:
        return `Add Type Specific Lipid Information (${getMoleculeType(lipid.selectedLipid)})`;
      case 2:
        return `Add Generic Lipid Information (${getMoleculeType(lipid.selectedLipid)})`;
      case 3:
        return "Review and Add Lipid to Repository";
      default:
        return "Unknown stepIndex";
    }
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
        setLipid({
          type: responseJson.type,
          pubChemId: responseJson.pubChemId,
          classification: responseJson.classification,
          inChiKey: responseJson.inChiKey,
          inChiSequence: responseJson.inChiSequence,
          iupacName: responseJson.iupacName,
          name: responseJson.iupacName.substring(0, 100),
          imageURL: responseJson.imageURL,
          molecularFormula: responseJson.molecularFormula,
          isomericSmiles: responseJson.isomericSmiles,
          canonicalSmiles: responseJson.smiles,
          mass: responseJson.mass,
          urls: [`${displayNames.pubchem.url}${responseJson.pubChemId}`],
        });

        setShowErrorSummary(false);
        setValidate(false);
        // setDisablePubChemFields(true);
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
    const publications = lipid.publications;
    const publicationToBeDeleted = publications.find((i) => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    setLipid({ publications: publications });
  }

  function addURL() {
    var listUrls = lipid.urls;
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

      setLipid({ urls: listUrls });
    }
    setNewURL("");
  }

  const urlWidget = (enableDelete) => {
    return (
      <>
        {lipid.urls && lipid.urls.length > 0
          ? lipid.urls.map((url, index) => {
              return (
                <Row key={index}>
                  <Col
                    md={10}
                    style={{
                      wordBreak: "break-all",
                    }}
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
                            alt="Delete URL"
                            className="caution-color tbl-icon-btn"
                            onClick={() => {
                              const listUrls = lipid.urls;
                              listUrls.splice(index, 1);
                              setLipid({ urls: listUrls });
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

  function clearPubChemFields() {
    setDisablePubChemFields(false);
    setLipid({ ...lipidInitialState, ...{ selectedLipid: lipid.selectedLipid } });
    setShowErrorSummary(false);
    setPageErrorsJson({});
  }

  function addPublication() {
    let publications = lipid.publications;
    let pubmedExists = publications.find((i) => i.pubmedId === parseInt(newPubMedId));

    if (!pubmedExists) {
      wsCall("getpublication", "GET", [newPubMedId], true, null, addPublicationSuccess, addPublicationError);
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then((responseJson) => {
        setShowErrorSummary(false);
        setLipid({
          publications: lipid.publications.concat([responseJson]),
        });
        setNewPubMedId("");
      });
    }

    function addPublicationError(response) {
      response.text().then((resp) => {
        if (resp) {
          setPageErrorsJson(JSON.parse(resp));
        } else {
          setPageErrorMessage("The PubMed ID entered is invalid. Please try again.");
        }
        setShowErrorSummary(true);
      });
    }
  }

  const getStep2 = () => {
    return (
      <>
        <Form.Group as={Row} className="gg-align-center mb-3" controlId="inChiKey">
          <Col xs={12} lg={9}>
            <FormLabel label={displayNames.linker.INCHIKEY} />
            <Form.Control
              type="text"
              name="inChiKey"
              placeholder={`Enter ${displayNames.linker.INCHIKEY}`}
              value={lipid.inChiKey}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={27}
            />
            <Feedback message={`${displayNames.linker.INCHIKEY} is Invalid`} />

            {lipid.inChiKey !== "" && !disablePubChemFields && (
              <Button
                variant="contained"
                onClick={() => populateLinkerDetails(encodeURIComponent(lipid.inChiKey && lipid.inChiKey.trim()))}
                className="gg-btn-blue-reg btn-to-lower mt-3"
              >
                Insert Information from PubChem
              </Button>
            )}
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId="inChiSequence">
          <Col xs={12} lg={9}>
            <FormLabel label={displayNames.linker.INCHI_SEQUENCE} className="required-asterik" />
            <Form.Control
              as="textarea"
              rows="4"
              name="inChiSequence"
              placeholder={`Enter ${displayNames.linker.INCHI_SEQUENCE}`}
              value={lipid.inChiSequence}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={10000}
              isInvalid={validate}
              required
            />
            <div className="text-right text-muted">
              {lipid.inChiSequence && lipid.inChiSequence.length > 0 ? lipid.inChiSequence.length : "0"}
              /10000
            </div>
            <Feedback message={`${displayNames.linker.INCHI_SEQUENCE} is Invalid`} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId="iupacName">
          <Col xs={12} lg={9}>
            <FormLabel label="IUPAC Name" />
            <Form.Control
              type="text"
              name="iupacName"
              placeholder="Enter IUPAC Name"
              value={lipid.iupacName}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={2000}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="gg-align-center mb-3" controlId={"Mass"}>
          <Col xs={12} lg={9}>
            <FormLabel label="Monoisotopic Mass" />
            <Form.Control
              type="number"
              name="mass"
              placeholder="Enter Monoisotopic Mass"
              value={lipid.mass}
              onChange={handleChange}
              disabled={disablePubChemFields}
              onKeyDown={(e) => isValidNumber(e)}
              isInvalid={invalidMass}
            />
            <Feedback message={`Monoisotopic Mass is Invalid`} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId="Molecular Formula">
          <Col xs={12} lg={9}>
            <FormLabel label="Molecular Formula" />
            <Form.Control
              type="text"
              name="molecularFormula"
              placeholder="Enter Molecular Formula"
              value={lipid.molecularFormula}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={256}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId={"isomericSmiles"}>
          <Col xs={12} lg={9}>
            <FormLabel label={displayNames.linker.ISOMERIC_SMILES} />
            <Form.Control
              type="text"
              name="isomericSmiles"
              placeholder="Enter Isomeric SMILES"
              value={lipid.isomericSmiles}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={10000}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId={"canonicalSmiles"}>
          <Col xs={12} lg={9}>
            <FormLabel label={displayNames.linker.CANONICAL_SMILES} />
            <Form.Control
              type="text"
              name="canonicalSmiles"
              placeholder="Enter Canonical SMILES"
              value={lipid.canonicalSmiles}
              onChange={handleChange}
              disabled={disablePubChemFields}
              maxLength={10000}
            />

            {lipid.canonicalSmiles !== "" && !disablePubChemFields && (
              <Button
                variant="contained"
                onClick={() =>
                  populateLinkerDetails(encodeURIComponent(lipid.canonicalSmiles && lipid.canonicalSmiles.trim()))
                }
                className="gg-btn-blue-reg btn-to-lower mt-3"
              >
                Insert Information from PubChem
              </Button>
            )}
          </Col>
        </Form.Group>
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
                <RadioGroup name="molecule-type" onChange={handleSelect} value={lipid.selectedLipid}>
                  {/* SEQUENCE_DEFINED */}
                  <FormControlLabel
                    value="SequenceDefined"
                    control={<BlueRadio />}
                    label={displayNames.lipid.SEQUENCE}
                  />
                  {/* UNKNOWN */}
                  <FormControlLabel value="Unknown" control={<BlueRadio />} label={displayNames.lipid.UNKNOWN} />
                </RadioGroup>
              </Col>
            </Row>
          </Form>
        );
      case 1:
        if (activeStep === 1 && lipid.selectedLipid !== "Unknown") {
          return (
            <>
              <Form>
                <Form.Group as={Row} className="gg-align-center mb-3" controlId="pubChemId">
                  <Col xs={12} lg={9}>
                    <FormLabel label="PubChem Compound CID" />
                    <Form.Control
                      type="number"
                      name="pubChemId"
                      placeholder="Enter PubChem Compound CID"
                      value={lipid.pubChemId}
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

                    {lipid.pubChemId !== "" && !disablePubChemFields && (
                      <Button
                        variant="contained"
                        onClick={() => populateLinkerDetails(encodeURIComponent(lipid.pubChemId.trim()))}
                        className="gg-btn-blue-reg btn-to-lower mt-3"
                      >
                        Insert Information from PubChem
                      </Button>
                    )}
                  </Col>
                </Form.Group>

                {getStep2()}
                {/* Bottom Reset / Clear fields  Button */}
                <div className="text-center mb-2 mt-2">
                  <Button
                    variant="contained"
                    disabled={!disableReset}
                    onClick={clearPubChemFields}
                    className="gg-btn-blue btn-to-lower"
                  >
                    Clear Fields
                  </Button>
                </div>
              </Form>
            </>
          );
        }
      case 2:
        if (activeStep === 2) {
          return (
            <>
              <Form noValidate validated={validate && validatedCommNonComm}>
                <Form.Group as={Row} className="gg-align-center mb-3" controlId="name">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Name" className="required-asterik" />
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter Name"
                      value={lipid.name}
                      onChange={handleChange}
                      isInvalid={validate}
                      maxLength={100}
                      required
                    />
                    <Feedback message="Name is required" />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="gg-align-center mb-3" controlId="comments">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Comment" />
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="comment"
                      placeholder="Enter Comment"
                      value={lipid.comment}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <div className="text-right text-muted">
                      {lipid.comment && lipid.comment.length > 0 ? lipid.comment.length : "0"}
                      /2000
                    </div>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="gg-align-center mb-3" controlId="urls">
                  <Col xs={12} lg={9}>
                    <FormLabel label="URLs" />
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
                        <Button onClick={addURL} className="gg-btn-outline-reg">
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
                <Form.Group as={Row} className="gg-align-center mb-3" controlId="publications">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Publications" />
                    {lipid.publications.map((pub, index) => {
                      return (
                        <PublicationCard key={index} {...pub} enableDelete deletePublication={deletePublication} />
                      );
                    })}
                    <Row>
                      <Col md={10}>
                        <Form.Control
                          // type="number"
                          name="publication"
                          placeholder="Enter a Pubmed ID and click +"
                          value={newPubMedId}
                          onChange={(e) => {
                            const _value = e.target.value;
                            if (_value && !/^[0-9]+$/.test(_value)) {
                              return;
                            }
                            setNewPubMedId(_value);
                            numberLengthCheck(e);
                          }}
                          // onChange={(e) => setNewPubMedId(e.target.value)}
                          maxLength={100}
                          // onKeyDown={(e) => {
                          //   isValidNumber(e);
                          // }}
                          // onInput={(e) => {
                          //   numberLengthCheck(e);
                          // }}
                        />
                      </Col>
                      <Col md={1}>
                        <Button onClick={addPublication} className="gg-btn-outline-reg">
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

                <Row className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Source" />
                    <RadioGroup row name="molecule-type" onChange={sourceSelection} value={lipid.source}>
                      {/* Commercial */}
                      <FormControlLabel value="commercial" control={<BlueRadio />} label="Commercial" />
                      {/* Non Commercial */}
                      <FormControlLabel value="nonCommercial" control={<BlueRadio />} label="Non Commercial" />
                      {/* Not Specified */}
                      <FormControlLabel value="notSpecified" control={<BlueRadio />} label="Not Specified" />
                    </RadioGroup>
                  </Col>
                </Row>
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
          <Form>
            {Object.keys(reviewFields).map((key) =>
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
                <Form.Group as={Row} className="gg-align-center mb-3" controlId={key} key={key}>
                  <Col xs={12} lg={9}>
                    <FormLabel label={reviewFields[key].label} />
                    <Form.Control
                      as={reviewFields[key].type === "textarea" ? "textarea" : "input"}
                      rows={key === "sequence" ? "10" : "4"}
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

            {lipid.urls && lipid.urls.length > 0 && (
              <Form.Group as={Row} className="gg-align-center mb-3" controlId="urls">
                <Col xs={12} lg={9}>
                  <FormLabel label="URLs" />
                  {lipid.urls.map((url, index) => {
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
            {lipid.publications && lipid.publications.length > 0 && (
              <Form.Group as={Row} className="gg-align-center mb-3" controlId="publications">
                <Col xs={12} lg={9}>
                  <FormLabel label="Publications" />
                  {lipid.publications.map((pub) => {
                    return <PublicationCard key={pub.pubmedId} {...pub} enableDelete={false} />;
                  })}
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
      <div className="text-center mb-2">
        <Link to="/lipids">
          <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Lipids</Button>
        </Link>
        <Button disabled={activeStep === 0} onClick={handleBack} className="gg-btn-blue mt-2 gg-ml-20 gg-mr-20">
          Back
        </Button>
        <Button className="gg-btn-blue mt-2 gg-ml-20" onClick={handleNext}>
          {activeStep === steps.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    );
  }

  function addLipid(e) {
    setShowLoading(true);
    let unknownLipid = lipid.selectedLipid === "Unknown" ? true : false;

    var source = {
      type: "NOTRECORDED",
    };

    if (lipid.source === "commercial") {
      source.type = "COMMERCIAL";
      source.vendor = lipid.commercial.vendor;
      source.catalogueNumber = lipid.commercial.catalogueNumber;
      source.batchId = lipid.commercial.batchId;
    } else if (lipid.source === "nonCommercial") {
      source.type = "NONCOMMERCIAL";
      source.batchId = lipid.nonCommercial.batchId;
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
      description: lipid.comment,
      publications: lipid.publications,
      urls: lipid.urls,
      source: source,
    };

    wsCall(
      "addlinker",
      "POST",
      { unknown: unknownLipid },
      true,
      lipidObj,
      (response) => history.push("/lipids"),
      addLipidFailure
    );

    function addLipidFailure(response) {
      response.json().then((parsedJson) => {
        setPageErrorsJson(parsedJson);
        setShowErrorSummary(true);
      });
      setShowLoading(false);
    }
  }

  const isStepSkipped = (step) => {
    return lipid.selectedLipid === "Unknown" && step === 1 && (activeStep === 2 || activeStep === 3);
  };

  return (
    <>
      <Helmet>
        <title>{head.addLipid.title}</title>
        {getMeta(head.addLipid)}
      </Helmet>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading title="Add Lipid to Repository" subTitle="Please provide the information for the new lipid." />
          <Card>
            <Card.Body>
              <Stepper className="steper-responsive text-center" activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => {
                  const stepProps = {};
                  const labelProps = {};
                  if (isStepSkipped(index)) {
                    labelProps.optional = <Typography variant="caption">Unknown Lipid</Typography>;
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

AddLipid.propTypes = {};

export { AddLipid };
