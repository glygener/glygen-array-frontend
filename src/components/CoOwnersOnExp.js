import React from "react";
import { Row, Col, Accordion, Card } from "react-bootstrap";
import { ContextAwareToggle } from "../utils/commonUtils";
import { AddCoOwnerandCollab } from "../containers/AddCoOwnerandCollab";
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
              <AddCoOwnerandCollab
                addWsCall={props.addWsCall}
                experimentId={props.experimentId}
                setRefreshListCoOwners={props.setRefreshListCoOwners}
              />
              <CoOwners
                experimentId={props.experimentId}
                delete={props.deleteRow}
                deleteWsCall={props.deleteWsCall}
                refreshListCoOwners={props.refreshListCoOwners}
                setRefreshListCoOwners={props.setRefreshListCoOwners}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </>
  );
};

export { CoOwnersOnExp };
