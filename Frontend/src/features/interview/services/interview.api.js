import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

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
        "/interview/",
        formData
    );

    return response.data;
}

export async function getInterviewReport(interviewId) {
    const response = await api.get(
        `/interview/report/${interviewId}`
    );

    return response.data;
}

export async function getAllInterviewReports() {
    const response = await api.get(
        "/interview/"
    );

    return response.data;
}

export async function downloadGeneratedResume(interviewReportId) {
    return api.post(
        `/interview/resume/pdf/${interviewReportId}`,
        null,
        { responseType: "blob" }
    );
}