import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import { useParams } from "react-router-dom";
import { Row, Col, Form, Table } from "react-bootstrap";
import { FormLabel, Title, LinkButton } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { GlygenTable } from "../components/GlygenTable";
import { StructureImage } from "../components/StructureImage";
import { getToolTip } from "../utils/commonUtils";

const FeatureView = props => {
  let { featureId } = useParams();
  const [validated, setValidated] = useState(false);

  useEffect(() => props.authCheckAgent, []);

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
    wsCall("getfeature", "GET", [featureId], true, null, getFeatureSuccess, getFeatureFailure);
  }, [featureId]);

  function getFeatureSuccess(response) {
    response.json().then(parsedJson => {
      setFeatureDetails(parsedJson);
    });
  }
  function getFeatureFailure(response) {
    setValidated(false);
    console.log(response);
  }

  const [featureDetails, setFeatureDetails] = useReducer((state, newState) => ({ ...state, ...newState }), {
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

  const getFeatureTypeTable = (featureTypeData, label) => {
    return (
      <>
        <div>
          <h3>{getTypeTableLabel(label)}</h3>
          &nbsp;
          <Table bordered hover size="sm">
            <thead>
              <th>Name</th>
              <th>type</th>
              <th>sequence</th>
            </thead>
            <tbody>
              <tr>
                <td>{featureTypeData.id}</td>
                <td>{featureTypeData.type}</td>
                <td>{featureTypeData.sequence}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </>
    );
  };

  // function getType(type) {
  //   switch (type) {
  //     case "LINKEDGLYCAN":
  //       return getFeatureTypeTable(featureDetails.linker, "LINKEDGLYCAN");
  //     case "GLYCOLIPID":
  //       return getFeatureTypeTable(featureDetails.lipid, "GLYCOLIPID");
  //     case "GLYCOPEPTIDE":
  //       return getFeatureTypeTable(featureDetails.linker, "GLYCOPEPTIDE");
  //     case "GLYCOPROTEIN":
  //       return getFeatureTypeTable(featureDetails.lipid, "GLYCOPROTEIN");
  //     case "GPLINKEDGLYCOPEPTIDE":
  //       return getFeatureTypeTable(featureDetails.lipid, "GPLINKEDGLYCOPEPTIDE");

  //     default:
  //       return getFeatureTypeTable(featureDetails.linker, "LINKEDGLYCAN");
  //   }
  // }

  function getTypeTableLabel(type) {
    switch (type) {
      case "LINKEDGLYCAN":
        return "Linker";
      case "GLYCOLIPID":
        return "Lipid";
      case "GLYCOPEPTIDE":
        return "Peptide";
      case "GLYCOPROTEIN":
        return "Protein";
      case "GPLINKEDGLYCOPEPTIDE":
        return "GlycoProtein linked GlycoPeptide";

      default:
        return "Linker";
    }
  }

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
                featureDetails.type === "LINKEDGLYCAN" ? row.original.glycan.name : row.original.glycans[0].glycan.name
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
                  ? row.original.source.type === "NOTRECORDED"
                    ? "Not Recorded"
                    : row.original.source.type === "COMMERCIAL"
                    ? "Commercial"
                    : "Non Commercial"
                  : row.original.glycans[0].source.type === "NOTRECORDED"
                  ? "Not Recorded"
                  : row.original.glycans[0].source.type === "COMMERCIAL"
                  ? "Commercial"
                  : "Non Commercial";
              }
            },
            {
              Header: "Reducing end state",
              accessor: "opensRing",
              Cell: row => {
                return featureDetails.type === "LINKEDGLYCAN"
                  ? row.original.reducingEndConfiguration.type
                  : row.original.glycans[0].reducingEndConfiguration.type;
              }
            },
            ...(featureDetails.type === "GLYCOLIPID"
              ? [
                  {
                    Header: "Linker",
                    accessor: "linker",
                    Cell: (row, index) => {
                      return row.original.linker ? row.original.linker.name : "";
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
          infoRowsText="Glycans"
          showPagination={false}
          showRowsInfo={false}
        />
      </>
    );
  };

  const getLinker = () => {
    if (props.linker) {
      if ((props.type !== "LINKED_GLYCAN" && props.linkerSeletion !== "No") || props.type === "LINKED_GLYCAN") {
        return displayDetails(props.linker, "case4", "Linker");
      }
    } else if (featureDetails.linker) {
      return displayDetails(featureDetails.linker, "view", "Linker");
    }
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
            <FormLabel label="Purity" className={"metadata-descriptor-title "} />
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
            <Form.Group as={Row} controlId="comment">
              <FormLabel label="Comment" />
              <Col md={4}>
                <Form.Control type="text" disabled value={props.metadata.purity.comment} />
              </Col>
            </Form.Group>
          </>
        ) : (
          <Form.Group as={Row} controlId="value">
            <FormLabel label="Purity" className={"metadata-descriptor-title "} />
            <Col md={4}>
              <Form.Control type="text" disabled value={"Not Recorded"} />
            </Col>
          </Form.Group>
        )}

        {props.metadata.source === "notSpecified" && (
          <Form.Group as={Row} controlId="value">
            <FormLabel label="Source" className={"metadata-descriptor-title "} />
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

            <Form.Group as={Row} controlId="batchId">
              <FormLabel label="Comment" />
              <Col md={4}>
                <Form.Control type="text" disabled value={props.metadata.nonCommercial.sourceComment} />
              </Col>
            </Form.Group>
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

  const getMetadataNameandId = page => {
    return (
      <>
        <Form.Group as={Row} controlId="name">
          <FormLabel label="Name" />
          <Col md={4}>
            <Form.Control
              type="text"
              disabled={page === "case4"}
              plaintext={page === "view"}
              value={props.metadata ? props.metadata.name : featureDetails.name}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="Type">
          <FormLabel label="Type" />
          <Col md={4}>
            <Form.Control
              type="text"
              disabled={page === "case4"}
              plaintext={page === "view"}
              value={props.type ? props.type : featureDetails.type}
            />
          </Col>
        </Form.Group>
      </>
    );
  };

  const getSelectedGlycanList = () => {
    debugger;
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
            infoRowsText="Selected Glycans"
          />
        </div>
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

  const getFeatureDetails = () => {
    return (
      <>
        <Helmet>
          <title>{head.viewFeature.title}</title>
          {getMeta(head.viewFeature)}
        </Helmet>

        <div className={featureId ? "page-container" : ""}>
          <Title title={featureId ? "Feature View" : ""} />

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

          {featureDetails && featureDetails.type && <LinkButton to="/features" label="Back" />}
          <br />
          <br />
        </div>
      </>
    );
  };
  return <>{getFeatureDetails()}</>;
};

export { FeatureView };
