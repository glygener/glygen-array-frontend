import React from "react";
import { Form, Row, Col } from "react-bootstrap";

const ViewSourceInfo = (props) => {
  return (
    <>
      {(props.source === "notSpecified" || props.source === "NOTRECORDED") && (
        <Form.Group as={Row} controlId="value">
          <Form.Label column xs={4} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
            <strong>Source</strong>
          </Form.Label>
          <Col xs={8} lg={9}>
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
          <Form.Group as={Row} controlId="value" className={props.className}>
            <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
              <strong>Source</strong>
            </Form.Label>
            <Col xs={12} lg={9}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={"Commercial"}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="vendor" className={props.className}>
            <Form.Label column xs={4} lg={5} xl={4} className="text-xs-left text-md-left text-lg-right">
              Vendor
            </Form.Label>
            <Col xs={8} lg={7}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.commercial.vendor}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="catalogueNumber" className={props.className}>
            <Form.Label column xs={4} lg={5} xl={4} className="text-xs-left text-md-left text-lg-right">
              Catalogue Number
            </Form.Label>
            <Col xs={8} lg={7}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.commercial.catalogueNumber}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="batchId" className={props.className}>
            <Form.Label column xs={4} lg={5} xl={4} className="text-xs-left text-md-left text-lg-right">
              Batch ID
            </Form.Label>
            <Col xs={8} lg={7}>
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
          <Form.Group as={Row} controlId="value" className={props.className}>
            <Form.Label column xs={12} lg={3} xl={2} className="text-xs-left text-md-left text-lg-right">
              <strong>Source</strong>
            </Form.Label>
            <Col xs={12} lg={9}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={"Non Commercial"}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="providerLab" className={props.className}>
            <Form.Label column xs={4} lg={5} xl={4} className="text-xs-left text-md-left text-lg-right">
              Provider Lab
            </Form.Label>
            <Col xs={8} lg={7}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.nonCommercial.providerLab}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="method" className={props.className}>
            <Form.Label column xs={4} lg={5} xl={4} className="text-xs-left text-md-left text-lg-right">
              Method
            </Form.Label>
            <Col xs={8} lg={7}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={props.nonCommercial.method}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="batchId" className={props.className}>
            <Form.Label column xs={4} lg={5} xl={4} className="text-xs-left text-md-left text-lg-right">
              Batch ID
            </Form.Label>
            <Col xs={8} lg={7}>
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
            <Form.Label column xs={12} lg={5} xl={4} className="text-xs-left text-md-left text-lg-right">
              Source Comment
            </Form.Label>
            <Col xs={12} lg={7}>
              {/* <div className="text-overflow text-max-height">{props.nonCommercial.sourceComment}</div> */}
              <Form.Control
                as="textarea"
                disabled
                rows={4}
                className="text-overflow text-max-height"
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
