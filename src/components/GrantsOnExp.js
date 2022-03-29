import React from "react";
import { Link } from "react-router-dom";
import { ContextAwareToggle } from "../utils/commonUtils";
import { Row, Col, Button, Accordion, Card } from "react-bootstrap";
import { Grants } from "../containers/Grants";

const GrantsOnExp = props => {
  return (
    <>
      <Accordion defaultActiveKey={0} className="mb-4">
        <Card>
          <Card.Header>
            <Row>
              <Col className="font-awesome-color">
                <span className="descriptor-header">Grants</span>
              </Col>

              <Col style={{ textAlign: "right" }}>
                <ContextAwareToggle eventKey={0} classname={"font-awesome-color"} />
              </Col>
            </Row>
          </Card.Header>
          <Accordion.Collapse eventKey={0}>
            <Card.Body>
              <div className="text-center mt-2 mb-4">
                <Link to={`/experiments/addExperiment/addGrant/${props.experimentId}`}>
                  <Button className="gg-btn-blue">Add Grant</Button>
                </Link>
              </div>

              <Grants
                experimentId={props.experimentId}
                delete={props.deleteRow}
                grants={props.grants}
                deleteWsCall={"deletegrant"}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </>
  );
};

export { GrantsOnExp };
