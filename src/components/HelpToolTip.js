import React from "react";
import { PropTypes } from "prop-types";
import { Tooltip } from "@material-ui/core";
import HelpOutline from "@material-ui/icons/HelpOutline";
import "../components/HelpToolTip.css";

const HelpToolTip = props => {
  const { name, url, text } = props;

  return (
    <Tooltip
      disableTouchListener
      interactive
      placement={"bottom-start"}
      classes={{
        tooltip: "gg-tooltip"
      }}
      title={
        <>
          <h5>
            <strong>{name + ":"}</strong>
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
  name: PropTypes.string,
  url: PropTypes.string,
  text: PropTypes.string
};

export { HelpToolTip };
