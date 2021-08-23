/* eslint-disable no-fallthrough */
import React, { useReducer, useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FormLabel, Feedback, FormButton, Title, LinkButton } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import displayNames from "../appData/displayNames";
import { useHistory } from "react-router-dom";
import { Loading } from "../components/Loading";
import MultiToggle from "react-multi-toggle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PublicationCard } from "../components/PublicationCard";
import { csvToArray, isValidURL, externalizeUrl, isValidNumber, numberLengthCheck } from "../utils/commonUtils";
import { Button, Link } from "@material-ui/core";
import "../containers/AddLinker.css";

const AddOtherMolecule = props => {
  useEffect(props.authCheckAgent, []);

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [newPubMedId, setNewPubMedId] = useState("");
  const [invalidUrls, setInvalidUrls] = useState(false);
  const [validated, setValidated] = useState(false);
  const [newURL, setNewURL] = useState("");
  const history = useHistory();

  const othermoleculeInitialState = {
    selectedOtherMolecule: "SequenceDefined",
    name: "",
    comment: "",
    opensRing: 2,
    publications: [],
    urls: []
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [othermolecule, setOtherMolecule] = useReducer(reducer, othermoleculeInitialState);

  const handleChange = e => {
    setValidated(false);

    const name = e.target.name;
    const newValue = e.target.value;

    setOtherMolecule({ [name]: newValue });
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

  function addPublication() {
    let publications = othermolecule.publications;
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
          publications: othermolecule.publications.concat([responseJson])
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
    const publications = othermolecule.publications;
    const publicationToBeDeleted = publications.find(i => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    setOtherMolecule({ publications: publications });
  }

  function addURL() {
    var listUrls = othermolecule.urls;
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
        {othermolecule.urls && othermolecule.urls.length > 0
          ? othermolecule.urls.map((url, index) => {
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
                          const listUrls = othermolecule.urls;
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
        <Form className="radioform2" noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Name" className="required-asterik" />
            <Col md={4}>
              <Form.Control
                type="text"
                name="name"
                placeholder="name"
                value={othermolecule.name}
                onChange={handleChange}
                isInvalid={validated}
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
                value={othermolecule.comment}
                onChange={handleChange}
                maxLength={2000}
              />
              <span className="character-counter">
                {othermolecule.comment && othermolecule.comment.length > 0 ? othermolecule.comment.length : ""}
                /2000
              </span>
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="opensRing">
            <FormLabel label={displayNames.linker.OPENS_RING} />
            <Col md={4}>
              <MultiToggle
                options={opensRingOptions}
                selectedOption={othermolecule.opensRing}
                onSelectOption={value => setOtherMolecule({ opensRing: value })}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="publications">
            <FormLabel label="Publications" />
            <Col md={4}>
              {othermolecule.publications.map((pub, index) => {
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
          <FormButton className="line-break-1" type="submit" label="Submit" />
          <LinkButton to="/linkers" label="Cancel" />
        </Form>
      </>
    );
  }

  function handleSubmit(e) {
    debugger;
    setValidated(true);

    if (e.currentTarget.checkValidity() === true) {
      var othermoleculeObj = {
        type: "OTHER",
        name: othermolecule.name,
        comment: othermolecule.comment,
        opensRing: othermolecule.opensRing,
        publications: othermolecule.publications,
        urls: othermolecule.urls
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
    } else {
      e.preventDefault();
    }

    function addOtherMoleculeFailure(response) {
      response.json().then(parsedJson => {
        setPageErrorsJson(parsedJson);
        setShowErrorSummary(true);
      });
    }
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
