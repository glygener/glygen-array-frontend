import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import { useParams } from "react-router-dom";
import { Row, Col, Form, Button, Card, Modal } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { GlygenTable } from "../components/GlygenTable";
import { StructureImage } from "../components/StructureImage";
import { getToolTip } from "../utils/commonUtils";
import { viewGlycoPeptide, getSource } from "../utils/FeatureUtils";
import { ViewInfoModal } from "../components/ViewInfoModal";
import { useHistory, Link } from "react-router-dom";
import { ErrorSummary } from "../components/ErrorSummary";
import { Loading } from "../components/Loading";
import Container from "@material-ui/core/Container";
import { GlycoPeptides } from "../components/GlycoPeptides";
import { PageHeading } from "../components/FormControls";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../components/FeatureView.css";
import { ViewSourceInfo } from "../components/ViewSourceInfo";

const FeatureView = props => {
  let { featureId, editFeature } = useParams();
  const history = useHistory();
  const [showLoading, setShowLoading] = useState(false);
  const [showLinkerView, setShowLinkerView] = useState(false);

  const [validated, setValidated] = useState(false);
  const [glycanViewInfo, setGlycanViewInfo] = useState(false);
  const [enableGlycanViewInfoDialog, setEnableGlycanViewInfoDialog] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [displayLinkerInfo, setDisplayLinkerInfo] = useState("");

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

  const getGlycanTable = () => {
    return (
      <>
        <h4 className="gg-blue" style={{ paddingTop: "30px", paddingBottom: "15px" }}>
          Glycans
        </h4>

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
                  zoom={true} 
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
                  ? row.original.reducingEndConfiguration && getToolTip(row.original.reducingEndConfiguration.type)
                  : row.original.glycans[0].reducingEndConfiguration && getToolTip(row.original.glycans[0].reducingEndConfiguration.type);
              }
            },
            ...(featureDetails.type === "GLYCOLIPID"
              ? [
                  {
                    Header: "Linker",
                    accessor: "linker",
                    style: {
                      textAlign: "center"
                    },
                    Cell: (row, index) => {
                      return (
                        row.original.linker && (
                          <>
                            <LineTooltip text="Linker Details">
                              <FontAwesomeIcon
                                key={"linkerView"}
                                icon={["far", "eye"]}
                                alt="View icon"
                                size="lg"
                                color="#45818e"
                                className="tbl-icon-btn"
                                onClick={() => {
                                  setDisplayLinkerInfo(row.original.linker);
                                }}
                              />
                            </LineTooltip>
                          </>
                        )
                      );
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
          <ViewInfoModal
            setEnableModal={setEnableGlycanViewInfoDialog}
            enableModal={enableGlycanViewInfoDialog}
            glycanViewInfo={glycanViewInfo}
            glycanView
          />
        )}
      </>
    );
  };

  const getLinker = () => {
    let linkerDisplay = [];

    linkerDisplay.push(
      <>
        <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
          <Col xs={12} lg={9}>
            <Row style={{ marginLeft: "0px" }}>
              <h4 className="gg-blue" style={{ marginRight: "50px" }}>
                {"Linker"}
              </h4>

              {(props.linker && Object.keys(props.linker).length > 0) ||
              (featureDetails.linker && Object.keys(featureDetails.linker).length > 0) ? (
                <LineTooltip text="Linker Details">
                  <div className={"view-more-btn-icon"} onClick={() => setShowLinkerView(true)}>
                    <FontAwesomeIcon
                      key={"linkerView"}
                      icon={["far", "eye"]}
                      alt="View icon"
                      size="lg"
                      color="#45818e"
                      className="tbl-icon-btn"
                      onClick={() => setShowLinkerView(true)}
                    />
                    {"View More"}
                  </div>
                </LineTooltip>
              ) : (
                <Form.Control type="text" value={"no linker"} readOnly style={{ width: "98.2%" }} />
              )}
            </Row>
          </Col>
        </Form.Group>
      </>
    );

    if (props.linker) {
      if ((props.type !== "GLYCAN" && props.linkerSeletion !== "No") || props.type === "GLYCAN") {
        linkerDisplay.push(linkerDetails(props.linker, "case4"));
      }
    } else if (featureDetails.linker) {
      linkerDisplay.push(linkerDetails(featureDetails.linker, "view"));
    }

    return linkerDisplay;
  };

  const getLinkerDetailsModal = (linker, display) => {
    return (
      <>
        <Modal
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={showLinkerView || displayLinkerInfo}
          onHide={() => {
            showLinkerView && setShowLinkerView(false);
            displayLinkerInfo && setDisplayLinkerInfo();
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
              Linker Information
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {showLinkerView && <>{linkerDetailsOnModal(linker, display)}</>}

            {displayLinkerInfo && <>{linkerDetailsOnModal(displayLinkerInfo, display)}</>}
          </Modal.Body>
        </Modal>
      </>
    );
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
    if (
      (props.type === "GLYCO_LIPID" || props.type === "CONTROL" || props.type === "LANDING_LIGHT") &&
      props.lipid &&
      props.lipid.id
    ) {
      return displayDetails(props.lipid, "case4", "Lipid");
    } else if (featureDetails && featureDetails.type === "GLYCOLIPID") {
      return displayDetails(featureDetails.lipid, "view", "Lipid");
    }
  };

  const getPeptide = () => {
    if (
      (props.type === "GLYCO_PEPTIDE" || props.type === "CONTROL" || props.type === "LANDING_LIGHT") &&
      props.peptide &&
      props.peptide.id
    ) {
      return displayDetails(props.peptide, "case4", "Peptide");
    } else if (featureDetails && featureDetails.type === "GLYCOPEPTIDE") {
      return displayDetails(featureDetails.peptide, "view", "Peptide");
    }
  };

  const getProtein = () => {
    if (
      (props.type === "GLYCO_PROTEIN" || props.type === "CONTROL" || props.type === "LANDING_LIGHT") &&
      props.protein &&
      props.protein.id
    ) {
      return displayDetails(props.protein, "case4", "Protein");
    } else if (featureDetails && featureDetails.type === "GLYCOPROTEIN") {
      return displayDetails(featureDetails.protein, "view", "Protein");
    }
  };

  const getOtherMolecule = () => {
    if (
      (props.type === "CONTROL" || props.type === "LANDING_LIGHT") &&
      props.controlSubType === "Other" &&
      props.linker &&
      props.linker.id
    ) {
      return displayDetails(props.protein, "case4", "Linker");
    } else if (featureDetails && (featureDetails.type === "CONTROL" || featureDetails.type === "LANDING_LIGHT")) {
      return displayDetails(featureDetails.linker, "view", "Linker");
    }
  };

  const case4MetadataWhileCreatingFeature = () => {
    let groupData = [];
    let generalData = [];

    groupData.push(
      <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
        <Col xs={12} lg={9}>
          <h4 className="gg-blue">{"Metadata"}</h4>
        </Col>
      </Form.Group>
    );

    generalData.push(
      <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
        <Col xs={12} lg={9}>
          <h4 className="gg-blue">{"General Descriptors"}</h4>
        </Col>
      </Form.Group>
    );

    let mergedDesc = props.descriptorGroups;
    if (props.descriptors.length > 0) {
      props.descriptors.forEach(ele => {
        mergedDesc.push(ele);
      });
    }
    groupData = displayMetadata(groupData, generalData, mergedDesc);

    return groupData;
  };

  const featureMetadata = () => {
    let groupData = [];
    let generalData = [];
    let simpleDesc = featureDetails.metadata.descriptors;
    let groupDesc = featureDetails.metadata.descriptorGroups;

    if (simpleDesc.length > 0) {
      simpleDesc.forEach(ele => {
        groupDesc.push(ele);
      });
    }

    groupData.push(
      <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
        <Col xs={12} lg={9}>
          <h4 className="gg-blue">{"Metadata"}</h4>
        </Col>
      </Form.Group>
    );

    generalData.push(
      <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
        <Col xs={12} lg={9}>
          <h4 className="gg-blue">{"General Descriptors"}</h4>
        </Col>
      </Form.Group>
    );

    groupData = displayMetadata(groupData, generalData, groupDesc);

    return groupData;
  };

  function displayMetadata(groupData, generalData, mergedDesc) {
    mergedDesc.forEach(ele => {
      let notApplicable;
      let sourceGroup;

      if (props.linker) {
        sourceGroup = mergedDesc.filter(
          e =>
            e.key.mandateGroup &&
            ele.key.mandateGroup &&
            e.key.mandateGroup.id === ele.key.mandateGroup.id &&
            (e.notApplicable || e.notRecorded)
        );

        if (sourceGroup.length > 0) {
          if (sourceGroup[0].notApplicable) {
            notApplicable = true;
          }
        }
      } else {
        sourceGroup = mergedDesc.filter(
          e =>
            e.key.mandateGroup &&
            ele.key.mandateGroup &&
            e.key.mandateGroup.id === ele.key.mandateGroup.id &&
            (e.notApplicable || e.notRecorded)
        );

        if (sourceGroup.length > 0) {
          if (sourceGroup[0].notApplicable) {
            notApplicable = true;
          }
        }
      }

      if (ele.group) {
        if (
          ((props.linker && ele.key.mandateGroup && ele.key.mandateGroup.defaultSelection) ||
            (!props.linker && ele.key.mandateGroup)) &&
          sourceGroup.length < 1
        ) {
          groupData.push(
            <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
              <Col xs={12} lg={9}>
                <h4 className="gg-blue">{`${ele.key.mandateGroup.name} - ${ele.name}`}</h4>
              </Col>
            </Form.Group>
          );
        } else if (!ele.key.mandateGroup) {
          if (ele.descriptors.filter(i => i.value).length > 0) {
            groupData.push(
              <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
                <Col xs={12} lg={9}>
                  <h4 className="gg-blue">{ele.name}</h4>
                </Col>
              </Form.Group>
            );
          }
        } else if (sourceGroup.length > 0 && ele.name !== "Non-commercial") {
          groupData.push(
            <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
              <Col xs={12} lg={9}>
                <h4 className="gg-blue">{`${ele.key.mandateGroup.name}`}</h4>
                <Form.Control
                  type="text"
                  name={"source"}
                  value={notApplicable ? "Not Applicable" : "Not Recorded"}
                  disabled
                />
              </Col>
            </Form.Group>
          );
        }

        if (
          (props.linker && ele.key.mandateGroup && ele.key.mandateGroup.defaultSelection) ||
          (!props.linker && ele.key.mandateGroup) ||
          !ele.key.mandateGroup
        ) {
          ele.descriptors.forEach(subEle => {
            if (subEle.group && subEle.descriptors.filter(i => i.value).length > 0) {
              groupData.push(
                <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
                  <Col xs={12} lg={9}>
                    <h4 className="gg-blue">{subEle.name}</h4>
                  </Col>
                </Form.Group>
              );
              subEle.descriptors.forEach(lastSubEle => {
                if (lastSubEle.value || lastSubEle.notApplicable || lastSubEle.notRecorded) {
                  groupData.push(
                    getField(lastSubEle.name, lastSubEle.value, lastSubEle.notApplicable, lastSubEle.notRecorded)
                  );
                }
              });
            } else {
              if (subEle.value || subEle.notApplicable || subEle.notRecorded) {
                groupData.push(getField(subEle.name, subEle.value, subEle.notApplicable, subEle.notRecorded));
              }
            }
          });
        }
      } else {
        if (ele.value || ele.notApplicable || ele.notRecorded) {
          generalData.push(getField(ele.name, ele.value, ele.notApplicable, ele.notRecorded));
        }
      }
    });

    if (generalData.length > 1) {
      groupData.push(generalData);
    }

    return groupData;
  }

  const getField = (label, value, notApplicable, notRecorded) => {
    return (
      <>
        <Form.Group as={Row} className="gg-align-center mb-3" controlId={label}>
          <Col xs={12} lg={9}>
            <FormLabel label={label} />
            <Form.Control
              type="text"
              name={label}
              placeholder="Enter Name"
              value={value ? value : notApplicable ? "Not Applicable" : "Not Recorded"}
              disabled
            />
          </Col>
        </Form.Group>
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
              disabled={page === "case4" && !editFeature}
              readOnly={page === "view" && !editFeature}
              defaultValue={
                props.type
                  ? props.type === "CONTROL" || props.type === "LANDING_LIGHT"
                    ? `${props.type} - ${props.controlSubType}`
                    : props.type
                  : featureDetails.type
              }
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
                      <StructureImage zoom={true} base64={row.original.glycan && row.original.glycan.cartoon} />
                  ) : (
                      <StructureImage zoom={true} base64={row.value} />
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

              ...(props.type === "GLYCO_LIPID" || props.type === "GLYCO_PEPTIDE" || props.type === "GLYCO_PROTEIN"
                ? [
                    {
                      Header: "Linker",
                      accessor: "linker",
                      style: {
                        textAlign: "center"
                      },
                      Cell: (row, index) => {
                        return row.original.linker ? (
                          <>
                            <LineTooltip text="Linker Details">
                              <FontAwesomeIcon
                                key={"linkerView"}
                                icon={["far", "eye"]}
                                alt="View icon"
                                size="lg"
                                color="#45818e"
                                className="tbl-icon-btn"
                                onClick={() => {
                                  setDisplayLinkerInfo(row.original.linker);
                                }}
                              />
                            </LineTooltip>
                          </>
                        ) : (
                          ""
                        );
                      },
                      minWidth: 150
                    }
                  ]
                : [])
            ]}
            data={
              (props.type === "GLYCO_PEPTIDE" || props.type === "GLYCO_PROTEIN") && props.rangeGlycans.length > 0
                ? props.rangeGlycans
                : props.type === "GLYCO_LIPID" || props.type === "GLYCAN"
                ? props.glycans
                : props.glycans.filter(e => e.glycan)
            }
            defaultPageSize={5}
            showPagination={false}
            showRowsInfo={false}
            showViewIcon
            customViewonClick
            viewOnClick={getGlycanInfoDisplay}
            infoRowsText="Selected Glycans"
          />

          {enableGlycanViewInfoDialog && (
            <ViewInfoModal
              setEnableModal={setEnableGlycanViewInfoDialog}
              enableModal={enableGlycanViewInfoDialog}
              glycanViewInfo={glycanViewInfo}
              glycanView
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
          data={
            props.rangeGlycoPeptides && props.rangeGlycoPeptides.length > 0
              ? props.rangeGlycoPeptides
              : featureDetails.peptides && featureDetails.type === "GPLINKEDGLYCOPEPTIDE"
              ? featureDetails.peptides
              : props.glycoPeptides
          }
          customViewonClick
          viewOnClick={viewGlycoPeptide}
          setDisplayLinkerInfo={setDisplayLinkerInfo}
          displayLinkerInfo={displayLinkerInfo}
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

  const getGlycansTable = () => {
    if (
      props.type &&
      props.type !== "CONTROL" &&
      props.type !== "LANDING_LIGHT" &&
      (props.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE" || featureDetails.type === "GPLINKEDGLYCOPEPTIDE") &&
      (props.rangeGlycoPeptides || props.glycoPeptides || featureDetails.peptides)
    ) {
      return getGlycoProteinLinkedPeptide();
    } else if (props.glycans) {
      return getSelectedGlycanList();
    } else if (featureDetails.glycans.length > 0) {
      return getGlycanTable();
    }
  };

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
                <div>
                  {<Loading show={showLoading} />}
                  <ErrorSummary
                    show={showErrorSummary}
                    form="feature"
                    errorJson={pageErrorsJson}
                    errorMessage={errorMessage}
                  />

                  <Form noValidate validated={validated} onSubmit={editFeature ? handleSubmit : ""}>
                    {getMetadataNameandId(props.metadata ? "case4" : "view")}

                    {props.controlSubType === "Linker" &&
                      props.type !== "CONTORL" &&
                      props.type !== "LANDING_LIGHT" &&
                      getLinker()}

                    {(showLinkerView && props.linker) || displayLinkerInfo
                      ? getLinkerDetailsModal(props.linker, "case4")
                      : getLinkerDetailsModal(featureDetails.linker, "view")}

                    {getLipid()}

                    {getPeptide()}

                    {getProtein()}

                    {getOtherMolecule()}

                    {props.metadata
                      ? case4MetadataWhileCreatingFeature()
                      : featureDetails.metadata &&
                        ((featureDetails.metadata.descriptorGroups &&
                          featureDetails.metadata.descriptorGroups.length > 0) ||
                          (featureDetails.metadata.descriptors && featureDetails.metadata.descriptors.length > 0)) &&
                        featureMetadata()}

                    {props.type !== "CONTROL" && props.type !== "LANDING_LIGHT" && getGlycansTable()}

                    <div className="text-center mb-4 mt-4">
                      {featureDetails && featureDetails.type && (
                        <Link to="/features">
                          <Button
                            className={`${editFeature ? "gg-btn-outline mt-2 gg-mr-20" : "gg-btn-blue mt-2 gg-mr-20"}`}
                          >
                            {editFeature ? "Cancel" : "Back"}
                          </Button>
                        </Link>
                      )}

                      {editFeature && (
                        <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
                          Submit
                        </Button>
                      )}
                    </div>
                  </Form>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </>
    );
  };
  return <>{getFeatureDetails()}</>;
};

const displayDetails = (linker, page, label) => {
  return (
    <>
      {label !== "Linker" && (
        <Form.Group as={Row} className="gg-align-center pt-3 mb-0 pb-1">
          <Col xs={12} lg={9}>
            <h4 className="gg-blue">{label}</h4>
          </Col>
        </Form.Group>
      )}

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

      {(linker.sequence || linker.inChiSequence) && linker.type !== "LIPID" && (
        <Form.Group as={Row} controlId="sequence" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={linker.sequence ? "Sequence" : "InChI"} />
            <Form.Control
              rows={linker.sequence ? "10" : "4"}
              as="textarea"
              disabled={page === "case4"}
              readOnly={page === "view"}
              value={linker.sequence ? linker.sequence : linker.inChiSequence}
            />
          </Col>
        </Form.Group>
      )}

      {linker.type === "LIPID" && linker.imageURL && (
        <Form.Group as={Row} controlId="image" className="gg-align-center">
          <Col md={4}>
            <StructureImage imgUrl={linker.imageURL} />
          </Col>
        </Form.Group>
      )}
    </>
  );
};

const linkerDetailsOnModal = (linker, page) => {
  const buildSource = () => {
    let source = {};
    source = getSource(linker.source);
    source.type = linker.source.type;

    return (
      <>
        <ViewSourceInfo
          source={source.type}
          commercial={source.commercial}
          nonCommercial={source.nonCommercial}
          isUpdate
        />
      </>
    );
  };

  return (
    <>
      {displayDetails(linker, page, "Linker")}

      {linker.mass && (
        <Form.Group as={Row} controlId="mass" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Monoisotopic Mass" />
            <Form.Control
              type="text"
              disabled={page === "case4"}
              readOnly={page === "view"}
              value={Number(parseFloat(linker.mass).toFixed(2)).toLocaleString('en-US') + " Da"}
            />
          </Col>
        </Form.Group>
      )}

      {linker.iupacName && (
        <Form.Group as={Row} controlId="iupacName" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"IUPAC Name"} />
            <Form.Control type="text" value={linker.iupacName} disabled={page === "case4"} readOnly={page === "view"} />
          </Col>
        </Form.Group>
      )}

      {linker.smiles && (
        <Form.Group as={Row} controlId="smiles" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Canonical SMILES"} />
            <Form.Control type="text" value={linker.smiles} disabled={page === "case4"} readOnly={page === "view"} />
          </Col>
        </Form.Group>
      )}

      {linker.source && buildSource()}
    </>
  );
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

export { FeatureView, getReducingEndState, linkerDetailsOnModal, displayDetails };
