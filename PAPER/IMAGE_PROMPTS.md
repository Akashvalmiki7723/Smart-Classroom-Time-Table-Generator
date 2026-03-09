# Image Generation Prompts for Research Paper

You need TWO images for the paper. Generate them using any AI image tool (Napkin AI, Canva, or draw.io recommended for technical diagrams).

---

## IMAGE 1: System Architecture Diagram
**Filename:** `architecture_diagram.png`
**Referenced as:** Figure 1 in the paper

### Prompt for AI Image Generator:

```
Create a clean, professional system architecture diagram for a web application with 4 horizontal layers stacked vertically. Use a white background with thin black borders and a minimal color palette (light blue, light green, light orange, light purple).

TOP LAYER (light blue) - "Presentation Layer":
- 5 boxes in a row labeled: "Admin Dashboard", "HOD Dashboard", "Coordinator Dashboard", "Faculty Dashboard", "Student Dashboard"
- A small box labeled "AI Chatbot" connected to all 5 dashboards with dotted lines
- Label the whole layer "React 19 + Next.js 16"

SECOND LAYER (light green) - "API & Routing Layer":
- Boxes labeled: "Auth API", "CRUD APIs (Users, Departments, Subjects, Rooms, Batches, TimeSlots)", "AI API (Chat, Resolve, Analyze)"
- Label: "Next.js API Routes + NextAuth v5"

THIRD LAYER (light orange) - "Intelligence Layer":
- Two main boxes side by side:
  - Left box: "CSP Timetable Generator" with sub-items "MRV Heuristic", "Constraint Checker", "Optimization Scorer"
  - Right box: "RAG AI Service" with sub-items "Keyword Extractor", "Intent Classifier", "Context Retriever", "Multi-Model Fallback (4 LLMs)"
- Label: "Algorithms + AI Services"

BOTTOM LAYER (light purple) - "Data Layer":
- Left: "MongoDB Atlas" with a cylinder icon, listing collections: "Users, Departments, Subjects, Rooms, Batches, TimeSlots, Timetables, Leaves, Notifications"
- Right: "OpenRouter API" with a cloud icon, listing models: "StepFun, DeepSeek, GPT-OSS, Qwen"

Draw vertical arrows between layers showing data flow. Use a professional, IEEE-paper-appropriate style. No gradients, no 3D effects, no emojis. Clean and readable at 3.5 inches width.
```

### Alternative: Draw it in draw.io / diagrams.net
If you prefer to draw it manually, use this layout:

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (React 19 + Next.js 16)                 │
│  ┌─────┐ ┌─────┐ ┌─────────┐ ┌───────┐ ┌───────┐          │
│  │Admin│ │ HOD │ │Coordintr│ │Faculty│ │Student│  [Chatbot] │
│  └──┬──┘ └──┬──┘ └────┬────┘ └───┬───┘ └───┬───┘           │
├─────┼───────┼─────────┼──────────┼─────────┼───────────────┤
│  API & ROUTING LAYER (Next.js API Routes)                    │
│  ┌──────────┐  ┌────────────────┐  ┌──────────────┐        │
│  │ Auth API │  │  CRUD APIs     │  │   AI APIs    │        │
│  └────┬─────┘  └───────┬────────┘  └──────┬───────┘        │
├───────┼────────────────┼──────────────────┼─────────────────┤
│  INTELLIGENCE LAYER                                          │
│  ┌──────────────────┐    ┌──────────────────────┐           │
│  │  CSP Generator   │    │   RAG AI Service     │           │
│  │  - MRV Heuristic │    │   - Keyword Extract  │           │
│  │  - Constraints   │    │   - Intent Classify  │           │
│  │  - Scoring       │    │   - Context Retrieve │           │
│  └────────┬─────────┘    │   - 4-Model Fallback │           │
│           │              └──────────┬───────────┘           │
├───────────┼─────────────────────────┼───────────────────────┤
│  DATA LAYER                         │                        │
│  ┌──────────────┐          ┌────────┴────────┐              │
│  │ MongoDB Atlas│          │  OpenRouter API │              │
│  │ (9 collections)         │  (4 free LLMs) │              │
│  └──────────────┘          └─────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## IMAGE 2: Timetable Generation Algorithm Flowchart
**Filename:** `algorithm_flowchart.png`  
**Referenced as:** Figure 2 in the paper (you can add a \ref to it)

