import React from "react";
import "./Home.css";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import MainFeaturedCard from "../components/MainFeaturedCard";
import mainImg from "../images/main-featured-img.svg";
import TwitterCard from "../components/TwitterCard";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import { Row, Card } from "react-bootstrap";
import VersionCard from "../components/VersionCard";
import { StatisticsCard } from "../components/StatisticsCard";
import { useHistory } from "react-router-dom";
import { DatasetTable } from "../components/DatasetTable";

const Home = () => {
  const history = useHistory();
  console.log(history);

  const mainFeaturedCard = {
    title: "GlyGen Glycan Array Data Repository",
    description:
      "Glycan Array Data Repository is a public repository for the deposition, reporting and sharing of glycan array data. The repository contains both, published and unpublished, datasets. All data is provided under the Creative Commons Attribution 4.0 International (CC BY 4.0) license.",
    image: mainImg,
    linkText: "Learn More…",
    to: ""
  };
  // const [pageLoading, setPageLoading] = useState(false);

  return (
    <>
      <Helmet>
        <title>{head.home.title}</title>
        {getMeta(head.home)}
      </Helmet>

      <div style={{ marginTop: "-8px" }}>
        <MainFeaturedCard post={mainFeaturedCard} />

        <Container maxWidth="xl" className="gg-container" style={{ width: "97%" }}>
          <Row className="show-grid">
            <Grid container spacing={4}>
              <Grid item xs={12} md={8} lg={9}>
                <Grid
                  container
                  spacing={4}
                  style={{
                    justifyContent: "center"
                  }}
                >
                  <Grid item xs={12} sm={12}>
                    <StatisticsCard />
                  </Grid>
                </Grid>

                <Grid container style={{ marginTop: "32px" }}>
                  <Grid item xs={12} sm={12} style={{ backgroundColor: "white" }}>
                    <Card>
                      <DatasetTable wsName="listpublicdataset" showSearchBox="true"/>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={4} lg={3}>
                <Grid
                  container
                  spacing={4}
                  style={{
                    justifyContent: "center"
                  }}
                >
                  <VersionCard data={{}} />
                  {history.location.pathname === "/" && <TwitterCard />}
                </Grid>
              </Grid>
            </Grid>
          </Row>
        </Container>
      </div>
    </>
  );
};

export { Home };
