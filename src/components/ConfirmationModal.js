import React from "react";
import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";

const ConfirmationModal = props => {
  const handleCancel = () => {
    props.onCancel();
  };

  const handleConfirm = () => {
    props.onConfirm();
  };

  return (
    <Modal show={props.showModal} onHide={handleCancel} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.body}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleConfirm}>
          Ok
        </Button>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  title: PropTypes.string,
  body: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  showModal: PropTypes.bool
};

export { ConfirmationModal };
