/* eslint-disable react/display-name */
import React from "react";
import PropTypes from "prop-types";
import { Home } from "./containers/Home";
import { Login } from "./containers/Login";
import { Signup } from "./containers/Signup";
import { Profile } from "./containers/Profile";
import { ChangePassword } from "./containers/ChangePassword";
import { ChangeEmail } from "./containers/ChangeEmail";
import { VerifyToken } from "./containers/VerifyToken";
import { ForgotPassword } from "./containers/ForgotPassword";
import { ForgotUsername } from "./containers/ForgotUsername";
import { EmailConfirmation } from "./components/EmailConfirmation";
import { Contribute } from "./containers/Contribute";
import { Glycans } from "./containers/Glycans";
import { EditGlycan } from "./containers/EditGlycan";
import { Linkers } from "./containers/Linkers";
import { AddGlycan } from "./containers/AddGlycan";
import { AddLinker } from "./containers/AddLinker";
import { EditLinker } from "./containers/EditLinker";
import { BlockLayouts } from "./containers/BlockLayouts";
import { SlideLayouts } from "./containers/SlideLayouts";
import { AddBlockLayout } from "./containers/AddBlockLayout";
import { Features } from "./containers/Features";
import { AddFeature } from "./containers/AddFeature";
import { SideMenu } from "./components/SideMenu";
import { AddSlideLayout } from "./containers/AddSlideLayout";
import { AddMultiSlideLayout } from "./containers/AddMultiSlideLayout";
import { Samples } from "./containers/Samples";
import { AddSample } from "./containers/AddSample";
import { Printers } from "./containers/Printers";
import { ImageAnalysis } from "./containers/ImageAnalysis";
import { Scanners } from "./containers/Scanners";
import { DataProcessing } from "./containers/DataProcessing";
import { SlideMeta } from "./containers/SlideMeta";
import { AddPrinter } from "./containers/AddPrinter";
import { AddScanner } from "./containers/AddScanner";
import { AddImageAnalysis } from "./containers/AddImageAnalysis";
import { AddDataProcessing } from "./containers/AddDataProcessing";
import { AddSlideMeta } from "./containers/AddSlideMeta";
import { AddSlide } from "./containers/AddSlide";
import { Slides } from "./containers/Slides";
import { Experiments } from "./containers/Experiments";
import { AddExperiment } from "./containers/AddExperiment";
import { RawData } from "./containers/RawData";
import { AddRawData } from "./containers/AddRawData";
import { AddProcessedData } from "./containers/AddProcessedData";
import { Assay } from "./containers/Assay";
import { AddAssay } from "./containers/AddAssay";
import { AddSpot } from "./containers/AddSpot";
import { Spots } from "./containers/Spots";
import { ErrorPage } from "./components/ErrorPage";
import { Switch, Route } from "react-router-dom";
import { PublicData } from "./public/PublicData";
import { PublicDataset } from "./public/PublicDataset";
import { AddGrant } from "./containers/AddGrant";
import { AddMultipleGlycans } from "./containers/AddMultipleGlycans";
import { Peptides } from "./containers/Peptides";
import { AddPeptide } from "./containers/AddPeptide";
import { GlycanSearch } from "./public/GlycanSearch";
import { SubmitterSearch } from "./public/SubmitterSearch";
import { DatasetDetailSearch } from "./public/DatasetDetailSearch";
import { DatasetDetailList } from "./public/DatasetDetailList";
import { Proteins } from "./containers/Proteins";
import { AddProtein } from "./containers/AddProtein";
import { Lipids } from "./containers/Lipids";
import { AddLipid } from "./containers/AddLipid";
import { AddOtherMolecule } from "./containers/AddOtherMolecule";
import { OtherMolecules } from "./containers/OtherMolecules";
import GlycanList from "./public/GlycanList";
import GlycanDetail from "./public/GlycanDetail";
import { FeatureView } from "./containers/FeatureView";
import { AddMultipleGlycanDetails } from "./containers/AddMultipleGlycanDetails";
import { AddPrintRun } from "./containers/AddPrintRun";
import { PrintRun } from "./containers/PrintRun";
import { UploadMolecules } from "./containers/UploadMolecules";

