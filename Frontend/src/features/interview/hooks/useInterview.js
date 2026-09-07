import { useEffect, useState } from "react";
import {
    generateInterviewReport,
    getAllInterviewReports,
} from "../services/interview.api.js";

export function useInterview() {
    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(true);
    const [reportsError, setReportsError] = useState("");

    const fetchReports = async () => {
        setReportsLoading(true);
        setReportsError("");

        try {
            const response = await getAllInterviewReports();
            const fetchedReports = Array.isArray(response?.data)
                ? response.data
                : [];

            setReports(fetchedReports);
        } catch (requestError) {
            setReportsError(
                requestError.response?.data?.message ||
                "Unable to load your interview plans."
            );
        } finally {
            setReportsLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        getAllInterviewReports()
            .then((response) => {
                if (!isMounted) {
                    return;
                }

                const fetchedReports = Array.isArray(response?.data)
                    ? response.data
                    : [];

                setReports(fetchedReports);
            })
            .catch((requestError) => {
                if (isMounted) {
                    setReportsError(
                        requestError.response?.data?.message ||
                        "Unable to load your interview plans."
                    );
                }
            })
            .finally(() => {
                if (isMounted) {
                    setReportsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleResumeChange = (event) => {
        setResume(event.target.files?.[0] || null);
        setError("");
    };

    const submitInterviewReport = async () => {
        if (!resume || !jobDescription.trim() || !selfDescription.trim()) {
            setError("Please provide a job description, self description, and resume.");
            return null;
        }

        setLoading(true);
        setError("");

        try {
            return await generateInterviewReport({
                resume,
                selfDescription,
                jobDescription,
            });
        } catch (requestError) {
            const message = requestError.response?.data?.message;
            setError(message || "Unable to generate the interview report. Please try again.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        jobDescription,
        setJobDescription,
        selfDescription,
        setSelfDescription,
        resume,
        handleResumeChange,
        loading,
        error,
        submitInterviewReport,
        reports,
        reportsLoading,
        reportsError,
        fetchReports,
    };
}
