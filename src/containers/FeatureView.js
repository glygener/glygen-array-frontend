import React, { useEffect, useReducer, useState } from "react";
import { wsCall } from "../utils/wsUtils";
import { useParams } from "react-router-dom";
import { Row, Col, Form, Table } from "react-bootstrap";
import { FormLabel, Title, LinkButton } from "../components/FormControls";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { GlygenTable } from "../components/GlygenTable";
import { StructureImage } from "../components/StructureImage";

const FeatureView = props => {
  useEffect(props.authCheckAgent, []);

  let { featureId } = useParams();
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
    wsCall("getfeature", "GET", [featureId], true, null, getFeatureSuccess, getFeatureFailure);
  }, [props]);

  function getFeatureSuccess(response) {
    response.json().then(parsedJson => {
      debugger;
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

  function getType(type) {
    switch (type) {
      case "LINKEDGLYCAN":
        return getFeatureTypeTable(featureDetails.linker, "LINKEDGLYCAN");
      case "GLYCOLIPID":
        return getFeatureTypeTable(featureDetails.lipid, "GLYCOLIPID");
      case "GLYCOPEPTIDE":
        return getFeatureTypeTable(featureDetails.linker, "GLYCOPEPTIDE");
      case "GLYCOPROTEIN":
        return getFeatureTypeTable(featureDetails.lipid, "GLYCOPROTEIN");
      case "GPLINKEDGLYCOPEPTIDE":
        return getFeatureTypeTable(featureDetails.lipid, "GPLINKEDGLYCOPEPTIDE");

      default:
        return getFeatureTypeTable(featureDetails.linker, "LINKEDGLYCAN");
    }
  }

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
    debugger;
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
                debugger;
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

  const getFeatureDetails = () => {
    return (
      <>
        <Helmet>
          <title>{head.viewFeature.title}</title>
          {getMeta(head.viewFeature)}
        </Helmet>

        <div className="page-container">
          <Title title="Feature View" />
          <Form.Group as={Row} controlId="internalId">
            <FormLabel label="Internal ID" />
            <Col md={4}>
              <Form.Control type="text" plaintext readOnly value={featureDetails.internalId} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Name" />
            <Col md={4}>
              <Form.Control type="text" plaintext readOnly value={featureDetails.name} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="Type">
            <FormLabel label="Type" />
            <Col md={4}>
              <Form.Control type="text" plaintext readOnly value={featureDetails.type} />
            </Col>
          </Form.Group>

          {getType("LINKEDGLYCAN")}
          <br />
          {featureDetails.type !== "LINKEDGLYCAN" && getType(featureDetails.type)}
          <br />
          <br />
          {featureDetails.metadata && featureDetails.metadata.descriptorGroups && (
            <div>
              <h3>Metadata</h3>
              <br />
              {getMetadataTable()}
            </div>
          )}
          <br />

          {featureDetails.glycans.length > 0 && getGlycanTable()}
          <br />

          <LinkButton to="/features" label="Back" />
          <br />
          <br />
        </div>
      </>
    );
  };
  return <>{getFeatureDetails()}</>;
};

export { FeatureView };
