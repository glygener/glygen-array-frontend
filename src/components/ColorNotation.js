import React from "react";
import { Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";
import "../components/ColorNotation.css";

const ColorNotation = props => {
  const classnames = ["Selection-X-mark", "color-notation-gray", "color-notation-yellow", "color-notation-orange"];
  const slidelayoutLabels = ["Block Selected", "Empty Blocks", "Filled Blocks", "Blocks with Same Layout"];

  const blocklayoutLabels = [
    "Spots Selected",
    "Spots with No features.",
    "Spots with Features",
    "Spots with Same Group"
  ];

  var getBlockColorNotations = blocklayoutLabels.map((value, index) => {
    if (props.isUpdate && index === 1) {
      return <></>;
    } else {
      return (
        <Row className="row-separation" key={index}>
          <div className={`color-notation ${classnames[index]}`}>
            {index === 0 && <span className={"selection-mark"}>X</span>}
          </div>
          <Col className="color-notation-span">{value}</Col>
        </Row>
      );
    }
  });

  var getSlideColorNotations = slidelayoutLabels.map((value, index) => {
    if (props.isUpdate && index === 1) {
      return <></>;
    } else {
      return (
        <div key={index + " index"}>
          <Row className="row-separation">
            <div className={`color-notation ${classnames[index]}`}>
              {index === 0 && <span className={"selection-mark"}>X</span>}
            </div>
            <Col className="color-notation-span">{value}</Col>
          </Row>
        </div>
      );
    }
  });

  // const getColorNotations = (index, value) => {
  //   return (
  //     <>
  //       <Row className="row-separation" key={index}>
  //         <div className={`color-notation ${classnames[index]}`}>{index === 0 && <span>X</span>}</div>
  //         <Col className="color-notation-span">{value}</Col>
  //       </Row>
  //     </>
  //   );
  // };

  if (props.pageLabels === "slidelayout") {
    return <>{getSlideColorNotations}</>;
  } else if (props.pageLabels === "blocklayout") {
    return <>{getBlockColorNotations}</>;
  }
};

ColorNotation.propTypes = {
  pageLabels: PropTypes.string,
  isUpdate: PropTypes.bool
};
export { ColorNotation };
