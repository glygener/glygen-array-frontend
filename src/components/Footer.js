import React from "react";
import { Link } from "react-router-dom";
import logoFooter from "../images/glygen-logoW-top.svg";
// import ugaLogo from "../../images/univ_logos/logo-uga.svg";
// import gwuLogo from "../../images/univ_logos/logo-gwu.svg";
import { Navbar, Col, Image, Row } from "react-bootstrap";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import "../App.css";
// import logo from "../images/glygenW_logo.png";

const useStyles = makeStyles((theme) => ({
  navbarText: {
    color: "#fff !important",
  },
  link: {
    color: "#afd9fd !important",
    "&:hover": {
      color: "#57affa !important",
    },
  },
  univLogo: {
    padding: "10px",
  },
  footerUnivLogo: {
    padding: "20px 10px 0 10px",
  },
}));

export default function Footer() {
  const classes = useStyles();
  return (
    <React.Fragment>
      <div className="gg-blue-bg gg-align-center gg-footer align-right-header">
        <Container maxWidth="xl" className="justify-content-center align-right-header">
          <Row className="text-center justify-content-center">
            <Col md={"auto"}>
              <Navbar.Brand>
                <Link to="/">
                  <img className="justify-content-center" src={logoFooter} alt="GlyGen logo" />
                </Link>
              </Navbar.Brand>
            </Col>
            <Box display="flex" alignItems="center" className="box-footer align-right-header">
              <Col md={"auto"}>
                <Navbar.Text className={classes.navbarText}>
                  GlyGen is supported and funded by the{" "}
                  <a
                    href="https://commonfund.nih.gov/glycoscience"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.link}
                  >
                    NIH Glycoscience Common Fund{" "}
                  </a>
                  under the grant #{" "}
                  <a
                    href="https://reporter.nih.gov/project-details/9942478"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.link}
                  >
                    1U01GM125267&nbsp;-&nbsp;01
                  </a>
                </Navbar.Text>
              </Col>
            </Box>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}
