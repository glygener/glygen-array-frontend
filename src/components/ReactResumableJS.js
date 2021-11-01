/* eslint-disable react/prop-types */
/** Modified original library to suit needs of showing progress */
import React from "react";
import Resumablejs from "resumablejs";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import "./ReactResumable.css";
import Button from "react-bootstrap/Button";

export class ReactResumableJs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progressBar: 0,
      messageStatus: "",
      fileList: { files: [] },
      isPaused: false,
      isUploading: false,
    };

    this.resumable = null;
  }

  componentDidMount = () => {
    let ResumableField = new Resumablejs({
      target: this.props.service,
      query: this.props.query || {},
      fileType: this.props.filetypes,
      maxFiles: this.props.maxFiles,
      maxFileSize: this.props.maxFileSize,
      fileTypeErrorCallback: (file, errorCount) => {
        if (typeof this.props.onFileAddedError === "function") {
          this.props.onFileAddedError(file, errorCount);
        }
      },
      maxFileSizeErrorCallback: (file, errorCount) => {
        if (typeof this.props.onMaxFileSizeErrorCallback === "function") {
          this.props.onMaxFileSizeErrorCallback(file, errorCount);
        }
      },
      testMethod: this.props.testMethod || "post",
      testChunks: this.props.testChunks || false,
      throttleProgressCallbacks: 1,
      headers: this.props.headerObject || {},
      method: "octet",
      chunkSize: this.props.chunkSize,
      simultaneousUploads: this.props.simultaneousUploads,
      fileParameterName: this.props.fileParameterName,
      generateUniqueIdentifier: this.props.generateUniqueIdentifier,
      forceChunkSize: this.props.forceChunkSize,
    });

    if (typeof this.props.maxFilesErrorCallback === "function") {
      ResumableField.opts.maxFilesErrorCallback = this.props.maxFilesErrorCallback;
    }

    ResumableField.assignBrowse(this.uploader);

    //Enable or Disable DragAnd Drop
    if (this.props.disableDragAndDrop === false) {
      ResumableField.assignDrop(this.dropZone);
    }

    ResumableField.on("fileAdded", (file) => {
      this.setState({
        messageStatus: this.props.fileAddedMessage || " Starting upload! ",
      });

      if (typeof this.props.onFileAdded === "function") {
        this.props.onFileAdded(file, this.resumable);
      } else {
        ResumableField.upload();
      }
    });

    ResumableField.on("fileSuccess", (file, fileServer) => {
      if (this.props.fileNameServer) {
        let objectServer = JSON.parse(fileServer);
        file.fileName = objectServer[this.props.fileNameServer];
      } else {
        file.fileName = fileServer;
      }

      let currentFiles = this.state.fileList.files.slice(1, this.props.maxFiles);
      currentFiles.push(file);

      this.setState(
        {
          fileList: { files: currentFiles },
          messageStatus: this.props.completedMessage + file.fileName || fileServer,
        },
        () => {
          if (typeof this.props.onFileSuccess === "function") {
            this.props.onFileSuccess(file, fileServer);
          }
        }
      );
    });

    ResumableField.on("progress", () => {
      this.setState({
        isUploading: ResumableField.isUploading(),
      });

      if (ResumableField.progress() * 100 < 100) {
        this.setState({
          messageStatus: parseInt(ResumableField.progress() * 100, 10) + "%",
          progressBar: ResumableField.progress() * 100,
        });
      } else {
        setTimeout(() => {
          this.setState({
            progressBar: 0,
          });
        }, 1000);
      }
    });

    ResumableField.on("fileError", (file, errorCount) => {
      this.props.onUploadErrorCallback(file, errorCount);
    });

    this.resumable = ResumableField;
  };

  removeFile = (event, file, index) => {
    event.preventDefault();

    let currentFileList = this.state.fileList.files;

    currentFileList = currentFileList.splice(0, index);

    this.setState({
      fileList: { files: currentFileList },
    });

    this.props.onFileRemoved(file);
    this.resumable.removeFile(file);
  };

  createFileList = () => {
    let markup = this.state.fileList.files.map((file, index) => {
      let uniqID = this.props.uploaderID + "-" + index;
      let originFile = file.file;
      let media = "";

      if (file.file.type.indexOf("video") > -1) {
        media = (
          <Typography variant="h3" gutterBottom>
            {originFile.name}
          </Typography>
        );
        return (
          <li className="thumbnail" key={uniqID}>
            <label id={"media_" + uniqID}>{media}</label>
            <Button
              className={"lnk-btn ml-2"}
              variant="link"
              onClick={(event) => this.removeFile(event, file, index)}
            >
              Remove
            </Button>
          </li>
        );
      } else if (file.file.type.indexOf("image") > -1)
        if (this.props.tmpDir !== "") {
          // let src = this.props.tmpDir + file.fileName;
          media = originFile.name;

          // originFile.name + <img className="image" width="80" src={src} alt="" />;
          return (
            <li className="thumbnail" key={uniqID}>
              <label id={"media_" + uniqID}>{media}</label>
              <Button
                className={"lnk-btn ml-2"}
                variant="link"
                onClick={(event) => {
                  this.removeFile(event, file, index);
                }}
              >
                Remove
              </Button>
            </li>
          );
        } else {
          let fileReader = new FileReader();
          fileReader.readAsDataURL(originFile);
          fileReader.onload = (event) => {
            media = '<img class="image" width="80" src="' + event.target.result + '"/>';
            document.querySelector("#media_" + uniqID).innerHTML = media;
          };
          return (
            <li className="thumbnail" key={uniqID}>
              <label id={"media_" + uniqID} />
              <Button
                className={"lnk-btn ml-2"}
                variant="link"
                onClick={(event) => this.removeFile(event, file, index)}
              >
                Remove
              </Button>
            </li>
          );
        }
      else {
        media = <label className="document mb-0 pb-0">{originFile.name}</label>;
        return (
          <li className="thumbnail mb-0 pb-0 pt-2" key={uniqID}>
            <label id={"media_" + uniqID}>{media}</label>
            <Button
              className={"lnk-btn ml-2"}
              variant="link"
              onClick={(event) => this.removeFile(event, file, index)}
            >
              Remove
            </Button>
          </li>
        );
      }
    });

    return <ul id={"items-" + this.props.uploaderID}>{markup}</ul>;
  };

  cancelUpload = () => {
    this.resumable.cancel();

    this.setState({
      fileList: { files: [] },
    });

    this.props.onCancelUpload();
  };

  pauseUpload = () => {
    if (!this.state.isPaused) {
      this.resumable.pause();
      this.setState({
        isPaused: true,
      });
      this.props.onPauseUpload();
    } else {
      this.resumable.upload();
      this.setState({
        isPaused: false,
      });
      this.props.onResumeUpload();
    }
  };

  startUpload = () => {
    this.resumable.upload();
    this.setState({
      isPaused: false,
    });
    this.props.onStartUpload();
  };

  render() {
    let fileList = null;
    if (this.props.showFileList) {
      fileList = <div className="resumable-list">{this.createFileList()}</div>;
    }

    // let previousText = null;
    // if (this.props.previousText) {

    //     if (typeof this.props.previousText ==="string") previousText = <p>{this.props.previousText}</p>
    //     else previousText = this.props.previousText
    // }

    let textLabel = null;
    if (this.props.textLabel) {
      textLabel = this.props.textLabel;
    }

    let startButton = null;
    if (this.props.startButton) {
      if (typeof this.props.startButton === "string" || typeof this.props.startButton === "boolean")
        startButton = (
          <label>
            <button disabled={this.state.isUploading} className="start" onClick={this.startUpload}>
              {this.props.startButton && "Resume"}
            </button>
          </label>
        );
      else startButton = this.props.startButton;
    }

    let cancelButton = null;
    if (this.props.cancelButton) {
      if (
        typeof this.props.cancelButton === "string" ||
        typeof this.props.cancelButton === "boolean"
      )
        cancelButton = (
          <label>
            <button onClick={this.cancelUpload}>{this.props.cancelButton && "Cancel"}</button>
          </label>
        );
      else cancelButton = this.props.cancelButton;
    }

    let pauseButton = null;
    if (this.props.pauseButton) {
      if (typeof this.props.pauseButton === "string" || typeof this.props.pauseButton === "boolean")
        pauseButton = (
          <label>
            <button disabled={!this.state.isUploading} onClick={this.pauseUpload}>
              {this.props.pauseButton && "Pause"}
            </button>
          </label>
        );
      else pauseButton = this.props.pauseButton;
    }

    return (
      <div id={this.props.dropTargetID} ref={(node) => (this.dropZone = node)}>
        {}
        <label
          style={{ disabled: this.props.disableInput ? true : false }}
          className={
            this.props.disableInput
              ? "btn file-upload pl-0 ml-0 mb-0 pb-0 disabled"
              : "btn file-upload pl-0 ml-0 mb-0 pb-0"
          }
        >
          {textLabel}
          <input
            ref={(node) => (this.uploader = node)}
            type="file"
            id={this.props.uploaderID}
            className={
              "btn ml-0 pl-0 mb-0 pb-0" +
              (this.state.fileList.files.length > 0 ? " file-input-no-file-chosen-hider" : "")
            }
            name={this.props.uploaderID + "-upload"}
            accept={this.props.fileAccept || "*/*"}
            disabled={this.props.disableInput || false}
          />
        </label>
        {/* <br /> */}
        <div style={{ outline: this.state.progressBar === 0 ? "none" : "2px solid black" }}>
          <div
            className="progress"
            style={{ display: this.state.progressBar === 0 ? "none" : "block", padding: "40px" }}
          >
            <div className="progress-bar" style={{ width: this.state.progressBar + "%" }}></div>
            <LinearProgress variant="determinate" value={this.state.progressBar} />
            {startButton}
            {pauseButton}
            {cancelButton}
          </div>
        </div>
        {fileList}
      </div>
    );
  }
}

ReactResumableJs.defaultProps = {
  maxFiles: undefined,
  uploaderID: "default-resumable-uploader",
  dropTargetID: "dropTarget",
  filetypes: [],
  fileAccept: "*/*",
  maxFileSize: 10240000,
  showFileList: true,
  onUploadErrorCallback: (file, errorCount) => {
    console.log("error", file, errorCount);
  },
  onFileRemoved: function (file) {
    return file;
  },
  onCancelUpload: function () {
    return true;
  },
  onPauseUpload: function () {
    return true;
  },
  onResumeUpload: function () {
    return true;
  },
  onStartUpload: function () {
    return true;
  },
  disableDragAndDrop: false,
  fileNameServer: "",
  tmpDir: "",
  chunkSize: 1024 * 1024,
  simultaneousUploads: 1,
  fileParameterName: "file",
  generateUniqueIdentifier: null,
  maxFilesErrorCallback: null,
  cancelButton: false,
  pause: false,
  startButton: null,
  pauseButton: null,
  previousText: "",
  headerObject: {},
  forceChunkSize: true,
};
