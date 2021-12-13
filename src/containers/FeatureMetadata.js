import "../containers/MetaData.css";

function getMetadataSubmitData(template) {
  var selectedItemByType;

  selectedItemByType = template[0];

  var dArray = [];
  var dgArray = [];
  var sgdArray = [];

  selectedItemByType.descriptors.forEach(d => {
    var dgDescriptors;
    if (d.descriptors) {
      dgDescriptors = d.descriptors;
    }

    dgArray = [];
    dgDescriptors &&
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

export { getMetadataSubmitData };
