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

const Slides = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.slides.title}</title>
        {getMeta(head.slide)}
      </Helmet>

      <div className="page-container">
        <Title title="Slides" />

        <ButtonToolbar>
          <Col md={{ span: 2 }}>
            <Link to="/slides/addSlide" className="link-button">
              Add Slide
            </Link>
          </Col>
        </ButtonToolbar>

        <GlygenTable
          columns={[
            { Header: "Name", accessor: "name" },
            { Header: "Slidelayout", accessor: "layout.name" },
            { Header: "Printer", accessor: "printer.name" },
            { Header: "Slide Metadata", accessor: "metadata.name" }
          ]}
          defaultPageSize={10}
          defaultSortColumn="id"
          showDeleteButton
          showEditButton
          showMakePublic
          showSearchBox
          commentsRefColumn="description"
          fetchWS="slidelist"
          deleteWS="slidedelete"
          editUrl="slide/editSlide"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Slides"
        />
      </div>
    </>
  );
};

Slides.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Slides };
