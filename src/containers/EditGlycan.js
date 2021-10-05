import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Row, Col, Form } from "react-bootstrap";
import Helmet from "react-helmet";
import { FormLabel, Feedback, FormButton, Title, LinkButton } from "../components/FormControls";
import { head, getMeta } from "../utils/head";
import { useParams, useHistory } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { Loading } from "../components/Loading";
import { StructureImage } from "../components/StructureImage";

const EditGlycan = props => {
  let { glycanId } = useParams();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
    setShowLoading(true);
    wsCall("getglycan", "GET", [glycanId], true, null, getGlycanSuccess, getGlycanFailure);
  }, [props, glycanId]);

  const history = useHistory();

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");

  const [glycanDetails, setGlycanDetails] = useReducer((state, newState) => ({ ...state, ...newState }), {
    name: "",
    internalId: "",
    description: "",
    mass: "",
    cartoon: "",
    glytoucanId: "",
    type: ""
  });

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    setGlycanDetails({ [name]: newValue });
  };

  function getGlycanSuccess(response) {
    response.json().then(parsedJson => {
      debugger;
      setGlycanDetails(parsedJson);
      setShowLoading(false);
    });
  }

  function getGlycanFailure(response) {
    setValidated(false);
    setShowLoading(false);
    console.log(response);
  }

  function getGlycanTypeLabel(type) {
    switch (type) {
      case "SEQUENCE_DEFINED":
        return "Sequence defined glycan";
      case "UNKNOWN":
        return "Unknown glycan";
      case "MASS_ONLY":
        return "Mass defined glycan";
      case "OTHER":
        return "Other glycan";

      default:
        return "Sequence defined glycan";
    }
  }

  return (
    <>
      <Helmet>
        <title>{head.editGlycan.title}</title>
        {getMeta(head.editGlycan)}
      </Helmet>

      <div className="page-container">
        <Title title="Edit Glycan" />

        {<Loading show={showLoading} />}

        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="glycans"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}

        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <Form.Group as={Row} controlId="internalId">
            <FormLabel label="Internal Id" />
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="internal Id"
                name="internalId"
                value={glycanDetails.internalId}
                onChange={handleChange}
                maxLength={30}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Name" className={glycanDetails.type === "UNKNOWN" ? "required-asterik" : ""} />
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="name"
                name="name"
                value={glycanDetails.name}
                onChange={handleChange}
                required={glycanDetails.type === "UNKNOWN" ? true : false}
                maxLength={50}
              />
              <Feedback message="Please Enter Glycan Name." />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="comment">
            <FormLabel label="Comment" />
            <Col md={4}>
              <Form.Control
                as="textarea"
                placeholder="comment"
                name="description"
                value={glycanDetails.description}
                onChange={handleChange}
                maxLength={2000}
              />
              <span className="character-counter" style={{ marginLeft: "80%" }}>
                {glycanDetails.description && glycanDetails.description.length > 0
                  ? glycanDetails.description.length
                  : ""}
                /2000
              </span>
            </Col>
          </Form.Group>

          {glycanDetails.cartoon && (
            <Form.Group as={Row} controlId="image">
              <FormLabel label="Image" />
              <Col md={4}>
                <StructureImage
                  base64={glycanDetails.cartoon}
                  style={{
                    maxWidth: "300px",
                    overflow: "scroll"
                  }}
                />
              </Col>
            </Form.Group>
          )}

          {glycanDetails.mass && (
            <Form.Group as={Row} controlId="mass">
              <FormLabel label="mass" />
              <Col md={4}>
                <Form.Control type="text" plaintext readOnly value={glycanDetails.mass} />
              </Col>
            </Form.Group>
          )}

          {glycanDetails.glytoucanId && (
            <Form.Group as={Row} controlId="glytoucanId">
              <FormLabel label="GlyTouCan ID" />
              <Col md={4}>
                <Form.Control type="text" plaintext readOnly value={glycanDetails.glytoucanId} />
              </Col>
            </Form.Group>
          )}

          <Form.Group as={Row} controlId="glycanType">
            <FormLabel label="Type" />
            <Col md={4}>
              <Form.Control type="text" plaintext readOnly value={getGlycanTypeLabel(glycanDetails.type)} />
            </Col>
          </Form.Group>

          <FormButton className="line-break-1" type="submit" label="Submit" />
          <LinkButton to="/glycans" label="Cancel" />
        </Form>
      </div>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);
    if (e.currentTarget.checkValidity()) {
      wsCall("updateglycan", "POST", null, true, glycanDetails, updateGlycanSuccess, updateGlycanFailure);
    }
    e.preventDefault();
  }

  function updateGlycanSuccess() {
    history.push("/glycans");
  }

  function updateGlycanFailure(response) {
    response.json().then(parsedJson => {
      setShowErrorSummary(true);
      setPageErrorMessage("");
      setPageErrorsJson(parsedJson);
    });
  }
};

EditGlycan.propTypes = {
  authCheckAgent: PropTypes.func
};

export { EditGlycan };
