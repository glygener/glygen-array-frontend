import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import { Row } from "react-bootstrap";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Button from "react-bootstrap/Button";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import "../../App.css";
import "../../css/Search.css";
import glycanSearchData from "../../appData/glycanSearch";
import RangeInputSlider from "./RangeInputSlider";
import HelpTooltip from "../tooltip/HelpTooltip";
import Tooltip from "@material-ui/core/Tooltip";
/**
 * Function to clear input field values.
 **/
const clearGlycan = () => {};
const searchGlycanGeneralClick = () => {};

export default function GlycanAdvancedSearch(props) {
  let advancedSearch = glycanSearchData.advanced_search;
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

        {/* Glycan IDs */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpTooltip
                title={advancedSearch.glycan_id.tooltip.title}
                text={advancedSearch.glycan_id.tooltip.text}
                urlText={advancedSearch.glycan_id.tooltip.urlText}
                url={advancedSearch.glycan_id.tooltip.url}
              />
              Glycan ID
            </Typography>
            <OutlinedInput
              fullWidth
              multiline
              required={true}
              placeholder={advancedSearch.glycan_id.placeholder}
              // value={idMapSearchData.inputIdlist}
              // onChange={inputIdlistOnChange}
              // error={isInputTouched.idListInput}
            ></OutlinedInput>
          </FormControl>
        </Grid>
      {/* Monoisotopic Mass */}
      <Grid item xs={12} sm={10}>
          <FormControl fullWidth>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={9}>
                <Typography className={"search-lbl"} gutterBottom>
                  {/* <HelpTooltip
                    title={commonGlycanData.mass.tooltip.title}
                    text={commonGlycanData.mass.tooltip.text}
                  />
                  {commonGlycanData.mass.name} */}
                  Monoisotopic Mass
                </Typography>
               
              </Grid>
            </Grid>
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}
