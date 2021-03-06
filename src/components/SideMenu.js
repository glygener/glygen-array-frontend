import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import "./SideMenu.css";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { Link, useHistory } from "react-router-dom";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    maxWidth: 250,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

const SideMenu = props => {
  const history = useHistory();

  if (props.match) {
  }

  const classes = useStyles();

  const chemicalEntity = ["/glycans/?", "/peptides/?", "/proteins/?", "/lipids/?", "/linkers/?", "/otherMolecules/?"];
  const chemicalEntityLabels = ["Glycan", "Peptide", "Protein", "Lipid", "Chemical/Linker", "Other"];

  const slidePages = ["/features/?", "/blockLayouts/?", "/slideLayouts/?", "/slides/?"];
  const slideSubMenuLabels = ["Feature", "Block Layout", "Slide Layout", "Slide"];

  const experimentPages = ["/experiments"];
  const experimentSubMenuLabels = ["Experiment"];

  const metadataPages = [
    "/samples/?",
    "/spots/?",
    "/listSlideMeta/?",
    "/printers/?",
    "/printRun/?",
    "/assays/?",
    "/scanners/?",
    "/imageAnalysis/?",
    "/dataProcessing/?",
  ];

  const metaDataSubMenuLabels = [
    "Sample",
    "Spot",
    "Slide",
    "Printer",
    "Print Run",
    "Assay",
    "Scanner",
    "Image Analysis",
    "Data Processing",
  ];

  var menu = new Map();

  menu.set("Molecules", {
    labels: chemicalEntityLabels,
    pages: chemicalEntity,
  });

  menu.set("Slide", {
    labels: slideSubMenuLabels,
    pages: slidePages,
  });

  menu.set("Metadata", {
    labels: metaDataSubMenuLabels,
    pages: metadataPages,
  });

  menu.set("Experiment", {
    labels: experimentSubMenuLabels,
    pages: experimentPages,
  });

  const [open, setOpen] = useState("");

  const handleClick = e => {
    setOpen(e);
  };

  const getList = (pages, submenuLabels) => {
    var subMenus = pages.map((subMenu, index) => {
      return (
        <List
          component={NavLink}
          disablePadding
          onClick={e => handleClick(e)}
          key={index}
          activeClassName="active-sidebar"
          to={submenuLabels[index]}
          className="sidebar-ittem"
          // style={{ textDecoration: "none" }}
        >
          <ListItem button className={classes.nested}>
            <ListItemText className="sidebar-item-text" primary={subMenu} />
          </ListItem>
        </List>
      );
    });
    return subMenus;
  };

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <div className="side-menu-header">
          <Link onClick={() => history.push("/contribute")}>Contribute</Link>
        </div>
      }
      className={classes.root}
      style={{ backgroundColor: "#e6e6e6", color: "#4a4a4a", paddingBottom: "250px" }}
    >
      <ListItem button onClick={() => handleClick("molecules")} divider>
        <ListItemText primary="Molecules" style={{ textDecoration: "none" }} />
        {props.openMenu === "molecules" ? <ExpandMore /> : <ExpandLess />}
      </ListItem>
      <Collapse
        in={open === "molecules" || (props.openMenu && props.openMenu === "molecules") ? true : false}
        timeout="auto"
        unmountOnExit
      >
        {getList(menu.get("Molecules").labels, menu.get("Molecules").pages)}
      </Collapse>

      <ListItem button onClick={() => handleClick("slide")} divider>
        <ListItemText primary="Slide" style={{ textDecoration: "none" }} />
        {props.openMenu === "slide" ? <ExpandMore /> : <ExpandLess />}
      </ListItem>
      <Collapse
        in={open === "slide" || (props.openMenu && props.openMenu === "slide") ? true : false}
        timeout="auto"
        unmountOnExit
      >
        {getList(menu.get("Slide").labels, menu.get("Slide").pages)}
      </Collapse>

      <ListItem button onClick={() => handleClick("meta")} divider>
        <ListItemText primary="Metadata" style={{ textDecoration: "none" }} />
        {props.openMenu === "meta" ? <ExpandMore /> : <ExpandLess />}
      </ListItem>
      <Collapse
        in={open === "meta" || (props.openMenu && props.openMenu === "meta") ? true : false}
        timeout="auto"
        unmountOnExit
      >
        {getList(menu.get("Metadata").labels, menu.get("Metadata").pages)}
      </Collapse>

      <ListItem button onClick={() => handleClick("experiment")} divider>
        <ListItemText primary="Experiment" style={{ textDecoration: "none" }} />
        {props.openMenu === "experiment" ? <ExpandMore /> : <ExpandLess />}
      </ListItem>
      <Collapse
        in={open === "experiment" || (props.openMenu && props.openMenu === "experiment") ? true : false}
        timeout="auto"
        unmountOnExit
      >
        {getList(menu.get("Experiment").labels, menu.get("Experiment").pages)}
      </Collapse>
    </List>
  );
};

SideMenu.propTypes = {
  open: PropTypes.string,
  match: PropTypes.object,
  openMenu: PropTypes.string
};
export { SideMenu };
