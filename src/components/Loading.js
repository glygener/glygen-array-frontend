import React from "react";
import "./Loading.css";
import PropTypes from "prop-types";
import { usePromiseTracker } from "react-promise-tracker";
import LoadingImage from "../images/page_loading.gif";

const Loading = props => {
  const { promiseInProgress } = usePromiseTracker();

  return props.show || promiseInProgress ? (
    <>
      <div
        className={"-loading -active"}
        // style={{ marginLeft: props.show ? "14%" : "" }}
      >
        <div className={"-loading-inner"}>
          <img src={LoadingImage} alt="loadingImage" className={"card-loader-image"} />
        </div>
      </div>
    </>
  ) : (
    ""
  );
};

Loading.propTypes = {
  show: PropTypes.bool
};

export { Loading };
