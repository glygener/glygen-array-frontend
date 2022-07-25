import React, { useReducer, useState, useEffect } from "react";
import { wsCall } from "../utils/wsUtils";
import { Form, Row, Col, Breadcrumb, Accordion, Button } from "react-bootstrap";
import { ErrorSummary } from "../components/ErrorSummary";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useHistory, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import "../containers/AddExperiment.css";
import { ConfirmationModal } from "../components/ConfirmationModal";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { PubOnExp } from "../components/PubOnExp";
import { GrantsOnExp } from "../components/GrantsOnExp";
import { CollabsOnExp } from "../components/CollabsOnExp";
import { CoOwnersOnExp } from "../components/CoOwnersOnExp";
import { DataTreeView } from "../components/DataTreeView";
import { ContextAwareToggle } from "../utils/commonUtils";
// import "react-sortable-tree/style.css"; // This only needs to be imported once in your app
import { ExperimentInfo } from "./ExperimentInfo";
import { Link } from "react-router-dom";
import { FilesOnExp } from "../components/FilesOnExp";
import { KeywordsOnExp } from "../components/KeywordsOnExp";

// const ArraydatasetTables = lazy(() => import("./ArraydatasetTables"));

const AddExperiment = props => {
  let { experimentId } = useParams();

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    experimentId && getExperiment();

    !experimentId &&
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
  }, [experimentId]);

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
            sampleID: responseJson.sample.id,
            description: responseJson.description,
            collaborators: responseJson.collaborators,
            rawDataList: responseJson.rawDataList,
            processedData: responseJson.processedData,
            publications: responseJson.publications,
            grants: responseJson.grants,
            slides: responseJson.slides,
            images: responseJson.images,
            isPublic: responseJson.isPublic,
            files: responseJson.files,
            keywords: responseJson.keywords
          });

          // setRefreshPage(false);
        }),
      wsCallFail
    );

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
      wsCallFail
    );
  }

  // const [refreshPage, setRefreshPage] = useState(false);
  const [deleteData, setDeleteData] = useState();
  const [listKeywords, setListKeywords] = useState();
  const history = useHistory();
  const [sampleList, setSampleList] = useState([]);
  const [validated, setValidated] = useState(false);
  const [newPubMedId, setNewPubMedId] = useState("");
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [duplicateName, setDuplicateName] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState();

  const experimentState = {
    name: "",
    description: "",
    sample: "",
    rawDataList: [],
    processedData: [],
    publications: [],
    pubChemId: ""
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
            publications: experiment.publications.concat([responseJson])
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
        number: publication.number
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
          publications: experiment.publications
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
        />
      </>
    );
  };

  function deleteRow(id, wscall) {
    setDeleteData({ id: id, wscall: wscall });
    setShowDeleteModal(true);
  }

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
                marginLeft: "-95px"
              }}
            >
              {experimentId ? (
                <Breadcrumb className="gg-breadcrumb-bg ">
                  <Breadcrumb.Item href="`${process.env.REACT_APP_BASENAME}`/contribute">Contribute</Breadcrumb.Item>
                  <Breadcrumb.Item href="`${process.env.REACT_APP_BASENAME}`/experiments">Experiments </Breadcrumb.Item>
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
            <Card>
              <Card.Body>
                {showErrorSummary === true && (
                  <ErrorSummary
                    show={showErrorSummary}
                    form="experiments"
                    errorJson={pageErrorsJson}
                    errorMessage={pageErrorMessage}
                  />
                )}
                <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
                  <div className="text-center mb-4">
                    <Link to="/experiments">
                      <Button className="gg-btn-outline mt-2 gg-mr-20">Back to Experiments</Button>
                    </Link>
                  </div>
                  {/* experiment Info */}
                  <ExperimentInfo
                    experimentId={experimentId}
                    validated={validated}
                    handleSubmit={handleSubmit}
                    experiment={experiment}
                    handleChange={handleChange}
                    duplicateName={duplicateName}
                    handleSelect={handleSelect}
                    sampleList={sampleList}
                    getPublication={getPublication}
                    getPublicationFormControl={getPublicationFormControl}
                    showErrorSummary={showErrorSummary}
                    className="mb-4"
                  />
                </Form>

                {experimentId && (
                  <>
                    {/* {experiment.slides && experiment.slides.length > 0 && ( */}
                    <Accordion defaultActiveKey={0} className="mb-4">
                      <Card style={{ overflow: "visible" }}>
                        <Card.Header>
                          <Row>
                            <Col className="font-awesome-color">
                              <span className="descriptor-header">Data</span>
                            </Col>

                            <Col style={{ textAlign: "right" }}>
                              <ContextAwareToggle eventKey={0} classname="font-awesome-color" />
                            </Col>
                          </Row>
                        </Card.Header>
                        <Accordion.Collapse eventKey={0}>
                          <Card.Body>
                            <DataTreeView
                              data={experiment}
                              isPublic={experiment.isPublic}
                              experimentId={experimentId}
                              getExperiment={getExperiment}
                              deleteRow={deleteRow}
                              setShowDeleteModal={setShowDeleteModal}
                              setDeleteMessage={setDeleteMessage}
                              setPageErrorsJson={setPageErrorsJson}
                              setPageErrorMessage={setPageErrorMessage}
                              setShowErrorSummary={setShowErrorSummary}
                            />
                          </Card.Body>
                        </Accordion.Collapse>
                      </Card>
                    </Accordion>
                    {/* )} */}
                    {/* Publications */}
                    <PubOnExp
                      getPublication={getPublication}
                      getPublicationFormControl={getPublicationFormControl}
                      newPubMedId={newPubMedId}
                      publications={experiment.publications}
                      deleteRow={deleteRow}
                    />
                    {/* Grants */}
                    <GrantsOnExp
                      experimentId={experimentId}
                      getExperiment={getExperiment}
                      grants={experiment.grants}
                      delete={deleteRow}
                      deleteWsCall={"deletegrant"}
                    />
                    {/* Collaborators */}
                    <CollabsOnExp
                      experimentId={experimentId}
                      getExperiment={getExperiment}
                      listCollaborators={experiment.collaborators}
                      addWsCall={"addcollaborator"}
                      delete={deleteRow}
                      deleteWsCall={"deletecollaborator"}
                    />
                    {/* Co-Owners */} 
                    <CoOwnersOnExp
                      experimentId={experimentId}
                      addWsCall={"addcoowner"}
                      delete={deleteRow}
                      deleteWsCall={"deletecoowner"}
                      listCoOwners={experiment.listCoOwners}
                    />
                    {/* Files */}
                    <FilesOnExp
                      experimentId={experimentId}
                      getExperiment={getExperiment}
                      files={experiment.files}
                      addWsCall={"addfileonexp"}
                      delete={deleteRow}
                      deleteWsCall={"deletefileonexperiment"}
                    />
                    {/* Key words */}
                    <KeywordsOnExp
                      experimentId={experimentId}
                      getExperiment={getExperiment}
                      keywords={experiment.keywords}
                      listKeywords={listKeywords}
                      setListKeywords={setListKeywords}
                      addWsCall={"addkeyword"}
                      delete={deleteRow}
                      deleteWsCall={"deletekeyword"}
                    />
                    {/* ConfirmationModal */}
                    <ConfirmationModal
                      showModal={showDeleteModal}
                      onCancel={() => setShowDeleteModal(false)}
                      onConfirm={confirmDelete}
                      title="Confirm Delete"
                      body={deleteMessage ? deleteMessage : "Are you sure you want to delete?"}
                    />
                  </>
                )}
                <div className="text-center mts-4">
                  <Link to="/experiments">
                    <Button className="gg-btn-outline mt-2 gg-mr-20">Back to Experiment</Button>
                  </Link>
                </div>
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
