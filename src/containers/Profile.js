import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import { Row, Col, Button, Form } from "react-bootstrap";
import { FormLabel, FormButton, Feedback, Title } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { ErrorSummary } from "../components/ErrorSummary";
import { Link } from "react-router-dom";
import Container from "@material-ui/core/Container";

const Profile = (props) => {
  const profile = {
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    affiliation: "",
    affiliationWebsite: "",
    groupName: "",
    department: "",
  };

  const [userProfile, setUserProfile] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    profile
  );

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

  const handleChange = (e) => {
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
      <Container maxWidth="md" className="card-page-container">
        <div className="card-page-sm">
          <Title title={title} />

          {showErrorSummary === true && (
            <ErrorSummary show={showErrorSummary} form="editProfile" errorJson={pageErrorsJson} />
          )}

          <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="firstName">
                  <Form.Label className={isUpdate ? "required-asterik" : ""}>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    disabled={!isUpdate}
                    onChange={handleChange}
                    value={userProfile.firstName}
                    required
                    maxLength={100}
                  />
                  <Feedback message="First name is required" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastName">
                  <Form.Label className={isUpdate ? "required-asterik" : ""}>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    disabled={!isUpdate}
                    onChange={handleChange}
                    value={userProfile.lastName}
                    required
                    maxLength={100}
                  />
                  <Feedback message="Last name is required" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" name="userName" disabled value={userProfile.userName} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="text" name="email" disabled value={userProfile.email} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="groupName">
                  <Form.Label>Group Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="groupName"
                    onChange={handleChange}
                    disabled={!isUpdate}
                    value={userProfile.groupName}
                    maxLength={250}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="department">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    onChange={handleChange}
                    disabled={!isUpdate}
                    value={userProfile.department}
                    maxLength={250}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="affiliation">
                  <Form.Label>Organization/Institution</Form.Label>
                  <Form.Control
                    type="text"
                    name="affiliation"
                    onChange={handleChange}
                    disabled={!isUpdate}
                    value={userProfile.affiliation}
                    maxLength={250}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="affiliationWebsite">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="text"
                    name="affiliationWebsite"
                    onChange={handleChange}
                    disabled={!isUpdate}
                    value={userProfile.affiliationWebsite}
                    maxLength={250}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className={!isUpdate ? "text-center mt-2" : "hide-content"}>
              <Col md={4}>
                <Button className="link-button mt-3" onClick={() => editUser()}>
                  Edit
                </Button>
              </Col>
              <Col md={4}>
                <Link to="/changePassword">
                  <Button className="link-button mt-3">Change Password</Button>
                </Link>
              </Col>
              <Col md={4}>
                <Link to="/changeEmail">
                  <Button className="link-button mt-3">Change Email</Button>
                </Link>
              </Col>
            </Row>

            <div className={isUpdate ? "text-center mt-2" : "hide-content"}>
              <Button className="gg-btn-outline mt-3 gg-mr-20" onClick={() => handlecancel()}>
                Cancel
              </Button>
              <Button className="gg-btn-blue mt-3 gg-ml-20" type="submit" disabled={validated}>
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );

  function getProfile() {
    wsCall("profile", "GET", [username], true, null, getProfileSuccess, getProfileError);
  }

  function getProfileSuccess(response) {
    response.json().then((parsedJson) => {
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
    response.json().then((response) => {
      console.log(response);
      setShowErrorSummary(true);
      setPageErrorsJson(response);
    });
  }

  function handleSubmit(e) {
    setValidate(true);

    if (e.currentTarget.checkValidity()) {
      wsCall(
        "update",
        "POST",
        [userProfile.userName],
        true,
        userProfile,
        editProfileSuccess,
        editProfileError
      );
    }

    e.preventDefault();
  }
};

Profile.propTypes = {
  authCheckAgent: PropTypes.func,
};

export { Profile };