const Routes = props => {
  const routes = [
    {
      path: "/",
      exact: true,
      sidebar: () => "",
      main: () => <Home />
    },
    /*  Public search */
    {
      path: "/datasetDetailSearch",
      exact: true,
      main: () => <DatasetDetailSearch />,
      sidebar: () => ""
    },
    {
      path: "/datasetDetailSearch/:searchId",
      exact: true,
      main: () => <DatasetDetailSearch />,
      sidebar: () => ""
    },
    {
      path: "/datasetDetailList/:searchId",
      exact: true,
      main: () => <DatasetDetailList />,
      sidebar: () => ""
    },
    {
      path: "/submitterSearch",
      exact: true,
      main: () => <SubmitterSearch />,
      sidebar: () => ""
    },
    {
      path: "/glycanSearch",
      exact: true,
      main: () => <GlycanSearch />,
      sidebar: () => ""
    },
    {
      path: "/glycanSearch/:searchId",
      exact: true,
      main: () => <GlycanSearch />,
      sidebar: () => ""
    },
    {
      path: "/glycanList/:searchId",
      exact: true,
      main: () => <GlycanList />,
      sidebar: () => ""
    },
    {
      path: "/glycanDetail/:glycanId",
      exact: true,
      main: () => <GlycanDetail />,
      sidebar: () => ""
    },
    {
      path: "/data/dataset/:datasetId",
      main: () => <PublicDataset {...props} />,
      sidebar: () => ""
    },
    {
      path: "/data",
      exact: true,
      main: () => <PublicData />,
      sidebar: () => ""
    },

    {
      path: "/login",
      sidebar: () => "",
      main: () => <Login updateLogin={props.updateLogin} authCheckAgent={props.authCheckAgent} />
    },
    {
      path: "/signup",
      exact: true,
      main: () => <Signup />,
      sidebar: () => ""
    },
    {
      path: "/verifyToken",
      exact: true,
      main: () => <VerifyToken />,
      sidebar: () => ""
    },
    {
      path: "/emailConfirmation/:token",
      main: () => <EmailConfirmation />,
      sidebar: () => ""
    },
    {
      path: "/profile",
      exact: true,
      main: () => <Profile authCheckAgent={props.authCheckAgent} />,
      sidebar: () => ""
    },
    {
      path: "/changePassword",
      exact: true,
      main: () => <ChangePassword />,
      sidebar: () => ""
    },
    {
      path: "/changeEmail",
      exact: true,
      main: () => <ChangeEmail />,
      sidebar: () => ""
    },
    {
      path: "/forgotPassword",
      exact: true,
      main: () => <ForgotPassword />,
      sidebar: () => ""
    },
    {
      path: "/forgotUsername",
      exact: true,
      main: () => <ForgotUsername />,
      sidebar: () => ""
    },
    {
      path: "/contribute",
      exact: true,
      main: () => <Contribute authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("")
    },

    /*  glycans */
    {
      path: "/glycans/editGlycan/:glycanId",
      main: () => <EditGlycan authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/glycans/addGlycan",
      main: () => <AddGlycan authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/glycans/addMultipleGlycanDetails",
      main: () => <AddMultipleGlycanDetails authCheckAgent={props.authCheckAgent} {...props} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/glycans/addMultipleGlycan",

      main: () => <AddMultipleGlycans authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/glycans",
      main: () => <Glycans authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },

    /*  peptides */
    {
      path: "/peptides/editPeptide/:moleculeId",
      main: () => <EditLinker {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/peptides/addPeptide",
      main: () => <AddPeptide authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/peptides/uploadMolecules",
      main: () => <UploadMolecules {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/peptides",
      main: () => <Peptides authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },

    /*  proteins */
    {
      path: "/proteins/editProtein/:moleculeId",
      main: () => <EditLinker {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/proteins/addProtein",
      main: () => <AddProtein authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/proteins/uploadMolecules",
      main: () => <UploadMolecules {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/proteins",
      main: () => <Proteins authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },

    /*  lipids */
    {
      path: "/lipids/editLipid/:moleculeId",
      main: () => <EditLinker {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/lipids/addLipid",
      main: () => <AddLipid authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/lipids/uploadMolecules",
      main: () => <UploadMolecules {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/lipids",
      main: () => <Lipids authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },

    /*  linkers */
    {
      path: "/linkers/editLinker/:moleculeId",
      exact: true,
      main: () => <EditLinker {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/linkers/addLinker",
      main: () => <AddLinker authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/linkers/uploadMolecules",
      main: () => <UploadMolecules {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/linkers",
      main: () => <Linkers authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },

    /*  other molecules */
    {
      path: "/otherMolecules/editOtherMolecule/:moleculeId",
      exact: true,
      main: () => <EditLinker {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/otherMolecules/addOtherMolecule",
      main: () => <AddOtherMolecule authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/otherMolecules/uploadMolecules",
      main: () => <UploadMolecules {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },
    {
      path: "/otherMolecules",
      main: () => <OtherMolecules authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("molecules")
    },

    /*  features */
    {
      path: "/features/editFeature/:editFeature/:featureId",
      main: () => <FeatureView {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/features/viewFeature/:featureId",
      main: () => <FeatureView {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },

    {
      path: "/features/addFeature",
      main: () => <AddFeature authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/features",
      main: () => <Features authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },

    /* Block layouts */

    {
      path: "/blockLayouts/editBlock/:blockLayoutId?",
      main: () => <AddBlockLayout {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/blockLayouts/addBlock",
      main: () => <AddBlockLayout authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/blockLayouts",
      exact: true,
      main: () => <BlockLayouts authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },

    /* Slide layouts */

    {
      path: "/slideLayouts/editSlide/:slideLayoutId?",
      main: () => <AddSlideLayout {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/slideLayouts/addSlide",
      main: () => <AddSlideLayout authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/slideLayouts/addMultiple",
      exact: true,
      main: () => <AddMultiSlideLayout authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/slideLayouts",
      exact: true,
      main: () => <SlideLayouts authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },

    /* Slide */

    {
      path: "/slide/editSlide/:slideId?",
      main: () => <AddSlide {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/slides/addSlide",
      main: () => <AddSlide authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/slides",
      exact: true,
      main: () => <Slides authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },

    /* Sample */
    {
      path: "/samples/editSample/:sampleId?",
      main: () => <AddSample {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/samples/copySample/:sampleId?",
      main: () => <AddSample {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/samples/addSample",
      main: () => <AddSample authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/samples",
      exact: true,
      main: () => <Samples authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* Printer */

    {
      path: "/printers/editPrinter/:printerId?",
      main: () => <AddPrinter {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/printers/copyPrinter/:printerId?",
      main: () => <AddPrinter {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/printers/addPrinter",
      main: () => <AddPrinter authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/printers",
      exact: true,
      main: () => <Printers authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* Image Processing */

    {
      path: "/imageAnalysis/editImageAnalysisMetadata/:imageAnalysisId?",
      main: () => <AddImageAnalysis {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/imageAnalysis/copyImageAnalysisMetadata/:imageAnalysisId?",
      main: () => <AddImageAnalysis {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/imageAnalysis/addImageMetadata",
      main: () => <AddImageAnalysis authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/imageAnalysis",
      exact: true,
      main: () => <ImageAnalysis authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* Scanner */
    {
      path: "/scanners/editScanner/:scannerId?",
      main: () => <AddScanner {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/scanners/copyScanner/:scannerId?",
      main: () => <AddScanner {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/scanners/addScanner",
      main: () => <AddScanner authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/scanners",
      exact: true,
      main: () => <Scanners authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* Data Processing */
    {
      path: "/dataProcessing/editDataProcessing/:dataProcessingId?",
      main: () => <AddDataProcessing {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/dataProcessing/copyDataProcessing/:dataProcessingId?",
      main: () => <AddDataProcessing {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/dataProcessing/addDataProcessing",
      main: () => <AddDataProcessing authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/dataProcessing",
      exact: true,
      main: () => <DataProcessing authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* slideMeta */

    {
      path: "/listSlideMeta/editSlideMeta/:slideMetaId?",
      main: () => <AddSlideMeta {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/listSlideMeta/copySlideMeta/:slideMetaId?",
      main: () => <AddSlideMeta {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/listSlideMeta/addSlideMeta",
      main: () => <AddSlideMeta authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/listSlideMeta",
      exact: true,
      main: () => <SlideMeta authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    /* Assay */
    {
      path: "/assays/editAssay/:assayId?",
      main: () => <AddAssay {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/assays/copyAssay/:assayId?",
      main: () => <AddAssay {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/assays/addAssay",
      main: () => <AddAssay authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/assays",
      main: () => <Assay authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* Spots */
    {
      path: "/spots/editSpot/:spotId?",
      main: () => <AddSpot {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/spots/copySpot/:spotId?",
      main: () => <AddSpot {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/spots/addSpot",
      main: () => <AddSpot authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/spots",
      main: () => <Spots authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* Printer Run */

    {
      path: "/printRun/editPrintRun/:printRunId?",
      main: () => <AddPrintRun {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/printRun/copyPrintRun/:printRunId?",
      main: () => <AddPrintRun {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/printRun/addPrintRun",
      main: () => <AddPrintRun authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/printRun",
      exact: true,
      main: () => <PrintRun authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    /* experiment */
    {
      path: "/experiments/addExperiment/addGrant/:experimentId?",
      main: () => <AddGrant {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/experiments/addRawData/:experimentId?",
      main: () => <AddRawData {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/experiments/editExperiment/:experimentId?",
      main: () => <AddExperiment {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/experiments/editExperiment/:experimentId?",
      main: () => <AddExperiment {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/experiments/addExperiment",
      main: () => <AddExperiment authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/experiments",
      main: () => <Experiments authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },

    /* rawdata */

    {
      path: "/rawdata",
      main: () => <RawData authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },

    /* Process Data */
    {
      path: "/uploadProcessedData/editProcessedData/:experimentId/:processedDataId",
      main: () => <AddProcessedData {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/uploadProcessedData/addUploadProcessedData/:experimentId?",
      main: () => <AddProcessedData {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    // {
    //   path: "/addPublication/:experimentId?",
    //   main: ()=> <AddPublication {...props} authCheckAgent={props.authCheckAgent} />,
    //   sidebar: () => (
    //     <div className="sidenav">
    //       <SideMenu openMenu={"experiment"} />
    //     </div>
    //   )
    // },

    /* Error Process Data */
    {
      path: "/errorProcessData",
      main: () => <ErrorPage {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    }
  ];

  const getSidemenu = menu => {
    return (
      <div className="sidenav">
        <SideMenu openMenu={menu} />
      </div>
    );
  };

  return (
    <>
      <Switch>
        {routes.map((element, index) => {
          return <Route key={index} path={element.path} exact={element.exact} render={element.sidebar} />;
        })}
      </Switch>

      <Switch>
        {routes.map((element, index) => {
          return <Route key={index} path={element.path} exact={element.exact} render={element.main} />;
        })}
      </Switch>
      <Switch>
        <Route
          path="*"
          render={() => (
            <main style={{ padding: "1rem" }}>
              <p>There's nothing here!</p>
            </main>
          )}
        />
      </Switch>
    </>
  );
};

Routes.propTypes = {
  authCheckAgent: PropTypes.func,
  updateLogin: PropTypes.func
};

export { Routes };
