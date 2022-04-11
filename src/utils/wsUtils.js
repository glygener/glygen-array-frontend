import { trackPromise } from "react-promise-tracker";

const ws_base = process.env.REACT_APP_API_URL;
/**
 * Utilities to make API calls
 */

/**
 * get URL for the web service of the requested type
 * @param ws A ws designation
 * @returns URL for the requested type
 */
export function getWsUrl(ws) {
  // var ws_base = "https://glygen.ccrc.uga.edu/ggarray/api/";
  //var ws_base = "http://localhost:8080/";
  //var ws_base = "http://192.168.99.100:8081/";

  var ws_base_user = ws_base + "users";
  var ws_base_array = ws_base + "array";
  var ws_base_login = ws_base + "login";
  var ws_base_logger = ws_base + "weblogger";
  var ws_base_util = ws_base + "util";
  var ws_base_public = ws_base_array + "/public";
  var ws_base_public_search = ws_base_public + "/search";

  switch (ws.toLowerCase()) {
    case "login":
      return ws_base_login;
    case "logaccess":
      return ws_base_logger + "/access";
    case "logevent":
      return ws_base_logger + "/event";
    case "signup":
      return ws_base_user + "/signup";
    case "username":
      return ws_base_user + "/availableUsername";
    case "emailconfirm":
      return ws_base_user + "/registrationConfirm";
    case "profile":
      return ws_base_user + "/get";
    case "update":
      return ws_base_user + "/update";
    case "recover":
      return ws_base_user + "/recover";
    case "addglycan":
      return ws_base_array + "/addglycan";
    case "glycanlist":
      return ws_base_array + "/listGlycans";
    case "glycandelete":
      return ws_base_array + "/delete";
    case "glycanimage":
      return ws_base_array + "/getimage";
    case "updateglycan":
      return ws_base_array + "/updateGlycan";
    case "getglycan":
      return ws_base_array + "/getglycan";
    case "addmultipleglycans":
      return ws_base_array + "/addBatchGlycan";
    case "exportglycans":
      return ws_base_array + "/exportglycans";
    case "addlinker":
      return ws_base_array + "/addlinker";
    case "linkerlist":
      return ws_base_array + "/listLinkers";
    case "exportlinkers":
      return ws_base_array + "/exportlinkers";
    case "uploadmolecules":
      return ws_base_array + "/addBatchLinker";
    case "listmoleculesbytype":
      return ws_base_array + "/listMoleculesByType";
    case "listallmoleculesbytype":
      return ws_base_array + "/listAllMoleculesByType";
    case "linkerdelete":
      return ws_base_array + "/deletelinker";
    case "updatelinker":
      return ws_base_array + "/updateLinker";
    case "getlinker":
      return ws_base_array + "/getlinker";
    case "addblocklayout":
      return ws_base_array + "/addblocklayout";
    case "blocklayoutlist":
      return ws_base_array + "/listBlocklayouts";
    case "blocklayoutdelete":
      return ws_base_array + "/deleteblocklayout";
    case "getblocklayout":
      return ws_base_array + "/getblocklayout";
    case "updateblocklayout":
      return ws_base_array + "/updateBlockLayout";
    case "getlayoutsfromlibrary":
      return ws_base_array + "/getSlideLayoutFromLibrary";
    case "importlayoutsfromxml":
      return ws_base_array + "/addSlideLayoutFromLibrary";
    case "importlayoutsfromgal":
      return ws_base_array + "/addSlideLayoutFromGalFile";
    case "upload":
      return ws_base_array + "/upload";
    case "checkslidelayoutname":
      return ws_base_array + "/checkSlidelayoutName";
    case "addslidelayout":
      return ws_base_array + "/addslidelayout";
    case "slidelayoutlist":
      return ws_base_array + "/listSlidelayouts";
    case "updateslidelayout":
      return ws_base_array + "/updateSlideLayout";
    case "getslidelayout":
      return ws_base_array + "/getslidelayout";
    case "slidelayoutdelete":
      return ws_base_array + "/deleteslidelayout";
    case "glytoucanid":
      return ws_base_array + "/getGlycanFromGlytoucan";
    case "linkerclassifications":
      return ws_base_util + "/getLinkerClassifications";
    case "linkerfrompubchem":
      return ws_base_util + "/getlinkerFromPubChem";
    case "getpublication":
      return ws_base_util + "/getPublicationFromPubmed";
    case "getsequencefromuniprot":
      return ws_base_util + "/getSequenceFromUniprot";
    case "featurelist":
      return ws_base_array + "/listFeatures";
    case "featurelistbytype":
      return ws_base_array + "/listFeaturesByType";
    case "featuredelete":
      return ws_base_array + "/deletefeature";
    case "addfeature":
      return ws_base_array + "/addfeature";
    case "uploadfeature":
      return ws_base_array + "/addBatchFeature";
    case "exportfeatures":
      return ws_base_array + "/exportfeatures";
    case "getfeature":
      return ws_base_array + "/getfeature";
    case "updatefeature":
      return ws_base_array + "/updateFeature";
    case "unitlevels":
      return ws_base_util + "/unitLevels";
    case "availablemetadataname":
      return ws_base_array + "/availableMetadataname";
    case "listtemplates":
      return ws_base_util + "/listTemplates";
    case "gettemplate":
      return ws_base_util + "/getTemplate";
    case "listsamples":
      return ws_base_array + "/listSamples";
    case "addsample":
      return ws_base_array + "/addSample";
    case "sampledelete":
      return ws_base_array + "/deletesample";
    case "getsample":
      return ws_base_array + "/getsample";
    case "updatesample":
      return ws_base_array + "/updateSample";
    case "listprinters":
      return ws_base_array + "/listPrinters";
    case "addprinter":
      return ws_base_array + "/addPrinter";
    case "printerdelete":
      return ws_base_array + "/deleteprintermetadata";
    case "getprinter":
      return ws_base_array + "/getPrinter";
    case "updateprinter":
      return ws_base_array + "/updatePrinter";
    case "listscanners":
      return ws_base_array + "/listScanners";
    case "addscanner":
      return ws_base_array + "/addScanner";
    case "scannerdelete":
      return ws_base_array + "/deletescannermetadata";
    case "getscanner":
      return ws_base_array + "/getScanner";
    case "updatescanner":
      return ws_base_array + "/updateScanner";
    case "listslidemeta":
      return ws_base_array + "/listSlideMetadata";
    case "addslidemeta":
      return ws_base_array + "/addSlideMetadata";
    case "slidemetadelete":
      return ws_base_array + "/deleteslidemetadata";
    case "getslidemeta":
      return ws_base_array + "/getSlideMetadata";
    case "updateslidemeta":
      return ws_base_array + "/updateSlideMetadata";
    case "listdataprocessing":
      return ws_base_array + "/listDataProcessingSoftware";
    case "adddataprocessing":
      return ws_base_array + "/addDataProcessingSoftware";
    case "dataprocessingdelete":
      return ws_base_array + "/deletedataprocessingmetadata";
    case "getdataprocessing":
      return ws_base_array + "/getDataProcessingSoftware";
    case "updatedataprocessing":
      return ws_base_array + "/updateDataProcessingSoftware";
    case "listimagemetadata":
      return ws_base_array + "/listImageAnalysisSoftware";
    case "addimageanalysis":
      return ws_base_array + "/addImageAnalysis";
    case "imagemetadatadelete":
      return ws_base_array + "/deleteimagemetadata";
    case "getimageanalysis":
      return ws_base_array + "/getImageAnalysisSoftware";
    case "updateimageanalysis":
      return ws_base_array + "/updateImageAnalysisSoftware";
    case "listassaymetadata":
      return ws_base_array + "/listAssayMetadata";
    case "addassaymetadata":
      return ws_base_array + "/addAssayMetadata";
    case "deleteassaymetadata":
      return ws_base_array + "/deleteassaymetadata";
    case "getassaymetadata":
      return ws_base_array + "/getAssayMetadata";
    case "updateassaymetadata":
      return ws_base_array + "/updateAssayMetadata";
    case "listspotmetadata":
      return ws_base_array + "/listSpotMetadata";
    case "addspotmetadata":
      return ws_base_array + "/addSpotMetadata";
    case "deletespotmetadata":
      return ws_base_array + "/deletespotmetadata";
    case "getspotmetadata":
      return ws_base_array + "/getSpotMetadata";
    case "updatespotmetadata":
      return ws_base_array + "/updateSpotMetadata";
    case "listprintrun":
      return ws_base_array + "/listPrintruns";
    case "addprintrun":
      return ws_base_array + "/addPrintrun";
    case "printrundelete":
      return ws_base_array + "/deleteprintrunmetadata";
    case "getprintrun":
      return ws_base_array + "/getPrintRun";
    case "updateprintrun":
      return ws_base_array + "/updatePrintrun";
    case "ismiragecompliant":
      return ws_base_array + "/isMirageCompliant";
    case "addprintedslide":
      return ws_base_array + "/addPrintedSlide";
    case "slidelist":
      return ws_base_array + "/listPrintedSlide";
    case "getslide":
      return ws_base_array + "/getprintedslide";
    case "slidedelete":
      return ws_base_array + "/deleteprintedslide";
    case "updateprintedslide":
      return ws_base_array + "/updatePrintedSlide";
    case "listexperiments":
      return ws_base_array + "/listArrayDataset";
    case "getexperiment":
      return ws_base_array + "/getarraydataset";
    case "addfileonexperiment":
      return ws_base_array + "/addFile";
    case "deletefileonexperiment":
      return ws_base_array + "/deletefile";
    case "listkeywords":
      return ws_base_array + "/getallkeywords";
    case "addkeyword":
      return ws_base_array + "/addKeyword";
    case "deletekeyword":
      return ws_base_array + "/deletekeyword";
    case "adddataset":
      return ws_base_array + "/addDataset";
    case "updatearraydataset":
      return ws_base_array + "/updatearraydataset";
    case "deletedataset":
      return ws_base_array + "/deletedataset";
    case "makearraydatasetpublic":
      return ws_base_array + "/makearraydatasetpublic";
    case "addrawdata":
      return ws_base_array + "/addRawdata";
    case "deleterawdata":
      return ws_base_array + "/deleterawdata";
    case "listrawdata":
      return ws_base_array + "/listRawData";
    case "supportedrawfileformats":
      return ws_base_util + "/supportedrawfileformats";
    case "statisticalmethods":
      return ws_base_util + "/statisticalmethods";
    case "supportedprocessedfileformats":
      return ws_base_util + "/supportedprocessedfileformats";
    case "addprocessdatafromexcel":
      return ws_base_array + "/addProcessedDataFromExcel";
    case "getprocesseddata":
      return ws_base_array + "/getprocesseddata";
    case "deleteprocessdata":
      return ws_base_array + "/deleteprocesseddata";
    case "updateprocesseddata":
      return ws_base_array + "/updateprocesseddata";
    case "delaysetting":
      return ws_base_util + "/delaysetting";
    case "addpublication":
      return ws_base_array + "/addPublication";
    case "deletepublication":
      return ws_base_array + "/deletepublication";
    case "listalllinkers":
      return ws_base_array + "/listAllLinkers";
    case "listallglycans":
      return ws_base_array + "/listAllGlycans";
    case "listallprintedslide":
      return ws_base_array + "/listAllPrintedSlide";
    case "listpublicdataset":
      return ws_base_public + "/listArrayDataset";
    case "getpublicblocklayout":
      return ws_base_public + "/getblocklayout";
    case "getpublicdataset":
      return ws_base_public + "/getarraydataset";
    case "getuserdetails":
      return ws_base_util + "/getuserdetails";
    case "gettypeahead":
      return ws_base_util + "/getTypeAhead";
    case "addslide":
      return ws_base_array + "/addSlide";
    case "addimage":
      return ws_base_array + "/addImage";
    case "getpublicsample":
      return ws_base_public + "/getsample";
    case "getslidemetadata":
      return ws_base_public + "/getSlideMetadata";
    case "getpublicprinter":
      return ws_base_public + "/getPrinter";
    case "getpublicassay":
      return ws_base_public + "/getAssayMetadata";
    case "getpublicscanner":
      return ws_base_public + "/getScanner";
    case "getpublicimageanalysis":
      return ws_base_public + "/getImageAnalysisSoftware";
    case "getpublicdataprocessing":
      return ws_base_public + "/getDataProcessingSoftware";
    case "getlistintensities":
      return ws_base_public + "/listIntensityData";
    case "getglycanpublic":
      return ws_base_public + "/getglycan";
    case "getdatasetforglycan":
      return ws_base_public + "/getdatasetforglycan";
    case "deleteslide":
      return ws_base_array + "/deleteslide";
    case "deleteimage":
      return ws_base_array + "/deleteimage";
    case "publicfiledownload":
      return ws_base_public + "/download";
    case "filedownload":
      return ws_base_array + "/download";
    case "statistics":
      return ws_base_util + "/getstatistics";
    case "listarraydatasetcoowner":
      return ws_base_array + "/listArrayDatasetCoowner";
    case "addgrant":
      return ws_base_array + "/addGrant";
    case "deletegrant":
      return ws_base_array + "/deletegrant";
    case "addcollaborator":
      return ws_base_array + "/addCollaborator";
    case "deletecollaborator":
      return ws_base_array + "/deletecollaborator";
    case "addcoowner":
      return ws_base_array + "/addCoowner";
    case "listcoowners":
      return ws_base_array + "/listcoowners";
    case "deletecoowner":
      return ws_base_array + "/deleteCoowner";
    case "listusernamestypeahead":
      return ws_base_user + "/listusernames";
    case "searchglycans":
      return ws_base_public_search + "/searchGlycans";
    case "initglycansearch":
      return ws_base_public_search + "/initGlycanSearch";
    case "searchglycansbymass":
      return ws_base_public_search + "/searchGlycansByMass";
    case "searchglycansbystructure":
      return ws_base_public_search + "/searchGlycansByStructure";
    case "searchglycansbysubstructure":
      return ws_base_public_search + "/searchGlycansBySubstructure";
    case "listglycansforsearch":
      return ws_base_public_search + "/listGlycansForSearch";
    case "searchdatasets":
      return ws_base_public_search + "/searchDatasets";
    case "searchdatasetsbyuser":
      return ws_base_public_search + "/searchDatasetsByUser";
    case "listdatasetsforsearch":
      return ws_base_public_search + "/listDatasetsForSearch";
    case "exportslidelayout":
      return ws_base_array + "/exportSlideLayout";

    default:
      return ws_base_user;
  }
}

