import React from "react";
import { Helmet } from "react-helmet-async";

const Meta = ({ title, description }) => {
    return (
        <Helmet>
            <title>{title} | Employee Management System</title>
            <meta
                name="description"
                content={description || "Employee Management System"}
            />
        </Helmet>
    );
};

export default Meta;
