import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import { useParams } from "react-router-dom";
import { Row, Col, Form, Table, Button, Card } from "react-bootstrap";
import { FormLabel, Title, Feedback } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { GlygenTable } from "../components/GlygenTable";
import { StructureImage } from "../components/StructureImage";
import { getToolTip } from "../utils/commonUtils";
import { GlycanInfoViewModal } from "../components/GlycanInfoViewModal";
import { useHistory, Link } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { Loading } from "../components/Loading";
import Container from "@material-ui/core/Container";

const FeatureView = props => {
  let { featureId, editFeature } = useParams();
  const history = useHistory();
  const [showLoading, setShowLoading] = useState(false);

  const [validated, setValidated] = useState(false);
  const [glycanViewInfo, setGlycanViewInfo] = useState(false);
  const [enableGlycanViewInfoDialog, setEnableGlycanViewInfoDialog] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  // useEffect(() => props.authCheckAgent, []);

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    if (featureId) {
      setShowLoading(true);
      wsCall("getfeature", "GET", [featureId], true, null, getFeatureSuccess, getFeatureFailure);
    }
  }, [featureId]);

  function getFeatureSuccess(response) {
    response.json().then(parsedJson => {
      setFeatureDetails(parsedJson);
    });
    setShowLoading(false);
  }

  function getFeatureFailure(response) {
    setValidated(false);
    console.log(response);
    setShowLoading(false);
  }

  const [featureDetails, setFeatureDetails] = useReducer((state, newState) => ({ ...state, ...newState }), {
    id: "",
    featureId: "",
    internalId: "",
    name: "",
    type: "",
    linker: {},
    glycans: [],
    lipid: {},
    peptide: {},
    isLipidLinkedToSurfaceUsingLinker: "No",
    metadata: {}
  });

  const getMetadataTable = () => {
    let metadata = featureDetails.metadata;
    return (
      <>
        {metadata &&
          metadata.descriptorGroups.map(desc => {
            return (
              <div>
                <h5>{desc.name}</h5>
                <Table bordered hover size="sm">
                  <thead>
                    <th>{"Name"}</th>
                    <th>{"Value"}</th>
                  </thead>
                  <tbody>
                    {desc.descriptors &&
                      desc.descriptors.map(subdesc => {
                        return (
                          <>
                            <tr>
                              <td>{subdesc.name}</td>
                              <td>{subdesc.value}</td>
                            </tr>
                          </>
                        );
                      })}
                  </tbody>
                </Table>
              </div>
            );
          })}
      </>
    );
  };

  const getGlycanTable = () => {
    return (
      <>
        <h3>Glycans</h3>
        &nbsp;
        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name",
              Cell: row =>
                featureDetails.type === "LINKEDGLYCAN"
                  ? getToolTip(row.original.glycan.name)
                  : getToolTip(row.original.glycans[0].glycan.name)
            },
            {
              Header: "Structure Image",
              accessor: "cartoon",
              Cell: row => (
                <StructureImage
                  base64={
                    featureDetails.type === "LINKEDGLYCAN"
                      ? row.original.glycan.cartoon
                      : row.original.glycans[0].glycan.cartoon
                  }
                />
              ),
              minWidth: 300
            },
            {
              Header: "Source",
              accessor: "source.type",
              Cell: row => {
                return featureDetails.type === "LINKEDGLYCAN"
                  ? row.original.source &&
                      (row.original.source.type === "NOTRECORDED"
                        ? getToolTip("Not Recorded")
                        : row.original.source.type === "COMMERCIAL"
                        ? getToolTip("Commercial")
                        : getToolTip("Non Commercial"))
                  : row.original.glycans[0] &&
                      row.original.glycans[0].source &&
                      (row.original.glycans[0].source.type === "NOTRECORDED"
                        ? getToolTip("Not Recorded")
                        : row.original.glycans[0].source.type === "COMMERCIAL"
                        ? getToolTip("Commercial")
                        : getToolTip("Non Commercial"));
              }
            },
            {
              Header: "Reducing end state",
              accessor: "opensRing",
              Cell: row => {
                return featureDetails.type === "LINKEDGLYCAN"
                  ? getToolTip(row.original.reducingEndConfiguration.type)
                  : getToolTip(row.original.glycans[0].reducingEndConfiguration.type);
              }
            },
            ...(featureDetails.type === "GLYCOLIPID"
              ? [
                  {
                    Header: "Linker",
                    accessor: "linker",
                    Cell: (row, index) => {
                      return row.original.linker ? getToolTip(row.original.linker.name) : "";
                    },
                    minWidth: 150
                  }
                ]
              : [])
          ]}
          defaultPageSize={10}
          data={featureDetails.glycans}
          keyColumn="id"
          showSearchBox
          showViewIcon
          customViewonClick
          viewOnClick={getGlycanInfoDisplay}
          infoRowsText="Glycans"
          showPagination={false}
          showRowsInfo={false}
        />
        {enableGlycanViewInfoDialog && (
          <GlycanInfoViewModal
            setEnableGlycanViewInfoDialog={setEnableGlycanViewInfoDialog}
            enableGlycanViewInfoDialog={enableGlycanViewInfoDialog}
            glycanViewInfo={glycanViewInfo}
          />
        )}
      </>
    );
  };

  const getLinker = () => {
    if (props.linker) {
      if ((props.type !== "LINKED_GLYCAN" && props.linkerSeletion !== "No") || props.type === "LINKED_GLYCAN") {
        return <> {displayDetails(props.linker, "case4", "Linker") && linkerDetails(props.linker, "case4")}</>;
      }
    } else if (featureDetails.linker) {
      return (
        <> {displayDetails(featureDetails.linker, "view", "Linker") && linkerDetails(featureDetails.linker, "view")}</>
      );
    }
  };

  const linkerDetails = (linker, page) => {
    return (
      <>
        {linker.imageURL ? (
          <Form.Group as={Row} controlId="image">
            <Col md={{ span: 3, offset: 2 }}>
              <FormLabel label={""} />
            </Col>
            <Col md={4}>
              <StructureImage imgUrl={linker.imageURL} />
            </Col>
          </Form.Group>
        ) : (
          (linker.description || linker.comment) && (
            <Form.Group as={Row} controlId="comment">
              <FormLabel label="Comment" />
              <Col md={4} className="sequence-label-div">
                <Form.Control
                  rows={3}
                  as="textarea"
                  disabled={page === "case4"}
                  plaintext={page === "view"}
                  value={linker.comment ? linker.comment : linker.description ? linker.description : ""}
                />
              </Col>
            </Form.Group>
          )
        )}
      </>
    );
  };

  const getLipid = () => {
    if (props.type === "GLYCO_LIPID" && props.lipid) {
      return displayDetails(props.lipid, "case4", "Lipid");
    } else if (featureDetails && featureDetails.type === "GLYCOLIPID") {
      return displayDetails(featureDetails.lipid, "view", "Lipid");
    }
  };

  const getPeptide = () => {
    if (props.type === "GLYCO_PEPTIDE" && props.peptide) {
      return displayDetails(props.peptide, "case4", "Peptide");
    } else if (featureDetails && featureDetails.type === "GLYCOPEPTIDE") {
      return displayDetails(featureDetails.peptide, "view", "Peptide");
    }
  };

  const getProtein = () => {
    if (props.type === "GLYCO_PROTEIN" && props.protein) {
      return displayDetails(props.protein, "case4", "Protein");
    } else if (featureDetails && featureDetails.type === "GLYCOPROTEIN") {
      return displayDetails(featureDetails.protein, "view", "Protein");
    }
  };

  const case4Metadata = () => {
    return (
      <>
        {props.metadata.purity.purityNotSpecified === "specify" ? (
          <>
            <FormLabel label="Purity" className={"metadata-descriptor-title"} />
            <Form.Group as={Row} controlId="value">
              <FormLabel label="Value" />
              <Col md={4}>
                <Form.Control type="text" disabled value={props.metadata.purity.value} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="method">
              <FormLabel label="Method" />
              <Col md={4}>
                <Form.Control type="text" disabled value={props.metadata.purity.method} />
              </Col>
            </Form.Group>

            {props.metadata.purity.comment && (
              <Form.Group as={Row} controlId="comment">
                <FormLabel label="Comment" />
                <Col md={4}>
                  <Form.Control
                    rows={props.metadata.purity.comment.length > 10 ? 3 : 1}
                    as="textarea"
                    plaintext
                    disabled
                    value={props.metadata.purity.comment}
                  />
                </Col>
              </Form.Group>
            )}
          </>
        ) : (
          <Form.Group as={Row} controlId="value">
            <FormLabel label="Purity" />
            <Col md={4}>
              <Form.Control type="text" disabled value={"Not Recorded"} />
            </Col>
          </Form.Group>
        )}

        {props.metadata.source === "notSpecified" && (
          <Form.Group as={Row} controlId="value">
            <FormLabel label="Source" />
            <Col md={4}>
              <Form.Control type="text" disabled value={"Not Recorded"} />
            </Col>
          </Form.Group>
        )}

        {props.metadata.source === "commercial" && (
          <>
            <FormLabel label="Source" className={"metadata-descriptor-title "} />
            <Form.Group as={Row} controlId="vendor">
              <FormLabel label="Vendor" />
              <Col md={4}>
                <Form.Control type="text" disabled value={props.metadata.commercial.vendor} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="catalogueNumber">
              <FormLabel label="Catalogue Number" />
              <Col md={4}>
                <Form.Control type="text" disabled value={props.metadata.commercial.catalogueNumber} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="batchId">
              <FormLabel label=" Batch Id" />
              <Col md={4}>
                <Form.Control type="text" disabled value={props.metadata.commercial.batchId} />
              </Col>
            </Form.Group>
          </>
        )}

        {props.metadata.source === "nonCommercial" && (
          <>
            <FormLabel label="Source" className={"metadata-descriptor-title "} />
            <Form.Group as={Row} controlId="providerLab">
              <FormLabel label="Provider Lab" />
              <Col md={4}>
                <Form.Control type="text" disabled value={props.metadata.nonCommercial.providerLab} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="method">
              <FormLabel label="Method" />
              <Col md={4}>
                <Form.Control type="text" disabled value={props.metadata.nonCommercial.method} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="batchId">
              <FormLabel label="Batch Id" />
              <Col md={4}>
                <Form.Control type="text" disabled value={props.metadata.nonCommercial.batchId} />
              </Col>
            </Form.Group>

            {props.metadata.nonCommercial.sourceComment && (
              <Form.Group as={Row} controlId="comment">
                <FormLabel label="Comment" />
                <Col md={4}>
                  <Form.Control
                    rows={props.metadata.nonCommercial.sourceComment.length > 10 ? 3 : 1}
                    as="textarea"
                    plaintext
                    disabled
                    value={props.metadata.nonCommercial.sourceComment}
                  />
                </Col>
              </Form.Group>
            )}
          </>
        )}
      </>
    );
  };

  const displayDetails = (linker, page, label) => {
    return (
      <>
        <FormLabel label={label} className={"metadata-descriptor-title"} />

        <Form.Group as={Row} controlId="name">
          <FormLabel label="Name" />
          <Col md={4}>
            <Form.Control type="text" disabled={page === "case4"} plaintext={page === "view"} value={linker.name} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="type">
          <FormLabel label="Type" />
          <Col md={4}>
            <Form.Control type="text" disabled={page === "case4"} plaintext={page === "view"} value={linker.type} />
          </Col>
        </Form.Group>

        {linker.sequence && (
          <Form.Group as={Row} controlId="sequence">
            <FormLabel label="Sequence" />
            <Col md={4}>
              <Form.Control
                type="text"
                disabled={page === "case4"}
                plaintext={page === "view"}
                value={linker.sequence}
              />
            </Col>
          </Form.Group>
        )}
      </>
    );
  };

  const handleChange = e => {
    let name = e.target.name;
    let value = e.target.value;

    setFeatureDetails({ [name]: value });
    setShowErrorSummary(false);
  };

  const getMetadataNameandId = page => {
    return (
      <>
        <Form.Group as={Row} controlId="name">
          <FormLabel label="Name" className={editFeature ? "required-asterik" : ""} />
          <Col md={4}>
            <Form.Control
              type="text"
              name="name"
              disabled={page === "case4" && !editFeature}
              plaintext={page === "view" && !editFeature}
              value={props.metadata ? props.metadata.name : featureDetails.name}
              onChange={editFeature ? handleChange : {}}
              maxLength={50}
              required
            />
            <Feedback message={"Name is required"} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="featureId">
          <FormLabel label="FeatureId" className={editFeature ? "required-asterik" : ""} />
          <Col md={4}>
            <Form.Control
              type="text"
              name="internalId"
              disabled={page === "case4" && !editFeature}
              plaintext={page === "view" && !editFeature}
              value={props.metadata ? props.metadata.featureId : featureDetails.internalId}
              onChange={editFeature ? handleChange : {}}
              maxLength={30}
              required
            />
            <Feedback message={"Feature Id is required"} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="Type">
          <FormLabel label="Type" />
          <Col md={4}>
            <Form.Control
              type="text"
              disabled={page === "case4"}
              plaintext={page === "view"}
              defaultValue={props.type ? props.type : featureDetails.type}
            />
          </Col>
        </Form.Group>
      </>
    );
  };

  const getSelectedGlycanList = () => {
    return (
      <>
        <div className={"form-container"}>
          <GlygenTable
            columns={[
              {
                Header: "Name",
                accessor: "name",
                Cell: row => {
                  return props.type === "GLYCO_PEPTIDE" && props.rangeGlycans.length === 0
                    ? getToolTip(row.original.glycan.name)
                    : getToolTip(row.original.name);
                }
              },
              {
                Header: "Structure Image",
                accessor: "cartoon",
                Cell: row => {
                  return props.type === "GLYCO_PEPTIDE" && props.rangeGlycans.length === 0 ? (
                    <StructureImage base64={row.original.glycan.cartoon} />
                  ) : (
                    <StructureImage base64={row.value} />
                  );
                },
                minWidth: 300
              },
              {
                Header: "Source",
                accessor: "source.type",
                Cell: row => {
                  return props.type === "GLYCO_PEPTIDE" && props.rangeGlycans.length === 0
                    ? row.original.glycan.source.type === "NOTRECORDED"
                      ? getToolTip("Not Recorded")
                      : row.original.glycan.source.type === "COMMERCIAL"
                      ? getToolTip("Commercial")
                      : getToolTip("Non Commercial")
                    : row.original.source.type === "NOTRECORDED"
                    ? getToolTip("Not Recorded")
                    : row.original.source.type === "COMMERCIAL"
                    ? getToolTip("Commercial")
                    : getToolTip("Non Commercial");
                }
              },
              {
                Header: "Reducing end state",
                accessor: "opensRing",
                Cell: row => {
                  return props.type === "GLYCO_PEPTIDE" && props.rangeGlycans.length === 0
                    ? getToolTip(getReducingEndState(row.original.glycan.opensRing))
                    : getToolTip(getReducingEndState(row.value));
                }
              },
              ...(props.type === "GLYCO_PEPTIDE" && props.rangeGlycans.length > 0
                ? [
                    {
                      Header: "Range",
                      accessor: "range",
                      Cell: row => {
                        return getToolTip(`${row.original.min} - ${row.original.max}`);
                      }
                    }
                  ]
                : []),

              ...(props.type === "GLYCO_LIPID" || (props.type === "GLYCO_PEPTIDE" && props.rangeGlycans.length > 0)
                ? [
                    {
                      Header: "Linker",
                      accessor: "linker",
                      Cell: (row, index) => {
                        return row.original.linker ? getToolTip(row.original.linker.name) : "";
                      },
                      minWidth: 150
                    }
                  ]
                : [])
            ]}
            data={props.type === "GLYCO_PEPTIDE" && props.rangeGlycans.length > 0 ? props.rangeGlycans : props.glycans}
            defaultPageSize={5}
            showPagination={false}
            showRowsInfo={false}
            showViewIcon
            customViewonClick
            viewOnClick={getGlycanInfoDisplay}
            infoRowsText="Selected Glycans"
          />

          {enableGlycanViewInfoDialog && (
            <GlycanInfoViewModal
              setEnableGlycanViewInfoDialog={setEnableGlycanViewInfoDialog}
              enableGlycanViewInfoDialog={enableGlycanViewInfoDialog}
              glycanViewInfo={glycanViewInfo}
            />
          )}
        </div>
      </>
    );
  };

  const getGlycanInfoDisplay = rowSelected => {
    let glycan;

    if (rowSelected.original.glycans) {
      glycan = rowSelected.original.glycans[rowSelected.index];
    } else {
      glycan = rowSelected.original;
    }

    setEnableGlycanViewInfoDialog(true);
    setGlycanViewInfo(glycan);
  };

  function handleSubmit(e) {
    setValidated(true);
    if (e.currentTarget.checkValidity()) {
      wsCall(
        "updatefeature",
        "POST",
        null,
        true,
        {
          id: featureDetails.id,
          name: featureDetails.name,
          internalId: featureDetails.internalId,
          type: featureDetails.type
        },
        updateFeatureSuccess,
        updateFeatureFailure
      );
    }
    e.preventDefault();

    function updateFeatureSuccess() {
      history.push("/features");
    }

    function updateFeatureFailure(response) {
      response.json().then(parsedJson => {
        setShowErrorSummary(true);
        setErrorMessage("");
        setPageErrorsJson(parsedJson);
      });
    }
  }

  const getFeatureDetails = () => {
    return (
      <>
        <Helmet>
          <title>{head.viewFeature.title}</title>
          {getMeta(head.viewFeature)}
        </Helmet>

        <Container maxWidth="lg">
          <div className={featureId ? "page-container" : ""}>
            <Title title={editFeature ? "Edit Feature" : "Feature View"} />
            <Card>
              <Card.Body>
                {<Loading show={showLoading} />}
                <ErrorSummary
                  show={showErrorSummary}
                  form="feature"
                  errorJson={pageErrorsJson}
                  errorMessage={errorMessage}
                />

                <Form noValidate validated={validated} onSubmit={editFeature ? handleSubmit : ""}>
                  {getMetadataNameandId(props.metadata ? "case4" : "view")}

                  {getLinker()}

                  {getLipid()}

                  {getPeptide()}

                  {getProtein()}

                  {props.metadata
                    ? case4Metadata()
                    : featureDetails.metadata && featureDetails.metadata.descriptorGroups && getMetadataTable()}

                  {props.glycans ? getSelectedGlycanList() : featureDetails.glycans.length > 0 && getGlycanTable()}
                  <br />

                  <div className="text-center mb-4 mt-4">
                    {featureDetails && featureDetails.type && (
                      <Link to="/features">
                        <Button className="gg-btn-blue mt-2 gg-mr-20">{editFeature ? "Cancel" : "Back"}</Button>
                      </Link>
                    )}

                    {editFeature && (
                      <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
                        Submit
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </>
    );
  };
  return <>{getFeatureDetails()}</>;
};

function getReducingEndState(opensRing) {
  switch (opensRing) {
    case 0:
      return "Open Ring";
    case 1:
      return "Alpha";
    case 2:
      return "Beta";
    case 3:
      return "Unknown";
    case 4:
      return "Equilibrium";

    default:
      return "Unknown";
  }
}

export { FeatureView, getReducingEndState };
