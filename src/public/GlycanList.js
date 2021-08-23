import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { useParams } from "react-router-dom";
import Container from "@material-ui/core/Container";
// import PageLoader from "../components/load/PageLoader";
import GlycanListSummary from "../components/GlycanListSummary";
// import { Link } from "react-router-dom";
// import LineTooltip from "../components/tooltip/LineTooltip";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import Grid from "@material-ui/core/Grid";
import { PublicListDataset } from "./PublicListDataset";
import { Card } from "react-bootstrap";
import { SearchTable } from "../components/search/SearchTable";
import { StructureImage } from "../components/StructureImage";

const GlycanList = (props) => {
  const {searchId} = useParams();

  const [query, setQuery] = useState([]);
  const [timestamp, setTimeStamp] = useState();
  const [totalSize, setTotalSize] = useState();

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();



  // const handleModifySearch = () => {
  //   props.history.push(routeConstants.idMapping + id);
  // };

  // useEffect(() => {
  //   // listGlycans(["G69411IG"], 1, 10000);
  //   listGlycans();
  // }, []);

  return (
    <>
      {/* <Helmet>
        <title>{head.glycans.title}</title>
        {getMeta(head.glycans)}
      </Helmet> */}

      <Container maxWidth="xl" className="gg-container">
        {showErrorSummary === true && (
          <ErrorSummary
            show={showErrorSummary}
            form="listglycansforsearch"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}
        <section className="content-box-md">
          {query && (
            <GlycanListSummary
              data={query}
              totalSize={totalSize}
              timestamp={timestamp}
              // onModifySearch={handleModifySearch}
            />
          )}
        </section>
        <Grid container style={{ marginTop: "32px" }}>
          <Grid item xs={12} sm={12} style={{ backgroundColor: "white" }}>
            <Card>
              <SearchTable
                columns={[
                  {
                    Header: "Glycan ID",
                    accessor: "id"
                  },
                  {
                    Header: "GlyTouCan ID",
                    accessor: "glytoucanId",
                    sortable: true,
                  },
                  {
                    Header: "Structure Image",
                    accessor: "cartoon",
                    sortable: false,
                    // eslint-disable-next-line react/prop-types
                    Cell: (row) => (
                      <StructureImage
                        base64={row.original.glycan.cartoon}
                      ></StructureImage>
                    ),
                    // minWidth: 300,
                  },
                  {
                    Header: "Mass",
                    accessor: "mass",
                    // // eslint-disable-next-line react/prop-types
                   Cell: (row) =>
                    row.value ? parseFloat(row.value).toFixed(2) : "",
                  },
                  {
                    Header: "Dataset Count",
                    accessor: "datasetCount",
                  },
                ]}
                defaultPageSize={10}
                defaultSortColumn="searchId"
                showCommentsButton={false}
                showDeleteButton={false}
                // showSearchBox
                showEditButton={false}
                // commentsRefColumn="description"
                fetchWS="listglycansforsearch"
                // deleteWS="glycandelete"
                // editUrl="glycans/editglycan"
                keyColumn="searchId"
                showRowsInfo
                infoRowsText="Glycans"
                // searchId="1.0mass2000.0981980773glytoucan"
                searchId={searchId}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default GlycanList;
