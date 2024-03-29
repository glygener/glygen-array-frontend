import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import "./Login.css";
import { Feedback, Title } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useHistory } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { Link } from "react-router-dom";
import Container from "@material-ui/core/Container";
import FeedbackWidget from "../components/FeedbackWidget";

const ForgotPassword = () => {
  const [userInput, setUserInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    username: "",
  });

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const history = useHistory();

  const handleChange = (e) => {
    const name = e.target.name;
    const newValue = e.target.value;

    setUserInput({ [name]: newValue });
  };

  return (
    <>
      <Helmet>
        <title>{head.forgotPassword.title}</title>
        {getMeta(head.forgotPassword)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Forgot Password"} />

          {showErrorSummary === true && (
            <ErrorSummary
              show={showErrorSummary}
              form="passwordRecovery"
              errorJson={pageErrorsJson}
            />
          )}

          {showSuccessMessage && (
            <Alert variant="success" style={{ textAlign: "justify" }}>
              {showSuccessMessage}
              <div className="text-center"><Link to="/login">Return To Log In</Link></div>
            </Alert>
          )}

          {showSuccessMessage === "" && (
            <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
              <Form.Group as={Row} controlId="username">
                <Col>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder=" "
                    value={userInput.username}
                    onChange={handleChange}
                    required
                    className={"custom-text-fields"}
                  />
                  <Form.Label className={"label required-asterik"}>Username</Form.Label>
                  <Feedback message="Please enter your username." />
                </Col>
              </Form.Group>
              <br />
              <div className="text-center">
                <Button type="submit" className="gg-btn-blue">
                  Submit
                </Button>
                <hr />
                <div>
                  <Link to="/login">Return To Log In</Link>
                </div>
                <div>
                  <Link to="/forgotUsername">Forgot username</Link>
                </div>
              </div>
            </Form>
          )}
        </div>
      </Container>
    </>
  );

  function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    if (e.currentTarget.checkValidity() === true) {
      const username = userInput.username;
      wsCall(
        "default",
        "GET",
        [username, "password"],
        false,
        null,
        passwordRecoverySuccess,
        passwordRecoveryError
      );
    }
  }

  function passwordRecoverySuccess() {
    setShowSuccessMessage(
      `Your password is reset and a new password was sent to the email address of this account. If you do not receive the email in the next few minutes please also check your Junk mail folder.`
    );
    //history.push("login");
  }

  function passwordRecoveryError(response) {
    response.json().then((response) => {
      console.log(response);
      setShowErrorSummary(true);
      setPageErrorsJson(response);
    });
  }
};

export { ForgotPassword };
