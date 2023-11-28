import React, { useReducer, useEffect } from "react";
import "../components/FeatureCard.css";
import PropTypes from "prop-types";
import { Form, Col, Row, Modal } from "react-bootstrap";
import { FormLabel } from "../components/FormControls";
import ReactTable from "react-table";
import { StructureImage } from "../components/StructureImage";
import { getAAPositionsFromSequence } from "../utils/sequence";
import { displayDetails } from "../containers/FeatureView";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const FeatureCard = props => {
  const [feature, setFeature] = useReducer((oldState, newState) => ({ ...oldState, ...newState }), {
    id: "",
    name: "",
    type: "",
    internalId : "",
    linker: {},
    glycans: [],
    peptides: [],
    lipid: {},
    peptide: {},
    protein: {},
    metadata: {}
  });

  useEffect(() => {
    var featureDetails = {
      id: props.feature.id,
      name: props.feature.name,
      internalId: props.feature.internalId,
      type: props.feature.type,
      linker: props.feature.linker,
      glycans: props.feature.glycans,
      peptides: props.feature.peptides,
      lipid: props.feature.lipid,
      peptide: props.feature.peptide,
      protein: props.feature.protein,
      metadata: props.feature.metadata
    };
    if (
      featureDetails.linker &&
      Object.keys(featureDetails.linker).length !== 0 &&
      featureDetails.linker.sequence
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
      if (featureDetails.glycans && featureDetails.glycans.length > 0) {
        featureDetails.glycans = featureDetails.glycans.map(glycan => {
          return { glycan: glycan };
        });
      } else if (featureDetails.peptides && featureDetails.peptides.length > 0) {
        featureDetails.glycans = featureDetails.peptides.map(peptide => {
          let peptideGlycans = peptide.glycans.map(glycan => {
            return { glycan: glycan };
          });
          return peptideGlycans;
        });
      }
    }
    setFeature(featureDetails);

    return () => {
      //cleanup
    };
  }, [props.feature]);

  return (
    <>
    <Modal
          show={props.showModal}
          animation={false}
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
          dialogClassName="modal-50w"
          centered
          onHide={() => props.setShowModal(false)}
        >
        <Modal.Header closeButton>
      
        
        <Modal.Title>
          {props.showName ? feature.name : ""}
            <Link to={`/slideList/features/viewFeature/${feature.id}`} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon
                        key={"featureView"}
                        icon={["far", "eye"]}
                        alt="View icon"
                        size="sm"
                        color="#45818e"
                        className="tbl-icon-btn"
                        onClick={() => window.open("/slideList/features/viewFeature/" + feature.id, '_blank', 'noopener', 'noreferrer')}
                      />
                      {"View More"}
            </Link>
        </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { feature.type && (
            <>
          <Form.Group as={Row} controlId="featureId" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Feature ID"/>
            <Form.Control type="text" value={feature.internalId} readOnly="true"/>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="Type" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Type"/>
            <Form.Control type="text" value={feature.type} readOnly="true"/>
          </Col>
        </Form.Group>
        </>
          )}
      {feature.linker && (
         <>
          {displayDetails (feature.linker, "view", "Linker Details")}
          {feature.linker.imageURL && (
            <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
              <Col xs={12} lg={9}>
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
      {feature.lipid && (
        displayDetails (feature.lipid, "view", "Lipid")
      )}
      {feature.protein && (
        displayDetails (feature.protein, "view", "Protein")
      )}
      {feature.peptide && (
        displayDetails (feature.peptide, "view", "Peptide")
      )}

{feature.glycans && (
  <>
      <Form.Group as={Row} controlId="glycan">
        <FormLabel label="Attached Glycan(s) Details:" />
      </Form.Group>
      <Form.Group as={Row} controlId="glycanTable">
        <Col className="selected-glycans-review">
          {feature.glycans.length > 0 && (
            <ReactTable
              columns={[
                ...(feature.linker && feature.linker.type !== "SMALLMOLECULE"
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
                  accessor: "glycan.glycan",
                  Cell: row => (row.value ? row.value.glytoucanId : ""),
                },
                {
                  Header: "Name",
                  accessor: "glycan.glycan",
                  Cell: row => (row.value ? row.value.name : ""),
                },
                {
                  Header: "Glycan",
                  accessor: "glycan.glycan",
                  // eslint-disable-next-line react/display-name
                  Cell: (row, index) =>
                    row.value ? (
                      row.value.cartoon ? (
                        <StructureImage key={index} base64={row.value.cartoon}
                        zoom={true}
                        ></StructureImage>
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
      )}
      </Modal.Body>
      </Modal>
    </>
  );
};

FeatureCard.propTypes = {
  feature: PropTypes.object,
  showName: PropTypes.bool
};

export { FeatureCard };
