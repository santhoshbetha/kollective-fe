// src/features/events/utils/eventExport.js
import { api } from "../../../api/client";

export const downloadEventIcs = async (id) => {
  try {
    const response = await api.get(`/api/v1/kollective/events/${id}/ics`);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `event-${id}.ics`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("ICS Download failed", error);
  }
};

