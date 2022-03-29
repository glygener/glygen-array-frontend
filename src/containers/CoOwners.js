/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { wsCall } from "../utils/wsUtils";
import { LineTooltip } from "../components/tooltip/LineTooltip";

const CoOwners = props => {
  const [data, setData] = useState();

  useEffect(() => {
    listCoOwners();
  }, [props.experimentId]);

  const listCoOwners = () => {
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
  };

  const checkRefreshList = () => {
    if (props.refreshListCoOwners) {
      listCoOwners();
      props.setRefreshListCoOwners(false);
    }
  };
  return (
    <>
      {checkRefreshList()}

      <ReactTable
        data={data}
        columns={[
          {
            Header: "Username",
            accessor: "userName",
          },
          {
            Header: "FirstName",
            accessor: "firstName",
          },
          {
            Header: "LastName",
            accessor: "lastName",
          },
          {
            Header: "Organization",
            accessor: "affiliation",
          },
          {
            Header: "Actions",
            Cell: (row, index) => (
              <div style={{ textAlign: "center" }}>
                <LineTooltip text="Delete Co-Owner">
                  <span>
                    <FontAwesomeIcon
                      key={"delete" + index}
                      icon={["far", "trash-alt"]}
                      size="lg"
                      title="Delete"
                      className="caution-color table-btn"
                      onClick={() => props.delete(row.original.userName, props.deleteWsCall)}
                    />
                  </span>
                </LineTooltip>
              </div>
            ),
            minWidth: 60,
          },
        ]}
        className={"-striped -highlight"}
        defaultPageSize={data && data.length > 10 ? data.length : 5}
        // showPagination={false}
        minRows={0}
        NoDataComponent={({ state, ...rest }) =>
          !state?.loading ? (
            <p className="pt-2 text-center">
              <strong>No data available </strong>
            </p>
          ) : null
        }
        showPaginationTop
      />
    </>
  );
};

CoOwners.propTypes = {
  delete: PropTypes.func,
  experimentId: PropTypes.string,
  deleteWsCall: PropTypes.string,
  setRefreshListCoOwners: PropTypes.func,
  refreshListCoOwners: PropTypes.bool
};

export { CoOwners };
