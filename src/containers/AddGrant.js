import React, { useReducer, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FormButton, FormLabel, PageHeading } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import { useHistory, useParams, Prompt, Link } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";

const AddGrant = props => {
  let { experimentId } = useParams();

  const history = useHistory();
  const [validated, setValidate] = useState(false);
  const [enablePrompt, setEnablePrompt] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");

  const grantPage = {
    fundingOrganization: "",
    identifier: "",
    title: "",
    url: "",
  };
  const [grant, setGrant] = useReducer((state, newState) => ({ ...state, ...newState }), grantPage);

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
  }, []);

  const handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;
    setGrant({ [name]: value });
  };

  function handleSubmit(e) {
    setValidate(true);

    if (e.currentTarget.checkValidity()) {
      wsCall(
        "addgrant",
        "POST",
        { arraydatasetId: experimentId },
        true,
        grant,
        response =>
          response.text().then(responsejson => {
            console.log(responsejson);
            setEnablePrompt(false);
            history.goBack();
          }),
        response =>
          response.json().then(responsejson => {
            setPageErrorsJson(responsejson);
            setPageErrorMessage("");
            setShowErrorSummary(true);
          })
      );
    }
    e.preventDefault();
  }

  return (
    <>
      <Helmet>
        <title>{head.addRawData.title}</title>
        {getMeta(head.addRawData)}
      </Helmet>

      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading title="Add Grant to Repository" subTitle="Please provide the information for the new grant." />
          <Card>
            <Card.Body>
              {showErrorSummary === true && (
                <ErrorSummary
                  show={showErrorSummary}
                  form="grants"
                  errorJson={pageErrorsJson}
                  errorMessage={pageErrorMessage}
                />
              )}

              {showErrorSummary === true && window.scrollTo({ top: 0, behavior: "smooth" })}

              {enablePrompt && <Prompt message="If you leave you will lose this data!" />}

              <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
                <Form.Group as={Row} controlId="fundingOrganization" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Funding Organization" className="required-asterik" />

                    <Form.Control
                      type="text"
                      name="fundingOrganization"
                      value={grant.fundingOrganization}
                      onChange={handleChange}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="grantNumber" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Grant Number" />

                    <Form.Control type="text" name="identifier" value={grant.grantNumber} onChange={handleChange} />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="grantTitle" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Grant Title" className="required-asterik" />
                    <Form.Control type="text" name="title" value={grant.grantTitle} onChange={handleChange} />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="url" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="URL" />
                    <Form.Control type="url" name="url" value={grant.url} onChange={handleChange} />
                  </Col>
                </Form.Group>

                <div className="text-center mb-4 mt-4">
                  <Button
                    className="gg-btn-blue mt-2 gg-mr-20"
                    onClick={() => history.push("/experiments/editExperiment/" + experimentId)}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
                    Submit
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

AddGrant.propTypes = {
  authCheckAgent: PropTypes.func,
  match: PropTypes.object
};

export { AddGrant };
