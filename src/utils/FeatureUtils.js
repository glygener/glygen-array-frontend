export const viewGlycoPeptide = row => {
  let glycoPeptideId =
    row.original && row.original.glycoPeptide
      ? row.original.glycoPeptide.id
      : row.original && row.original.id
      ? row.original.id
      : row.id;

  window.open(`/features/viewFeature/${glycoPeptideId}`, "_blank");
};

export function getSource(sourceInfo) {
  let source = {};
  if (sourceInfo.type === "COMMERCIAL") {
    let comm = getCommercial(sourceInfo);
    source.commercial = comm;
  } else if (sourceInfo.type === "NONCOMMERCIAL") {
    let nonComm = getNonCommercial(sourceInfo);
    source.nonCommercial = nonComm;
  }

  return source;
}

export function getCommercial(source) {
  let comm = {};

  if (source.commercial) {
    comm.vendor = source.commercial.vendor;
    comm.catalogueNumber = source.commercialcatalogueNumber;
    comm.batchId = source.commercial.batchId;
  } else {
    comm.vendor = source.vendor;
    comm.catalogueNumber = source.catalogueNumber;
    comm.batchId = source.batchId;
  }

  return comm;
}

export function getNonCommercial(source) {
  let nonComm = {};

  if (source.nonCommercial) {
    nonComm.providerLab = source.nonCommercial.providerLab;
    nonComm.method = source.nonCommercial.method;
    nonComm.batchId = source.nonCommercial.batchId;
    nonComm.sourceComment = source.nonCommercial.sourceComment;
  } else {
    nonComm.providerLab = source.providerLab;
    nonComm.method = source.method;
    nonComm.batchId = source.batchId;
    nonComm.sourceComment = source.comment;
  }

  return nonComm;
}
