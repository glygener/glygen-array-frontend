import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Row, Col, Form } from "react-bootstrap";
import Helmet from "react-helmet";
import { FormLabel, Feedback, PageHeading } from "../components/FormControls";
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
import { addCommas } from "../utils/commonUtils";
import { Table } from "react-bootstrap";

const EditLinker = props => {
  useEffect(props.authCheckAgent, []);

  const history = useHistory();
  let { moleculeId } = useParams();

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    history && getHeadingFromHistory(history);

    wsCall("getlinker", "GET", [moleculeId], true, null, getLinkerSuccess, getLinkerFailure);
  }, [moleculeId, props]);

  const [source, setSource] = useState({});
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [duplicateName, setDuplicateName] = useState(false);

  const [linkerDetails, setLinkerDetails] = useReducer((state, newState) => ({ ...state, ...newState }), {
    name: "",
    comment: "",
    description: "",
    sequence: "",
    type: "",
    commercial: {
      vendor: "",
      catalogueNumber: "",
      batchId: ""
    },
    nonCommercial: {
      providerLab: "",
      method: "",
      batchId: "",
      comment: ""
    },
    source: ""
  });

  const handleChange = e => {
    setValidated(false);
    const name = e.target.name;
    const newValue = e.target.value;

    if (name === "name") {
      setDuplicateName(false);
    }

    setLinkerDetails({ [name]: newValue });
  };

  function handleSource(resp) {
    let sourceObj = {};
    if (resp.source && resp.source.type === "COMMERCIAL") {
      sourceObj.vendor = resp.source.vendor;
      sourceObj.catalogueNumber = resp.source.catalogueNumber;
      sourceObj.batchId = resp.source.batchId;
    } else if (resp.source && resp.source.type === "NONCOMMERCIAL") {
      sourceObj.providerLab = resp.source.providerLab;
      sourceObj.method = resp.source.method;
      sourceObj.batchId = resp.source.batchId;
      sourceObj.sourceComment = resp.source.comment;
    }

    return sourceObj;
  }

  function getLinkerSuccess(response) {
    let sourceObj;

    response.json().then(parsedJson => {
      let resp = parsedJson;
      sourceObj = handleSource(resp);

      setLinkerDetails(parsedJson);

      resp.source &&
        setSource({
          type: resp.source.type,
          commercial: resp.source.type === "COMMERCIAL" ? sourceObj : {},
          nonCommercial: resp.source.type === "NONCOMMERCIAL" ? sourceObj : {}
        });
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
        return "Unknown Chemical/Linker";
      case "OTHER":
        return "Other";

      default:
        return "Linker";
    }
  }

  function getHeadingFromHistory(history) {
    if (history.location.pathname.includes("peptide")) {
      setPageHeading("Edit Peptide", "peptide");
    } else if (history.location.pathname.includes("protein")) {
      setPageHeading("Edit Protein", "protein");
    } else if (history.location.pathname.includes("lipid")) {
      setPageHeading("Edit Lipid", "lipid");
    } else if (history.location.pathname.includes("linker")) {
      setPageHeading("Edit Chemical/Linker", "chemical/linker");
    } else if (history.location.pathname.includes("otherMolecule")) {
      setPageHeading("Edit OtherMolecule", "othermolecule");
    }
  }

  function setPageHeading(title, subTitle) {
    setTitle(title);
    setSubTitle(
      `Update ${subTitle} information.
        Name must be unique in your ${subTitle} repository and cannot be used for more than one ${subTitle}.`
    );
  }

  return (
    <>
      <Helmet>
        <title>{head.editLinker.title}</title>
        {getMeta(head.editLinker)}
      </Helmet>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading title={title} subTitle={subTitle} />

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

              <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
                <Form.Group as={Row} className="gg-align-center mb-3" controlId="name">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Name" className="required-asterik" />
                    <Form.Control
                      type="text"
                      placeholder="Enter Name"
                      name="name"
                      value={linkerDetails.name}
                      onChange={handleChange}
                      maxLength={100}
                      required
                      isInvalid={duplicateName || validated}
                    />
                    <Feedback
                      message={
                        duplicateName
                          ? "Another molecule has the same Name. Please use a different Name."
                          : validated
                          ? "Name is required"
                          : ""
                      }
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="linkerType" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Type" />
                    <Form.Control
                      type="text"
                      // plaintext
                      readOnly
                      disabled
                      defaultValue={linkerDetails.type.length > 0 ? getTypeLabel(linkerDetails.type) : ""}
                    />
                  </Col>
                </Form.Group>

                {(linkerDetails.sequence || linkerDetails.inChiSequence) && (
                  <Form.Group as={Row} controlId="sequence" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label={linkerDetails.sequence ? "Sequence" : "InChI"} />
                      {/* <div className="text-overflow text-max-height">
                        {linkerDetails.sequence ? linkerDetails.sequence : linkerDetails.inChiSequence}
                      </div> */}
                      <Form.Control
                        // rows={4}
                        rows={linkerDetails === "sequence" ? "10" : "4"}
                        as="textarea"
                        // plaintext
                        readOnly
                        disabled
                        value={linkerDetails.sequence ? linkerDetails.sequence : linkerDetails.inChiSequence}
                      />
                    </Col>
                  </Form.Group>
                )}

                <Form.Group as={Row} controlId="comment" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Comment" />
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Enter Comment"
                      name="description"
                      value={linkerDetails.description}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    {/* {linkerDetails.description && linkerDetails.description.length > 0 && ( */}
                    <div className="text-right text-muted">
                      {linkerDetails.description && linkerDetails.description.length > 0
                        ? linkerDetails.description.length
                        : "0"}
                      /2000
                    </div>
                    {/* )} */}
                  </Col>
                </Form.Group>

                {linkerDetails.pdbIds && linkerDetails.pdbIds.length > 0 && (
                  <Form.Group as={Row} controlId="pdbIds" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label={"PDB IDs"} />
                      {linkerDetails.pdbIds.map(pdb => {
                        return (
                          <>
                            <div>
                              <Form.Control
                                type="text"
                                // plaintext
                                readOnly
                                disabled
                                value={pdb}
                              />
                            </div>
                          </>
                        );
                      })}
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.uniProtId && (
                  <Form.Group as={Row} controlId="uniProtId" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label={"UniProt ID"} />
                      <Form.Control
                        type="text"
                        // plaintext
                        readOnly
                        disabled
                        value={linkerDetails.uniProtId}
                      />
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.imageURL && (
                  <Form.Group as={Row} controlId="imageURL" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label={"Image"} />
                      <StructureImage imgUrl={linkerDetails.imageURL} />
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.mass && (
                  <Form.Group as={Row} controlId="mass" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="Monoisotopic Mass" />
                      <Form.Control
                        type="text"
                        // plaintext
                        readOnly
                        disabled
                        // value={linkerDetails.mass}
                        value={Number(parseFloat(linkerDetails.mass).toFixed(2)).toLocaleString('en-US') + " Da"}
                      />
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.iupacName && (
                  <Form.Group as={Row} controlId="iupacName" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label={"IUPAC Name"} />
                      <Form.Control
                        type="text"
                        // plaintext
                        readOnly
                        disabled
                        value={linkerDetails.iupacName}
                      />
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.smiles && (
                  <Form.Group as={Row} controlId="smiles" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label={"Canonical SMILES"} />
                      <Form.Control
                        type="text"
                        // plaintext
                        readOnly
                        disabled
                        value={linkerDetails.smiles}
                      />
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.isomericSmiles && (
                  <Form.Group as={Row} controlId="smiles" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="Isomeric SMILES" />
                      <Form.Control
                        type="text"
                        // plaintext
                        readOnly
                        disabled
                        value={linkerDetails.isomericSmiles}
                      />
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.urls && linkerDetails.urls.length > 0 && (
                  <Form.Group as={Row} controlId="urls" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="URLs" />
                      {linkerDetails.urls && linkerDetails.urls.length > 0
                        ? linkerDetails.urls.map((url, index) => {
                            return (
                              <Table hover className="borderless mb-0">
                                <tbody>
                                  <tr key={index}>
                                    <td>
                                      <a href={externalizeUrl(url)} target="_blank" rel="external noopener noreferrer">
                                        {url}
                                      </a>
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            );
                          })
                        : ""}
                    </Col>
                  </Form.Group>
                )}

                {linkerDetails.publications && linkerDetails.publications.length > 0 && (
                  <Form.Group as={Row} controlId="publications" className="gg-align-center mb-3 mb-0">
                    <Col xs={12} lg={9}>
                      <FormLabel label="Publication" />
                      {linkerDetails.publications && linkerDetails.publications.length > 0
                        ? linkerDetails.publications.map(pub => {
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
                  />
                )}

                <div className="text-center mb-4 mt-4">
                  {linkerDetails.type && (
                    <>
                      {linkerDetails.type.includes("OTHER") && (
                        <Link to="/otherMolecules">
                          <Button className="gg-btn-outline mt-2 gg-mr-20">Cancel</Button>
                        </Link>
                      )}

                      {(linkerDetails.type.includes("LINKERS") || linkerDetails.type.includes("SMALLMOLECULE")) && (
                        <Link to="/linkers">
                          <Button className="gg-btn-outline mt-2 gg-mr-20">Cancel</Button>
                        </Link>
                      )}

                      {linkerDetails.type.includes("LIPID") && (
                        <Link to="/lipids">
                          <Button className="gg-btn-outline mt-2 gg-mr-20">Cancel</Button>
                        </Link>
                      )}

                      {linkerDetails.type.includes("PROTEIN") && (
                        <Link to="/proteins">
                          <Button className="gg-btn-outline mt-2 gg-mr-20">Cancel</Button>
                        </Link>
                      )}

                      {linkerDetails.type.includes("PEPTIDE") && (
                        <Link to="/peptides">
                          <Button className="gg-btn-outline mt-2 gg-mr-20">Cancel</Button>
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
    // setValidated(true);

    if (!linkerDetails.name || linkerDetails.name === "") {
      setValidated(true);
    }

    if (e.currentTarget.checkValidity()) {
      wsCall("updatelinker", "POST", null, true, linkerDetails, updateLinkerSuccess, updateLinkerFailure);
    }
    e.preventDefault();
  }

  function updateLinkerSuccess() {
    switch (linkerDetails.type) {
      case "OTHER":
        return history.push("/otherMolecules");
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
    response.json().then(parsedJson => {
      if (parsedJson.errors.find(i => i.objectName === "name")) {
        setDuplicateName(true);
      }

      setPageErrorsJson(parsedJson);
      setShowErrorSummary(true);
    });
  }
};

EditLinker.propTypes = {
  authCheckAgent: PropTypes.func
};

export { EditLinker };
