import React from "react";
import "../components/PublicationCard.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Row, Col, Table } from "react-bootstrap";

const Grants = props => {
  const getGrantTable = () => {
    return (
      <>
        {props.grants &&
          props.grants.map((grant, grantIndex) => {
            return (
              <Table hover>
                <tbody className="table-body">
                  <tr className="table-row" key={grantIndex}>
                    {getPublicationDisplayTable(grant, grantIndex)}
                  </tr>
                </tbody>
              </Table>
            );
          })}
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
