import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Row, Col, Form } from "react-bootstrap";
import Helmet from "react-helmet";
import { FormLabel, Feedback, FormButton, Title, LinkButton } from "../components/FormControls";
import { StructureImage } from "../components/StructureImage";
import { head, getMeta } from "../utils/head";
import { useParams, useHistory } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";

const EditGlycan = props => {
  let { glycanId } = useParams();

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
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
    glytoucanId: "",
    type: "",
    mass: "",
    cartoon: ""
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
      console.log(parsedJson);
    });
  }

  function getGlycanFailure(response) {
    setValidated(false);
    console.log(response);
  }

  return (
    <>
      <Helmet>
        <title>{head.editGlycan.title}</title>
        {getMeta(head.editGlycan)}
      </Helmet>

      <div className="page-container">
        <Title title="Edit Glycan" />

        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="glycans"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          ></ErrorSummary>
        )}

        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <Form.Group as={Row} controlId="validationuserName">
            <FormLabel label="Internal Id" />
            <Col md={4}>
              <Form.Control
                type="text"
                name="internalId"
                defaultValue={glycanDetails.internalId}
                onChange={handleChange}
              />
              <Feedback message="Please Enter Internal Id." />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Name" className="required-asterik" />
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="name"
                name="name"
                defaultValue={glycanDetails.name}
                onChange={handleChange}
                required
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
                defaultValue={glycanDetails.description}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="glycanToucanId">
            <FormLabel label="Glytoucan Id" />
            <Col md={4}>
              <Form.Control type="text" plaintext readOnly defaultValue={glycanDetails.glytoucanId} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="glycanType">
            <FormLabel label="Type" />
            <Col md={4}>
              <Form.Control type="text" plaintext readOnly defaultValue={glycanDetails.type} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="mass">
            <FormLabel label="Mass" />
            <Col md={4}>
              <Form.Control type="text" plaintext readOnly defaultValue={glycanDetails.mass} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="mass">
            <FormLabel label="Structure Image" />
            <Col md={4} style={{ alignContent: "left" }}>
              <StructureImage base64={glycanDetails.cartoon}></StructureImage>
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
      setPageErrorsJson(parsedJson);
    });
  }
};

EditGlycan.propTypes = {
  authCheckAgent: PropTypes.func
};

export { EditGlycan };
