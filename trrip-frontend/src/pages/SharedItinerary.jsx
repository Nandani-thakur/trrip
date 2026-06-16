import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSharedItinerary } from "../services/api";
import {
  MapPin, Loader, Plane, Hotel, Sun, Sunset, Moon, Coffee, Clock, Lock
} from "lucide-react";
import Logo from "../components/Logo";

const timeIcon = (time = "") => {
  const t = time.toLowerCase();
  if (t.includes("morning")) return Sun;
  if (t.includes("lunch") || t.includes("noon")) return Coffee;
  if (t.includes("afternoon")) return Sun;
  if (t.includes("evening") || t.includes("dinner")) return Sunset;
  if (t.includes("night")) return Moon;
  return Clock;
};

export default function SharedItinerary() {
  const { token } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSharedItinerary(token)
      .then((res) => setItinerary(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight-950">
        <Loader className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight-950 px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-midnight-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-white/30" />
          </div>
          <h1 className="text-white font-medium text-lg mb-2">This trip isn't public</h1>
          <p className="text-white/40 text-sm">The link may be wrong, or the owner has made this trip private again.</p>
          <Link to="/" className="inline-block mt-6 text-amber-400 text-sm font-medium">
            Go to Trrip
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      <header className="border-b border-white/5 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo size="small" />
          <Link
            to="/register"
            className="text-xs sm:text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            Plan your own trip →
          </Link>
        </div>
      </header>

      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <MapPin className="w-3 h-3" /> {itinerary.destination || "Shared trip"}
          </div>
          <h1 className="font-display text-2xl sm:text-4xl text-white font-semibold leading-tight">
            {itinerary.title}
          </h1>
          {itinerary.summary && (
            <p className="text-white/50 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
              {itinerary.summary}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {(itinerary.flightDetails?.airline || itinerary.hotelDetails?.name) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {itinerary.flightDetails?.airline && (
              <div className="bg-midnight-900 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wide mb-3">
                  <Plane className="w-3.5 h-3.5" /> Flight
                </div>
                <p className="text-white font-medium">{itinerary.flightDetails.airline}</p>
                {itinerary.flightDetails.flightNumber && (
                  <p className="text-white/40 text-sm font-mono mt-0.5">{itinerary.flightDetails.flightNumber}</p>
                )}
              </div>
            )}
            {itinerary.hotelDetails?.name && (
              <div className="bg-midnight-900 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wide mb-3">
                  <Hotel className="w-3.5 h-3.5" /> Stay
                </div>
                <p className="text-white font-medium">{itinerary.hotelDetails.name}</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-8 sm:space-y-10">
          {itinerary.days?.map((day, dayIdx) => (
            <div key={dayIdx} className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center text-midnight-950 font-display font-bold text-lg shrink-0">
                  {day.day}
                </div>
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wide">{day.date}</p>
                  <h3 className="text-white font-semibold text-base sm:text-lg">{day.title}</h3>
                </div>
              </div>

              <div className="ml-5 sm:ml-[1.375rem] pl-6 sm:pl-7 border-l-2 border-white/10 space-y-5">
                {day.activities?.map((activity, actIdx) => {
                  const Icon = timeIcon(activity.time);
                  return (
                    <div key={actIdx} className="relative">
                      <div className="absolute -left-[2.05rem] sm:-left-[2.4rem] top-0.5 w-3.5 h-3.5 rounded-full bg-midnight-950 border-2 border-amber-500" />
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
                        <Icon className="w-3.5 h-3.5" /> {activity.time}
                      </div>
                      <p className="text-white text-sm sm:text-[15px] leading-relaxed">{activity.activity}</p>
                      {activity.location && (
                        <p className="text-white/40 text-xs sm:text-sm mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {activity.location}
                        </p>
                      )}
                      {activity.notes && (
                        <p className="text-white/35 text-xs sm:text-sm mt-1.5 italic">{activity.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center border-t border-white/5 pt-8">
          <p className="text-white/30 text-sm mb-3">Made with Trrip</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-midnight-950 font-semibold px-5 py-2.5 rounded-full text-sm transition-all"
          >
            Plan your own trip
          </Link>
        </div>
      </div>
    </div>
  );
}