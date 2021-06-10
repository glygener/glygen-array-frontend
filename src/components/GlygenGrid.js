import React from "react";
import PropTypes from "prop-types";
import "./GlygenGrid.css";

const GlygenGrid = props => {
  let { gridParams } = props;

  const gridui = () => {
    var grid = [];
    var gridHeader = [];

    for (let i = 0; i <= gridParams.rows; i++) {
      let columns = [];

      if (i === 0) {
        let colHeader = [];
        for (let j = 0; j <= gridParams.cols; j++) {
          if (j === 1 || (j % 10 === 0 && j !== 0)) {
            colHeader.push(
              <th key={j} className="grid-horizonatal-index">
                <div style={{ width: "25px", height: "25px" }}> {j}</div>
              </th>
            );
          } else {
            colHeader.push(
              <th key={j} className={j === 0 ? "" : "grid-horizonatal-index"}>
                <div style={{ width: "25px", height: "25px" }}></div>
              </th>
            );
          }
        }

        gridHeader.push(<tr key={i}>{colHeader}</tr>);
      }

      for (let j = 0; j <= gridParams.cols; j++) {
        if (i !== 0 && j === 0) {
          if (i === 1 || i % 10 === 0) {
            columns.push(
              <td style={{ width: "25px", height: "25px", fontWeight: "bold" }} className="grid-vertical-index" key={j}>
                {i}
              </td>
            );
          } else {
            columns.push(<td style={{ width: "25px", height: "25px" }} className="grid-vertical-index" key={j}></td>);
          }
        } else if (i !== 0) {
          columns.push(
            <td
              style={{
                backgroundColor: props.setBackGroundColor(i, j)
              }}
              className="grid-col"
              onClick={props.selectedArray.bind(this, i, j)}
              key={j}
              title={i + "," + j}
            >
              <span style={{ color: props.selectedColor(i, j) }}>X</span>
            </td>
          );
        }
      }

      grid.push(<tr key={i}>{columns}</tr>);
    }

    return (
      <>
        <table>
          <thead>{gridHeader}</thead>
          <tbody>{grid}</tbody>
        </table>
      </>
    );
  };

  return <>{gridui()}</>;
};

GlygenGrid.propTypes = {
  gridParams: PropTypes.object,
  selectedArray: PropTypes.func,
  setBackGroundColor: PropTypes.func,
  selectedColor: PropTypes.func
};

export { GlygenGrid };
