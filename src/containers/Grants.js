import React from "react";
import "../components/PublicationCard.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Row, Col, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Button } from "@material-ui/core";

const Grants = props => {
  const getGrantTable = () => {
    return (
      <>
        <div className="text-center mt-2 mb-4">
          <Link to={`/experiments/addExperiment/addGrant/${props.experimentId}`}>
            <Button className="gg-btn-blue btn-to-lower"> Add Grant</Button>
          </Link>
        </div>

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
        <td key={grantIndex}>
          <div>
            <h5>
              <a href={grant.url} target={"_blank"}>
                <strong>{grant.title}</strong>
              </a>
            </h5>
          </div>

          <div>
            <Row>
              <Col md={3}>{grant.fundingOrganization}</Col>
              <Col>{grant.identifier}</Col>
            </Row>
          </div>
        </td>
        <td className="text-right">
          <FontAwesomeIcon
            icon={["far", "trash-alt"]}
            size="lg"
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
