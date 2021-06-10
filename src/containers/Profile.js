import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import { Row, Col, Button, Form, Card } from "react-bootstrap";
import { FormLabel, FormButton, Feedback, Title } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { ErrorSummary } from "../components/ErrorSummary";
import { Link } from "react-router-dom";

const Profile = props => {
  const profile = {
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    affiliation: "",
    affiliationWebsite: ""
  };

  const [userProfile, setUserProfile] = useReducer((state, newState) => ({ ...state, ...newState }), profile);

  const username = window.localStorage.getItem("loggedinuser");
  const [validated, setValidate] = useState(false);
  const [isUpdate, setIsupdate] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [title, setTitle] = useState("User Profile");

  useEffect(props.authCheckAgent, []);

  useEffect(() => {
    getProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleChange = e => {
    var name = e.currentTarget.name;
    var value = e.currentTarget.value;

    if ((!value && value === "") || value === " ") {
      setValidate(true);
    } else {
      setValidate(false);
    }

    setUserProfile({ [name]: value });
  };

  const editUser = () => {
    setTitle("Edit User Profile");
    setIsupdate(true);
  };

  return (
    <>
      <Helmet>
        <title>{head.profile.title}</title>
        {getMeta(head.profile)}
      </Helmet>

      <Card
        style={{
          width: "800px"
        }}
        className={"card-page"}
      >
        {/* <Card.Body style={{ padding: "1.25rem" }}>{title}</Card.Body> */}
        <Title title={title} />

        {showErrorSummary === true && (
          <ErrorSummary show={showErrorSummary} form="editProfile" errorJson={pageErrorsJson} />
        )}

        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <Form.Group as={Row} controlId="username">
            <FormLabel label="Username" className={"text-fields"} />
            <Col md={6}>
              <Form.Control type="text" name="userName" disabled value={userProfile.userName} />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="firstName">
            <FormLabel label="First Name" className={isUpdate ? "required-asterik text-fields" : "text-fields"} />
            <Col md={6}>
              <Form.Control
                type="text"
                name="firstName"
                disabled={!isUpdate}
                onChange={handleChange}
                value={userProfile.firstName}
                required
              />
              <Feedback message="first name is required" />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="lastName">
            <FormLabel label="Last Name" className={isUpdate ? "required-asterik text-fields" : "text-fields"} />
            <Col md={6}>
              <Form.Control
                type="text"
                name="lastName"
                disabled={!isUpdate}
                onChange={handleChange}
                value={userProfile.lastName}
                required
              />
              <Feedback message="last name is required" />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="email">
            <FormLabel label="Email" className={"text-fields"} />
            <Col md={6}>
              <Form.Control type="text" name="email" disabled value={userProfile.email} />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="affiliation">
            <FormLabel label="Affiliation" className={"text-fields"} />
            <Col md={6}>
              <Form.Control
                type="text"
                name="affiliation"
                onChange={handleChange}
                disabled={!isUpdate}
                value={userProfile.affiliation}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="affiliationWebsite">
            <FormLabel label="Affiliation Website" className={"text-fields"} />
            <Col md={6}>
              <Form.Control
                type="text"
                name="affiliationWebsite"
                onChange={handleChange}
                disabled={!isUpdate}
                value={userProfile.affiliationWebsite}
              />
            </Col>
          </Form.Group>

          <Row className={!isUpdate ? "" : "hide-content"}>
            <Col md={{ span: 4 }}>
              <Button style={{ width: "100%", marginLeft: "304px", marginBottom: "10px" }} onClick={() => editUser()}>
                Edit
              </Button>
            </Col>
          </Row>

          <Row className={!isUpdate ? "" : "hide-content"}>
            <Col md={{ span: 4 }} style={{ width: "100%", marginLeft: "304px", marginBottom: "10px" }}>
              <Link to="/changePassword" className="link-button">
                Change Password
              </Link>
            </Col>
          </Row>

          <Row className={!isUpdate ? "" : "hide-content"}>
            <Col md={{ span: 4 }} style={{ width: "100%", marginLeft: "304px", marginBottom: "10px" }}>
              <Link to="/changeEmail" className="link-button">
                Change Email
              </Link>
            </Col>
            {/* <LinkButton to="/changeEmail" label="Change Email" /> */}
          </Row>

          <Row className={isUpdate ? "" : "hide-content"}>
            <FormButton type="submit" label="Submit" disabled={validated} />
            <Button onClick={() => handlecancel()}>Cancel</Button>
          </Row>
        </Form>
      </Card>
    </>
  );

  function getProfile() {
    wsCall("profile", "GET", [username], true, null, getProfileSuccess, getProfileError);
  }

  function getProfileSuccess(response) {
    response.json().then(parsedJson => {
      setUserProfile(parsedJson);
    });
  }

  function getProfileError(response) {
    console.log(response);
  }

  function handlecancel() {
    setTitle("User Profile");
    setIsupdate(false);
    getProfile();
  }

  function editProfileSuccess(response) {
    console.log(response);
    setTitle("User Profile");
    setIsupdate(false);
  }

  function editProfileError(response) {
    response.json().then(response => {
      console.log(response);
      setShowErrorSummary(true);
      setPageErrorsJson(response);
    });
  }

  function handleSubmit(e) {
    setValidate(true);

    if (e.currentTarget.checkValidity()) {
      wsCall("update", "POST", [userProfile.userName], true, userProfile, editProfileSuccess, editProfileError);
    }

    e.preventDefault();
  }
};

Profile.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Profile };
