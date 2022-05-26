import React, { useReducer, useEffect } from "react";
import "../components/FeatureCard.css";
import PropTypes from "prop-types";
import { Form, Col, Row } from "react-bootstrap";
import { FormLabel } from "../components/FormControls";
import ReactTable from "react-table";
import { StructureImage } from "../components/StructureImage";
import { getAAPositionsFromSequence } from "../utils/sequence";

const FeatureCard = props => {
  const [feature, setFeature] = useReducer((oldState, newState) => ({ ...oldState, ...newState }), {
    name: "",
    type: "",
    linker: {},
    glycans: []
  });

  useEffect(() => {
    var featureDetails = {
      name: props.feature.name,
      type: props.feature.type,
      linker: props.feature.linker,
      glycans: props.feature.glycans
    };
    if (
      featureDetails.linker &&
      Object.keys(featureDetails.linker).length !== 0 &&
      featureDetails.linker.type !== "SMALLMOLECULE_LINKER"
    ) {
      var glycanPositionData = getAAPositionsFromSequence(featureDetails.linker.sequence);
      var idToGlycanMap = featureDetails.glycans.reduce((map, glycan) => {
        map[glycan.id] = glycan;
        return map;
      }, {});

      featureDetails.glycans = glycanPositionData.map(posData => {
        posData["glycan"] = idToGlycanMap[props.feature.positionMap[posData.position]];
        return posData;
      });
    } else {
      featureDetails.glycans = featureDetails.glycans.map(glycan => {
        return { glycan: glycan };
      });
    }
    setFeature(featureDetails);

    return () => {
      //cleanup
    };
  }, [props.feature]);

  return (
    <>
      {props.showName && (
        <Form.Group as={Row} controlId="name">
          <FormLabel label="Name" />
          <Col md={6}>
            <Form.Control as="input" value={feature.name} disabled />
          </Col>
        </Form.Group>
      )}
      {feature.linker && (
        <>
          <Form.Group as={Row} controlId="linker">
            <FormLabel label="Linker Details:" />
          </Form.Group>
          <Form.Group as={Row} controlId="linkerName">
            <FormLabel label="Name" className="linker-field-label" />
            <Col md={6}>
              <Form.Control as="input" value={feature.linker.name} disabled />
            </Col>
          </Form.Group>
          {feature.linker.imageURL && (
            <Form.Group as={Row} controlId="name">
              <FormLabel label="Structure Image" className="linker-field-label" />
              <Col md={6}>
                <StructureImage imgUrl={feature.linker.imageURL}></StructureImage>
              </Col>
            </Form.Group>
          )}
          {feature.linker.sequence && (
            <Form.Group as={Row} controlId="sequence">
              <FormLabel label="Sequence" className="linker-field-label" />
              <Col md={6} className="sequence-label-div">
                <Form.Control as="textarea" className="sequence-textarea" value={feature.linker.sequence} disabled />
              </Col>
            </Form.Group>
          )}
        </>
      )}

      <Form.Group as={Row} controlId="glycan">
        <FormLabel label="Attached Glycan(s) Details:" />
      </Form.Group>
      <Form.Group as={Row} controlId="glycanTable">
        <Col className="selected-glycans-review">
          {feature.glycans.length > 0 && (
            <ReactTable
              columns={[
                ...(feature.linker && feature.linker.type !== "SMALLMOLECULE_LINKER"
                  ? [
                      {
                        Header: "Position",
                        accessor: "position",
                      },
                      {
                        Header: "Amino Acid",
                        accessor: "aminoAcid",
                      },
                    ]
                  : []),
                {
                  Header: "Glytoucan ID",
                  accessor: "glycan",
                  Cell: row => (row.value ? row.value.glytoucanId : ""),
                },
                {
                  Header: "Name",
                  accessor: "glycan",
                  Cell: row => (row.value ? row.value.name : ""),
                },
                {
                  Header: "Glycan",
                  accessor: "glycan",
                  // eslint-disable-next-line react/display-name
                  Cell: (row, index) =>
                    row.value ? (
                      row.value.cartoon ? (
                        <StructureImage key={index} base64={row.value.cartoon}></StructureImage>
                      ) : (
                        "No Image"
                      )
                    ) : (
                      "No Glycan Selected"
                    ),
                  minWidth: 150,
                },
              ]}
              data={feature.glycans}
              defaultPageSize={feature.glycans.length}
              minRows={0}
              className="MyReactTableClass"
              NoDataComponent={({ state, ...rest }) =>
                !state?.loading ? (
                  <p className="pt-2 text-center">
                    <strong>No data available</strong>
                  </p>
                ) : null
              }
              showPagination={false}
            />
          )}
        </Col>
      </Form.Group>
    </>
  );
};

FeatureCard.propTypes = {
  feature: PropTypes.object,
  showName: PropTypes.bool
};

export { FeatureCard };
