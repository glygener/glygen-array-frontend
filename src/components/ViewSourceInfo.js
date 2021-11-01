import React from "react";
import { Form, Row, Col } from "react-bootstrap";

const ViewSourceInfo = (props) => {
  return (
    <>
      {(props.source === "notSpecified" || props.source === "NOTRECORDED") && (
        <Form.Group as={Row} controlId="value">
          <Form.Label
            column
            xs={12}
            md={12}
            lg={3}
            className="text-xs-left text-md-left text-lg-right"
          >
            Source
            {/* <strong>Source</strong> */}
          </Form.Label>
          <Col xs={12} md={12} lg={9} xl={8}>
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
          {/* <FormLabel label="Source" className={"metadata-descriptor-title "} /> */}
          <Form.Group as={Row} controlId="value">
            <Form.Label
              column
              xs={12}
              md={12}
              lg={3}
              className="text-xs-left text-md-left text-lg-right"
            >
              Source
              {/* <strong>Source</strong> */}
            </Form.Label>
            <Col xs={12} md={12} lg={9} xl={8}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={"Commercial"}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="vendor">
            <Form.Label
              column
              xs={12}
              md={12}
              lg={5}
              className="text-xs-left text-md-left text-lg-right"
            >
              Vendor
              {/* <strong>Vendor</strong> */}
            </Form.Label>
            <Col xs={12} md={10} lg={7} xl={6}>
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
            <Form.Label
              column
              xs={12}
              md={12}
              lg={5}
              className="text-xs-left text-md-left text-lg-right"
            >
              Catalogue Number
              {/* <strong>Catalogue Number</strong> */}
            </Form.Label>
            <Col xs={12} md={10} lg={7} xl={6}>
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
            <Form.Label
              column
              xs={12}
              md={12}
              lg={5}
              className="text-xs-left text-md-left text-lg-right"
            >
              Batch ID
              {/* <strong>Batch ID</strong> */}
            </Form.Label>
            <Col xs={12} md={10} lg={7} xl={6}>
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
          {/* <FormLabel label="Source" className={"metadata-descriptor-title "} /> */}
          <Form.Group as={Row} controlId="value">
            <Form.Label
              column
              xs={12}
              md={12}
              lg={3}
              className="text-xs-left text-md-left text-lg-right"
            >
              Source
              {/* <strong>Source</strong> */}
            </Form.Label>
            <Col xs={12} md={12} lg={9} xl={8}>
              <Form.Control
                type="text"
                disabled
                plaintext={props.isUpdate}
                readOnly={props.isUpdate}
                value={"Non Commercial"}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="providerLab">
            <Form.Label
              column
              xs={12}
              md={12}
              lg={5}
              className="text-xs-left text-md-left text-lg-right"
            >
              Provider Lab
              {/* <strong>Provider Lab</strong> */}
            </Form.Label>
            <Col xs={12} md={10} lg={7} xl={6}>
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
            <Form.Label
              column
              xs={12}
              md={12}
              lg={5}
              className="text-xs-left text-md-left text-lg-right"
            >
              Method
              {/* <strong>Method</strong> */}
            </Form.Label>
            <Col xs={12} md={10} lg={7} xl={6}>
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
            <Form.Label
              column
              xs={12}
              md={12}
              lg={5}
              className="text-xs-left text-md-left text-lg-right"
            >
              Batch ID
              {/* <strong>Batch ID</strong> */}
            </Form.Label>
            <Col xs={12} md={10} lg={7} xl={6}>
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
            <Form.Label
              column
              xs={12}
              md={12}
              lg={5}
              className="text-xs-left text-md-left text-lg-right"
            >
              Source Comment
              {/* <strong>Source Comment</strong> */}
            </Form.Label>
            <Col xs={12} md={10} lg={7} xl={6}>
              <Form.Control
                as="textarea"
                disabled
                rows={4}
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
