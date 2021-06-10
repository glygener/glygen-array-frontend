import React from "react";
import "../components/PublicationCard.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Row, Col, Table, ButtonToolbar } from "react-bootstrap";
import { Link } from "react-router-dom";

const Grants = props => {
  const getGrantTable = () => {
    return (
      <>
        <ButtonToolbar>
          <Link
            to={`/experiments/addExperiment/addGrant/${props.experimentId}`}
            className="link-button"
            style={{ width: "10%", marginBottom: "10px" }}
          >
            Add Grant
          </Link>
        </ButtonToolbar>

        <Table hover>
          <tbody className="table-body">
            {!props.grants || props.grants.length < 1 ? (
              <tr className="table-row" key={"nodata"}>
                <td>
                  <p className="no-data-msg-publication">No data available.</p>
                </td>
              </tr>
            ) : (
              props.grants &&
              props.grants.map((grant, grantIndex) => {
                return (
                  <tr className="table-row" key={grantIndex}>
                    {getPublicationDisplayTable(grant, grantIndex)}
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </>
    );
  };

  const getPublicationDisplayTable = (grant, grantIndex) => {
    return (
      <>
        <td key={grantIndex} style={{ paddingLeft: "35px" }}>
          <div
            style={{
              paddingTop: "10px",
              paddingBottom: "4px"
            }}
          >
            <h5 style={{ marginBottom: "3px", fontSize: "1.20rem", textAlign: "left", color: "#4a4a4a" }}>
              <a href={grant.url} target={"_blank"}>
                <strong>{grant.title}</strong>
              </a>
            </h5>
          </div>

          <div
            style={{
              textAlign: "left",
              position: "relative",
              color: "#3f3f3f",
              verticalAlign: "top"
            }}
          >
            <Row>
              <Col md={3} style={{ width: "fit-content" }}>
                {grant.fundingOrganization}
              </Col>
              <Col style={{ textAlign: "left" }}>{grant.identifier}</Col>
            </Row>
          </div>
        </td>
        <td>
          <FontAwesomeIcon
            icon={["far", "trash-alt"]}
            size="xs"
            title="Delete"
            className="caution-color table-btn"
            onClick={() => props.delete(grant.id, props.deleteWsCall)}
          />
        </td>
      </>
    );
  };

  return <>{getGrantTable()}</>;
};

Grants.propTypes = {
  deleteWsCall: PropTypes.string,
  experimentId: PropTypes.string,
  grants: PropTypes.array,
  delete: PropTypes.func
};

export { Grants };
