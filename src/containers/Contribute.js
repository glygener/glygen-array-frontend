import React, { useEffect, useState } from "react";
import "./Contribute.css";
import { wsCall } from "../utils/wsUtils";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import Alert from "react-bootstrap/Alert";
import { head, getMeta } from "../utils/head";
import Container from "@material-ui/core/Container";
import { PageHeading } from "../components/FormControls";
import { Loading } from "../components/Loading";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { useHistory } from "react-router-dom";

function ErrorMessage(props) {
  return (
    <Alert variant="danger" show={props.show}>
      {props.message}
    </Alert>
  );
}

function Heading(props) {
  return (
    <Box mb={1}>
      <Typography variant="h6">{props.title}</Typography>
    </Box>
  );
}

function StatisticsCard(props) {
  const history = useHistory();

  return (
    <Card
      onClick={() => history.push(props.link)}
      style={{
        height: "100%",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        className="text-center"
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          paddingBottom: 8,
        }}
      >
        <Typography>{props.title}</Typography>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
            paddingTop: 8,
          }}
        >
          {props.keys && props.keys.length > 0 ? (
            <div>
              {props.keys.map(item => (
                <Typography key={item.value}>
                  <Typography variant="h6" style={{ display: "inline" }}>
                    {props.data[item.value]}
                  </Typography>{" "}
                  ({item.name})
                </Typography>
              ))}
            </div>
          ) : (
            <Typography variant="h6">{props.data[props.value]}</Typography>
          )}
        </div>
      </CardContent>
      <CardActions className="gg-align-center">
        <Button size="small" style={{ color: "var(--gg-blue)" }}>
          Explore
        </Button>
      </CardActions>
    </Card>
  );
}

const sections = [
  {
    name: "Experiments",
    items: [
      {
        title: "Dataset",
        keys: [
          { name: "Total", value: "datasetCount" },
          { name: "Public", value: "publicDatasetCount" },
        ],
        link: "/experiments",
      },
    ],
  },
  {
    name: "Preparation",
    items: [
      { title: "Sample", value: "sampleCount", link: "/samples" },
      {
        title: "Slides",
        keys: [
          { name: "Total", value: "slideCount" },
          { name: "Public", value: "publicSlideCount" },
        ],
        link: "/slides",
      },
    ],
  },
  {
    name: "Molecules",
    items: [
      { title: "Glycan", value: "glycanCount", link: "/glycans" },
      { title: "Peptide", value: "peptideCount", link: "/peptides" },
      { title: "Protein", value: "proteinCount", link: "/proteins" },
      { title: "Lipid", value: "lipidCount", link: "/lipids" },
      { title: "Linker", value: "linkerCount", link: "/linkers" },
    ],
  },
];

const defaultErrorMessage = "An unidentified error has occurred. Please be patient while we investigate this.";

const Contribute = props => {
  useEffect(props.authCheckAgent);
  const [statistics, setStatistics] = useState({});
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    setShowLoading(true);
    wsCall(
      "statisticscontribute",
      "GET",
      null,
      true,
      null,
      response => {
        console.log("success", response);
        response.json().then(responseJson => {
          setStatistics(responseJson);
          setShowLoading(false);
          setHasError(false);
          setErrorMessage("");
        });
      },
      error => {
        console.log("error", error);
        error.json().then(errorJson => {
          setShowLoading(false);
          setErrorMessage(defaultErrorMessage);
          setHasError(true);
        });
      }
    );
  }, []);

  return (
    <>
      <Helmet>
        <title>{head.contribute.title}</title>
        {getMeta(head.contribute)}
      </Helmet>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Glycan Array Data"
            subTitle="Please select one of the options on the left or bellow‚ to contribute your data to the repository."
          />

          <ErrorMessage show={hasError} message={errorMessage} />

          {showLoading && <Loading show={showLoading} />}

          {Object.keys(statistics).length > 0 &&
            sections.map(section => (
              <Box key={section.name} mb={3}>
                <Heading title={section.name} />
                <Grid container spacing={4}>
                  {section.items.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <StatisticsCard data={statistics} {...item} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
        </div>
      </Container>
    </>
  );
};

Contribute.propTypes = {
  authCheckAgent: PropTypes.func,
};

export { Contribute };
