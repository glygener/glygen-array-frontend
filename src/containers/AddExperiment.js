import React, { useReducer, useState, useEffect } from "react";
import { wsCall } from "../utils/wsUtils";
import { Form, Row, Col, Breadcrumb, Table, Button, ButtonToolbar } from "react-bootstrap";
import { FormLabel, Feedback, Title, FormButton } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useHistory, useParams, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { PublicationCard } from "../components/PublicationCard";
import "../containers/AddExperiment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { Grants } from "./Grants";
import { AddCoOwnerandCollab } from "./AddCoOwnerandCollab";
import { ArraydatasetTables } from "../containers/ArraydatasetTables";
import { Collaborators } from "./Collaborators";
import { CoOwners } from "./CoOwners";
import { isValidNumber } from "../utils/commonUtils";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Image } from "react-bootstrap";
import plusIcon from "../images/icons/plus.svg";
import { LineTooltip } from "../components/tooltip/LineTooltip";

// const ArraydatasetTables = lazy(() => import("./ArraydatasetTables"));

const AddExperiment = props => {
  let { experimentId } = useParams();

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    getExperiment();

    wsCall(
      "listsamples",
      "GET",
      { offset: "0", loadAll: false, arraydatasetId: experimentId },
      true,
      null,
      response =>
        response.json().then(responseJson => {
          setSampleList(responseJson);
        }),
      wsCallFail
    );
  }, []);

  function getExperiment() {
    wsCall(
      "getexperiment",
      "GET",
      { qsParams: { loadAll: false }, urlParams: [experimentId] },
      true,
      null,
      response =>
        response.json().then(responseJson => {
          setExperiment({
            name: responseJson.name,
            sample: responseJson.sample.name,
            description: responseJson.description,
            collaborators: responseJson.collaborators,
            rawDataList: responseJson.rawDataList,
            processedData: responseJson.processedData,
            publications: responseJson.publications,
            grants: responseJson.grants,
            slides: responseJson.slides,
            images: responseJson.images,
            isPublic: responseJson.isPublic,
          });

          // setRefreshPage(false);
        }),
      wsCallFail
    );
  }

  // const [refreshPage, setRefreshPage] = useState(false);
  const [deleteData, setDeleteData] = useState();
  const history = useHistory();
  const [sampleList, setSampleList] = useState([]);
  const [validated, setValidated] = useState(false);
  const [newPubMedId, setNewPubMedId] = useState("");
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [duplicateName, setDuplicateName] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [refreshListCoOwners, setRefreshListCoOwners] = useState(false);

  const experimentState = {
    name: "",
    description: "",
    sample: "",
    rawDataList: [],
    processedData: [],
    publications: [],
    pubChemId: "",
  };

  const [experiment, setExperiment] = useReducer((state, newState) => ({ ...state, ...newState }), experimentState);

  const handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;
    setExperiment({ [name]: value });
  };

  const handleSelect = e => {
    const name = e.target.name;
    const selected = e.target.options[e.target.selectedIndex].value;
    setExperiment({ [name]: selected });
  };

  function wsCallFail(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setShowErrorSummary(true);
    });
  }

  function getPublication() {
    wsCall("getpublication", "GET", [newPubMedId], true, null, getPublicationSuccess, response => {
      if (response.status === 404 || response.status === 400) {
        setPageErrorMessage("Pubmed Id Not Found");
        setShowErrorSummary(true);
      }
    });

    function getPublicationSuccess(response) {
      response.json().then(responseJson => {
        if (!experimentId) {
          setExperiment({
            publications: experiment.publications.concat([responseJson]),
          });
        } else {
          addPublication(responseJson);
        }
        setNewPubMedId("");
      });
    }
  }

  function addPublication(publication) {
    wsCall(
      "addpublication",
      "POST",
      { arraydatasetId: experimentId },
      true,
      {
        uri: publication.uri,
        authors: publication.authors,
        pubmedId: publication.pubmedId,
        doiId: publication.doiId,
        title: publication.title,
        journal: publication.journal,
        startPage: publication.startPage,
        endPage: publication.endPage,
        volume: publication.volume,
        year: publication.year,
        number: publication.number,
      },
      response => {
        console.log(response);
        getExperiment();
      },
      response =>
        response.json().then(responseJson => {
          setPageErrorsJson(responseJson);
          setShowErrorSummary(true);
        })
    );
  }

  function handleSubmit(e) {
    setValidated(true);

    if (e.currentTarget.checkValidity()) {
      wsCall(
        experimentId ? "updatearraydataset" : "adddataset",
        "POST",
        null,
        true,
        {
          id: getId(),
          name: experiment.name,
          description: experiment.description,
          sample: { name: experiment.sample },
          publications: experiment.publications,
        },
        addExperimentSuccess,
        addExperimentFailure
      );
    }
    e.preventDefault();
  }

  function getId() {
    return experimentId ? experimentId : null;
  }

  function addExperimentSuccess(response) {
    console.log(response);
    history.push("/experiments");
  }

  function addExperimentFailure(response) {
    var formError = false;

    response.json().then(responseJson => {
      responseJson.errors &&
        responseJson.errors.forEach(element => {
          if (element.objectName === "name") {
            setValidated(false);
            setDuplicateName(true);
          }
        });

      if (!formError) {
        setPageErrorsJson(responseJson);
        setShowErrorSummary(true);
      }
    });
  }

  const getPublicationFormControl = () => {
    return (
      <>
        <Form.Control
          // type="number"
          as="input"
          name="publication"
          placeholder="Enter the Pubmed ID and click +"
          value={newPubMedId}
          onChange={e => {
            const _value = e.target.value;
            if (_value && !/^[0-9]+$/.test(_value)) {
              return;
            }
            setNewPubMedId(_value);
            if (showErrorSummary) {
              setShowErrorSummary(false);
            }
            // numberLengthCheck(e);
            // clearFieldsReset();
          }}
          maxLength={100}
          // onChange={e => {
          //   setNewPubMedId(e.target.value);
          //   if (showErrorSummary) {
          //     setShowErrorSummary(false);
          //   }
          // }}
          // onKeyDown={e => {
          //   isValidNumber(e);
          // }}
        />
      </>
    );
  };

  function deleteRow(id, wscall) {
    setDeleteData({ id: id, wscall: wscall });
    setShowDeleteModal(true);
  }

  const cancelDelete = () => setShowDeleteModal(false);

  const confirmDelete = () => {
    setShowDeleteModal(false);

    wsCall(
      deleteData.wscall,
      "DELETE",
      { qsParams: { datasetId: experimentId }, urlParams: [deleteData.id] },
      true,
      null,
      response => {
        getExperiment();
        setRefreshListCoOwners(true);
        console.log(response);
      },

      response => {
        response.json().then(responseJson => {
          setPageErrorsJson(responseJson);
          setShowErrorSummary(true);
        });
      }
    );
  };

  const experimentForm = () => {
    return (
      <>
        <Helmet>
          <title>{head.addExperiment.title}</title>
          {getMeta(head.addExperiment)}
        </Helmet>

        <div className="page-container">
          <Row>
            <Col
              xl={5}
              style={{
                // maxWidth: "35%",
                marginLeft: "-95px",
              }}
            >
              {experimentId ? (
                <Breadcrumb className="gg-breadcrumb-bg ">
                  <Breadcrumb.Item href="/ggarray/contribute">Contribute</Breadcrumb.Item>
                  <Breadcrumb.Item href="/ggarray/experiments">Experiments </Breadcrumb.Item>
                  <Breadcrumb.Item className="experimentId">{experimentId}</Breadcrumb.Item>
                </Breadcrumb>
              ) : (
                ""
              )}
            </Col>
          </Row>
          <Container maxWidth="xl">
            <PageHeading
              title={experimentId ? "Edit Experiment" : "Add Experiment to Repository"}
              subTitle={
                experimentId
                  ? "Update experiment information. Name must be unique in your experiment repository and cannot be used for more than one experiment."
                  : "Please provide the information for the new experiment."
              }
            />
            {showErrorSummary === true && (
              <ErrorSummary
                show={showErrorSummary}
                form="experiments"
                errorJson={pageErrorsJson}
                errorMessage={pageErrorMessage}
              />
            )}
            <Card>
              <Card.Body>
                <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)} style={{ marginBottom: "15%" }}>
                  {experimentId ? (
                    <Form.Group as={Row} controlId="experimentId" className="gg-align-center mb-3">
                      <Col xs={12} lg={9}>
                        <FormLabel label="Experiment ID" />
                        <Form.Control readOnly value={experimentId} disabled />
                      </Col>
                    </Form.Group>
                  ) : (
                    ""
                  )}

                  <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="Name" className="required-asterik" />
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Enter Name"
                        value={experiment.name}
                        onChange={handleChange}
                        required
                        isInvalid={duplicateName}
                      />
                      <Feedback
                        message={
                          duplicateName
                            ? "Another experiment  has the same Name. Please use a different Name."
                            : "Name is required"
                        }
                      />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} controlId="description" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="Description" />
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        placeholder="Enter Description"
                        value={experiment.description}
                        onChange={handleChange}
                        maxLength={2000}
                      />
                      <div className="text-right text-muted">
                        {experiment.description && experiment.description.length > 0
                          ? experiment.description.length
                          : "0"}
                        /2000
                      </div>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} controlId="samples" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="Samples" className="required-asterik" />
                      <Form.Control
                        as="select"
                        name="sample"
                        value={experiment.sample}
                        onChange={handleSelect}
                        required={true}
                        disabled={experiment.isPublic}
                      >
                        <option value="">Select Sample</option>
                        {sampleList.rows &&
                          sampleList.rows.map((element, index) => {
                            return (
                              <option key={index} value={element.name}>
                                {element.name}
                              </option>
                            );
                          })}
                      </Form.Control>
                      <Feedback message="Sample is required"></Feedback>
                    </Col>
                  </Form.Group>

                  {!experimentId && (
                    <>
                      <Form.Group as={Row} controlId="publications" className="gg-align-center mb-3">
                        <Col xs={12} lg={9}>
                          <FormLabel label="Publications" />
                          {experiment.publications.map(pub => {
                            return <PublicationCard key={pub.pubmedId} enableDelete {...pub} />;
                          })}
                          <Row>
                            <Col md={10}>{getPublicationFormControl()}</Col>
                            {!experimentId && (
                              <Col md={1}>
                                <Button onClick={() => getPublication()} className="gg-btn-outline-reg">
                                  <LineTooltip text="Add Publication">
                                    <Link>
                                      <Image src={plusIcon} alt="plus button" />
                                    </Link>
                                  </LineTooltip>
                                </Button>
                              </Col>
                              // <Col md={1}>
                              //   <FontAwesomeIcon
                              //     style={{
                              //       color: "var(--legacy-blue)",
                              //       marginTop: "8px",
                              //       marginLeft: "-18px",
                              //       // backgroundColor: "rgb(230, 230, 230)"
                              //     }}
                              //     icon={["fas", "plus"]}
                              //     size="lg"
                              //     title="Get Publication"
                              //     onClick={() => getPublication()}
                              //   />
                              // </Col>
                            )}
                          </Row>
                        </Col>
                      </Form.Group>
                    </>
                  )}

                  <div className="text-center mb-4 mt-4">
                    <Link to="/experiments">
                      <Button className="gg-btn-blue mt-2 gg-mr-20">Cancel</Button>
                    </Link>
                    <Button className="gg-btn-blue mt-2 gg-ml-20" type="submit" disabled={showErrorSummary}>
                      {!experimentId ? "Submit" : "Submit"}
                    </Button>
                  </div>

                  {/* {refreshPage && getExperiment()} */}

                  {experimentId && (
                    <>
                      <h4 style={{ textAlign: "left", marginTop: "3%" }}>Slide</h4>
                      <ButtonToolbar>
                        <Link
                          to={`/experiments/addRawdata/${experimentId}`}
                          className="link-button"
                          style={{ width: "12%", marginBottom: "10px" }}
                        >
                          Add Slide Data
                        </Link>
                      </ButtonToolbar>
                      {experiment.name.length > 0 ? (
                        <ArraydatasetTables dataset={experiment} deleteSlide={deleteRow} experimentId={experimentId} />
                      ) : null}

                      <h4 style={{ textAlign: "left", marginTop: "5%" }}> Publications </h4>
                      <Form.Group as={Row} controlId="publications" className="gg-align-center mb-3">
                        <Col md={4}>
                          <Row>
                            <Col md={9}>{getPublicationFormControl()}</Col>

                            <Button
                              title="Add Publication"
                              onClick={() => {
                                getPublication();
                              }}
                              disabled={newPubMedId && newPubMedId.length > 0 ? false : true}
                            >
                              Add
                            </Button>
                          </Row>
                        </Col>
                      </Form.Group>
                      <Table hover>
                        <tbody className="table-body">
                          {experiment.publications.length < 1 ? (
                            <tr className="table-row">
                              <td>
                                <p className="no-data-msg-publication">No data available.</p>
                              </td>
                            </tr>
                          ) : (
                            experiment.publications.map((pub, pubIndex) => {
                              return (
                                <PublicationCard key={pubIndex} {...pub} enableDelete deletePublication={deleteRow} />
                              );
                            })
                          )}
                        </tbody>
                      </Table>

                      <h4 style={{ textAlign: "left", marginTop: "5%" }}> Grants </h4>
                      <Grants
                        experimentId={experimentId}
                        delete={deleteRow}
                        grants={experiment.grants}
                        deleteWsCall={"deletegrant"}
                      />

                      <h4 style={{ textAlign: "left", marginTop: "5%" }}> Collaborators </h4>
                      <AddCoOwnerandCollab
                        addWsCall={"addcollaborator"}
                        experimentId={experimentId}
                        getExperiment={getExperiment}
                      />

                      <Collaborators
                        delete={deleteRow}
                        collaborators={experiment.collaborators}
                        deleteWsCall={"deletecollaborator"}
                      />

                      <h4 style={{ textAlign: "left", marginTop: "5%" }}> Co-Owners </h4>
                      <AddCoOwnerandCollab
                        addWsCall={"addcoowner"}
                        experimentId={experimentId}
                        setRefreshListCoOwners={setRefreshListCoOwners}
                      />

                      <CoOwners
                        experimentId={experimentId}
                        delete={deleteRow}
                        deleteWsCall={"deletecoowner"}
                        refreshListCoOwners={refreshListCoOwners}
                        setRefreshListCoOwners={setRefreshListCoOwners}
                      />

                      <ConfirmationModal
                        showModal={showDeleteModal}
                        onCancel={cancelDelete}
                        onConfirm={confirmDelete}
                        title="Confirm Delete"
                        body="Are you sure you want to delete?"
                      />
                    </>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Container>
        </div>
      </>
    );
  };
  return <>{experimentForm()}</>;
};

AddExperiment.propTypes = {
  authCheckAgent: PropTypes.func,
  match: PropTypes.object
};

export { AddExperiment };
