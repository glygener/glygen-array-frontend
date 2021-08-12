import React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import PropTypes from "prop-types";
import { sortDropdown } from "../../utils/commonUtils";
import "../../css/Search.css";

/**
 * Select control component.
 */
export default function SelectControl(props) {
  /**
   * Function to handle onchange event for select control.
   * @param {object} event - event object.
   * @param {object} child - child object.
   **/
  const handleChange = (event, child) => {
    props.setInputValue(child.props.value, child.props.name, event.target.name);
  };

  return (
    <>
      <Select
        value={props.inputValue}
        displayEmpty
        name={props.name}
        onChange={handleChange}
        onBlur={props.onBlur}
        error={props.error}
        margin={props.margin}
        variant={props.variant}
        defaultValue={props.defaultValue}
        MenuProps={{ disablePortal: true }}
        classes={{
          root: props.rootClass ? props.rootClass : "select-menu-adv",
        }}
        labelWidth={props.labelWidth}
      >
        {props.placeholder && (
          <MenuItem
            key={props.placeholderId}
            value={props.placeholderId}
            name={props.placeholderName}
          >
            {props.placeholder}
           </MenuItem>
        )}
        {props.menu &&
          props.menu.sort(props.sortFunction ? props.sortFunction : sortDropdown).map((item) => (
            <MenuItem key={item.id} value={item.id} name={item.name}>
              {item.name}
            </MenuItem>
          ))}
      </Select>
    </>
  );
}

SelectControl.propTypes = {
  inputValue: PropTypes.string,
  placeholder: PropTypes.string,
  placeholderId: PropTypes.string,
  placeholderName: PropTypes.string,
  rootClass: PropTypes.string,
  margin: PropTypes.string,
  variant: PropTypes.string,
  labelWidth: PropTypes.number,
  defaultValue: PropTypes.string,
  menu: PropTypes.array,
  setInputValue: PropTypes.func,
  sortFunction: PropTypes.func,
};
