import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Row } from "react-bootstrap";
import FormControl from "@material-ui/core/FormControl";
import Button from "react-bootstrap/Button";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import "../../css/Search.css";
import glycanSearchData from "../../appData/glycanSearch";
import { wsCall } from "../../utils/wsUtils";
import { ErrorSummary } from "../../components/ErrorSummary";
import SelectControl from "./SelectControl";
import { HelpToolTip } from "../tooltip/HelpToolTip";

const getCommaSeparatedValues = (value) => {
  if (typeof value !== "string") return "";

  value = value.trim();
  value = value.replace(/\u200B/g, "");
  value = value.replace(/\u2011/g, "-");
  value = value.replace(/\s+/g, ",");
  value = value.replace(/,+/g, ",");
  var index = value.lastIndexOf(",");
  if (index > -1 && index + 1 === value.length) {
    value = value.substr(0, index);
  }

  return value;
};

const structureSearch = glycanSearchData.structure_search;

export default function GlycanStructureSearch(props) {
  const [sequence, setSequence] = useState("");
  const [sequenceFormat, setSequenceFormat] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  const searchGlycan = (sequence, sequenceFormat) => {
    wsCall(
      "searchglycansbystructure",
      "POST",
      { sequenceFormat },
      false,
      sequence,
      glycanSearchSuccess,
      glycanSearchFailure
    );
  };

  const glycanSearchSuccess = (response) => {
    response.json().then((resp) => {
      console.log(resp);
    });
  };

  const glycanSearchFailure = (response) => {
    response.json().then((resp) => {
      console.log(resp);
      setPageErrorsJson(resp);
      setShowErrorSummary(true);
      setPageErrorMessage("");
    });
  };

  /**
   * Function to clear input field values.
   **/
  const clearStructure = () => {};
  const searchGlycanStrClick = () => {
    searchGlycan(sequence, sequenceFormat);
  };
  /**
   * Function to set recordtype (molecule) name value.
   * @param {string} value - input recordtype (molecule) name value.
   **/
  const searchStructureOnChange = (value) => {};

  return (
    <>
      {showErrorSummary === true && (
        <ErrorSummary
          show={showErrorSummary}
          form="searchglycansbystructure"
          errorJson={pageErrorsJson}
          errorMessage={pageErrorMessage}
        />
      )}
      <Grid container style={{ margin: "0  auto" }} spacing={3} justify="center" className="mb-4">
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
          <FormControl
            fullWidth
            variant="outlined"
            // error={isInputTouched.recordTypeInput && !moleculeValidated}
          >
            <Typography className={"search-lbl"} gutterBottom>
              <HelpToolTip
                title={structureSearch.sequence_type.tooltip.title}
                text={structureSearch.sequence_type.tooltip.text}
              />
              Sequence Type
            </Typography>
            <SelectControl
              placeholderId={structureSearch.sequence_type.placeholderId}
              placeholder={structureSearch.sequence_type.placeholder}
              inputValue={sequenceFormat}
              setInputValue={setSequenceFormat}
              Value={searchStructureOnChange}
              menu={structureSearch.sequence_type.options}
              required={true}
            />
          </FormControl>
        </Grid>
        {/* Sequence */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpToolTip
                title={structureSearch.sequence.tooltip.title}
                text={structureSearch.sequence.tooltip.text}
              />
              Sequence
            </Typography>
            <OutlinedInput
              fullWidth
              multiline
              rows="3"
              required={true}
              placeholder={structureSearch.sequence.placeholder}
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              // error={isInputTouched.idListInput}
            ></OutlinedInput>
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}
