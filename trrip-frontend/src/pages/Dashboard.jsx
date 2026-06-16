import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getItineraries, deleteItinerary } from "../services/api";
import toast from "react-hot-toast";
import { Plane, MapPin, Calendar, Trash2, Plus, AlertCircle, Loader } from "lucide-react";

const StatusBadge = ({ status }) => {
  const styles = {
    completed: "bg-emerald-500/10 text-emerald-400",
    generating: "bg-amber-500/10 text-amber-400",
    failed: "bg-coral-500/10 text-coral-400",
  };
  const labels = { completed: "Ready", generating: "Generating", failed: "Failed" };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default function Dashboard() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getItineraries();
      setItineraries(res.data.data);
    } catch (err) {
      toast.error("Couldn't load your trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this trip? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await deleteItinerary(id);
      setItineraries((prev) => prev.filter((it) => it._id !== id));
      toast.success("Trip deleted");
    } catch {
      toast.error("Couldn't delete trip");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-midnight-950">
        <Loader className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-midnight-950 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-white font-semibold">Your trips</h1>
            <p className="text-white/50 text-sm mt-1">
              {itineraries.length === 0
                ? "No trips yet"
                : itineraries.length === 1 ? "1 itinerary" : `${itineraries.length} itineraries`}
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-midnight-950 font-semibold px-5 py-2.5 rounded-full text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> New trip
          </Link>
        </div>

        {itineraries.length === 0 ? (
          <div className="bg-midnight-900 border border-white/10 rounded-3xl p-10 sm:p-16 text-center">
            <div className="w-14 h-14 bg-midnight-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plane className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-white font-medium text-lg mb-2">No trips planned yet</h3>
            <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">
              Upload your first booking, a flight ticket, hotel confirmation, anything, and we'll build the itinerary for you.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-midnight-950 font-semibold px-5 py-2.5 rounded-full text-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Upload a document
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {itineraries.map((it, idx) => (
              <Link
                key={it._id}
                to={it.status === "completed" ? `/itinerary/${it._id}` : "#"}
                onClick={(e) => it.status !== "completed" && e.preventDefault()}
                className={`group bg-midnight-900 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 transition-all animate-fade-up ${
                  it.status === "completed" ? "hover:border-amber-500/40 hover:-translate-y-0.5 cursor-pointer" : "opacity-70 cursor-default"
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-midnight-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={it.status} />
                    <button
                      onClick={(e) => handleDelete(it._id, e)}
                      disabled={deletingId === it._id}
                      aria-label="Delete trip"
                      className="p-1.5 rounded-lg text-white/30 hover:text-coral-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-white font-medium leading-snug line-clamp-2">
                    {it.status === "failed" ? "Couldn't generate this trip" : it.title}
                  </h3>
                  {it.destination && (
                    <p className="text-white/40 text-sm mt-1">{it.destination}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-white/30 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(it.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {it.days?.length > 0 && <span>· {it.days.length} days</span>}
                </div>

                {it.status === "failed" && (
                  <div className="flex items-center gap-1.5 text-coral-400 text-xs bg-coral-500/10 rounded-lg px-2.5 py-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Try uploading a clearer document
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}