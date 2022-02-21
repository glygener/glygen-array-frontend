/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { wsCall } from "../utils/wsUtils";

const CoOwnersandCollabs = props => {
  const [data, setData] = useState();

  useEffect(() => {
    if (props.type === "coowners") {
      wsCall(
        "listcoowners",
        "GET",
        { arraydatasetId: props.experimentId },
        true,
        null,
        response =>
          response.json().then(responseJson => {
            setData(responseJson);
          }),
        response =>
          response.json().then(responseJson => {
            console.log(responseJson);
          })
      );
    } else if (props.type === "collaborators") {
      setData(props.collaborators);
    }
  }, [props.experimentId]);

  return (
    <>
      <ReactTable
        data={data}
        columns={[
          {
            Header: "Username",
            // accessor: "name",
            Cell: row => {
              return row.original.name ? row.original.name : row.original.userName;
            }
          },
          {
            Header: "FirstName",
            accessor: "firstName"
          },
          {
            Header: "LastName",
            accessor: "lastName"
          },
          {
            Header: "Organization",
            accessor: "affiliation"
          },
          {
            Header: "Actions",
            Cell: (row, index) => (
              <div style={{ textAlign: "center" }}>
                <FontAwesomeIcon
                  key={"delete" + index}
                  icon={["far", "trash-alt"]}
                  size="lg"
                  title="Delete"
                  className="caution-color table-btn"
                  onClick={() => props.delete(row.original.name, props.deleteWsCall)}
                />
              </div>
            ),
            minWidth: 60
          }
        ]}
        className={"-striped -highlight"}
        defaultPageSize={5}
        showPagination={false}
      />
    </>
  );
};

CoOwnersandCollabs.propTypes = {
  delete: PropTypes.func,
  collaborators: PropTypes.array,
  coowners: PropTypes.array,
  type: PropTypes.string,
  experimentId: PropTypes.string,
  deleteWsCall: PropTypes.string
};

export { CoOwnersandCollabs };
