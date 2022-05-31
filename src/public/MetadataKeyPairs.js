import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Row, Col } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import CardLoader from "../components/CardLoader";

const MetadataKeyPairs = props => {
  const [metadata, setMetadata] = useState();
  const [showloading, setShowloading] = useState(true);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  let simpleDescKeyValues = [];
  let groupDescKeyValues = [];
  let metadataPairs = [];

  useEffect(() => {
    if (!props.metadata) {
      wsCall(
        props.wsCall,
        "GET",
        [props.metadataId],
        false,
        null,
        response =>
          response.json().then(responseJson => {
            setMetadata(responseJson);
            setShowloading(false);
          }),
        errorWscall
      );
    } else {
      setMetadata(props.metadata);
      setShowloading(false);
    }

    function errorWscall(response) {
      response.json().then(responseJson => {
        console.log(responseJson);
        setPageErrorsJson(responseJson);
        setPageErrorMessage("");
        setShowErrorSummary(true);
        setShowloading(false);
      });
    }
  }, []);

  const getMetadataDetails = metadata => {
    const simpleDescs = metadata.descriptors;
    const groupDescs = metadata.descriptorGroups;

    simpleDescKeyValues.push(
      <>
        <Row className="key-value-row" key={"heading"}>
          <Col className="key-value-header">Key</Col>
          <Col className="key-value-header">Value</Col>
        </Row>
      </>
    );

    if (simpleDescs.length > 0) {
      simpleDescs.map(subdesc => {
        subdesc.key && subdesc.key.name && simpleDescKeyValues.push(getPairTable(subdesc.key.name, subdesc.value));
      });
    }

    if (groupDescs.length > 0) {
      let descSubGroupValues = [];

      groupDescs.forEach(descriptor => {
        descriptor.key &&
          descriptor.key.name &&
          descSubGroupValues.push(
            <Row className="key-value-row" key={descriptor.key.name}>
              <Col
                style={{
                  color: "steelblue",
                  fontWeight: "bold",
                  // backgroundColor: "aliceblue",
                  fontSize: "x-large",
                }}
              >
                {descriptor.key.name.toUpperCase()}
              </Col>
            </Row>
          );
        descriptor.descriptors.map(subdesc => {
          if (subdesc.key && subdesc.key.name) {
            if (subdesc.group) {
              descSubGroupValues.push(
                <Row className="key-value-row" key={subdesc.key.name}>
                  <Col
                    style={{
                      color: "steelblue",
                      fontWeight: "bold",
                      // backgroundColor: "aliceblue",
                      fontSize: "x-large",
                      textIndent: "50px",
                    }}
                  >
                    {subdesc.key.name.toUpperCase()}
                  </Col>
                </Row>
              );
              subdesc.descriptors.forEach(subGrouppdesc => {
                descSubGroupValues.push(
                  <span style={{ textIndent: "50px" }}>
                    {getPairTable(subGrouppdesc.key.name, subGrouppdesc.value)}
                  </span>
                );
              });
            } else {
              descSubGroupValues.push(getPairTable(subdesc.key.name, subdesc.value));
            }
          }
        });
      });
      descSubGroupValues.length > 0 && groupDescKeyValues.push(descSubGroupValues);
    }

    metadataPairs = simpleDescKeyValues.concat(groupDescKeyValues);

    return metadataPairs.length > 1 ? metadataPairs : <span>No data available</span>;
  };

  const getPairTable = (name, value) => {
    return (
      <>
        <Row className="key-value-row" key={name + value}>
          <Col className="key-value-pairs" key={value}>
            {name}
          </Col>
          <Col className="key-value-pairs" key={name}>
            {value}
          </Col>
        </Row>
      </>
    );
  };

  if (showErrorSummary) {
    return (
      <ErrorSummary
        show={showErrorSummary}
        form="metadatakeypairs"
        errorJson={pageErrorsJson}
        errorMessage={pageErrorMessage}
      />
    );
  }

  return (
    <>
      <CardLoader pageLoading={showloading} />
      <div>{metadata && getMetadataDetails(metadata)}</div>
    </>
  );
};

MetadataKeyPairs.propTypes = {
  metadataId: PropTypes.string,
  metadata: PropTypes.object,
  wsCall: PropTypes.string,
  setPageErrorsJson: PropTypes.func,
  setPageErrorMessage: PropTypes.func,
  setShowErrorSummary: PropTypes.func
};

export default MetadataKeyPairs;
