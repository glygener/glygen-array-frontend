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
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { HelpToolTip } from "../../components/HelpToolTip";
import { withStyles } from "@material-ui/core/styles";

const BlueCheckbox = withStyles({
  root: {
    color: "#979797",
    "&$checked": {
      color: "#2f78b7",
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

export default function GlycanSubstructureSearch(props) {
  let structureSearch = glycanSearchData.structure_search;
  let subStructureSearch = glycanSearchData.sub_structure_search;

  const [inputIdlist, setInputIdlist] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();
  const [reducingEnd, setReducingEnd] = useState({
    reducingEnd: false,
  });

  const handleChange = (event) => {
    setReducingEnd({ ...reducingEnd, [event.target.name]: event.target.checked });
  };

  const { reducingend } = reducingEnd;

  function searchSubstructure(sequenceFormat, sequence, reducingEnd) {
    console.log(sequence, sequenceFormat, reducingEnd);
    wsCall(
      "searchglycansbysubstructure",
      "POST",
      { sequenceFormat },
      { reducingEnd },
      false,
      sequence,
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
    let input_Idlist = inputIdlist;
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
    searchSubstructure(input_Idlist);
  };
  /**
   * Function to set recordtype (molecule) name value.
   * @param {string} value - input recordtype (molecule) name value.
   **/
  const searchSubstructureOnChange = (value) => {};

  return (
    <>
      {showErrorSummary === true && (
        <ErrorSummary
          show={showErrorSummary}
          form="searchglycansbysubstructure"
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
              Search Substructure
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
              // placeholderId={structureSearch.sequence_type.placeholder}
              placeholder={structureSearch.sequence_type.placeholder}
              inputValue={structureSearch.recordType}
              setInputValue={searchSubstructureOnChange}
              Value={searchSubstructureOnChange}
              menu={subStructureSearch.sequence_type.options}
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
              required={true}
              placeholder={structureSearch.sequence.placeholder}
              value={inputIdlist}
              onChange={(e) => setInputIdlist(e.target.value)}
              // error={isInputTouched.idListInput}
            ></OutlinedInput>
          </FormControl>
        </Grid>

        {/* <FormControlLabel
            control={<Checkbox checked={gilad} onChange={handleChange} name="gilad" />}
            label="Reducing end"
          /> */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControlLabel
            control={
              <BlueCheckbox
                name="reducingEnd"
                checked={reducingend}
                onChange={handleChange}
                size="large"
              />
            }
            label="Reducing end"
          />
        </Grid>
      </Grid>
    </>
  );
}
