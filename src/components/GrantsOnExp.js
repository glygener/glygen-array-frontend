import React from "react";
import { Link } from "react-router-dom";
import { ContextAwareToggle } from "../utils/commonUtils";
import { Row, Col, Button, Accordion, Card } from "react-bootstrap";
import { Grants } from "../containers/Grants";

const GrantsOnExp = props => {
  return (
    <>
      <Accordion defaultActiveKey={0}>
        <Card>
          <Card.Header style5={{ height: "65px" }}>
            <Row>
              <Col md={2} className="font-awesome-color" style={{ textAlign: "left" }}>
                <span className="descriptor-header"> {"Grants"}</span>
              </Col>
              <Col>
                <div className="mt-2 mb-4">
                  <Link to={`/experiments/addExperiment/addGrant/${props.experimentId}`}>
                    <Button className="gg-btn-blue btn-to-lower"> Add Grant</Button>
                  </Link>
                </div>
              </Col>

              <Col md={2} style={{ textAlign: "right" }}>
                <ContextAwareToggle eventKey={0} classname={"font-awesome-color"} />
              </Col>
            </Row>
          </Card.Header>
          <Accordion.Collapse eventKey={0}>
            <Grants
              experimentId={props.experimentId}
              delete={props.deleteRow}
              grants={props.grants}
              deleteWsCall={"deletegrant"}
            />
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </>
  );
};

export { GrantsOnExp };
