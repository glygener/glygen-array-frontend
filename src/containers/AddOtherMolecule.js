/* eslint-disable no-fallthrough */
import React, { useReducer, useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FormLabel, Feedback, FormButton, LinkButton } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { useHistory } from "react-router-dom";
import { Loading } from "../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PublicationCard } from "../components/PublicationCard";
import { csvToArray, isValidURL, externalizeUrl, isValidNumber, numberLengthCheck } from "../utils/commonUtils";
import { Button } from "@material-ui/core";
import "../containers/AddLinker.css";
import { Source } from "../components/Source";
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

const AddOtherMolecule = (props) => {
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
    nonCommercial: { providerLab: "", batchId: "", method: "", sourceComment: "" },
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [otherMolecule, setOtherMolecule] = useReducer(reducer, othermoleculeInitialState);

  const sourceSelection = (e) => {
    const newValue = e.target.value;
    setOtherMolecule({ source: newValue });
  };

  const sourceChange = (e) => {
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

  const handleChange = (e) => {
    setValidate(false);

    const name = e.target.name;
    const newValue = e.target.value;

    setOtherMolecule({ [name]: newValue });
  };

  function addPublication() {
    let publications = otherMolecule.publications;
    let pubmedExists = publications.find((i) => i.pubmedId === parseInt(newPubMedId));

    if (!pubmedExists) {
      wsCall("getpublication", "GET", [newPubMedId], true, null, addPublicationSuccess, addPublicationError);
    } else {
      setNewPubMedId("");
    }

    function addPublicationSuccess(response) {
      response.json().then((responseJson) => {
        setShowErrorSummary(false);
        setOtherMolecule({
          publications: otherMolecule.publications.concat([responseJson]),
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

  function deletePublication(id, wscall) {
    const publications = otherMolecule.publications;
    const publicationToBeDeleted = publications.find((i) => i.pubmedId === id);
    const pubDeleteIndex = publications.indexOf(publicationToBeDeleted);
    publications.splice(pubDeleteIndex, 1);
    setOtherMolecule({ publications: publications });
  }

  function addURL() {
    var listUrls = otherMolecule.urls;
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

      setOtherMolecule({ urls: listUrls });
    }
    setNewURL("");
  }

  const urlWidget = (enableDelete) => {
    return (
      <>
        {otherMolecule.urls && otherMolecule.urls.length > 0
          ? otherMolecule.urls.map((url, index) => {
              return (
                <Row key={index}>
                  <Col md={10}>
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
                              const listUrls = otherMolecule.urls;
                              listUrls.splice(index, 1);
                              setOtherMolecule({ urls: listUrls });
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

  function getStepContent() {
    return (
      <>
        <Form noValidate validated={validate && validatedCommNonComm} onSubmit={(e) => handleSubmit(e)}>
          <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Name" className="required-asterik" />
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
          <Form.Group as={Row} controlId="comments" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Comment" />
              <Form.Control
                as="textarea"
                rows={4}
                name="comment"
                placeholder="Enter Comment"
                value={otherMolecule.comment}
                onChange={handleChange}
                maxLength={2000}
              />
              <div className="text-right text-muted">
                {otherMolecule.comment && otherMolecule.comment.length > 0 ? otherMolecule.comment.length : "0"}
                /2000
              </div>
            </Col>
          </Form.Group>
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
          <Form.Group as={Row} controlId="publications" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Publications" />
              {otherMolecule.publications.map((pub, index) => {
                return <PublicationCard key={index} {...pub} enableDelete deletePublication={deletePublication} />;
              })}
              <Row>
                <Col md={10}>
                  <Form.Control
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
                    maxLength={100}
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
          <Row className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Source" />
              <RadioGroup row name="molecule-type" onChange={sourceSelection} value={otherMolecule.source}>
                {/* Commercial */}
                <FormControlLabel value="commercial" control={<BlueRadio />} label="Commercial" />
                {/* Non Commercial */}
                <FormControlLabel value="nonCommercial" control={<BlueRadio />} label="Non Commercial" />
                {/* Not Specified */}
                <FormControlLabel value="notSpecified" control={<BlueRadio />} label="Not Specified" />
              </RadioGroup>
            </Col>
          </Row>
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
          {/* <FormButton className="line-break-1" type="submit" label="Submit" />
          <LinkButton to="/linkers" label="Cancel" /> */}
          <div className="text-center mb-2">
            <Link to="/otherMolecules">
              <Button className="gg-btn-blue mt-2 gg-mr-20">Cancel</Button>
            </Link>
            <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
              Submit
            </Button>
          </div>
        </Form>
      </>
    );
  }

  function handleSubmit(e) {
    setValidate(true);

    var source = {
      type: "NOTRECORDED",
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
      source.batchId = otherMolecule.nonCommercial.batchId;
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
        source: source,
      };

      wsCall(
        "addlinker",
        "POST",
        null,
        true,
        othermoleculeObj,
        (response) => history.push("/otherMolecules"),
        addOtherMoleculeFailure
      );
    }

    function addOtherMoleculeFailure(response) {
      response.json().then((parsedJson) => {
        setValidate(false);
        setPageErrorsJson(parsedJson);
        setPageErrorMessage("");
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
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Add Other Molecule to Repository"
            subTitle="Please provide the information for other molecule."
          />
          <Card>
            <Card.Body>
              {showErrorSummary === true && (
                <ErrorSummary
                  show={showErrorSummary}
                  form="linkers"
                  errorJson={pageErrorsJson}
                  errorMessage={pageErrorMessage}
                />
              )}
              <div className="mt-4 mb-4">{getStepContent()}</div>
            </Card.Body>
          </Card>
        </div>
      </Container>
      <Loading show={showLoading} />
    </>
  );
};

AddOtherMolecule.propTypes = {};

export { AddOtherMolecule };
