import React, { useState } from "react";
import PropTypes, { arrayOf } from "prop-types";
import { Popover, Card, Row, Col, Container, Button } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import "./SpotInformation.css";
import { FeatureCard } from "../components/FeatureCard";
import { Link } from "react-router-dom";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { ViewDescriptor } from "../components/ViewDescriptor";

const SpotInformation = props => {
  const { spotFeaturedCard } = props;
  const [showFeatureDetails, setShowFeatureDetails] = useState(false);
  const [showDescriptors, setShowDescriptors] = useState(false);
  return (
    <>
      {showDescriptors && <ViewDescriptor metadataId={spotFeaturedCard.metadata.id} metadata={spotFeaturedCard.metadata} showModal={showDescriptors}
        setShowModal={setShowDescriptors}
        wsCall={props.publicView ? "getpublicspotmetadata" : "getspotmetadata"} useToken={props.publicView ? false : true} name={"Spot Metadata"} isSample={false} />}
      <h4 className="accodion-header" style={{ borderRadius: "none" }}>
        Spot: ({spotFeaturedCard.selectedRow}, {spotFeaturedCard.selectedCol})
      </h4>
      
      <div className="spot-information-accordions">

        <Row style={{ textAlign: "left", marginLeft: "2px" }}>
          <Col>Metadata: </Col>
          {spotFeaturedCard.metadata ? (
            <Col>
              <LineTooltip text="View Details">
                <Button
                  className={"lnk-btn lnk-btn-left"}
                  variant="link"
                  onClick={() => {
                    setShowDescriptors(true);
                  }}
                >
                  View
                </Button>
              </LineTooltip>
            </Col>
          ) : (
            <Col>No Data Available</Col>
          )}
        </Row>

        {spotFeaturedCard.selectedFeatures.map((element, index) => {
          return (
            <>


              {element.concentrationInfo &&
                (element.concentrationInfo.concentration || element.concentrationInfo.notReported) && (
                  <Row style={{ textAlign: "left", marginLeft: "2px" }}>
                    <Col>Concentration: </Col>
                    {element.concentrationInfo.notReported ? (
                      <Col>{"Not reported"}</Col>
                    ) : (
                      <Col>
                        {element.concentrationInfo.concentration}
                        &nbsp;{element.concentrationInfo.unitlevel}
                      </Col>
                    )}
                  </Row>
                )}

              {element.concentrationInfo && element.concentrationInfo.ratio && (
                <Row style={{ textAlign: "left", marginLeft: "2px" }}>
                  <Col>Ratio: </Col>
                  <Col>{element.concentrationInfo.ratio}</Col>
                </Row>
              )}

              <Row style={{ textAlign: "left", marginLeft: "2px" }}>
                <Col>Feature: </Col>
                <Col>
                <LineTooltip text="View Details">
                  <Button
                    className={"lnk-btn lnk-btn-left"}
                    variant="link"
                    onClick={() => {
                      setShowFeatureDetails(true);
                    }}
                  >
                      {element.feature.name}
                  </Button>
                </LineTooltip>
                </Col>
              </Row>

              {showFeatureDetails &&
                <FeatureCard feature={element.feature} showModal={showFeatureDetails} setShowModal={setShowFeatureDetails} publicView={props.publicView} showName ></FeatureCard>}
            </>
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
  const { blockCard, publicView } = props;

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
                to={publicView ? `/slideList/blockLayouts/viewBlock/${blockCard.blockSelected.id}` : `/blockLayouts/editBlock/${blockCard.blockSelected.id}`}
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
  publicView: PropTypes.bool,
  spotFeaturedCard: arrayOf(PropTypes.object, PropTypes.array)
};

export { SpotInformation, SelectedSpotsBlock, SelectedSpotsSlide, SpotInformationBlock };
