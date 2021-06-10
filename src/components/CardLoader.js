import React from "react";
import PropTypes from "prop-types";
import LoadingImage from "../images/page_loading.gif";
import Fade from "@material-ui/core/Fade";
import { Row } from "react-bootstrap";

export default function CardLoader(props) {
  return (
    <Fade in={props.pageLoading}>
      <div className={"card-loader-overlay"}>
        <Row className={"card-loader-row"}>
          <img src={LoadingImage} alt="loadingImage" className={"card-loader-image"} />
        </Row>
      </div>
    </Fade>
  );
}

CardLoader.propTypes = {
  pageLoading: PropTypes.bool
};
