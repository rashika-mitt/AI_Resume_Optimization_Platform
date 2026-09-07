const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({

    title: z
        .string()
        .describe(
            "The title of the job for which the interview report is generated"
        ),

    matchscore: z
        .number()
        .min(0)
        .max(100)
        .describe(
            "The matching score between the candidate's resume and the job description"
        ),

    technicalQuestions: z.array(
        z.object({
            question: z
                .string()
                .describe("The technical interview question"),

            answer: z
                .string()
                .describe("How to answer the question"),

            intention: z
                .string()
                .describe(
                    "The intention behind the question"
                ),
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z
                .string()
                .describe("The behavioral interview question"),

            answer: z
                .string()
                .describe("How to answer the question"),

            intention: z
                .string()
                .describe(
                    "The intention behind the question"
                ),
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z
                .string()
                .describe("The missing skill"),

            severity: z
                .enum([
                    "low",
                    "medium",
                    "high"
                ])
                .describe(
                    "The severity of the skill gap"
                ),
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z
                .number()
                .describe(
                    "Day number such as 1, 2, 3, 4, 5, 6, 7"
                ),

            focus: z
                .string()
                .describe(
                    "Focus area for the day"
                ),

            task: z
                .string()
                .describe(
                    "Task to complete"
                ),
        })
    ),
});


async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {

    console.log("🔥 CURRENT AI SERVICE RUNNING");

    console.log("🔥 MODEL: gemini-3.6-flash");

    console.log(
        "🔥 SCHEMA: title + matchscore + technicalQuestions + behavioralQuestions + skillGaps + preparationPlan"
    );


    const prompt = `
Generate an interview preparation report for this candidate.

Return ONLY valid JSON.

The JSON MUST contain exactly these 6 fields:

1. title
2. matchscore
3. technicalQuestions
4. behavioralQuestions
5. skillGaps
6. preparationPlan


title MUST contain the title of the job for which the interview report is generated.

For example:
"Full Stack GenAI Developer Intern"

Do NOT return:
- candidate_name
- position
- strengths
- weaknesses
- evaluation_summary
- experience_summary
- final_recommendation
- any other fields


technicalQuestions MUST be an array of objects.

Each object MUST contain:
- question
- answer
- intention


behavioralQuestions MUST be an array of objects.

Each object MUST contain:
- question
- answer
- intention


skillGaps MUST be an array of objects.

Each object MUST contain:
- skill
- severity

severity MUST be exactly one of:
- "low"
- "medium"
- "high"


preparationPlan MUST be an array of objects.

Each object MUST contain:
- day
- focus
- task

day MUST be a NUMBER.

Use:
1 for Day 1
2 for Day 2
3 for Day 3
4 for Day 4
5 for Day 5
6 for Day 6
7 for Day 7


Generate exactly:
- 5 technical questions
- 5 behavioral questions
- 5 skill gaps
- 7 preparation-plan days


The preparation plan must cover all 7 days.

Day 1 should focus on the most important foundational skill gap.

Day 2 should focus on another important technical area.

Day 3 should focus on practical implementation.

Day 4 should focus on advanced concepts related to the target role.

Day 5 should focus on project-based practice.

Day 6 should focus on interview preparation and problem solving.

Day 7 should focus on revision, mock interview, and final preparation.


Do NOT return plain strings inside:
- technicalQuestions
- behavioralQuestions
- skillGaps
- preparationPlan


Candidate Resume:
${resume}


Self Description:
${selfDescription}


Job Description:
${jobDescription}
`;


    const maxRetries = 3;


    for (let attempt = 1; attempt <= maxRetries; attempt++) {

        try {

            console.log(
                `🤖 Gemini attempt ${attempt}/${maxRetries}`
            );


            const response = await ai.models.generateContent({

                model: "gemini-3.6-flash",

                contents: prompt,

                config: {
                    responseFormat: {
                        text: {
                            mimeType: "application/json",

                            schema: zodToJsonSchema(
                                interviewReportSchema
                            ),
                        },
                    },
                },

            });


            console.log("✅ Gemini response received");


            const rawText = response.text.trim();


            const cleanedText = rawText
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();


            const report = JSON.parse(cleanedText);


            const validatedReport =
                interviewReportSchema.parse(report);


            console.log(
                "✅ AI REPORT GENERATED SUCCESSFULLY"
            );


            console.log(
                JSON.stringify(validatedReport, null, 2)
            );


            return validatedReport;


        } catch (error) {

            console.error(
                `❌ AI REPORT GENERATION FAILED - ATTEMPT ${attempt}`
            );


            const isTemporaryError =
                error?.status === 503 ||
                error?.code === "UND_ERR_HEADERS_TIMEOUT" ||
                error?.cause?.code === "UND_ERR_HEADERS_TIMEOUT" ||
                error?.message?.includes("fetch failed");


            if (isTemporaryError) {

                console.error(
                    "⚠️ Temporary Gemini/network error."
                );


                if (attempt < maxRetries) {

                    console.log(
                        "⏳ Waiting 5 seconds before retrying..."
                    );


                    await new Promise((resolve) => {
                        setTimeout(resolve, 5000);
                    });


                    continue;
                }


                console.error(
                    "❌ Gemini request failed after 3 attempts."
                );


                return null;
            }


            if (error?.status === 429) {

                console.error(
                    "❌ Gemini API quota/rate limit exceeded."
                );

                console.error(
                    "⏳ Please wait for the quota to reset or check your Gemini API billing/quota."
                );

                return null;
            }


            if (error instanceof SyntaxError) {

                console.error(
                    "❌ Gemini returned invalid JSON."
                );

                return null;
            }


            if (error?.name === "ZodError") {

                console.error(
                    "❌ Gemini response does not match the required schema."
                );

                console.error(error);

                return null;
            }


            console.error(
                "❌ Unexpected Gemini error:"
            );

            console.error(error);

            return null;
        }
    }


    return null;
}


