const mongoose = require("mongoose");

/**
 * - job description : string
 * - Resume text : string
 * - self description : string
 * 
 * matching score : number
 * 
 * - technical questions : [{
 *          question: "",
 *          intention: "",
 *          answer: "",
 * }]
 * - behavioral questions : [{
 *          question: "",
 *          intention: "",
 *          answer: "",
 * }]
 * - skill gaps : [{
 *         skill: "",
 *         severity: "{low, medium, high}",
 * }]
 * - preparation plan : [{
 *         day : number,
 *         focus : string,
 *         task : string
 * }]
 * 
 */

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
},{
    _id: false
});

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
},{
    _id: false
});

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "Severity is required"]
    }
});

const preparationPlanSchema = new mongoose.Schema({
    day : {
        type: Number,
        required: [true, "Day is required"]
    },
    focus : {
        type: String,
        required: [true, "Focus is required"]
    },
    task : {
        type: String,
        required: [true, "Task is required"]
    }
});

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, "Job description is required"]
    },
    resume: { 
        type: String
    },
    selfDescription: {
        type: String
    },
    matchingScore: {
        type: Number,
        min: [0, "Matching score cannot be less than 0"],
        max: [100, "Matching score cannot be greater than 100"]
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    title: {
        type: String,
        required: [true, "Title is required"]
    }
}, {
    timestamps: true
})


const InterviewReport = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = InterviewReport;

