import "../containers/MetaData.css";

const updateMetadataTemplate = (template, featureMetadata, setMetadataTemplate) => {
  template[0].descriptors.forEach(mainDesc => {
    mainDesc.descriptors &&
      mainDesc.descriptors.forEach(desc => {
        if (mainDesc.name === "Purity") {
          if (desc.group) {
          } else {
            if (desc.name === "Value") {
              if (featureMetadata.purity.valueNotRecorded) {
                desc.notRecorded = featureMetadata.purity.valueNotRecorded;
              } else {
                desc.value = featureMetadata.purity.value;
              }
            } else if (desc.name === "Method") {
              if (featureMetadata.purity.methodNotRecorded) {
                desc.notRecorded = featureMetadata.purity.methodNotRecorded;
              } else {
                desc.value = featureMetadata.purity.method;
              }
            } else if (desc.name === "Reference") {
              if (featureMetadata.purity.comment !== "") {
                desc.value = featureMetadata.purity.comment;
              }
            }
          }
        } else if (mainDesc.name === "Commercial source") {
          if (desc.name === "Vendor") {
            if (featureMetadata.commercial.vendorNotRecorded) {
              desc.notRecorded = featureMetadata.commercial.vendorNotRecorded;
            } else {
              desc.value = featureMetadata.commercial.vendor;
            }
          } else if (desc.name === "Catalogue number") {
            if (featureMetadata.commercial.catalogueNumber !== "") {
              desc.value = featureMetadata.commercial.catalogueNumber;
            }
          } else if (desc.name === "Batch ID") {
            if (featureMetadata.commercial.batchId !== "") {
              desc.value = featureMetadata.commercial.batchId;
            }
          }
        } else if (mainDesc.name === "Non-commercial") {
          if (desc.name === "Provider lab") {
            if (featureMetadata.nonCommercial.providerLabNotRecorded) {
              desc.notRecorded = featureMetadata.nonCommercial.providerLabNotRecorded;
            } else {
              desc.value = featureMetadata.nonCommercial.providerLab;
            }
          } else if (desc.name === "Method") {
            if (featureMetadata.nonCommercial.method !== "") {
              desc.value = featureMetadata.nonCommercial.method;
            }
          } else if (desc.name === "Batch ID") {
            if (featureMetadata.nonCommercial.batchId !== "") {
              desc.value = featureMetadata.nonCommercial.batchId;
            }
          } else if (desc.name === "Comment") {
            if (featureMetadata.nonCommercial.sourceComment !== "") {
              desc.value = featureMetadata.nonCommercial.sourceComment;
            }
          }
        }
      });
  });

  setMetadataTemplate(template);
};

function getMetadataSubmitData(template) {
  var selectedItemByType;

  selectedItemByType = template[0];

  var dArray = [];
  var dgArray = [];
  var sgdArray = [];

  selectedItemByType.descriptors.forEach(d => {
    var dgDescriptors = d.descriptors;
    dgArray = [];
    d.descriptors &&
      dgDescriptors.forEach(dg => {
        //   var dDescriptors = dg.descriptors;
        sgdArray = [];
        if (dg.group) {
          dg.descriptors.forEach(sgd => {
            if (sgd.value || sgd.notRecorded) {
              sgdArray.push({
                name: sgd.name,
                ...getNotRecordedOrValue(sgd),
                //   value: sgd.value,
                unit: sgd.unit ? dg.unit : "",
                key: {
                  "@type": "descriptortemplate",
                  ...getkey(sgd)
                },
                "@type": "descriptor"
              });
            }
          });
        } else if (dg.value || dg.notRecorded) {
          dgArray.push({
            name: dg.name,
            ...getNotRecordedOrValue(dg),
            //   value: dg.value,
            unit: dg.unit ? dg.unit : "",
            key: {
              "@type": "descriptortemplate",
              ...getkey(dg)
            },
            "@type": "descriptor"
          });
        }

        if (sgdArray.length !== 0) {
          dgArray.push({
            descriptors: sgdArray,
            key: {
              "@type": "descriptortemplate",
              ...getkey(dg)
            },
            "@type": "descriptorgroup"
          });
        }
      });

    if (dgArray.length > 0) {
      dArray.push({
        descriptors: dgArray,
        key: {
          "@type": "descriptortemplate",
          ...getkey(d)
        },
        "@type": "descriptorgroup"
      });
    }
  });

  return dArray;

  function getkey(descriptorGroup) {
    return descriptorGroup.id.startsWith("newly") ? { uri: descriptorGroup.uri } : { id: descriptorGroup.id };
  }

  function getNotRecordedOrValue(desc) {
    return desc.value ? { value: desc.value } : { notRecorded: desc.notRecorded };
  }
}

export { getMetadataSubmitData, updateMetadataTemplate };
