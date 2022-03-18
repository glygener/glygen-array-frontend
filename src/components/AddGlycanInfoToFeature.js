import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
import { Source } from "./Source";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { csvToArray, isValidURL, externalizeUrl, isValidNumber, numberLengthCheck } from "../utils/commonUtils";
import MultiToggle from "react-multi-toggle";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "./ErrorSummary";
import { PublicationCard } from "./PublicationCard";
import { Loading } from "./Loading";
import "../containers/AddFeature.css";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { Link } from "react-router-dom";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import { BlueRadio } from "../components/FormControls";
import { Image } from "react-bootstrap";
import plusIcon from "../images/icons/plus.svg";
import { Table } from "react-bootstrap";

const AddGlycanInfoToFeature = props => {
  const [invalidUrls, setInvalidUrls] = useState(false);
  const [newURL, setNewURL] = useState("");
  const [newPubMedId, setNewPubMedId] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showLoading, setShowLoading] = useState(false);

  const [minRangeInValid, setMinRangeInValid] = useState(false);
  const [maxRangeInValid, setMaxRangeInValid] = useState(false);

  const sourceInfoChange = (e, glycanId) => {
    const name = e.target.name;
    const newValue = e.target.value;

    if (props.addGlycanInfoToFeature.source === "commercial") {
      if (name === "vendor") {
        props.setAddGlycanInfoToFeature({ validatedCommNonComm: false });
      }

      let comm = props.addGlycanInfoToFeature.commercial;
      comm[name] = newValue;

      props.setAddGlycanInfoToFeature({ [props.addGlycanInfoToFeature.commercial]: comm });
    } else {
      if (name === "providerLab") {
        props.setAddGlycanInfoToFeature({ validatedCommNonComm: false });
      }

      let nonComm = props.addGlycanInfoToFeature.nonCommercial;
      nonComm[name] = newValue;

      props.setAddGlycanInfoToFeature({ [props.addGlycanInfoToFeature.nonCommercial]: nonComm });
    }
  };

  const sourceInfoChangeForMetadata = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    if (props.metadata.source === "commercial") {
      if (name === "vendor") {
        props.setMetadata({ validatedCommNonComm: false });
      }

      let comm = props.metadata.commercial;
      comm[name] = newValue;

      props.setMetadata({ [props.metadata.commercial]: comm });
    } else {
      if (name === "providerLab") {
        props.setMetadata({ validatedCommNonComm: false });
      }

      let nonComm = props.metadata.nonCommercial;
      nonComm[name] = newValue;

      props.setMetadata({ [props.metadata.nonCommercial]: nonComm });
    }
  };

  const purityInfoChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;
    let purityDetails;

    if (name === "" && (newValue === "specify" || newValue === "notSpecified")) {
      purityDetails = props.metadata.purity;
      purityDetails.purityNotSpecified = newValue;
      props.setMetadata({ validateMethod: false });
      props.setMetadata({ validateValue: false });
    } else {
      if (name === "method") {
        props.setMetadata({ validateMethod: false });
      } else if (name === "value") {
        props.setMetadata({ validateValue: false });
      }

      purityDetails = props.metadata.purity;
      purityDetails[name] = newValue;
    }

    props.setMetadata({ [props.metadata.purity]: purityDetails });
  };

  const handleSourceChange = (e, glycanId) => {
    const newValue = e.target.value;

    if (props.isMetadata) {
      if (newValue === "commercial") {
        let commercial = props.metadata.commercial;
        commercial["vendorNotRecorded"] = false;
        props.setMetadata({ [props.metadata.commercial]: commercial });
      } else if (newValue === "nonCommercial") {
        let nonCommercial = props.metadata.nonCommercial;
        nonCommercial["providerLabNotRecorded"] = false;
        props.setMetadata({ [props.metadata.nonCommercial]: nonCommercial });
      }

      props.setMetadata({ source: newValue });
      props.setMetadata({ validatedCommNonComm: false });
    } else {
      props.setAddGlycanInfoToFeature({ source: newValue });
      props.setAddGlycanInfoToFeature({ validatedCommNonComm: false });
    }
  };

  const opensRingOptions = [
    {
      displayName: "Open Ring",
      value: 0,
    },
    {
      displayName: "Alpha",
      value: 1,
    },
    {
      displayName: "Beta",
      value: 2,
    },
    {
      displayName: "Unknown",
      value: 3,
    },
    {
      displayName: "Equilibrium",
      value: 4,
    },
  ];

  const urlWidget = enableDelete => {
    return (
      <>
        {props.addGlycanInfoToFeature.urls && props.addGlycanInfoToFeature.urls.length > 0
          ? props.addGlycanInfoToFeature.urls.map((url, index) => {
              return (
                <Table hover className="borderless mb-0">
                  <tbody>
                    <tr key={index}>
                      <td>
                        <a href={externalizeUrl(url)} target="_blank" rel="external noopener noreferrer">
                          {url}
                        </a>
                      </td>
                      {enableDelete && (
                        <td className="text-right">
                          <LineTooltip text="Delete URL">
                            <Link>
                              <FontAwesomeIcon
                                icon={["far", "trash-alt"]}
                                size="lg"
                                alt="Delete URL"
                                className="caution-color tbl-icon-btn"
                                onClick={() => {
                                  const listUrls = props.addGlycanInfoToFeature.urls;
                                  listUrls.splice(index, 1);
                                  props.setAddGlycanInfoToFeature({ urls: listUrls });
                                }}
                              />
                            </Link>
                          </LineTooltip>
                        </td>
                      )}
                    </tr>
                  </tbody>
                </Table>
              );
            })
          : ""}
      </>
    );
  };

  function addURL() {
    var listUrls = props.addGlycanInfoToFeature.urls;
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

      props.setAddGlycanInfoToFeature({ urls: listUrls });
    }
    setNewURL("");
  }

  function addPublication() {
    let publications = props.addGlycanInfoToFeature.papers;
    let pubmedExists = publications.find(i => i.pubmedId === parseInt(newPubMedId));

    if (!pubmedExists) {
      wsCall("getpublication", "GET", [newPubMedId], true, null, addPublicationSuccess, addPublicationError);
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then(responseJson => {
        setShowErrorSummary(false);
        props.setAddGlycanInfoToFeature({
          papers: props.addGlycanInfoToFeature.papers.concat([responseJson]),
        });
        setNewPubMedId("");
      });
    }

    function addPublicationError(response) {
      response.text().then(resp => {
        if (resp) {
          setPageErrorsJson(JSON.parse(resp));
        } else {
          setPageErrorMessage("The PubMed ID entered is invalid. Please try again.");
        }
        setShowErrorSummary(true);
      });
    }
  }

  function deletePublication(id, wscall) {
    const publications = props.addGlycanInfoToFeature.papers;
    const publicationToBeDeleted = publications.find(i => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    props.setAddGlycanInfoToFeature({ papers: publications });
  }

  const getMetadataNameandId = () => {
    return (
      <>
        <div className="line-break-2">
          <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Name" className="required-asterik" />
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter Name"
                value={props.metadata.name}
                onChange={e => {
                  props.setMetadata({ name: e.target.value });
                  props.setMetadata({ invalidName: false });
                }}
                isInvalid={props.metadata.invalidName}
                maxLength={50}
                required
              />
              <Feedback message="Name is required"></Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="featureId" className="gg-align-center mb-3">
            <FormLabel label="Feature ID" className={"required-asterik"} />
            <Col md={4}>
              <Form.Control
                type="text"
                name="featureId"
                placeholder="Enter Feature ID"
                value={props.metadata.featureId}
                onChange={e => {
                  props.setMetadata({ featureId: e.target.value });
                  props.setMetadata({ validateFeatureId: false });
                }}
                isInvalid={props.metadata.validateFeatureId}
                maxLength={30}
                required
              />
              <Feedback message="Feature ID is required"></Feedback>
            </Col>
          </Form.Group>
        </div>
      </>
    );
  };

  const getDisableCheck = (purityField, validate) => {
    let purityDetails = props.metadata.purity;
    return (
      <>
        <Col>
          <Form.Group className="mb-3" controlId={`${purityField}`}>
            <Form.Check
              type="checkbox"
              label="Not Reported"
              onChange={() => {
                purityDetails[purityField] = !purityDetails[purityField];
                props.setMetadata({ [props.metadata.purity]: purityDetails });
                props.setMetadata({ [validate]: false });
              }}
              defaultChecked={purityDetails[purityField]}
            />
          </Form.Group>
        </Col>
      </>
    );
  };

  const commercialNotRecordedChange = () => {
    let commercial = props.metadata.commercial;
    commercial["vendorNotRecorded"] = !commercial["vendorNotRecorded"];

    props.setMetadata({ validatedCommNonComm: false });
    props.setMetadata({ [props.metadata.commercial]: commercial });
  };

  const nonCommercialNotRecordedChange = () => {
    let nonCommercial = props.metadata.nonCommercial;
    nonCommercial["providerLabNotRecorded"] = !nonCommercial["providerLabNotRecorded"];

    props.setMetadata({ validatedCommNonComm: false });
    props.setMetadata({ [props.metadata.nonCommercial]: nonCommercial });
  };

  const getPurityDescriptors = () => {
    return (
      <>
        <div className="line-break-2">
          <Form.Group as={Row} controlId="value" className="gg-align-center mb-3">
            <FormLabel label="Value" className="required-asterik" />
            <Col md={4}>
              <Form.Control
                name="value"
                type="text"
                placeholder="value"
                value={props.metadata.purity && props.metadata.purity.value}
                isInvalid={props.metadata.validateValue}
                onChange={purityInfoChange}
                disabled={props.metadata.purity.valueNotRecorded}
                required
              />
              <Feedback message={"Value is required"} />
            </Col>
            {getDisableCheck("valueNotRecorded", "validateValue")}
          </Form.Group>

          <Form.Group as={Row} controlId="method" className="gg-align-center mb-3">
            <FormLabel label="Method" className="required-asterik" />
            <Col md={4}>
              <Form.Control
                name="method"
                as="textarea"
                rows={4}
                placeholder="Enter Method"
                value={props.metadata.purity && props.metadata.purity.method}
                isInvalid={props.metadata.validateMethod}
                onChange={purityInfoChange}
                disabled={props.metadata.purity.methodNotRecorded}
                required
              />
              <Feedback message={"Method is required"} />
            </Col>
            {getDisableCheck("methodNotRecorded", "validateMethod")}
          </Form.Group>

          <Form.Group as={Row} controlId="purityComment" className="gg-align-center mb-3">
            <FormLabel label="Comment" />
            <Col md={4}>
              <Form.Control
                as="textarea"
                rows={4}
                name="comment"
                placeholder="Comment"
                value={props.metadata.purity && props.metadata.purity.comment}
                onChange={purityInfoChange}
                maxLength={2000}
              />
              <div className="text-right text-muted">
                {props.metadata.purity && props.metadata.purity.comment && props.metadata.purity.comment.length > 0
                  ? props.metadata.purity.comment.length
                  : "0"}
                /2000
              </div>
            </Col>
          </Form.Group>
        </div>
      </>
    );
  };

  const getSourceOptions = sourceProp => {
    return (
      <>
        <Row className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Source" />
            <RadioGroup row name="molecule-type" onChange={handleSourceChange} value={sourceProp}>
              {/* Commercial */}
              <FormControlLabel value="commercial" control={<BlueRadio />} label="Commercial" />
              {/* Non Commercial */}
              <FormControlLabel value="nonCommercial" control={<BlueRadio />} label="Non Commercial" />
              {/* Not Recorded */}
              <FormControlLabel value="notSpecified" control={<BlueRadio />} label="Not Recorded" />
            </RadioGroup>
          </Col>
        </Row>
        {/* <Row
          style={{
            marginTop: "1em",
          }}
        >
          <FormLabel label="Source" className={"metadata-descriptor-title "} />

          <Col md={{ span: 6 }} style={{ marginLeft: "30px" }}>
            <Form.Check.Label>
              <Form.Check.Input
                type="radio"
                value={"commercial"}
                label={"Commercial"}
                onChange={handleSourceChange}
                checked={sourceProp === "commercial"}
              />
              {"Commercial"}&nbsp;&nbsp;&nbsp;&nbsp;
            </Form.Check.Label>
            &nbsp;&nbsp; &nbsp;&nbsp;
            <Form.Check.Label>
              <Form.Check.Input
                type="radio"
                label={"Non Commercial"}
                value={"nonCommercial"}
                onChange={handleSourceChange}
                checked={sourceProp === "nonCommercial"}
              />
              {"Non Commercial"}&nbsp;&nbsp;&nbsp;&nbsp;
            </Form.Check.Label>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Form.Check.Label>
              <Form.Check.Input
                type="radio"
                value={"notSpecified"}
                label={"Not Specified"}
                onChange={handleSourceChange}
                checked={sourceProp === "notSpecified"}
              />
              {"Not Specified"}
            </Form.Check.Label>
          </Col>
        </Row>
        &nbsp;&nbsp;&nbsp; */}
      </>
    );
  };

  const getCommercialSourceWizard = (sourceChange, validate, commercial, isMetadata, notRecorded) => {
    return (
      <>
        <Source
          isCommercial
          commercial={commercial}
          validate={validate}
          sourceChange={sourceChange}
          isMetadata={isMetadata}
          commercialNotRecordedChange={notRecorded}
        />
      </>
    );
  };

  const getNonCommercialSourceWizard = (sourceChange, validate, nonCommercial, isMetadata, notRecorded) => {
    return (
      <>
        <Source
          isNonCommercial
          nonCommercial={nonCommercial}
          validate={validate}
          sourceChange={sourceChange}
          isMetadata={isMetadata}
          nonCommercialNotRecordedChange={notRecorded}
        />
      </>
    );
  };

  const getRange = () => {
    return (
      <>
        <Form noValidate validated={minRangeInValid && maxRangeInValid}>
          <Form.Group as={Row} controlId="range" className="gg-align-center mb-3">
            <FormLabel label="Add Range" className="gg-blue" />
          </Form.Group>
          <Form.Group as={Row} className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Min" />
              <Form.Control
                type="number"
                name="minRange"
                placeholder="Enter Min Range"
                value={props.addGlycanInfoToFeature.minRangeSelected}
                isInvalid={minRangeInValid}
                onChange={e => {
                  if (
                    parseInt(e.target.value) > parseInt(props.maxRange) ||
                    parseInt(e.target.value) < 1 ||
                    (props.addGlycanInfoToFeature.maxRangeSelected !== "" &&
                      parseInt(e.target.value) > parseInt(props.addGlycanInfoToFeature.maxRangeSelected))
                  ) {
                    setMinRangeInValid(true);
                  } else {
                    setMinRangeInValid(false);
                  }
                  props.setAddGlycanInfoToFeature({ minRangeSelected: e.target.value });
                }}
                min={1}
                onKeyDown={e => {
                  if (e.key.length === 1) {
                    if (e.key !== "v" && e.key !== "V") {
                      isValidNumber(e);
                    }
                  }
                }}
              />
              <Feedback message="Invalid Min Range" />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Max" />
              <Form.Control
                type="number"
                name="maxRange"
                placeholder="Enter Max Range"
                value={props.addGlycanInfoToFeature.maxRangeSelected}
                isInvalid={maxRangeInValid}
                onChange={e => {
                  if (
                    parseInt(e.target.value) > parseInt(props.maxRange) ||
                    parseInt(e.target.value) < 1 ||
                    parseInt(e.target.value) < parseInt(props.addGlycanInfoToFeature.minRangeSelected)
                  ) {
                    setMaxRangeInValid(true);
                  } else {
                    setMaxRangeInValid(false);
                  }
                  props.setAddGlycanInfoToFeature({ maxRangeSelected: e.target.value });
                }}
                min={1}
                onKeyDown={e => {
                  if (e.key.length === 1) {
                    if (e.key !== "v" && e.key !== "V") {
                      isValidNumber(e);
                    }
                  }
                }}
              />
              <Feedback message="Invalid Max Range" />
            </Col>
          </Form.Group>
        </Form>
      </>
    );
  };

  return props.step2 ? (
    <>
      {showErrorSummary === true && (
        <ErrorSummary
          show={showErrorSummary}
          form="linkers"
          errorJson={pageErrorsJson}
          errorMessage={pageErrorMessage}
        />
      )}

      <Form.Group as={Row} controlId="urls" className="gg-align-center mb-3">
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
                onChange={e => {
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

      <Form.Group as={Row} controlId="papers" className="gg-align-center mb-3">
        <Col xs={12} lg={9}>
          <FormLabel label="Paper" />
          {props.addGlycanInfoToFeature.papers.map((pub, index) => {
            return <PublicationCard key={index} {...pub} enableDelete deletePublication={deletePublication} />;
          })}
          <Row>
            <Col md={10}>
              <Form.Control
                // type="number"
                name="papers"
                placeholder="Enter name of the Paper and click +"
                value={newPubMedId}
                maxLength={100}
                onChange={e => {
                  const _value = e.target.value;
                  if (_value && !/^[0-9]+$/.test(_value)) {
                    return;
                  }
                  setNewPubMedId(_value);
                  numberLengthCheck(e);
                }}
              />
            </Col>
            <Col md={1}>
              <Button onClick={addPublication} className="gg-btn-outline-reg">
                <LineTooltip text="Add Paper">
                  <Link>
                    <Image src={plusIcon} alt="plus button" />
                  </Link>
                </LineTooltip>
              </Button>
            </Col>
          </Row>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="opensRing" className="gg-align-center">
        <Col xs={12} lg={9}>
          <FormLabel label={"Anomer/Ring Configuration"} />
          <MultiToggle
            options={opensRingOptions}
            selectedOption={props.addGlycanInfoToFeature.opensRing}
            onSelectOption={value => {
              props.setAddGlycanInfoToFeature({ opensRing: value });
            }}
          />
        </Col>
      </Form.Group>

      {props.addGlycanInfoToFeature.opensRing === 4 && (
        <Form.Group as={Row} controlId="equilibriumComment" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Comment" />
            <Form.Control
              as="textarea"
              rows={4}
              name="equilibriumComment"
              placeholder="Enter Equilibrium Comment"
              value={props.addGlycanInfoToFeature.equilibriumComment}
              onChange={e => {
                const name = e.target.name;
                props.setAddGlycanInfoToFeature({
                  [name]: e.target.value,
                });
              }}
              maxLength={2000}
            />
            <div className="text-right text-muted">
              {props.addGlycanInfoToFeature.equilibriumComment.length > 0
                ? props.addGlycanInfoToFeature.equilibriumComment.length
                : "0"}
              /2000
            </div>
          </Col>
        </Form.Group>
      )}
      <Loading show={showLoading} />
    </>
  ) : props.step3 ? (
    <>
      {getRange()}
      <Loading show={showLoading} />
    </>
  ) : (
    <>
      <Form
        className="radioform2"
        validated={
          props.isMetadata
            ? props.metadata.validatedCommNonComm || props.metadata.validateValue || props.metadata.validateMethod
            : props.addGlycanInfoToFeature.validatedCommNonComm
        }
      >
        {props.isMetadata ? (
          <>
            {getMetadataNameandId()}
            <Row className="gg-align-center mb-3">
              <Col xs={12} lg={9}>
                <FormLabel label="Purity" />
                <RadioGroup row name="molecule-type" onChange={purityInfoChange} value={props.metadata.purity}>
                  {/* Specify */}
                  <FormControlLabel value="specify" control={<BlueRadio />} label="Specify" />
                  {/* Not Recorded */}
                  <FormControlLabel value="notSpecified" control={<BlueRadio />} label="Not Recorded" />
                </RadioGroup>

                {/* <Form.Check.Label>
                  <Form.Check.Input
                    type="radio"
                    value={"specify"}
                    label={"Specify"}
                    onChange={purityInfoChange}
                    checked={props.metadata.purity.purityNotSpecified === "specify"}
                  />
                  {"Specify"}
                </Form.Check.Label>
                <Form.Check.Label>
                  <Form.Check.Input
                    type="radio"
                    value={"notSpecified"}
                    label={"Not Specified"}
                    onChange={purityInfoChange}
                    checked={props.metadata.purity.purityNotSpecified === "notSpecified"}
                  />
                  {"Not Specified"}
                </Form.Check.Label> */}
              </Col>
            </Row>
            {props.metadata.purity.purityNotSpecified === "specify" && getPurityDescriptors()}
            {/* commercial, non commercial and notspecified selection options  */}
            {getSourceOptions(props.metadata.source)}
            {props.metadata.source === "commercial"
              ? getCommercialSourceWizard(
                  sourceInfoChangeForMetadata,
                  props.metadata.validatedCommNonComm,
                  props.metadata.commercial,
                  props.isMetadata,
                  commercialNotRecordedChange
                )
              : props.metadata.source === "nonCommercial" &&
                getNonCommercialSourceWizard(
                  sourceInfoChangeForMetadata,
                  props.metadata.validatedCommNonComm,
                  props.metadata.nonCommercial,
                  props.isMetadata,
                  nonCommercialNotRecordedChange
                )}
          </>
        ) : (
          <>
            {getSourceOptions(props.addGlycanInfoToFeature.source)}

            {props.addGlycanInfoToFeature.source === "commercial"
              ? getCommercialSourceWizard(
                  sourceInfoChange,
                  props.addGlycanInfoToFeature.validatedCommNonComm,
                  props.addGlycanInfoToFeature.commercial,
                  false,
                  ""
                )
              : props.addGlycanInfoToFeature.source === "nonCommercial" &&
                getNonCommercialSourceWizard(
                  sourceInfoChange,
                  props.addGlycanInfoToFeature.validatedCommNonComm,
                  props.addGlycanInfoToFeature.nonCommercial,
                  false,
                  ""
                )}
          </>
        )}
      </Form>
      <Loading show={showLoading} />
    </>
  );
};

export { AddGlycanInfoToFeature };
