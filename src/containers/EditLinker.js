import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Row, Col, Form } from "react-bootstrap";
import Helmet from "react-helmet";
import { FormLabel, Feedback, FormButton, Title, LinkButton } from "../components/FormControls";
import { head, getMeta } from "../utils/head";
import { useHistory, useParams } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";

const EditLinker = props => {
  useEffect(props.authCheckAgent, []);

  const history = useHistory();
  let { linkerId } = useParams();

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");

  const [linkerDetails, setLinkerDetails] = useReducer((state, newState) => ({ ...state, ...newState }), {
    name: "",
    comment: "",
    description: "",
    sequence: "",
    type: ""
  });

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    setLinkerDetails({ [name]: newValue });
  };

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    wsCall("getlinker", "GET", [linkerId], true, null, getLinkerSuccess, getLinkerFailure);
  }, [linkerId, props]);

  function getLinkerSuccess(response) {
    response.json().then(parsedJson => {
      setLinkerDetails(parsedJson);
    });
  }

  function getLinkerFailure(response) {
    response.json().then(parsedJson => {
      setValidated(false);
      setPageErrorsJson(parsedJson);
      setPageErrorMessage("");
      setShowErrorSummary(true);
    });
  }

  function getTypeLabel(type) {
    switch (type) {
      case "PEPTIDE":
        return "Peptide";
      case "UNKNOWN_PEPTIDE":
        return "Unknown peptide";
      case "PROTEIN":
        return "Protein";
      case "UNKNOWN_PROTEIN":
        return "Unknown protein";
      case "LIPID":
        return "Lipid";
      case "UNKNOWN_LIPID":
        return "Unknown lipid";
      case "LINKER":
        return "Linker";
      case "UNKNOWN_Linker":
        return "Unknown linker";
      case "OTHER":
        return "Other";

      default:
        return "Linker";
    }
  }

  return (
    <>
      <Helmet>
        <title>{head.editLinker.title}</title>
        {getMeta(head.editLinker)}
      </Helmet>

      <div className="page-container">
        <Title title="Edit Molecule" />

        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="glycans"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          ></ErrorSummary>
        )}

        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Name" className="required-asterik" />
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="name"
                name="name"
                value={linkerDetails.name}
                onChange={handleChange}
                required
              />
              <Feedback message="Please Enter Linker Name." />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="comment">
            <FormLabel label="Comment" />
            <Col md={4}>
              <Form.Control
                as="textarea"
                placeholder="comment"
                name="comment"
                value={linkerDetails.description || linkerDetails.comment}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="linkerType">
            <FormLabel label="Type" />
            <Col md={4}>
              <Form.Control
                type="text"
                plaintext
                readOnly
                defaultValue={linkerDetails.type.length > 0 ? getTypeLabel(linkerDetails.type) : ""}
              />
            </Col>
          </Form.Group>

          {(linkerDetails.sequence || linkerDetails.inChiSequence) && (
            <Form.Group as={Row} controlId="sequence">
              <FormLabel label={linkerDetails.sequence ? "Sequence" : "InchI"} />
              <Col md={4}>
                <Form.Control
                  rows={4}
                  as="textarea"
                  plaintext
                  readOnly
                  value={linkerDetails.sequence ? linkerDetails.sequence : linkerDetails.inChiSequence}
                />
              </Col>
            </Form.Group>
          )}

          <FormButton className="line-break-1" type="submit" label="Submit" />

          {linkerDetails.type && (
            <>
              {linkerDetails.type.includes("OTHER") && <LinkButton to="/othermolecules" label="Cancel" />}
              {(linkerDetails.type.includes("LINKERS") || linkerDetails.type === "SMALLMOLECULE") && (
                <LinkButton to="/linkers" label="Cancel" />
              )}
              {linkerDetails.type.includes("LIPID") && <LinkButton to="/lipids" label="Cancel" />}
              {linkerDetails.type.includes("PROTEIN") && <LinkButton to="/proteins" label="Cancel" />}
              {linkerDetails.type.includes("PEPTIDE") && <LinkButton to={"/peptides"} label="Cancel" />}
            </>
          )}
        </Form>
      </div>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);

    if (e.currentTarget.checkValidity()) {
      wsCall("updatelinker", "POST", null, true, linkerDetails, updateLinkerSuccess, updateLinkerFailure);
    }
    e.preventDefault();
  }

  function updateLinkerSuccess() {
    switch (linkerDetails.type) {
      case "OTHER":
        return history.push("/othermolecules");
      case "LINKERS":
        return history.push("/linkers");
      case "LIPID":
        return history.push("/lipids");
      case "PROTEIN":
        return history.push("/proteins");
      case "PEPTIDE":
        return history.push("/peptides");

      default:
        return history.push("/linkers");
    }
  }

  function updateLinkerFailure(response) {
    response.json().then(parsedJson => {
      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
    });
  }
};

EditLinker.propTypes = {
  authCheckAgent: PropTypes.func
};

export { EditLinker };
