import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useInterview } from "../hooks/useInterview.js"
import "../style/home.scss"


const DocumentIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3.75h8.25L18 7.5v12.75H6V3.75Z" />
        <path d="M14 3.75V8h4M9 12h6M9 15.5h6" />
    </svg>
)

const FolderIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.75 6.75h6l1.5 1.75h9v9.75a1.5 1.5 0 0 1-1.5 1.5h-15a1.5 1.5 0 0 1-1.5-1.5v-10a1.5 1.5 0 0 1 1.5-1.5Z" />
        <path d="M2.75 8.5h17.5" />
    </svg>
)

const UserIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="7.25" r="3.25" />
        <path d="M4.75 19.25a7.25 7.25 0 0 1 14.5 0" />
    </svg>
)

const UploadIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.5 18.75h9.25a4.25 4.25 0 0 0 .55-8.46A5.75 5.75 0 0 0 6.2 8.85 4.25 4.25 0 0 0 7.5 18.75Z" />
        <path d="M12 15.25V8.75M9.5 11.25 12 8.75l2.5 2.5" />
    </svg>
)

const ShieldIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.75 18.25 6v4.85c0 4.05-2.6 7.25-6.25 9.4-3.65-2.15-6.25-5.35-6.25-9.4V6L12 3.75Z" />
        <path d="m9.5 12 1.65 1.65 3.45-3.45" />
    </svg>
)

const SparkleIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 1.35 5.65L19 10l-5.65 1.35L12 17l-1.35-5.65L5 10l5.65-1.35L12 3ZM18.25 15.5l.55 2.2 2.2.55-2.2.55-.55 2.2-.55-2.2-2.2-.55 2.2-.55.55-2.2Z" />
    </svg>
)

const loadingMessages = [
    "Reading your resume...",
    "Analyzing your profile...",
    "Generating personalized interview questions...",
    "Building your preparation roadmap...",
    "Almost done..."
]

const formatReportDate = (createdAt) => {
    if (!createdAt) {
        return "Generated date unavailable"
    }

    const date = new Date(createdAt)

    if (Number.isNaN(date.getTime())) {
        return "Generated date unavailable"
    }

    return `Generated on ${date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    })}`
}

const getReportScore = (report) => (
    report.matchingScore ?? report.matchScore
)

