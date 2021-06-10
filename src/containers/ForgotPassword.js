import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button, Card } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import "./Login.css";
import { Feedback, Title } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useHistory } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [userInput, setUserInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    username: ""
  });

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const history = useHistory();

  const handleChange = e => {
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

      <Card
        style={{
          width: "500px"
        }}
        className={"card-page"}
      >
        <Title title={"Forgot Password"} />

        {showErrorSummary === true && (
          <ErrorSummary show={showErrorSummary} form="passwordRecovery" errorJson={pageErrorsJson} />
        )}

        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
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
          <Col>
            <Link to="/forgotUsername" className="ui-link">
              Forgot username
            </Link>
          </Col>
          &nbsp;&nbsp;
        </Form>
      </Card>
    </>
  );

  function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    if (e.currentTarget.checkValidity() === true) {
      const username = userInput.username;
      wsCall("default", "GET", [username, "password"], false, null, passwordRecoverySuccess, passwordRecoveryError);
    }
  }

  function passwordRecoverySuccess() {
    history.push("login");
  }

  function passwordRecoveryError(response) {
    response.json().then(response => {
      console.log(response);
      setShowErrorSummary(true);
      setPageErrorsJson(response);
    });
  }
};

export { ForgotPassword };
