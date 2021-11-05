import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import { Feedback } from "../components/FormControls";
import { BlueCheckbox } from "../components/FormControls";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const Source = props => {
  const getCommercial = () => {
    return (
      <>
        <Form.Group as={Row} controlId={"vendor"}>
          <Form.Label
            column
            xs={12}
            md={12}
            lg={5}
            className="required-asterik text-xs-left text-md-left text-lg-right"
          >
            Vendor
            {/* <strong>Vendor</strong> */}
          </Form.Label>
          <Col xs={12} md={10} lg={7} xl={6}>
            <Form.Control
              name="vendor"
              type="text"
              placeholder="Enter Vendor name"
              value={props.commercial.vendor}
              isInvalid={props.validate}
              onChange={(e) => props.sourceChange(e)}
              disabled={props.commercial.vendorNotRecorded}
              required
            />
            <Feedback message={"Vendor is required"} />
          </Col>
          {props.isMetadata && (
            <Col>
              <Form.Group className="mb-3" controlId={"vendorCheckBox"}>
                {/* It can be deleted
                <Form.Check
                  type="checkbox"
                  label={"not reported"}
                  onChange={props.commercialNotRecordedChange}
                  checked={props.commercial["vendorNotRecorded"]}
                  // defaultChecked={props.commercial["vendorNotRecorded"]}
                /> */}
                <FormControlLabel
                  control={
                    <BlueCheckbox
                      name="vendorNotRecorded"
                      onChange={props.commercialNotRecordedChange}
                      checked={props.commercial["vendorNotRecorded"]}
                      size="large"
                    />
                  }
                  label="Not Reported"
                />
              </Form.Group>
            </Col>
          )}
        </Form.Group>

        <Form.Group as={Row} controlId="cataloguenumber">
          <Form.Label column xs={12} md={12} lg={5} className="text-xs-left text-md-left text-lg-right">
            Catalogue Number
          </Form.Label>
          <Col xs={12} md={10} lg={7} xl={6}>
            <Form.Control
              name="catalogueNumber"
              type="text"
              placeholder="Enter Catalogue Number"
              value={props.commercial.catalogueNumber}
              onChange={(e) => props.sourceChange(e)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="batchId">
          <Form.Label column xs={12} md={12} lg={5} className="text-xs-left text-md-left text-lg-right">
            Batch ID
            {/* <strong>Batch ID</strong> */}
          </Form.Label>
          <Col xs={12} md={10} lg={7} xl={6}>
            <Form.Control
              name="batchId"
              type="text"
              placeholder="Enter Batch ID"
              value={props.commercial.batchId}
              onChange={(e) => props.sourceChange(e)}
            />
          </Col>
        </Form.Group>
      </>
    );
  };

  const getNonCommecial = () => {
    return (
      <>
        <Form.Group as={Row} controlId="providerlab">
          <Form.Label
            column
            xs={12}
            md={12}
            lg={5}
            className="required-asterik text-xs-left text-md-left text-lg-right"
          >
            Provider Lab
            {/* <strong>Provider Lab</strong> */}
          </Form.Label>
          <Col xs={12} md={10} lg={7} xl={6}>
            <Form.Control
              name="providerLab"
              type="text"
              placeholder="Enter Provider Lab name"
              value={props.nonCommercial.providerLab}
              isInvalid={props.validate}
              onChange={e => props.sourceChange(e)}
              disabled={props.nonCommercial.providerLabNotRecorded}
              required
            />
            <Feedback message="Provider Lab is required" />
          </Col>
          {props.isMetadata && (
            <Col>
              <Form.Group className="mb-3" controlId="providerLabCheckBox">
                {/* Can be deleted
                <Form.Check
                  type="checkbox"
                  label={"not reported"}
                  onChange={props.nonCommercialNotRecordedChange}
                  checked={props.nonCommercial["providerLabNotRecorded"]}
                  // defaultChecked={props.nonCommercial["providerLabNotRecorded"]}
                /> */}
                <FormControlLabel
                  control={
                    <BlueCheckbox
                      name="providerLabNotRecorded"
                      onChange={props.nonCommercialNotRecordedChange}
                      checked={props.nonCommercial["providerLabNotRecorded"]}
                      size="large"
                    />
                  }
                  label="Not Reported"
                />
              </Form.Group>
            </Col>
          )}
        </Form.Group>

        <Form.Group as={Row} controlId="batchId">
          <Form.Label column xs={12} md={12} lg={5} className="text-xs-left text-md-left text-lg-right">
            Batch ID
            {/* <strong>Batch ID</strong> */}
          </Form.Label>
          <Col xs={12} md={10} lg={7} xl={6}>
            <Form.Control
              name="batchId"
              type="text"
              placeholder="Enter Batch ID"
              onChange={e => props.sourceChange(e)}
              value={props.nonCommercial.batchId}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="method">
          <Form.Label column xs={12} md={12} lg={5} className="text-xs-left text-md-left text-lg-right">
            Method
            {/* <strong>Method</strong> */}
          </Form.Label>
          <Col xs={12} md={10} lg={7} xl={6}>
            <Form.Control
              name="method"
              type="text"
              placeholder="Enter Method"
              value={props.nonCommercial.method}
              onChange={e => props.sourceChange(e)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="comment">
          <Form.Label column xs={12} md={12} lg={5} className="text-xs-left text-md-left text-lg-right">
            Source Comment
            {/* <strong>Source Comment</strong> */}
          </Form.Label>
          <Col xs={12} md={10} lg={7} xl={6}>
            <Form.Control
              as="textarea"
              rows={4}
              name="sourceComment"
              placeholder="Enter Source Comment"
              value={props.nonCommercial.sourceComment}
              onChange={e => props.sourceChange(e)}
              maxLength={2000}
            />
            <div className="text-right text-muted">
              {props.nonCommercial.sourceComment && props.nonCommercial.sourceComment.length > 0
                ? props.nonCommercial.sourceComment.length
                : "0"}
              /2000
            </div>
          </Col>
        </Form.Group>
      </>
    );
  };

  return props.isCommercial ? getCommercial() : props.isNonCommercial ? getNonCommecial() : "";
};

export { Source };
