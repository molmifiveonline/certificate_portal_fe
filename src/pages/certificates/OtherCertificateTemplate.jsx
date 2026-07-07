import React from "react";
import CourseCertificateTemplateBase from "./CourseCertificateTemplateBase";

const OtherCertificateTemplate = (props) => {
  return (
    <CourseCertificateTemplateBase
      {...props}
      showStampLogo={false}
      stampLogoSrc=""
    />
  );
};

export default OtherCertificateTemplate;
