import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import CardLoader from "../components/CardLoader";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "./ErrorSummary";
import { Card } from "react-bootstrap";
import "../components/VersionCard.css";
import { getDateMMDDYYYY } from "../utils/commonUtils";

const useStyles = makeStyles(() => ({
  cardAction: {
    display: "inline-flex",
  },
  card: {
    // display: 'flex'
    // maxWidth: 345
    // width: '100%'
  },
  cardTitle: {
    textAlign: "center",
  },
  cardDetails: {
    flex: 1,
  },
}));

export default function VersionCard(props) {
  const [versionData, setVersionData] = useState({});
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
          // console.log(responseJson);
          setShowLoading(false);
          var verData = {};
          // alert(JSON.stringify(responseJson));
          responseJson.version.forEach((verObj) => {
            verData[verObj.component] = {
              version: verObj.version,
              releaseDate: verObj.releaseDate,
            };
          });
          setVersionData(verData);
        }),
      (response) =>
        response.json().then((responseJson) => {
          setPageErrorsJson(responseJson);
          setPageErrorMessage("");
          setShowErrorSummary(true);
        })
    );
  }, []);

  const classes = useStyles();

  return (
    <>
      <ErrorSummary
        show={showErrorSummary}
        form="version"
        errorJson={pageErrorsJson}
        errorMessage={pageErrorMessage}
      />
      <Grid item xs={12} sm={6} md={12}>
        <Card className="gg-card-hover">
          {showLoading ? <CardLoader pageLoading={showLoading} /> : ""}
          <div className={classes.cardDetails}>
            <CardContent>
              <h4 className={classes.cardTitle}>Version</h4>
              <span>
                <strong>Portal: &nbsp;</strong>
              </span>
              {versionData.Portal &&
                versionData.Portal.version +
                  " (" +
              versionData.Portal.releaseDate +
                  ")"}
              <br />
              <span>
                <strong>Api: &nbsp;</strong>
              </span>
              {versionData.API &&
                versionData.API.version + " (" + versionData.API.releaseDate + ")"}
            </CardContent>
          </div>
        </Card>
      </Grid>
    </>
  );
}

VersionCard.propTypes = {
  data: PropTypes.object,
  pageLoading: PropTypes.bool,
};
