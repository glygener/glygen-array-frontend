import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Row, Col } from "react-bootstrap";
import FormControl from "@material-ui/core/FormControl";
// import InputLabel from '@material-ui/core/InputLabel';
import Button from "react-bootstrap/Button";
import GetAppIcon from "@material-ui/icons/GetApp";
import { Link } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { FormLabel, Feedback } from "../components/FormControls";


export const ExportButton = (props) => {

  const [show, setShow] = useState(false);
  const [selectedValue, setSelectedValue] = useState("Metadata in individual sheets");
  const [selectedMetadata, setSelectedMetadata] = useState("Complete Metadata");
  const [showMetadataType, setShowMetadataType] = useState(true);

  const clearForm = () => {
    setSelectedValue("Metadata in indivudal sheets");
    setSelectedMetadata("Complete Metadata");
  };
  const handleClickOutside = (event) => {
    setShow(false);
  };

  return (
    <div className="dropdown">
      <Link>
        <button
          className="btn btn-link gg-download-btn dropdown-toggle"
          type="button"
          id="export"
          alt="Export metadata"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="true"
          onClick={() => {
            setShow(!show);
          }}
        >
          <GetAppIcon /> EXPORT
          <span className="caret mr-1"></span>
        </button>
      </Link>
      {show && (
        <>
          <ClickAwayListener onClickAway={handleClickOutside}>
            <div
              style={{ padding: "15px" }}
              className={"dropdown-menu dropdown-menu-right" + (show ? " open show" : "")}
              aria-labelledby="export"
            >
              <Row>
                <Col>
                  <button
                    type="button"
                    className="gg-blue-color"
                    style={{
                      float: "right",
                      border: "none",
                      backgroundColor: "inherit",
                      padding: "0",
                    }}
                    onClick={() => {
                      clearForm();
                      setShow(!show);
                    }}
                  >
                    <CloseIcon />
                  </button>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormControl margin="dense" variant="outlined" fullWidth>
                    <Row>
                      <Col>
                        {/* Select Style */}
                        <Form.Group
                          as={Row}
                          controlId="downloadType"
                          className={'gg-align-center mb-3'}
                        >
                          <Col>
                            <FormLabel label="Export Style" className="required-asterik" />
                            <Form.Control
                              as="select"
                              name="downloadType"
                              placeholder="Export (first dropdown by default)"
                              value={selectedValue}
                              onChange={(event) => {
                                setSelectedValue(event.target.value);
                                if (event.target.value === "JSON") {
                                  setShowMetadataType(false);
                                }
                              }}
                              required={true}
                            >
                              {<option value="Metadata in individual sheets">Metadata in individual sheets</option>}
                              {<option value="Single sheet">Single sheet</option>}
                              {<option value="JSON">Repository export (.json)</option>}
                            </Form.Control>
                          </Col>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        {/* Select Metadata */}
                        <Form.Group
                          as={Row}
                          controlId="metadataType"
                          className={'gg-align-center mb-3'}
                        >
                          <Col>
                            <FormLabel label="Metadata" className="required-asterik" />
                            <Form.Control
                              as="select"
                              name="metadataType"
                              placeholder="Export (first dropdown by default)"
                              value={selectedMetadata}
                              onChange={(event) => {
                                setSelectedMetadata(event.target.value);
                              }}
                              required={true}
                              disabled={!showMetadataType}
                            >
                              {<option value="Complete Metadata">Complete Metadata</option>}
                              {<option value="Mirage Metadata Only">Mirage Metadata Only</option>}
                            </Form.Control>
                          </Col>
                        </Form.Group>
                      </Col>
                    </Row>
                  </FormControl>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button
                    type="button"
                    style={{ marginTop: "15px", float: "right" }}
                    className="gg-btn-outline"
                    onClick={() => {
                      props.handleExport(selectedValue, selectedMetadata)
                      setShow(false);
                    }}
                  >
                    OK
                  </Button>
                </Col>
              </Row>
            </div>
          </ClickAwayListener>
        </>
      )}
    </div>
  );
};
export default ExportButton;
