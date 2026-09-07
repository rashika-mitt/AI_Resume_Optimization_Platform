const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const interviewRouter = express.Router();

const interviewController = require("../controllers/interview.controller");
const upload = require("../middleware/file.middleware");


/**
 * @route POST /api/interview/
 * @description Generates a new interview report based on the provided resume and job description.
 * @access Private
 */

interviewRouter.post(
    "/",
    authMiddleware,
    upload.single("resume"),
    interviewController.generateInterviewViewReportController
);


/**
 * @route GET /api/interview/report/:interviewId
 * @description Get interview report by interviewId.
 * @access Private
 */

interviewRouter.get(
    "/report/:interviewId",
    authMiddleware,
    interviewController.getInterviewReportController
);


/**
 * @route GET /api/interview/
 * @description Get all interview reports of logged-in user.
 * @access Private
 */

interviewRouter.get(
    "/",
    authMiddleware,
    interviewController.getAllInterviewReportsController
);


/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @description Generate resume pdf on the basis of resume, self description and job description.
 * @access Private
 */

console.log("authMiddleware:", typeof authMiddleware);
console.log(
    "generateResumePDFController:",
    typeof interviewController.generateResumePDFController
);

interviewRouter.post(
    "/resume/pdf/:interviewReportId",
    authMiddleware,
    interviewController.generateResumePDFController
);

module.exports = interviewRouter;