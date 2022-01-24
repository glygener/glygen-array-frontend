import React from "react";
import { Modal } from "react-bootstrap";
import { GlycanInFeatureInfoView } from "./GlycanInFeatureInfoView";
import { linkerDetailsOnModal } from "../containers/FeatureView";

const ViewInfoModal = props => {
  return (
    <>
      <Modal
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={props.enableModal}
        onHide={() => props.setEnableModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
            {props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {props.glycanView ? (
            <GlycanInFeatureInfoView glycan={props.glycanViewInfo} />
          ) : (
            linkerDetailsOnModal(props.linker, props.display)
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export { ViewInfoModal };
