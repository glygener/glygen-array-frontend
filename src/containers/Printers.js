import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { Col, ButtonToolbar } from "react-bootstrap";
import { head, getMeta } from "../utils/head";
import PropTypes from "prop-types";
import { Title } from "../components/FormControls";

const Printers = props => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      <Helmet>
        <title>{head.printers.title}</title>
        {getMeta(head.printers)}
      </Helmet>

      <div className="page-container">
        <Title title="Printers" />

        <ButtonToolbar>
          <Col className={"col-link-button"}>
            <Link to="/printers/addPrinter" className="link-button" style={{ width: "150px" }}>
              Add Printer
            </Link>
          </Col>
        </ButtonToolbar>

        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name"
            },
            {
              Header: "Template",
              accessor: "template"
            }
          ]}
          defaultPageSize={10}
          defaultSortColumn="id"
          showCommentsButton
          showDeleteButton
          showEditButton
          showCopyButton
          showMirageCompliance
          commentsRefColumn="description"
          fetchWS="listprinters"
          deleteWS="printerdelete"
          editUrl="printers/editPrinter"
          copyUrl="printers/copyPrinter"
          copyPage="copyPrinter"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Printers"
        />
      </div>
    </>
  );
};

Printers.propTypes = { authCheckAgent: PropTypes.func };

export { Printers };
