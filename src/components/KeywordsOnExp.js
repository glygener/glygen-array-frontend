import React, { useState } from "react";
import { ContextAwareToggle } from "../utils/commonUtils";
import { Row, Col, Button, Accordion, Card, Table, Form, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormLabel } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import { useHistory, useParams } from "react-router-dom";

const KeywordsOnExp = props => {
  let { experimentId } = useParams();

  const [keyword, setKeyword] = useState();
  const [otherKW, setOtherKW] = useState();
  const [showLoading, setShowLoading] = useState(false);
  const [showKWModal, setShowKWModal] = useState();
  const history = useHistory();
  const [validated, setValidated] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});

  const getListKeywords = () => {
    return (
      <>
        {props.files &&
          props.files.map((keyword, index) => {
            return (
              <Table hover>
                <tbody className="table-body">
                  <tr className="table-row" key={index}>
                    <td key={index + keyword}>
                      <div>
                        <h5>{keyword}</h5>
                      </div>
                    </td>
                    <td className="text-right">
                      <FontAwesomeIcon
                        icon={["far", "trash-alt"]}
                        size="lg"
                        title="Delete"
                        className="caution-color table-btn"
                        onClick={() => props.delete(keyword, props.deleteWsCall)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            );
          })}
      </>
    );
  };

  const handleSelect = e => {
    const keyword = e.target.options[e.target.selectedIndex].value;
    setKeyword(keyword);
  };

  const getKeywordsModal = () => {
    return (
      <>
        <Modal
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={showKWModal}
          onHide={() => {
            setKeyword();
            setShowKWModal(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Add Keyword</Modal.Title>
          </Modal.Header>
          <Modal.Body>{getKeywordBody()} </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </>
    );
  };

  function handleSubmit(e) {
    setValidated(true);

    if (e.currentTarget.checkValidity()) {
      setShowLoading(true);

      setShowErrorSummary(false);

      wsCall(
        "keyword",
        "POST",
        {
          arraydatasetId: experimentId
        },
        true,
        {
          keyword: { name: "other", value: otherKW }
        },
        response => {
          setShowLoading(false);
          setShowKWModal(false);
          history.push("/experiments/editExperiment/" + experimentId);
        },
        fileOnExpFailure
      );
    }

    e.preventDefault();
  }

  function fileOnExpFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setShowErrorSummary(true);
      setPageErrorMessage("");
      setShowLoading(false);
    });
  }

  const getKeywordBody = () => {
    return (
      <>
        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <Form.Group as={Row} controlId={0} className="gg-align-center mt-0 pt-0">
            <Col xs={12} lg={9}>
              <FormLabel label="Select Keyword" />
              <Form.Control as="select" name={"sortBy"} value={keyword} onChange={handleSelect} required={true}>
                <option value="select">select</option>

                {props.keywords &&
                  props.keywords.map(kw => {
                    return <option value={kw}>kw</option>;
                  })}
                <option value="other">other</option>
              </Form.Control>
            </Col>
          </Form.Group>

          {keyword === "other" && (
            <>
              <Form.Group as={Row} controlId={"fileType"} className="gg-align-center mt-0 pt-0">
                <Col xs={12} lg={9}>
                  {/* <FormLabel label="Keyword" /> */}
                  <Form.Control
                    name="otherKW"
                    type="text"
                    placeholder="enter keyword"
                    value={otherKW}
                    onChange={e => {
                      setOtherKW(e.target.value);
                    }}
                    maxLength={20}
                  />
                </Col>
              </Form.Group>
            </>
          )}

          <div className="mt-4 mb-4 text-center">
            <Button
              className="gg-btn-outline-reg"
              onClick={() => {
                setKeyword();
                setShowKWModal(false);
              }}
            >
              Cancel
            </Button>
            &nbsp;
            <Button type="submit" className="gg-btn-blue-reg">
              Submit
            </Button>
          </div>
        </Form>
      </>
    );
  };

  return (
    <>
      <Accordion defaultActiveKey={0} className="mb-4">
        <Card>
          <Card.Header>
            <Row>
              <Col className="font-awesome-color">
                <span className="descriptor-header">Keywords</span>
              </Col>

              <Col style={{ textAlign: "right" }}>
                <ContextAwareToggle eventKey={0} classname={"font-awesome-color"} />
              </Col>
            </Row>
          </Card.Header>
          <Accordion.Collapse eventKey={0}>
            <Card.Body>
              <div className="text-center mt-2 mb-4">
                <Button className="gg-btn-blue" onClick={() => setShowKWModal(true)}>
                  Add Keyword
                </Button>
              </div>
              {getListKeywords()}
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      {showKWModal && getKeywordsModal()}
    </>
  );
};
export { KeywordsOnExp };
