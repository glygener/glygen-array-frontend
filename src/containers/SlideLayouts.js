/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Contribute.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Col, ButtonToolbar } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";

const SlideLayouts = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.slideLayouts.title}</title>
        {getMeta(head.slideLayouts)}
      </Helmet>

      <div className="page-container">
        <Title title="Slide Layouts" />

        <ButtonToolbar>
          <Col md={{ span: 2 }}>
            <Link to="/slidelayouts/addSlide" className="link-button">
              Add Slide Layout
            </Link>
          </Col>

          <Col md={{ span: 2 }}>
            <Link
              to="/slidelayouts/addMultiple"
              className="link-button"
              title="Upload a GAL/XML file wih Slide Layouts"
              style={{ width: "110%" }}
            >
              Upload Slide Layouts
            </Link>
          </Col>
        </ButtonToolbar>

        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name"
            }
          ]}
          defaultPageSize={10}
          defaultSortColumn="id"
          showCommentsButton
          showDeleteButton
          showEditButton
          showSearchBox
          commentsRefColumn="description"
          fetchWS="slidelayoutlist"
          deleteWS="slidelayoutdelete"
          editUrl="slidelayouts/editSlide"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Slide Layouts"
        />
      </div>
    </>
  );
};

SlideLayouts.propTypes = {
  authCheckAgent: PropTypes.func
};

export { SlideLayouts };
