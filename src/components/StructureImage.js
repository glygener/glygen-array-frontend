import React from "react";
import PropTypes from "prop-types";
import "./StructureImage.css";
import { loadDefaultImage } from "../utils/commonUtils";

const StructureImage = props => {
  return (
    <div className="image-container" style={{ overflowX: "scroll" }}>
      {(props.base64 || props.imgUrl || props.style) && (
        <img
          className="structure-image"
          src={props.base64 ? "data:image/png;base64, " + props.base64 : props.imgUrl}
          alt="Glycan img"
          style={props.style}
          onError={e => {
            loadDefaultImage(e.target, true);
          }}
        ></img>
      )}
    </div>
  );
};

StructureImage.propTypes = {
  base64: PropTypes.string,
  imgUrl: PropTypes.string,
  style: PropTypes.object
};

export { StructureImage };
