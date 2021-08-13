import React from "react";
import { PropTypes } from "prop-types";
import { Tooltip } from "@material-ui/core";
import HelpOutline from "@material-ui/icons/HelpOutline";
import "../../css/HelpToolTip.css";
// Changed file name from HelpTooltip to HelpToolTip

const HelpToolTip = (props) => {
  const { title, url, text } = props;

  return (
    <Tooltip
      disableTouchListener
      interactive
      arrow
      placement={"bottom-start"}
      classes={{
        tooltip: "gg-tooltip",
      }}
      title={
        <>
          <h5>
            <strong>{title + ":"}</strong>
          </h5>
          {text}
          <br />
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer">
              Read More...
            </a>
          )}
        </>
      }
    >
      <HelpOutline className={"gg-helpicon"} />
    </Tooltip>
  );
};

HelpToolTip.propTypes = {
  title: PropTypes.string,
  url: PropTypes.string,
  text: PropTypes.string,
};

export { HelpToolTip };
