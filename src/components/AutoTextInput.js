import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import PropTypes from "prop-types";
import FormHelperText from "@material-ui/core/FormHelperText";
import { wsCall } from "../utils/wsUtils";
// import "../../css/Search.css";

/**
 * Text input component with typeahead.
 **/
function AutoTextInput(props) {
  const [options, setOptions] = React.useState([]);
  const inputValueRef = React.useRef(props.inputValue);
  inputValueRef.current = props.inputValue;

  /**
   * Function to handle change event for input text.
   * @param {object} event event object.
   * @param {string} value input value.
   * @param {string} reason event reason.
   **/
  const handleChange = (event, value, reason) => {
    if (!(event === null && value === "" && reason === "reset")) {
      props.setInputValue(value);
    }
  };

  const getTypeahed = (typeahedID, inputValue, limit = 100) => {
    wsCall(
      "gettypeahead",
      "GET",
      {
        namespace: typeahedID,
        value: encodeURIComponent(inputValue),
        limit,
      },
      false,
      null,
      searchSuccess,
      searchFailure
    );
  };
  const searchSuccess = (response) => {
    response
      .json()
      .then((response) =>
        inputValueRef.current.trim() !== "" ? setOptions(response) : setOptions([])
      );
  };

  const searchFailure = (response) => {
    response.json().then((resp) => {
      console.log(resp);
    });
  };

  /**
   * useEffect to get typeahead data from api.
   **/
  React.useEffect(() => {
    if (props.inputValue.trim() === "") {
      setOptions([]);
      return undefined;
    }

    if (props.inputValue && props.inputValue.length <= props.length) {
      getTypeahed(props.typeahedID, props.inputValue);
    }

    return;
  }, [props.inputValue, props.typeahedID]);

  return (
    <>
      <Autocomplete
        freeSolo
        getOptionLabel={(option) => option}
        classes={{
          option: "auto-option",
          inputRoot: "auto-input-root",
          input: "input-auto",
        }}
        options={options}
        filterOptions={(options) => options}
        autoHighlight={true}
        inputValue={props.inputValue}
        onInputChange={handleChange}
        onBlur={props.onBlur}
        onClose={(event, reason) => setOptions([])}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            required={props.required}
            placeholder={props.placeholder}
            error={props.inputValue.length > props.length || props.error}
          />
        )}
      />
      {props.inputValue.length > props.length && (
        <FormHelperText className={"error-text"} error>
          {props.errorText}
        </FormHelperText>
      )}
    </>
  );
}

AutoTextInput.propTypes = {
  inputValue: PropTypes.string,
  placeholder: PropTypes.string,
  typeahedID: PropTypes.string,
  errorText: PropTypes.string,
  length: PropTypes.number,
  required: PropTypes.bool,
  setInputValue: PropTypes.func,
};
export { AutoTextInput };
