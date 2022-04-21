import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams, Link, useHistory } from "react-router-dom";
import Container from "@material-ui/core/Container";
import GlycanListSummary from "../components/GlycanListSummary";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import Grid from "@material-ui/core/Grid";
import { GlygenTable } from "../components/GlygenTable";
import { StructureImage } from "../components/StructureImage";
import glygenNotFoundSmall from "../images/glygenNotFoundSmall.svg";
import { addCommas } from "../utils/commonUtils";
// import { Loading } from "../components/Loading";

const GlycanList = (props) => {
  const { searchId } = useParams();
  const history = useHistory();

  const [query, setQuery] = useState(null);
  const [timestamp, setTimeStamp] = useState();

  // const [showLoading, setShowLoading] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState();

  const handleModifySearch = () => {
    history.push("/glycanSearch/" + searchId);
  };

  useEffect(() => {
    // setShowLoading(true);
    wsCall(
      "listglycansforsearch",
      "GET",
      {
        offset: 0,
        limit: 1,
        searchId,
      },
      true,
      null,
      glycanSearchSuccess,
      glycanSearchFailure
    );
  }, [searchId]);

  const glycanSearchSuccess = (response) => {
    // setShowLoading(false);
    response.json().then((data) => setQuery(data.input));
  };

  const glycanSearchFailure = (response) => {
    response.json().then((resp) => {
      console.log(resp);
      setPageErrorsJson(resp);
      setShowErrorSummary(true);
      setPageErrorMessage("");
    });
  };

  return (
    <>
      <Helmet>
        <title>{head.glycanList.title}</title>
        {getMeta(head.glycanList)}
      </Helmet>

      <Container maxWidth="xl" className="gg-container">
        {/* <Loading show={showLoading} /> */}

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
              timestamp={timestamp}
              onModifySearch={handleModifySearch}
              searchId={searchId}
            />
          )}
        </section>
        <Grid container>
          <Grid item xs={12} sm={12}>
            <div>
              <GlygenTable
                columns={[
                  {
                    Header: "Glycan ID",
                    accessor: "id",
                    Cell: row => (
                      <LineTooltip text="View Glycan Details">
                        <Link to={`/glycanDetail/${row.original.id}`}>{row.original.id}</Link>
                      </LineTooltip>
                    ),
                  },
                  {
                    Header: "GlyTouCan ID",
                    accessor: "glytoucanId",
                    Cell: row => (row.value ? row.value : ""),
                  },
                  {
                    Header: "Structure Image",
                    // accessor: "cartoon",
                    sortable: false,
                    // eslint-disable-next-line react/prop-types
                    // Cell: (row) => (
                    //   <StructureImage base64={row.original.glycan.cartoon}></StructureImage>
                    // ),
                    Cell: row =>
                      row.original.glycan.cartoon ? (
                        <StructureImage base64={row.original.glycan.cartoon}></StructureImage>
                      ) : (
                        <StructureImage imgUrl={glygenNotFoundSmall}></StructureImage>
                      ),

                    minWidth: 200,
                  },
                  {
                    Header: "Monoisotopic Mass (Da)",
                    accessor: "mass",
                    // // eslint-disable-next-line react/prop-types
                    Cell: row => (row.value ? addCommas(parseFloat(row.value).toFixed(2)) : ""),
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
                showEditButton={false}
                fetchWS="listglycansforsearch"
                keyColumn="searchId"
                showRowsInfo
                infoRowsText="Glycans"
                qsParams={{ searchId }}
              />
            </div>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default GlycanList;
