const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePDF } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.Model");


/**
 * @description Generates a new interview report based on the provided resume and job description.
 */
async function generateInterviewViewReportController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required"
            });
        }

        const resumeContent = await (
            new pdfParse.PDFParse(
                new Uint8Array(req.file.buffer)
            )
        ).getText();

        const { selfDescription, jobDescription } = req.body;

        if (!jobDescription || !selfDescription) {
            return res.status(400).json({
                message: "Job description and self description are required"
            });
        }

        const interviewReportByAI = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        });

        if (!interviewReportByAI) {
            return res.status(500).json({
                message: "Failed to generate interview report"
            });
        }

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,

            title: interviewReportByAI.title,

            resume: resumeContent.text,
            selfDescription,
            jobDescription,

            matchingScore: interviewReportByAI.matchscore,

            technicalQuestions:
                interviewReportByAI.technicalQuestions,

            behavioralQuestions:
                interviewReportByAI.behavioralQuestions,

            skillGaps:
                interviewReportByAI.skillGaps,

            preparationPlan:
                interviewReportByAI.preparationPlan
        });

        return res.status(201).json({
            message: "Interview report generated successfully",
            data: interviewReport
        });

    } catch (error) {
        console.error(
            "Generate interview report error:",
            error
        );

        return res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message
        });
    }
}


/**
 * @description Fetches a specific interview report by its ID.
 */
async function getInterviewReportController(req, res) {
    try {
        const { interviewId } = req.params;

        const interviewReport =
            await interviewReportModel.findOne({
                _id: interviewId,
                user: req.user.id
            });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

        return res.status(200).json({
            message: "Interview report fetched successfully",
            data: interviewReport
        });

    } catch (error) {
        console.error(
            "Failed to fetch interview report:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch interview report",
            error: error.message
        });
    }
}


/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports =
            await interviewReportModel
                .find({ user: req.user.id })
                .sort({ createdAt: -1 })
                .select(
                    "-resume -selfDescription -jobDescription -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan -__v"
                );

        return res.status(200).json({
            message: "All interview reports fetched successfully",
            data: interviewReports
        });

    } catch (error) {
        console.error(
            "Failed to fetch all interview reports:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch all interview reports",
            error: error.message
        });
    }
}


/**
 * @description Generate resume PDF based on an existing interview report.
 */
async function generateResumePDFController(req, res) {
    try {
        const { interviewReportId } = req.params;

        // Find the interview report belonging to logged-in user
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

        // Generate PDF using saved report data
        const pdfBuffer = await generateResumePDF({
            resume: interviewReport.resume,
            selfDescription: interviewReport.selfDescription,
            jobDescription: interviewReport.jobDescription
        });

        // Send PDF response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="AI-Generated-Resume.pdf"'
        );

        return res.send(pdfBuffer);

    } catch (error) {
        console.error(
            "Failed to generate resume PDF:",
            error
        );

        return res.status(500).json({
            message: "Failed to generate resume PDF",
            error: error.message
        });
    }
}

module.exports = {
    generateInterviewViewReportController,
    getInterviewReportController,
    getAllInterviewReportsController,
    generateResumePDFController
};