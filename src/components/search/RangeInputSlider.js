import React from "react";
import Slider from "@material-ui/core/Slider";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import PropTypes from "prop-types";
import "../../css/Search.css";

/**
 * Range slider input component.
 **/
export default function RangeInputSlider(props) {
  /**
   * Function to display value text.
   * @param {string} value input value.
   **/
  function valueText(value) {
    return `${value}`;
  }

  /**
   * Function to handle slider change event.
   * @param {object} event event object.
   * @param {string} newValue input value.
   **/
  const sliderChange = (event, newValue) => {
    props.setSliderInputValue(newValue);
    props.setInputValue([newValue[0].toLocaleString("en-US"), newValue[1].toLocaleString("en-US")]);
  };

  /**
   * Function to handle min input change event.
   * @param {object} event event object.
   **/
  const minInputChange = (event) => {
    var val = [event.target.value, props.inputValue[1]];
    props.setInputValue(val);
  };

  /**
   * Function to handle max input change event.
   * @param {object} event event object.
   **/
  const maxInputChange = (event) => {
    var val = [props.inputValue[0], event.target.value];
    props.setInputValue(val);
  };

  /**
   * Function to handle min input move out event.
   **/
  const onMinMoveOut = () => {
    let val = [
      Math.floor(props.inputValue[0].replace(/[^0-9.]/g, "")),
      Math.ceil(props.inputValue[1].replace(/[^0-9.]/g, "")),
    ];
    if (Number(val[0]) < Number(props.min)) val[0] = props.min;
    else if (val[0] === 0) val[0] = props.min;
    else if (Number(val[0]) > Number(val[1])) val[0] = val[1];

    let valStr = [Number(val[0]).toLocaleString("en-US"), Number(val[1]).toLocaleString("en-US")];
    props.setInputValue(valStr);
    props.setSliderInputValue(val);
  };

  /**
   * Function to handle max input move out event.
   **/
  const onMaxMoveOut = () => {
    let val = [
      Math.floor(props.inputValue[0].replace(/[^0-9.]/g, "")),
      Math.ceil(props.inputValue[1].replace(/[^0-9.]/g, "")),
    ];
    if (Number(val[1]) > Number(props.max)) val[1] = props.max;
    else if (val[1] === 0) val[1] = props.max;
    else if (Number(val[1]) < Number(val[0])) val[1] = val[0];

    let valStr = [Number(val[0]).toLocaleString("en-US"), Number(val[1]).toLocaleString("en-US")];
    props.setInputValue(valStr);
    props.setSliderInputValue(val);
  };

  return (
    <div>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <FormControl fullWidth variant="outlined">
            <InputLabel className={"select-lbl-inline"}>Min</InputLabel>
            <OutlinedInput
              className={props.inputClass}
              value={props.inputValue[0]}
              margin="dense"
              onChange={minInputChange}
              onBlur={onMinMoveOut}
              labelWidth={40}
              inputProps={{
                min: props.min,
                max: props.max,
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs>
          <Slider
            value={props.inputValueSlider}
            step={props.step}
            min={props.min}
            max={props.max}
            scale={(x) => x}
            onChange={sliderChange}
            valueLabelDisplay={props.labelDisplay ? props.labelDisplay : "auto"}
            getAriaValueText={valueText}
          />
        </Grid>
        <Grid item>
          <FormControl fullWidth variant="outlined">
            <InputLabel className={"select-lbl-inline"}>Max</InputLabel>
            <OutlinedInput
              className={props.inputClass}
              value={props.inputValue[1]}
              margin="dense"
              onChange={maxInputChange}
              onBlur={onMaxMoveOut}
              labelWidth={40}
              inputProps={{
                min: props.min,
                max: props.max,
              }}
            />
          </FormControl>
        </Grid>
      </Grid>
    </div>
  );
}

RangeInputSlider.propTypes = {
  step: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  inputValueSlider: PropTypes.array,
  inputClass: PropTypes.string,
  setSliderInputValue: PropTypes.func,
  inputValue: PropTypes.array,
  setInputValue: PropTypes.func,
};
