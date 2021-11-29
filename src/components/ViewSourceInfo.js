import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FormLabel } from "../components/FormControls";
const ViewSourceInfo = (props) => {
  return (
    <>
      {(props.source === "notSpecified" || props.source === "NOTRECORDED") && (
        <Form.Group as={Row} className="gg-align-center mb-3" controlId="value">
          <Col xs={12} lg={9}>
            <FormLabel label="Source" />
            <Form.Control
              type="text"
              disabled
              // plaintext={props.isUpdate}
              readOnly={props.isUpdate}
              defaultValue={props.isUpdate}
              value={"Not Recorded"}
            />
          </Col>
        </Form.Group>
      )}

      {(props.source === "commercial" || props.source === "COMMERCIAL") && (
        <>
          <Form.Group as={Row} className="gg-align-center mb-3" controlId="value">
            <Col xs={12} lg={9}>
              <FormLabel label="Source" />
              <Form.Control
                type="text"
                disabled
                // plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={"Commercial"}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="vendor" className="gg-align-center mb-3">
            <Col xs={10} lg={7}>
              <FormLabel label="Vendor" />
              <Form.Control
                type="text"
                disabled
                // plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.commercial.vendor}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="catalogueNumber" className="gg-align-center mb-3">
            <Col xs={10} lg={7}>
              <FormLabel label="Catalogue Number" />
              <Form.Control
                type="text"
                disabled
                // plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.commercial.catalogueNumber}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="batchId" className="gg-align-center mb-3">
            <Col xs={10} lg={7}>
              <FormLabel label="Batch ID" />
              <Form.Control
                type="text"
                disabled
                // plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.commercial.batchId}
              />
            </Col>
          </Form.Group>
        </>
      )}

      {(props.source === "nonCommercial" || props.source === "NONCOMMERCIAL") && (
        <>
          <Form.Group as={Row} className="gg-align-center mb-3" controlId="value">
            <Col xs={12} lg={9}>
              <FormLabel label="Source" />
              <Form.Control
                type="text"
                disabled
                // plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={"Non Commercial"}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="providerLab" className="gg-align-center mb-3">
            <Col xs={10} lg={7}>
              <FormLabel label="Provider Lab" />
              <Form.Control
                type="text"
                disabled
                // plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.nonCommercial.providerLab}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="method" className="gg-align-center mb-3">
            <Col xs={10} lg={7}>
              <FormLabel label="Method" />
              <Form.Control
                type="text"
                disabled
                // plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.nonCommercial.method}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="batchId" className="gg-align-center mb-3">
            <Col xs={10} lg={7}>
              <FormLabel label="Batch ID" />
              <Form.Control
                type="text"
                disabled
                // plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.nonCommercial.batchId}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="gg-align-center mb-3" controlId="sourceComment">
            <Col xs={10} lg={7}>
              <FormLabel label="Source Comment" />
              <Form.Control
                as="textarea"
                disabled
                rows={4}
                className="text-overflow text-max-height"
                // plaintext={props.isUpdate}
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
