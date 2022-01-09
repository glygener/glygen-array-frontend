import React, { useEffect, useReducer } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { FormLabel } from "../components/FormControls";
import { StructureImage } from "./StructureImage";
import { externalizeUrl } from "../utils/commonUtils";
import { Link } from "@material-ui/core";
import { PublicationCard } from "./PublicationCard";
import { ViewSourceInfo } from "./ViewSourceInfo";
import { getReducingEndState } from "../containers/FeatureView";

const GlycanInFeatureInfoView = props => {
  const glycanInfoInit = {
    glycan: {
      equilibriumComment: "",
      source: {
        type: "",
        commercial: { vendor: "", catalogueNumber: "", batchId: "" },
        nonCommercial: { providerLab: "", batchId: "", method: "", sourceComment: "" }
      }
    }
  };

  const [glycanDetails, setGlycanDetails] = useReducer(
    (oldState, newState) => ({ ...oldState, ...newState }),
    glycanInfoInit
  );

  useEffect(() => {
    let source = {};
    let glycanInfo = {};

    if (
      props.glycan &&
      props.glycan.source &&
      (!props.glycan.source.type || (!props.glycan.source.commercial && !props.glycan.source.nonCommercial))
    ) {
      source = getSource(props.glycan.source);
      source.type = props.glycan.source.type;
    }

    if (props.glycan && props.glycan.reducingEndConfiguration) {
      glycanInfo.glycan = props.glycan.glycan;
      if (source.type) {
        glycanInfo.glycan.source = source;
      }

      glycanInfo.glycan.opensRing = props.glycan.reducingEndConfiguration.type;
      if (props.glycan.reducingEndConfiguration === 4) {
        glycanInfo.glycan.equilibriumComment = props.glycan.equilibriumComment;
      }

      glycanInfo.glycan.urls = props.glycan.urls;
      glycanInfo.glycan.papers = props.glycan.publications;

      setGlycanDetails(glycanInfo);
    } else {
      glycanInfo = props.glycan;
      if (source.type) {
        glycanInfo.source = source;
      }

      setGlycanDetails({ glycan: glycanInfo });
    }
  }, []);

  function getSource(sourceInfo) {
    let source = {};
    if (sourceInfo.type === "COMMERCIAL") {
      let comm = getCommercial(sourceInfo);
      source.commercial = comm;
    } else if (sourceInfo.type === "NONCOMMERCIAL") {
      let nonComm = getNonCommercial(sourceInfo);
      source.nonCommercial = nonComm;
    }

    return source;
  }

  function getNonCommercial(source) {
    let nonComm = {};
    nonComm.providerLab = source.providerLab;
    nonComm.method = source.method;
    nonComm.batchId = source.batchId;
    nonComm.sourceComment = source.comment;

    return nonComm;
  }

  function getCommercial(source) {
    let comm = {};
    comm.vendor = source.vendor;
    comm.catalogueNumber = source.catalogueNumber;
    comm.batchId = source.batchId;

    return comm;
  }

  return (
    <>
      <Form.Group as={Row} controlId="id" className="gg-align-center mb-3">
        <Col xs={12} lg={9}>
          <FormLabel label="ID" />
          <Form.Control type="text" readOnly value={glycanDetails.glycan.id} />
        </Col>
      </Form.Group>

      {glycanDetails.glycan.name && (
        <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Name" />
            <Form.Control type="text" readOnly value={glycanDetails.glycan.name} />
          </Col>
        </Form.Group>
      )}

      <Form.Group as={Row} controlId="type" className="gg-align-center mb-3">
        <Col xs={12} lg={9}>
          <FormLabel label="Type" />
          <Form.Control type="text" readOnly value={glycanDetails.glycan.type} />
        </Col>
      </Form.Group>

      {(glycanDetails.glycan.imageURL || glycanDetails.glycan.cartoon) && (
        <Form.Group as={Row} controlId="image" className="gg-align-center">
          <Col md={4}>
            {glycanDetails.glycan.imageURL ? (
              <StructureImage imgUrl={glycanDetails.glycan.imageURL} />
            ) : (
              <StructureImage base64={glycanDetails.glycan.cartoon} />
            )}
          </Col>
        </Form.Group>
      )}

      {glycanDetails.glycan.mass && (
        <Form.Group as={Row} controlId="mass" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Monoisotopic Mass" />
            <Form.Control type="text" readOnly value={parseFloat(glycanDetails.glycan.mass).toFixed(2)} />
          </Col>
        </Form.Group>
      )}

      {(glycanDetails.glycan.comment || glycanDetails.glycan.description) && (
        <Form.Group as={Row} controlId="comment" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Comment" />
            <Form.Control
              rows={4}
              as="textarea"
              readOnly
              value={
                glycanDetails.glycan.comment
                  ? glycanDetails.glycan.comment
                  : glycanDetails.glycan.description
                  ? glycanDetails.glycan.description
                  : ""
              }
            />
          </Col>
        </Form.Group>
      )}

      {glycanDetails.glycan.urls && glycanDetails.glycan.urls.length > 0 && (
        <Form.Group as={Row} controlId="urls" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="URLs" />
            {glycanDetails.glycan.urls.map((url, index) => {
              return (
                <div className="mb-2" key={index}>
                  <a href={externalizeUrl(url)} target="_blank" rel="external noopener noreferrer">
                    {url}
                  </a>
                </div>
              );
            })}
          </Col>
        </Form.Group>
      )}

      {glycanDetails.glycan.papers && glycanDetails.glycan.papers.length > 0 && (
        <Form.Group as={Row} controlId="publications" className="gg-align-center mb-3 mb-0">
           <Col xs={12} lg={9}>
          <FormLabel label="Publications" />
            {glycanDetails.glycan.papers.map((pub) => {
              return (
                <div>
                  <PublicationCard key={pub.pubmedId} {...pub} enableDelete={false} />
                </div>
              );
            })}
          </Col>
        </Form.Group>
      )}

      <Form.Group as={Row} controlId="opensRing" className="gg-align-center mb-3">
        <Col xs={12} lg={9}>
          <FormLabel label="Anomer/Ring Configuration" />
          <Form.Control
            type="text"
            readOnly
            disabled
            value={
              isNaN(glycanDetails.glycan.opensRing)
                ? glycanDetails.glycan.opensRing
                : getReducingEndState(glycanDetails.glycan.opensRing)
            }
          />
        </Col>
      </Form.Group>

      {glycanDetails.glycan.equilibriumComment && (
        <Form.Group as={Row} controlId="equilibriumComment" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Equilibrium Comment" />
            <Form.Control type="text" readOnly disabled value={glycanDetails.glycan.equilibriumComment} />
          </Col>
        </Form.Group>
      )}

      {glycanDetails.glycan.source.type === "NOTRECORDED" ? (
        <Form.Group as={Row} controlId="value" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Source" />
            <Form.Control type="text" readOnly disabled value={"Not Recorded"} />
          </Col>
        </Form.Group>
      ) : (
        <ViewSourceInfo
          source={glycanDetails.glycan.source.type}
          commercial={glycanDetails.glycan.source.commercial}
          nonCommercial={glycanDetails.glycan.source.nonCommercial}
        />
      )}
    </>
  );
};

export { GlycanInFeatureInfoView };
