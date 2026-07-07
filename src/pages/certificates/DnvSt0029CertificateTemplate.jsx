import React from "react";
import CourseCertificateTemplateBase from "./CourseCertificateTemplateBase";

const DnvSt0029CertificateTemplate = (props) => {
  const { certificate } = props;

  return (
    <CourseCertificateTemplateBase
      {...props}
      showStampLogo={certificate.show_logo === 1}
      stampLogoSrc="/images/DNV-ST0029.png"
    />
  );
};

export default DnvSt0029CertificateTemplate;
