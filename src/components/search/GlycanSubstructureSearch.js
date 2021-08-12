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
const subStructureSearch = glycanSearchData.sub_structure_search;

export default function GlycanSubstructureSearch(props) {
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  const [inputValues, setInputValues] = React.useReducer(
    (state, payload) => ({ ...state, ...payload }),
    {
      sequence: "",
      sequenceFormat: "",
      reducingEnd: false,
    }
  );

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
      if (inputValues.sequence === "") {
        setErrors({ sequence: true });
      } else {
        setErrors({ sequence: false });
      }
    },
    sequenceFormat: () => {
      if (inputValues.sequenceFormat === "") {
        setErrors({ sequenceFormat: true });
      } else {
        setErrors({ sequenceFormat: false });
      }
    },
  };

  React.useEffect(() => {
    validate.sequence();
  }, [inputValues.sequence]);

  React.useEffect(() => {
    validate.sequenceFormat();
  }, [inputValues.sequenceFormat]);

  const isValid = () =>
    Object.values(touched).some((touched) => touched === true) &&
    Object.values(errors).every((error) => error === false);

  const searchSubstructure = (sequence, sequenceFormat, reducingEnd) => {
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
  const clearStructure = () => {
    setInputValues({
      sequence: "",
      sequenceFormat: "",
      reducingEnd: false,
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
    const { sequence, sequenceFormat, reducingEnd } = inputValues;
    searchSubstructure(sequence, sequenceFormat, reducingEnd);
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
            <Button className="gg-btn-blue" disabled={!isValid()} onClick={searchGlycanStrClick}>
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
              placeholderId={structureSearch.sequence_type.placeholderId}
              placeholder={structureSearch.sequence_type.placeholder}
              inputValue={inputValues.sequenceFormat}
              setInputValue={(value) => setInputValues({ sequenceFormat: value })}
              menu={subStructureSearch.sequence_type.options}
              error={touched.sequenceFormat && errors.sequenceFormat}
              onBlur={() => setTouched({ sequenceFormat: true })}
              required={true}
            />
            {touched.sequenceFormat && errors.sequenceFormat && (
              <p>This is sequence format error</p>
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
              value={inputValues.sequence}
              onBlur={() => setTouched({ sequence: true })}
              error={touched.sequence && errors.sequence}
              onChange={(e) => setInputValues({ sequence: e.target.value })}
              // error={isInputTouched.idListInput}
            ></OutlinedInput>
            {touched.sequence && errors.sequence && <p>This is sequence error</p>}
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
                checked={inputValues.reducingEnd}
                onChange={(e) => setInputValues({ reducingEnd: e.target.checked })}
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
