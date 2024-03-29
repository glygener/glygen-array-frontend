/**
 * Form error message key-value store. Maps a <defaultMessage>_<objectName> combination for an error on a particular form to an appropriate form error message.
 **/
const FORM_ERROR_MESSAGES = {
  signin: {
    Invalid_password: "Credentails are bad. Please try once more."
  },
  signup: {
    Duplicate_username: "The username you've entered is already in use. Please select a unique username.",
    Duplicate_email: "Please use a different email address since this one is already in use."
  },
  changeEmail: {
    Duplicate_email: "Please use a different email address since this one is already in use.",
    Invalid_password: "The password is incorrect. Please try once more."
  },
  changePassword: {
    Invalid_currentPassword: "The current password is incorrect. Please try once more.",
    NotValid_password:
      "A password must have at least one capital, one lowercase, one number value, one special character, and be at least five characters long."
  },
  usernameRecovery: {
    NotFound_email: "This email is not associated with any user."
  },
  passwordRecovery: {
    Failed_username: "Password recovery failed due to an internal error. Please try once more.",
    NotFound_username: "This username is not associated with any user."
  },
  signupVerification: {
    Invalid_token: "The token you entered is invalid. Please try once more.",
    Expired_token: "The link or token has already passed its expiration time. Please try again to sign up."
  },
  glycans: {
    Duplicate_sequence: "You already have another glycan in your collection with that sequence.",
    Duplicate_internalId:
      "The same Internal ID is already used by another glycan in your collection. Please use a different Internal Id.",
    Duplicate_name:
      "The name of another glycan in your collection is the same as this one. Please use a different name.",
    NotValid_sequence:
      "The sequence string appears to be unrecognizable or incompatible with the format specified. Please double-check for accuracy.",
    NotValid_glytoucanId: "GlyTouCan does not recognize that GlyTouCan ID. Please make sure you enter the correct one.",
    NoMatch_glytoucanId: "GlyTouCan ID entered does not match with the sequence! Either leave it empty or enter the correct GlyTouCan ID.",
    Invalid_structure: "Provided Glycan does not specify the GlyTouCan ID.",
    NotValid_file: "The file is invalid. Please verify the file and format selection before re-uploading.",
    InUse_glycan: "Cannot delete selected glycan. It is used in an experiment."
  },
  linkers: {
    NotValid_pubmedid: "The PubMed ID you entered is invalid. Please try once more.",
    NotValid_pubchemid: "PubChem did not recognize that Input. Please try once more.",
    Duplicate_pubchemid: "There is already a linker in your collection with that PubChem ID.",
    NotValid_inChiKey: "PubChem did not recognize that Input. Please try once more.",
    Duplicate_inChiKey: "There is already a linker in your collection with that InChiKey.",
    NotValid_smiles: "PubChem did not recognize that Input. Please try once more.",
    Duplicate_smiles: "There is already a linker in your collection with that InChiKey or Smiles.",
    Duplicate_name: "The name of another molecule in your collection is the same. Please use a different name.",
    Duplicate_sequence: "The sequence is repeated in another item in your collection. Please use a different sequence.",
    LengthExceeded_name: "The length of the name has been exceeded. Please choose a different name.",
    InUse_linker: "Cannot delete selected linker. It is used in an experiment."
  },
  features: {
    Duplicate_name:
      "The name of another feature in your collection is the same as this one. Please use a different name.",
    Duplicate_internalId:
      "The internalId of another feature in your collection is the same as this one. Please use a different internalId.",
    InUse_feature: "Cannot delete selected feature. It is used in an experiment."
  },
  bulkGlycans: {
    Toolarge_file: "Please keep the file size to a maximum of 1MB.",
    Invalidextension_file: "Please select a GlycoWorkbench file(*.gws) or a text file (*.txt)",
    Notvalid_file:
      "The uploaded file appears to be invalid. Please verify that it only contains valid glycoworkbench sequences separated by semi-colon.",
    NotValid_moleculeType: "Molecule type is not in the list of accepted values."
  },
  bulkSlideLayouts: {
    Notvalid_file:
      "The uploaded file appears to be invalid. Please double-check that the file is a valid GRITS glycan library."
  },
  importSlidelayouts: {
    NotValid_file: "The submitted file appears to be invalid. You might try re-uploading the file.",
    Duplicate_slideLayout: "The slide layout with that name already exists in your library."
  },
  importMetadata: {
    NotValid_file: "The submitted file appears to be invalid. You might try re-uploading the file.",
    Duplicate_metadata: "The metadata with that name already exists in your library."
  },

  blockLayouts: {
    Duplicate_name: "The same name appears in another block layout in your collection. Please use a different name.",
    Positiveonly_height: "The number of rows must be a positive integer.",
    Positiveonly_width: "The number of columns must be a positive integer.",
    InUse_blockLayout: "Cannot delete selected blocklayout. It is used in an experiment."
  },
  slideLayouts: {
    Duplicate_name: "The name of another slide layout is the same. Please choose a new name.",
    Positiveonly_height: "The number of rows must be a positive integer.",
    Positiveonly_width: "The number of columns must be a positive integer.",
    InUse_slideLayout: "The selected slide layout cannot be deleted. Used in experiment.",
    InUse_printedSlide: "The selected printed slide cannot be deleted. Used in experiments."
  },
  metadata: {
    InUse_metadata: "Cannot delete selected metadata. It is used in an experiment."
  },
  glygenTable: {
    Not_Found: "An unidentified error has occurred. Please be patient while we investigate this."
  },
  processdata: {
    Internal_Error: "The intensities cannot be added to the repository. Please update the file and re-upload it."
  },
  experiments: {
    NotDone_rawData: "RawData is still in the process. Please try once more.",
    NotFound_publicationId: "The publication ID could not be found.",
    HasError_dataset: "Dataset has errors, cannot be made public without resolving data errors!"
  },
  grants: {
    Duplicate_grant: "Another grant has the same grant number as this one. Use a different grant number."
  },
  keywords: {
    Duplicate_keyword: "Dataset has this Keyword added already. Use a different keyword."
  },
  supplementaryfiles: {
    Toolarge_file: "Please keep the file size to a maximum of 1MB.",
    Notvalid_file: "The uploaded file appears to be invalid. Please verify it and try again."
  },
  molecules: {
    NotValid_moleculeType: "The uploaded molecule is not of the correct molecule type. Please make sure to upload a file with correct molecules.",
    NotValid_file: "The uploaded file is not a valid repository export (.json) file. Please verify it and try again.",
    NotValid_filetype: "Incorrect file type is selected. Please make sure to select repository export file.",
  },

  default: {
    default_key: "An unidentified error has occurred. Please be patient while we investigate this."
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
