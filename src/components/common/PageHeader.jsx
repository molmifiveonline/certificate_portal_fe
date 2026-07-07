import React from "react";
import { cn } from "../../lib/utils/utils";
import PageSubtitle from "./PageSubtitle";
import BackButton from "./BackButton";

const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  className,
  titleClassName,
  subtitleClassName,
  subtitleIcon,
  compact = false,
  backButton = null,
  backTo = null,
  backLabel = null,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8",
        compact && "mb-4",
        className,
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-4">
          {(backTo || backButton) && (
            <div className="shrink-0">
              {backTo ? <BackButton to={backTo} /> : backButton}
            </div>
          )}
          <h1
            className={cn(
              "text-3xl font-bold tracking-tight page-title flex items-center gap-3",
              titleClassName,
            )}
          >
            {Icon && (
              <div className="bg-blue-50/50 p-2.5 rounded-xl shrink-0 border border-blue-100/50">
                <Icon className="w-7 h-7 text-blue-600" />
              </div>
            )}
            {title}
          </h1>
        </div>
        {subtitle && (
          <PageSubtitle
            icon={subtitleIcon}
            className={cn(
              "ml-0",
              (backTo || backButton) && "sm:ml-[60px]",
              subtitleClassName,
            )}
          >
            {subtitle}
          </PageSubtitle>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
