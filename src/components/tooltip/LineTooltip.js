import React from "react";
import { PropTypes } from "prop-types";
import { Tooltip } from "@material-ui/core";
import HelpOutline from "@material-ui/icons/HelpOutline";
import "../../css/HelpToolTip.css";
// Changed file name from HelpTooltip to HelpToolTip

const LineTooltip = props => {
  const { text, children } = props;

  return (
    <>
      <Tooltip
        disableTouchListener
        interactive
        arrow
        placement={"bottom-start"}
        classes={{ tooltip: "gg-tooltip" }}
        title={<>{text}</>}
      >
        {children ? children : <HelpOutline className={props.helpIcon ? props.helpIcon : "gg-helpicon"} />}
      </Tooltip>
      {(text === undefined || props.text === "") && <div>{children}</div>}
    </>
  );
};

LineTooltip.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export { LineTooltip };
