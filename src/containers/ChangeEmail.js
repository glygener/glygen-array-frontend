import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import { Feedback, Title } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { useHistory, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Container from "@material-ui/core/Container";

const ChangeEmail = () => {
  const [userInput, setUserInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    password: "",
    email: "",
  });

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [viewPassword, setViewPassword] = useState(false);
  const history = useHistory();

  const handleChange = (e) => {
    const name = e.target.name;
    const newValue = e.target.value;

    setShowErrorSummary(false);
    setUserInput({ [name]: newValue });
  };

  return (
    <>
      <Helmet>
        <title>{head.changeEmail.title}</title>
        {getMeta(head.changeEmail)}
      </Helmet>

      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Change Email"} />

          {showErrorSummary === true && (
            <ErrorSummary show={showErrorSummary} form="changeEmail" errorMessage={pageErrorMessage} />
          )}

          <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
            <Form.Group as={Row} controlId="password">
              <Col>
                <Form.Control
                  type={viewPassword ? "text" : "password"}
                  name="password"
                  placeholder=" "
                  value={userInput.password}
                  onChange={handleChange}
                  required
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>Password</Form.Label>
                <Feedback message="Please enter your password!" />
                <FontAwesomeIcon
                  key={"view"}
                  icon={["far", viewPassword ? "eye" : "eye-slash"]}
                  size="xs"
                  title="view password"
                  className={"password-visibility"}
                  onClick={() => setViewPassword(!viewPassword)}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="email">
              <Col>
                <Form.Control
                  type="email"
                  placeholder=" "
                  name="email"
                  value={userInput.email}
                  onChange={handleChange}
                  required
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>New Email</Form.Label>
                <Feedback message="Please enter a valid email!" />
              </Col>
            </Form.Group>

            <Row className="mt-2">
              <Col md={6}>
                <Link to="/profile">
                  <Button className="link-button-outline mt-3">Cancel</Button>
                </Link>
              </Col>
              <Col md={6}>
                <Button type="submit" className="link-button mt-3" disabled={showErrorSummary}>
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Container>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);

    const username = window.localStorage.getItem("loggedinuser");
    var password = userInput.password;

    if (e.currentTarget.checkValidity() && verifyPassword(username, password)) {
      console.log("heloo");
    }

    e.preventDefault();
  }

  function changeEmail() {
    const username = window.localStorage.getItem("loggedinuser");
    var password = userInput.password;

    const changeEmail = {
      userName: username,
      password: password,
      email: userInput.email,
    };

    wsCall("update", "POST", [username], true, changeEmail, emailChangeSuccess, emailChangeError);
  }

  function emailChangeSuccess(response) {
    console.log(response);
    history.push("/profile");
  }

  function emailChangeError(response) {
    if (!response.ok) {
      if (response.status === 500) {
        setPageErrorMessage("Internal Server Error - Please try again");
        setShowErrorSummary(true);
      } else if (response.status === 409) {
        setPageErrorMessage("Conflict - Email exists in the system");
        setShowErrorSummary(true);
      } else {
        response.json().then((response) => {
          setPageErrorMessage(response.errorCode + ":" + response.message);
          setShowErrorSummary(true);
        });
      }
    }
  }

  function verifyPassword(username, password) {
    const credentials = {
      password,
      username,
    };

    wsCall("login", "POST", null, false, credentials, verifyPasswordSuccess, verifyPasswordError);
  }

  function verifyPasswordSuccess(response) {
    console.log(response);
    changeEmail();
  }

  function verifyPasswordError(response) {
    if (!response.ok) {
      if (response.status === 401) {
        setPageErrorMessage("Unauthorized - Please enter correct Password");
        setShowErrorSummary(true);
      }
    }
  }
};
export { ChangeEmail };
