import React from "react";
import PropTypes from "prop-types";

const GlygenTableRowsInfo = props => {
  var rowMin = props.currentPage * props.pageSize + 1;
  var rowMax = rowMin + Math.min(props.pageSize, props.currentRows) - 1;

  return (
   <div className="table-rows-info">
    <strong>
      <span className="-rowInfo">
        {"Showing "}
        <span className="-rowMin">{rowMin}</span>
        {" - "}
        <span className="-rowMax">{rowMax}</span>
        {" of "}
        <span className="-rowCount">{props.totalRows}</span>
        {" total " + (props.infoRowsText || "rows")}
      </span>
      </strong>
    </div>
  );
};

GlygenTableRowsInfo.propTypes = {
  currentPage: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  currentRows: PropTypes.number.isRequired,
  totalRows: PropTypes.number.isRequired,
  infoRowsText: PropTypes.string
};

export { GlygenTableRowsInfo };
