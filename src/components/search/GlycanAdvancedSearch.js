import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Row } from "react-bootstrap";
import FormControl from "@material-ui/core/FormControl";
import Button from "react-bootstrap/Button";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import glycanSearchData from "../../appData/glycanSearch";
import RangeInputSlider from "./RangeInputSlider";
import { wsCall } from "../../utils/wsUtils";
import { ErrorSummary } from "../../components/ErrorSummary";
import { HelpToolTip } from "../../components/HelpToolTip";
import "../../css/Search.css";

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
  const [glycanIds, setGlycanIds] = useState("");
  const [massRange, setMassRange] = useState([1, 10000]);
  const [massSliderValue, setMassSliderValue] = useState([1, 10000]);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  const searchGlycan = (glytoucanIds, minMass, maxMass) => {
    wsCall(
      "searchglycans",
      "POST",
      null,
      false,
      {
        glytoucanIds: [glytoucanIds],
        maxMass,
        minMass,
      },
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

  const clearGlycan = () => {};

  const searchGlycanAdvClick = () => {
    const _glycanIds = getCommaSeparatedValues(glycanIds);

    searchGlycan(_glycanIds, parseInt(massSliderValue[0]), parseInt(massSliderValue[1]));
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
              Glycan ID
            </Typography>
            <OutlinedInput
              fullWidth
              multiline
              required={true}
              placeholder={advancedSearch.glycan_id.placeholder}
              value={glycanIds}
              onChange={(e) => setGlycanIds(e.target.value)}
            ></OutlinedInput>
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
                  inputValueSlider={massSliderValue}
                  inputClass=""
                  setSliderInputValue={setMassSliderValue}
                  inputValue={massRange}
                  setInputValue={setMassRange}
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
