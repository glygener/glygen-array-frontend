import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import { Row } from "react-bootstrap";
import FormControl from "@material-ui/core/FormControl";
import Button from "react-bootstrap/Button";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import "../../css/Search.css";
import glycanSearchData from "../../appData/glycanSearch";
import HelpTooltip from "../tooltip/HelpTooltip";
import Tooltip from "@material-ui/core/Tooltip";
import { wsCall } from "../../utils/wsUtils";
import { ErrorSummary } from "../../components/ErrorSummary";
import SelectControl from "./SelectControl";
// import searchGlycan from "../../containers/GlycanSearch"


export default function GlycanStructureSearch(props) {

  let structureSearch = glycanSearchData.structure_search;

  const [inputIdlist, setInputIdlist] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  function searchStructure(structure, sequence, sequenceFormat) {
    wsCall(
      "searchglycansbystructure",
      "POST",
      null,
      false,
      sequence,
      sequenceFormat,
      {
        structure: {
          format: "GlycoCT",
          reducingEnd: true,
          structure,
        },
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
 const clearStructure = () => {};
 const searchGlycanStrClick = () => {
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
  searchStructure(input_Idlist)
};
/**
   * Function to set recordtype (molecule) name value.
   * @param {string} value - input recordtype (molecule) name value.
   **/
 const searchStructureOnChange = (value) => {}
  
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
            <Button className="gg-btn-outline gg-mr-40" onClick={clearStructure}>
              Clear Fields
            </Button>
            <Button className="gg-btn-blue" onClick={searchGlycanStrClick}>
              Search Structure
            </Button>
          </Row>
        </Grid>
        {/* Sequence Type */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControl fullWidth variant="outlined"
            // error={isInputTouched.recordTypeInput && !moleculeValidated}
          >
            <Typography className={"search-lbl"} gutterBottom>
              
              <HelpTooltip
               title={structureSearch.sequence_type.tooltip.title}
               text={structureSearch.sequence_type.tooltip.text}
               urlText={structureSearch.sequence_type.tooltip.urlText}
               url={structureSearch.sequence_type.tooltip.url}
              />
             Sequence Type
            </Typography>
            <SelectControl
              // placeholderId={structureSearch.sequence_type.placeholder}
              placeholderName={structureSearch.sequence_type.placeholderName}
              inputValue={structureSearch.recordType}
              setInputValue={searchStructureOnChange}
              Value={searchStructureOnChange}
              // onBlur={() => {
              //   setInputTouched({ recordTypeInput: true });
              // }}
              // menu={structureSearch.glycan_identifier.subsumption}
              required={true}
            /> 
          </FormControl>
          
        </Grid>
        {/* Sequence */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpTooltip
                title={structureSearch.sequence.tooltip.title}
                text={structureSearch.sequence.tooltip.text}
                urlText={structureSearch.sequence.tooltip.urlText}
                url={structureSearch.sequence.tooltip.url}
              />
              Sequence
            </Typography>
            <OutlinedInput
              fullWidth
              multiline
              required={true}
              placeholder={structureSearch.sequence.placeholder}
              value={inputIdlist}
              onChange={e => setInputIdlist(e.target.value)}
              // error={isInputTouched.idListInput}
            ></OutlinedInput>
          </FormControl>
        </Grid>
      
      </Grid>
    </>
  );
}
