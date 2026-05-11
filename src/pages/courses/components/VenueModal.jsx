import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { InputField } from "./FormHelpers";
import { toast } from "sonner";
import hotelService from "../../../services/hotelService";
import { getErrorMessage } from "../../../lib/utils/errorUtils";

const getInitialVenueDetails = (data) => ({
  venue_name: data?.venue_name || "",
  venue_address: data?.venue_address || "",
  venue_contact: data?.venue_contact || "",
  venue_email: data?.venue_email || "",
  venue_map_link: data?.venue_map_link || "",
  offline_date: data?.offline_date
    ? String(data.offline_date).slice(0, 10)
    : "",
  remarks: data?.remarks || "",
});

const VenueModal = ({ isOpen, onClose, onSubmit, data }) => {
  const [hotels, setHotels] = useState([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [venueDetails, setVenueDetails] = useState(() =>
    getInitialVenueDetails(data),
  );

  useEffect(() => {
    if (!isOpen) return;

    setSelectedHotelId("");
    setVenueDetails(getInitialVenueDetails(data));
  }, [data, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let shouldUpdate = true;

    const fetchHotels = async () => {
      setIsLoadingHotels(true);
      try {
        const response = await hotelService.getAllHotels({
          sort_by: "venue_name",
          sort_order: "asc",
        });

        if (!shouldUpdate) return;

        const hotelData = response?.data?.data;
        setHotels(Array.isArray(hotelData) ? hotelData : []);
      } catch (error) {
        if (shouldUpdate) {
          setHotels([]);
          toast.error(getErrorMessage(error, "Failed to load hotel details."));
        }
      } finally {
        if (shouldUpdate) {
          setIsLoadingHotels(false);
        }
      }
    };

    fetchHotels();

    return () => {
      shouldUpdate = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setVenueDetails((currentDetails) => ({
      ...currentDetails,
      [name]: value,
    }));
  };

  const handleHotelChange = (event) => {
    const hotelId = event.target.value;
    setSelectedHotelId(hotelId);

    if (!hotelId) return;

    const selectedHotel = hotels.find((hotel) => hotel.id === hotelId);
    if (!selectedHotel) return;

    setVenueDetails((currentDetails) => ({
      ...currentDetails,
      venue_name: selectedHotel.venue_name || "",
      venue_address: selectedHotel.venue_address || "",
      venue_contact: selectedHotel.venue_contact || "",
      venue_email: selectedHotel.email || "",
      venue_map_link: selectedHotel.venue_map_link || "",
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Edit Candidate Venue</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
              Hotel Detail
            </label>
            <select
              value={selectedHotelId}
              onChange={handleHotelChange}
              disabled={isLoadingHotels}
              className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm outline-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              <option value="">
                {isLoadingHotels ? "Loading hotels..." : "Select hotel detail"}
              </option>
              {!isLoadingHotels && hotels.length === 0 && (
                <option value="" disabled>
                  No hotels available
                </option>
              )}
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.venue_name}
                </option>
              ))}
            </select>
          </div>
          <InputField
            label="Venue Name"
            name="venue_name"
            value={venueDetails.venue_name}
            onChange={handleFieldChange}
            placeholder="e.g. Hotel ..."
          />
          <InputField
            label="Venue Address"
            name="venue_address"
            value={venueDetails.venue_address}
            onChange={handleFieldChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Contact"
              name="venue_contact"
              value={venueDetails.venue_contact}
              onChange={handleFieldChange}
            />
            <InputField
              label="Email"
              name="venue_email"
              value={venueDetails.venue_email}
              onChange={handleFieldChange}
            />
          </div>
          <InputField
            label="Map Link"
            name="venue_map_link"
            value={venueDetails.venue_map_link}
            onChange={handleFieldChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Offline Date"
              name="offline_date"
              type="date"
              value={venueDetails.offline_date}
              onChange={handleFieldChange}
            />
            <InputField
              label="Remarks"
              name="remarks"
              value={venueDetails.remarks}
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
              Attach Files
            </label>
            <input
              type="file"
              name="venue_files"
              multiple
              className="text-sm"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                for (const file of files) {
                  if (
                    file.type.startsWith("image/") &&
                    file.size > 500 * 1024
                  ) {
                    toast.error(`Image "${file.name}" exceeds 500 KB limit.`);
                    e.target.value = "";
                    break;
                  }
                }
              }}
            />
            <p className="text-xs text-slate-500">Allowed: Images, PDF, Word</p>
          </div>

          {data?.files && data.files.length > 0 && (
            <div className="mt-2 text-sm">
              <p className="font-medium">Uploaded Files:</p>
              <ul className="list-disc pl-5">
                {data.files.map((f) => (
                  <li key={f.id}>{f.file_name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Venue Details</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VenueModal;
