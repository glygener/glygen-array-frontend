import React, { useState } from "react";
import PropTypes from "prop-types";
import "./StructureImage.css";
import { loadDefaultImage } from "../utils/commonUtils";
import { Modal } from "react-bootstrap";

const StructureImage = props => {
  const [showModal, setShowModal] = useState(false);
  const [img, setImg] = useState("");

  let newStyle = { ...props.style };
  if (props.zoom) {
    newStyle = {
      ...props.style, cursor: 'zoom-in', cursor: '-moz-zoom-in',
      cursor: '-webkit-zoom-in'
    };
  } 

  return (
    <div className="image-container" style={{ overflowX: "scroll" }}>
      {(props.base64 || props.imgUrl || props.style) && (
        <img
          className="structure-image"
          src={props.base64 ? "data:image/png;base64, " + props.base64 : props.imgUrl}
          alt="Glycan img"
          style={newStyle}
          onError={e => {
            loadDefaultImage(e.target, true);
          }}
          onClick={e => {
            props.zoom && displayFullImage(e.target);
          }}
        ></img>)
      }
      {
        showModal && (
          <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={showModal}
            onHide={() => setShowModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                Image
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>{<img src={img} />} </Modal.Body>
            <Modal.Footer></Modal.Footer>
          </Modal>
      )}
    </div>

  );

  function displayFullImage(image) {
    setImg(image.src);
    setShowModal(true);
  }
};

StructureImage.propTypes = {
  base64: PropTypes.string,
  imgUrl: PropTypes.string,
  style: PropTypes.object,
  zoom: PropTypes.bool
};

export { StructureImage };
