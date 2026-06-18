/*
Event Cancellation Notification
*/
// AdminReportItem.js
{report.event_id && (
  <button 
    onClick={() => handleCancelEvent(report.id)}
    className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
  >
    Cancel Event & Notify Attendees
  </button>
)}