import React from "react";
import { Modal, Button } from "react-bootstrap";
import { GlycanInFeatureInfoView } from "./GlycanInFeatureInfoView";

const GlycanInfoViewModal = props => {
  return (
    <>
      <Modal
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={props.enableGlycanViewInfoDialog}
        onHide={() => props.setEnableGlycanViewInfoDialog(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
            Glycan Information
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <GlycanInFeatureInfoView glycan={props.glycanViewInfo} />
        </Modal.Body>
        {/* <Modal.Footer>
          <Button onClick={() => props.setEnableGlycanViewInfoDialog(false)}>Close</Button>
        </Modal.Footer> */}
      </Modal>
    </>
  );
};

export { GlycanInfoViewModal };
