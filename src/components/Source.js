import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";

const Source = props => {
  const getCommercial = () => {
    return (
      <>
        <Form.Group as={Row} controlId={"vendor"}>
          <FormLabel label={"Vendor"} className={"required-asterik"} />
          <Col md={4}>
            <Form.Control
              name={"vendor"}
              type={"text"}
              placeholder={"vendor"}
              value={props.commercial.vendor}
              isInvalid={props.validate}
              onChange={e => props.sourceChange(e)}
              disabled={props.commercial.vendorNotRecorded}
              required
            />
            <Feedback message={"Vendor is required"} />
          </Col>
          {props.isMetadata && (
            <Col>
              <Form.Group className="mb-3" controlId={"vendorCheckBox"}>
                <Form.Check
                  type="checkbox"
                  label={"not reported"}
                  onChange={props.commercialNotRecordedChange}
                  checked={props.commercial["vendorNotRecorded"]}
                  // defaultChecked={props.commercial["vendorNotRecorded"]}
                />
              </Form.Group>
            </Col>
          )}
        </Form.Group>

        <Form.Group as={Row} controlId={"cataloguenumber"}>
          <FormLabel label={"Catalogue Number"} />
          <Col md={4}>
            <Form.Control
              name={"catalogueNumber"}
              type={"text"}
              placeholder={"catalogue number"}
              value={props.commercial.catalogueNumber}
              onChange={e => props.sourceChange(e)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"batchId"}>
          <FormLabel label={"Batch Id"} />
          <Col md={4}>
            <Form.Control
              name={"batchId"}
              type={"text"}
              placeholder={"batch id"}
              value={props.commercial.batchId}
              onChange={e => props.sourceChange(e)}
            />
          </Col>
        </Form.Group>
      </>
    );
  };

  const getNonCommecial = () => {
    return (
      <>
        <Form.Group as={Row} controlId={"providerlab"}>
          <FormLabel label={"Provider lab"} className={"required-asterik"} />
          <Col md={4}>
            <Form.Control
              name={"providerLab"}
              type={"text"}
              placeholder={"provider lab"}
              value={props.nonCommercial.providerLab}
              isInvalid={props.validate}
              onChange={e => props.sourceChange(e)}
              disabled={props.nonCommercial.providerLabNotRecorded}
              required
            />
            <Feedback message={"Provider lab is required"} />
          </Col>
          {props.isMetadata && (
            <Col>
              <Form.Group className="mb-3" controlId={"providerLabCheckBox"}>
                <Form.Check
                  type="checkbox"
                  label={"not reported"}
                  onChange={props.nonCommercialNotRecordedChange}
                  checked={props.nonCommercial["providerLabNotRecorded"]}
                  // defaultChecked={props.nonCommercial["providerLabNotRecorded"]}
                />
              </Form.Group>
            </Col>
          )}
        </Form.Group>

        <Form.Group as={Row} controlId={"batchId"}>
          <FormLabel label={"Batch Id"} />
          <Col md={4}>
            <Form.Control
              name={"batchId"}
              type={"text"}
              placeholder={"batch id"}
              onChange={e => props.sourceChange(e)}
              value={props.nonCommercial.batchId}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId={"method"}>
          <FormLabel label={"Method"} />
          <Col md={4}>
            <Form.Control
              name={"method"}
              type={"text"}
              placeholder={"method"}
              value={props.nonCommercial.method}
              onChange={e => props.sourceChange(e)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="comment">
          <FormLabel label="Comment" />
          <Col md={4}>
            <Form.Control
              as="textarea"
              name={"sourceComment"}
              placeholder={"source comment"}
              value={props.nonCommercial.sourceComment}
              onChange={e => props.sourceChange(e)}
              maxLength={2000}
            />
            <span className="character-counter" style={{ marginLeft: "80%" }}>
              {props.nonCommercial.sourceComment && props.nonCommercial.sourceComment.length > 0
                ? props.nonCommercial.sourceComment.length
                : ""}
              /2000
            </span>
          </Col>
        </Form.Group>
      </>
    );
  };

  return props.isCommercial ? getCommercial() : props.isNonCommercial ? getNonCommecial() : "";
};

export { Source };
