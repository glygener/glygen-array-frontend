import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FormLabel } from "../components/FormControls";

const ViewSourceInfo = props => {
  return (
    <>
      {(props.source === "notSpecified" || props.source === "NOTRECORDED") && (
        <Form.Group as={Row} controlId="value">
          <FormLabel label="Source" />
          <Col md={4}>
            <Form.Control
              type="text"
              disabled
              plaintext={props.isUpdate}
              readOnly={props.isUpdate}
              value={"Not Recorded"}
            />
          </Col>
        </Form.Group>
      )}

      {(props.source === "commercial" || props.source === "COMMERCIAL") && (
        <>
          <FormLabel label="Source" className={"metadata-descriptor-title "} />
          <Form.Group as={Row} controlId="vendor">
            <FormLabel label="Vendor" />
            <Col md={4}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.commercial.vendor}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="catalogueNumber">
            <FormLabel label="Catalogue Number" />
            <Col md={4}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.commercial.catalogueNumber}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="batchId">
            <FormLabel label=" Batch Id" />
            <Col md={4}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.commercial.batchId}
              />
            </Col>
          </Form.Group>
        </>
      )}

      {(props.source === "nonCommercial" || props.source === "NONCOMMERCIAL") && (
        <>
          <FormLabel label="Source" className={"metadata-descriptor-title "} />
          <Form.Group as={Row} controlId="providerLab">
            <FormLabel label="Provider Lab" />
            <Col md={4}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.nonCommercial.providerLab}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="method">
            <FormLabel label="Method" />
            <Col md={4}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.nonCommercial.method}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="batchId">
            <FormLabel label="Batch Id" />
            <Col md={4}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.nonCommercial.batchId}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="batchId">
            <FormLabel label="Comment" />
            <Col md={4}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.nonCommercial.sourceComment}
              />
            </Col>
          </Form.Group>
        </>
      )}
    </>
  );
};

export { ViewSourceInfo };
