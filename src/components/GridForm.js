import React, { useState } from "react";
import PropTypes from "prop-types";
import "../components/GridForm.css";
import { HelpToolTip } from "./tooltip/HelpToolTip";
import { FormLabel, Feedback } from "./FormControls";
import { Form, Row, Col, Button, Accordion, Card, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isValidNumber } from "../utils/commonUtils";
import EditIcon from "@material-ui/icons/Edit";
import { LineTooltip } from "../components/tooltip/LineTooltip";

const GridForm = props => {
  const [arrow, setArrow] = useState("angle-up");

  const accordionForm = (
    <>
      {/* <Card> */}
      {/* <Card.Header style={{ height: "65px" }}>
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
      </Card.Header> */}

      {/* <Accordion.Collapse eventKey={0}>
        <Card.Body> */}
      {/* <Form> */}
      <Form.Group as={Row} controlId="name" className="gg-align-center mt-2 mb-3">
        <Col xs={12} lg={9}>
          <FormLabel label="Name" className="required-asterik" />
          <Form.Control
            type="text"
            name="name"
            placeholder="Enter Name"
            value={props.gridParams.name}
            onChange={props.handleChange}
            required
            isInvalid={props.duplicateName}
            disabled={props.publicView}
            maxLength={100}
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
      <Form.Group as={Row} controlId="description" className="gg-align-center mb-3">
        <Col xs={12} lg={9}>
          <FormLabel label="Description" />
          <Form.Control
            as="textarea"
            rows={4}
            name="description"
            placeholder="Enter Description"
            value={props.gridParams.description ? props.gridParams.description : ""}
            onChange={props.handleChange}
            maxLength={2000}
            disabled={props.publicView}
          />
          <div className="text-right text-muted">
            {props.isUpdate
              ? props.gridParams.description && props.gridParams.description !== "0"
                ? props.gridParams.description.length
                : "0"
              : props.characterCounter}
            /2000
          </div>
        </Col>
      </Form.Group>
      <Row className="gg-align-center mb-3">
        <Col xs={12} lg={9}>
          <Row>
            <Form.Group as={Col} xs={12} lg={6} controlId="columns" className="gg-align-center mb-3">
              <FormLabel
                label={props.layoutType === "slidelayout" ? "Blocks per Column" : "Columns"}
                className="required-asterik"
              />
              <InputGroup>
                <Form.Control
                  type="number"
                  name="cols"
                  placeholder="Entter # of Columns"
                  value={props.gridParams.cols}
                  onChange={props.handleChange}
                  readOnly={props.isUpdate || props.publicView}
                  required
                  onKeyDown={e => {
                    isValidNumber(e);
                  }}
                />
                <Feedback message="Please enter a valid number of columns" />

                {props.loadGrid && !props.isUpdate && !props.publicView && props.updatedGridParams.cols !== "" && (
                  <LineTooltip text="Edit # of Columns">
                    <Button onClick={() => props.changeRowsandColumns()} className="gg-btn-outline-reg">
                      {/* Change Grid */}
                      <EditIcon />
                    </Button>
                  </LineTooltip>
                )}
              </InputGroup>
            </Form.Group>
            <Form.Group as={Col} xs={12} lg={6} controlId="rows" className="gg-align-center">
              <FormLabel
                label={props.layoutType === "slidelayout" ? "Blocks per Row" : "Rows"}
                className="required-asterik"
              />
              <InputGroup>
                <Form.Control
                  type="number"
                  name="rows"
                  placeholder="Enter # of Rows"
                  value={props.gridParams.rows}
                  onChange={props.handleChange}
                  readOnly={props.isUpdate || props.publicView}
                  required
                  onKeyDown={e => {
                    isValidNumber(e);
                  }}
                />
                <Feedback message="Please enter a valid number of rows" />

                {props.loadGrid && !props.isUpdate && !props.publicView && props.updatedGridParams.rows !== "" && (
                  <LineTooltip text="Edit # of Columns">
                    <Button onClick={() => props.changeRowsandColumns()} className="gg-btn-outline-reg">
                      {/* Change Grid */}
                      <EditIcon />
                    </Button>
                  </LineTooltip>
                )}
              </InputGroup>
            </Form.Group>
          </Row>
        </Col>
      </Row>
      {props.enableSpotMetadataSelection && (
        <Form.Group as={Row} controlId="spotmetadataid" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Spot Metadata" className="required-asterik" />
            <Form.Control
              as="select"
              name="spotMetadataSelected"
              value={props.selectedSpotMetadata.value}
              onChange={props.handleSpotSelection.bind(this)}
              readOnly={props.isUpdate || props.publicView}
              required
            >
              <option value="">Select Spot Metadata</option>
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

      <div className="text-center mb-2 mt-4">
        <Button
          className={props.loadGrid ? "hide-content" : "gg-btn-blue"}
          name="createGrid"
          onClick={() => props.validateForm()}
        >
          Create Grid
        </Button>
      </div>
      {/* </Card.Body>
      </Accordion.Collapse> */}
      {/* </Card> */}
      {/* </Form> */}
    </>
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
