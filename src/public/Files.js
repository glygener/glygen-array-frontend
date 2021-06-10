/* eslint-disable react/display-name */
import React from "react";
import PropTypes from "prop-types";
import metadataIcon from "../images/metadataIcon.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTable from "react-table";
import "../public/Files.css";
import { downloadFile } from "../utils/commonUtils";
// import CardLoader from "../components/CardLoader";

const Files = props => {
  let listFiles = [];
  // const [showLoading, setShowLoading] = useState(true);

  const getFileDataType = (row, index) => {
    if (!row.original.file.identifier.includes("txt") && !row.original.file.identifier.includes("xls")) {
      if (
        (props.dataset.images.length - (props.dataset.images.length - 1) === 1 && index === 0) ||
        (props.dataset.images.length === 1 && index === 0)
      ) {
        return "Image";
      }
    } else if (row.original.file.identifier.includes("txt")) {
      return "Raw Data";
    } else if (row.original.file.identifier.includes("xls")) {
      if (
        props.dataset.images[0].rawData.processedDataList.length -
          (props.dataset.images[0].rawData.processedDataList.length - 1) ===
        1
      ) {
        return "Processed Data";
      }
    }
  };

  const getFiles = () => {
    return (
      <>
        <ReactTable
          data={listFiles}
          columns={[
            {
              Header: () => <div className={"table-header"}>{"Data Type"}</div>,
              Cell: row => {
                return row.original.file && getFileDataType(row, row.index);
              }
            },
            {
              Header: () => <div className={"table-header"}>{"Name"}</div>,
              Cell: row => row.original.file && row.original.file.originalName
            },
            {
              Header: () => <div className={"table-header"}>{"Type"}</div>,
              Cell: row => row.original.file && row.original.file.identifier
            },
            {
              Header: () => <div className={"table-header"}>{"Size"}</div>,
              Cell: row => row.original.file && row.original.file.fileSize
            },
            {
              Header: () => <div className={"table-header"}>{"Download"}</div>,
              Cell: row =>
                row.original.file && (
                  <FontAwesomeIcon
                    className="table-btn download-btn"
                    icon={["fas", "download"]}
                    size="lg"
                    title="Download Metadata"
                    onClick={() => {
                      downloadFile(
                        row.original.file,
                        props.setPageErrorsJson,
                        props.setPageErrorMessage,
                        props.setShowErrorSummary,
                        "publicfiledownload"
                      );
                    }}
                  />
                )
            },
            {
              Header: () => <div className={"table-header"}>{"Metadata"}</div>,
              Cell: () => (
                <img
                  className="table-btn image-icon"
                  src={metadataIcon}
                  alt="Mirage"
                  title="Metadata"
                  aria-hidden="true"
                  onClick={() => {
                    props.setEnableMetadata(true);
                  }}
                />
              )
            }
          ]}
          defaultPageSize={listFiles.length}
          loading={listFiles.length < 1 ? true : false}
          // loadingText={<CardLoader pageLoading={listFiles.length < 1} />}
          showPaginationTop={true}
          showPaginationBottom={false}
          showPageSizeOptions={true}
        />
      </>
    );
  };

  const getFileTable = () => {
    let fileObjects = ["images", "rawDataList"];

    fileObjects.forEach(ele => {
      props.dataset[ele].forEach(fileObject => {
        if (ele === "rawDataList") {
          listFiles.push(fileObject);
          listFiles.push(fileObject.processedDataList[0]);
        } else {
          listFiles.push(fileObject);
        }
      });
    });

    return getFiles();
  };

  return (
    <>
      {/* {showLoading ? <CardLoader pageLoading={showLoading} /> : ""} */}
      {getFileTable()}
    </>
  );
};

Files.propTypes = {
  dataset: PropTypes.object,
  setEnableMetadata: PropTypes.func,
  setPageErrorsJson: PropTypes.func,
  setPageErrorMessage: PropTypes.func,
  setShowErrorSummary: PropTypes.func
};

export default Files;
