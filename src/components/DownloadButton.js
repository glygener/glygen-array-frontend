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


export const DownloadButton = (props) => {
  const { defaultType = "export" } = props;


  const [show, setShow] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultType);

  const clearForm = () => {
    setSelectedValue("Export");
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
          id="download"
          alt="Download results"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="true"
          onClick={() => {
            setShow(!show);
          }}
        >
          <GetAppIcon /> DOWNLOAD
          <span className="caret mr-1"></span>
        </button>
      </Link>
      {show && (
        <>
          <ClickAwayListener onClickAway={handleClickOutside}>
            <div
              style={{ padding: "15px"}}
              className={"dropdown-menu dropdown-menu-right" + (show ? " open show" : "")}
              aria-labelledby="download"
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
                          {/* Select Type */}
                          <Form.Group
                            as={Row}
                            controlId="downloadType"
                            className={'gg-align-center mb-3'}
                          >
                            <Col>
                              <FormLabel label="Type" className="required-asterik" />
                              <Form.Control
                                as="select"
                                name="downloadType"
                                placeholder="Export (first dropdown by default)"
                                value={selectedValue}
                                onChange={(event) => {
                                  setSelectedValue(event.target.value);
                                }}
                                required={true}
                              >
                                {props.showExport && <option value="export">Export</option>}
                                {props.showDownload && <option value="download">Download</option>}
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
                      props.handleDownload(selectedValue)
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
export default DownloadButton;
