import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Row, Col, Form } from "react-bootstrap";
import Helmet from "react-helmet";
import { FormLabel, Feedback, PageHeading, Title, LinkButton } from "../components/FormControls";
import { head, getMeta } from "../utils/head";
import { useHistory, useParams, Link } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { StructureImage } from "../components/StructureImage";
import { ViewSourceInfo } from "../components/ViewSourceInfo";
import { PublicationCard } from "../components/PublicationCard";
import { externalizeUrl } from "../utils/commonUtils";
import { Button } from "react-bootstrap";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";

const EditLinker = (props) => {
  useEffect(props.authCheckAgent, []);

  const history = useHistory();
  let { linkerId } = useParams();

  const [source, setSource] = useState({});
  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");

  const [linkerDetails, setLinkerDetails] = useReducer((state, newState) => ({ ...state, ...newState }), {
    name: "",
    comment: "",
    description: "",
    sequence: "",
    type: "",
    commercial: {
      vendor: "",
      catalogueNumber: "",
      batchId: "",
    },
    nonCommercial: {
      providerLab: "",
      method: "",
      batchId: "",
      comment: "",
    },
    source: "",
  });

  const handleChange = (e) => {
    const name = e.target.name;
    const newValue = e.target.value;

    setLinkerDetails({ [name]: newValue });
  };

  function handleSource(resp) {
    let sourceObj = {};
    if (resp.source.type === "COMMERCIAL") {
      sourceObj.vendor = resp.source.vendor;
      sourceObj.catalogueNumber = resp.source.catalogueNumber;
      sourceObj.batchId = resp.source.batchId;
    } else if (resp.source.type === "NONCOMMERCIAL") {
      sourceObj.providerLab = resp.source.providerLab;
      sourceObj.method = resp.source.method;
      sourceObj.batchId = resp.source.batchId;
      sourceObj.sourceComment = resp.source.comment;
    }

    return sourceObj;
  }

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    wsCall("getlinker", "GET", [linkerId], true, null, getLinkerSuccess, getLinkerFailure);
  }, [linkerId, props]);

  function getLinkerSuccess(response) {
    let sourceObj;

    response.json().then((parsedJson) => {
      let resp = parsedJson;
      sourceObj = handleSource(resp);

      setLinkerDetails(parsedJson);

      setSource({
        type: resp.source.type,
        commercial: resp.source.type === "COMMERCIAL" ? sourceObj : {},
        nonCommercial: resp.source.type === "NONCOMMERCIAL" ? sourceObj : {},
      });
    });
  }

  function getLinkerFailure(response) {
    response.json().then((parsedJson) => {
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
        return "Unknown Peptide";
      case "PROTEIN":
        return "Protein";
      case "UNKNOWN_PROTEIN":
        return "Unknown Protein";
      case "LIPID":
        return "Lipid";
      case "UNKNOWN_LIPID":
        return "Unknown Lipid";
      case "SMALLMOLECULE":
        return "Linker";
      case "UNKNOWN_SMALLMOLECULE":
        return "Unknown Linker";
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
      <Container maxWidth="xl">
        <div className="page-container">
          {/* <Title title="Edit Molecule" /> */}
          <PageHeading
            title="Edit Linker"
            subTitle="Update linker information. Name must be unique in your linker repository and can not be used for more than one linker."
          />
          <Card>
            <Card.Body className="mt-4">
              {showErrorSummary === true && (
                <ErrorSummary
                  show={showErrorSummary}
                  form="linkers"
                  errorJson={pageErrorsJson}
                  errorMessage={pageErrorMessage}
                />
              )}

              <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
                <Form.Group as={Row} controlId="name">
                  <Form.Label
                    column
                    xs={12}
                    md={12}
                    lg={3}
                    xl={2}
                    className="required-asterik text-xs-left text-md-left text-lg-right"
                  >
                    <strong>Name</strong>
                  </Form.Label>
                  <Col xs={12} md={12} lg={9}>
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

                <Form.Group as={Row} controlId="linkerType">
                  <Form.Label column xs={5} md={4} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                    <strong>Linker Type</strong>
                  </Form.Label>
                  <Col xs={7} md={8} lg={9}>
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
                    <Form.Label
                      column
                      xs={12}
                      md={12}
                      lg={3}
                      xl={2}
                      className="text-xs-left text-md-left text-lg-right"
                    >
                      <strong>{linkerDetails.sequence ? "Sequence" : "InchI"}</strong>
                    </Form.Label>
                    <Col xs={12} md={12} lg={9}>
                      <div className="text-overflow text-max-height">
                        {linkerDetails.sequence ? linkerDetails.sequence : linkerDetails.inChiSequence}
                      </div>
                      {/* <Form.Control
                        rows={4}
                        as="textarea"
                        plaintext
                        readOnly
                        value={linkerDetails.sequence ? linkerDetails.sequence : linkerDetails.inChiSequence}
                      /> */}
                    </Col>
                  </Form.Group>
                )}

                <Form.Group as={Row} controlId="comment">
                  <Form.Label column xs={12} md={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
                    <strong>Comment</strong>
                  </Form.Label>
                  <Col xs={12} md={12} lg={9}>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Enter Comment"
                      name="description"
                      value={linkerDetails.description}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    {linkerDetails.description && linkerDetails.description.length > 0 && (
                      <div className="text-right text-muted">
                        {linkerDetails.description && linkerDetails.description.length > 0
                          ? linkerDetails.description.length
                          : "0"}
                        /2000
                      </div>
                    )}
                  </Col>
                </Form.Group>

                {linkerDetails.pdbIds && linkerDetails.pdbIds.length > 0 && (
                  <Form.Group as={Row} controlId="pdbIds">
                    {/* <FormLabel label={"PDB Ids"} /> */}
                    <Form.Label
                      column
                      xs={12}
                      md={12}
                      lg={3}
                      xl={2}
                      className="text-xs-left text-md-left text-lg-right"
                    >
                      <strong>PDB IDs</strong>
                    </Form.Label>
                    <Col xs={12} md={12} lg={9}>
                      {linkerDetails.pdbIds.map((pdb) => {
                        return (
                          <>
                            <div>
                              <Form.Control type="text" plaintext readOnly value={pdb} />
                            </div>
                          </>
                        );
                      })}
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.uniProtId && (
                  <Form.Group as={Row} controlId="uniProtId">
                    {/* <FormLabel label={"UniProt Id"} /> */}
                    <Form.Label
                      column
                      xs={12}
                      md={12}
                      lg={3}
                      xl={2}
                      className="text-xs-left text-md-left text-lg-right"
                    >
                      <strong>UniProt ID</strong>
                    </Form.Label>
                    <Col xs={12} md={12} lg={9}>
                      <Form.Control type="text" plaintext readOnly value={linkerDetails.uniProtId} />
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.imageURL && (
                  <Form.Group as={Row} controlId="imageURL">
                    {/* <FormLabel label={"Image URL"} /> */}
                    <Form.Label
                      column
                      xs={12}
                      md={12}
                      lg={3}
                      xl={2}
                      className="text-xs-left text-md-left text-lg-right"
                    >
                      <strong>Image URL</strong>
                    </Form.Label>
                    <Col xs={12} md={12} lg={9}>
                      <StructureImage imgUrl={linkerDetails.imageURL} />,
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.mass && (
                  <Form.Group as={Row} controlId="mass">
                    {/* <FormLabel label={"Mass"} /> */}
                    <Form.Label
                      column
                      xs={12}
                      md={12}
                      lg={3}
                      xl={2}
                      className="text-xs-left text-md-left text-lg-right"
                    >
                      <strong>Monoisotopic Mass</strong>
                    </Form.Label>
                    <Col xs={12} md={12} lg={9}>
                      <Form.Control type="text" plaintext readOnly value={linkerDetails.mass} />
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.iupacName && (
                  <Form.Group as={Row} controlId="iupacName">
                    {/* <FormLabel label={"IUPAC Name"} /> */}
                    <Form.Label
                      column
                      xs={12}
                      md={12}
                      lg={3}
                      xl={2}
                      className="text-xs-left text-md-left text-lg-right"
                    >
                      <strong>IUPAC Name</strong>
                    </Form.Label>
                    <Col xs={12} md={12} lg={9}>
                      <Form.Control type="text" plaintext readOnly value={linkerDetails.iupacName} />
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.smiles && (
                  <Form.Group as={Row} controlId="smiles">
                    {/* <FormLabel label={"Canonical SMILES"} /> */}
                    <Form.Label
                      column
                      xs={12}
                      md={12}
                      lg={3}
                      xl={2}
                      className="text-xs-left text-md-left text-lg-right"
                    >
                      <strong>Canonical SMILES</strong>
                    </Form.Label>
                    <Col xs={12} md={12} lg={9}>
                      <Form.Control type="text" plaintext readOnly value={linkerDetails.smiles} />
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.isomericSmiles && (
                  <Form.Group as={Row} controlId="smiles">
                    {/* <FormLabel label={"Isomeric SMILES"} /> */}
                    <Form.Label
                      column
                      xs={12}
                      md={12}
                      lg={3}
                      xl={2}
                      className="text-xs-left text-md-left text-lg-right"
                    >
                      <strong>Isomeric SMILES</strong>
                    </Form.Label>
                    <Col xs={12} md={12} lg={9}>
                      <Form.Control type="text" plaintext readOnly value={linkerDetails.isomericSmiles} />
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.urls && linkerDetails.urls.length > 0 && (
                  <Form.Group as={Row} controlId="urls">
                    <Form.Label
                      column
                      xs={12}
                      md={12}
                      lg={3}
                      xl={2}
                      className="text-xs-left text-md-left text-lg-right"
                    >
                      <strong>URLs</strong>
                    </Form.Label>
                    <Col xs={12} md={12} lg={9}>
                      {linkerDetails.urls.map((url, index) => {
                        return (
                          <div className="mb-2" key={index}>
                            <a href={externalizeUrl(url)} target="_blank" rel="external noopener noreferrer">
                              {url}
                            </a>
                          </div>
                        );
                      })}
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.publications && linkerDetails.publications.length > 0 && (
                  <Form.Group as={Row} controlId="publications" className="mb-0">
                    <Form.Label
                      column
                      xs={12}
                      md={12}
                      lg={3}
                      xl={2}
                      className="text-xs-left text-md-left text-lg-right"
                    >
                      <strong>Publication</strong>
                    </Form.Label>
                    <Col xs={12} md={12} lg={9}>
                      {linkerDetails.publications && linkerDetails.publications.length > 0
                        ? linkerDetails.publications.map((pub) => {
                            return (
                              <div>
                                <PublicationCard key={pub.pubmedId} {...pub} enableDelete={false} />
                              </div>
                            );
                          })
                        : ""}
                    </Col>
                  </Form.Group>
                )}

                {source && (
                  <ViewSourceInfo
                    source={source.type}
                    commercial={source.commercial}
                    nonCommercial={source.nonCommercial}
                    isUpdate
                    className="mb-0"
                  />
                )}

                <div className="text-center mb-4 mt-4">
                  {linkerDetails.type && (
                    <>
                      {linkerDetails.type.includes("OTHER") && (
                        <Link to="/othermolecules">
                          <Button className="gg-btn-blue mt-2 gg-mr-20">Cancel</Button>
                        </Link>
                      )}

                      {(linkerDetails.type.includes("LINKERS") || linkerDetails.type === "SMALLMOLECULE") && (
                        <Link to="/linkers">
                          <Button className="gg-btn-blue mt-2 gg-mr-20">Cancel</Button>
                        </Link>
                      )}

                      {linkerDetails.type.includes("LIPID") && (
                        <Link to="/lipids">
                          <Button className="gg-btn-blue mt-2 gg-mr-20">Cancel</Button>
                        </Link>
                      )}

                      {linkerDetails.type.includes("PROTEIN") && (
                        <Link to="/proteins">
                          <Button className="gg-btn-blue mt-2 gg-mr-20">Cancel</Button>
                        </Link>
                      )}

                      {linkerDetails.type.includes("PEPTIDE") && (
                        <Link to="/peptides">
                          <Button className="gg-btn-blue mt-2 gg-mr-20">Cancel</Button>
                        </Link>
                      )}
                    </>
                  )}

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
      case "SMALLMOLECULE":
        return history.push("/linkers");
      case "LIPID":
      case "UNKNOWN_LIPID":
        return history.push("/lipids");
      case "PROTEIN":
      case "UNKNOWN_PROTEIN":
        return history.push("/proteins");
      case "PEPTIDE":
      case "UNKNOWN_PEPTIDE":
        return history.push("/peptides");

      default:
        return history.push("/linkers");
    }
  }

  function updateLinkerFailure(response) {
    response.json().then((parsedJson) => {
      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
    });
  }
};

EditLinker.propTypes = {
  authCheckAgent: PropTypes.func
};

export { EditLinker };
