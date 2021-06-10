import React from "react";
import "./Loading.css";
import PropTypes from "prop-types";
import { usePromiseTracker } from "react-promise-tracker";
import LoadingImage from "../images/page_loading.gif";

const Loading = props => {
  const { promiseInProgress } = usePromiseTracker();

  return props.show ? (
    <>
      <div className={"-loading -active"}>
        <div className={"-loading-inner"}>
          <div>Loading...</div>
          {/* <Spinner animation="border" role="status" /> */}
        </div>
      </div>
    </>
  ) : (
    promiseInProgress && (
      <div className={"-loading -active"} style={{ marginLeft: "14%" }}>
        <div className={"-loading-inner"}>
          <img src={LoadingImage} alt="loadingImage" className={"card-loader-image"} />
        </div>
      </div>
    )
  );
};

Loading.propTypes = {
  show: PropTypes.bool
};

export { Loading };
