import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import "../components/StatisticsCard.css";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "./ErrorSummary";
import CardLoader from "./CardLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import microArraySlideIcon from "../images/icons/microArray.svg";
import glycanIcon from "../images/icons/glycan-icon.svg";

const StatisticsCard = () => {
  const [statistics, setStatistics] = useState([]);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    setShowLoading(true);
    wsCall(
      "statistics",
      "GET",
      null,
      false,
      null,
      (response) =>
        response.json().then((responseJson) => {
          setStatistics(responseJson);
          setShowLoading(false);
        }),
      (response) =>
        response.json().then((responseJson) => {
          setPageErrorsJson(responseJson);
          setPageErrorMessage("");
          setShowErrorSummary(true);
          setShowLoading(false);
        })
    );
  }, []);

  const icons = [
    {
      name: "users",
      alt: "Users Icon",
      title: "Users",
      value: statistics.userCount ? statistics.userCount : 0,
    },
    {
      name: "table",
      alt: "Datasets Icon",
      title: "Datasets",
      value: statistics.datasetCount ? statistics.datasetCount : 0,
    },
    {
      name: "slides",
      src: microArraySlideIcon,
      alt: "Micro Array Slide Icon",
      title: "Slides",
      value: statistics.slideCount ? statistics.slideCount : 0,
    },
    {
      name: "vial",
      alt: "Samples Icon",
      title: "Samples",
      value: statistics.sampleCount ? statistics.sampleCount : 0,
    },
    {
      name: "glycans",
      src: glycanIcon,
      alt: "Glycans Icon",
      title: "Glycans",
      value: statistics.glycanCount ? statistics.glycanCount : 0,
    },
  ];

  return (
    <>
      <ErrorSummary
        show={showErrorSummary}
        form="statistics"
        errorJson={pageErrorsJson}
        errorMessage={pageErrorMessage}
      />

      <Card className="gg-card-hover">
        {showLoading ? <CardLoader pageLoading={showLoading} /> : ""}
        <Row>
          {icons.map((icon, index) => {
            return (
              <>
                <Col style={{ textAlign: "-webkit-center" }}>
                  <div className={"statcard-icon-col"}>
                    {icon.title !== "Slides" && icon.title !== "Glycans" ? (
                      <FontAwesomeIcon
                        key={index + "icon"}
                        icon={["fas", icon.name]}
                        title={icon.title}
                        alt={icon.alt}
                        className={"statcard-icon"}
                      />
                    ) : (
                      <img
                        className="statistics-icon"
                        src={icon.src}
                        alt={icon.alt}
                        title={icon.title}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <h2 id="favglyph-description-title" className={"h2-css"}>
                      {`${icon.value}`}
                    </h2>
                    <p
                    // style={{
                    //   fontSize: "16px",
                    // }}
                    >
                      {icon.title}
                    </p>
                  </div>
                </Col>
              </>
            );
          })}
        </Row>
      </Card>
    </>
  );
};

export { StatisticsCard };
