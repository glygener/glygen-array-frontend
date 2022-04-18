import React, { useState, useEffect } from "react";
import { ContextAwareToggle } from "../utils/commonUtils";
import { Row, Col, Button, Accordion, Card, Table, Form, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormLabel } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import { useParams } from "react-router-dom";
import { ErrorSummary } from "./ErrorSummary";
import CardLoader from "./CardLoader";

const KeywordsOnExp = props => {
  let { experimentId } = useParams();

  const [listkeywords, setListKeywords] = useState();
  const [keyword, setKeyword] = useState();
  const [otherKW, setOtherKW] = useState();
  const [showLoading, setShowLoading] = useState(false);
  const [showKWModal, setShowKWModal] = useState();
  const [validated, setValidated] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});

  useEffect(() => {
    wsCall(
      "listkeywords",
      "GET",
      null,
      true,
      null,
      response => {
        response.json().then(responseJson => {
          let sortedList = responseJson.sort(function(a, b) {
            return a.localeCompare(b, undefined, {
              numeric: true,
              sensitivity: "base"
            });
          });
          setListKeywords(sortedList);
        });
      },
      listKeyWordsFail
    );
  }, []);

  function listKeyWordsFail(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setShowErrorSummary(true);
    });
  }

  const getListKeywords = () => {
    return (
      <>
        {props.keywords &&
          props.keywords.map((kw, index) => {
            return (
              <Table hover>
                <tbody
                  // className="table-body"
                  style={{ border: "none" }}
                >
                  <tr
                    // className="table-row"
                    style={{ border: "none" }}
                    key={index + kw}
                  >
                    <td style={{ border: "none" }}>
                      <div>
                        <h5>{kw}</h5>
                      </div>
                    </td>
                    <td className="text-right" style={{ border: "none" }}>
                      <FontAwesomeIcon
                        icon={["far", "trash-alt"]}
                        size="lg"
                        title="Delete"
                        className="caution-color table-btn"
                        onClick={() => props.delete(kw, props.deleteWsCall)}
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
    const kwd = e.target.options[e.target.selectedIndex].value;
    setKeyword(kwd);
    setShowErrorSummary(false);
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
            setListKeywords();
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

      wsCall(
        "addkeyword",
        "POST",
        {
          arraydatasetId: experimentId,
          keyword: keyword === "other" ? otherKW : keyword
        },
        true,
        null,
        response => {
          setShowKWModal(false);
          props.getExperiment();
          setShowLoading(false);
        },
        keywordOnExpFailure
      );
    }

    e.preventDefault();
  }

  function keywordOnExpFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setPageErrorMessage("");
      setShowLoading(false);
      setShowErrorSummary(true);
    });
  }

  const getKeywordBody = () => {
    return (
      <>
        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="keywords"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}

        <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <Form.Group as={Row} controlId={0} className="gg-align-center mt-0 pt-0">
            <Col xs={12} lg={9}>
              <FormLabel label="Select Keyword" />
              <Form.Control as="select" name={"sortBy"} value={keyword} onChange={handleSelect} required={true}>
                <option value="select">select</option>

                {listkeywords &&
                  listkeywords.map(kw => {
                    return <option value={kw}>{kw}</option>;
                  })}
                <option value="other">other</option>
              </Form.Control>
            </Col>
          </Form.Group>

          {keyword === "other" && (
            <>
              <Form.Group as={Row} controlId={"keyword"} className="gg-align-center mt-0 pt-0">
                <Col xs={12} lg={9}>
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
              className="gg-btn-outline mt-2 gg-mr-20"
              onClick={() => {
                setKeyword();
                setShowKWModal(false);
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="gg-btn-blue mt-2 gg-ml-20"
              disabled={
                (keyword === "other" && (otherKW === "" || !otherKW)) ||
                keyword === "select" ||
                !keyword ||
                showErrorSummary
              }
            >
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
                <Button
                  className="gg-btn-blue"
                  onClick={() => {
                    setKeyword();
                    setShowErrorSummary(false);
                    setShowKWModal(true);
                  }}
                >
                  Add Keyword
                </Button>
              </div>
              {getListKeywords()}
              {showLoading ? <CardLoader pageLoading={showLoading} /> : ""}
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      {showKWModal && getKeywordsModal()}
    </>
  );
};
export { KeywordsOnExp };
