/* eslint-disable no-fallthrough */
import React, { useReducer, useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FormLabel, Feedback, FormButton, Title, LinkButton } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { useHistory } from "react-router-dom";
import { Loading } from "../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PublicationCard } from "../components/PublicationCard";
import { csvToArray, isValidURL, externalizeUrl, isValidNumber, numberLengthCheck } from "../utils/commonUtils";
import { Button, Link } from "@material-ui/core";
import "../containers/AddLinker.css";
import { Source } from "../components/Source";

const AddOtherMolecule = props => {
  useEffect(props.authCheckAgent, []);

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [newPubMedId, setNewPubMedId] = useState("");
  const [invalidUrls, setInvalidUrls] = useState(false);
  const [validate, setValidate] = useState(false);
  const [newURL, setNewURL] = useState("");
  const [validatedCommNonComm, setValidatedCommNonComm] = useState(false);
  const history = useHistory();

  const othermoleculeInitialState = {
    selectedOtherMolecule: "SequenceDefined",
    name: "",
    comment: "",
    publications: [],
    urls: [],
    source: "notSpecified",
    commercial: { vendor: "", catalogueNumber: "", batchId: "" },
    nonCommercial: { providerLab: "", batchId: "", method: "", sourceComment: "" }
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [otherMolecule, setOtherMolecule] = useReducer(reducer, othermoleculeInitialState);

  const sourceSelection = e => {
    const newValue = e.target.value;
    setOtherMolecule({ source: newValue });
  };

  const sourceChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    if (otherMolecule.source === "commercial") {
      if (name === "vendor") {
        setValidatedCommNonComm(false);
      }
      let comm = otherMolecule.commercial;
      comm[name] = newValue;
      setOtherMolecule({ [otherMolecule.commercial]: comm });
    } else {
      if (name === "providerLab") {
        setValidatedCommNonComm(false);
      }

      let nonComm = otherMolecule.nonCommercial;
      nonComm[name] = newValue;
      setOtherMolecule({ [otherMolecule.nonCommercial]: nonComm });
    }
  };

  const handleChange = e => {
    setValidate(false);

    const name = e.target.name;
    const newValue = e.target.value;

    setOtherMolecule({ [name]: newValue });
  };

  function addPublication() {
    let publications = otherMolecule.publications;
    let pubmedExists = publications.find(i => i.pubmedId === parseInt(newPubMedId));

    if (!pubmedExists) {
      wsCall("getpublication", "GET", [newPubMedId], true, null, addPublicationSuccess, addPublicationError);
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then(responseJson => {
        setShowErrorSummary(false);
        setOtherMolecule({
          publications: otherMolecule.publications.concat([responseJson])
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
    const publications = otherMolecule.publications;
    const publicationToBeDeleted = publications.find(i => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    setOtherMolecule({ publications: publications });
  }

  function addURL() {
    var listUrls = otherMolecule.urls;
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

      setOtherMolecule({ urls: listUrls });
    }
    setNewURL("");
  }

  const urlWidget = enableDelete => {
    return (
      <>
        {otherMolecule.urls && otherMolecule.urls.length > 0
          ? otherMolecule.urls.map((url, index) => {
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
                          const listUrls = otherMolecule.urls;
                          listUrls.splice(index, 1);
                          setOtherMolecule({ urls: listUrls });
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

  function getStepContent() {
    return (
      <>
        <Form
          className="radioform2"
          noValidate
          validated={validate && validatedCommNonComm}
          onSubmit={e => handleSubmit(e)}
        >
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Name" className="required-asterik" />
            <Col md={4}>
              <Form.Control
                type="text"
                name="name"
                placeholder="name"
                value={otherMolecule.name}
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
                value={otherMolecule.comment}
                onChange={handleChange}
                maxLength={2000}
              />
              <span className="character-counter">
                {otherMolecule.comment && otherMolecule.comment.length > 0 ? otherMolecule.comment.length : ""}
                /2000
              </span>
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="publications">
            <FormLabel label="Publications" />
            <Col md={4}>
              {otherMolecule.publications.map((pub, index) => {
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
                  checked={otherMolecule.source === "commercial"}
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
                  checked={otherMolecule.source === "nonCommercial"}
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
                  checked={otherMolecule.source === "notSpecified"}
                />
                {"Not Specified"}
              </Form.Check.Label>
            </Col>
          </Row>
          &nbsp;&nbsp;&nbsp;
          {otherMolecule.source === "commercial" ? (
            <Source
              isCommercial
              commercial={otherMolecule.commercial}
              validate={validatedCommNonComm}
              sourceChange={sourceChange}
            />
          ) : (
            otherMolecule.source === "nonCommercial" && (
              <Source
                isNonCommercial
                nonCommercial={otherMolecule.nonCommercial}
                validate={validatedCommNonComm}
                sourceChange={sourceChange}
              />
            )
          )}
          <FormButton className="line-break-1" type="submit" label="Submit" />
          <LinkButton to="/linkers" label="Cancel" />
        </Form>
      </>
    );
  }

  function handleSubmit(e) {
    setValidate(true);

    var source = {
      type: "NOTRECORDED"
    };

    if (otherMolecule.source === "commercial") {
      if (otherMolecule.commercial.vendor === "") {
        setValidatedCommNonComm(true);
      }

      source.type = "COMMERCIAL";
      source.vendor = otherMolecule.commercial.vendor;
      source.catalogueNumber = otherMolecule.commercial.catalogueNumber;
      source.batchId = otherMolecule.commercial.batchId;
    } else if (otherMolecule.source === "nonCommercial") {
      if (otherMolecule.nonCommercial.providerLab === "") {
        setValidatedCommNonComm(true);
      }

      source.type = "NONCOMMERCIAL";
      source.batchId = otherMolecule.commercial.batchId;
      source.providerLab = otherMolecule.nonCommercial.providerLab;
      source.method = otherMolecule.nonCommercial.method;
      source.comment = otherMolecule.nonCommercial.sourceComment;
    }

    if (e.currentTarget.checkValidity() === true && !validatedCommNonComm) {
      var othermoleculeObj = {
        type: "OTHER",
        name: otherMolecule.name,
        comment: otherMolecule.comment,
        description: otherMolecule.comment,
        publications: otherMolecule.publications,
        urls: otherMolecule.urls,
        source: source
      };

      wsCall(
        "addlinker",
        "POST",
        null,
        true,
        othermoleculeObj,
        response => history.push("/othermolecules"),
        addOtherMoleculeFailure
      );
    }

    function addOtherMoleculeFailure(response) {
      response.json().then(parsedJson => {
        setPageErrorsJson(parsedJson);
        setShowErrorSummary(true);
      });
    }

    e.preventDefault();
  }

  return (
    <>
      <Helmet>
        <title>{head.addOtherMolecule.title}</title>
        {getMeta(head.addOtherMolecule)}
      </Helmet>

      <div className="page-container">
        <Title title="Add OtherMolecule to Repository" />
        &nbsp; &nbsp;
        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="othermolecules"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}
        <div>{getStepContent()}</div>
      </div>
      <Loading show={showLoading} />
    </>
  );
};

AddOtherMolecule.propTypes = {};

export { AddOtherMolecule };
