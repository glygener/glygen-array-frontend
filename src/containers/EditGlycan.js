import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Row, Col, Form } from "react-bootstrap";
import Helmet from "react-helmet";
import { Feedback, PageHeading } from "../components/FormControls";
import { head, getMeta } from "../utils/head";
import { useParams, useHistory, Link } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { Loading } from "../components/Loading";
import { StructureImage } from "../components/StructureImage";
import { Card } from "react-bootstrap";
import { addCommas } from "../utils/commonUtils";
import { Button } from "react-bootstrap";
import Container from "@material-ui/core/Container";

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

  const [glycanDetails, setGlycanDetails] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      name: "",
      internalId: "",
      description: "",
      mass: "",
      cartoon: "",
      glytoucanId: "",
      type: "",
    }
  );

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
        return "Sequence defined glycan";
      case "UNKNOWN":
        return "Unknown glycan";
      case "MASS_ONLY":
        return "Mass defined glycan";
      case "OTHER":
        return "Other glycan";

      default:
        return "Sequence defined glycan";
    }
  }

  return (
    <>
      <Helmet>
        <title>{head.editGlycan.title}</title>
        {getMeta(head.editGlycan)}
      </Helmet>
      <Container maxWidth="lg">
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
                  <Form.Group
                    as={Row}
                    controlId="image"
                    className="gg-align-center text-center mb-0"
                  >
                    {/* <FormLabel label="Image" /> */}
                    <Col md={8}>
                      <StructureImage base64={glycanDetails.cartoon} style={{ minWidth: "20%" }} />
                    </Col>
                  </Form.Group>
                )}

                {/* Glycan Type */}
                {glycanDetails.glytoucanId && (
                  <Form.Group as={Row} controlId="glycanType" className="gg-align-center mb-0 pb-0">
                    <Form.Label
                      column
                      xs={12}
                      sm={6}
                      lg={3}
                      className="text-xs-left text-sm-right text-md-right"
                    >
                      <strong>Glycan Type</strong>
                    </Form.Label>
                    <Col xs={12} sm={6} lg={8}>
                      <Form.Control
                        type="text"
                        plaintext
                        readOnly
                        value={getGlycanTypeLabel(glycanDetails.type)}
                      />
                    </Col>
                  </Form.Group>
                )}

                {/* GlyTouCan ID */}
                {glycanDetails.glytoucanId && (
                  <Form.Group
                    as={Row}
                    controlId="glytoucanId"
                    className="gg-align-center mb-0 pb-0"
                  >
                    <Form.Label
                      column
                      xs={12}
                      sm={6}
                      lg={3}
                      className="text-xs-left text-sm-right text-md-right"
                    >
                      <strong>GlyTouCan ID</strong>
                    </Form.Label>
                    <Col xs={12} sm={6} lg={8}>
                      <Form.Control
                        type="text"
                        plaintext
                        readOnly
                        value={glycanDetails.glytoucanId}
                      />
                    </Col>
                  </Form.Group>
                )}

                {/* Mass */}
                {glycanDetails.mass && (
                  <Form.Group as={Row} controlId="mass" className="gg-align-center">
                    <Form.Label
                      column
                      xs={12}
                      sm={6}
                      lg={3}
                      className="text-xs-left text-sm-right text-md-right"
                    >
                      <strong>Monoisotopic Mass</strong>
                    </Form.Label>
                    <Col xs={12} sm={6} lg={8}>
                      <Form.Control
                        type="text"
                        plaintext
                        readOnly
                        value={addCommas(parseInt(glycanDetails.mass).toFixed(2)) + " Da"}
                      />
                    </Col>
                  </Form.Group>
                )}

                {/* Internal ID */}
                <Form.Group as={Row} className="mb-3 gg-align-center" controlId="internalId">
                  <Form.Label
                    column
                    xs={12}
                    sm={6}
                    lg={3}
                    className="text-xs-left text-sm-right text-md-right"
                  >
                    <strong>Internal ID</strong>
                  </Form.Label>
                  <Col xs={12} sm={6} lg={8}>
                    <Form.Control
                      type="text"
                      placeholder="internal Id"
                      name="internalId"
                      value={glycanDetails.internalId}
                      onChange={handleChange}
                      maxLength={30}
                    />
                  </Col>
                </Form.Group>

                {/* Name */}
                <Form.Group as={Row} controlId="name" className="gg-align-center">
                  <Form.Label
                    column
                    xs={12}
                    sm={6}
                    lg={3}
                    className="text-xs-left text-sm-right text-md-right"
                  >
                    <strong className={glycanDetails.type === "UNKNOWN" ? "required-asterik" : ""}>
                      Name
                    </strong>
                  </Form.Label>
                  <Col xs={12} sm={6} lg={8}>
                    <Form.Control
                      type="text"
                      placeholder="name"
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
                <Form.Group as={Row} controlId="comment" className="gg-align-center">
                  <Form.Label
                    column
                    xs={12}
                    sm={6}
                    lg={3}
                    className="text-xs-left text-sm-right text-md-right"
                  >
                    <strong>Comment</strong>
                  </Form.Label>
                  <Col xs={12} sm={6} lg={8}>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      placeholder="comment"
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
                    <Button className="gg-btn-blue mt-2 gg-mr-20">Cancel</Button>
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
      wsCall(
        "updateglycan",
        "POST",
        null,
        true,
        glycanDetails,
        updateGlycanSuccess,
        updateGlycanFailure
      );
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
