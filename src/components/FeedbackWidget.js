import React from "react";
import { Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import "../css/feedback.css";
import { FaRegLightbulb } from "react-icons/fa";
import { AiFillQuestionCircle } from "react-icons/ai";
import { AiFillBug } from "react-icons/ai";
import { wsCall } from "../utils/wsUtils";
import { validateEmail, replaceSpecialCharacters } from "../utils/commonUtils";
import Typography from "@material-ui/core/Typography";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import CloseIcon from "@material-ui/icons/Close";
import FormHelperText from "@material-ui/core/FormHelperText";

const FeedbackWidget = (props) => {
  const { defaultSubject = "Suggestion" } = props;

  const [isOpen, setIsOpen] = useState(false);

  const [fname, setFName] = useState("");
  const [lname, setLName] = useState("None Given");
  const [subject, setSubject] = useState(defaultSubject);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [fNameValidated, setFNameValidated] = useState(false);
  const [lNameValidated, setLNameValidated] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [messageValidated, setMessageValidated] = useState(false);
  const [formValidated, setFormValidated] = useState(false);
  const [contactUsResponseMessage, setContactUsResponseMessage] = useState("");

  const [contactUsErrorMessage, setContactUsErrorMessage] = useState("");

  const messageMaxLen = 2400;
  const [messageCharsLeft, setMessageCharsLeft] = useState(messageMaxLen);

  const handleWordCount = (e) => {
    const charCount = e.target.value.length;
    const charLength = messageMaxLen - charCount;
    setMessageCharsLeft(charLength);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setContactUsResponseMessage();
    setContactUsErrorMessage();

    let firstName = fname;
    let lastName = "not given";

    let temp = fname.trim();
    let index = temp.indexOf(" ");
    if (index > 0){
      firstName = temp.substring(0, index);
      lastName = temp.substring(index+1).trim();
    }

    const formData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      page: window.location.href,
      // page: window.location.href.split("?")[0],
      subject: "Feedback Form: " + subject,
      message: message,
    };

    const body = JSON.stringify(formData);

    wsCall(
        "sendfeedback",
        "POST",
        null,
        false,
        body,
        feedbackSuccess,
        feedbackFailure
      );
  };

  function feedbackSuccess (response) {
    setContactUsResponseMessage("We have received your message and will make every effort to respond to you within a reasonable amount of time.");
    resetForm();
  }

  function feedbackFailure (response) {
    setContactUsErrorMessage(
        "Oops, something went wrong! We did not receive your message. Please try again later."
      );
  }

  const resetForm = () => {
    setFName("");
    setLName("");
    setEmail("");
    setSubject("Suggestion");
    setMessage("");
    setMessageCharsLeft(`${messageMaxLen}`);
    setFormValidated(false);
    setFNameValidated(false);
    setLNameValidated(false);
    setEmailValidated(false);
    setMessageValidated(false);
  };

  const closeForm = () => {
    resetForm();
    setIsOpen(!isOpen);
  };

  const onlyText = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z- ]/g, "");
  };

  return (
    <form autoComplete="off" onSubmit={handleSubmit} className="form">
      <div className={"sidebar-contact feedback_ protvistaicon" + (isOpen ? " active" : "")}>
        <Row>
          <Col sm={12} md={12} lg={12}>
            <div
              className={"toggle rotate" + (isOpen ? " active" : "")}
              onClick={() => closeForm()}
            >
              {isOpen ? (
                <CloseIcon style={{ fill: "white" }} />
              ) : (
                <span className="name">
                  <b className="color-white">Feedback</b>
                </span>
              )}
            </div>
            <div className="scroll">
              <h5>Feedback</h5>
              <p>
                <b>What would you like to share with us?</b>
              </p>
              <Row className="type">
                <Col
                  xs={4}
                  // sm={6}
                  // md={4}
                  // lg={4}
                  className="feedbbacktype"
                  // style={ { margin: "6px 0 15px 0", paddingLeft: "5px" } }
                >
                  <span
                    className={subject === "Problem" ? "active" : ""}
                    onClick={() => {
                      setSubject("Problem")
                      setContactUsResponseMessage();
                      setContactUsErrorMessage();
                    }}
                  >
                    <AiFillBug /> Problem{" "}
                  </span>
                </Col>

                <Col
                  className="feedbbacktype"
                  xs={4}
                  // sm={6}
                  // md={4}
                  // lg={4}
                  // style={ { margin: "5px 0 15px 0" } }
                >
                  <span
                    className={subject === "Question" ? "active" : ""}
                    onClick={() => {
                      setSubject("Question")
                      setContactUsResponseMessage();
                      setContactUsErrorMessage();
                    }}
                  >
                    <AiFillQuestionCircle /> Question
                  </span>
                </Col>
                <Col
                  className="feedbbacktype"
                  xs={4}
                  // sm={6}
                  // md={4}
                  // lg={4}
                  // style={ { margin: "5px 0 15px 0" } }
                >
                  <span
                    className={subject === "Suggestion" ? "active" : " "}
                    onClick={() => {
                      setSubject("Suggestion")
                      setContactUsResponseMessage();
                      setContactUsErrorMessage();
                    }}
                  >
                    <FaRegLightbulb /> Suggestion
                  </span>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={12} lg={12}>
                  <Typography>
                    <strong>Message *</strong>
                  </Typography>
                  <OutlinedInput
                    id="outlined-full-width"
                    required
                    name="message"
                    value={message}
                    type="text"
                    style={{ margin: "5px 0 0 0" }}
                    placeholder="Your Feedback."
                    error={
                      (formValidated || messageValidated) &&
                      (message.trim() === "" || message.length < 5 || message.length > messageMaxLen)
                    }
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setContactUsResponseMessage();
                      setContactUsErrorMessage();
                      handleWordCount(e);
                    }}
                    onBlur={() => setMessageValidated(true)}
                    // helperText={
                    //   (formValidated || messageValidated) &&
                    //   ((message.trim() === "" && "Please leave us a message.") ||
                    //     ((message.length < 5 || message.length > messageMaxLen) &&
                    //       `Message should be between 5 to ${messageMaxLen} characters`))
                    // }
                    fullWidth
                    multiline
                    rows="3"
                    margin="normal"
                    variant="outlined"
                    inputProps={{
                      minLength: 5,
                      maxLength: messageMaxLen,
                    }}
                  />
                  {/* {(message.length < 5 || message.length > messageMaxLen) && (
                    <FormHelperText className={"error_text"} error>
                      {`Message should be between 5 to ${messageMaxLen} characters`}
                    </FormHelperText>
                  )} */}
                {(formValidated || messageValidated) && (message === "") && (
                  <FormHelperText error>
                    {"Please leave us a message."}
                  </FormHelperText>)}
                {(formValidated || messageValidated) && (message !== "") && (message.length < 5 || message.length > messageMaxLen) && (
                  <FormHelperText error>
                    {`Message should be between 5 to ${messageMaxLen} characters`}
                  </FormHelperText>)}
                  <div className={"text-end text-muted"} style={{ marginTop: "15px" }}>
                    {messageCharsLeft}/{messageMaxLen}
                  </div>
                </Col>

                <Col sm={12} md={12} lg={12} style={{ marginBottom: "15px" }}>
                  <Typography>
                    <strong>Name * </strong>
                  </Typography>
                  <OutlinedInput
                    id="outlined-full-width"
                    required
                    type="text"
                    name="fname"
                    value={fname}
                    classes={{
                      input: 'input-auto',
                    }}
                    placeholder="Your Name (will not be published)"
                    error={(formValidated || fNameValidated) && fname.trim() === ""}
                    onChange={(e) => {
                      setFName(e.target.value);
                      setContactUsResponseMessage();
                      setContactUsErrorMessage();
                    }}
                    onBlur={() => setFNameValidated(true)}
                    // helperText={
                    //   (formValidated || fNameValidated) && fname.trim() === "" && "Name is required."
                    // }
                    onInput={(e) => onlyText(e)}
                    style={{ margin: "5px 0 0 0" }}
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    inputProps={{
                      maxLength: 64,
                    }}
                  />
                {(formValidated || fNameValidated) && (fname.trim() === "") && (
                  <FormHelperText error>
                    {"Name is required."}
                  </FormHelperText>
                )}
                </Col>

                <Col sm={12} md={12} lg={12} style={{ marginBottom: "15px" }}>
                  <Typography>
                    <strong>Email *</strong>
                  </Typography>
                  <OutlinedInput
                    id="email"
                    required
                    type="email"
                    name="email"
                    value={email}
                    style={{ margin: "5px 0 0 0" }}
                    classes={{
                      input: 'input-auto',
                    }}
                    placeholder="Your Email (will not be published)"
                    error={(formValidated || emailValidated) && !validEmail}
                    onChange={(e) => {
                      var emailVal = e.target.value;
                      setValidEmail(validateEmail(emailVal));
                      setEmail(emailVal); //setContactUsData({email: emailVal})
                      setContactUsResponseMessage();
                      setContactUsErrorMessage();
                    }}
                    onBlur={() => setEmailValidated(true)}
                    // helperText={
                    //   (formValidated || emailValidated) &&
                    //   !validEmail &&
                    //   "Please enter a valid email."
                    // }
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    inputProps={{
                      maxLength: 128,
                    }}
                  />
                  {(formValidated || emailValidated) && !validEmail && (
                    <FormHelperText error>
                      {"Please enter a valid email."}
                    </FormHelperText>
                  )}
                </Col>
              </Row>

              <div className={`alert-success ${contactUsResponseMessage ? "alert" : ""}`}>
                <strong>{contactUsResponseMessage}</strong>
              </div>
              <div className={`alert-danger ${contactUsErrorMessage ? "alert" : ""}`}>
                <strong>{contactUsErrorMessage}</strong>
              </div>
              <Button
                className="gg-btn-blue"
                style={{ margin: "10px 0" }}
                type="submit"
                onClick={() => setFormValidated(true)}
              >
                Submit
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </form>
  );
};
export default FeedbackWidget;