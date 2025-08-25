RAG-YT-Chat
A Retrieval-Augmented Generation (RAG) chatbot that enables intelligent question answering about YouTube videos by leveraging their metadata, descriptions, and transcripts. The system combines vector embeddings, semantic search, and large language models to provide contextually relevant responses.
Overview
RAG-YT-Chat demonstrates how external knowledge can be effectively integrated into conversational AI agents. The system processes YouTube video content, creates searchable vector embeddings, and uses an intelligent agent to determine when to retrieve contextual information versus relying on the model's inherent knowledge.
Architecture
Frontend

React - Modern user interface for chat interactions
Node.js - Backend API server

Backend

LangChain.js - Framework for building LLM applications
Vector Embeddings - Ollama or OpenAI embeddings for semantic search
LLM Integration - Groq, Ollama, or OpenAI-compatible APIs
Vector Store - In-memory storage with extensibility for persistent solutions

Features
Document Processing

Automatic preprocessing of YouTube video descriptions and transcripts
Intelligent text chunking with semantic overlap for optimal retrieval
Metadata extraction and organization

Vector Search

High-performance embedding generation using Ollama or OpenAI models
Semantic similarity search for relevant context retrieval
Configurable similarity thresholds and result ranking

Intelligent Agent System

LangChain ReAct agent architecture for reasoning and tool usage
Dynamic decision-making on when to use retrieval versus model knowledge
Extensible tool system for custom functionality

High-Performance Inference

Groq integration for accelerated LLM inference
Support for large models including llama3-70b-8192
OpenAI-compatible API integration

How It Works

Content Ingestion

Load YouTube video metadata, descriptions, and transcripts
Parse and validate content structure


Document Processing

Split content into semantically meaningful, overlapping chunks
Optimize chunk size for embedding model constraints


Vector Embedding

Generate embeddings using selected embedding model
Store vectors in configurable vector store


Query Processing

Receive user queries through React frontend
Process queries through LangChain agent system


Intelligent Retrieval

Agent determines retrieval necessity based on query context
Execute semantic search when relevant context is needed
Combine retrieved context with model knowledge


Response Generation

Generate contextually aware responses
Provide source attribution when using retrieved content



Technology Stack
Core Framework

LangChain.js - LLM application framework
React - Frontend user interface
Node.js - Backend server environment

AI/ML Components

Embeddings: Ollama or OpenAI embedding models
LLMs: Groq (llama3-70b-8192), Ollama, or OpenAI models
Vector Storage: MemoryVectorStore (expandable to Pinecone, Chroma, Weaviate)

APIs and Services

Groq API - High-speed LLM inference
YouTube Data API - Content extraction
OpenAI API - Alternative LLM and embedding provider

Installation
bash# Clone the repository
git clone https://github.com/yourusername/rag-yt-chat.git
cd rag-yt-chat

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
Configuration
Create a .env file in the root directory:
env# LLM Configuration
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

# Embedding Configuration
EMBEDDING_PROVIDER=ollama # or openai
OLLAMA_BASE_URL=http://localhost:11434

# Application Configuration
PORT=3001
NODE_ENV=development
Usage
bash# Start the backend server
npm run server

# Start the React frontend (in a separate terminal)
npm run client

# For development (both frontend and backend)
npm run dev
