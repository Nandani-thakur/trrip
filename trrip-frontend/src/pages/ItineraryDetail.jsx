import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getItinerary, toggleShare } from "../services/api";
import toast from "react-hot-toast";
import {
  ArrowLeft, MapPin, Calendar, Share2, Check, Copy, Loader,
  Plane, Hotel, Clock, Sun, Sunset, Moon, Coffee
} from "lucide-react";

const timeIcon = (time = "") => {
  const t = time.toLowerCase();
  if (t.includes("morning")) return Sun;
  if (t.includes("lunch") || t.includes("noon")) return Coffee;
  if (t.includes("afternoon")) return Sun;
  if (t.includes("evening") || t.includes("dinner")) return Sunset;
  if (t.includes("night")) return Moon;
  return Clock;
};

export default function ItineraryDetail() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getItinerary(id)
      .then((res) => setItinerary(res.data.data))
      .catch(() => toast.error("Couldn't load this trip"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await toggleShare(id);
      setItinerary((prev) => ({ ...prev, isPublic: res.data.isPublic }));
      if (res.data.isPublic) {
        const url = `${window.location.origin}/share/${itinerary.shareToken}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied — share it with anyone");
        setTimeout(() => setCopied(false), 2500);
      } else {
        toast.success("Trip is private again");
      }
    } catch {
      toast.error("Couldn't update sharing");
    } finally {
      setSharing(false);
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/share/${itinerary.shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-midnight-950">
        <Loader className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!itinerary) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-midnight-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All trips
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <MapPin className="w-3 h-3" /> {itinerary.destination || "Your trip"}
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

            <button
              onClick={handleShare}
              disabled={sharing}
              className={`shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.98] ${
                itinerary.isPublic
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500 hover:bg-amber-400 text-midnight-950 shadow-lg shadow-amber-500/20"
              }`}
            >
              {sharing ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : itinerary.isPublic ? (
                <Check className="w-4 h-4" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              {itinerary.isPublic ? "Public · shared" : "Share trip"}
            </button>
          </div>

          {itinerary.isPublic && (
            <div className="mt-4 flex items-center gap-2 bg-midnight-900 border border-white/10 rounded-xl p-3 max-w-md animate-fade-up">
              <p className="text-white/60 text-xs sm:text-sm truncate flex-1 font-mono">
                {window.location.origin}/share/{itinerary.shareToken}
              </p>
              <button
                onClick={copyLink}
                className="shrink-0 text-amber-400 hover:text-amber-300 p-1.5"
                aria-label="Copy link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Boarding pass style booking summary */}
        {(itinerary.flightDetails?.airline || itinerary.hotelDetails?.name) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {itinerary.flightDetails?.airline && (
              <div className="bg-midnight-900 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wide mb-3">
                  <Plane className="w-3.5 h-3.5" /> Flight
                </div>
                <p className="text-white font-medium">{itinerary.flightDetails.airline}</p>
                {itinerary.flightDetails.flightNumber && (
                  <p className="text-white/40 text-sm font-mono mt-0.5">{itinerary.flightDetails.flightNumber}</p>
                )}
                {(itinerary.flightDetails.departure || itinerary.flightDetails.arrival) && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-white/60">
                    <span>{itinerary.flightDetails.departure}</span>
                    <span className="text-white/20">→</span>
                    <span>{itinerary.flightDetails.arrival}</span>
                  </div>
                )}
              </div>
            )}
            {itinerary.hotelDetails?.name && (
              <div className="bg-midnight-900 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wide mb-3">
                  <Hotel className="w-3.5 h-3.5" /> Stay
                </div>
                <p className="text-white font-medium">{itinerary.hotelDetails.name}</p>
                {itinerary.hotelDetails.address && (
                  <p className="text-white/40 text-sm mt-0.5">{itinerary.hotelDetails.address}</p>
                )}
                {(itinerary.hotelDetails.checkIn || itinerary.hotelDetails.checkOut) && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-white/60">
                    <span>{itinerary.hotelDetails.checkIn}</span>
                    <span className="text-white/20">→</span>
                    <span>{itinerary.hotelDetails.checkOut}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Day-by-day timeline */}
        <div className="space-y-8 sm:space-y-10">
          {itinerary.days?.map((day, dayIdx) => (
            <div key={day._id || dayIdx} className="relative animate-fade-up" style={{ animationDelay: `${dayIdx * 80}ms` }}>
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
                    <div key={activity._id || actIdx} className="relative">
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
      </div>
    </div>
  );
}