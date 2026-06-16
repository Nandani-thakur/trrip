import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { uploadDocument } from "../services/api";
import toast from "react-hot-toast";
import { UploadCloud, FileText, Image as ImageIcon, X, Sparkles, Loader } from "lucide-react";

const STAGES = [
  "Reading your document",
  "Pulling out the booking details",
  "Asking the AI to plan your days",
  "Saving your itinerary",
];

export default function Upload() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length) {
      toast.error("Only PDF, JPG, PNG or WEBP files up to 10MB");
      return;
    }
    if (accepted.length) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStage(0);

    const stageTimer = setInterval(() => {
      setStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, 2200);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await uploadDocument(formData, setProgress);
      clearInterval(stageTimer);
      toast.success("Itinerary ready");
      navigate(`/itinerary/${res.data.data.itinerary._id}`);
    } catch (err) {
      clearInterval(stageTimer);
      toast.error(err.response?.data?.message || "Couldn't process that document");
      setLoading(false);
      setProgress(0);
    }
  };

  const isPDF = file?.type === "application/pdf";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-midnight-950 px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-powered
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white font-semibold">
            Turn a booking into a trip
          </h1>
          <p className="text-white/50 mt-3 text-sm sm:text-base max-w-md mx-auto">
            Upload a flight ticket, hotel confirmation, or travel document — we'll build your day-by-day plan.
          </p>
        </div>

        {!loading ? (
          <>
            <div
              {...getRootProps()}
              className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-14 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-amber-500 bg-amber-500/5"
                  : "border-white/15 hover:border-white/30 bg-midnight-900"
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-midnight-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />
              </div>
              <p className="text-white font-medium text-base sm:text-lg">
                {isDragActive ? "Drop it here" : "Drag & drop your document"}
              </p>
              <p className="text-white/40 text-sm mt-1.5">or tap to browse · PDF, JPG, PNG up to 10MB</p>
            </div>

            {file && (
              <div className="mt-4 flex items-center justify-between gap-3 bg-midnight-900 border border-white/10 rounded-2xl p-4 animate-fade-up">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-midnight-800 flex items-center justify-center shrink-0">
                    {isPDF ? (
                      <FileText className="w-5 h-5 text-coral-400" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{file.name}</p>
                    <p className="text-white/40 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-2 text-white/40 hover:text-coral-400 shrink-0"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-midnight-950 font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              Generate itinerary
            </button>
          </>
        ) : (
          <div className="bg-midnight-900 border border-white/10 rounded-3xl p-8 sm:p-10 text-center animate-fade-up">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
              <Loader className="w-6 h-6 text-amber-400 absolute inset-0 m-auto opacity-0" />
            </div>
            <p className="text-white font-medium text-base sm:text-lg mb-2">{STAGES[stage]}</p>
            <p className="text-white/40 text-sm">This usually takes 20–40 seconds</p>

            {progress > 0 && progress < 100 && (
              <div className="mt-6 max-w-xs mx-auto">
                <div className="h-1.5 bg-midnight-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white/30 text-xs mt-2">{progress}% uploaded</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}