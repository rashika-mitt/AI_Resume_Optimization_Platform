import axios from "axios";

const api = axios.create({
    baseURL: "https://ai-resume-optimization-platform.onrender.com",
    withCredentials: true,
});

/**
 * Generate interview report
 */
export async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    const formData = new FormData();

    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resume);

    const response = await api.post(
        "/api/interview/",
        formData
    );

    return response.data;
}


/**
 * Get interview report by interviewId
 */
export async function getInterviewReport(interviewId) {
    const response = await api.get(
        `/api/interview/report/${interviewId}`
    );

    return response.data;
}


/**
 * Get all interview reports of logged-in user
 */
export async function getAllInterviewReports() {
    const response = await api.get(
        "/api/interview/"
    );

    return response.data;
}

/**
 * Generate and download an AI resume for an interview report.
 */
export async function downloadGeneratedResume(interviewReportId) {
    return api.post(
        `/api/interview/resume/pdf/${interviewReportId}`,
        null,
        { responseType: "blob" }
    );
}
