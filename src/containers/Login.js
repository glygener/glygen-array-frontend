/* eslint-disable react/prop-types */
import React, { useState, useReducer, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import { useHistory } from "react-router-dom";
import { Feedback, Title } from "../components/FormControls";
import { Link } from "react-router-dom";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Login.css";
import Container from "@material-ui/core/Container";

const Login = (props) => {
  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [viewPassword, setViewPassword] = useState(false);
  const history = useHistory();

  const userDetails = {
    userName: "",
    password: "",
  };

  const [credentials, setCredentials] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    userDetails
  );

  const handleChange = (e) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;
    setCredentials({ [name]: value });
  };

  return (
    <>
      <Helmet>
        <title>{head.login.title}</title>
        {getMeta(head.login)}
      </Helmet>
      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Log In"} />
          {showErrorSummary === true && (
            <ErrorSummary show={showErrorSummary} form="signin" errorMessage={pageErrorMessage} />
          )}
          <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
            <Form.Group as={Row} controlId="username">
              <Col>
                <Form.Control
                  type="text"
                  name="userName"
                  placeholder=" "
                  value={credentials.userName}
                  onChange={handleChange}
                  required
                  autoFocus
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>
                  Username or Email address
                </Form.Label>
                <Feedback message="Please enter username." />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="password" className="mt-4">
              <Col>
                <Form.Control
                  type={viewPassword ? "text" : "password"}
                  name="password"
                  placeholder=" "
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  autoComplete="password"
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>Password</Form.Label>
                {credentials.password ? (
                  <FontAwesomeIcon
                    className={"password-visibility"}
                    key={"view"}
                    icon={["far", viewPassword ? "eye" : "eye-slash"]}
                    size="xs"
                    alt="Password Visibility Icon"
                    title="view password"
                    onClick={() => setViewPassword(!viewPassword)}
                  />
                ) : (
                  ""
                )}
                <Feedback message="Please enter password." />
              </Col>
            </Form.Group>
            <br />
            <div className="text-center">
              <Button type="submit">Log In</Button>
              <hr />
              <div>
                <Link to="/signup">New user?</Link>
              </div>
              <div>
                <Link to="/forgotPassword">Forgot password</Link>
              </div>
              <div>
                <Link to="/forgotUsername">Forgot username</Link>
              </div>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );

  function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    if (e.currentTarget.checkValidity() === true) {
      const loginData = { username: credentials.userName, password: credentials.password };
      wsCall("login", "POST", null, false, loginData, logInSuccess, logInError);
    }
  }

  function logInSuccess(response) {
    var token = response.headers.get("Authorization");
    window.localStorage.setItem("token", token);
    window.localStorage.setItem("loggedinuser", credentials.userName);
    props.updateLogin(true);

    var redirectedFrom = "";
    if (history.location.state && history.location.state.redirectedFrom) {
      redirectedFrom = history.location.state.redirectedFrom;
    }

    if (redirectedFrom) {
      history.push(redirectedFrom);
    } else {
      history.push("/contribute");
    }
  }

  function logInError() {
    setPageErrorMessage("Invalid credentials. Please try again.");
    setShowErrorSummary(true);
  }
};

export { Login };
