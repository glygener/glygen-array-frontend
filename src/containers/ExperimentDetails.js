import React, { useState, useReducer, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { FormLabel } from "../components/FormControls";
import { ViewDescriptor } from "../components/ViewDescriptor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LineTooltip } from "../components/tooltip/LineTooltip";

const ExperimentDetails = props => {
  let { experiment, enableExperimentModal } = props;
  const [showDescriptos, setShowDescriptos] = useState(false);

  const getExperimentView = () => {
    return (
      <div>
        {showDescriptos && <ViewDescriptor metadataId={experiment.sampleID ? experiment.sampleID :experiment.sample.id} showModal={showDescriptos} setShowModal={setShowDescriptos} 
          wsCall={ !props.fromPublicDatasetPage ? "getsample" : "getpublicsample"} useToken={ !props.fromPublicDatasetPage ? true : true} name={"Sample"}  isSample={true}/>}
      <div style={{
          overflow: "auto",
          height: "350px",
          width: "100%"
        }}>
        <Form.Group as={Row} controlId={"slide"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Name"} className="required-asterik" />
          </Col>
          <Col xs={12} lg={9}>
            <span>{experiment.name ? experiment.name : ""}</span>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId={"metadata"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Samples"} className="required-asterik" />
          </Col>
          <Col xs={12} lg={9}>
            {experiment.sample ? <LineTooltip text="View Details">
              <Button 
                  className={"lnk-btn lnk-btn-left"}
                  variant="link"
                  onClick={() => {
                    setShowDescriptos(true);
                  }}
                >
                  {experiment.sample.name ? experiment.sample.name :  experiment.sample}
              </Button>
            </LineTooltip> : 
              <span>{"No data available"}</span>
            }
          </Col>
        </Form.Group>
        </div>
        <Row st1yle={{ textAlign: "center" }}  className="mt-3">
          {!props.fromPublicDatasetPage && !props.isPublic && (<>
            <Col style={{ textAlign: "center" }}>
              <Button className="gg-btn-outline mt-2 gg-mr-20"
                onClick={() => {
                  props.setEnableSlideModal(true);
                }}
              >
                Add Slide</Button>
            </Col>
            </>
          )}
        </Row>
      </div>
    );
  };

  return (
    <>
      <div>
      {enableExperimentModal && getExperimentView()}
      </div>
    </>
  );
};

export { ExperimentDetails };
