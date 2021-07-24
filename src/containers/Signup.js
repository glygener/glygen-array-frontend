import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button, Card } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import { Link } from "react-router-dom";
import { Feedback, Title } from "../components/FormControls";
import Helmet from "react-helmet";
import "./Signup.css";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Container from "@material-ui/core/Container";

const Signup = () => {
  const [userInput, setUserInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    userName: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    affiliation: "",
    affiliationWebsite: "",
  });

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [viewPassword, setViewPassword] = useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = useState(false);
  const history = useHistory();

  const handleChange = (e) => {
    const name = e.target.name;
    const newValue = e.target.value;
    setShowErrorSummary(false);
    setUserInput({ [name]: newValue });
  };

  const checkUsername = () => {
    checkUserName();
  };

  return (
    <>
      <Helmet>
        <title>{head.signup.title}</title>
        {getMeta(head.signup)}
      </Helmet>
      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Sign Up"} />
          {showErrorSummary === true && (
            <ErrorSummary
              show={showErrorSummary}
              form="signup"
              errorMessage={pageErrorMessage}
              errorJson={pageErrorsJson}
            />
          )}
          <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
            <Row>
              <Col md={6}>
                <Form.Group as={Row} controlId="validationuserName">
                  <Col>
                    <Form.Control
                      type="text"
                      name="userName"
                      placeholder=" "
                      onChange={handleChange}
                      onBlur={checkUsername()}
                      value={userInput.username}
                      minLength={5}
                      maxLength={20}
                      required
                      className={"custom-text-fields"}
                    />
                    <Form.Label className={"label required-asterik"}>Username</Form.Label>
                    <Feedback message="Username should be between 5 and 20 characters." />
                  </Col>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group as={Row} controlId="validaitonEmail">
                  <Col>
                    <Form.Control
                      type="email"
                      placeholder=" "
                      name="email"
                      value={userInput.emailAddress}
                      onChange={handleChange}
                      required
                      className={"custom-text-fields"}
                    />
                    <Form.Label className={"label required-asterik"}>Email</Form.Label>
                    <Feedback message="Please enter a valid email" />
                  </Col>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group as={Row} controlId="newpassword">
                  <Col>
                    <Form.Control
                      type={viewPassword ? "text" : "password"}
                      placeholder=" "
                      name="password"
                      value={userInput.password}
                      onChange={handleChange}
                      pattern="^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{5,20}$"
                      required
                      className={"custom-text-fields"}
                    />
                    <Form.Label className={"label required-asterik"}>Password</Form.Label>
                    <Feedback message="Password must contain at least:" />
                    <Feedback message={`* 5 - 20 characters in length,`} />
                    <Feedback message={`* 1 uppercase character,`} />
                    <Feedback message={`* 1 lowercase character,`} />
                    <Feedback message={`* 1 numeric value,`} />
                    <Feedback message={`* 1 special character (!@#$%^&).`} />

                    <FontAwesomeIcon
                      className={"password-visibility"}
                      key={"view"}
                      icon={["far", viewPassword ? "eye" : "eye-slash"]}
                      size="xs"
                      alt="Password Visibility Icon"
                      title="password"
                      onClick={() => setViewPassword(!viewPassword)}
                    />
                  </Col>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group as={Row} controlId="confirmpassword">
                  <Col>
                    <Form.Control
                      type={viewConfirmPassword ? "text" : "password"}
                      placeholder=" "
                      name="confirmPassword"
                      value={userInput.confirmPassword}
                      onChange={handleChange}
                      required
                      className={"custom-text-fields"}
                    />
                    <Form.Label className={"label required-asterik"}>Confirm password</Form.Label>
                    <Feedback message="Please confirm password." />

                    <FontAwesomeIcon
                      className={"password-visibility"}
                      key={"view"}
                      icon={["far", viewConfirmPassword ? "eye" : "eye-slash"]}
                      alt="Password Visibility Icon"
                      size="xs"
                      title="confirm password"
                      onClick={() => setViewConfirmPassword(!viewConfirmPassword)}
                    />
                  </Col>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group as={Row} controlId="firstname">
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder=" "
                      name="firstName"
                      onChange={handleChange}
                      value={userInput.firstName}
                      required
                      className={"custom-text-fields"}
                    />
                    <Form.Label className={"label required-asterik"}>First name</Form.Label>
                    <Feedback message="Please enter first name." />
                  </Col>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group as={Row} controlId="lastname">
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder=" "
                      name="lastName"
                      onChange={handleChange}
                      value={userInput.lastName}
                      required
                      className={"custom-text-fields"}
                    />
                    <Form.Label className={"label required-asterik"}>Last name</Form.Label>
                    <Feedback message="Please enter last name." />
                  </Col>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group as={Row} controlId="formAffiliation">
              <Col>
                <Form.Control
                  type="text"
                  placeholder=" "
                  name="affiliation"
                  value={userInput.affiliation}
                  onChange={handleChange}
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label"}>Affiliation</Form.Label>
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="formAffiliationWebsite">
              <Col>
                <Form.Control
                  type="url"
                  placeholder=" "
                  name="affiliationWebsite"
                  value={userInput.affiliationWebsite}
                  onChange={handleChange}
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label"}>Affiliation Website</Form.Label>
                <Feedback message="Please enter valid Affiliation Website." />
              </Col>
            </Form.Group>
            <br />
            <div className="text-center">
              <Button type="submit" disabled={showErrorSummary}>
                Sign Up
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

  function checkUserName() {
    const username = userInput.userName;
    if (username !== "" && username !== null) {
      wsCall(
        "username",
        "GET",
        { username: username },
        false,
        null,
        checkUsernameSuccess,
        checkUsernameFailure
      );
    }
  }

  function checkUsernameSuccess() {
    // setShowErrorSummary(false);
  }

  function checkUsernameFailure(response) {
    // var errorList = [];
    if (!response.ok) {
      if (response.status === 500) {
        setPageErrorMessage("Internal Server Error - Please try again");
        setShowErrorSummary(true);
      } else if (response.status === 409) {
        setPageErrorMessage("Username already in use. Choose a different one");
        setShowErrorSummary(true);
      }
    }
  }

  function handleSubmit(e) {
    setValidated(true);

    if (
      userInput.password !== "" &&
      userInput.confirmPassword !== "" &&
      userInput.password !== userInput.confirmPassword
    ) {
      setPageErrorMessage("Passwords don't match");
      setShowErrorSummary(true);
    } else if (e.currentTarget.checkValidity()) {
      checkUsername();
      wsCall("signup", "POST", null, false, userInput, signUpSuccess, signUpFailure);
    }
    e.preventDefault();
  }

  function signUpSuccess() {
    history.push("/verifyToken");
  }

  function signUpFailure(response) {
    response.json().then((parsedJson) => {
      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
    });
  }
};

export { Signup };
