import React from "react";
import "../components/PublicationCard.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PublicationCard = props => {
  return (
    <>
      <table>
        <tbody>
          <tr className="table-row" key={props.pubIndex + "tr"}>
            <td key={props.pubIndex}>
              <div>
                <h5 style={{ marginBottom: "3px", fontSize: "1.25rem", color: "#4a4a4a" }}>
                  <strong>{props.title}</strong>
                </h5>
              </div>

              <div style={{ textAlign: "left", paddingLeft: "35px" }}>
                <div>{props.authors}</div>
                <div>
                  {props.journal} <span>&nbsp;</span>({props.year})
                </div>
                <div>
                  <FontAwesomeIcon icon={["fas", "book-open"]} size="sm" title="Book" />

                  <span style={{ paddingLeft: "15px" }}>PMID:&nbsp;</span>
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${props.pubmedId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {props.pubmedId}
                  </a>
                </div>
              </div>
            </td>
            {props.enableDelete && (
              <td>
                <FontAwesomeIcon
                  icon={["far", "trash-alt"]}
                  size="xs"
                  title="Delete"
                  className="caution-color table-btn"
                  onClick={() => props.deletePublication(props.id ? props.id : props.pubmedId, "deletePublication")}
                />
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </>
  );
};

PublicationCard.propTypes = {
  pubmedId: PropTypes.number,
  id: PropTypes.number,
  pubIndex: PropTypes.number,
  title: PropTypes.string,
  authors: PropTypes.string,
  journal: PropTypes.string,
  year: PropTypes.number,
  number: PropTypes.string,
  volume: PropTypes.string,
  startPage: PropTypes.string,
  endPage: PropTypes.string,
  doiId: PropTypes.string,
  uri: PropTypes.string,
  enableDelete: PropTypes.bool,
  deletePublication: PropTypes.func
};

export { PublicationCard };
