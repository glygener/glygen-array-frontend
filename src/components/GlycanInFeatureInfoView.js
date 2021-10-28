import React, { useEffect, useReducer } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { FormLabel } from "../components/FormControls";
import { StructureImage } from "./StructureImage";
import { externalizeUrl } from "../utils/commonUtils";
import { Link } from "@material-ui/core";
import { PublicationCard } from "./PublicationCard";
import { ViewSourceInfo } from "./ViewSourceInfo";

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
    debugger;
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
      debugger;
      glycanInfo = props.glycan;
      if (source.type) {
        glycanInfo.source = source;
      }

      setGlycanDetails({ glycan: glycanInfo });
    }
  }, [props]);

  function getSource(sourceInfo) {
    let source = {};
    debugger;

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
      <Form.Group as={Row} controlId="id">
        <FormLabel label="Id" />
        <Col md={4}>
          <Form.Control type="text" plaintext value={glycanDetails.glycan.id} />
        </Col>
      </Form.Group>

      {glycanDetails.glycan.name && (
        <Form.Group as={Row} controlId="name">
          <FormLabel label="Name" />
          <Col md={4}>
            <Form.Control type="text" plaintext value={glycanDetails.glycan.name} />
          </Col>
        </Form.Group>
      )}

      <Form.Group as={Row} controlId="type">
        <FormLabel label="Type" />
        <Col md={4}>
          <Form.Control type="text" plaintext value={glycanDetails.glycan.type} />
        </Col>
      </Form.Group>

      {(glycanDetails.glycan.imageURL || glycanDetails.glycan.cartoon) && (
        <Form.Group as={Row} controlId="image">
          <Col md={{ span: 3, offset: 2 }}>
            <FormLabel label={""} />
          </Col>
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
        <Form.Group as={Row} controlId="mass">
          <FormLabel label="Mass" />
          <Col md={4}>
            <Form.Control type="text" plaintext value={parseFloat(glycanDetails.glycan.mass).toFixed(2)} />
          </Col>
        </Form.Group>
      )}

      {(glycanDetails.glycan.comment || glycanDetails.glycan.description) && (
        <Form.Group as={Row} controlId="comment">
          <FormLabel label="Comment" />
          <Col md={4} rows={5} className="sequence-label-div">
            <Form.Control
              rows={5}
              as="textarea"
              plaintext
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
        <Form.Group as={Row} controlId="urls">
          <FormLabel label="Urls" />
          <Col md={4}>
            {glycanDetails.glycan.urls.map((url, index) => {
              return (
                <li style={{ marginTop: "8px" }} key={index}>
                  <Link
                    style={{ fontSize: "0.9em" }}
                    href={externalizeUrl(url)}
                    target="_blank"
                    rel="external noopener noreferrer"
                  >
                    {url}
                  </Link>
                  <br />
                </li>
              );
            })}
          </Col>
        </Form.Group>
      )}

      {glycanDetails.glycan.papers && glycanDetails.glycan.papers.length > 0 && (
        <Form.Group as={Row} controlId="publications">
          <FormLabel label="Publications" />
          <Col md={4}>
            {glycanDetails.glycan.papers.map(pub => {
              return (
                <li>
                  <PublicationCard key={pub.pubmedId} {...pub} enableDelete={false} />
                </li>
              );
            })}
          </Col>
        </Form.Group>
      )}

      <Form.Group as={Row} controlId="opensRing">
        <FormLabel label="Opens Ring" />
        <Col md={4}>
          <Form.Control type="text" disabled value={glycanDetails.glycan.opensRing} />
        </Col>
      </Form.Group>

      {glycanDetails.glycan.equilibriumComment && (
        <Form.Group as={Row} controlId="equilibriumComment">
          <FormLabel label="Equilibrium Comment" />
          <Col md={4}>
            <Form.Control type="text" disabled value={glycanDetails.glycan.equilibriumComment} />
          </Col>
        </Form.Group>
      )}

      {glycanDetails.glycan.source.type === "NOTRECORDED" ? (
        <Form.Group as={Row} controlId="value">
          <FormLabel label="Source" />
          <Col md={4}>
            <Form.Control type="text" disabled value={"Not Recorded"} />
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
