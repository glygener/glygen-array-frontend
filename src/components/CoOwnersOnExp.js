import React from "react";
import { Row, Col, Accordion, Card } from "react-bootstrap";
import { ContextAwareToggle } from "../utils/commonUtils";
import { CoOwners } from "../containers/CoOwners";

const CoOwnersOnExp = props => {
  return (
    <>
      <Accordion defaultActiveKey={0} className="mb-4">
        <Card>
          <Card.Header>
            <Row>
              <Col className="font-awesome-color" style={{ textAlign: "left" }}>
                <span className="descriptor-header"> {"Co-Owners"}</span>
              </Col>

              <Col style={{ textAlign: "right" }}>
                <ContextAwareToggle eventKey={0} classname={"font-awesome-color"} />
              </Col>
            </Row>
          </Card.Header>
          <Accordion.Collapse eventKey={0}>
            <Card.Body>
              <CoOwners
                experimentId={props.experimentId}
                deleteWsCall={props.deleteWsCall}
                addWsCall={props.addWsCall}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </>
  );
};

export { CoOwnersOnExp };
