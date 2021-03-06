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
import { Loading } from "../Loading";

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

  const [initSearchData, setInitSearchData] = useState({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();
  const [showLoading, setShowLoading] = useState(false);

  const [inputValue, setInputValue] = React.useReducer((state, payload) => ({ ...state, ...payload }), {
    glytoucanIds: "",
    massRange: [0, 0],
    massRangeInput: ["0", "0"],
  });

  const searchGlycan = (glytoucanIds, minMass, maxMass) => {
    setShowLoading(true);
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
      setPageErrorsJson(resp);
      setShowErrorSummary(true);
    });
    setShowLoading(false);
  };

  /**
   * Function to set glycan id value.
   * @param {string} glycanSearchSuccess - input glycan id value.
   **/
  function funcSetInputValues(glycanSearchSuccess) {
    setInputValue({ glytoucanIds: glycanSearchSuccess });
  }

  const clearGlycan = () => {
    setShowErrorSummary(false);
    setInputValue({
      glytoucanIds: "",
      massRange: [Math.floor(initSearchData.minGlycanMass || 0), Math.ceil(initSearchData.maxGlycanMass || 0)],
      massRangeInput: [
        Math.floor(initSearchData.minGlycanMass || 0).toLocaleString(),
        Math.ceil(initSearchData.maxGlycanMass || 0).toLocaleString(),
      ],
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
    if (props.searchData && props.searchData.type === "COMBINED") {
      const { glytoucanIds, minMass, maxMass } = props.searchData.input;
      setInputValue({
        glytoucanIds: glytoucanIds ? glytoucanIds.join(", ") : "",
        massRange: [Math.floor(minMass), Math.ceil(maxMass)],
        massRangeInput: [Math.floor(minMass).toLocaleString(), Math.ceil(maxMass).toLocaleString()],
      });
    }
  }, [props.searchData]);

  useEffect(() => {
    wsCall("initglycansearch", "GET", null, false, null, glycanInitSearchSuccess, glycanInitSearchFailure);
  }, []);

  const glycanInitSearchSuccess = (response) => {
    response.json().then((data) => {
      setInitSearchData(data);
      setInputValue({
        massRange: [Math.floor(data.minGlycanMass || 0), Math.ceil(data.maxGlycanMass || 0)],
        massRangeInput: [
          Math.floor(data.minGlycanMass || 0).toLocaleString(),
          Math.ceil(data.maxGlycanMass || 0).toLocaleString(),
        ],
      });
    });
  };

  const glycanInitSearchFailure = (response) => {
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
        setPageErrorMessage("Invalid search data. Please correct it and try again.");
        setShowErrorSummary(true);
        return;
      }
      setPageErrorsJson(resp);
      setShowErrorSummary(true);
    });
  };

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
            <ExampleExploreControl setInputValue={funcSetInputValues} inputValue={advancedSearch.glycan_id.examples} />
          </FormControl>
        </Grid>
        {/* Monoisotopic Mass */}
        <Grid item xs={12} sm={10} className="pt-3">
          <FormControl fullWidth>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={12}>
                <Typography className={"search-lbl"} gutterBottom>
                  <HelpToolTip title={advancedSearch.mass.tooltip.title} text={advancedSearch.mass.tooltip.text} />
                  Monoisotopic Mass
                </Typography>
                <RangeInputSlider
                  step={1}
                  min={Math.floor(initSearchData.minGlycanMass || 0)}
                  max={Math.ceil(initSearchData.maxGlycanMass || 0)}
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
      <Loading show={showLoading} />
    </>
  );
};

export default GlycanAdvancedSearch;
