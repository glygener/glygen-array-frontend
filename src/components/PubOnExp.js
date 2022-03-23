import React from "react";
import { Link } from "react-router-dom";
import { Form, Row, Col, Button, Accordion, Card, Image, Table } from "react-bootstrap";
import { LineTooltip } from "./tooltip/LineTooltip";
import { ContextAwareToggle } from "../utils/commonUtils";
import { PublicationCard } from "./PublicationCard";
import plusIcon from "../images/icons/plus.svg";

const PubOnExp = props => {
  return (
    <>
      <Accordion defaultActiveKey={0}>
        <Card>
          <Card.Header style5={{ height: "65px" }}>
            <Row>
              <Col md={2} className="font-awesome-color" style={{ textAlign: "left" }}>
                <span className="descriptor-header"> {"Publications"}</span>
              </Col>
              <Col>
                <Form.Group as={Row} controlId="publications" className="mt-2 mb-3">
                  <Col md={6}>{props.getPublicationFormControl()}</Col>
                  <Col md={1}>
                    <Button
                      className="gg-btn-outline-reg"
                      onClick={() => props.getPublication()}
                      disabled={props.newPubMedId && props.newPubMedId.length > 0 ? false : true}
                    >
                      <LineTooltip text="Add Publication">
                        <Link>
                          <Image src={plusIcon} alt="plus button" />
                        </Link>
                      </LineTooltip>
                    </Button>
                  </Col>
                </Form.Group>
              </Col>

              <Col md={2} style={{ textAlign: "right" }}>
                <ContextAwareToggle eventKey={0} classname={"font-awesome-color"} />
              </Col>
            </Row>
          </Card.Header>
          <Accordion.Collapse eventKey={0}>
            <Table hover>
              <tbody className="table-body">
                {props.publications.length < 1 ? (
                  <tr className="table-row">
                    <td>
                      <p className="no-data-msg-publication">No data available.</p>
                    </td>
                  </tr>
                ) : (
                  props.publications.map((pub, pubIndex) => {
                    return <PublicationCard key={pubIndex} {...pub} enableDelete deletePublication={props.deleteRow} />;
                  })
                )}
              </tbody>
            </Table>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </>
  );
};

export { PubOnExp };