### Prompt for AI Image Generator:

```
Create a professional flowchart diagram showing a timetable generation algorithm. Use a white background with standard flowchart shapes. Minimal colors: light blue for process boxes, light yellow for decision diamonds, light green for start/end ovals, light red for the "unscheduled" path.

FLOW (top to bottom):

1. GREEN OVAL: "Start: Receive Input Data (Subjects, Rooms, Faculty, Batches, TimeSlots)"

2. BLUE BOX: "Expand subjects into individual class requirements (theory slots + practical slots)"

3. BLUE BOX: "Sort by MRV heuristic: assigned faculty first, then practicals, then theory"

4. YELLOW DIAMOND: "Any unscheduled classes remaining?"
   - NO arrow → goes to step 9
   - YES arrow → continues to step 5

5. BLUE BOX: "Pick next most-constrained class"

6. BLUE BOX: "Enumerate all valid (day, slot, room, faculty) combinations. Check: no faculty clash, no room clash, no batch clash, room type match, capacity check"

7. YELLOW DIAMOND: "Valid placement found?"
   - NO arrow → RED BOX: "Mark class as unscheduled, log warning" → loops back to step 4
   - YES arrow → continues to step 8

8. BLUE BOX: "Score each valid slot (workload balance, consecutive grouping, time preference, faculty preference). Select highest-scoring placement. Commit to schedule. Update faculty/room/batch maps."
   - Arrow loops back to step 4

9. BLUE BOX: "Run verification pass: count hard violations, count soft violations, compute optimization score (0-10)"

10. YELLOW DIAMOND: "Hard violations = 0?"
    - YES → GREEN OVAL: "Output: Complete Timetable (score, stats, any unscheduled classes)"
    - NO → RED BOX: "Flag critical errors for manual review"

Use standard flowchart conventions. Arrows should be clear. Text should be readable at 3.5 inches width. No decorative elements. Professional IEEE paper style.
```

### Alternative: Draw it in draw.io
Use standard flowchart shapes:
- Ovals for start/end
- Rectangles for processes
- Diamonds for decisions
- Arrows for flow direction

---

## TIPS FOR GENERATING THESE IMAGES

### Recommended Tools (Free):
1. **draw.io / diagrams.net** (best for technical diagrams) - https://app.diagrams.net
2. **Excalidraw** (hand-drawn style) - https://excalidraw.com
3. **Napkin AI** (AI-generated diagrams from prompts)
4. **Canva** (templates available)
5. **Mermaid Live Editor** (code-to-diagram) - https://mermaid.live

### Export Settings:
- Format: PNG
- Resolution: 300 DPI minimum
- Width: At least 1200 pixels (will be scaled to ~3.5 inches in the paper)
- Background: White (not transparent)

### Where to Save:
Save both images in the `PAPER/` folder:
- `d:\SHIRO FOLDER\PROJECT HUB\GOING ON PROJECTS\smart-classroom-timetable\PAPER\architecture_diagram.png`
- `d:\SHIRO FOLDER\PROJECT HUB\GOING ON PROJECTS\smart-classroom-timetable\PAPER\algorithm_flowchart.png`

### Adding the Second Figure to the Paper:
The architecture diagram (Figure 1) is already referenced in the paper. To add the flowchart as Figure 2, insert this LaTeX code after the search procedure section (Section IV-C):

```latex
\begin{figure}[htbp]
\centering
\includegraphics[width=0.48\textwidth]{algorithm_flowchart.png}
\caption{Flowchart of the CSP-based timetable generation algorithm. The MRV heuristic orders classes by constraint tightness. Each class is placed in the highest-scoring valid slot. Classes that cannot be placed are logged for manual assignment.}
\label{fig:flowchart}
\end{figure}
```
