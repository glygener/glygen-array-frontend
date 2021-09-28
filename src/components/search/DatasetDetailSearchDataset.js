import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Row } from "react-bootstrap";
import FormControl from "@material-ui/core/FormControl";
import Button from "react-bootstrap/Button";
import glycanSearchData from "../../appData/glycanSearch";
import { wsCall } from "../../utils/wsUtils";
import { ErrorSummary } from "../../components/ErrorSummary";
import { HelpToolTip } from "../tooltip/HelpToolTip";
import "../../css/Search.css";
import ExampleExploreControl from "../ExampleExploreControl";
import { AutoTextInput } from "../../components/AutoTextInput";

const datasetSearch = glycanSearchData.dataset_search;
const DatasetDetailSearchDataset = (props) => {
  const history = useHistory();

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  const [inputValue, setInputValue] = React.useReducer(
    (state, payload) => ({ ...state, ...payload }),
    {
      datasetName: "",
      printedSlideName: "",
      pmid: "",
    }
  );

  const searchDataset = (datasetName, printedSlideName, pmid) => {
    wsCall(
      "searchdatasets",
      "POST",
      null,
      false,
      {
        datasetName,
        printedSlideName,
        pmid,
      },
      glycanSearchSuccess,
      glycanSearchFailure
    );
  };

  const glycanSearchSuccess = (response) => {
    response.text().then((searchId) => history.push("/datasetDetailList/" + searchId));
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
  };

  /**
   * Function to set glycan id value.
   * @param {string} datasetDetailSearchSuccess - input glycan id value.
   **/
  function funcSetInputValuesDataset(glycanSearchSuccess) {
    setInputValue({
      datasetName: glycanSearchSuccess,
    });
  }
  function funcSetInputValuesSlide(glycanSearchSuccess) {
    setInputValue({
      printedSlideName: glycanSearchSuccess,
    });
  }
  function funcSetInputValuesPmid(glycanSearchSuccess) {
    setInputValue({
      pmid: glycanSearchSuccess,
    });
  }

  const clearDataset = () => {
    setShowErrorSummary(false);
    setInputValue({
      datasetName: "",
      printedSlideName: "",
      pmid: "",
    });
  };

  const searchDatasetAdvClick = () => {
    const { datasetName, printedSlideName, pmid } = inputValue;
    searchDataset(datasetName, printedSlideName, pmid);
  };
  useEffect(() => {
    if (props.searchData && props.searchData.type === "GENERAL") {
      const { datasetName, printedSlideName, pmid } = props.searchData.input;
      setInputValue({
        datasetName: datasetName ? datasetName : "",
        printedSlideName: printedSlideName ? printedSlideName : "",
        pmid: pmid ? pmid : "",
      });
    }
  }, [props.searchData]);

  return (
    <>
      {showErrorSummary === true && (
        <ErrorSummary
          show={showErrorSummary}
          form="searchdatasets"
          errorJson={pageErrorsJson}
          errorMessage={pageErrorMessage}
        />
      )}
      <Grid container style={{ margin: "0  auto" }} spacing={3} justify="center" className="mb-5">
        {/* Buttons Top */}
        <Grid item xs={12} sm={10}>
          <Row className="gg-align-center">
            <Button className="gg-btn-outline gg-mr-40" onClick={clearDataset}>
              Clear Fields
            </Button>
            <Button className="gg-btn-blue" onClick={searchDatasetAdvClick}>
              Search Dataset
            </Button>
          </Row>
        </Grid>

        {/* Dataset name */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpToolTip
                title={datasetSearch.dataset_name.tooltip.title}
                text={datasetSearch.dataset_name.tooltip.text}
              />
              Dataset Name
            </Typography>
            <AutoTextInput
              length={datasetSearch.dataset_name.length}
              errorText={datasetSearch.dataset_name.errorText}
              placeholder={datasetSearch.dataset_name.placeholder}
              inputValue={inputValue.datasetName}
              setInputValue={(value) => setInputValue({ datasetName: value })}
              typeahedID="dataset"
            />
            <ExampleExploreControl
              setInputValue={funcSetInputValuesDataset}
              inputValue={datasetSearch.dataset_name.examples}
            />
          </FormControl>
        </Grid>
        {/* Slide name CFG5.2PrintedSlide */}
        <Grid item xs={12} sm={10} md={10}>
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpToolTip
                title={datasetSearch.printed_slide_name.tooltip.title}
                text={datasetSearch.printed_slide_name.tooltip.text}
              />
              Slide Name
            </Typography>
            <AutoTextInput
              length={datasetSearch.printed_slide_name.length}
              errorText={datasetSearch.printed_slide_name.errorText}
              placeholder={datasetSearch.printed_slide_name.placeholder}
              inputValue={inputValue.printedSlideName}
              setInputValue={(value) => setInputValue({ printedSlideName: value })}
              typeahedID="printedslide"
            />
            <ExampleExploreControl
              setInputValue={funcSetInputValuesSlide}
              inputValue={datasetSearch.printed_slide_name.examples}
            />
          </FormControl>
        </Grid>
        {/* PMID 1234 */}
        <Grid item xs={12} sm={10} md={10}>
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpToolTip
                title={datasetSearch.pmid.tooltip.title}
                text={datasetSearch.pmid.tooltip.text}
              />
              PMID
            </Typography>
            <AutoTextInput
              length={datasetSearch.pmid.length}
              errorText={datasetSearch.pmid.errorText}
              placeholder={datasetSearch.pmid.placeholder}
              inputValue={inputValue.pmid}
              setInputValue={(value) => setInputValue({ pmid: value })}
              typeahedID="pmid"
            />
            <ExampleExploreControl
              setInputValue={funcSetInputValuesPmid}
              inputValue={datasetSearch.pmid.examples}
            />
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
};

export default DatasetDetailSearchDataset;
