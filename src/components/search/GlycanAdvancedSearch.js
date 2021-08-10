import React, { useEffect, useState } from "react";
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
import { wsCall } from "../../utils/wsUtils";
import { ErrorSummary } from "../../components/ErrorSummary";
// import searchGlycan from "../../containers/GlycanSearch"


export default function GlycanAdvancedSearch(props) {

  let advancedSearch = glycanSearchData.advanced_search;
  const [inputIdlist, setInputIdlist] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  function searchGlycan(glytoucanIds) {
    wsCall(
      "searchglycans",
      "POST",
      null,
      false,
      {
        glytoucanIds: [glytoucanIds],
        maxMass: 10000,
        minMass: 1,
      },
      glycanSearchSuccess,
      glycanSearchFailure
    );

    function glycanSearchSuccess(response) {
      response.json().then((resp) => {
        console.log(resp);
      });
    }

    function glycanSearchFailure(response) {
      response.json().then((resp) => {
        console.log(resp);
        setPageErrorsJson(resp);
        setShowErrorSummary(true);
        setPageErrorMessage("");
      });
    }
  }

 
/**
 * Function to clear input field values.
 **/
 const clearGlycan = () => {};
 const searchGlycanAdvClick = () => {
   let input_Idlist = inputIdlist
  if (input_Idlist) {
    input_Idlist = input_Idlist.trim();
    input_Idlist = input_Idlist.replace(/\u200B/g, "");
    input_Idlist = input_Idlist.replace(/\u2011/g, "-");
    input_Idlist = input_Idlist.replace(/\s+/g, ",");
    input_Idlist = input_Idlist.replace(/,+/g, ",");
    var index = input_Idlist.lastIndexOf(",");
    if (index > -1 && index + 1 === input_Idlist.length) {
      input_Idlist = input_Idlist.substr(0, index);
    }
  }
 searchGlycan(input_Idlist)
};
  /**
   * Function to set min, max mass values.
   * @param {array} inputMass - input mass values.
   **/
   function glyMassInputChange(inputMass) {
    props.setGlyAdvSearchData({ glyMassInput: inputMass });
  }
    /**
   * Function to set min, max mass values based on slider position.
   * @param {array} inputMass - input mass values.
   **/
     function glyMassSliderChange(inputMass) {
      props.setGlyAdvSearchData({ glyMass: inputMass });
    }


  return (
    <>
     {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="glycansearch"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}
      <Grid container style={{ margin: "0  auto" }} spacing={3} justify="center">
        {/* Buttons Top */}
        <Grid item xs={12} sm={10}>
          <Row className="gg-align-center">
            <Button className="gg-btn-outline gg-mr-40" onClick={clearGlycan}>
              Clear Fields
            </Button>
            <Button className="gg-btn-blue" onClick={searchGlycanAdvClick}>
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
              value={inputIdlist}
              onChange={e => setInputIdlist(e.target.value)}
              // error={isInputTouched.idListInput}
            ></OutlinedInput>
          </FormControl>
        </Grid>
      {/* Monoisotopic Mass */}
      <Grid item xs={12} sm={10}>
          <FormControl fullWidth>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={12}>
                <Typography className={"search-lbl"} gutterBottom>
                  {/* <HelpTooltip
                    title={commonGlycanData.mass.tooltip.title}
                    text={commonGlycanData.mass.tooltip.text}
                  />
                  {commonGlycanData.mass.name} */}
                  Monoisotopic Mass
                </Typography>
                {/* <RangeInputSlider
                  step={10}
                  min={props.inputValue.glyMassRange[0]}
                  max={props.inputValue.glyMassRange[1]}
                  inputClass="gly-rng-input"
                  inputValue={props.inputValue.glyMassInput}
                  setInputValue={glyMassInputChange}
                  inputValueSlider={props.inputValue.glyMass}
                  setSliderInputValue={glyMassSliderChange}
                /> */}
              </Grid>
            </Grid>
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}
