/* eslint-disable react/prop-types */
import React from "react";
import "../containers/Features.css";
import { Link } from "react-router-dom";
import { GlygenTable } from "../components/GlygenTable";
import displayNames from "../appData/displayNames";
import { getToolTip } from "../utils/commonUtils";

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
            Header: "Feature Id",
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
            accessor: "linker",
            // eslint-disable-next-line react/display-name
            Cell: ({ value, index }) =>
              value && value.name ? (
                <Link key={index} to={"/linkers/editlinker/" + value.id} target="_blank">
                  {getToolTip(value.name)}
                </Link>
              ) : (
                ""
              )
          },
          {
            Header: "Linker Type",
            accessor: "linker",
            // eslint-disable-next-line react/display-name
            Cell: ({ row, index }) => {
              return row.original && row.original.glycoPeptide && row.original.glycoPeptide.linker ? (
                <div key={index}>{getToolTip(row.original.glycoPeptide.linker.type)}</div>
              ) : (
                <div key={index}>{getToolTip(row.linker && row.linker.type)}</div>
              );
            }
          }
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
        infoRowsText="Glyco Peptides"
        paramTypeValue={"GLYCOPEPTIDE"}
        selectButtonHeader={props.selectButtonHeader}
        showSelectButton={props.showSelectButton}
        selectButtonHandler={props.selectButtonHandler}
      />
    </>
  );
};

export { GlycoPeptides };