async function generatepdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
}



async function generateResumePDF({
    resume,
    selfDescription,
    jobDescription
}) {
    const resumePdfschema = z.object({
        html: z.string().describe(
            "The HTML content of the resume which can be converted to PDF using Puppeteer."
        ),
    });

    const prompt = `
Generate a professional resume in HTML format based on the following information.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return a JSON object with exactly one field:
"html"

The "html" field must contain complete, professional HTML for a resume.

The HTML should:
- Be well structured
- Be professional and ATS-friendly
- Use clean CSS
- Include appropriate sections based on the candidate's information
- Be suitable for A4 PDF generation

Do not include markdown.
Do not include \`\`\`html.
Do not include any other JSON fields.

the resume should be tailored to the job description and highlight relevant strengths, skills and experiences. the html content should be well formatted and ready to be converted to a PDF using Puppeteer.
the resume should not to be sound like its generated by AI. it should be human-like and professional. the resume should be concise, clear and easy to read. the resume should be ATS-friendly and optimized for applicant tracking systems.
you can higlight the content using some colors and fonts but do not use too many colors or fonts. the resume should be visually appealing and professional. the resume should be suitable for a wide range of job applications and industries. the resume should be tailored to the job description and highlight relevant strengths, skills and experiences. the resume should be concise, clear and easy to read. the resume should be ATS-friendly and optimized for applicant tracking systems.
`;

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(
                `🤖 Resume PDF Gemini attempt ${attempt}/${maxRetries}`
            );

            const response = await ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: zodToJsonSchema(resumePdfschema),
                },
            });

            console.log("✅ Resume HTML generated");

            const jsonContent = JSON.parse(response.text);

            const validatedContent =
                resumePdfschema.parse(jsonContent);

            const pdfBuffer = await generatepdfFromHtml(
                validatedContent.html
            );

            console.log("✅ Resume PDF generated successfully");

            return pdfBuffer;

        } catch (error) {
            console.error(
                `❌ RESUME PDF GENERATION FAILED - ATTEMPT ${attempt}`
            );

            console.error(error);

            const isTemporaryError =
                error?.status === 503 ||
                error?.code === 503 ||
                error?.message?.includes("503") ||
                error?.message?.includes("UNAVAILABLE") ||
                error?.message?.includes("high demand") ||
                error?.message?.includes("fetch failed");

            if (isTemporaryError && attempt < maxRetries) {
                console.log(
                    "⏳ Gemini temporarily unavailable. Retrying in 5 seconds..."
                );

                await new Promise((resolve) => {
                    setTimeout(resolve, 5000);
                });

                continue;
            }

            throw error;
        }
    }

    throw new Error("Failed to generate resume PDF");
}


module.exports = {
    generateInterviewReport,
    generateResumePDF
};