import React, { useEffect, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import Alert from "react-bootstrap/Alert";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, Link } from "react-router-dom";
import { Col, Card, Form } from "react-bootstrap";
import { Title } from "./FormControls";

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

      <Card
        style={{
          width: "500px"
        }}
        className={"card-page"}
      >
        <Title title={"Email Confirmation"} />
        <Form>
          <Col>
            <Alert variant={variant} show={unauthorized} className="alert-message line-break-1">
              {errorMessage}
            </Alert>
          </Col>
          <hr />
          <Col md={{ span: 6 }} style={{ marginLeft: "38%", width: "100px" }}>
            <Link to="/login" className="ui-link">
              Log In
            </Link>
          </Col>
        </Form>
        &nbsp;&nbsp;
      </Card>
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
    setErrorMessage("The link from your email has already expired. Please return to sign up and create an account.");
  }
};

EmailConfirmation.propTypes = {
  match: PropTypes.object.isRequired,
  token: PropTypes.object
};

export { EmailConfirmation };
