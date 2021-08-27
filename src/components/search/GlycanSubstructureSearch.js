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

  const [inputValue, setInputValue] = React.useReducer(
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
      if (
        inputValue.sequence === "" ||
        inputValue.sequence.length > subStructureSearch.sequence.length
      ) {
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
    setShowErrorSummary(false);
    setInputValue({
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
    const { sequence, sequenceFormat, reducingEnd } = inputValue;
    searchSubstructure(sequence, sequenceFormat, reducingEnd);
  };

  useEffect(() => {
    if (props.inputValue && props.inputValue.structure) {
      setInputValue({
        sequence: props.inputValue.structure.sequence,
        sequenceFormat: props.inputValue.structure.format,
        reducingEnd: props.inputValue.structure.reducingEnd,
      });
      setTouched({
        sequence: true,
        sequenceFormat: true,
        reducingEnd: true,
      });
    }
  }, [props.inputValue]);

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
              setInputValue={(value) => setInputValue({ sequenceFormat: value })}
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
            {touched.sequence &&
              inputValue.sequence.length > subStructureSearch.sequence.length && (
                <FormHelperText error>{subStructureSearch.sequence.errorText}</FormHelperText>
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
    </>
  );
}
