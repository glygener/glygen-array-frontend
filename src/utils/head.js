import React from "react";
import head from "../appData/head";

const getMeta = (page) => {
  if (page && page.meta) return page.meta.map((value, index) => <meta key={index} {...value} />);
  return "";
};

export { getMeta, head };

const getMetaID = (page) => {
  if (page && head[page] && head[page].meta)
    return head[page].meta.map((value, index) => <meta key={index} {...value} />);
  return "";
};

const getTitle = (page, vars) => {
  if (page && head[page] && head[page].title) {
    var title = head[page].title;
    vars &&
      Object.keys(vars).forEach((key) => {
        title = title.replace(`#${key}`, vars[key]);
      });
    return <title>{title}</title>;
  }
  return "";
};

export { getMetaID, getTitle };