const Home = () => {
    const navigate = useNavigate()
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
    const {
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
    } = useInterview()

    const sortedReports = [...reports].sort((firstReport, secondReport) => {
        const firstTime = Date.parse(firstReport.createdAt || "")
        const secondTime = Date.parse(secondReport.createdAt || "")

        if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) {
            return 0
        }

        return secondTime - firstTime
    })

    useEffect(() => {
        if (!loading) {
            return undefined
        }

        const statusTimer = window.setInterval(() => {
            setLoadingMessageIndex((currentIndex) =>
                (currentIndex + 1) % loadingMessages.length
            )
        }, 2200)

        return () => window.clearInterval(statusTimer)
    }, [loading])

    const handleGenerateReport = async () => {
        setLoadingMessageIndex(0)
        const response = await submitInterviewReport()
        const reportId = response?.data?._id || response?.data?.id || response?._id

        if (reportId) {
            await fetchReports()
            navigate(`/interview/${reportId}`)
        }
    }

    const scrollToGenerator = () => {
        document.getElementById("report-generator")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }

    return (
        <main className='home'>
            <div className="home-orbit home-orbit-left" aria-hidden="true" />
            <div className="home-orbit home-orbit-right" aria-hidden="true" />

            <div className="home-content">
                <header className="home-header">
                    <span className="header-sparkle"><SparkleIcon /></span>
                    <h1>Prepare <strong>Smarter</strong>, Interview <strong>Better</strong></h1>
                    <p>Provide the job details and your information below to generate a personalized interview report.</p>
                </header>

                <div className="interview-input-group" id="report-generator">
                    <section className="input-card job-card">
                        <div className="card-heading">
                            <span className="heading-icon"><DocumentIcon /></span>
                            <label htmlFor="jobDescription">Job Description</label>
                            <span className="heading-note">Paste the job description here</span>
                        </div>
                        <textarea
                            name="jobDescription"
                            id="jobDescription"
                            placeholder="Enter job description here..."
                            maxLength="5000"
                            value={jobDescription}
                            onChange={(event) => setJobDescription(event.target.value)}
                        />
                        <span className="character-count">{jobDescription.length}/5000</span>
                    </section>

                    <div className="right">
                        <section className="input-card resume-card">
                            <div className="card-heading">
                                <span className="heading-icon"><FolderIcon /></span>
                                <h2>Resume</h2>
                                <span className="heading-note">Use Resume and self description<br />together for best results</span>
                            </div>
                            <label className="file-label" htmlFor="resume">
                                <UploadIcon />
                                <span>Upload Resume</span>
                            </label>
                            <input hidden type="file" name="resume" id="resume" accept=".pdf" onChange={handleResumeChange} />
                            <span className="file-note">{resume?.name || "PDF files only (.pdf)"}</span>
                        </section>

                        <section className="input-card self-card">
                            <div className="card-heading">
                                <span className="heading-icon"><UserIcon /></span>
                                <label htmlFor="selfDescription">Self Description</label>
                            </div>
                            <textarea
                                name="selfDescription"
                                id="selfDescription"
                                placeholder="Describe yourself in a few sentences..."
                                maxLength="1000"
                                value={selfDescription}
                                onChange={(event) => setSelfDescription(event.target.value)}
                            />
                            <span className="character-count">{selfDescription.length}/1000</span>
                            <button
                                type="button"
                                className="generate-btn"
                                onClick={handleGenerateReport}
                                disabled={loading}
                            >
                                <span className={loading ? "loading-sparkle" : "button-sparkle"}>
                                    <SparkleIcon />
                                </span>
                                <span>{loading ? "Generating Your Interview Report..." : "Generate Interview Report"}</span>
                                <span className="button-arrow" aria-hidden="true">&#8594;</span>
                            </button>
                            {loading && (
                                <div className="generation-status" role="status" aria-live="polite">
                                    <div className="status-line">
                                        <span className="status-pulse" aria-hidden="true" />
                                        <span>{loadingMessages[loadingMessageIndex]}</span>
                                    </div>
                                    <div className="progress-track" aria-hidden="true">
                                        <span className="progress-bar" />
                                    </div>
                                    <p>Please wait - this may take a few moments.</p>
                                </div>
                            )}
                            {error && <p role="alert">{error}</p>}
                        </section>
                    </div>
                </div>

                <section className="plans-section" aria-labelledby="plans-heading">
                    <div className="plans-heading">
                        <div>
                            <p className="section-kicker">YOUR PREPARATION SPACE</p>
                            <h2 id="plans-heading">My Recent Interview Plans</h2>
                        </div>
                        <span className="plans-count">
                            {reportsLoading ? "..." : sortedReports.length}
                        </span>
                    </div>

                    {reportsLoading && (
                        <div className="plans-grid" aria-label="Loading interview plans">
                            {[1, 2, 3].map((item) => (
                                <div className="plan-skeleton" key={item} aria-hidden="true">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            ))}
                        </div>
                    )}

                    {!reportsLoading && reportsError && (
                        <div className="plans-message plans-error" role="alert">
                            <p>{reportsError}</p>
                            <button type="button" onClick={fetchReports}>Try again</button>
                        </div>
                    )}

                    {!reportsLoading && !reportsError && sortedReports.length === 0 && (
                        <div className="plans-message plans-empty">
                            <span className="plans-empty-icon" aria-hidden="true"><SparkleIcon /></span>
                            <h3>No interview plans yet</h3>
                            <p>Generate your first personalized interview strategy to get started.</p>
                            <button type="button" onClick={scrollToGenerator}>Create an interview plan</button>
                        </div>
                    )}

                    {!reportsLoading && !reportsError && sortedReports.length > 0 && (
                        <div className="plans-grid">
                            {sortedReports.map((report) => {
                                const reportId = report._id || report.id
                                const score = getReportScore(report)

                                return (
                                    <button
                                        className="plan-card"
                                        key={reportId}
                                        type="button"
                                        onClick={() => navigate(`/interview/${reportId}`)}
                                    >
                                        <span className="plan-card-topline">
                                            <span className="plan-card-icon"><DocumentIcon /></span>
                                            <span className="plan-card-label">INTERVIEW PLAN</span>
                                            <span className="plan-card-arrow" aria-hidden="true">&#8594;</span>
                                        </span>
                                        <span className="plan-card-title">{report.title || "Interview plan"}</span>
                                        <span className="plan-card-date">{formatReportDate(report.createdAt)}</span>
                                        <span className="plan-card-footer">
                                            <span>{score == null ? "Match score unavailable" : `Match Score: ${score}%`}</span>
                                            <span>View Report</span>
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </section>

                <footer className="privacy-note">
                    <ShieldIcon />
                    <span>Your data is secure and only used to generate your interview report.</span>
                </footer>
            </div>
        </main>
    )
}

export default Home