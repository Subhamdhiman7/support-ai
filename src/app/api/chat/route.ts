import connectDB from "@/lib/db";
import Settings from "@/model/settings.model";
// import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try{
        const {message, ownerId}=await req.json()
        if(!message || !ownerId){
            return NextResponse.json(
                {message:"message and ownerId is required"},
                {status:400}
            )
        }
        await connectDB()
        const setting=await Settings.findOne({ownerId})
        if(!setting){
            return NextResponse.json(
                {message:"ChatBot is not configured yet!"},
                {status:400}
            )
        }
        const KNOWLEDGE=`
        business name- ${setting.businessName || "not provided"}
        support email- ${setting.supportEmail || "not provided"}
        knowledge- ${setting.knowledge || "not provided"}`

//         const prompt = `
// You are a professional customer support assistant for this business.

// Use ONLY the information provided below to answer the customer's question.
// You may rephrase, summarize, or interpret the information if needed.
// Do NOT invent new policies, prices, or promises.

// If the customer greets you with messages like
// "hi", "hello", "hey", etc,
// respond politely and professionally.

// If the customer's question is completely unrelated
// to the business information,
// reply with:
// "Please contact support."

// --------------------
// BUSINESS INFORMATION
// --------------------

// ${KNOWLEDGE}

// --------------------
// CUSTOMER QUESTION
// --------------------

// ${message}

// --------------------
// ANSWER
// --------------------
// `
const prompt = `
You are an intelligent AI customer support assistant.

Your job is to professionally help customers using ONLY the business information provided below.

========================
BUSINESS INFORMATION
========================

Business Name:
${setting.businessName || "Not Provided"}

Support Email:
${setting.supportEmail || "Not Provided"}

Business Knowledge:
${setting.knowledge || "Not Provided"}

========================
========================
BEHAVIOR RULES
========================

1. Be friendly, professional, and human-like.

2. Keep replies concise and natural.
- Maximum 2-4 short lines.
- Avoid long paragraphs.
- Avoid repeating the business name unnecessarily.

3. For greetings like:
"hi", "hello", "hey"
respond briefly and politely.

Example:
"Hello 👋 How can I help you today?"

4. Answer ONLY using the business information provided.

5. If the answer is unavailable, reply:
"Please contact support at ${setting.supportEmail}"

6. For unrelated questions, reply:
"I can only assist with business-related questions."

7. Sound like a modern customer support chat assistant.

8. Do not over-explain simple answers.

9. Use clean formatting and simple language.

10. Avoid robotic or overly formal responses.
========================
CUSTOMER MESSAGE
========================

${message}

========================
RESPONSE
========================
`
//         const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY!});
//         // const res = await ai.models.generateContent({
//         //     model: "gemini-3-flash",
//         //     contents: prompt,
//         // });
//         // const response= NextResponse.json(res.text)
//         const result = await ai.models.generateContent({
//     model: "gemini-2.0-flash",
//     contents: prompt,
// })

// const text =
//     result?.candidates?.[0]?.content?.parts?.[0]?.text ||
//     "No response generated"
const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
})

const completion = await client.chat.completions.create({
    model: "openai/gpt-3.5-turbo",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
})

const text =
    completion.choices?.[0]?.message?.content ||
    "No response generated"

const response = NextResponse.json(text)
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");
        return response
    } catch(error){
        const response = NextResponse.json(
                {message: `chat error ${error}`},
                {status:500}
            )
            response.headers.set("Access-Control-Allow-Origin", "*");
            response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
            response.headers.set("Access-Control-Allow-Headers", "Content-Type");
            return response
    }
}

export const OPTIONS = async () => {
    return NextResponse.json(null, {
        status: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    })
}



// import connectDB from "@/lib/db";
// import Settings from "@/model/settings.model";
// import { GoogleGenAI } from "@google/genai";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//     try {
//         const { message, ownerId } = await req.json()

//         if (!message || !ownerId) {
//             return NextResponse.json(
//                 { reply: "message and ownerId is required" },
//                 { status: 400 }
//             )
//         }

//         await connectDB()

//         const setting = await Settings.findOne({ ownerId })

//         if (!setting) {
//             return NextResponse.json(
//                 { reply: "Chatbot is not configured yet!" },
//                 { status: 400 }
//             )
//         }

//         const KNOWLEDGE = `
// Business Name: ${setting.businessName}
// Support Email: ${setting.supportEmail}
// Knowledge: ${setting.knowledge}
// `

//         const prompt = `
// You are a professional customer support assistant.

// Use ONLY the business information below.

// BUSINESS INFO:
// ${KNOWLEDGE}

// CUSTOMER QUESTION:
// ${message}
// `

//         const ai = new GoogleGenAI({
//             apiKey: process.env.GEMINI_API_KEY!,
//         })

//         // const result = await ai.models.generateContent({
//         //     model: "gemini-1.5-flash",
//         //     contents: prompt,
//         // })

//         // const response = NextResponse.json({
//         //     reply: result.text,
//         // })
//         const result = await ai.models.generateContent({
//     model: "gemini-1.5-flash",
//     contents: prompt,
// })

// const text =
//     result?.candidates?.[0]?.content?.parts?.[0]?.text ||
//     "No response generated"

// const response = NextResponse.json(text)

//         response.headers.set("Access-Control-Allow-Origin", "*")
//         response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
//         response.headers.set("Access-Control-Allow-Headers", "Content-Type")

//         return response

//     } catch (error) {
//         // console.log(error)
//         console.error("CHAT API ERROR:", error)

//         return NextResponse.json(
//             { reply: "Something went wrong" },
//             { status: 500 }
//         )
//     }
// }

// export async function OPTIONS() {
//     return NextResponse.json(null, {
//         status: 200,
//         headers: {
//             "Access-Control-Allow-Origin": "*",
//             "Access-Control-Allow-Methods": "POST, OPTIONS",
//             "Access-Control-Allow-Headers": "Content-Type",
//         },
//     })
// }