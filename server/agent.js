import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import 'dotenv/config';
import {RecursiveCharacterTextSplitter} from '@langchain/textsplitters'
import {Document} from '@langchain/core/documents'
import { OpenAIEmbeddings } from "@langchain/openai";
import {MemoryVectorStore} from 'langchain/vectorstores/memory'
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import {tool} from '@langchain/core/tools'
import {z} from 'zod'

import data from './data.js'

const video = data[0]

const docs = [new Document({
  pageContent: video.description,
  metadata:{video_id:video.video_id},

})]

//Split the cideo into chunks

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize:1000,
  chunkOverlap:200,
})

const chunks = await splitter.splitDocuments(docs)

// console.log(chunks)

//Embed chunks

//Open AI embeddings:
// const embeddings = new OpenAIEmbeddings({
//   model: 'text-embedding-3-large',

// })

//Ollam embeddings:
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text", // or "mxbai-embed-large"
  baseUrl: "http://localhost:11434", // default Ollama server
});

const vectorStore = new MemoryVectorStore(embeddings)
await vectorStore.addDocuments(chunks)

// Retrieve the most relevant chunks
const retrievedDocs = await vectorStore.similaritySearch("How to deploy a full-stack app?",5)
// console.log("retrieved docs:",retrievedDocs)

// console.log(video)
// Groq via OpenAI-compatible API
const llm = new ChatOpenAI({
  modelName: "llama3-70b-8192", // ✅ supported Groq model
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
  configuration: {
    baseURL: "https://api.groq.com/openai/v1",
  },
});

//Retrieval tool
const RetrivalTool = tool(
  async({query}) => {
  console.log("====Retrieving docs query=====")
  console.log(query)
  const retrievedDoc = await vectorStore.similaritySearch(query,3)

  const serializedDocs = retrievedDoc
    .map((doc) =>doc.pageContent)
    .join('\n')

  return serializedDocs
},
{
  name:'retrieve',
  description:'Retrieve the most relevant chunks of text from the description of a youtube video',
  schema: z.object({
    query:z.string(),
  })
}

 )

// Create a ReAct agent (no tools yet, but you can add)
const agent = createReactAgent({
  llm,
  tools: [
    // Example: You can add search, calculator, or custom tools here
    RetrivalTool
  ],
});

// Invoke the agent
const results = await agent.invoke({
  messages:[{role:'user', content:'How to scrape YouTube video transcripts using BrightData'}]
});

console.log(results.messages.at(-1)?.content);
