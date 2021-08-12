import React, { useState } from "react";
import PropTypes from "prop-types";
import "../components/GridForm.css";
import { HelpToolTip } from "./tooltip/HelpToolTip";
import { FormLabel, Feedback } from "./FormControls";
import { Form, Row, Col, Button, Accordion, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isValidNumber } from "../utils/commonUtils";

const GridForm = props => {
  const [arrow, setArrow] = useState("angle-up");

  const accordionForm = (
    <Card>
      <Card.Header style={{ height: "65px" }}>
        <Row>
          <Col md={6} className="font-awesome-color " style={{ textAlign: "left" }}>
            <span>{<HelpToolTip title={"Grid Form"} text={"Form to Add Layout"} helpIcon="gg-helpicon-detail" />}</span>
            <span className="descriptor-header"> {`Form Details`}</span>
          </Col>

          <Col md={6} style={{ textAlign: "right" }}>
            <Accordion.Toggle eventKey={props.accordionDrop ? 0 : 1} as={Card.Link}>
              <FontAwesomeIcon
                style={{
                  width: "50px",
                  height: "40px"
                }}
                icon={["fas", arrow]}
                title="Comments"
                size="lg"
                className="font-awesome-color"
                onClick={() => (arrow === "angle-up" ? setArrow("angle-down") : setArrow("angle-up"))}
              />
            </Accordion.Toggle>
          </Col>
        </Row>
      </Card.Header>

      <Accordion.Collapse eventKey={0}>
        <Card.Body>
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Name" className="required-asterik" />
            <Col md={5}>
              <Form.Control
                type="text"
                name="name"
                placeholder="name"
                value={props.gridParams.name}
                onChange={props.handleChange}
                required
                isInvalid={props.duplicateName}
                disabled={props.publicView}
              />
              <Feedback
                message={
                  props.duplicateName
                    ? props.layoutType !== "slidelayout"
                      ? "Another block layout in your collection has the same Name. Please use another Name"
                      : "Another slide layout has the same Name. Please use a different Name."
                    : "Name is required"
                }
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="description">
            <FormLabel label="Description" />
            <Col md={5}>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                placeholder="description"
                value={props.gridParams.description ? props.gridParams.description : ""}
                onChange={props.handleChange}
                maxLength={2000}
                disabled={props.publicView}
              />
              <span className="character-counter">
                {props.isUpdate
                  ? props.gridParams.description && props.gridParams.description !== ""
                    ? props.gridParams.description.length
                    : ""
                  : props.characterCounter}
                /2000
              </span>
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="columns">
            <FormLabel
              label={props.layoutType === "slidelayout" ? "Blocks per Column" : "Columns"}
              className="required-asterik"
            />
            <Col md={5}>
              <Form.Control
                type="number"
                name="cols"
                placeholder="columns"
                value={props.gridParams.cols}
                onChange={props.handleChange}
                readOnly={props.isUpdate || props.publicView}
                required
                onKeyDown={e => {
                  isValidNumber(e);
                }}
              />
              <Feedback message="Please enter valid columns" />
            </Col>
            {props.loadGrid && !props.isUpdate && !props.publicView && props.updatedGridParams.cols !== "" && (
              <Button variant="contained" onClick={() => props.changeRowsandColumns()} className="get-btn">
                Change Grid
              </Button>
            )}
          </Form.Group>
          <Form.Group as={Row} controlId="rows">
            <FormLabel
              label={props.layoutType === "slidelayout" ? "Blocks per Row" : "Rows"}
              className="required-asterik"
            />
            <Col md={5}>
              <Form.Control
                type="number"
                name="rows"
                placeholder="rows"
                value={props.gridParams.rows}
                onChange={props.handleChange}
                readOnly={props.isUpdate || props.publicView}
                required
                onKeyDown={e => {
                  isValidNumber(e);
                }}
              />
              <Feedback message="Please enter valid rows" />
            </Col>

            {props.loadGrid && !props.isUpdate && !props.publicView && props.updatedGridParams.rows !== "" && (
              <Button onClick={() => props.changeRowsandColumns()} className="get-btn">
                Change Grid
              </Button>
            )}
          </Form.Group>

          {props.enableSpotMetadataSelection && (
            <Form.Group as={Row} controlId={"spotmetadataid"}>
              <FormLabel label={`Spot Metadata`} className="required-asterik" />
              <Col md={5}>
                <Form.Control
                  as="select"
                  name="spotMetadataSelected"
                  value={props.selectedSpotMetadata.value}
                  onChange={props.handleSpotSelection.bind(this)}
                  required
                >
                  <option value="">Select</option>
                  {props.spotList.map((element, index) => {
                    return (
                      <option key={index} value={element.name} id={element.id} name={element.name}>
                        {element.name}
                      </option>
                    );
                  })}
                </Form.Control>
                <Feedback message={`Spot Metadata selection is required`} />
              </Col>
            </Form.Group>
          )}

          <Button
            className={props.loadGrid ? "hide-content" : "line-break-2"}
            name="createGrid"
            onClick={() => props.validateForm()}
          >
            Create Grid
          </Button>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );

  const getAccordion = () => {
    return (
      <>
        <Accordion defaultActiveKey={0}>{accordionForm}</Accordion>
      </>
    );
  };

  return <>{getAccordion()}</>;
};

GridForm.propTypes = {
  gridParams: PropTypes.object,
  updatedGridParams: PropTypes.object,
  handleChange: PropTypes.func,
  isUpdate: PropTypes.bool,
  loadGrid: PropTypes.bool,
  changeRowsandColumns: PropTypes.func,
  validateForm: PropTypes.func,
  duplicateName: PropTypes.bool,
  layoutType: PropTypes.string,
  characterCounter: PropTypes.number,
  accordionDrop: PropTypes.bool,
  publicView: PropTypes.string,
  selectedSpotMetadata: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  spotList: PropTypes.array,
  handleSpotSelection: PropTypes.func,
  enableSpotMetadataSelection: PropTypes.bool
};

export { GridForm };
