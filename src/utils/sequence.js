const aminoAcidChars = "ABCDEFGHIKLMNPQRSTVWYZ"; //not allowed chars: ["J", "O", "U", "X"];
const seqErrors = {
  HEAD_TAIL_MISSING_ERROR:
    "Peptide sequences must have exactly two hyphens('-') separating the head and tail from the amino acid sequence",
  HEAD_TAIL_EMPTY: "Empty head/tail not allowed",
  HEAD_TAIL_NON_ALPHANUMERIC: "Invalid characters in head/tail",
  AA_SEQUENCE_EMPTY: "Amino acid sequence between head and tail cannot be empty",
  AA_SEQUENCE_INVALID_CHAR: "Amino acid sequence cannot contain character ",
  AA_SEQUENCE_END_BRACE_BEFORE_START: "Invalid position marker '}' found before '{'",
  AA_SEQUENCE_BRACES_NOT_ENDED:
    "Only one valid amino acid character allowed between a pair of well formed position markers('{', '}')",
  AA_SEQUENCE_BRACE_WITHIN_MARKERS:
    "Position markers cannot be nested and must have exactly one amino acid character between them"
};

/**
 * Validates a protein/peptide sequence and returns appropriate messages if invalid
 * @param {String} type PROTEIN_LINKER/PEPTIDE_LINKER
 * @param {String} seq Sequence string for the linker
 */
export function validateSequence(type, seq) {
  var aaSeq = seq;
  if (type === "PEPTIDE_LINKER") {
    var headEnd = seq.indexOf("-");
    var tailStart = seq.lastIndexOf("-");
    aaSeq = seq.substring(headEnd + 1, tailStart);
    if (headEnd < 0 || headEnd === tailStart || aaSeq.indexOf("-") > 0) {
      //no hyphens or 1 hyphen or more than 2 hyphens
      return seqErrors.HEAD_TAIL_MISSING_ERROR;
    }

    var head = seq.substring(0, headEnd);
    var tail = seq.substring(tailStart + 1);
    if (head === "" || tail === "") {
      return seqErrors.HEAD_TAIL_EMPTY;
    }

    if (!isAlphaNumeric(head) || !isAlphaNumeric(tail)) {
      return seqErrors.HEAD_TAIL_NON_ALPHANUMERIC;
    }

    if (aaSeq === "") {
      return seqErrors.AA_SEQUENCE_EMPTY;
    }
  }

  for (var i = 0; i < aaSeq.length; i++) {
    var c = aaSeq[i];
    if (c === "}") {
      return seqErrors.AA_SEQUENCE_END_BRACE_BEFORE_START;
    }

    if (c === "{") {
      i += 1;
      var nextC = aaSeq[i];
      if (nextC === "{" || nextC === "}") {
        //stray braces after open brace
        return seqErrors.AA_SEQUENCE_BRACE_WITHIN_MARKERS;
      }
      if (aminoAcidChars.indexOf(nextC) < 0) {
        //if char in brace is not allowed aa character
        return seqErrors.AA_SEQUENCE_INVALID_CHAR + nextC;
      }
      i += 1;
      var expectedEndBrace = aaSeq[i];
      if (expectedEndBrace !== "}") {
        //not end brace after aa char
        return seqErrors.AA_SEQUENCE_BRACES_NOT_ENDED;
      }
      continue;
    }
    //outside any braces check if invalid aa char
    if (aminoAcidChars.indexOf(c) < 0) {
      return seqErrors.AA_SEQUENCE_INVALID_CHAR + c;
    }
  }
  return "";
}

/**
 * Parses and returns an array of objects representing position and amino acid information found within the curly braces of a sequence
 * @param {String} sequence
 */
export function getAAPositionsFromSequence(sequence) {
  var positionData = [];
  var pos = sequence.indexOf("{");
  while (pos !== -1) {
    //in the 3 characters after the '{'
    const currentPosData = sequence.substr(pos + 1, 3).split("-");
    positionData.push({
      position: currentPosData[0],
      aminoAcid: currentPosData[1]
    });
    //find next open brace after ending pair of current '{'
    pos = sequence.indexOf("{", pos + 5);
  }
  return positionData;
}

/**
 * Checks if string has only alpha numeric chars
 * @param {String} str The string to check
 */
function isAlphaNumeric(str) {
  var code, i, len;
  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123) // lower alpha (a-z)
    ) {
      return false;
    }
  }
  return true;
}
