import React, { useReducer, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Row, Col, Form } from "react-bootstrap";
import { FormButton, FormLabel, Title } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import { useHistory, useParams, Prompt } from "react-router-dom";

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
    url: ""
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

      <div className="page-container">
        <Title title="Create Raw Data" />

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
          <Form.Group as={Row} controlId="fundingOrganization">
            <FormLabel label="Funding Organization" className={"text-fields required-asterik"} />
            <Col md={4}>
              <Form.Control
                type="text"
                name="fundingOrganization"
                value={grant.fundingOrganization}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="grantNumber">
            <FormLabel label="Grant Number" className={"text-fields"} />
            <Col md={4}>
              <Form.Control type="text" name="identifier" value={grant.grantNumber} onChange={handleChange} />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="grantTitle">
            <FormLabel label="Grant Title" className={"text-fields required-asterik"} />
            <Col md={4}>
              <Form.Control type="text" name="title" value={grant.grantTitle} onChange={handleChange} />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="url">
            <FormLabel label="Url" className={"text-fields"} />
            <Col md={4}>
              <Form.Control type="url" name="url" value={grant.url} onChange={handleChange} />
            </Col>
          </Form.Group>

          <Row style={{ marginTop: "3%" }}>
            <FormButton className="line-break-2" type="submit" label={"Submit"} />
            <FormButton
              className="line-break-2"
              type="button"
              label={"Cancel"}
              onClick={
                () => history.push("/experiments/editExperiment/" + experimentId)
                // history.goBack()
              }
            />
          </Row>
        </Form>
      </div>
    </>
  );
};

AddGrant.propTypes = {
  authCheckAgent: PropTypes.func,
  match: PropTypes.object
};

export { AddGrant };
