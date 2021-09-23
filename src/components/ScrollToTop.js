import React, { useEffect, useState } from "react";
// import VerticalAlignTopIcon from "@material-ui/icons/VerticalAlignTop";
import { Button } from "@material-ui/core";
// import { Button } from "react-bootstrap";
import { BiArrowToTop } from "react-icons/bi";

const ScrollToTopBtn = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scorlled upto given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className="scroll-to-top">
      {isVisible && (
        <div onClick={ScrollToTop}>
          <Button className="gg-reg-btn-outline">
            {/* <VerticalAlignTopIcon fontSize="large" /> */}
            <BiArrowToTop fontSize="40px" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Set the top cordinate to 0
// make scrolling smooth
const ScrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

export { ScrollToTopBtn, ScrollToTop };
