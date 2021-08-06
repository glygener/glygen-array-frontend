import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import { Row } from "react-bootstrap";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Button from "react-bootstrap/Button";
import "../App.css";
/**
 * Glycan General search control.
 **/

/**
 * Function to clear input field values.
 **/
const clearGlycan = () => {};
const searchGlycanGeneralClick = () => {};

export default function GlycanGeneralSearch(props) {
  return (
    <>
      <Grid container style={{ margin: "0  auto" }} spacing={3} justify="center">
        {/* Buttons Top */}
        <Grid item xs={12} sm={10}>
          <Row className="gg-align-center">
            <Button className="gg-btn-outline gg-mr-40" onClick={clearGlycan}>
              Clear Fields
            </Button>
            <Button className="gg-btn-blue" onClick={searchGlycanGeneralClick}>
              Search Glycan
            </Button>
          </Row>
        </Grid>
        <p>GlycanGeneralSearch is comiing</p>
      </Grid>
    </>
  );
}
