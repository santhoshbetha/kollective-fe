import { User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

/**
 * Minimized EventPreview
 * Simplified for a standalone app: no heavy Redux or custom layout components.
 */
const EventPreview = ({ status, className, hideAction }) => {
  const { event, account } = status;
  if (!event) return null;

  // Replace Redux logic with simple prop or local context check if needed
  const isOwner = false; 

  return (
    <div className={clsx('relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900', className)}>
      
      {/* Banner Image */}
      <div className="h-32 bg-gray-200 dark:bg-gray-700">
        {event.banner && (
          <img className="h-full w-full object-cover" src={event.banner.url} alt="Event" />
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-bold text-lg truncate dark:text-white">{event.name}</h3>
          
          {!hideAction && (
            <Link 
              to={`/events/${status.id}`}
              className="px-3 py-1 text-sm font-medium rounded-full bg-blue-500 text-white hover:bg-blue-600"
            >
              {isOwner ? 'Manage' : 'View'}
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          {/* Organizer */}
          <div className="flex items-center gap-1">
            <User size={14} />
            <span className="truncate">{account.display_name}</span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{event.location.name || event.location.get?.('name')}</span>
            </div>
          )}
          
          {/* Date Placeholder */}
          <div className="text-blue-500 font-medium">
            {new Date(event.start_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPreview;
