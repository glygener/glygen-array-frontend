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
import { wsCall } from "../../utils/wsUtils";
import { ErrorSummary } from "../../components/ErrorSummary";
import { HelpToolTip } from "../tooltip/HelpToolTip";
import "../../css/Search.css";
import ExampleExploreControl from "../ExampleExploreControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withStyles } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";

const BlueCheckbox = withStyles({
  root: {
    color: "#979797",
    "&$checked": {
      color: "#2f78b7",
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

const datasetSearch = glycanSearchData.dataset_search;
const DatasetDetailSearchUser = (props) => {
  const history = useHistory();

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  const [inputValue, setInputValue] = React.useReducer(
    (state, payload) => ({ ...state, ...payload }),
    {
      username: "",
      lastName: "",
      groupName: "",
      institution: "",
      coOwner: false,
    }
  );

  const searchDataset = (username, lastName, groupName, institution, coOwner) => {
    wsCall(
      "searchdatasetsbyuser",
      "POST",
      null,
      false,
      {
        username,
        lastName,
        groupName,
        institution,
        coOwner,
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
  function funcSetInputValuesUsername(glycanSearchSuccess) {
    setInputValue({
      username: glycanSearchSuccess,
    });
  }
  function funcSetInputValuesLastName(glycanSearchSuccess) {
    setInputValue({
      lastName: glycanSearchSuccess,
    });
  }
  function funcSetInputValuesGroupName(glycanSearchSuccess) {
    setInputValue({
      groupName: glycanSearchSuccess,
    });
  }
  function funcSetInputValuesInstitution(glycanSearchSuccess) {
    setInputValue({
      institution: glycanSearchSuccess,
    });
  }

  const clearDataset = () => {
    setShowErrorSummary(false);
    setInputValue({
      username: "",
      lastName: "",
      groupName: "",
      institution: "",
      coOwner: false,
    });
  };

  const searchDatasetAdvClick = () => {
    const { username, lastName, groupName, institution, coOwner } = inputValue;
    searchDataset(username, lastName, groupName, institution, coOwner);
  };
  useEffect(() => {
    if (props.searchData && props.searchData.type === "USER") {
      const { username, lastName, groupName, institution, coOwner } = props.searchData.input;
      setInputValue({
        username: username ? username : "",
        lastName: lastName ? lastName : "",
        groupName: groupName ? groupName : "",
        institution: institution ? institution : "",
        coOwner: true,
      });
    }
  }, [props.searchData]);

  return (
    <>
      {showErrorSummary === true && (
        <ErrorSummary
          show={showErrorSummary}
          form="searchdatasetsbyuser"
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
              Search Glycan
            </Button>
          </Row>
        </Grid>

        {/* Username */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpToolTip
                title={datasetSearch.username.tooltip.title}
                text={datasetSearch.username.tooltip.text}
              />
              Username
            </Typography>
            <OutlinedInput
              fullWidth
              multiline
              error={inputValue.username.length > datasetSearch.username.length}
              placeholder={datasetSearch.username.placeholder}
              value={inputValue.username}
              onChange={(e) => setInputValue({ username: e.target.value })}
            ></OutlinedInput>
            {inputValue.username.length > datasetSearch.username.length && (
              <FormHelperText error>{datasetSearch.username.errorText}</FormHelperText>
            )}
            <ExampleExploreControl
              setInputValue={funcSetInputValuesUsername}
              inputValue={datasetSearch.username.examples}
            />
          </FormControl>
        </Grid>
        {/* Last Name */}
        <Grid item xs={12} sm={10} md={10}>
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpToolTip
                title={datasetSearch.last_name.tooltip.title}
                text={datasetSearch.last_name.tooltip.text}
              />
              Last Name
            </Typography>
            <OutlinedInput
              fullWidth
              multiline
              error={inputValue.lastName.length > datasetSearch.last_name.length}
              placeholder={datasetSearch.last_name.placeholder}
              value={inputValue.lastName}
              onChange={(e) => setInputValue({ lastName: e.target.value })}
            ></OutlinedInput>
            {inputValue.lastName.length > datasetSearch.last_name.length && (
              <FormHelperText error>{datasetSearch.last_name.errorText}</FormHelperText>
            )}
            <ExampleExploreControl
              setInputValue={funcSetInputValuesLastName}
              inputValue={datasetSearch.last_name.examples}
            />
          </FormControl>
        </Grid>
        {/* Group Name */}
        <Grid item xs={12} sm={10} md={10}>
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpToolTip
                title={datasetSearch.group_name.tooltip.title}
                text={datasetSearch.group_name.tooltip.text}
              />
              Group Name
            </Typography>
            <OutlinedInput
              fullWidth
              multiline
              error={inputValue.groupName.length > datasetSearch.group_name.length}
              placeholder={datasetSearch.group_name.placeholder}
              value={inputValue.groupName}
              onChange={(e) => setInputValue({ groupName: e.target.value })}
            ></OutlinedInput>
            {inputValue.groupName.length > datasetSearch.group_name.length && (
              <FormHelperText error>{datasetSearch.group_name.errorText}</FormHelperText>
            )}
            <ExampleExploreControl
              setInputValue={funcSetInputValuesGroupName}
              inputValue={datasetSearch.group_name.examples}
            />
          </FormControl>
        </Grid>
        {/* Institution */}
        <Grid item xs={12} sm={10} md={10}>
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpToolTip
                title={datasetSearch.institution.tooltip.title}
                text={datasetSearch.institution.tooltip.text}
              />
              Institution
            </Typography>
            <OutlinedInput
              fullWidth
              multiline
              error={inputValue.institution.length > datasetSearch.institution.length}
              placeholder={datasetSearch.institution.placeholder}
              value={inputValue.institution}
              onChange={(e) => setInputValue({ institution: e.target.value })}
            ></OutlinedInput>
            {inputValue.institution.length > datasetSearch.institution.length && (
              <FormHelperText error>{datasetSearch.institution.errorText}</FormHelperText>
            )}
            <ExampleExploreControl
              setInputValue={funcSetInputValuesInstitution}
              inputValue={datasetSearch.institution.examples}
            />
          </FormControl>
        </Grid>
        {/* Co-owners */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControlLabel
            control={
              <BlueCheckbox
                name="coOwner"
                checked={inputValue.coOwner}
                onChange={(e) => setInputValue({ coOwner: e.target.checked })}
                size="large"
              />
            }
            label="Co-Owner"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default DatasetDetailSearchUser;
