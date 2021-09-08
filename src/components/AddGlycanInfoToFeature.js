import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
import { Source } from "./Source";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { externalizeUrl, csvToArray, isValidURL } from "../utils/commonUtils";
import MultiToggle from "react-multi-toggle";
import { Link } from "@material-ui/core";

const AddGlycanInfoToFeature = props => {
  const [invalidUrls, setInvalidUrls] = useState(false);
  const [newURL, setNewURL] = useState("");
  const [newPaper, setNewPaper] = useState("");

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

  const handleSourceChange = (e, glycanId) => {
    const newValue = e.target.value;
    props.setAddGlycanInfoToFeature({ source: newValue });
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

  const paperWidget = enableDelete => {
    return (
      <>
        {props.addGlycanInfoToFeature.papers && props.addGlycanInfoToFeature.papers.length > 0
          ? props.addGlycanInfoToFeature.papers.map((paper, index) => {
              return (
                <Row style={{ marginTop: "8px" }} key={index}>
                  <Col md={10}>{paper}</Col>
                  {enableDelete && (
                    <Col style={{ marginTop: "2px", textAlign: "center" }} md={2}>
                      <FontAwesomeIcon
                        icon={["far", "trash-alt"]}
                        size="xs"
                        title="Delete Paper"
                        className="caution-color table-btn"
                        onClick={() => {
                          const listPapers = props.addGlycanInfoToFeature.papers;
                          listPapers.splice(index, 1);
                          props.setAddGlycanInfoToFeature({ papers: listPapers });
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

  function addPaper() {
    var listPapers = props.addGlycanInfoToFeature.papers;
    const paperExists = listPapers.find(i => i === newPaper);

    if (!paperExists && newPaper.trim() !== "") {
      listPapers.push(newPaper);
      props.setAddGlycanInfoToFeature({ papers: listPapers });
    }
    setNewPaper("");
  }

  return (
    <>
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
        <Col md={4}>
          {paperWidget(true)}
          <Row>
            <Col md={10}>
              <Form.Control
                as="input"
                name="papers"
                placeholder="Enter name of the Paper and click +"
                value={newPaper}
                onChange={e => {
                  setNewPaper(e.target.value);
                }}
                maxLength={200}
              />
            </Col>
            <Col md={1}>
              <Button variant="contained" onClick={addPaper} className="add-button">
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
      <Row>
        <FormLabel label="Source" />

        <Col md={{ span: 6 }} style={{ marginLeft: "30px" }}>
          <Form.Check.Label>
            <Form.Check.Input
              type="radio"
              value={"commercial"}
              label={"Commercial"}
              onChange={handleSourceChange}
              checked={props.addGlycanInfoToFeature.source === "commercial"}
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
              checked={props.addGlycanInfoToFeature.source === "nonCommercial"}
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
              checked={props.addGlycanInfoToFeature.source === "notSpecified"}
            />
            {"Not Specified"}
          </Form.Check.Label>
        </Col>
      </Row>
      &nbsp;&nbsp;&nbsp;
      {props.addGlycanInfoToFeature.source === "commercial" ? (
        <Source
          isCommercial
          commercial={props.addGlycanInfoToFeature.commercial}
          validate={props.addGlycanInfoToFeature.validatedCommNonComm}
          sourceChange={sourceInfoChange}
        />
      ) : (
        props.addGlycanInfoToFeature.source === "nonCommercial" && (
          <Source
            isNonCommercial
            nonCommercial={props.addGlycanInfoToFeature.nonCommercial}
            validate={props.addGlycanInfoToFeature.validatedCommNonComm}
            sourceChange={sourceInfoChange}
          />
        )
      )}
    </>
  );
};

export { AddGlycanInfoToFeature };