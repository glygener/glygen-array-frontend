import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Row, Col, Form } from "react-bootstrap";
import Helmet from "react-helmet";
import { FormLabel, Feedback, FormButton, Title, LinkButton } from "../components/FormControls";
import { head, getMeta } from "../utils/head";
import { useHistory, useParams } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { StructureImage } from "../components/StructureImage";

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
      debugger;
      setLinkerDetails(parsedJson);
    });
  }

  function getLinkerFailure(response) {
    response.json().then(parsedJson => {
      debugger;
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
      case "SMALLMOLECULE":
        return "Linker";
      case "UNKNOWN_SMALLMOLECULE":
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
            form="linkers"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
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

          {linkerDetails.pdbIds && linkerDetails.pdbIds.length > 0 && (
            <Form.Group as={Row} controlId="pdbIds">
              <FormLabel label={"PDB Ids"} />
              <Col md={4}>
                {linkerDetails.pdbIds.map(pdb => {
                  return (
                    <>
                      <li>
                        <Form.Control type="text" plaintext readOnly value={pdb} />
                      </li>
                    </>
                  );
                })}
              </Col>
            </Form.Group>
          )}

          {linkerDetails.uniProtId && (
            <Form.Group as={Row} controlId="uniProtId">
              <FormLabel label={"UniProt Id"} />
              <Col md={4}>
                <Form.Control type="text" plaintext readOnly value={linkerDetails.uniProtId} />
              </Col>
            </Form.Group>
          )}

          {linkerDetails.imageURL && (
            <Form.Group as={Row} controlId="imageURL">
              <FormLabel label={"Image URL"} />
              <Col md={4}>
                <StructureImage imgUrl={linkerDetails.imageURL} />,
              </Col>
            </Form.Group>
          )}

          {linkerDetails.mass && (
            <Form.Group as={Row} controlId="mass">
              <FormLabel label={"Mass"} />
              <Col md={4}>
                <Form.Control type="text" plaintext readOnly value={linkerDetails.mass} />
              </Col>
            </Form.Group>
          )}

          {linkerDetails.iupacName && (
            <Form.Group as={Row} controlId="iupacName">
              <FormLabel label={"IUPAC Name"} />
              <Col md={4}>
                <Form.Control type="text" plaintext readOnly value={linkerDetails.iupacName} />
              </Col>
            </Form.Group>
          )}

          {linkerDetails.smiles && (
            <Form.Group as={Row} controlId="smiles">
              <FormLabel label={"Canonical SMILES"} />
              <Col md={4}>
                <Form.Control type="text" plaintext readOnly value={linkerDetails.smiles} />
              </Col>
            </Form.Group>
          )}

          {linkerDetails.isomericSmiles && (
            <Form.Group as={Row} controlId="smiles">
              <FormLabel label={"Isomeric SMILES"} />
              <Col md={4}>
                <Form.Control type="text" plaintext readOnly value={linkerDetails.isomericSmiles} />
              </Col>
            </Form.Group>
          )}

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
