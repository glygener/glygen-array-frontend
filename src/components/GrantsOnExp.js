import React from "react";
import { ContextAwareToggle } from "../utils/commonUtils";
import { Row, Col, Accordion, Card } from "react-bootstrap";
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
              <Grants
                experimentId={props.experimentId}
                getExperiment={props.getExperiment}
                grants={props.grants}
                delete={props.delete}
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
