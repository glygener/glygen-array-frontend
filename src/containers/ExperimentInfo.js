import React from "react";
import { Form, Row, Col, Button, Accordion, Card, Image } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
import plusIcon from "../images/icons/plus.svg";
import { Link } from "react-router-dom";
import { ContextAwareToggle } from "../utils/commonUtils";
import { PublicationCard } from "../components/PublicationCard";
import { LineTooltip } from "../components/tooltip/LineTooltip";

const ExperimentInfo = props => {
  let {
    experimentId,
    experiment,
    handleChange,
    duplicateName,
    handleSelect,
    sampleList,
    getPublication,
    getPublicationFormControl,
    showErrorSummary
  } = props;
  return (
    <>
      <Accordion defaultActiveKey={0} className="mb-4">
        <Card>
          <Card.Header>
            <Row>
              <Col className="descriptor-header">Experiment Information</Col>

              <Col style={{ textAlign: "right" }}>
                <ContextAwareToggle eventKey={0} classname={"font-awesome-color"} />
              </Col>
            </Row>
          </Card.Header>
          <Accordion.Collapse eventKey={0}>
            <Card.Body>
              {experimentId ? (
                <Form.Group as={Row} controlId="experimentId" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Experiment ID" />
                    <Form.Control readOnly value={experimentId} disabled />
                  </Col>
                </Form.Group>
              ) : (
                ""
              )}

              <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
                <Col xs={12} lg={9}>
                  <FormLabel label="Name" className="required-asterik" />
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter Name"
                    value={experiment.name}
                    onChange={handleChange}
                    required
                    isInvalid={duplicateName}
                  />
                  <Feedback
                    message={
                      duplicateName
                        ? "Another experiment  has the same Name. Please use a different Name."
                        : "Name is required"
                    }
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} controlId="description" className="gg-align-center mb-3">
                <Col xs={12} lg={9}>
                  <FormLabel label="Description" />
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    placeholder="Enter Description"
                    value={experiment.description}
                    onChange={handleChange}
                    maxLength={2000}
                  />
                  <div className="text-right text-muted">
                    {experiment.description && experiment.description.length > 0 ? experiment.description.length : "0"}
                    /2000
                  </div>
                </Col>
              </Form.Group>

              <Form.Group as={Row} controlId="samples" className="gg-align-center mb-3">
                <Col xs={12} lg={9}>
                  <FormLabel label="Samples" className="required-asterik" />
                  <Form.Control
                    as="select"
                    name="sample"
                    value={experiment.sample}
                    onChange={handleSelect}
                    required={true}
                    disabled={experiment.isPublic || experimentId}
                  >
                    {experiment.isPublic || experimentId ? (
                      <option value={experiment.sample}>{experiment.sample}</option>
                    ) : (
                      <>
                        <option value="">Select Sample</option>
                        {sampleList.rows &&
                          sampleList.rows.map((element, index) => {
                            return (
                              <option key={index} value={element.name}>
                                {element.name}
                              </option>
                            );
                          })}
                      </>
                    )}
                  </Form.Control>
                  <Feedback message="Sample is required"></Feedback>
                </Col>
              </Form.Group>

              {!experimentId && (
                <>
                  <Form.Group as={Row} controlId="publications" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="Publications" />
                      {experiment.publications.map(pub => {
                        return <PublicationCard key={pub.pubmedId} enableDelete {...pub} deletePublication={props.deleteRow}/>;
                      })}
                      <Row>
                        <Col md={10}>{getPublicationFormControl()}</Col>
                        {!experimentId && (
                          <Col md={1}>
                            <Button onClick={() => getPublication()} className="gg-btn-outline-reg">
                              <LineTooltip text="Add Publication">
                                <Link>
                                  <Image src={plusIcon} alt="plus button" />
                                </Link>
                              </LineTooltip>
                            </Button>
                          </Col>
                        )}
                      </Row>
                    </Col>
                  </Form.Group>
                </>
              )}

              <div className="text-center mb-4 mt-4">
                <Button className="gg-btn-blue mt-2" type="submit" disabled={showErrorSummary}>
                  {!experimentId ? "Submit" : "Update"}
                </Button>
              </div>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </>
  );
};

export { ExperimentInfo };
