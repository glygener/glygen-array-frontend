import React from "react";
import { Form, Button, Col } from "react-bootstrap";
import "./FormControls.css";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Checkbox from "@material-ui/core/Checkbox";
import { withStyles } from "@material-ui/core/styles";

const FormLabel = (props) => {
  FormLabel.propTypes = {
    label: PropTypes.string.isRequired,
    className: PropTypes.string,
  };
  return (
    <Form.Label column md={{ span: 3, offset: 2 }} className={props.className}>
      {props.label}
    </Form.Label>
  );
};

const Feedback = (props) => {
  Feedback.propTypes = {
    message: PropTypes.string.isRequired,
  };
  return (
    <Form.Control.Feedback type="invalid" className={props.className}>
      {props.message}
    </Form.Control.Feedback>
  );
};

const FormButton = (props) => {
  FormButton.propTypes = {
    className: PropTypes.string,
    type: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
  };
  return (
    <Col md={{ span: 2, offset: 5 }} className={props.className}>
      <Button
        type={props.type}
        style={{ width: "100%" }}
        disabled={props.disabled}
        onClick={props.onClick}
      >
        {props.label}
      </Button>
    </Col>
  );
};

const LinkButton = (props) => {
  LinkButton.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  };
  return (
    <Col md={{ span: 2, offset: 5 }} className={props.className}>
      <Link to={props.to} className="link-button">
        {props.label}
      </Link>
    </Col>
  );
};

const RedirectLink = (props) => {
  RedirectLink.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  };
  return (
    <Col md={{ span: 4, offset: 4 }}>
      <Link to={props.to} className={props.className}>
        {props.label}
      </Link>
    </Col>
  );
};

const Title = (props) => {
  Title.propTypes = {
    title: PropTypes.string.isRequired,
  };
  return (
    <div className="content-box-md">
      <h1 className="page-heading">{props.title}</h1>
    </div>
  );
};

const PageHeading = (props) => {
  PageHeading.propTypes = {
    pageHeading: PropTypes.string,
  };
  return (
    <div className="content-box-md text-center">
      <h1 className="page-heading">{props.title}</h1>
      <h6 className={"summary-panel pt-1"}>{props.subTitle} </h6>
    </div>
  );
};
const BlueCheckbox = withStyles({
  root: {
    color: "#979797",
    "&$checked": {
      color: "#2f78b7",
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

export {
  FormLabel,
  Feedback,
  FormButton,
  LinkButton,
  Title,
  RedirectLink,
  PageHeading,
  BlueCheckbox,
};
