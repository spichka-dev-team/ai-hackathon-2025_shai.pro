# Architecture (DRAFT)

This is uncompleted, just Draft version of Architecture of System and Project.

## Agents Architecture (Agentic AI Design)

About Idea, SaaS solution where Stakeholders/Managers can view/and interact with Chat AI Assitant/Consultant/Advices about what's going in project (Project Status/Stage Tracker), we are using AI Agents and Platform for implementing the AI Agent Workflows like n8n but called shai.pro.

Data Sources:

- Zoom, Voice Call/Meeting - Audio/Transcript
- Jira, Task Management - Kanban Table

shai.pro has the Knowledges

---

**Topics:**

- Multi Agent System
- Agent Memory
- Short-term memory and Long-term memory
- Agent Orchestrator
- AI Agent, RAG
- MCP
- Agentic AI Design
- LLM, GenAI, AI Model

Other Topics:

- Voice Call, Realtime Media Streams (RTMS), (Zoom)
- Task Management, MCP (Jira)
- Chatting, Messanger (Telegram)
- Platform, Workflow automation, Agent Сonstructor/Builder (n8n/shai.pro)

---

Architecture Components/Services/Agents (not completed/uncompleted):

Agents:

- Agent Orchestrator
- Agents

---

## Draft

### last

---

ERD/Domains:

- Minimal Landing Page of Our SaaS product/project (AI Agent Automation Workflow Project)
- Calls (from Backend, RTMS)
    - video
    - audio
    - transcript: text
    - created_at
    - task_id: M2O
- Project_Roadmap (One-shot, AI Agent LLM Summary of Calls)
    - raodmap
- Calls_Summary (One-shot, AI Agent LLM Summary of Calls)
    - call_id: M2O
    - summary: text
- Project_Stage (One-shot, AI Agent LLM Description of Current/Last Calls based Project Stage/Status)
    - text_stage
- Jira_Kanban_Info (from Jira MCP)
    - member_fullname
    - role
- Zoom_Calls_Info (from Zoom MCP)
- AI Chat (Connected to the Agent Orchestrator that can Interact with other Agents)

---

UI/UX and User Interfaces (Desktop Only Version):

- Minimal Landing Page of Our SaaS product/project (AI Agent Automation Workflow)
- Auth Page (also minimal)
- Main Page
    - Roadmap of Project Status (updates after each Calls made call)
    - (Peoples/Members/Employee), Calls (from Zoom, saved), Question (chat with AI to question the AI about project, and what's going on - Orchestrator Agent???)
    - in Peoples: tasks from Jira given to specific member/employee
    - in Calls: summary of last zoom call
    - in Question: AI chat
    - "what stage is the project at" button???
- Profile (Settings, Integration API/Tokens/Secrets and etc.)

---

### prelast

ERD/Domains:

- Calls (from Backend, RTMS)
    - video
    - audio
    - transcript: text
    - created_at
    - task_id: M2O
- Tasks (One-shot, AI Agent LLM Suggestions based on Calls)
    - task_title
    - task_comment
- Calls_Summary (One-shot, AI Agent LLM Summary of Calls)
    - call_id: M2O
    - summary: text
- Project_Stage (One-shot, AI Agent LLM Description of Current/Last Calls based Project Stage/Status)
    - text_stage
- Jira_Members_Info (from Jira MCP)
    - member_fullname
    - role
- Zoom_Calls_Info (from Zoom MCP)
- AI Chat (Connected to the Agent Orchestrator that can Interact with other Agents)

---

UI/UX and User Interfaces (Desktop Only Version):

- Minimal Landing Page of Our SaaS product/project (AI Agent Automation Workflow)
- Auth Page (also minimal)
- Main Page
    - List of Last Calls in Zoom (Clickable)
    - after Clicking the specific call you go to the Task Page
    - Task Page where tasks are suggested from this Meeting and you can drag and drop it to the Specific Jira Member (we can implement the attachment of task to a specific member/employee in jira based on roles, but i dont know) (there would be a button to Create Tasks after Review)
    - Also in Main Page above Calls, will be located the like "what stage is the project at"
- Profile (Settings, Integration API/Tokens/Secrets and etc.)

---
