/* eslint-disable react/display-name */
import React, { useState } from "react";
import ReactTable from "react-table";
import { useLocation, Link } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { OverlayTrigger, Popover, Col, Alert, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Title } from "./FormControls";

const ErrorPage = () => {
  let location = useLocation();
  let backLink = "";
  let errorMessage = "";
  const [copy, setCopy] = useState(false);

  if (location && location.state) {
    backLink = location.state.goBack;
    errorMessage = location.state.errorMessage;
  }

  const getErrorsContent = () => {
    return (
      <>
        <ReactTable
          style={{ textTransform: "uppercase" }}
          data={errorMessage.errors}
          columns={[
            {
              Header: "Name",
              accessor: "objectName"
            },
            {
              Header: "Error Message",
              Cell: row => (
                <>
                  <Alert
                    style={{
                      marginLeft: "35%",
                      width: "fit-content"
                    }}
                    variant={"danger"}
                  >
                    {row.original.defaultMessage.substring(0, row.original.defaultMessage.indexOf(":"))}
                  </Alert>
                </>
              )
            },
            {
              Header: "Comments",
              accessor: "objectName",
              Cell: (row, index) =>
                row.value ? (
                  <OverlayTrigger
                    key={index}
                    trigger="click"
                    placement="bottom"
                    rootClose
                    overlay={
                      <Popover>
                        <Popover.Title as="h3">{row.original.objectName}</Popover.Title>
                        <Popover.Content style={{ textTransform: "uppercase", textAlign: "justify" }}>
                          {row.original.defaultMessage} &nbsp; &nbsp;
                          <br />
                          <br />
                          <CopyToClipboard text={row.original.defaultMessage} onCopy={() => setCopy(true)}>
                            <FontAwesomeIcon
                              key={"copytoclipboard" + index}
                              icon={["fas", "copy"]}
                              size="xs"
                              title={"Copy to Clipboard"}
                              className="table-btn"
                            />
                          </CopyToClipboard>
                        </Popover.Content>
                      </Popover>
                    }
                  >
                    <FontAwesomeIcon
                      key={"comments" + index}
                      icon={["fas", "comments"]}
                      size="xs"
                      title="Comments"
                      className="table-btn"
                    />
                  </OverlayTrigger>
                ) : (
                  <div key={index}></div>
                ),
              minWidth: 100
            }
          ]}
          pageSizeOptions={[5, 10, 25]}
          defaultPageSize={5}
          pageSize={errorMessage.errors.length > 5 ? 5 : errorMessage.errors.length}
          keyColumn="id"
          showPaginationTop
          sortable={true}
        />
      </>
    );
  };

  return (
    <>
      <div className="page-container">
        <Title title="Errors Processdata File" />

        <div style={{ paddingTop: "100px" }}>
          <h2 className="card-subheading"> Errors - Process Data File Uploaded: </h2>

          {errorMessage && getErrorsContent()}

          <Row style={{ marginTop: "3%" }}>
            <Col md={{ span: 2, offset: 5 }}>
              <Link to={backLink} className="link-button">
                Back
              </Link>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export { ErrorPage };
