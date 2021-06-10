/* eslint-disable react/prop-types */
import React from "react";
import "./TopNavBar.css";
import { Link } from "react-router-dom";
import { Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import logo from "../images/glygenW_logo.png";

const TopNavBar = props => {
  return (
    <Navbar collapseOnSelect className="navbar">
      <Navbar.Brand>
        <Link className="brand-link" to="/">
          <img src={logo} alt="Glygen" />
        </Link>
      </Navbar.Brand>

      {/* Top bar menu links to Home Page */}
      <LinkContainer className={"nav-link-container"} to="/" exact>
        <Nav.Link>Home</Nav.Link>
      </LinkContainer>

      {/* Top bar menu links when logged in */}
      {props.loggedInFlag && (
        <LinkContainer className={"nav-link-container"} to="/contribute">
          <Nav.Link>Contribute</Nav.Link>
        </LinkContainer>
      )}
      <LinkContainer className={"nav-link-container"} to="/data">
        <Nav.Link>Browse Data</Nav.Link>
      </LinkContainer>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav variant="pills" className="ml-auto" activeKey={window.location.pathname}>
          {/* <Form inline>
              <FormControl type="text" placeholder="Search" className="mr-sm-2" />
            </Form> */}
          {/* Top bar right side links when logged in */}
          {props.loggedInFlag && (
            <>
              <LinkContainer to="/profile" className={"nav-link-container"}>
                <Nav.Link>Profile</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/dummy" className={"nav-link-container"}>
                <Nav.Link onClick={props.logoutHandler}>Log Out</Nav.Link>
              </LinkContainer>
            </>
          )}
          {/* Top bar right side links when not logged in */}
          {!props.loggedInFlag && (
            <>
              <LinkContainer to="/login" className={"nav-link-container"} exact>
                <Nav.Link>Log In</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/signup" className={"nav-link-container"} exact>
                <Nav.Link>Sign Up</Nav.Link>
              </LinkContainer>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export { TopNavBar };
