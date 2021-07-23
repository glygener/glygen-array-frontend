import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Row, Col, Form } from "react-bootstrap";
import Helmet from "react-helmet";
import { FormLabel, Feedback, FormButton, Title, LinkButton } from "../components/FormControls";
import { StructureImage } from "../components/StructureImage";
import { head, getMeta } from "../utils/head";
import { useHistory, useParams } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";

const EditLinker = props => {
  useEffect(props.authCheckAgent, []);

  const history = useHistory();
  let { linkerId } = useParams();

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");

  const [linkerDetails, setLinkerDetails] = useReducer((state, newState) => ({ ...state, ...newState }), {
    name: "",
    comment: "",
    inChiKey: "",
    type: "",
    mass: "",
    imageURL: ""
  });

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    setLinkerDetails({ [name]: newValue });
  };

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    wsCall("getlinker", "GET", [linkerId], true, null, getLinkerSuccess, getLinkerFailure);
  }, [props]);

  function getLinkerSuccess(response) {
    response.json().then(parsedJson => {
      setLinkerDetails(parsedJson);
      console.log(parsedJson);
    });
  }

  function getLinkerFailure(response) {
    setValidated(false);
    console.log(response);
  }

  return (
    <>
      <Helmet>
        <title>{head.editLinker.title}</title>
        {getMeta(head.editLinker)}
      </Helmet>

      <div className="page-container">
        <Title title="Edit Linker" />

        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="glycans"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          ></ErrorSummary>
        )}

        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Name" className="required-asterik" />
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="name"
                name="name"
                defaultValue={linkerDetails.name}
                onChange={handleChange}
                required
              />
              <Feedback message="Please Enter Linker Name." />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="comment">
            <FormLabel label="comment" />
            <Col md={4}>
              <Form.Control
                as="textarea"
                placeholder="comment"
                name="comment"
                defaultValue={linkerDetails.comment}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="inChiKey">
            <FormLabel label="InChI Key" />
            <Col md={4}>
              <Form.Control type="text" plaintext readOnly defaultValue={linkerDetails.inChiKey} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="linkerType">
            <FormLabel label="Type" />
            <Col md={4}>
              <Form.Control type="text" plaintext readOnly defaultValue={linkerDetails.type} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="mass">
            <FormLabel label="Mass" />
            <Col md={4}>
              <Form.Control type="text" plaintext readOnly defaultValue={linkerDetails.mass} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="mass">
            <FormLabel label="Structure Image" />
            <Col md={4} style={{ alignContent: "left" }}>
              <StructureImage imgUrl={linkerDetails.imageURL}></StructureImage>
            </Col>
          </Form.Group>
          <FormButton className="line-break-1" type="submit" label="Submit" />
          <LinkButton to="/linkers" label="Cancel" />
        </Form>
      </div>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);

    if (e.currentTarget.checkValidity()) {
      wsCall("updatelinker", "POST", null, true, linkerDetails, updateLinkerSuccess, updateLinkerFailure);
    }
    e.preventDefault();
  }

  function updateLinkerSuccess() {
    history.push("/linkers");
  }

  function updateLinkerFailure(response) {
    response.json().then(parsedJson => {
      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
    });
  }
};

EditLinker.propTypes = {
  authCheckAgent: PropTypes.func
};

export { EditLinker };
