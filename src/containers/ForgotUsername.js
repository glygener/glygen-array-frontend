import React, { useState, useReducer } from "react";
import { Form, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import "./Login.css";
import { Feedback, Title } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { Link } from "react-router-dom";

const ForgotUsername = () => {
  const [userInput, setUserInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    email: ""
  });

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState("");

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    setUserInput({ [name]: newValue });
  };

  return (
    <>
      <Helmet>
        <title>{head.forgotUsername.title}</title>
        {getMeta(head.forgotUsername)}
      </Helmet>

      <Card
        style={{
          width: "500px"
        }}
        className={"card-page"}
      >
        <Title title={"Forgot Username"} />

        {showErrorSummary === true && (
          <ErrorSummary show={showErrorSummary} form="usernameRecovery" errorJson={pageErrorsJson} />
        )}

        {showSuccessMessage && (
          <Alert variant="success" style={{ textAlign: "justify" }}>
            {showSuccessMessage}
          </Alert>
        )}

        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <Form.Group as={Row} controlId="email">
            <Col>
              <Form.Control
                type="email"
                name="email"
                placeholder=" "
                value={userInput.email}
                onChange={handleChange}
                required
                className={"custom-text-fields"}
              />
              <Form.Label className={"label required-asterik"}>Email address</Form.Label>
              <Feedback message="Please enter your email." />
            </Col>
          </Form.Group>
          <Col md={{ span: 5 }} className="line-break-1">
            <Button type="submit" style={{ marginLeft: "100%", fontSize: "20px" }}>
              Submit
            </Button>
          </Col>
          <hr />
          <Col>
            <Link to="/login" className="ui-link">
              Return To Log In
            </Link>
          </Col>
          &nbsp;&nbsp;
        </Form>
      </Card>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);
    if (e.currentTarget.checkValidity() === true) {
      const email = userInput.email;
      wsCall("recover", "GET", { email: email }, false, null, usernameRecoverySuccess, usernameRecoveryError);
    }
    e.preventDefault();
  }

  function usernameRecoverySuccess() {
    setShowSuccessMessage(
      `An email with information to access your account was sent to email address. If you do not receive the email in the next few minutes please also check your Junk mail folder.`
    );
    // history.push("/login");
  }

  function usernameRecoveryError(response) {
    response.json().then(response => {
      console.log(response);
      setShowErrorSummary(true);
      setPageErrorsJson(response);
    });
  }
};

export { ForgotUsername };
