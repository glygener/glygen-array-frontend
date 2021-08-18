import React, { useState } from "react";
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
import { HelpToolTip } from "../tooltip/HelpToolTip";
import FormHelperText from "@material-ui/core/FormHelperText";


const structureSearch = glycanSearchData.structure_search;

export default function GlycanStructureSearch(props) {
  const history = useHistory() 
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  const [inputValues, setInputValues] = React.useReducer(
    (state, payload) => ({ ...state, ...payload }),
    {
      sequence: "",
      sequenceFormat: "",
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
        inputValues.sequence === "" ||
        inputValues.sequence.length > structureSearch.sequence.length
      ) {
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

  const searchStructure = (sequence, sequenceFormat) => {
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
    response.text()
    .then(searchId => history.push("glycanList/" + searchId))
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
    let { sequence, sequenceFormat } = inputValues;
    searchStructure(sequence, sequenceFormat);
  };

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
            <Button className="gg-btn-blue" disabled={!isValid()} onClick={searchGlycanStrClick}>
              Search Structure
            </Button>
          </Row>
        </Grid>
        {/* Sequence Type */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControl
            fullWidth
            variant="outlined"
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
              menu={structureSearch.sequence_type.options}
              error={touched.sequenceFormat && errors.sequenceFormat}
              onBlur={() => setTouched({ sequenceFormat: true })}
              required={true}
            />
            {touched.sequenceFormat && errors.sequenceFormat && (
              <FormHelperText error>{structureSearch.sequence_type.requiredText}</FormHelperText>
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
              onChange={(e) => {
                setTouched({ sequence: true });
                setInputValues({ sequence: e.target.value });
              }}
            ></OutlinedInput>
            {touched.sequence && inputValues.sequence.length === 0 && (
              <FormHelperText error>{structureSearch.sequence.requiredText}</FormHelperText>
            )}
            {touched.sequence && inputValues.sequence.length > structureSearch.sequence.length && (
              <FormHelperText error>{structureSearch.sequence.errorText}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}
