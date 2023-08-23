import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useHistory, Link } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { Feedback, Title } from "../components/FormControls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Container from "@material-ui/core/Container";
import FeedbackWidget from "../components/FeedbackWidget";

const ChangePassword = () => {
  const [userInput, setUserInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [viewCurrentPassword, setViewCurrentPassword] = useState(false);
  const [viewNewPassword, setViewNewPassword] = useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = useState(false);

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
        <title>{head.changePassword.title}</title>
        {getMeta(head.changePassword)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Change Password"} />

          {showErrorSummary === true && (
            <ErrorSummary
              show={showErrorSummary}
              form="changePassword"
              errorMessage={pageErrorMessage}
              errorJson={pageErrorsJson}
            />
          )}

          <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
            <Form.Group as={Row} controlId="currentpassword">
              <Col>
                <Form.Control
                  type={viewCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  placeholder=" "
                  value={userInput.currentPassword}
                  onChange={handleChange}
                  required
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>Current Password</Form.Label>
                <Feedback message="Please enter current password." />

                <FontAwesomeIcon
                  key={"view"}
                  icon={["far", viewCurrentPassword ? "eye" : "eye-slash"]}
                  size="xs"
                  title="password"
                  className={"password-visibility"}
                  onClick={() => setViewCurrentPassword(!viewCurrentPassword)}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="newpassword">
              <Col>
                <Form.Control
                  type={viewNewPassword ? "text" : "password"}
                  placeholder=" "
                  name="newPassword"
                  value={userInput.newPassword}
                  onChange={handleChange}
                  required
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>New Password</Form.Label>
                <Feedback message="Please enter new password." />

                <FontAwesomeIcon
                  key={"view"}
                  icon={["far", viewNewPassword ? "eye" : "eye-slash"]}
                  size="xs"
                  title="password"
                  className={"password-visibility"}
                  onClick={() => setViewNewPassword(!viewNewPassword)}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="confirmpassword">
              <Col>
                <Form.Control
                  type={viewConfirmPassword ? "text" : "password"}
                  placeholder=" "
                  value={userInput.confirmPassword}
                  onChange={handleChange}
                  name="confirmPassword"
                  required
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>Confirm Password</Form.Label>
                <Feedback message="Please confirm password." />

                <FontAwesomeIcon
                  key={"view"}
                  icon={["far", viewConfirmPassword ? "eye" : "eye-slash"]}
                  size="xs"
                  title="password"
                  className={"password-visibility"}
                  onClick={() => setViewConfirmPassword(!viewConfirmPassword)}
                />
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
    var base = process.env.REACT_APP_BASENAME;
    const username = window.localStorage.getItem(base ? base + "_loggedinuser" : "loggedinuser");

    if (userInput.newPassword !== userInput.confirmPassword) {
      setPageErrorsJson({});
      setPageErrorMessage(" New and confirm passwords must match.");
      setShowErrorSummary(true);
    } else if (e.currentTarget.checkValidity()) {
      const changePassword = {
        currentPassword: userInput.currentPassword,
        newPassword: userInput.newPassword,
      };
      wsCall(
        "default",
        "PUT",
        [username, "password"],
        true,
        changePassword,
        passwordChangeSuccess,
        passwordChangeError
      );
    }
    e.preventDefault();
  }

  function passwordChangeSuccess(response) {
    console.log(response);
    history.push("/profile");
  }

  function passwordChangeError(response) {
    // console.log(response);
    response.json().then((responsejson) => {
      setPageErrorsJson(responsejson);
      setShowErrorSummary(true);
    });
  }
};

export { ChangePassword };
