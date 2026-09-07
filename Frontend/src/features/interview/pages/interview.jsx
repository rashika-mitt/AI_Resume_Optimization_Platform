import { useEffect, useState } from "react"
import { useParams } from "react-router"
import {
    downloadGeneratedResume,
    getInterviewReport,
} from "../services/interview.api.js"
import "../style/interview.scss"

const defaultReport = {
    matchingScore: null,
    technicalQuestions: [],
    behavioralQuestions: [],
    skillGaps: [],
    preparationPlan: []
}

const sections = [
    { key: "technicalQuestions", label: "Technical questions" },
    { key: "behavioralQuestions", label: "Behavioral questions" },
    { key: "preparationPlan", label: "Road Map" }
]

const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.75v11.5M7.75 11.5 12 15.75l4.25-4.25M5 19.25h14" />
    </svg>
)

const Interview = () => {
    const { interviewId } = useParams()

    const [data, setData] = useState(defaultReport)
    const [activeSection, setActiveSection] = useState("technicalQuestions")
    const [expandedQuestion, setExpandedQuestion] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [resumeLoading, setResumeLoading] = useState(false)
    const [resumeError, setResumeError] = useState("")

    const handleDownloadResume = async () => {
        if (!interviewId || resumeLoading) {
            return
        }

        setResumeLoading(true)
        setResumeError("")

        try {
            const response = await downloadGeneratedResume(interviewId)
            const downloadUrl = window.URL.createObjectURL(response.data)
            const downloadLink = document.createElement("a")

            downloadLink.href = downloadUrl
            downloadLink.download = "AI-Generated-Resume.pdf"
            document.body.appendChild(downloadLink)
            downloadLink.click()
            downloadLink.remove()
            window.URL.revokeObjectURL(downloadUrl)
        } catch (requestError) {
            let message = "Unable to generate your resume. Please try again."

            if (requestError.response?.data instanceof Blob) {
                try {
                    const errorData = JSON.parse(await requestError.response.data.text())
                    message = errorData.message || message
                } catch {
                    // Keep the default message when the error response is not JSON.
                }
            } else {
                message = requestError.response?.data?.message || message
            }

            setResumeError(message)
        } finally {
            setResumeLoading(false)
        }
    }

    useEffect(() => {
        const fetchInterviewReport = async () => {
            try {
                const response = await getInterviewReport(interviewId)

                console.log("INTERVIEW REPORT:", response)

                setData(response.data)
            } catch (error) {
                console.error("Failed to fetch interview report:", error)

                setError(
                    error.response?.data?.message ||
                    "Failed to load interview report."
                )
            } finally {
                setLoading(false)
            }
        }

        if (interviewId) {
            fetchInterviewReport()
        }
    }, [interviewId])

    const report = { ...defaultReport, ...data }

    if (loading) {
        return (
            <main className="interview-page">
                <div className="empty-report">
                    <h2>Loading interview report...</h2>
                    <p>Please wait while your report is being loaded.</p>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="interview-page">
                <div className="empty-report">
                    <h2>Failed to load report</h2>
                    <p>{error}</p>
                </div>
            </main>
        )
    }

    const activeItems = report[activeSection] || []

    return (
        <main className="interview-page">
            <div className="interview-layout">

                <aside
                    className="interview-sidebar"
                    aria-label="Report sections"
                >
                    <div className="report-brand">
                        <span className="brand-mark" aria-hidden="true">✦</span>
                        <span>Interview report</span>
                    </div>
                    <p className="sidebar-label">SECTIONS</p>

                    <nav className="report-nav">
                        {sections.map((section) => (
                            <button
                                className={
                                    activeSection === section.key
                                        ? "is-active"
                                        : ""
                                }
                                key={section.key}
                                type="button"
                                onClick={() => {
                                    setActiveSection(section.key)
                                    setExpandedQuestion(0)
                                }}
                            >
                                <span className="nav-indicator" aria-hidden="true" />
                                <span>{section.label}</span>
                                <span className="nav-arrow" aria-hidden="true">›</span>
                            </button>
                        ))}
                    </nav>

                    <button
                        className="download-resume-button"
                        type="button"
                        onClick={handleDownloadResume}
                        disabled={resumeLoading}
                    >
                        <span className={resumeLoading ? "download-spinner" : "download-icon"}>
                            <DownloadIcon />
                        </span>
                        <span>{resumeLoading ? "Generating Resume..." : "Download AI Generated Resume"}</span>
                    </button>
                    {resumeError && <p className="download-resume-error" role="alert">{resumeError}</p>}
                </aside>

                <section className="interview-main">

                    <header className="report-header">
                        <div>
                            <p className="eyebrow">PERSONALIZED PREPARATION</p>
                            <h1>{sections.find((section) => section.key === activeSection)?.label}</h1>
                            <p className="header-copy">Review your personalized interview preparation plan.</p>
                        </div>
                        <div className="mobile-score">
                            <span>MATCH</span>
                            <strong>{report.matchingScore == null ? "--" : `${report.matchingScore}%`}</strong>
                        </div>
                    </header>

                    <div className="content-heading">
                        <div>
                            <p className="content-kicker">YOUR PREP KIT</p>
                            <h2>{activeSection === "preparationPlan" ? "Your preparation roadmap" : "Practice questions"}</h2>
                        </div>
                        <span className="count-badge">{activeItems.length} {activeSection === "preparationPlan" ? "days" : "questions"}</span>
                    </div>

                    <div className="report-content">

                        {activeItems.length === 0 ? (
                            <div className="empty-report">

                                <span
                                    className="empty-icon"
                                    aria-hidden="true"
                                >
                                    ✦
                                </span>

                                <h2>
                                    Your report is taking shape
                                </h2>

                                <p>
                                    Generated questions and preparation
                                    guidance will appear here.
                                </p>

                            </div>

                        ) : activeSection === "preparationPlan" ? (

                            <div className="roadmap-list">

                                {activeItems.map((item) => (
                                    <article
                                        className="roadmap-item"
                                        key={`${item.day}-${item.focus}`}
                                    >
                                        <span className="day-number">
                                            {item.day}
                                        </span>

                                        <div>
                                            <p className="item-label">
                                                Day {item.day}
                                            </p>

                                            <h2>
                                                {item.focus}
                                            </h2>

                                            <p>
                                                {item.task}
                                            </p>
                                        </div>
                                    </article>
                                ))}

                            </div>

                        ) : (

                            <div className="question-list">

                                {activeItems.map((item, index) => {
                                    const isExpanded = expandedQuestion === index

                                    return (
                                        <article className={`question-item ${isExpanded ? "is-expanded" : ""}`} key={`${item.question}-${index}`}>
                                            <button
                                                className="question-toggle"
                                                type="button"
                                                aria-expanded={isExpanded}
                                                onClick={() => setExpandedQuestion(isExpanded ? -1 : index)}
                                            >
                                                <span className="question-number">Q{index + 1}</span>
                                                <span className="question-title">{item.question}</span>
                                                <span className="question-chevron" aria-hidden="true">⌄</span>
                                            </button>

                                            {isExpanded && (
                                                <div className="question-details">
                                                    <div>
                                                        <p className="detail-label">INTENTION</p>
                                                        <p>{item.intention}</p>
                                                    </div>
                                                    <div>
                                                        <p className="detail-label">MODEL ANSWER</p>
                                                        <p>{item.answer}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </article>
                                    )
                                })}

                            </div>
                        )}

                    </div>
                </section>

                <aside className="skills-panel">

                    <section className="score-panel">
                        <p className="panel-label">MATCH SCORE</p>
                        <div className="score-ring" style={{ "--score": `${report.matchingScore || 0}%` }}>
                            <div>
                                <strong>{report.matchingScore == null ? "--" : report.matchingScore}</strong>
                                <span>/ 100</span>
                            </div>
                        </div>
                        <h2>Personalized for your next opportunity.</h2>
                        <p className="score-description">Based on your resume compared with the job description.</p>
                    </section>

                    <section className="gaps-panel">
                        <div className="panel-title">
                            <p className="panel-label">SKILL GAPS</p>
                            <span>{report.skillGaps.length}</span>
                        </div>

                        <div className="skill-list">

                        {report.skillGaps.length === 0 ? (
                            <p className="panel-empty">
                                No skill gaps identified yet.
                            </p>
                        ) : (
                            report.skillGaps.map((gap) => (
                                <div className={`skill-chip severity-${gap.severity || "medium"}`} key={gap.skill}>
                                    <span>{gap.skill}</span>
                                    <small>{gap.severity || "medium"}</small>
                                </div>
                            ))
                        )}

                        </div>
                    </section>

                </aside>

            </div>
        </main>
    )
}

export default Interview