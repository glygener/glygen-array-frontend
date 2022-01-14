import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import { useParams } from "react-router-dom";
import { Row, Col, Form, Table, Button, Card } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
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
import { GlycoPeptides } from "../components/GlycoPeptides";
import { PageHeading } from "../components/FormControls";

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
              <div className="pb-3 pt-3">
                <Row className="gg-align-center">
                  <Col xs={12} lg={9}>
                    <h4 className="gg-blue">{desc.name}</h4>
                    <Table bordered hover className="mb-4">
                      <thead className="table-header">
                        <th>Name</th>
                        <th>Value</th>
                      </thead>
                      <tbody>
                        {desc.descriptors &&
                          desc.descriptors.map(subdesc => {
                            let subGroup = [];
                            if (subdesc.group) {
                              //sub group title
                              subGroup.push(
                                <th style={{ backgroundColor: "white", fontWeight: "bold" }}>{subdesc.name}</th>
                              );

                              subdesc.descriptors.forEach(ele => {
                                subGroup.push(
                                  <>
                                    <tr>
                                      <td>{ele.name}</td>
                                      <td>{ele.value}</td>
                                    </tr>
                                  </>
                                );
                              });
                            } else {
                              subGroup.push(
                                <>
                                  <tr>
                                    <td>{subdesc.name}</td>
                                    <td>{subdesc.value}</td>
                                  </tr>
                                </>
                              );
                            }
                            return subGroup;
                          })}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </div>
            );
          })}
      </>
    );
  };

  const getGlycanTable = () => {
    return (
      <>
        {/* <Row className="gg-align-center">
          <Col xs={12} lg={9}>
            <h4 className="gg-blue">Glycans</h4> */}
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
              )
              // minWidth: 300,
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
              Header: "Reducing End State",
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
        {/* </Col>
        </Row> */}
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
          <Form.Group as={Row} controlId="image" className="gg-align-center">
            <Col md={4}>
              <StructureImage imgUrl={linker.imageURL} />
            </Col>
          </Form.Group>
        ) : (
          (linker.description || linker.comment) && (
            <Form.Group as={Row} controlId="comment" className="gg-align-center mb-3">
              <Col xs={12} lg={9}>
                <FormLabel label="Comment" />
                <Form.Control
                  rows={4}
                  as="textarea"
                  disabled={page === "case4"}
                  readOnly={page === "view"}
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

  const case4MetadataWhileCreatingFeature = () => {
    let groupData = [];
    let generalData = [];

    generalData.push(
      <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
        <Col xs={12} lg={9}>
          <h4 className="gg-blue">General Descriptors</h4>
          {/* <FormLabel label="General Descriptors" className="gg-blue" /> */}
        </Col>
      </Form.Group>
    );

    props.metadata[0].descriptors.forEach(ele => {
      if (ele.group) {
        if (ele.mandateGroup && ele.mandateGroup.defaultSelection) {
          groupData.push(
            <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
              <Col xs={12} lg={9}>
                <h4 className="gg-blue">{`${ele.mandateGroup.name} - ${ele.name}`}</h4>
                {/* <FormLabel label={`${ele.mandateGroup.name} - ${ele.name}`} className="gg-blue" /> */}
              </Col>
            </Form.Group>
          );
        } else if (!ele.mandateGroup) {
          groupData.push(
            <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
              <Col xs={12} lg={9}>
                <h4 className="gg-blue">{ele.name}</h4>
                {/* <FormLabel label={ele.name} className="gg-blue" /> */}
              </Col>
            </Form.Group>
          );
        }

        if ((ele.mandateGroup && ele.mandateGroup.defaultSelection) || !ele.mandateGroup) {
          ele.descriptors.forEach(subEle => {
            if (subEle.group && subEle.descriptors.filter(i => i.value).length > 0) {
              groupData.push(
                <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
                  <Col xs={12} lg={9}>
                    <h4 className="gg-blue">{subEle.name}</h4>
                    {/* <FormLabel label={subEle.name} className="gg-blue" /> */}
                  </Col>
                </Form.Group>
              );
              subEle.descriptors.forEach(lastSubEle => {
                if (lastSubEle.value) {
                  groupData.push(getField(lastSubEle.name, lastSubEle.value));
                }
              });
            } else {
              if (subEle.value) {
                groupData.push(getField(subEle.name, subEle.value));
              }
            }
          });
        }
      } else {
        if (ele.value) {
          generalData.push(getField(ele.name, ele.value));
        }
      }
    });

    if (generalData.length > 1) {
      generalData.push(groupData);
    }
    return <>{generalData}</>;
  };

  const getField = (label, value) => {
    return (
      <>
        <Form.Group as={Row} className="gg-align-center mb-3" controlId={label}>
          <Col xs={12} lg={9}>
            <FormLabel label={label} />
            <Form.Control type="text" name={label} placeholder="Enter Name" value={value} disabled />
          </Col>
        </Form.Group>
      </>
    );
  };

  const displayDetails = (linker, page, label) => {
    return (
      <>
        <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
          <Col xs={12} lg={9}>
            <h4 className="gg-blue">{label}</h4>
            {/* <FormLabel label={label} className="gg-blue" /> */}
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Name" />
            <Form.Control type="text" disabled={page === "case4"} readOnly={page === "view"} value={linker.name} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="type" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Type" />
            <Form.Control type="text" disabled={page === "case4"} readOnly={page === "view"} value={linker.type} />
          </Col>
        </Form.Group>

        {linker.sequence && (
          <Form.Group as={Row} controlId="sequence" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Sequence" />
              <Form.Control
                type="text"
                disabled={page === "case4"}
                readOnly={page === "view"}
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
        <Form.Group as={Row} className="gg-align-center mb-3" controlId="name">
          <Col xs={12} lg={9}>
            <FormLabel label="Name" className={editFeature ? "required-asterik" : ""} />
            <Form.Control
              type="text"
              name="name"
              disabled={page === "case4" && !editFeature}
              readOnly={page === "view" && !editFeature}
              value={props.metadata ? props.name : featureDetails.name}
              onChange={editFeature ? handleChange : {}}
              maxLength={50}
              required
            />
            <Feedback message="Name is required" />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="featureId" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Feature ID" className={editFeature ? "required-asterik" : ""} />
            <Form.Control
              type="text"
              name="internalId"
              disabled={page === "case4" && !editFeature}
              readOnly={page === "view" && !editFeature}
              value={props.metadata ? props.featureId : featureDetails.internalId}
              onChange={editFeature ? handleChange : {}}
              maxLength={30}
              required
            />
            <Feedback message="Feature ID is required" />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="Type" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Type" />
            <Form.Control
              type="text"
              // disabled={page === "case4"}
              // plaintext={page === "view"}
              disabled={page === "case4" && !editFeature}
              readOnly={page === "view" && !editFeature}
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
        <div className="mt-3 pt-3">
          {/* <Row className="gg-align-center">
            <Col xs={12} lg={9}> */}
          <GlygenTable
            columns={[
              {
                Header: "Name",
                accessor: "name",
                Cell: row => {
                  return (props.type === "GLYCO_PEPTIDE" || props.type === "GLYCO_PROTEIN") &&
                    props.rangeGlycans.length === 0
                    ? getToolTip(row.original.glycan && row.original.glycan.name)
                    : getToolTip(row.original.name);
                }
              },
              {
                Header: "Structure Image",
                accessor: "cartoon",
                Cell: row => {
                  return (props.type === "GLYCO_PEPTIDE" || props.type === "GLYCO_PROTEIN") &&
                    props.rangeGlycans.length === 0 ? (
                    <StructureImage base64={row.original.glycan && row.original.glycan.cartoon} />
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
                  return (props.type === "GLYCO_PEPTIDE" || props.type === "GLYCO_PROTEIN") &&
                    props.rangeGlycans.length === 0
                    ? row.original &&
                        row.original.glycan &&
                        row.original.glycan.source &&
                        (row.original.glycan.source.type === "NOTRECORDED"
                          ? getToolTip("Not Recorded")
                          : row.original.glycan.source.type === "COMMERCIAL"
                          ? getToolTip("Commercial")
                          : getToolTip("Non Commercial"))
                    : row.original &&
                        row.original.source &&
                        (row.original.source.type === "NOTRECORDED"
                          ? getToolTip("Not Recorded")
                          : row.original.source.type === "COMMERCIAL"
                          ? getToolTip("Commercial")
                          : getToolTip("Non Commercial"));
                }
              },
              {
                Header: "Reducing End State",
                accessor: "opensRing",
                Cell: row => {
                  return (props.type === "GLYCO_PEPTIDE" || props.type === "GLYCO_PROTEIN") &&
                    props.rangeGlycans.length === 0
                    ? getToolTip(getReducingEndState(row.original.glycan && row.original.glycan.opensRing))
                    : getToolTip(getReducingEndState(row.value));
                }
              },
              ...((props.type === "GLYCO_PEPTIDE" || props.type === "GLYCO_PROTEIN") && props.rangeGlycans.length > 0
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

              ...(props.type === "GLYCO_LIPID" ||
              ((props.type === "GLYCO_PEPTIDE" || props.type === "GLYCO_PROTEIN") && props.rangeGlycans.length > 0)
                ? [
                    {
                      Header: "Linker",
                      accessor: "linker",
                      Cell: (row, index) => {
                        return row.original.linker ? getToolTip(row.original.linker && row.original.linker.name) : "";
                      },
                      minWidth: 150
                    }
                  ]
                : [])
            ]}
            data={
              (props.type === "GLYCO_PEPTIDE" || props.type === "GLYCO_PROTEIN") && props.rangeGlycans.length > 0
                ? props.rangeGlycans
                : props.glycans
            }
            defaultPageSize={5}
            showPagination={false}
            showRowsInfo={false}
            showViewIcon
            customViewonClick
            viewOnClick={getGlycanInfoDisplay}
            infoRowsText="Selected Glycans"
          />
          {/* </Col>
          </Row> */}
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

  const getGlycoProteinLinkedPeptide = () => {
    return (
      <>
        <GlycoPeptides
          data={props.rangeGlycoPeptides.length > 0 ? props.rangeGlycoPeptides : props.glycoPeptides}
          customViewonClick
          viewOnClick={props.viewGlycoPeptide}
        />
      </>
    );
  };

  const getGlycanInfoDisplay = rowSelected => {
    let glycan;

    if (props.positionDetails && props.positionDetails.isPosition) {
      glycan = rowSelected.original.glycan;
    } else if (rowSelected.original.glycans) {
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

        <Container maxWidth="xl">
          <div className={featureId ? "page-container" : ""}>
            <PageHeading
              title={editFeature ? "Edit Feature" : "Feature View"}
              subTitle={
                editFeature
                  ? "Update feature information. Name must be unique in your feature repository and cannot be used for more than one feature."
                  : ""
              }
            />
            <Card>
              <Card.Body>
                <diiv>
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
                      ? case4MetadataWhileCreatingFeature()
                      : featureDetails.metadata && featureDetails.metadata.descriptorGroups && getMetadataTable()}

                    {props.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE" &&
                    (props.rangeGlycoPeptides || props.glycoPeptides)
                      ? getGlycoProteinLinkedPeptide()
                      : props.glycans
                      ? getSelectedGlycanList()
                      : featureDetails.glycans.length > 0 && getGlycanTable()}

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
                </diiv>
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
