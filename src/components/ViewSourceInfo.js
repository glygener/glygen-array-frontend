import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FormLabel } from "../components/FormControls";

const ViewSourceInfo = props => {
  return (
    <>
      {props.source === "notSpecified" && (
        <Form.Group as={Row} controlId="value">
          <FormLabel label="Source" />
          <Col md={4}>
            <Form.Control type="text" disabled value={"Not Recorded"} />
          </Col>
        </Form.Group>
      )}

      {props.source === "commercial" && (
        <>
          <FormLabel label="Source" className={"metadata-descriptor-title "} />
          <Form.Group as={Row} controlId="vendor">
            <FormLabel label="Vendor" />
            <Col md={4}>
              <Form.Control type="text" disabled value={props.commercial.vendor} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="catalogueNumber">
            <FormLabel label="Catalogue Number" />
            <Col md={4}>
              <Form.Control type="text" disabled value={props.commercial.catalogueNumber} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="batchId">
            <FormLabel label=" Batch Id" />
            <Col md={4}>
              <Form.Control type="text" disabled value={props.commercial.batchId} />
            </Col>
          </Form.Group>
        </>
      )}

      {props.source === "nonCommercial" && (
        <>
          <FormLabel label="Source" className={"metadata-descriptor-title "} />
          <Form.Group as={Row} controlId="providerLab">
            <FormLabel label="Provider Lab" />
            <Col md={4}>
              <Form.Control type="text" disabled value={props.nonCommercial.providerLab} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="method">
            <FormLabel label="Method" />
            <Col md={4}>
              <Form.Control type="text" disabled value={props.nonCommercial.method} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="batchId">
            <FormLabel label="Batch Id" />
            <Col md={4}>
              <Form.Control type="text" disabled value={props.nonCommercial.batchId} />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="batchId">
            <FormLabel label="Comment" />
            <Col md={4}>
              <Form.Control type="text" disabled value={props.nonCommercial.sourceComment} />
            </Col>
          </Form.Group>
        </>
      )}
    </>
  );
};

export { ViewSourceInfo };
