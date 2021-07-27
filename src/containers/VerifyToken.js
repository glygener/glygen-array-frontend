import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import { Feedback, Title } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import Container from "@material-ui/core/Container";

const VerifyToken = () => {
  const [confirmRegistration, setConfirmRegistration] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      token: "",
    }
  );

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const history = useHistory();

  const handleChange = (e) => {
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

      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Verify Sign Up"} />

          {showErrorSummary === true && (
            <ErrorSummary
              show={showErrorSummary}
              form="signupVerification"
              errorJson={pageErrorsJson}
            />
          )}

          <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
            <p style={{ color: "black" }}>
              Please enter the token provided to you in verification email.
            </p>
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
                <Feedback message="Please enter a valid token." />
              </Col>
            </Form.Group>
            <br />
            <div className="text-center">
              <Button type="submit" className="gg-btn-blue">
                Verify Sign Up
              </Button>
              <hr />
              <div>
                <Link to="/login">Log In</Link>
              </div>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);

    const token = confirmRegistration.token;

    if (e.currentTarget.checkValidity()) {
      wsCall(
        "emailconfirm",
        "GET",
        { token: token },
        false,
        null,
        tokenVerificationSuccess,
        tokenVerificationFail
      );
    }
    e.preventDefault();
  }

  function tokenVerificationSuccess(response) {
    console.log(response);
    history.push("/login");
  }

  function tokenVerificationFail(response) {
    response.json().then((parsedJson) => {
      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
    });
  }
};

export { VerifyToken };
