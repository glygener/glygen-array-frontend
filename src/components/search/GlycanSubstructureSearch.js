import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
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
import { HelpToolTip } from "../tooltip/HelpToolTip";
import { withStyles } from "@material-ui/core/styles";
import FormHelperText from "@material-ui/core/FormHelperText";
import ExampleSequenceControl from "../ExampleSequenceControl";
import { Loading } from "../Loading";
import GlycoGlyph from "./GlycoGlyph";

const BlueCheckbox = withStyles({
  root: {
    color: "#979797",
    "&$checked": {
      color: "#2f78b7",
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

const structureSearch = glycanSearchData.structure_search;
const subStructureSearch = glycanSearchData.sub_structure_search;

export default function GlycanSubstructureSearch(props) {
  const history = useHistory();
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();
  const [showLoading, setShowLoading] = useState(false);
  const [glycoGlyphDialog, setGlycoGlyphDialog] = useState(false);

  const [inputValue, setInputValue] = React.useReducer((state, payload) => ({ ...state, ...payload }), {
    sequence: "",
    sequenceFormat: "",
    reducingEnd: false,
    glycoGlyphName: "",
  });

  const [touched, setTouched] = React.useReducer((state, payload) => ({ ...state, ...payload }), {
    sequence: false,
    sequenceFormat: false,
  });

  const [errors, setErrors] = React.useReducer((state, payload) => ({ ...state, ...payload }), {
    sequence: false,
    sequenceFormat: false,
  });

  const validate = {
    sequence: () => {
      if (inputValue.sequence === "" || inputValue.sequence.length > subStructureSearch.sequence.length) {
        setErrors({ sequence: true });
      } else {
        setErrors({ sequence: false });
      }
    },
    sequenceFormat: () => {
      if (inputValue.sequenceFormat === "") {
        setErrors({ sequenceFormat: true });
      } else {
        setErrors({ sequenceFormat: false });
      }
    },
  };

  /**
   * Function to set glycan sequence value.
   * @param {string} inputGlySequence - input glycan sequence value.
   **/
  function glySequenceChange(inputGlySequence) {
    setInputValue({ sequence: inputGlySequence, glycoGlyphName: "", sequenceFormat: "GlycoCT" });
    setTouched({ sequence: true });
  }

  React.useEffect(() => {
    validate.sequence();
  }, [inputValue.sequence]);

  React.useEffect(() => {
    validate.sequenceFormat();
  }, [inputValue.sequenceFormat]);

  const isValid = () =>
    Object.values(touched).some((touched) => touched === true) &&
    Object.values(errors).every((error) => error === false);

  const searchSubstructure = (sequence, sequenceFormat, reducingEnd) => {
    setShowLoading(true);
    wsCall(
      "searchglycansbysubstructure",
      "POST",
      { sequenceFormat, reducingEnd },
      false,
      sequence,
      glycanSearchSuccess,
      glycanSearchFailure
    );
  };

  const glycanSearchSuccess = (response) => {
    response.text().then((searchId) => history.push("/glycanList/" + searchId));
    setShowLoading(false);
  };

  const glycanSearchFailure = (response) => {
    response.json().then((resp) => {
      console.log(resp);
      if (resp.statusCode === 404) {
        setPageErrorsJson(null);
        setPageErrorMessage("No search result found.");
        setShowErrorSummary(true);
        return;
      }
      if (resp.statusCode === 400) {
        setPageErrorsJson(null);
        setPageErrorMessage("Invalid sequence for selected sequence type. Please correct it and try again.");
        setShowErrorSummary(true);
        return;
      }
      setPageErrorsJson(resp);
      setShowErrorSummary(true);
    });
    setShowLoading(false);
  };

  /**
   * Function to clear input field values.
   **/
  const clearStructure = () => {
    setShowErrorSummary(false);
    setInputValue({
      sequence: "",
      sequenceFormat: "",
      reducingEnd: false,
      glycoGlyphName: "",
    });
    setTouched({
      sequence: false,
      sequenceFormat: false,
    });

    setErrors({
      sequence: false,
      sequenceFormat: false,
    });
  };

  const searchGlycanStrClick = () => {
    const { sequence, sequenceFormat, reducingEnd } = inputValue;
    searchSubstructure(sequence, sequenceFormat, reducingEnd);
  };

  useEffect(() => {
    if (props.searchData && props.searchData.type === "SUBSTRUCTURE") {
      const { sequence, format, reducingEnd } = props.searchData.input.structure;
      setInputValue({
        sequence,
        sequenceFormat: format,
        reducingEnd,
      });
      setTouched({
        sequence: true,
        sequenceFormat: true,
        reducingEnd: true,
      });
    }
  }, [props.searchData]);

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
      <GlycoGlyph
        show={glycoGlyphDialog}
        glySequenceChange={glySequenceChange}
        glySequence={inputValue.sequence}
        setInputValue={setInputValue}
        inputValue={inputValue}
        title={"GlycoGlyph"}
        setOpen={(input) => {
          setGlycoGlyphDialog(input)
        }}
      />
      <Grid container style={{ margin: "0  auto" }} spacing={3} justify="center">
        {/* Buttons Top */}
        <Grid item xs={12} sm={10}>
          <Row className="gg-align-center">
            <Button className="gg-btn-blue mr-4" onClick={() => setGlycoGlyphDialog(true)}>
              Draw with Glyco Glyph
            </Button>
            <Button className="gg-btn-outline gg-mr-40" onClick={clearStructure}>
              Clear Fields
            </Button>
            <Button className="gg-btn-blue" disabled={!isValid()} onClick={searchGlycanStrClick}>
              Search Substructure
            </Button>
          </Row>
        </Grid>
        {/* Sequence Type */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpToolTip
                title={structureSearch.sequence_type.tooltip.title}
                text={structureSearch.sequence_type.tooltip.text}
              />
              Sequence Type
            </Typography>
            <SelectControl
              placeholderId={subStructureSearch.sequence_type.placeholderId}
              placeholder={subStructureSearch.sequence_type.placeholder}
              inputValue={inputValue.sequenceFormat}
              setInputValue={(value) => {
                setInputValue({ sequenceFormat: value, sequence: "" });
                setTouched({ sequence: false });
              }}
              menu={subStructureSearch.sequence_type.options}
              error={touched.sequenceFormat && errors.sequenceFormat}
              onBlur={() => setTouched({ sequenceFormat: true })}
              required={true}
            />
            {touched.sequenceFormat && errors.sequenceFormat && (
              <FormHelperText error>{subStructureSearch.sequence_type.requiredText}</FormHelperText>
            )}
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
              value={inputValue.sequence}
              onBlur={() => setTouched({ sequence: true })}
              error={touched.sequence && errors.sequence}
              onChange={(e) => {
                setTouched({ sequence: true });
                setInputValue({ sequence: e.target.value });
              }}
            ></OutlinedInput>
            {touched.sequence && inputValue.sequence.length === 0 && (
              <FormHelperText error>{subStructureSearch.sequence.requiredText}</FormHelperText>
            )}
            {touched.sequence && inputValue.sequence.length > subStructureSearch.sequence.length && (
              <FormHelperText error>{subStructureSearch.sequence.errorText}</FormHelperText>
            )}
            {inputValue.sequenceFormat && (
              <ExampleSequenceControl
                setInputValue={(id) => {
                  setInputValue({ sequence: id });
                }}
                inputValue={subStructureSearch.sequence[inputValue.sequenceFormat].examples}
              />
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControlLabel
            control={
              <BlueCheckbox
                name="reducingEnd"
                checked={inputValue.reducingEnd}
                onChange={(e) => setInputValue({ reducingEnd: e.target.checked })}
                size="large"
              />
            }
            label="Reducing end"
          />
        </Grid>
      </Grid>
      <Loading show={showLoading} />
    </>
  );
}
