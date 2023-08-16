import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Row, Col, Form } from "react-bootstrap";
import Helmet from "react-helmet";
import { FormLabel, Feedback, PageHeading } from "../components/FormControls";
import { head, getMeta } from "../utils/head";
import { useParams, useHistory, Link } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { Loading } from "../components/Loading";
import { StructureImage } from "../components/StructureImage";
import { Card } from "react-bootstrap";
import { Button } from "react-bootstrap";
import Container from "@material-ui/core/Container";
import FeedbackWidget from "../components/FeedbackWidget";

const EditGlycan = (props) => {
  let { glycanId } = useParams();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
    setShowLoading(true);
    wsCall("getglycan", "GET", [glycanId], true, null, getGlycanSuccess, getGlycanFailure);
  }, [props, glycanId]);

  const history = useHistory();

  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");

  const [glycanDetails, setGlycanDetails] = useReducer((state, newState) => ({ ...state, ...newState }), {
    name: "",
    internalId: "",
    description: "",
    mass: "",
    cartoon: "",
    glytoucanId: "",
    type: "",
  });

  const handleChange = (e) => {
    const name = e.target.name;
    const newValue = e.target.value;

    setGlycanDetails({ [name]: newValue });
  };

  function getGlycanSuccess(response) {
    response.json().then((parsedJson) => {
      setGlycanDetails(parsedJson);
      setShowLoading(false);
    });
  }

  function getGlycanFailure(response) {
    setValidated(false);
    setShowLoading(false);
    console.log(response);
  }

  function getGlycanTypeLabel(type) {
    switch (type) {
      case "SEQUENCE_DEFINED":
        return "Sequence Defined Glycan";
      case "UNKNOWN":
        return "Unknown Glycan";
      case "MASS_ONLY":
        return "Mass Defined Glycan";
      case "OTHER":
        return "Other Glycan";

      default:
        return "Sequence Defined Glycan";
    }
  }

  return (
    <>
      <Helmet>
        <title>{head.editGlycan.title}</title>
        {getMeta(head.editGlycan)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Edit Glycan"
            subTitle="Update glycan information. Internal ID and name must be unique in your glycan repository and can not be used for more than one glycan."
          />
          <Card>
            <Card.Body>
              {<Loading show={showLoading} />}

              {showErrorSummary === true && (
                <ErrorSummary
                  show={showErrorSummary}
                  form="glycans"
                  errorJson={pageErrorsJson}
                  errorMessage={pageErrorMessage}
                />
              )}

              <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
                {/* image */}
                {glycanDetails.cartoon && (
                  <Form.Group as={Row} controlId="image" className="gg-align-center text-center mb-0">
                    {/* <FormLabel label="Image" /> */}
                    <Col md={8}>
                      <StructureImage base64={glycanDetails.cartoon} style={{ minWidth: "20%" }} />
                    </Col>
                  </Form.Group>
                )}

                {/* Glycan Type */}
                {/* {glycanDetails.glytoucanId && ( */}
                <Form.Group as={Row} controlId="glycanType" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Glycan Type" />
                    <Form.Control
                      type="text"
                      // plaintext
                      readOnly
                      value={getGlycanTypeLabel(glycanDetails.type)}
                    />
                  </Col>
                </Form.Group>
                {/* )} */}

                {/* GlyTouCan ID */}
                {glycanDetails.glytoucanId && (
                  <Form.Group as={Row} controlId="glytoucanId" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="GlyTouCan ID" />
                      <Form.Control
                        type="text"
                        // plaintext
                        readOnly
                        value={glycanDetails.glytoucanId}
                      />
                    </Col>
                  </Form.Group>
                )}

                {/* Mass */}
                {glycanDetails.mass && (
                  <Form.Group as={Row} controlId="mass" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="Monoisotopic Mass" />
                      <Form.Control
                        type="text"
                        // plaintext
                        readOnly
                        value={Number(parseFloat(glycanDetails.mass).toFixed(2)).toLocaleString('en-US') + " Da"}
                      />
                    </Col>
                  </Form.Group>
                )}

                {/* Internal ID */}
                <Form.Group as={Row} className="gg-align-center mb-3" controlId="internalId">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Internal ID" />
                    <Form.Control
                      type="text"
                      placeholder="Enter Internal ID"
                      name="internalId"
                      value={glycanDetails.internalId}
                      onChange={handleChange}
                      maxLength={30}
                    />
                  </Col>
                </Form.Group>

                {/* Name */}
                <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Name" className={glycanDetails.type === "UNKNOWN" ? "required-asterik" : ""} />
                    <Form.Control
                      type="text"
                      placeholder="Enter Name of the glycan"
                      name="name"
                      value={glycanDetails.name}
                      onChange={handleChange}
                      required={glycanDetails.type === "UNKNOWN" ? true : false}
                      maxLength={50}
                    />
                    <Feedback message="Please Enter Glycan Name." />
                  </Col>
                </Form.Group>

                {/* Comment */}
                <Form.Group as={Row} controlId="comment" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Comment" />
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Enter Comment"
                      name="description"
                      value={glycanDetails.description}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <div className="text-right text-muted">
                      {glycanDetails.description && glycanDetails.description.length > 0
                        ? glycanDetails.description.length
                        : "0"}
                      /2000
                    </div>
                  </Col>
                </Form.Group>

                <div className="text-center mb-4 mt-4">
                  <Link to="/glycans">
                    <Button className="gg-btn-outline mt-2 gg-mr-20">Cancel</Button>
                  </Link>

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
      wsCall("updateglycan", "POST", null, true, glycanDetails, updateGlycanSuccess, updateGlycanFailure);
    }
    e.preventDefault();
  }

  function updateGlycanSuccess() {
    history.push("/glycans");
  }

  function updateGlycanFailure(response) {
    response.json().then((parsedJson) => {
      setShowErrorSummary(true);
      setPageErrorMessage("");
      setPageErrorsJson(parsedJson);
    });
  }
};

EditGlycan.propTypes = {
  authCheckAgent: PropTypes.func,
};

export { EditGlycan };
