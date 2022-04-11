import "../components/PublicationCard.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Row, Col, Button, Table, Modal } from "react-bootstrap";
import { AddGrant } from "./AddGrant";
import CardLoader from "../components/CardLoader";

const Grants = props => {
  const [showLoading, setShowLoading] = useState(false);
  const [showModal, setShowModal] = useState();

  const getGrantModal = () => {
    return (
      <>
        <Modal
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={showModal}
          onHide={() => {
            setShowModal(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Add Grant</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AddGrant
              experimentId={props.experimentId}
              getExperiment={props.getExperiment}
              setShowModal={setShowModal}
            />
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </>
    );
  };

  const getGrantTable = () => {
    return (
      <>
        {props.grants &&
          props.grants.map((grant, grantIndex) => {
            return (
              <Table hover>
                <tbody className="table-body">
                  <tr className="table-row" key={grantIndex}>
                    {grantsTable(grant, grantIndex)}
                  </tr>
                </tbody>
              </Table>
            );
          })}
      </>
    );
  };

  const grantsTable = (grant, grantIndex) => {
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

  return (
    <>
      <div className="text-center mt-2 mb-4">
        <Button
          className="gg-btn-blue"
          onClick={() => {
            setShowModal(true);
          }}
        >
          Add Grant
        </Button>
      </div>

      {showModal && getGrantModal()}

      {getGrantTable()}

      {showLoading ? <CardLoader pageLoading={showLoading} /> : ""}
    </>
  );
};

Grants.propTypes = {
  deleteWsCall: PropTypes.string,
  experimentId: PropTypes.string,
  grants: PropTypes.array,
  delete: PropTypes.func
};

export { Grants };
