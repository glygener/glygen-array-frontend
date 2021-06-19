import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import Helmet from "react-helmet";
import { Title, LinkButton } from "../components/FormControls";
import { head, getMeta } from "../utils/head";
import { FeatureCard } from "../components/FeatureCard";
import { useParams } from "react-router-dom";

const EditFeature = props => {
  useEffect(props.authCheckAgent, []);

  let { featureId } = useParams();
  const [validated, setValidated] = useState(false);

  const [featureDetails, setFeatureDetails] = useReducer((state, newState) => ({ ...state, ...newState }), {
    name: "",
    type: "",
    linker: {},
    glycans: []
  });

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
    wsCall("getfeature", "GET", [featureId], true, null, getFeatureSuccess, getFeatureFailure);
  }, [props]);

  function getFeatureSuccess(response) {
    response.json().then(parsedJson => {
      setFeatureDetails(parsedJson);
    });
  }

  function getFeatureFailure(response) {
    setValidated(false);
    console.log(response);
  }

  return (
    <>
      <Helmet>
        <title>{head.editFeature.title}</title>
        {getMeta(head.editFeature)}
      </Helmet>
      <div className="page-container">
        <Title title="View Feature" />

        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <FeatureCard feature={featureDetails} showName></FeatureCard>
          <LinkButton to="/features" label="Back" />
        </Form>
      </div>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);
    e.preventDefault();
  }
};

EditFeature.propTypes = {
  authCheckAgent: PropTypes.func,
  match: PropTypes.object.isRequired,
  linkerId: PropTypes.object,
  history: PropTypes.object.isRequired,
  push: PropTypes.object
};

export { EditFeature };
