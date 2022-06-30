import React, { useState, useReducer, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { FormLabel } from "../components/FormControls";

const ExperimentDetails = props => {
  let { experiment, enableExperimentModal } = props;

  const getExperimentView = () => {
    return (
      <>
      <div style={{
          overflow: "auto",
          height: "350px",
          width: "100%"
        }}>
        <Form.Group as={Row} controlId={"slide"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Name"} className="required-asterik" />
            <Form.Control type="text" name={"slide"} value={experiment.name ? experiment.name : ""} readOnly plaintext />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId={"metadata"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Samples"} className="required-asterik" />
            <Form.Control type="text" name={"metadata"} value={experiment.sample ? experiment.sample.name ? experiment.sample.name :  experiment.sample : "No data available"} readOnly plaintext />
          </Col>
        </Form.Group>
        </div>
        <Row st1yle={{ textAlign: "center" }}  className="mt-3">
          {!props.fromPublicDatasetPage && !props.isPublic && (<>
            <Col style={{ textAlign: "center" }}>
              <Button className="gg-btn-outline mt-2 gg-mr-20"
                onClick={() => {
                  props.setEnableSlideModal(true);
                }}
              >
                Add Slide</Button>
            </Col>
            </>
          )}
        </Row>
      </>
    );
  };

  return (
    <>
      <div>
      {enableExperimentModal && getExperimentView()}
      </div>
    </>
  );
};

export { ExperimentDetails };
