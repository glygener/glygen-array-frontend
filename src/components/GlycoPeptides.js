/* eslint-disable react/prop-types */
import React from "react";
import "../containers/Features.css";
import { Link } from "react-router-dom";
import { GlygenTable } from "../components/GlygenTable";
import displayNames from "../appData/displayNames";
import { getToolTip } from "../utils/commonUtils";
import { Button } from "@material-ui/core";
import { LineTooltip } from "./tooltip/LineTooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ViewInfoModal } from "./ViewInfoModal";

const GlycoPeptides = props => {
  return (
    <>
      <GlygenTable
        columns={[
          {
            Header: "Name",
            accessor: "name",
            // eslint-disable-next-line react/display-name
            Cell: row => {
              return row.name
                ? getToolTip(row.name)
                : row.original && row.original.glycoPeptide
                ? getToolTip(row.original.glycoPeptide.name)
                : row.original && row.original.name;
            }
          },
          {
            Header: "Feature ID",
            accessor: "internalId",
            Cell: row => {
              return row.internalId
                ? getToolTip(row.internalId)
                : row.original && row.original.glycoPeptide
                ? getToolTip(row.original.glycoPeptide.internalId)
                : row.original && row.original.internalId;
            }
          },
          {
            Header: "Type",
            accessor: "type",
            Cell: row =>
              row.value
                ? getToolTip(displayNames.feature[row.value])
                : row.original && row.original.glycoPeptide
                ? getToolTip(displayNames.feature[row.original.glycoPeptide.type])
                : row.original && getToolTip(displayNames.feature[row.original.type])
          },
          {
            Header: "Linker",
            accessor: "glycoPeptide",
            Cell: (row, index) => {
              debugger;
              return props.setDisplayLinkerInfo &&
                row.original &&
                ((row.original.glycoPeptide && row.original.glycoPeptide.linker) || row.original.linker) ? (
                <>
                  <LineTooltip text="Linker Details">
                    <FontAwesomeIcon
                      key={"linkerView"}
                      icon={["far", "eye"]}
                      alt="View icon"
                      size="lg"
                      color="#45818e"
                      className="tbl-icon-btn"
                      onClick={() => {
                        row.original.glycoPeptide
                          ? props.setDisplayLinkerInfo(row.original.glycoPeptide.linker)
                          : props.setDisplayLinkerInfo(row.original.linker);
                      }}
                    />
                  </LineTooltip>
                </>
              ) : row.original && row.original.linker && row.original.name ? (
                <Link key={index} to={"/linkers/editLinker/" + row.original.linker.id} target="_blank">
                  {getToolTip(row.original.linker.name)}
                </Link>
              ) : (
                "No Linker Selected"
              );
            },
            minWidth: 100
          },
          ...(props.LinkerandRange
            ? [
                {
                  Header: "Range",
                  // eslint-disable-next-line react/display-name
                  Cell: (row, index) => {
                    return row.original &&
                      row.original.range &&
                      row.original.range.maxRange &&
                      row.original.range.minRange ? (
                      <div key={index}>
                        {getToolTip(row.original.range.minRange)} - {getToolTip(row.original.range.maxRange)}
                      </div>
                    ) : (
                      <Button
                        className="gg-btn-outline-reg"
                        onClick={() => {
                          props.setEnableGlycoPeptideRange(true);
                          props.setRowSelectedForRange(row);
                        }}
                      >
                        Add Range
                      </Button>
                    );
                  }
                }
              ]
            : [])
        ]}
        defaultPageSize={10}
        keyColumn="id"
        showRowsInfo
        showSearchBox
        showViewIcon
        showDeleteButton={props.showDeleteButton}
        customDeleteOnClick={props.customDeleteOnClick}
        deleteOnClick={props.deleteOnClick}
        viewUrl="features/viewFeature"
        customViewonClick
        viewOnClick={props.viewOnClick}
        commentsRefColumn="description"
        data={props.data}
        fetchWS={!props.data ? "featurelistbytype" : ""}
        infoRowsText="GlycoPeptides"
        paramTypeValue={"GLYCOPEPTIDE"}
        selectButtonHeader={props.selectButtonHeader}
        showSelectButton={props.showSelectButton}
        selectButtonHandler={props.selectButtonHandler}
      />

      {props.displayLinkerInfo && (
        <ViewInfoModal
          setEnableModal={props.setDisplayLinkerInfo}
          enableModal={props.displayLinkerInfo}
          linker={props.displayLinkerInfo}
          title={"Linker Information"}
          display={"view"}
        />
      )}
    </>
  );
};

export { GlycoPeptides };
