import React from "react";
import { Row, Col, Accordion, Card } from "react-bootstrap";
import { ContextAwareToggle } from "../utils/commonUtils";
import { AddCoOwnerandCollab } from "../containers/AddCoOwnerandCollab";
import { Collaborators } from "../containers/Collaborators";

const CollabsOnExp = props => {
  return (
    <>
      <Accordion defaultActiveKey={0} className="mb-4">
        <Card>
          <Card.Header>
            <Row>
              <Col className="font-awesome-color" style={{ textAlign: "left" }}>
                <span className="descriptor-header"> {"Collaborator"}</span>
              </Col>

              <Col style={{ textAlign: "right" }}>
                <ContextAwareToggle eventKey={0} classname={"font-awesome-color"} />
              </Col>
            </Row>
          </Card.Header>
          <Accordion.Collapse eventKey={0}>
            <Card.Body>
              <AddCoOwnerandCollab
                addWsCall={props.addWsCall}
                experimentId={props.experimentId}
                getExperiment={props.getExperiment}
              />
              <Collaborators
                listCollaborators={props.listCollaborators}
                delete={props.delete}
                deleteWsCall={props.deleteWsCall}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </>
  );
};

export { CollabsOnExp };