/**
 *
 * @param {String} ws The webservice to request
 * @param {String} httpMethod Method type: GET, POST etc
 * @param {Object} wsParams Additional params to add to the url. May be an array or object with props urlParams and qsParams
 * @param {boolean} useToken Whether to use authorization token or not
 * @param {Object} body Payload to send
 * @param {Function} successFunction Callback to invoke on success
 * @param {Function} errorFunction Callback to invoke on error
 * @param {Object} headers Headers object. If not passed, will set both Accept and Content-Type headers to application/json
 */
export async function wsCall(ws, httpMethod, wsParams, useToken, body, successFunction, errorFunction, headers) {
  var url = getWsUrl(ws) + getWsParamString(wsParams);
  if (!headers) {
    headers = {
      Accept: "application/json",
      "Content-Type": "application/json"
    };
  }

  if (body) {
    if (typeof body !== "string" && body.constructor !== FormData) {
      body = JSON.stringify(body);
    }
  }

  if (useToken) {
    headers["Authorization"] = window.localStorage.getItem("token") || "";
  }

  var response =
    url.includes("public") || url.includes("getuserdetails") || url.includes("list")
      ? // || url.includes("download")
        await fetch(url, {
          // mode: "no-cors", // 'cors' by default
          method: httpMethod,
          headers: headers,
          body: body
        })
      : await trackPromise(
          fetch(url, {
            // mode: "no-cors", // 'cors' by default
            method: httpMethod,
            headers: headers,
            body: body
          })
        );

  try {
    if (response.ok) {
      successFunction(response);
    } else {
      errorFunction(response);
    }
  } catch (error) {
    console.log(error);
    alert("Network issue detected. Please try again.");
  }
}

/**
 * @param {Object} wsParams Object with properties 'urlParams' and 'qsParams' or array of the ws params to be appended to the URL.
 * Passing an array creates a '/' separated param string eg. /1/2... while passing an object creates a either
 * 1. a query string with the properties as parameters eg. ?a=1&b=2... or
 * 2. a mix of '/' separated param string from urlParams and query string from qsParams
 */
function getWsParamString(wsParams) {
  if (wsParams) {
    if (wsParams.constructor === Array) {
      return getUrlString(wsParams);
    }
    if (wsParams.qsParams && wsParams.urlParams) {
      return getUrlString(wsParams.urlParams) + getQueryString(wsParams.qsParams);
    }
    return getQueryString(wsParams);
  }
  return "";
}

function getUrlString(params) {
  var paramString = "";
  params.forEach(function(val) {
    paramString += "/" + val;
  });
  return paramString;
}

function getQueryString(params) {
  var paramString = "";
  var firstParam = true;
  Object.keys(params).forEach(function(key) {
    if (firstParam) {
      paramString += "?" + key + "=" + params[key];
      firstParam = false;
    } else {
      paramString += "&" + key + "=" + params[key];
    }
  });
  return paramString;
}
