import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import FormHelperText from "@material-ui/core/FormHelperText";
import { Row } from "react-bootstrap";
import FormControl from "@material-ui/core/FormControl";
import Button from "react-bootstrap/Button";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import glycanSearchData from "../../appData/glycanSearch";
import RangeInputSlider from "./RangeInputSlider";
import { wsCall } from "../../utils/wsUtils";
import { ErrorSummary } from "../../components/ErrorSummary";
import { HelpToolTip } from "../tooltip/HelpToolTip";
import "../../css/Search.css";
import ExampleExploreControl from "../ExampleExploreControl";

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

const advancedSearch = glycanSearchData.advanced_search;
const GlycanAdvancedSearch = (props) => {
  const history = useHistory();

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  const [inputValue, setInputValue] = React.useReducer(
    (state, payload) => ({ ...state, ...payload }),
    {
      glytoucanIds: "",
      massRange: [1, 10000],
      massRangeInput: ["1", "10000"],
    }
  );

  const searchGlycan = (glytoucanIds, minMass, maxMass) => {
    wsCall(
      "searchglycans",
      "POST",
      null,
      false,
      {
        glytoucanIds,
        maxMass,
        minMass,
      },
      glycanSearchSuccess,
      glycanSearchFailure
    );
  };

  const glycanSearchSuccess = (response) => {
    response.text().then((searchId) => history.push("/glycanList/" + searchId));
  };

  /**
   * Function to set glycan id value.
   * @param {string} glycanSearchSuccess - input glycan id value.
   **/
  function funcSetInputValues(glycanSearchSuccess) {
    setInputValue({ glytoucanIds: glycanSearchSuccess });
  }

  const glycanSearchFailure = (response) => {
    response.json().then((resp) => {
      console.log(resp);
      setPageErrorsJson(resp);
      setShowErrorSummary(true);
      setPageErrorMessage("");
    });
  };

  const clearGlycan = () => {
    setShowErrorSummary(false);
    setInputValue({
      glytoucanIds: "",
      massRange: [1, 10000],
      massRangeInput: ["1", "10000"],
    });
  };

  const searchGlycanAdvClick = () => {
    const { glytoucanIds, massRange } = inputValue;

    let _glytoucanIds = getCommaSeparatedValues(glytoucanIds);

    if (_glytoucanIds) {
      _glytoucanIds = _glytoucanIds.split(",");
    } else {
      _glytoucanIds = [];
    }

    searchGlycan(_glytoucanIds, massRange[0], massRange[1]);
  };
  useEffect(() => {
    if (props.inputValue) {
      setInputValue({
        glytoucanIds: props.inputValue.glytoucanIds ? props.inputValue.glytoucanIds.join(", ") : "",
        massRange: [props.inputValue.minMass, props.inputValue.maxMass],
      });
    }
  }, [props.inputValue]);

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
      <Grid container style={{ margin: "0  auto" }} spacing={3} justify="center" className="mb-5">
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
              <HelpToolTip
                title={advancedSearch.glycan_id.tooltip.title}
                text={advancedSearch.glycan_id.tooltip.text}
              />
              GlyTouCan ID
            </Typography>
            <OutlinedInput
              fullWidth
              multiline
              rows="3"
              error={inputValue.glytoucanIds.length > advancedSearch.glycan_id.length}
              placeholder={advancedSearch.glycan_id.placeholder}
              value={inputValue.glytoucanIds}
              onChange={(e) => setInputValue({ glytoucanIds: e.target.value })}
            ></OutlinedInput>
            {inputValue.glytoucanIds.length > advancedSearch.glycan_id.length && (
              <FormHelperText error>{advancedSearch.glycan_id.errorText}</FormHelperText>
            )}
            <ExampleExploreControl
              setInputValue={funcSetInputValues}
              inputValue={advancedSearch.glycan_id.examples}
            />
          </FormControl>
        </Grid>
        {/* Monoisotopic Mass */}
        <Grid item xs={12} sm={10} className="pt-3">
          <FormControl fullWidth>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={12}>
                <Typography className={"search-lbl"} gutterBottom>
                  <HelpToolTip
                    title={advancedSearch.mass.tooltip.title}
                    text={advancedSearch.mass.tooltip.text}
                  />
                  Monoisotopic Mass
                </Typography>
                <RangeInputSlider
                  step={1}
                  min={1}
                  max={10000}
                  inputValueSlider={inputValue.massRange}
                  setSliderInputValue={(value) => setInputValue({ massRange: value })}
                  inputValue={inputValue.massRangeInput}
                  setInputValue={(value) => setInputValue({ massRangeInput: value })}
                />
              </Grid>
            </Grid>
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
};

export default GlycanAdvancedSearch;
