import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
import { Source } from "./Source";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { csvToArray, isValidURL, externalizeUrl, isValidNumber, numberLengthCheck } from "../utils/commonUtils";
import MultiToggle from "react-multi-toggle";
import { Link } from "@material-ui/core";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "./ErrorSummary";
import { PublicationCard } from "./PublicationCard";
import { Loading } from "./Loading";

const AddGlycanInfoToFeature = props => {
  const [invalidUrls, setInvalidUrls] = useState(false);
  const [newURL, setNewURL] = useState("");
  const [newPubMedId, setNewPubMedId] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showLoading, setShowLoading] = useState(false);

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
      displayName: "Alpha",
      value: 4
    },
    {
      displayName: "Beta",
      value: 3
    },
    {
      displayName: "Open Ring",
      value: 2
    },
    {
      displayName: "Unknown",
      value: 1
    },
    {
      displayName: "Equilibrium",
      value: 0
    }
  ];

  const urlWidget = enableDelete => {
    return (
      <>
        {props.addGlycanInfoToFeature.urls && props.addGlycanInfoToFeature.urls.length > 0
          ? props.addGlycanInfoToFeature.urls.map((url, index) => {
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
                          const listUrls = props.addGlycanInfoToFeature.urls;
                          listUrls.splice(index, 1);
                          props.setAddGlycanInfoToFeature({ urls: listUrls });
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
      setShowLoading(true);
      wsCall("getpublication", "GET", [newPubMedId], true, null, addPublicationSuccess, addPublicationError);
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then(responseJson => {
        setShowErrorSummary(false);
        props.setAddGlycanInfoToFeature({ papers: props.addGlycanInfoToFeature.papers.concat([responseJson]) });
        setNewPubMedId("");
      });
      setShowLoading(false);
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
      setShowLoading(false);
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
        <div className="radioform1">
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Name" className={"required-asterik"} />
            <Col md={4}>
              <Form.Control
                type="text"
                name="name"
                placeholder="Name"
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

          <Form.Group as={Row} controlId="featureId">
            <FormLabel label="Feature Id" className={"required-asterik"} />
            <Col md={4}>
              <Form.Control
                type="text"
                name="featureId"
                placeholder="Feature Id"
                value={props.metadata.featureId}
                onChange={e => {
                  props.setMetadata({ featureId: e.target.value });
                  props.setMetadata({ validateFeatureId: false });
                }}
                isInvalid={props.metadata.validateFeatureId}
                maxLength={30}
                required
              />
              <Feedback message="Feature Id is required"></Feedback>
            </Col>
          </Form.Group>
        </div>
      </>
    );
  };

  const getDisableCheck = (purityField, validate) => {
    debugger;
    let purityDetails = props.metadata.purity;
    return (
      <>
        <Col>
          <Form.Group className="mb-3" controlId={`${purityField}`}>
            <Form.Check
              type="checkbox"
              label={"not reported"}
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
        <Form.Group as={Row} controlId="purityComment">
          <FormLabel label="Comment" />
          <Col md={4}>
            <Form.Control
              as="textarea"
              rows={4}
              name={"comment"}
              placeholder={"comment"}
              value={props.metadata.purity && props.metadata.purity.comment}
              onChange={purityInfoChange}
              maxLength={2000}
            />
            <span className="character-counter" style={{ marginLeft: "80%" }}>
              {props.metadata.purity && props.metadata.purity.comment && props.metadata.purity.comment.length > 0
                ? props.metadata.purity.comment.length
                : ""}
              /2000
            </span>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"value"}>
          <FormLabel label={"Value"} className={"required-asterik"} />
          <Col md={4}>
            <Form.Control
              name={"value"}
              type={"text"}
              placeholder={"value"}
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

        <Form.Group as={Row} controlId={"method"}>
          <FormLabel label={"Method"} className={"required-asterik"} />
          <Col md={4}>
            <Form.Control
              name={"method"}
              type={"text"}
              placeholder={"method"}
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
      </>
    );
  };

  const getSourceOptions = sourceProp => {
    return (
      <>
        <Row>
          <FormLabel label="Source" />

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
        &nbsp;&nbsp;&nbsp;
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

      <Form.Group as={Row} controlId="papers">
        <FormLabel label="Papers" />
        <Col md={6}>
          {props.addGlycanInfoToFeature.papers.map((pub, index) => {
            return <PublicationCard key={index} {...pub} enableDelete deletePublication={deletePublication} />;
          })}
          <Row>
            <Col md={10}>
              <Form.Control
                type="number"
                name="papers"
                placeholder="Enter name of the Paper and click +"
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

      <Form.Group as={Row} controlId="opensRing">
        <FormLabel label={"Opens Ring"} />
        <Col md={6}>
          <MultiToggle
            options={opensRingOptions}
            selectedOption={props.addGlycanInfoToFeature.opensRing}
            onSelectOption={value => {
              props.setAddGlycanInfoToFeature({ opensRing: value });
            }}
          />
        </Col>
      </Form.Group>
      {props.addGlycanInfoToFeature.opensRing === 0 && (
        <Form.Group as={Row} controlId="equilibriumComment">
          <FormLabel label="Comment" />
          <Col md={4}>
            <Form.Control
              as="textarea"
              rows={4}
              name={"equilibriumComment"}
              placeholder={"equilibrium comment"}
              value={props.addGlycanInfoToFeature.equilibriumComment}
              onChange={e => {
                const name = e.target.name;
                props.setAddGlycanInfoToFeature({
                  [name]: e.target.value
                });
              }}
              maxLength={2000}
            />
            <span className="character-counter" style={{ marginLeft: "80%" }}>
              {props.addGlycanInfoToFeature.equilibriumComment.length > 0
                ? props.addGlycanInfoToFeature.equilibriumComment.length
                : ""}
              /2000
            </span>
          </Col>
        </Form.Group>
      )}
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
            <Row>
              <FormLabel label="Purity" />

              <Col md={{ span: 6 }} style={{ marginLeft: "30px" }}>
                <Form.Check.Label>
                  <Form.Check.Input
                    type="radio"
                    value={"specify"}
                    label={"Specify"}
                    onChange={purityInfoChange}
                    checked={props.metadata.purity.purityNotSpecified === "specify"}
                  />
                  {"Specify"}&nbsp;&nbsp;&nbsp;&nbsp;
                </Form.Check.Label>
                &nbsp;&nbsp; &nbsp;&nbsp;
                <Form.Check.Label>
                  <Form.Check.Input
                    type="radio"
                    value={"notSpecified"}
                    label={"Not Specified"}
                    onChange={purityInfoChange}
                    checked={props.metadata.purity.purityNotSpecified === "notSpecified"}
                  />
                  {"Not Specified"}
                </Form.Check.Label>
              </Col>
            </Row>
            &nbsp; &nbsp;&nbsp;
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
