import React from "react";
import { Row, Col, Accordion, Card } from "react-bootstrap";
import { ContextAwareToggle } from "../utils/commonUtils";
import { AddCoOwnerandCollab } from "../containers/AddCoOwnerandCollab";
import { Collaborators } from "../containers/Collaborators";

const CollabsOnExp = props => {
  return (
    <>
      <Accordion defaultActiveKey={0}>
        <Card>
          <Card.Header style5={{ height: "65px" }}>
            <Row>
              <Col md={2} className="font-awesome-color" style={{ textAlign: "left" }}>
                <span className="descriptor-header"> {"Collaborator"}</span>
              </Col>
              <Col>
                <AddCoOwnerandCollab
                  addWsCall={props.addWsCall}
                  experimentId={props.experimentId}
                  getExperiment={props.getExperiment}
                />
              </Col>

              <Col md={2} style={{ textAlign: "right" }}>
                <ContextAwareToggle eventKey={0} classname={"font-awesome-color"} />
              </Col>
            </Row>
          </Card.Header>
          <Accordion.Collapse eventKey={0}>
            <Collaborators
              delete={props.deleteRow}
              collaborators={props.collaborators}
              deleteWsCall={props.deleteWsCall}
            />
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </>
  );
};

export { CollabsOnExp };
