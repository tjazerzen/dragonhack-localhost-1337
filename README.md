# nineline: Emergency Incident Management System

A Next.js application for real-time emergency incident reporting, analysis, and response coordination. This system processes emergency call transcripts using AI to extract critical information about incidents and visualize them on an interactive map.

## Features

- **Transcript Analysis**: Processes emergency call transcripts using Google's Gemini AI to extract key incident details
- **Incident Classification**: Automatically categorizes incidents by type and severity
- **Resource Allocation**: Suggests required police and firefighter units based on incident analysis
- **Interactive Map**: Visualizes incident locations and details on a real-time map interface
- **Modern UI**: Built with React 19 and styled using Tailwind CSS

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:1337](http://localhost:1337) in your browser to access the application.

## Environment Setup

Copy the `.env.example` file to `.env.local` and fill in the required API keys:

```bash
cp .env.example .env.local
```

## Project Structure

- `/src/app`: Main application pages and API routes
- `/src/lib`: Core functionality including AI agent for incident reporting
- `/src/components`: Reusable UI components
- `/transcription-scripts`: Sample emergency call transcripts for testing

## Technologies Used

- Soniox for transcription
- Next.js 15
- React 19
- Google Gemini AI (via LangChain)
- Leaflet for map visualization
- TailwindCSS for styling
- TypeScript for type safety
