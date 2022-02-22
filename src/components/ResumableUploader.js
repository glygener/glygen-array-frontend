import React, { useEffect, useState, useReducer } from "react";
import PropTypes from "prop-types";
import { ReactResumableJs } from "./ReactResumableJS";
import { Button, Form } from "react-bootstrap";

const ResumableUploader = props => {
  const [maxFiles, setMaxFiles] = useState();

  const fileState = {
    files: [],
    message: "",
    fileId: "",
    description: ""
  };

  const [fileStateReducer, setFileStateReducer] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    fileState
  );

  useEffect(() => {
    setMaxFiles(props.maxFiles);
  }, []);

  const setFiles = (file, message) => {
    let obj = JSON.parse(message);
    let files = fileStateReducer.files.slice(1, maxFiles);
    files.push(file);

    setFileStateReducer({
      files: files,
      message: obj.statusCode,
      fileId: obj.assignedFileName
    });

    props.setUploadedFile && props.setUploadedFile(obj.file);
  };

  const handleClose = () => {
    setFileStateReducer({ files: [], message: 400, fileId: "" });
  };

  const handleSubmit = e => {
    e.preventDefault();
    props.onProcessFile(fileStateReducer.fileId);
  };

  const getUploadForm = () => {
    return (
      <Form onSubmit={handleSubmit}>
        <div>
          <ReactResumableJs
            uploaderID="default-resumable-uploader"
            dropTargetID="myDropTarget"
            fileAccept={props.fileType}
            chunkSize={1 * 1024 * 1024}
            tmpDir="http://localhost:3000/tmp/"
            maxFileSize={10 * 1024 * 1024 * 1024}
            fileAddedMessage="Started!"
            completedMessage="Complete!"
            service={props.uploadService}
            testChunks={true}
            testMethod="GET"
            headerObject={props.headerObject}
            // textLabel="Choose upload file"
            startButton={true}
            cancelButton={true}
            pauseButton={true}
            previousText="Drop to upload your media:"
            disableDragAndDrop={false}
            onFileSuccess={(file, message) => {
              setFiles(file, message);
            }}
            onFileRemoved={file => {
              // fetch()
              setFileStateReducer({
                message: ""
              });
              return file;
            }}
            maxFiles={maxFiles}
            filetypes={props.filetypes}
          />
        </div>

        {props.enableSubmit && (
          <div className="text-center mb-2 mt-4">
            <Button className="gg-btn-blue mt-2 gg-mr-20" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!fileStateReducer.message || fileStateReducer.message !== 200}
              className="gg-btn-blue mt-2 gg-ml-20"
            >
              Submit
            </Button>
          </div>
        )}
      </Form>
    );
  };

  return props.enableSubmit ? getUploadForm() : getUploadForm();
};

ResumableUploader.propTypes = {
  history: PropTypes.object,
  headerObject: PropTypes.object,
  fileType: PropTypes.string,
  uploadService: PropTypes.string,
  maxFiles: PropTypes.number,
  onProcessFile: PropTypes.func,
  setUploadedFile: PropTypes.func,
  enableSubmit: PropTypes.bool,
  filetypes: PropTypes.array
};

export { ResumableUploader };
