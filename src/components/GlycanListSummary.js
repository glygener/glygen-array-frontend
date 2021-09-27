import React from "react";
import { Row, Col } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { addCommas } from "../utils/commonUtils";

function getDateTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();

  if (month.toString().length === 1) {
    month = "0" + month;
  }
  if (day.toString().length === 1) {
    day = "0" + day;
  }
  if (hour.toString().length === 1) {
    hour = "0" + hour;
  }
  if (minute.toString().length === 1) {
    minute = "0" + minute;
  }
  if (second.toString().length === 1) {
    second = "0" + second;
  }
  var dateTime = year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
  return dateTime;
}

const GlycanListSummary = (props) => {
  const title = "Glycan Search Summary";
  const { data, onModifySearch } = props;
  const executionTime = getDateTime();

  const { glytoucanIds, maxMass, minMass, structure } = data;

  return (
    <>
      <Card className="text-center summary-panel">
        <Card.Header as="h3" className="panelHeadBgr panelHeadText">
          {title}
        </Card.Header>
        <Card.Body>
          <Card.Text>
            <strong>Performed on: {executionTime}</strong>
          </Card.Text>

          {/* glytoucanIds */}
          {glytoucanIds && glytoucanIds.length > 0 && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                GlyTouCan ID:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {glytoucanIds.join(", ")}
              </Col>
            </Row>
          )}

          {/* mass */}
          {minMass && maxMass && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                Monoisotopic Mass:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {addCommas(minMass.toFixed(0))}&#8209;{addCommas(maxMass.toFixed(0))} Da
              </Col>
            </Row>
          )}

          {/* sequenceFormat */}
          {structure && structure.format && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                Sequence format:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {structure.format}
              </Col>
            </Row>
          )}
          {/* sequence */}
          {structure && structure.sequence && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                Sequence:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {structure.sequence.split("\n").map((line) => (
                  <div>{line}</div>
                ))}
              </Col>
            </Row>
          )}
          {/* reducingEnd */}
          {structure && structure.reducingEnd && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                Reducing end:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {structure.reducingEnd ? "True" : "False"}
              </Col>
            </Row>
          )}
          <div className="pt-3">
            <Button
              type="button"
              className="gg-btn-outline mr-4 mb-3"
              onClick={() => {
                window.location.reload();
              }}
            >
              Update Results
            </Button>
            <Button type="button" className="gg-btn-blue mb-3" onClick={onModifySearch}>
              Modify Search
            </Button>
          </div>
          <Card.Text>
            ** To perform the same search again using the current version of the database, click{" "}
            <strong>“Update Results”</strong>.
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
};

export default GlycanListSummary;
