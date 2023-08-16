import React, { useEffect, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import Alert from "react-bootstrap/Alert";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, Link } from "react-router-dom";
import { Form } from "react-bootstrap";
import { Title } from "./FormControls";
import Container from "@material-ui/core/Container";
import FeedbackWidget from "./FeedbackWidget";

const EmailConfirmation = () => {
  const [variant, setVariant] = useState("success");
  const [unauthorized, setUnauthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  let { token } = useParams();

  useEffect(() => {
    wsCall("emailconfirm", "GET", { token: token }, false, null, tokenSuccess, tokenFailure);
  }, [token]); // passing an empty array as second argument triggers the callback in useEffect only after the initial render thus replicating `componentDidMount` lifecycle behaviour

  return (
    <>
      <Helmet>
        <title>{head.emailConfirmation.title}</title>
        {getMeta(head.addGlycan)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Email Confirmation"} />
          <Form>
            <div>
              <Alert variant={variant} show={unauthorized} className="alert-message line-break-1">
                {errorMessage}
              </Alert>
            </div>
            <br />
            <hr />
            <div className="text-center">
              <Link to="/login">Log In</Link>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );

  function tokenSuccess() {
    setUnauthorized(true);
    setErrorMessage("Your account has been successfully activated. Please login.");
  }

  function tokenFailure(response) {
    console.log(response);
    setUnauthorized(true);
    setVariant("danger");
    setErrorMessage(
      "The link from your email has already expired. Please return to sign up and create an account."
    );
  }
};

EmailConfirmation.propTypes = {
  match: PropTypes.object.isRequired,
  token: PropTypes.object,
};

export { EmailConfirmation };
