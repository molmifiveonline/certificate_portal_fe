import React, { useState } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import Meta from "../../components/common/Meta";
import { toast } from "sonner";
import nominatorService from "../../services/nominatorService";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import NominatorForm from "./NominatorForm";

const CreateNominator = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await nominatorService.createNominator(data);
      toast.success("Nominator created successfully!");
      navigate("/nominators");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to create nominator."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full pb-20">
      <Meta title="Create Nominator" description="Create New Nominator" />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <PageHeader
          title="Create New Nominator"
          subtitle="Fill in the details to add a new nominator"
          icon={Users}
          compact={true}
          backTo="/nominators"
        />
        <div className="mt-6">
          <NominatorForm
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => navigate("/nominators")}
            submitLabel="Create Nominator"
          />
        </div>
      </div>
    </div>
  );
};

export default CreateNominator;
