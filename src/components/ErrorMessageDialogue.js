import React from "react";
import "../components/ErrorSummary.css";
import PropTypes from "prop-types";
import { ErrorSummary } from "../components/ErrorSummary";
import { Button, Modal } from "react-bootstrap";

const ErrorMessageDialogue = props => {
  return (
    <>
    <Modal
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={props.showErrorSummary}
      onHide={() => props.setShowErrorSummary(false)}
    >
      <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">{props.title ? props.title : "Errors"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ErrorSummary
          show={props.showErrorSummary}
          showText={true}
          form={props.form}
          customMessage={props.customMessage}
          errorJson={props.pageErrorsJson}
          errorMessage={props.pageErrorMessage}
            titleMessage={props.titleMessage}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button className="gg-btn-blue-reg" onClick={() => props.setShowErrorSummary(false)}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  </>
  );
};

ErrorMessageDialogue.propTypes = {
  showErrorSummary: PropTypes.bool,
  setShowErrorSummary: PropTypes.func,
  form: PropTypes.string,
  pageErrorsJson: PropTypes.object,
  pageErrorMessage: PropTypes.string,
  title: PropTypes.string,
  titleMessage: PropTypes.string
};

export { ErrorMessageDialogue };
