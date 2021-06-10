import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button, Card } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import { Feedback, Title } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

const VerifyToken = () => {
  const [confirmRegistration, setConfirmRegistration] = useReducer((state, newState) => ({ ...state, ...newState }), {
    token: ""
  });

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const history = useHistory();

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    setConfirmRegistration({ [name]: newValue });
  };

  return (
    <>
      <Helmet>
        <title>{head.verifyToken.title}</title>
        {getMeta(head.verifyToken)}
      </Helmet>

      <Card
        style={{
          width: "500px"
        }}
        className={"card-page"}
      >
        <Title title={"Verify Sign up"} />

        {showErrorSummary === true && (
          <ErrorSummary show={showErrorSummary} form="signupVerification" errorJson={pageErrorsJson} />
        )}

        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <p style={{ color: "black" }}>Please enter the token provided to you in verification email.</p>
          <Form.Group as={Row} controlId="token">
            <Col>
              <Form.Control
                type="text"
                name="token"
                placeholder=" "
                value={confirmRegistration.token}
                onChange={handleChange}
                required
                className={"custom-text-fields"}
              />
              <Form.Label className={"label required-asterik"}>Token</Form.Label>
              <Feedback message="Please enter a valid Token." />
            </Col>
          </Form.Group>
          <Col md={{ span: 6 }} style={{ marginLeft: "23%" }}>
            <Button type="submit" style={{ width: "100%", fontSize: "15px" }}>
              Submit
            </Button>
          </Col>
          <hr />
          <Col md={{ span: 6 }} style={{ marginLeft: "24%" }}>
            <Link to="/login" className="ui-link">
              Log In
            </Link>
          </Col>
          &nbsp;&nbsp;
        </Form>
      </Card>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);

    const token = confirmRegistration.token;

    if (e.currentTarget.checkValidity()) {
      wsCall("emailconfirm", "GET", { token: token }, false, null, tokenVerificationSuccess, tokenVerificationFail);
    }
    e.preventDefault();
  }

  function tokenVerificationSuccess(response) {
    console.log(response);
    history.push("/login");
  }

  function tokenVerificationFail(response) {
    response.json().then(parsedJson => {
      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
    });
  }
};

export { VerifyToken };
