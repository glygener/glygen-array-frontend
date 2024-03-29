import React, { useState, useEffect, useReducer, useRef } from "react";
import { Feedback, FormLabel, BlueCheckbox } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Descriptors } from "../components/Descriptors";
import "../containers/MetaData.css";
import { useHistory, Prompt, Link } from "react-router-dom";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";
import { Loading } from "../components/Loading";
import { FormControlLabel, FormGroup } from "@material-ui/core";
import { ScrollToTop } from "../components/ScrollToTop";

let idCounter = 1000;

const MetaData = props => {

    var meta = [];

    const metaDetails = {
        name: "",
        selectedtemplate: "",
        metadata: {}
    };

    const metadataInstance = {
        name: "",
        description: "",
        template: "",
        templateType: "",
        descriptors: [],
        descriptorGroups: [],
        user: {},
    };

    const [metadataTemplate, setMetadataTemplate] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        metaDetails
    );

    const [metadataModel, setMetadataModel] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        metadataInstance
    );

    const history = useHistory();
    const [isUpdate, setIsUpdate] = useState(false);
    const [validated, setValidated] = useState(false);
    const [errorName, setErrorName] = useState(false);
    const [duplicateName, setDuplicateName] = useState(false);
    const [errorType, setErrorType] = useState(false);
    const [characterCounter, setCharacterCounter] = useState();
    const [assayCurrentStep, setAssayCurrentStep] = useState(0);
    const [enablePrompt, setEnablePrompt] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [pageErrorsJson, setPageErrorsJson] = useState({});
    const [pageErrorMessage, setPageErrorMessage] = useState("");
    const [showErrorSummary, setShowErrorSummary] = useState(false);
    const [mandateGroupLimitNotMet, setMandateGroupLimitNotMet] = useState(new Map());
    const [mandateGroupLimitExceed, setMandateGroupLimitExceed] = useState(new Map());
    const [updateMetadataName, setUpdateMetadataName] = useState("");
    const [loadDescriptors, setLoadDescriptors] = useState(false);
    const [addDescriptorSelection, setAddDescriptorSelection] = useState("select");

    const [isAllExpanded, setIsAllExpanded] = useState(false);   // not really used
    const [loadDataOnFirstNextInUpdate, setLoadDataOnFirstNextInUpdate] = useState(false);

    useEffect(() => {
        setShowLoading(true);

        if (props.metaID) {
            !props.isCopy && setIsUpdate(true);

            if (props.importedInAPage && props.importedPageData && props.importedPageData.id) {   //TODO where do we have this case??? check to make sure the model is correct!!!
                setMetadataModel(props.importedPageData);
            }

            wsCall(
                props.getMetaData,
                "GET",
                [props.metaID],
                true,
                null,
                getMetadataForUpdateSuccess,
                getGenericMetadataFailure
            );

        } else {
            wsCall(
                "listtemplates",
                "GET",
                { type: props.type },
                true,
                null,
                getListTemplatesSuccess,
                getGenericMetadataFailure
            );
        }
    }, []);

    function getMetadataForUpdateSuccess(response) {
        response.json().then(responseJson => {
            setMetadataModel({
                name: props.isCopy ? "" : responseJson.name,
                templateType: responseJson.templateType,
                template: responseJson.template,
                description: responseJson.description,
                descriptors: responseJson.descriptors,
                descriptorGroups: responseJson.descriptorGroups,
                user: responseJson.user,
                id: responseJson.id,
                type: responseJson.type,
            });

            !props.isCopy && setUpdateMetadataName(responseJson.name);

            props.importedInAPage && props.setMetadataforImportedPage(responseJson);

            const templateType = responseJson.templateType;
            wsCall("gettemplate", "GET", [templateType], true, null, getMetadataTemplateSuccess, getGenericMetadataFailure);
        });
    }

    function getMetadataTemplateSuccess(response) {
        response.json().then(responseJson => {
            setMetadataTemplate({
                selectedtemplate: responseJson.name,
                metadata: responseJson,
                name: responseJson.name
            });

            setShowLoading(false);
        });
    }

    /**
     * if this page is for edit, we need to set the defaultSelection of the mandategroups to true for the filled descriptor group of each mandate group
     * all descriptorgroups/descriptors belonging to a mandategroup would have defaultselection=false when loaded from the repository
     * this method also adds missing descriptors to the current descriptor groups of the edited metadata so the user can also fill in those values as required
     * (there is no mechanism on the page to add the subdescriptors if they are currently not displayed!)
     * 
     * @param {Array} descriptorList current descriptor list of the metadata being edited/updated
     * @param {Array} templateDescriptors list of descriptors from the metadata template
     */
    function processMandateGroups(descriptorList, templateDescriptors, isSubGroup) {
        if (!isSubGroup) {
            // if it is top level simple descriptorslist, we need to add missing simple descriptors (from the template)
            // since there is no way to add them in the page
            if (descriptorList.filter(desc => !desc.group).length > 0) {
                if (templateDescriptors) {
                    // top level descriptors from the template
                    let descriptorsFromTemplate = templateDescriptors.filter(e => !e.group);
                    if (descriptorList.length < descriptorsFromTemplate.length) {
                        descriptorsFromTemplate.forEach(d => {
                            let found = descriptorList.find(i => i.name === d.name);
                            if (!found) {
                                let newDesc;
                                if (d.group) {
                                    newDesc = createDescriptorGroup(d);
                                } else {
                                    newDesc = createDescriptor(d);
                                }
                                descriptorList.push(newDesc);
                                sortDescriptors(descriptorList);
                            }
                        });
                    }
                }
            }
        }
        descriptorList.map(desc => {
            if (desc.key.mandateGroup) {
                let mandateGroupDescFromTemplate = [];
                // find all descriptors belonging to the mandate group
                if (templateDescriptors) {
                    mandateGroupDescFromTemplate = templateDescriptors.filter(e => e.mandateGroup && e.mandateGroup.id === desc.key.mandateGroup.id);
                }
                // check which one has values
                let mandateGroupDesc = descriptorList.filter(i => i.key.mandateGroup && i.key.mandateGroup.id === desc.key.mandateGroup.id);
                let modified = false;
                if (mandateGroupDesc && mandateGroupDesc.length < mandateGroupDescFromTemplate.length) {
                    // we are missing the other descriptor groups in this mandateGroup
                    // find them from the template and add to the list 
                    mandateGroupDescFromTemplate.forEach(d => {
                        let found = mandateGroupDesc.find(i => i.name === d.name);
                        if (!found) {
                            let newDesc;
                            if (d.group) {
                                newDesc = createDescriptorGroup(d);
                            } else {
                                newDesc = createDescriptor(d);
                            }
                            descriptorList.push(newDesc);
                            modified = true;
                            sortDescriptors(descriptorList);
                        }
                    });
                }
                if (modified) {
                    mandateGroupDesc = descriptorList.filter(i => i.key.mandateGroup && i.key.mandateGroup.id === desc.key.mandateGroup.id);
                }
                let defaultSelected = false;
                mandateGroupDesc.map(e => {
                    if (!e.group && e.value && e.value !== "") {
                        e.key.mandateGroup.defaultSelection = true;
                        defaultSelected = true;
                    } else if (e.group) {
                        // check if filled, set default selection
                        let filledDescriptors = e.descriptors.filter(i => i.value && i.value !== "");
                        if (filledDescriptors.length > 0) {
                            e.key.mandateGroup.defaultSelection = true;
                            defaultSelected = true;
                        } else if (e.key.mandateGroup.defaultSelection) {    // reset default selection if it is not filled
                            e.key.mandateGroup.defaultSelection = false;
                        }
                    } else if (!e.group && e.key.mandateGroup.defaultSelection) {
                        e.key.mandateGroup.defaultSelection = false;
                    }
                    if (e.notRecorded || e.notApplicable) {
                        defaultSelected = true;
                    }
                });
                if (!defaultSelected) {
                    // select the first one
                    if (mandateGroupDesc && mandateGroupDesc.length > 0) {
                        mandateGroupDesc[0].key.mandateGroup.defaultSelection = true;
                    }
                }
            }
            // also disable the descriptor if notRecorded/notApplicable is true
            if (desc.notRecorded || desc.notApplicable) {
                desc.disabled = true;
                // if it is a group, check to make sure its descriptors are populated
                // if this is for editing, notRecorded/notApplicable groups might not have the sub-descriptors loaded
                if (desc.group && desc.descriptors.length == 0) {
                    if (desc.key.group) {
                        let newDesc = createDescriptorGroup(desc.key);
                        desc.descriptors = newDesc.descriptors;
                    }
                }    
            }
            if (desc.group && desc.key.group && isUpdate) {
                // add missing sub descriptors
                let newDesc = createDescriptorGroup(desc.key);
                newDesc.descriptors.forEach(d => {
                    let found = desc.descriptors.find(i => i.name === d.name);
                    if (!found) {
                        desc.descriptors.push(d);
                        sortDescriptors(desc);
                    }
                })
            }

            if (desc.group) {
                // process its subgroups
                processMandateGroups(desc.descriptors, desc.key.descriptors, true);
            }
        });
    }

    const sortDescriptors = selectedMetadata => {
        let descriptorList = selectedMetadata.descriptors ? selectedMetadata.descriptors : selectedMetadata;
        descriptorList.forEach(desc => {
            if (desc.group) {
                desc.descriptors.sort((a, b) => a.order - b.order);
            }
        });
        descriptorList.sort((a, b) => a.order - b.order);
    };

    function getListTemplatesSuccess(response) {
        response.json().then(responseJson => {
            responseJson.forEach(template => {
                template.descriptors.forEach(desc => {
                    if (desc.group) {
                        desc.descriptors.sort((a, b) => a.order - b.order);
                    }
                });
                template.descriptors.sort((a, b) => a.order - b.order);
            });

            setMetadataTemplate({ metadata: responseJson });
            if (responseJson.length === 1) {
                setMetadataTemplate({ selectedtemplate: responseJson[0].name });
                setMetadataModel(createMetadataInstance(responseJson[0]));
            }

            setShowLoading(false);
        });
    }

    function createMetadataInstance(template) {
        let metadata = {};

        metadata["type"] = template.type;
        metadata["template"] = template.name;
        metadata["templateType"] = template.id;
        let descriptors = [];
        let descriptorGroups = [];
        template.descriptors.forEach(desc => {
            if (desc.group) {
                let descGroup = createDescriptorGroup(desc);
                descriptorGroups.push(descGroup);
            } else {
                let descriptor = createDescriptor(desc);
                descriptors.push(descriptor);
            }
        });
        metadata["descriptors"] = descriptors;
        metadata["descriptorGroups"] = descriptorGroups;
        return metadata;
    }

    function createDescriptor(descriptorTemplate) {
        let descriptor = {};
        descriptor["name"] = descriptorTemplate.name;
        descriptor["key"] = descriptorTemplate;
        descriptor["order"] = descriptorTemplate.order;
        descriptor["group"] = false;
        descriptor["id"] = idCounter + "";
        descriptor["value"] = "";
        descriptor["units"] = [];
        descriptor["notApplicable"] = false;
        descriptor["notRecorded"] = false;
        descriptor["@type"] = "descriptor";
        idCounter++;
        return descriptor;
    }

    function createDescriptorGroup(descriptorGroupTemplate) {
        let descriptor = {};
        descriptor["name"] = descriptorGroupTemplate.name;
        descriptor["key"] = descriptorGroupTemplate;
        descriptor["order"] = descriptorGroupTemplate.order;
        descriptor["group"] = true;
        let descriptors = [];
        descriptorGroupTemplate.descriptors.forEach(desc => {
            if (desc.group) {
                let descGroup = createDescriptorGroup(desc);
                descriptors.push(descGroup);
            } else {
                let descriptor = createDescriptor(desc);
                descriptors.push(descriptor);
            }
        });
        descriptor["descriptors"] = descriptors;
        descriptor["id"] = idCounter + "";
        descriptor["@type"] = "descriptorgroup";
        idCounter++;
        return descriptor;
    }

    const handleChange = e => {
        const name = e.target.name;
        const value = e.target.value;

        if (name === "name") {
            setErrorName(false);
            setDuplicateName(false);

            if (updateMetadataName !== value) {
                wsCall(
                    "availablemetadataname",
                    "GET",
                    { name: encodeURIComponent(value.trim()), metadatatype: props.type },
                    true,
                    null,
                    checkMetadataNameSuccess,
                    checkMetadataNameFailure
                );
            }
        } else if (name === "template") {
            // reset object model
            // find the selected template
            const selectedTemplate = metadataTemplate.metadata.filter(i => i.name === value);
            if (selectedTemplate && selectedTemplate.length > 0) {
                let existingName = "";
                if (metadataModel && metadataModel.name)
                    existingName = metadataModel.name;
                setMetadataModel(createMetadataInstance(selectedTemplate[0]));
                setMetadataModel({ name: existingName });
            }
            else {
                alert("Error, could not locate the selected template!");
            }
            setErrorType(false);
            setValidated(false);
            setMetadataTemplate({ selectedtemplate: value });
        } else if (name === "description") {
            setCharacterCounter(value.length);
        }

        setMetadataModel({ [name]: value });
        setEnablePrompt(true);
    };

    function checkMetadataNameSuccess(response) {
        response.json().then(responseJson => {
            if (!responseJson) {
                setValidated(false);
                setErrorName(true);
                setDuplicateName(true);
            }
            setShowLoading(false);
        });
    }

    function checkMetadataNameFailure(response) {
        response.json().then(responseJson => {
            setPageErrorsJson(responseJson);
            setValidated(false);
        });
        setPageErrorMessage("");
        setShowErrorSummary(true);
        setShowLoading(false);
    }

    function getGenericMetadataFailure(response) {
        response.json().then(responseJson => {
            setPageErrorsJson(responseJson);
        });
        setPageErrorMessage("");
        setShowErrorSummary(true);
        setShowLoading(false);
    }

    function metadataToSubmit() {
        var base = process.env.REACT_APP_BASENAME;
        let objectToBeSaved = {
            name: metadataModel.name,
            description: metadataModel.description,
            user: {
                name: window.localStorage.getItem(base ? base + "_loggedinuser" : "loggedinuser")
            },
            template: metadataModel.template,
            templateType: metadataModel.templateType,
            descriptors: metadataModel.descriptors,
            descriptorGroups: metadataModel.descriptorGroups,
            id: isUpdate ? metadataModel.id : "",
            type: getMetaDataType(),
        };
        return props.importedPageData ? objectToBeSaved : JSON.stringify(objectToBeSaved);
    }

    function getMetaDataType() {
        let templateType;

        if (isUpdate || props.isCopy) {
            templateType = metadataTemplate.metadata;
        } else if (props.importedInAPage) {
            templateType = metadataTemplate.metadata[0];
        } else if (props.metadataType !== "Assay") {
            templateType = metadataTemplate.metadata.find(i => i.name === metadataTemplate.selectedtemplate);
        } else if (props.metadataType === "Assay") {
            templateType = metadataTemplate.metadata[0];
        }

        return templateType.type;
    }

    function isGroupMandate() {
        let flag = false;

        const groupDescriptors = metadataModel.descriptorGroups.filter(i => i.group === true && i.key.mandateGroup);

        const NAorNRSelectedGroups = metadataModel.descriptorGroups.filter(
            i => i.group === true && i.key.mandateGroup && (i.notRecorded || i.notApplicable)
        );

        NAorNRSelectedGroups.forEach(e => {
            let deleteList = groupDescriptors.filter(i => i.key.mandateGroup.id === e.key.mandateGroup.id);

            deleteList.forEach(i => {
                var row = groupDescriptors.indexOf(i);
                groupDescriptors.splice(row, 1);
            });
        });

        const mandatoryGroupsFilled = groupDescriptors.filter(function (e) {
            const filledDesc = e.descriptors.filter(function (subDescriptor) {
                if (!subDescriptor.group && (subDescriptor.value || subDescriptor.notRecorded || subDescriptor.notApplicable ||
                    (subDescriptor.key.mandateGroup && subDescriptor.key.mandateGroup.defaultSelection))) {
                    return subDescriptor;
                } else if (subDescriptor.group) {
                    const filledSubGroups = subDescriptor.descriptors.filter(i => i.value || i.notRecorded || i.notApplicable);
                    if (filledSubGroups.length > 0) {
                        return subDescriptor;
                    }
                }
            });

            if (filledDesc.length > 0) {
                return filledDesc;
            }
        });

        let mandateGroupExceed = new Map();
        let mandateGroupNotMet = new Map();

        groupDescriptors.filter(function (e) {
            const sameGroupItems = mandatoryGroupsFilled.filter(i => i.key.mandateGroup.id === e.key.mandateGroup.id);

            if (sameGroupItems.length > 1 && sameGroupItems.filter(i => i.key.mandateGroup.xOrMandate).length > 1) {
                mandateGroupExceed.set(e.key.mandateGroup.id, sameGroupItems);
            } else {
                let missingGroup = [];
                if (mandateGroupNotMet.size > 0) {
                    missingGroup = mandateGroupNotMet.get(e.key.mandateGroup.id);
                    if (!missingGroup) {
                        missingGroup = [];
                    }
                }
                missingGroup.push(e);

                mandateGroupNotMet.set(e.key.mandateGroup.id, missingGroup);
            }
        });

        if (mandateGroupNotMet.size > 0) {
            const itr = mandateGroupNotMet.entries();

            for (var descriptorPair of itr) {
                var pair = descriptorPair[1];
                pair.filter(function (desc) {
                    if (
                        !desc.key.mandateGroup.xOrMandate &&
                        desc.descriptors.filter(i => i.value || i.notRecorded || i.notApplicable).length > 0
                    ) {
                        mandateGroupNotMet.delete(descriptorPair[0]);
                    } else {
                        // the last check (default selection check) is to handle "cell free expression system" since the value is not set on that descriptor (only a checkbox)
                        if (desc.key.mandateGroup.xOrMandate) {
                            let filled = desc.descriptors.filter(i => i.value || i.notRecorded || i.notApplicable || (i.key.mandateGroup && i.key.mandateGroup.defaultSelection));
                            if (filled.length > 0) {
                                mandateGroupNotMet.delete(descriptorPair[0]);
                            }
                        }
                    }
                });
            }
        }

        if (mandateGroupExceed.size > 0 || mandateGroupNotMet.size > 0) {
            flag = true;
        }

        setMandateGroupLimitNotMet(mandateGroupNotMet);
        setMandateGroupLimitExceed(mandateGroupExceed);

        return flag;
    }

    function handleSubmit(e) {
        if ((assayCurrentStep === 2 && props.metadataType === "Assay") || props.metadataType !== "Assay") {
            setValidated(true);

            if (e.currentTarget.checkValidity() && !isGroupMandate()) {
                setShowLoading(true);

                // remove unfilled descriptors
                metadataModel.descriptors = cleanupMetadata(metadataModel.descriptors);
                metadataModel.descriptorGroups = cleanupMetadata(metadataModel.descriptorGroups);

                if (props.importedPageData) {
                    props.handleNext(e);
                    props.setImportedPageDataToSubmit(metadataToSubmit());
                    setShowLoading(false);
                } else {
                    if (isUpdate) {
                        wsCall(props.updateMeta, "POST", null, true, metadataToSubmit(), addMetaSuccess, addMetaFailure);
                    } else {
                        wsCall(props.addMeta, "POST", null, true, metadataToSubmit(), addMetaSuccess, addMetaFailure);
                    }
                }
            }
        } else {
            validateAssayStep2Data(e);
        }

        if (!e.currentTarget.checkValidity()) { 
            setPageErrorMessage("There are errors on the page. Please fill in the required fields and resubmit");

            ScrollToTop();
            setShowErrorSummary(true);
        }
        e.preventDefault();
    }

    function cleanupMetadata(descList) {
        let cleanedList = [];
        descList.forEach(desc => {
            if (desc.group) {
                desc.descriptors = cleanupMetadata(desc.descriptors);
                if (desc.descriptors.length > 0 || desc.notRecorded || desc.notApplicable) {
                    cleanedList.push(desc);
                }
            } else {
                if (desc.notRecorded || desc.notApplicable || (desc.value && desc.value !== "") || (desc.key.mandateGroup && desc.key.mandateGroup.defaultSelection)) {
                    cleanedList.push(desc);
                }
            }
        });
        return cleanedList;
    }

    function addMetaSuccess(response) {
        console.log(response);

        setEnablePrompt(false);
        setShowLoading(false);
        history.push("/" + props.redirectTo);
    }

    function addMetaFailure(response) {
        var formError = false;
        let aggregatedSummary = "";

        response.json().then(responseJson => {
            responseJson.errors &&
                responseJson.errors.forEach(element => {
                    if (element.defaultMessage === "NotFound") {
                        if (aggregatedSummary.includes("Please")) {
                            aggregatedSummary += `${","} ${element.objectName}`;
                        } else {
                            aggregatedSummary += `Please Add Descriptor Groups: ${element.objectName}`;
                        }
                        formError = true;
                    } else if (element.objectName === "name") {
                        setValidated(false);
                        setErrorName(true);
                        setLoadDescriptors(false);
                        setDuplicateName(true);
                        formError = true;
                    }
                });

            if (!formError) {
                setPageErrorsJson(responseJson);
                setShowErrorSummary(true);
            } else if (aggregatedSummary) {
                setPageErrorMessage(aggregatedSummary);
                setShowErrorSummary(true);
            }

            setShowLoading(false);
        });
    }

    const getButtonsForImportedPage = () => {
        return (
            <>
                {props.type === "FEATURE" ? (
                    <div className="mt-4 mb-4 text-center">
                        <Link to="/features">
                            <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Features</Button>
                        </Link>
                        <Button onClick={props.handleBack} className="gg-btn-blue mt-2 gg-ml-20 gg-mr-20">
                            Back
                        </Button>
                        <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
                            Next
                        </Button>
                    </div>
                ) : (
                    <div className="mt-4 mb-4 text-center">
                        <Button onClick={props.handleBack} className="gg-btn-blue mt-2 gg-ml-20 gg-mr-20">
                            Back
                        </Button>
                        <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
                            Next
                        </Button>
                    </div>
                )}
            </>
        );
    };

    const handleNext = () => {
        if (
            metadataModel.name === "" &&
            (metadataModel.template === "" || metadataModel.template === "select")
        ) {
            setErrorName(true);
            setErrorType(true);
        } else if (metadataModel.template === "" || metadataModel.template === "select") {
            setErrorType(true);
        } else if (metadataModel.name === "") {
            setErrorName(true);
        } else {


            if (!isUpdate && props.metadataType === "Assay") {
                // need to keep only the selected groups from the first page
                let selectedGroups = metadataModel.descriptorGroups.filter(function (group) {
                    let selections = metadataTemplate.metadata[0].descriptors.filter(group => group.displayLabel && group.displayLabelSelected);
                    let isSelected = selections.find(i => i.group && i.name == group.name);
                    if (isSelected) {
                        return group;
                    }
                    let notSelectable = metadataTemplate.metadata[0].descriptors.filter(group => !group.displayLabel);
                    isSelected = notSelectable.find(i => i.group && i.name == group.name);
                    if (isSelected) {
                        return group;
                    }
                    if (group.key.mandatory) {
                        return group;
                    }
                });
                metadataModel.descriptorGroups = selectedGroups;
            }

            let templateType;
            if (isUpdate || props.isCopy) {
                templateType = metadataTemplate.metadata;
                processMandateGroups(metadataModel.descriptors, templateType ? templateType.descriptors : undefined);
                processMandateGroups(metadataModel.descriptorGroups, templateType ? templateType.descriptors : undefined);
            } else if (props.importedInAPage) {
                templateType = metadataTemplate.metadata[0];
                processMandateGroups(metadataModel.descriptors, templateType ? templateType.descriptors : undefined);
                processMandateGroups(metadataModel.descriptorGroups, templateType ? templateType.descriptors : undefined);
            }

            setLoadDescriptors(true);
        }
    };

    function validateAssayStep2Data(e) {
        setValidated(true);

        if (!e.currentTarget.checkValidity()) {
            e.preventDefault();
        } else {
            setAssayCurrentStep(2);
        }
    }

    const getListTemplate = () => {
        return (
            <>
                <Form.Group as={Row} controlId="type" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                        {(metadataTemplate && metadataTemplate.metadata && metadataTemplate.metadata.length > 1) ||
                            (metadataTemplate && metadataTemplate.name && !metadataTemplate.name.startsWith("Default") && (
                                <FormLabel
                                    label={`${props.metadataType === "Printrun" ? "Print Run" : props.metadataType} Type`}
                                    className="required-asterik"
                                />
                            ))}
                        {((metadataTemplate && metadataTemplate.name && !metadataTemplate.name.startsWith("Default")) ||
                            metadataTemplate.metadata.length > 0) && (
                                <Form.Control
                                    as="select"
                                    name="template"
                                    value={metadataModel.template}
                                    onChange={handleChange}
                                    isInvalid={errorType}
                                    disabled={isUpdate || props.isCopy}
                                    required
                                >
                                    <option value={metadataModel.template}>{metadataModel.template}</option>
                                </Form.Control>
                            )}
                        <Feedback message={`${props.metadataType} Type is required`} />
                    </Col>
                </Form.Group>
            </>
        );
    };

    const listAssayDisplayLabelCheckBox = () => {
        return metadataTemplate.metadata[0].descriptors.map(ele => {
            if (ele.displayLabel) {
                return (
                    <>
                        <FormGroup controlid={ele.id}>
                            <Col xs={12} lg={9}>
                                <FormControlLabel
                                    control={
                                        <BlueCheckbox
                                            id={ele.id}
                                            name="assayDescCheckbox"
                                            onChange={handleAssayDisplayLabelChange}
                                            checked={ele.displayLabelSelected}
                                            size="medium"
                                        />
                                    }
                                    label={ele.displayLabel}
                                />
                            </Col>
                        </FormGroup>       

                    </>
                );
            }
        });
    };

    const handleAssayDisplayLabelChange = e => {
        const flag = e.target.checked;
        const id = e.currentTarget.id;

        // mark selected descritor templates to 
        // be able to start with the selected descriptors 
        let selectedItem = metadataTemplate.metadata[0].descriptors.find(i => i.id === id);
        selectedItem.displayLabelSelected = flag;

        setMetadataTemplate(metadataTemplate);
    };

    const getStartMetadataPage = () => {
        return (
            <>
                <Form.Group as={Row} controlId="name" className="gg-align-center mb-3 mt-2">
                    <Col xs={12} lg={9}>
                        <FormLabel label="Name" className="required-asterik" />
                        <Form.Control
                            type="text"
                            name="name"
                            placeholder="Enter Name"
                            value={metadataModel.name}
                            onChange={handleChange}
                            required
                            isInvalid={errorName}
                            maxLength={50}
                        />
                        <Feedback
                            message={
                                duplicateName ? "Another metadata has the same Name. Please use a different Name." : "Name is required"
                            }
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="description" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                        <FormLabel label="Description" />
                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="description"
                            placeholder="Enter Description"
                            value={metadataModel.description}
                            onChange={handleChange}
                            maxLength={2000}
                        />
                        <div className="text-right text-muted">
                            {metadataModel.description === "0" ? "0" : characterCounter} /2000
                        </div>
                    </Col>
                </Form.Group>

                {!isUpdate && !props.isCopy &&
                    ((metadataTemplate && metadataTemplate.metadata && metadataTemplate.metadata.length > 1) ||
                        (metadataTemplate && metadataTemplate.name && !metadataTemplate.name.startsWith("Default"))) && (
                        <Form.Group as={Row} controlId="description" className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                                <FormLabel
                                    label={`${props.metadataType === "Printrun" ? "Print Run" : props.metadataType} Type`}
                                    className="required-asterik"
                                />

                                <Form.Control
                                    as="select"
                                    name="template"
                                    value={metadataModel.template}
                                    onChange={handleChange}
                                    isInvalid={errorType}
                                    disabled={isUpdate || props.isCopy}
                                    required
                                >
                                    <option value="select">Select {`${props.metadataType} Type`}</option>
                                    {metadataTemplate.metadata.map((element, index) => {
                                        return (
                                            <option key={index} value={element.name}>
                                                {element.name}
                                            </option>
                                        );
                                    })}
                                </Form.Control>
                                <Feedback message={`${props.metadataType} Type is required`} />
                            </Col>
                        </Form.Group>)}

                {(isUpdate || props.isCopy) && getListTemplate()}

                {props.metadataType === "Assay" && metadataTemplate.metadata.length > 0 && (
                    <>
                        <Form.Group as={Row} className="gg-align-center mb-3" controlId={"displayLabel"}>
                            <Col xs={12} lg={9}>
                                <FormLabel
                                    label={`Did your assay contain the following steps? Please note that these steps
                            can also be added manually later on by selecting Next step`}
                                />

                                {listAssayDisplayLabelCheckBox()}
                            </Col>
                        </Form.Group>
                    </>
                )}
            </>
        );
    };

    const getList = (groupElements, groupId) => {
        let sameGroupElements = groupElements.map((element, index) => {
            return `   ${element.name.toUpperCase()},`;
        });

        return (
            <>
                <Row style={{ marginTop: "10px" }}>
                    <Col md={4} style={{ textAlign: "right" }}>{`Group ID: ${groupId}`}</Col>
                    <Col md={8} style={{ textAlign: "left" }}>
                        {sameGroupElements}
                    </Col>
                </Row>
            </>
        );
    };

    const getXorList = (mandateGroupMap, message) => {
        let itr = mandateGroupMap.entries();
        let listMandatoryGroup = [];

        for (var pair of itr) {
            var groupId = pair[0];
            var element = pair[1];
            listMandatoryGroup.push(getList(element, groupId));
        }
        return (
            <>
                <Alert
                    variant="danger"
                    style={{
                        width: "fit-content",
                        marginLeft: "25%"
                    }}
                >
                    <span
                        style={{
                            color: "#",
                            fontWeight: "bold",
                            // paddingRight: "600px",
                            borderColor: "#f5c6cb",
                            textTransform: "uppercase"
                        }}
                    >
                        {message}
                    </span>
                    <br />
                    {listMandatoryGroup}
                </Alert>
            </>
        );
    };

    const getMetaData = () => {
        meta = (
            <>
                {!props.importedInAPage && (
                    <>
                        <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                                <FormLabel label="Name" className="required-asterik" />
                                <Form.Control type="text" name="name" disabled value={metadataModel.name} />
                            </Col>
                        </Form.Group>

                        {(metadataTemplate && metadataTemplate.metadata && metadataTemplate.metadata.length > 1) ||
                            (metadataTemplate && metadataTemplate.name && !metadataTemplate.name.startsWith("Default")) ? (
                            <Form.Group as={Row} controlId="type" className="gg-align-center mb-3">
                                <Col xs={12} lg={9}>
                                    <FormLabel
                                        label={`${props.metadataType === "Printrun" ? "Print Run" : props.metadataType} Type`}
                                        className="required-asterik"
                                    />
                                    <Form.Control type="text" name="type" disabled value={metadataTemplate.selectedtemplate} />
                                </Col>
                            </Form.Group>
                        ) : (
                            ""
                        )}

                        {/* groups with max Occurrence hasn't met */}
                        {getAddons()}
                    </>
                )}

                {props.metadataType === "Feature" && (
                    <>
                        <Form.Group as={Row} className="gg-align-center mb-3" controlId="name">
                            <Col xs={12} lg={9}>
                                <FormLabel label="Name" className={"required-asterik"} />
                                <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={props.featureAddState.name}
                                    onChange={e => {
                                        props.setFeatureAddState({ name: e.target.value });
                                        props.setFeatureAddState({ invalidName: false });
                                    }}
                                    isInvalid={props.featureAddState.invalidName}
                                    maxLength={50}
                                    required
                                />
                                <Feedback message="Name is required" />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="gg-align-center mb-3" controlId="featureId">
                            <Col xs={12} lg={9}>
                                <FormLabel label="Feature ID" className={"required-asterik"} />
                                <Form.Control
                                    type="text"
                                    name="featureId"
                                    placeholder="Feature ID"
                                    value={props.featureAddState.featureId}
                                    onChange={e => {
                                        props.setFeatureAddState({ featureId: e.target.value });
                                        props.setFeatureAddState({ validateFeatureId: false });
                                    }}
                                    isInvalid={props.featureAddState.validateFeatureId}
                                    maxLength={30}
                                    required
                                />
                                <Feedback message="Feature ID is required" />
                            </Col>
                        </Form.Group>

                        {getAddons()}
                    </>
                )}

                {props.metadataType === "Assay" ? (
                    <DragDropContext onDragEnd={dragEnd}>{loadDescriptorsAndGroups()}</DragDropContext>
                ) : (
                    loadDescriptorsAndGroups()
                )}
            </>
        );
        return meta;
    };

    const getAddons = () => {
        let name;

        const onDescriptorChange = ({ target: { value } }) => {
            setAddDescriptorSelection(value);
            name = value;
            if (value !== "Select" && value !== "select") {
                handleAddDescriptorGroups(name);
            }
        };

        return (
            <>
                <Form.Group as={Row} controlId={""} className="gg-align-center">
                    <Col xs={12} lg={4}>
                        <FormLabel label="Add Descriptors" />
                        <Form.Control
                            as="select"
                            value={addDescriptorSelection}
                            onChange={onDescriptorChange}
                        >
                            {getDescriptorOptions()}
                        </Form.Control>
                    </Col>
                </Form.Group>
            </>
        );
    };

    const getDescriptorOptions = () => {
        const options = [];
        let sortOptions = [];
        let templateType;
        let desc = [];

        if (isUpdate || props.isCopy) {
            templateType = metadataTemplate.metadata;
        } else if (props.importedInAPage) {
            templateType = metadataTemplate.metadata[0];
        } else if (props.metadataType !== "Assay") {
            templateType = metadataTemplate.metadata.find(i => i.name === metadataTemplate.selectedtemplate);
        } else if (props.metadataType === "Assay") {
            templateType = metadataTemplate.metadata[0];
        }

        desc = templateType.descriptors;

        options.push(
            <option key={0} value={"Select"}>
                Select Descriptor
            </option>
        );

        if (assayCurrentStep === 2 && props.metadataType === "Assay") {
            let refCount = desc.filter(i => i.name === "Reference");
            const occurrences = sortOptions.filter(i => i === "Reference");

            if (refCount[0].maxOccurrence > refCount.length) {
                occurrences.length < 1 && sortOptions.push(refCount[0].name);
            }
        } else {
            desc.forEach(d => {
                const occurrences = sortOptions.filter(i => i === d.name);

                if ((d.name !== "Reference" && props.metadataType === "Assay") || props.metadataType !== "Assay") {
                    if (!d.mandateGroup) {
                        if (d.maxOccurrence === 1 && !d.mandatory) {
                            if (d.group) {
                                // check if the descriptor is already on the page
                                const exists = metadataModel.descriptorGroups.filter(i => i.name === d.name);
                                exists.length < 1 && occurrences.length < 1 && sortOptions.push(d.name);
                            }
                        } else if (d.maxOccurrence > 1) {
                            let currentDisplayCount = desc.filter(e => e.name === d.name);
                            if (currentDisplayCount.length < d.maxOccurrence) {
                                occurrences.length < 1 && sortOptions.push(d.name);
                            }
                        }
                    }
                }
            });
        }

        sortOptions.sort().forEach((element, index) => {
            options.push(
                <option key={index + 1} value={element}>
                    {element}
                </option>
            );
        });

        return options;
    };


    function validateUserInput(subGroupAddElement, subGroupAddDescriptor) {
        let flag = true;

        subGroupAddDescriptor.descriptors.forEach(ele => {
            if (ele.mandatory) {
                if (!ele.value || (ele.value && ele.value.length < 1) || ele.value === "") {
                    flag = false;
                }
            }
        });

        return flag;
    }

    const handleChangeMetaForm = (descriptorDetails, e, type) => {
        let value = "";
        let flag;

        if (type === "checkBox") {
            flag = e.target.checked;
        } else if (type === "date") {
            let day = e._d.getDate() < 10 ? `0${e._d.getDate()}` : e._d.getDate();
            let month = e._d.getMonth() + 1 < 10 ? `0${e._d.getMonth() + 1}` : e._d.getMonth();
            let year = e._d.getFullYear();

            value = `${month}/${day}/${year}`;
        } else if (e.target.name === "unitlevel") {
            value = e.target.options[e.target.selectedIndex].value;
        } else {
            value = e.target.value;
        }

        if (e.target.name === "unitlevel") {
            descriptorDetails.unit = value;
        } else if (type === "checkBox") {
            descriptorDetails = handleCheckBox(descriptorDetails, flag, e);
        } else {
            descriptorDetails.value = value;
        }

        setMetadataModel(metadataModel);

        props.importedInAPage && props.setMetadataforImportedPage(metadataModel);
    };

    function handleCheckBox(descriptorDetails, flag, e) {
        if (e.target.name === "notApplicable" && flag) {
            descriptorDetails.notApplicable = flag;
            if (descriptorDetails.notRecorded) {
                descriptorDetails.notRecorded = false;
            }
        } else if (e.target.name === "notApplicable" && !flag) {
            descriptorDetails.notApplicable = flag;
        } else if (e.target.name === "notRecorded" && flag) {
            descriptorDetails.notRecorded = flag;
            if (descriptorDetails.notApplicable) {
                descriptorDetails.notApplicable = false;
            }
        } else if (e.target.name === "notRecorded" && !flag) {
            descriptorDetails.notRecorded = flag;
        } else { // other boolean
            descriptorDetails.value = flag;
        }

        if (descriptorDetails.notApplicable || descriptorDetails.notRecorded) {
            descriptorDetails.disabled = true;
        } else if (!descriptorDetails.notApplicable && !descriptorDetails.notRecorded) {
            descriptorDetails.disabled = false;
        }

        return descriptorDetails;
    }

    function nonXorGroupApporRec(desc, notAppOrRec) {
        let indexOfLatestSelection;
        var itemByType = { ...metadataModel };

        var itemDescriptors = desc.group ? itemByType.descriptorGroups : itemByType.descriptors;

        indexOfLatestSelection = itemDescriptors.indexOf(desc);

        if (!notAppOrRec) {
            desc.notApplicable = false;
            desc.notRecorded = false;
            if (desc.group && desc.descriptors.length == 0) {
                // need to initialize the subdescriptors
                let newDesc = createDescriptorGroup(desc.key);
                desc.descriptors = newDesc.descriptors;
            }
        } else if (notAppOrRec === "notApplicable") {
            desc.notApplicable = true;
            desc.notRecorded = false;
        } else if (notAppOrRec === "notRecorded") {
            desc.notRecorded = true;
            desc.notApplicable = false;
        }

        itemDescriptors[indexOfLatestSelection] = desc;

        if (desc.group) {
            itemByType.descriptorGroups = itemDescriptors;
        } else {
            itemByType.descriptors = itemDescriptors;
        }

        setMetadataModel(itemByType);
        props.importedInAPage && props.setMetadataforImportedPage(metadataModel);
    }

    const handleDelete = (id) => {
        var descriptorToDelete = metadataModel.descriptors.find(i => i.id === id);
        if (descriptorToDelete) {
            // remove from the list
            const index = metadataModel.descriptors.findIndex(e => e.id === id);
            if (index >= 0) {
                metadataModel.descriptors.splice(index, 1);
            }
        } else {
            const index = metadataModel.descriptorGroups.findIndex(e => e.id === id);
            if (index >= 0) {
                metadataModel.descriptorGroups.splice(index, 1);
            }
        }
        setMetadataModel(metadataModel);
        props.importedInAPage && props.setMetadataforImportedPage(metadataModel);
    };

    const handleSubGroupDelete = (selectedDescriptor, parentGroup) => {
        var descriptorList = parentGroup.descriptors ? parentGroup.descriptors : parentGroup;
        var descriptorToDelete = descriptorList.find(i => i.id === selectedDescriptor.id);
        if (descriptorToDelete) {
            // remove from the list
            const index = descriptorList.findIndex(e => e.id === selectedDescriptor.id);
            if (index >= 0) {
                descriptorList.splice(index, 1);
            }
        }
        // if there are no more copies of this subgroup, we need to add a new empty copy
        // there is no mechanism on the page to add these back
        var existing = descriptorList.find(i => i.name == selectedDescriptor.name);
        if (!existing) {
            var desc = createDescriptorGroup(selectedDescriptor.key);
            descriptorList.push(desc);
        }
        setMetadataModel(metadataModel);
        props.importedInAPage && props.setMetadataforImportedPage(metadataModel);
    };
    const handleCancelModal = (selectedSubGroup, selectedGroup) => {
        // remove selectedSubGroup from selectedGroup
        handleSubGroupDelete(selectedSubGroup, selectedGroup);
    };

    const handleAddDescriptorGroups = elementSelected => {
        const errorMessage = "MaxOccurrence for the descriptor has been reached";
        // check if it already is on the page
        var existing = metadataModel.descriptorGroups.filter(e => e.name === elementSelected);

        let template;
        if (isUpdate || props.isCopy) {
            template = metadataTemplate.metadata;
        } else if (props.importedInAPage) {
            template = metadataTemplate.metadata[0];
        } else if (props.metadataType !== "Assay") {
            template = metadataTemplate.metadata.find(i => i.name === metadataTemplate.selectedtemplate);
        } else if (props.metadataType === "Assay") {
            template = metadataTemplate.metadata[0];
        }

        var descriptorGroupTemplate = template.descriptors.find(e => e.name === elementSelected);
        if (existing.length + 1 <= descriptorGroupTemplate.maxOccurrence) {
            if (descriptorGroupTemplate.group) {
                // we can add the new descriptor group
                let descGroup = createDescriptorGroup(descriptorGroupTemplate);
                // insert right after an existing one, if any
                if (existing.length > 0) {
                    // set the order as the same as an existing one in case of Assay
                    if (props.metadataType === "Assay") {
                        descGroup.order = existing[0].order;
                    }
                    const index = metadataModel.descriptorGroups.findLastIndex(e => e.name === elementSelected);
                    const newDescriptorGroups = [
                        ...metadataModel.descriptorGroups.slice(0, index + 1),
                        descGroup,
                        ...metadataModel.descriptorGroups.slice(index + 1)
                    ];
                    metadataModel.descriptorGroups = newDescriptorGroups;
                }
                else {
                    metadataModel.descriptorGroups.push(descGroup);
                }
            } else {
                // we can add the new descriptor group
                let desc = createDescriptor(descriptorGroupTemplate);
                // insert right after an existing one, if any
                if (existing.length > 0) {
                    if (props.metadataType === "Assay") {
                        desc.order = existing[0].order;
                    }
                    const index = metadataModel.descriptors.findLastIndex(e => e.name === elementSelected);
                    const newDescriptorGroups = [
                        ...metadataModel.descriptors.slice(0, index + 1),
                        desc,
                        ...metadataModel.descriptors.slice(index + 1)
                    ];
                    metadataModel.descriptors = newDescriptorGroups;
                }
                else {
                    metadataModel.descriptors.push(desc);
                }

            }
        } else { // max occurrence has been reached
            alert(errorMessage);
        }

     /*   if (props.metadataType === "Assay") {
            sortAssayDescriptors(metadataModel);
        } */ 

        setMetadataModel(metadataModel);
        props.importedInAPage && props.setMetadataforImportedPage(metadataModel);
    };

    const handleAddDescriptorSubGroups = (selectedGroup, selectedSubGrpDesc) => {
        const errorMessage = "MaxOccurrence for the descriptor has been reached";
        // check if it already is on the page
        var sameGroup = selectedGroup.descriptors.filter(e => e.name === selectedSubGrpDesc.name);
        var descriptorTemplate = selectedSubGrpDesc.key;
        var filled = false;
        // check if the existing copy of the sub group has already been filled
        sameGroup.map(desc => {
            let filledDescriptors = desc.descriptors.filter(i => i.value && i.value !== "");
            if (filledDescriptors.length > 0) {
                filled = true;
            }
        });

        if (!filled) {
            // it is already created and in the model, no need to create a new copy
            // the user will fill in this one
            return selectedSubGrpDesc;
        }

        if (sameGroup.length + 1 <= descriptorTemplate.maxOccurrence) {
            let desc;
            if (descriptorTemplate.group) {
                // we can add the new descriptor group
                desc = createDescriptorGroup(descriptorTemplate);
            } else {
                desc = createDescriptor(descriptorTemplate);
            }

            // insert right after an existing one, if any
            if (sameGroup.length > 0) {
                const index = selectedGroup.descriptors.findLastIndex(e => e.name === selectedSubGrpDesc.name);
                const newDescriptors = [
                    ...selectedGroup.descriptors.slice(0, index + 1),
                    desc,
                    ...selectedGroup.descriptors.slice(index + 1)
                ];
                selectedGroup.descriptors = newDescriptors;
            } else {
                selectedGroup.descriptors.push(desc);
            }

            setMetadataModel(metadataModel);
            props.importedInAPage && props.setMetadataforImportedPage(metadataModel);
            return desc;
        } else { // max occurrence has been reached
            alert(errorMessage);
        }
    };

    function defaultSelectionChangeSuperGroup(latestDefaultSelection, notApplicableOrRecorded, sg) {
        let indexOfCurrentDefaultSelection;
        let indexOfLatestDefaultSelection;

        var itemDescriptors = sg.descriptors ? sg.descriptors : sg;

        let currentDefaultSelection = itemDescriptors.filter(
            i =>
                i.key.mandateGroup &&
                i.key.mandateGroup.id === latestDefaultSelection.key.mandateGroup.id &&
                (i.key.mandateGroup.defaultSelection || i.notApplicable || i.notRecorded)
        );

        if (currentDefaultSelection.length > 1) {
            if (isUpdate) {
                // let listOfRemoveDefaultSelection=
                currentDefaultSelection.filter(e => {
                    if (e.id !== latestDefaultSelection.id) {
                        e.notApplicable = false;
                        e.notRecorded = false;
                        e.key.mandateGroup.defaultSelection = false;
                    }
                });

                latestDefaultSelection.key.mandateGroup.defaultSelection = true;
                latestDefaultSelection.notApplicable = false;
                latestDefaultSelection.notRecorded = false;
            }
        } else if (currentDefaultSelection.length < 1 && !notApplicableOrRecorded) {
            currentDefaultSelection = itemDescriptors.filter(
                i =>
                    i.key.mandateGroup &&
                    i.key.mandateGroup.id === latestDefaultSelection.key.mandateGroup.id &&
                    i.key.mandateGroup.defaultSelection === false &&
                    (i.notApplicable || i.notRecorded)
            );

            indexOfCurrentDefaultSelection = itemDescriptors.indexOf(currentDefaultSelection[0]);
            currentDefaultSelection[0].notApplicable = false;
            currentDefaultSelection[0].notRecorded = false;
            itemDescriptors[indexOfCurrentDefaultSelection] = currentDefaultSelection[0];
        } else if ((currentDefaultSelection.length === 1 && notApplicableOrRecorded) || !notApplicableOrRecorded) {
            if (currentDefaultSelection[0]) {
                if (currentDefaultSelection[0].group) {
                    currentDefaultSelection[0].descriptors.forEach(d => {
                        if (d.group) {
                            var dg = d.descriptors;
                            dg.forEach(sgd => {
                                if (sgd.disabled) {
                                    sgd.disabled = false;
                                    sgd.notApplicable = false;
                                    sgd.notRecorded = false;
                                }
                                sgd.value = "";
                            });
                        } else if (!d.group) {
                            if (d.disabled) {
                                d.disabled = false;
                                d.notApplicable = false;
                                d.notRecorded = false;
                            }
                            d.value = "";
                        }
                    });
                } else {
                    currentDefaultSelection[0].value = "";
                }
            }

            indexOfCurrentDefaultSelection = itemDescriptors.indexOf(currentDefaultSelection[0]);
            currentDefaultSelection[0].key.mandateGroup.defaultSelection = false;
            currentDefaultSelection[0].notApplicable = notApplicableOrRecorded && notApplicableOrRecorded === "notApplicable" ? true : false;
            currentDefaultSelection[0].notRecorded = notApplicableOrRecorded && notApplicableOrRecorded === "notRecorded" ? true : false;;
            itemDescriptors[indexOfCurrentDefaultSelection] = currentDefaultSelection[0];
        }

        if (notApplicableOrRecorded) {
            let sameXorGroup = itemDescriptors.filter(
                i => i.key.mandateGroup && i.key.mandateGroup.id === latestDefaultSelection.key.mandateGroup.id
            );
            if (sameXorGroup.length > 0) {
                let lastElementIntheGroup = sameXorGroup[sameXorGroup.length - 1];
                lastElementIntheGroup.key.mandateGroup.defaultSelection = false;

                if (notApplicableOrRecorded === "notApplicable") {
                    lastElementIntheGroup.notApplicable = true;
                    lastElementIntheGroup.notRecorded = false;
                } else if (notApplicableOrRecorded === "notRecorded") {
                    lastElementIntheGroup.notRecorded = true;
                    lastElementIntheGroup.notApplicable = false;
                }
            }
        } else {
            indexOfLatestDefaultSelection = itemDescriptors.indexOf(latestDefaultSelection);
            latestDefaultSelection.key.mandateGroup.defaultSelection = true;
            itemDescriptors[indexOfLatestDefaultSelection] = latestDefaultSelection;
        }

        setMetadataModel(metadataModel);
        props.importedInAPage && props.setMetadataforImportedPage(metadataModel);
    }

    const loadDescriptorsAndGroups = () => {
        return (
            <>
                <Descriptors
                    metaDataTemplate={metadataTemplate.metadata.length ? metadataTemplate.metadata.find(i => i.name === metadataTemplate.selectedtemplate) : metadataTemplate.metadata}
                    metaType={props.metadataType}
                    descriptors={metadataModel}
                    handleChange={handleChangeMetaForm}
                    handleDelete={handleDelete}
                    validateUserInput={validateUserInput}
                    isAllExpanded={isAllExpanded}
                    handleSubGroupDelete={handleSubGroupDelete}
                    handleCancelModal={handleCancelModal}
                    handleUnitSelectionChange={handleChangeMetaForm}
                    handleAddDescriptorGroups={handleAddDescriptorGroups}
                    handleAddDescriptorSubGroups={handleAddDescriptorSubGroups}
                    defaultSelectionChangeSuperGroup={defaultSelectionChangeSuperGroup}
                    defaultSelectionChangeSubGroup={defaultSelectionChangeSuperGroup}
                    nonXorGroupApporRec={nonXorGroupApporRec}
                    setAssayCurrentStep={setAssayCurrentStep}
                    assayCurrentStep={assayCurrentStep}
                    setLoadDataOnFirstNextInUpdate={setLoadDataOnFirstNextInUpdate}
                    loadDataOnFirstNextInUpdate={loadDataOnFirstNextInUpdate}
                />

                <div className="mb-3">
                    <div>
                        <sup>1</sup>
                        {` Information was not provided by vendor, manufacturer or customer etc.`}
                    </div>
                    <div>
                        <sup>2</sup>
                        {` Information was not recorded during the experiment.`}
                    </div>
                </div>
            </>
        );
    };

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        if (startIndex < endIndex - 1) {
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex - 1, 0, removed);
        } else {
            // going up
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
        }
        return result;
    };

    const dragEnd = result => {
        const { source, destination } = result;
        if (!destination) {
            return;
        }

        var list = metadataModel.descriptorGroups;

        const sourceIndex = source.index;
        const destinationIndex = destination.index;

        var reorderedList = reorder(list, sourceIndex, destinationIndex);

        // update orders according to their current indices in the array
        for (var i = 0; i < reorderedList.length; i++) {
            reorderedList[i].order = i + 1;
        }

        metadataModel.descriptorGroups = reorderedList;

        setMetadataModel(metadataModel);
    };

    const getPageLoaded = () => {
        let templateType;

        if (isUpdate || props.isCopy) {
            templateType = metadataTemplate.metadata;
        } else if (props.importedInAPage) {
            templateType = metadataTemplate.metadata[0];
        } else if (props.metadataType !== "Assay") {
            templateType = metadataTemplate.metadata.find(i => i.name === metadataTemplate.selectedtemplate);
        } else if (props.metadataType === "Assay") {
            templateType = metadataTemplate.metadata[0];
        }
        return (
            <>
                {getButtonsForImportedPage()}
                <Row>
                    <Col>
                        {(!loadDataOnFirstNextInUpdate || props.importSpotchange) &&
                            !props.importedPageData.id &&
                            metadataModel && (metadataModel.descriptors.length > 0 || metadataModel.descriptorGroups.length > 0) &&
                            processMandateGroups(metadataModel.descriptors, templateType.descriptors) && processMandateGroups(metadataModel.descriptorGroups, templateType.descriptors)}
                        {((props.importedPageData && props.importedPageData.id) || props.metadataType === "Feature") &&
                            metadataModel && (metadataModel.descriptors.length > 0 || metadataModel.descriptorGroups.length > 0) && getMetaData()
                        }
                    </Col>
                </Row>
                {getButtonsForImportedPage()}
            </>
        );
    };


    return (
        <>
            {showErrorSummary === true && (
                <ErrorSummary
                    show={showErrorSummary}
                    form="slideLayouts"
                    errorJson={pageErrorsJson}
                    errorMessage={pageErrorMessage}
                />
            )}

            {mandateGroupLimitExceed.size > 0 &&
                getXorList(mandateGroupLimitExceed, "Enter only one descriptor from each group")}

            {mandateGroupLimitNotMet.size > 0 &&
                getXorList(mandateGroupLimitNotMet, "Enter at least one descriptor from below group")}

            {enablePrompt && (
                <Prompt
                    message={(location, action) => {
                        if (location.pathname.includes("cog")) {
                            return false;
                        } else {
                            return "If you leave you will lose this data!";
                        }
                    }}
                />
            )}

            <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
                {!loadDescriptors && !props.importedInAPage && (
                    <>
                        {getStartMetadataPage()}
                        <div className="text-center mb-2">
                            <Link to={"/" + props.redirectTo}>
                                <Button className="gg-btn-outline mt-2 gg-mr-20">Back to {`${props.metadataType}`}</Button>
                            </Link>
                            <Button
                                disabled={
                                    (metadataModel.name === "" && metadataModel.template === "" && !isUpdate) || errorName
                                }
                                onClick={handleNext}
                                className="gg-btn-blue mt-2 gg-ml-20"
                            >
                                Next
                            </Button>
                        </div>
                    </>
                )}

                {loadDescriptors && !props.importedInAPage && (
                    <>
                        <Row>
                            <Col>
                                <div>
                                    {getMetaData()}
                                    <div className="text-center mb-3">
                                        <Button onClick={() => props.metadataType === "Assay" && assayCurrentStep === 2 ? setAssayCurrentStep(1) : setLoadDescriptors(false)} className="gg-btn-outline mt-2 gg-mr-20">
                                            Back
                                        </Button>
                                        <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
                                            {props.metadataType === "Assay" && assayCurrentStep === 1 ? "Next" : "Submit"}
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </>
                )}

                {props.importedInAPage ? <>{getPageLoaded()}</> : ""}
                {showLoading && <Loading show={showLoading} />}
            </Form>
        </>
    );
};

MetaData.propTypes = {
    metaID: PropTypes.string,
    isCopy: PropTypes.bool,
    type: PropTypes.string,
    getMetaData: PropTypes.string,
    addMeta: PropTypes.string,
    updateMeta: PropTypes.string,
    redirectTo: PropTypes.string,
    metadataType: PropTypes.string,
    importedInAPage: PropTypes.bool,
    setMetadataforImportedPage: PropTypes.func,
    importedPageData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    setImportedPageDataToSubmit: PropTypes.func,
    handleBack: PropTypes.func,
    handleNext: PropTypes.func,
    setFeatureAddState: PropTypes.func,
};

export { MetaData };