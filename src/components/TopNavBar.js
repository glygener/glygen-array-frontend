/* eslint-disable react/prop-types */
import React from "react";
import "./TopNavBar.css";
import { Link } from "react-router-dom";
import { Nav, Navbar, Col } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import logo from "../images/glygenW_logo.png";
import { BiLogOut } from "react-icons/bi";
import { BiLogIn } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";

const TopNavBar = (props) => {
  return (
    <React.Fragment>
      <Navbar collapseOnSelect5 className="gg-blue topbar" expand="lg">
        <Navbar.Brand>
          <Link to="/">
            <img src={logo} alt="GlyGen logo" />
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-dark" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Col xs={12} sm={12} md={12} lg={6} xl={8}>
            <Nav activeKey={window.location.pathname}>
              <LinkContainer className="gg-nav-link" to="/" exact>
                <Nav.Link>HOME</Nav.Link>
              </LinkContainer>
              {/* Top bar menu links when logged in */}
              {props.loggedInFlag && (
                <LinkContainer className="gg-nav-link" to="/contribute" exact>
                  <Nav.Link>CONTRIBUTE</Nav.Link>
                </LinkContainer>
              )}
              <LinkContainer className="gg-nav-link" to="/data" exact>
                <Nav.Link>DATASETS</Nav.Link>
              </LinkContainer>
            </Nav>
          </Col>
          <Col xs={12} sm={12} md={12} lg={6} xl={4} className="align-right-header">
            <Nav activeKey={window.location.pathname}>
              {/* Top bar right side links when logged in */}
              {props.loggedInFlag && (
                <>
                  <LinkContainer to="/profile" className="gg-nav-link">
                    <Nav.Link>
                      <span style={{ paddingRight: "10px" }}>
                        <FaUser key={"user"} size="16px" className="mb-1" title="user" />
                      </span>
                      PROFILE
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/dummy" className="gg-nav-link">
                    <Nav.Link onClick={props.logoutHandler}>
                      <span style={{ paddingRight: "10px" }}>
                        <BiLogOut key={"logout"} className="mb-1" size="22px" title="logout" />
                      </span>
                      LOG OUT
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
              {/* Top bar right side links when not logged in */}
              {!props.loggedInFlag && (
                <>
                  <LinkContainer to="/login" className="gg-nav-link" exact>
                    <Nav.Link>
                      <span style={{ paddingRight: "10px" }}>
                        <BiLogIn key={"login"} size="22px" className="mb-1" title="login" />
                      </span>
                      LOG IN
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/signup" className="gg-nav-link" exact>
                    <Nav.Link>
                      <span style={{ paddingRight: "10px" }}>
                        <FaUserPlus key={"signup"} size="22px" className="mb-1" title="signup" />
                      </span>
                      SIGN UP
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Col>
        </Navbar.Collapse>
      </Navbar>
    </React.Fragment>
  );
};

export { TopNavBar };
