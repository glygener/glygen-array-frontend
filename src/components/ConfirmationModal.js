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
    <Modal
      show={props.showModal}
      onHide={handleCancel}
      animation={false}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.body}</Modal.Body>
      <Modal.Footer>
        <Button className="gg-btn-outline-reg" onClick={handleCancel}>
          Cancel
        </Button>
        <Button className="gg-btn-blue-reg" onClick={handleConfirm}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  title: PropTypes.string,
  body: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  showModal: PropTypes.bool
};

export { ConfirmationModal };
