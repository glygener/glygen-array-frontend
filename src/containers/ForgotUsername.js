import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import "./Login.css";
import { Feedback, Title } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { Link } from "react-router-dom";
import Container from "@material-ui/core/Container";

const ForgotUsername = () => {
  const [userInput, setUserInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    email: "",
  });

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState("");

  const handleChange = (e) => {
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
      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Forgot Username"} />

          {showErrorSummary === true && (
            <ErrorSummary
              show={showErrorSummary}
              form="usernameRecovery"
              errorJson={pageErrorsJson}
            />
          )}

          {showSuccessMessage && (
            <Alert variant="success" style={{ textAlign: "justify" }}>
              {showSuccessMessage}
            </Alert>
          )}

          <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
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
                <Feedback message="Please enter a valid email." />
              </Col>
            </Form.Group>
            <br />
            <div className="text-center">
              <Button type="submit">Submit</Button>
            </div>
            <hr />
            <div className="text-center">
              <Link to="/login">Return To Log In</Link>
            </div>
            &nbsp;&nbsp;
          </Form>
        </div>
      </Container>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);
    if (e.currentTarget.checkValidity() === true) {
      const email = userInput.email;
      wsCall(
        "recover",
        "GET",
        { email: email },
        false,
        null,
        usernameRecoverySuccess,
        usernameRecoveryError
      );
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
    response.json().then((response) => {
      console.log(response);
      setShowErrorSummary(true);
      setPageErrorsJson(response);
    });
  }
};

export { ForgotUsername };
