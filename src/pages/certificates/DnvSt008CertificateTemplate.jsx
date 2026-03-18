import React from "react";
import CourseCertificateTemplateBase from "./CourseCertificateTemplateBase";

const DnvSt008CertificateTemplate = (props) => {
  const { certificate } = props;

  return (
    <CourseCertificateTemplateBase
      {...props}
      showStampLogo={certificate.show_logo === 1}
      stampLogoSrc="/images/img0.jpg"
    />
  );
};

export default DnvSt008CertificateTemplate;
