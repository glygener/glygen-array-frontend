/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import ReactTable from "react-table";
import { useHistory, Link } from "react-router-dom";
import { StructureImage } from "../components/StructureImage";
import { PageHeading } from "../components/FormControls";
import Container from "@material-ui/core/Container";
import { Card, Button } from "react-bootstrap";

const AddMultipleGlycanDetails = props => {
  const history = useHistory();

  let uploadResponse = history.location && history.location.state && history.location.state.uploadResponse;
  let addedGlycans = uploadResponse.addedGlycans;
  let wrongSequences = uploadResponse.wrongSequences;
  let duplicateSequences = uploadResponse.duplicateSequences;

  const getTableForGlycans = (data, columns, sectionTitle) => {
    return (
      <>
        <h4>{sectionTitle}</h4>
        <br />
        <ReactTable
          data={data}
          columns={
            columns
              ? columns
              : [
                  {
                    Header: "Internal Id",
                    accessor: "internalId"
                  },
                  {
                    Header: "GlyTouCan ID",
                    accessor: "glytoucanId"
                  },
                  {
                    Header: "Name",
                    accessor: "name"
                  },
                  {
                    Header: "Structure Image",
                    accessor: "cartoon",
                    sortable: false,
                    // eslint-disable-next-line react/prop-types
                    Cell: row => row.value && <StructureImage base64={row.value} />,
                    minWidth: 300
                  },
                  {
                    Header: "Mass",
                    accessor: "mass",
                    // eslint-disable-next-line react/prop-types
                    Cell: row => (row.value ? parseFloat(row.value).toFixed(4) : "")
                  }
                ]
          }
          pageSizeOptions={[5, 10, 25]}
          defaultPageSize={5}
          pageSize={5}
          // loading={loading}
          keyColumn="id"
          showPaginationTop
          sortable={true}
        />
      </>
    );
  };

  const details = () => {
    return (
      <>
        {addedGlycans && (
          <div style={{ marginTop: "5%" }}>
            {getTableForGlycans(addedGlycans ? addedGlycans : [], "", "Glycans successful uploaded")}
          </div>
        )}

        {duplicateSequences && (
          <div style={{ marginTop: "5%", marginBottom: "5%" }}>
            {getTableForGlycans(duplicateSequences ? duplicateSequences : [], "", "Glycans already exist")}
          </div>
        )}

        {wrongSequences &&
          getTableForGlycans(
            wrongSequences ? wrongSequences : [],
            [
              {
                Header: "Id",
                accessor: "id",
                minWidth: 80,
                Cell: row => {
                  return row.original.glycan && row.original.glycan.id;
                }
              },
              {
                Header: "Sequence",
                accessor: "sequence",
                minWidth: 130,
                getProps: (state, rowInfo, column) => {
                  return {
                    style: {
                      whiteSpace: "initial"
                    }
                  };
                },
                Cell: row => {
                  return row.original.glycan && row.original.glycan.sequence;
                }
              },
              {
                Header: "Error message",
                accessor: "errorMessage",
                minWidth: 80,
                Cell: row => {
                  return (
                    row.original.error &&
                    row.original.error.errors &&
                    row.original.error.errors.map(err => {
                      return <div style={{ textAlign: "center" }}>{err.defaultMessage}</div>;
                    })
                  );
                }
              }
            ],
            "Glycan could not be uploaded"
          )}
      </>
    );
  };

  const getSummary = () => {
    let summaryLinks = [
      {
        tableLink: `${(addedGlycans && addedGlycans.length) || 0} glycans successful uploaded`,
        scrollto: 100
      },
      {
        tableLink: `${(duplicateSequences && duplicateSequences.length) || 0} glycans already exist in library`,
        scrollto: 550
      },
      {
        tableLink: `${(wrongSequences && wrongSequences.length) || 0} glycans could not be uploaded`,
        scrollto: 2500
      }
    ];

    return (
      <>
        <ul>
          {summaryLinks.map((linkGlycans, index) => {
            return (
              <div className={"summar-links"} key={index}>
                <li style={{ textAlign: "left" }} onClick={() => window.scrollTo(0, linkGlycans.scrollto)}>
                  {linkGlycans.tableLink}
                </li>
              </div>
            );
          })}
        </ul>
      </>
    );
  };

  return (
    <>
      <Container maxWidth="lg">
        <div className="page-container">
          <PageHeading title={"Glycan File Upload Details"} />
          <Card>
            <Card.Body>
              {(duplicateSequences || addedGlycans || wrongSequences) && getSummary()}
              {details()}
            </Card.Body>
          </Card>
          <div className="text-center mb-4">
            &nbsp;&nbsp;
            <Link to="/glycans">
              <Button className="gg-btn-blue mt-2 gg-mr-20"> Back to Glycans</Button>
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
};

export { AddMultipleGlycanDetails };
