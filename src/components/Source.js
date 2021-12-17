import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
import { BlueCheckbox } from "../components/FormControls";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const Source = (props) => {
  const getCommercial = () => {
    return (
      <>
        <Form.Group as={Row} controlId="vendor" className="gg-align-center mb-3">
          <Col xs={10} lg={7}>
            <FormLabel label="Vendor" className="required-asterik" />
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
            <Feedback message="Vendor is required" />
          </Col>
          {props.isMetadata && (
            <Col>
              <Form.Group className="mb-3" controlId={"vendorCheckBox"}>
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

        <Form.Group as={Row} controlId="catalogueNumber" className="gg-align-center mb-3">
          <Col xs={10} lg={7}>
            <FormLabel label="Catalogue Number" />
            <Form.Control
              name="catalogueNumber"
              type="text"
              placeholder="Enter Catalogue Number"
              value={props.commercial.catalogueNumber}
              onChange={(e) => props.sourceChange(e)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="batchId" className="gg-align-center mb-3">
          <Col xs={10} lg={7}>
            <FormLabel label="Batch ID" />
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
        <Form.Group as={Row} controlId="providerLab" className="gg-align-center mb-3">
          <Col xs={10} lg={7}>
            <FormLabel label="Provider Lab" className="required-asterik" />
            <Form.Control
              name="providerLab"
              type="text"
              placeholder="Enter Provider Lab name"
              value={props.nonCommercial.providerLab}
              isInvalid={props.validate}
              onChange={(e) => props.sourceChange(e)}
              disabled={props.nonCommercial.providerLabNotRecorded}
              required
            />
            <Feedback message="Provider Lab is required" />
          </Col>
          {props.isMetadata && (
            <Col>
              <Form.Group className="mb-3" controlId="providerLabCheckBox">
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

        <Form.Group as={Row} controlId="batchId" className="gg-align-center mb-3">
          <Col xs={10} lg={7}>
            <FormLabel label="Batch ID" />
            <Form.Control
              name="batchId"
              type="text"
              placeholder="Enter Batch ID"
              onChange={(e) => props.sourceChange(e)}
              value={props.nonCommercial.batchId}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="method" className="gg-align-center mb-3">
          <Col xs={10} lg={7}>
            <FormLabel label="Method" />
            <Form.Control
              name="method"
              as="textarea"
              rows={4}
              placeholder="Enter Method"
              value={props.nonCommercial.method}
              onChange={(e) => props.sourceChange(e)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId="sourceComment">
          <Col xs={10} lg={7}>
            <FormLabel label="Source Comment" />
            <Form.Control
              as="textarea"
              rows={4}
              name="sourceComment"
              placeholder="Enter Source Comment"
              value={props.nonCommercial.sourceComment}
              onChange={(e) => props.sourceChange(e)}
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
