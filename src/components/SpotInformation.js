import React from "react";
import PropTypes, { arrayOf } from "prop-types";
import { Popover, Card, Row, Col, Container } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import "./SpotInformation.css";
import { StructureImage } from "./StructureImage";
import { Link } from "react-router-dom";

const SpotInformation = props => {
  const { spotFeaturedCard } = props;
  return (
    <>
      <h4 className="accodion-header" style={{ borderRadius: "none" }}>
        Spot: ({spotFeaturedCard.selectedRow}, {spotFeaturedCard.selectedCol})
      </h4>

      <div className="spot-information-accordions">
        {spotFeaturedCard.selectedFeatures.map((element, index) => {
          return (
            <div key={index}>
              <Accordion defaultActiveKey="0" className="accordion-custom">
                <Card className="card-header-custom">
                  <Accordion.Toggle as={Card.Header} eventKey={index}>
                    {element.feature.name}
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={index} className="accordion-collapse-custom">
                    <Card.Body>
                      <Container>
                        {element.featureConcentration &&
                          (element.featureConcentration.concentration || element.featureConcentration.notReported) && (
                            <Row>
                              <Col>Concentration</Col>
                              {element.featureConcentration.notReported ? (
                                <Col>
                                  {element.featureConcentration.concentration}
                                  &nbsp;{element.featureConcentration.unitlevel}
                                </Col>
                              ) : (
                                <Col>{"Not reported"}</Col>
                              )}
                            </Row>
                          )}

                        {element.featureConcentration && element.featureConcentration.ratio && (
                          <Row>
                            <Col>Ratio</Col>

                            <Col>
                              {element.featureConcentration.ratio}
                              {"%"}
                            </Col>
                          </Row>
                        )}

                        {element.feature && element.feature.linker && (
                          <Row>
                            <Col>Linker</Col>
                            <Col>{element.feature.linker.name}</Col>
                          </Row>
                        )}

                        {element.feature && element.feature.glycans && (
                          <Row
                            style={{
                              border: "1px solid brown"
                            }}
                          >
                            <Col> Glycans</Col>
                            <Col>
                              {element.feature.glycans.map((element, index) =>
                                element.glycan && element.glycan.cartoon ? (
                                  <StructureImage
                                    key={index}
                                    base64={element.glycan.cartoon}
                                    style={{
                                      maxWidth: "100px",
                                      overflow: "scroll"
                                    }}
                                  />
                                ) : (
                                  <div key={index}>
                                    <Col>{"No Image"}</Col>
                                  </div>
                                )
                              )}
                            </Col>
                          </Row>
                        )}

                        {/* <FeatureCard feature={element.feature} showName={false}></FeatureCard> */}
                      </Container>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            </div>
          );
        })}
      </div>
    </>
  );
};
SpotInformation.propTypes = {
  spotFeaturedCard: PropTypes.object
};

const SelectedSpotsBlock = props => {
  const { currentSpotsSelected } = props;
  var spotsSelected = [];
  return (
    <>
      <Popover id="popover-basic" className="popover-custom">
        <Popover.Title as="h3" className="popover-header-custom">
          Spots Selected
        </Popover.Title>
        <Popover.Content className="popover-body-custom5">
          {currentSpotsSelected.map((element, index) => {
            spotsSelected = currentSpotsSelected.filter(
              spot => spot.selectedRow === element.selectedRow && spot.selectedCol === element.selectedCol
            );

            if (element.selectedFeatures.length < 1) {
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: spotsSelected.length > 1 ? "darkgreen" : "white",
                    color: spotsSelected.length > 1 ? "white" : "black",
                    fontSize: "medium"
                  }}
                >
                  ({element.selectedRow} , {element.selectedCol})
                </div>
              );
            }
            return "";
          })}
        </Popover.Content>
      </Popover>
    </>
  );
};
SelectedSpotsBlock.propTypes = {
  currentSpotsSelected: PropTypes.array
};

const SelectedSpotsSlide = props => {
  const { currentSpotsSelected } = props;

  const iterator_obj = currentSpotsSelected.entries();

  var CoOrdinates = [];

  const getSpots = () => {
    for (let ob of iterator_obj) {
      const key = ob[0];
      const value = ob[1];

      var blockSelectedLength = Object.entries(value.blockSelected).length;

      if (
        (blockSelectedLength < 1 && value.selectCount === 0) ||
        (blockSelectedLength > 1 && value.selectCount === 1)
      ) {
        CoOrdinates.push(
          <div key={key}>
            <div
              style={{
                backgroundColor: blockSelectedLength > 1 ? "darkgreen" : "white",
                color: blockSelectedLength > 1 ? "white" : "black",
                fontSize: "medium"
              }}
            >
              ({value.selectedRow} , {value.selectedCol})
            </div>
          </div>
        );
      }
    }
    return CoOrdinates;
  };
  return (
    <>
      <Popover id="popover-basic" className="popover-custom">
        <Popover.Title as="h3" className="popover-header-custom">
          Spots Selected
        </Popover.Title>
        <Popover.Content className="popover-body-custom5">{getSpots()}</Popover.Content>
      </Popover>
    </>
  );
};
SelectedSpotsSlide.propTypes = {
  currentSpotsSelected: PropTypes.object
};

const SpotInformationBlock = props => {
  const { blockCard } = props;

  return (
    <>
      <h3 className="accodion-header">
        Spot:({blockCard.selectedRow},{blockCard.selectedCol} )
      </h3>
      <div className="spot-information-accordions">
        <Accordion defaultActiveKey="0" className="accordion-custom">
          <Card className="card-header-custom">
            <Accordion.Toggle as={Card.Header}>
              Block: &nbsp;
              <Link
                to={`/blockLayouts/editBlock/${blockCard.blockSelected.id}`}
                target="_blank"
                className="custom_link"
              >
                {blockCard.blockSelected.name}
              </Link>
            </Accordion.Toggle>
          </Card>
        </Accordion>
      </div>
    </>
  );
};
SpotInformationBlock.propTypes = {
  blockCard: PropTypes.object,
  spotFeaturedCard: arrayOf(PropTypes.object, PropTypes.array)
};

export { SpotInformation, SelectedSpotsBlock, SelectedSpotsSlide, SpotInformationBlock };
