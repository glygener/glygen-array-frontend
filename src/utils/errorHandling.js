/**
 * Form error message key-value store. Maps a <defaultMessage>_<objectName> combination for an error on a particular form to an appropriate form error message.
 **/
const FORM_ERROR_MESSAGES = {
  signin: {
    Invalid_password: "Bad Credentails. Please try again. "
  },
  signup: {
    Duplicate_username: "Username already in use. Choose a different one.",
    Duplicate_email: "There is already an account with this email, please enter a different one."
  },
  changeEmail: {
    Duplicate_email: "There is already an account with this email, please enter a different one.",
    Invalid_password: "Password is wrong. Please try again. "
  },
  changePassword: {
    Invalid_currentPassword: "Current Password is not valid. Please try again.",
    NotValid_password:
      "password must contain at least one uppercase character, one lowercase character, one numeric value, one special character, five characters in length"
  },
  usernameRecovery: {
    NotFound_email: " No user is associated with this email"
  },
  passwordRecovery: {
    Failed_username: " Internal Error, password Recovery Failed. Please try again.",
    NotFound_username: " No user is associated with this username"
  },
  signupVerification: {
    Invalid_token: "Token Entered is not valid. Please try again.",
    Expired_token: "The link or token has already expired. Please try signing up again."
  },
  glycans: {
    Duplicate_sequence: "Another glycan with that sequence already exists in your collection",
    Duplicate_internalId: "Another glycan in your collection has the same Internal ID. Please use another Internal Id",
    Duplicate_name: "Another glycan in your collection has the same Name. Please use another Name",
    NotValid_sequence:
      "Sequence string seems to be unrecognizable or may not be compatible with the selected format. Please check again for validity",
    NotValid_glytoucanId: "That Glytoucan Id is not recognized by Glytoucan. Please try again.",
    Invalid_structure: "Provided Glycan does not specify the Glytoucan Id"
  },
  linkers: {
    NotValid_pubChemId: "That PubChem Id was not recognized by PubChem. Please try again.",
    Duplicate_pubChemId: "A linker with that PubChem Id already exists in your collection",
    Duplicate_name: "Another linker in your collection has the same Name. Please use another Name"
  },
  feature: {},
  bulkGlycans: {
    Toolarge_file: "Please ensure that the file size is at most 1MB.",
    Invalidextension_file: "Please select a GlycoWorkbench file(*.gws) or a text file (*.txt)",
    Notvalid_file:
      "It seems that the uploaded file is invalid. Please ensure that it contains only semi-colon separated valid glycoworkbench sequences"
  },
  bulkSlideLayouts: {
    Notvalid_file:
      "It seems that the uploaded file is invalid. Please ensure that it is a valid GRITS glycan library file"
  },
  importSlidelayouts: {
    NotValid_file: "It seems that the uploaded file is not valid. You can try uploading new file"
  },
  blockLayouts: {
    Duplicate_name: "Another block layout in your collection has the same Name. Please use another Name",
    Positiveonly_height: "# Rows must be a positive integer",
    Positiveonly_width: "# Columns must be a positive integer"
  },
  slideLayouts: {
    Duplicate_name: "Another slide layout has the same Name. Please use a different Name.",
    Positiveonly_height: "# Rows must be a positive integer",
    Positiveonly_width: "# Columns must be a positive integer"
  },
  glygenTable: {
    Not_Found: "Unknown error occurred. Please be patient while we look into this."
  },
  processdata: {
    Internal_Error: "Cannot add the intensities to the repository. Please fix the file and reupload."
  },
  experiments: {
    NotDone_rawData: "RawData is still in process. Please try again.",
    NotFound_publicationId: "Publication Id is Not found."
  },
  grants: {
    Duplicate_grant: "Another grant has the same grant number. Please use a different Grant Number"
  },

  default: {
    default_key: "Unknown error occurred. Please be patient while we look into this."
  }
};

/**
 *
 * @param {Object} error An element of the errors array in the errorLog. Must contain 'defaultMessage' and 'objectName' properties for proper resolution of error messages
 */
function getFormErrorMessage(form, error) {
  if (!form || !error || !error.defaultMessage || !error.objectName) {
    return FORM_ERROR_MESSAGES["default"]["default_key"];
  }
  var key = error.defaultMessage + "_" + error.objectName;
  if (!FORM_ERROR_MESSAGES[form] || !FORM_ERROR_MESSAGES[form][key]) {
    return FORM_ERROR_MESSAGES["default"]["default_key"];
  }
  return FORM_ERROR_MESSAGES[form][key];
}

export { getFormErrorMessage };
