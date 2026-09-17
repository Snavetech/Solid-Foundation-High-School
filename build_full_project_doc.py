import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from generate_doc_helpers import (
    set_cell_background,
    set_cell_margins,
    set_cell_text,
    add_callout,
    add_code_block,
    style_table
)

def create_full_document(output_path):
    doc = Document()

    # Configure Margins: 1 inch (72pt)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Configure Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hr = hp.add_run("Solid Foundation High School | Smart School Fees Management System")
        hr.font.name = "Calibri"
        hr.font.size = Pt(8.5)
        hr.font.color.rgb = RGBColor(148, 163, 184)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        fr = fp.add_run("Final Year Project Technical Report & System Specification Document")
        fr.font.name = "Calibri"
        fr.font.size = Pt(8.5)
        fr.font.color.rgb = RGBColor(148, 163, 184)

    # Set normal style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)

    # ==========================================
    # COVER / TITLE PAGE
    # ==========================================
    p_title_space = doc.add_paragraph()
    p_title_space.paragraph_format.space_before = Pt(36)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("DESIGN AND IMPLEMENTATION OF A SMART SCHOOL FEES MANAGEMENT AND PAYMENT SYSTEM")
    r_title.bold = True
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(22)
    r_title.font.color.rgb = RGBColor(30, 58, 138) # Deep Navy

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(12)
    p_sub.paragraph_format.space_after = Pt(24)
    r_sub = p_sub.add_run("(CASE STUDY: SOLID FOUNDATION COMPREHENSIVE HIGH SCHOOL, ISSELE-UKU, DELTA STATE, NIGERIA)")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(13)
    r_sub.bold = True
    r_sub.font.color.rgb = RGBColor(71, 85, 105)

    p_div = doc.add_paragraph()
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_div = p_div.add_run("—" * 35)
    r_div.font.color.rgb = RGBColor(203, 213, 225)

    p_desc = doc.add_paragraph()
    p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_desc.paragraph_format.space_before = Pt(20)
    p_desc.paragraph_format.space_after = Pt(40)
    r_desc = p_desc.add_run(
        "A Comprehensive System Specification, Design Analysis, and Technical Documentation "
        "Submitted in Partial Fulfillment of the Requirements for the Award of the Bachelor of Science (B.Sc.) / "
        "Higher National Diploma (HND) Degree in Computer Science / Software Engineering."
    )
    r_desc.font.name = "Calibri"
    r_desc.font.size = Pt(11)
    r_desc.italic = True
    r_desc.font.color.rgb = RGBColor(51, 65, 85)

    # Institution Box
    inst_table = doc.add_table(rows=4, cols=2)
    inst_data = [
        ("Institutional Case Study:", "Solid Foundation Comprehensive High School"),
        ("Institutional Address:", "Ishikpe Quarters, Along Onicha-Uku Road, Issele-Uku, Delta State"),
        ("Institutional Motto:", "\"Knowledge is Wealth\""),
        ("Core Application Stack:", "React 18, TypeScript, Vite, Tailwind CSS, Supabase, Paystack")
    ]
    for idx, (label, val) in enumerate(inst_data):
        set_cell_text(inst_table.cell(idx, 0), label, bold=True, color_rgb=RGBColor(30, 58, 138))
        set_cell_text(inst_table.cell(idx, 1), val, bold=False, color_rgb=RGBColor(51, 65, 85))
    style_table(inst_table, col_widths=[2.5, 4.0])

    doc.add_page_break()

    # ==========================================
    # TABLE OF CONTENTS SUMMARY
    # ==========================================
    h_toc = doc.add_heading("TABLE OF CONTENTS / PROJECT STRUCTURE", level=1)
    h_toc.runs[0].font.color.rgb = RGBColor(30, 58, 138)
    
    toc_items = [
        ("SECTION 1: METHODOLOGY (JUSTIFIED)", "Software Development Life Cycle (SDLC) Evaluation, Agile/Scrum Justification, Sprints, Data Collection Methods"),
        ("SECTION 2: EXISTING SYSTEM ANALYSIS", "Manual Operational Workflow, Information Flow, System Limitations, Bottlenecks, and Vulnerabilities"),
        ("SECTION 3: PROPOSED SYSTEM SPECIFICATION", "System Overview, Key Objectives, Architectural Upgrades, Comparative Analysis Matrix"),
        ("SECTION 4: REQUIREMENTS ENGINEERING", "Comprehensive Functional Requirements (FR-1 to FR-8) and Non-Functional Requirements (NFR-1 to NFR-8)"),
        ("SECTION 5: SYSTEM MODELLING (UML & DFD)", "Use Case Model, Context Diagram (Level 0 DFD), Level 1 DFD, Level 2 DFD, Activity Diagrams, Sequence Diagrams, Class Diagram"),
        ("SECTION 6: DATABASE DESIGN & ARCHITECTURE", "Entity-Relationship Diagram (ERD), Relational Schema (PostgreSQL DDL), Row Level Security Policies, Complete Data Dictionary"),
        ("SECTION 7: SYSTEM ARCHITECTURE & DEPLOYMENT", "Three-Tier Architectural Model, Presentation Tier, Application Tier, Data Tier, Webhook Security, Deployment Configuration")
    ]
    
    toc_tbl = doc.add_table(rows=len(toc_items)+1, cols=2)
    set_cell_text(toc_tbl.cell(0, 0), "Section / Module", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(toc_tbl.cell(0, 1), "Scope & Academic Contents", bold=True, color_rgb=RGBColor(255, 255, 255))
    for idx, (sec_title, sec_desc) in enumerate(toc_items):
        set_cell_text(toc_tbl.cell(idx+1, 0), sec_title, bold=True, color_rgb=RGBColor(30, 58, 138))
        set_cell_text(toc_tbl.cell(idx+1, 1), sec_desc, bold=False, color_rgb=RGBColor(51, 65, 85))
    style_table(toc_tbl, col_widths=[2.8, 3.7])

    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    doc.add_page_break()

    # ==========================================
    # SECTION 1: METHODOLOGY (JUSTIFIED)
    # ==========================================
    h1 = doc.add_heading("SECTION 1: METHODOLOGY (JUSTIFIED)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(30, 58, 138)

    doc.add_heading("1.1 Overview of Software Development Methodologies", level=2)
    doc.add_paragraph(
        "A software development methodology defines the structured framework, processes, and guidelines used to plan, "
        "design, implement, test, and deploy a software artifact. The choice of methodology governs the predictability, "
        "speed of delivery, defect remediation capacity, and responsiveness to stakeholder feedback. In the development of the "
        "Smart School Fees System for Solid Foundation Comprehensive High School, multiple classical and modern Software Development "
        "Life Cycle (SDLC) paradigms were critically evaluated, including the traditional Waterfall Model, the Prototyping Model, "
        "the Spiral Model, and the Agile (Scrum) Framework."
    )

    doc.add_heading("1.2 Comparative Evaluation of Candidate Methodologies", level=2)
    
    method_table = doc.add_table(rows=5, cols=4)
    set_cell_text(method_table.cell(0, 0), "Methodology", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(method_table.cell(0, 1), "Key Characteristics", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(method_table.cell(0, 2), "Advantages", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(method_table.cell(0, 3), "Deficiencies in this Project", bold=True, color_rgb=RGBColor(255, 255, 255))
    
    comp_data = [
        ("Waterfall Model", "Linear, sequential phases; rigid progression from requirements to maintenance without backward iteration.",
         "Disciplined milestones, extensive documentation, clear boundaries.",
         "High risk of failure when requirements change; third-party payment gateway behaviors (Paystack webhooks) cannot be evaluated until late phases."),
        ("Prototyping Model", "Rapid creation of mockups and user interface models for early stakeholder review.",
         "Clarifies client expectations early; great for non-technical users.",
         "Can lead to scope creep and superficial frontends lacking architectural robustness and database security."),
        ("Spiral Model", "Risk-driven model combining iterative prototyping with Waterfall milestones.",
         "Exceptional risk management; structured iterative delivery.",
         "Excessive overhead, complex governance, and cost unsuited for a mid-scale secondary school web portal."),
        ("Agile (Scrum) [SELECTED]", "Iterative, time-boxed sprint cycles delivering functional product increments with continuous feedback.",
         "Rapid adaptation to changing payment gateway APIs, active bursary stakeholder participation, continuous testing.",
         "Requires active communication and discipline to prevent uncontrolled backlog inflation.")
    ]
    for idx, (m_name, m_char, m_adv, m_def) in enumerate(comp_data):
        set_cell_text(method_table.cell(idx+1, 0), m_name, bold=True, color_rgb=RGBColor(30, 58, 138))
        set_cell_text(method_table.cell(idx+1, 1), m_char)
        set_cell_text(method_table.cell(idx+1, 2), m_adv)
        set_cell_text(method_table.cell(idx+1, 3), m_def)
    style_table(method_table, col_widths=[1.5, 1.8, 1.6, 1.6])

    doc.add_heading("1.3 Justification for Selecting Agile (Scrum) Methodology", level=2)
    doc.add_paragraph(
        "The Agile Scrum methodology was selected as the optimal software development approach for the Smart School Fees System "
        "due to the following concrete institutional and technical justifications:"
    )
    
    justifications = [
        ("Integration with Third-Party Fintech APIs:", 
         "Integrating an online payment gateway (Paystack) requires empirical testing of popup SDKs, callback URL redirects, "
         "serverless webhook signatures, and network timeouts. Scrum's sprint-based iteration allowed the payment cycle to be prototyped, "
         "tested in sandbox mode, and validated incrementally without jeopardizing the core database schema."),
        ("Evolving Stakeholder Requirements:",
         "Secondary schools in Nigeria operate complex, term-variable billing rules (e.g., compulsory tuition vs. optional bus levies, "
         "new student registration fees, PTA dues, and installment options). Scrum facilitated bi-weekly reviews with the school bursar "
         "and proprietor, ensuring the system accurately models real-life fee variations."),
        ("Security and Financial Integrity Risk Reduction:",
         "Handling monetary payments demands zero tolerance for calculation anomalies or unauthorized data access. Agile's continuous "
         "integration and unit/regression testing cycles enabled rigorous testing of PostgreSQL Row Level Security (RLS) policies "
         "and atomic database operations across every sprint."),
        ("Early Delivery of High-Value Increments:",
         "The school did not need to wait until the completion of the entire project to test student enrollment and fee structure setup. "
         "Functional increments were delivered and demonstrated sequentially, building user confidence.")
    ]
    for title, desc in justifications:
        p = doc.add_paragraph()
        r1 = p.add_run(f"• {title} ")
        r1.bold = True
        r1.font.color.rgb = RGBColor(30, 58, 138)
        p.add_run(desc)

    add_callout(
        doc,
        "Agile Scrum was adopted because financial web applications with external webhook listeners require rapid "
        "fail-fast validation. The two-week sprint structure provided a disciplined cadence to deliver working software "
        "verified against real school ledger records.",
        title="METHODOLOGY SELECTION RATIONALE"
    )

    doc.add_heading("1.4 Sprint Decomposition and Execution Phases", level=2)
    doc.add_paragraph(
        "The project was executed across six focused sprints, each culminating in a functional, tested software increment:"
    )

    sprint_table = doc.add_table(rows=7, cols=3)
    set_cell_text(sprint_table.cell(0, 0), "Sprint Phase", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(sprint_table.cell(0, 1), "Core Objectives & Deliverables", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(sprint_table.cell(0, 2), "Output Increment", bold=True, color_rgb=RGBColor(255, 255, 255))
    sprint_data = [
        ("Sprint 0: Inception & Research", 
         "Stakeholder interviews, study of paper ledgers, requirements definition, architecture blueprint, UI/UX wireframes.",
         "PRD, System Design Document, Figma mockups."),
        ("Sprint 1: Core Database & Auth",
         "Supabase PostgreSQL schema setup, Row Level Security (RLS) rules, Supabase Auth integration (email/password, JWT), role resolution.",
         "Functional Login/Register portal with automated role redirection (Admin, Bursar, Parent)."),
        ("Sprint 2: Academic & People Management",
         "Classes (JSS1-SS3 arms), Sessions & Terms management, Student registration, Guardian profiles and student-guardian linking.",
         "CRUD portals for classes, terms, students, and parent ward binding."),
        ("Sprint 3: Fee Setup & Payment Integration",
         "Dynamic fee structure builder per class/term (compulsory vs optional items), Paystack inline SDK integration, manual bursary cash recording.",
         "End-to-end fee calculation and payment initiation module."),
        ("Sprint 4: Webhook Handler & Digital Receipts",
         "Supabase Edge Function for Paystack HMAC signature verification, atomic payment state updates, automated digital receipt generation with PDF download.",
         "Tamper-proof online payment reconciliation and branded downloadable PDF receipts."),
        ("Sprint 5: Auditing, Reporting & UAT",
         "Admin/Bursar KPI dashboards, termly collection reports, defaulters list export (CSV/PDF), User Acceptance Testing with bursary staff.",
         "Fully verified, production-ready release of the Smart School Fees System.")
    ]
    for idx, (s_name, s_obj, s_out) in enumerate(sprint_data):
        set_cell_text(sprint_table.cell(idx+1, 0), s_name, bold=True, color_rgb=RGBColor(30, 58, 138))
        set_cell_text(sprint_table.cell(idx+1, 1), s_obj)
        set_cell_text(sprint_table.cell(idx+1, 2), s_out)
    style_table(sprint_table, col_widths=[1.8, 3.2, 1.5])

    doc.add_heading("1.5 Data Collection and Empirical Research Techniques", level=2)
    doc.add_paragraph(
        "To elicit authentic requirements and model the business rules of Solid Foundation Comprehensive High School, three primary "
        "data gathering instruments were employed:"
    )
    data_techs = [
        ("Semi-Structured Interviews:", "Conducted structured sessions with the School Proprietor, the Chief Bursar, and assistant accounting clerks to understand fee schedules, penalty policies, installment permissions, and bank deposit verification procedures."),
        ("Direct Operational Observation:", "Observed the physical queue and reconciliation dynamics at the school bursary office during the resumption week of First Term. Documented the exact manual lookup procedure, the time taken to verify each payment (averaging 8 to 15 minutes per parent), and manual receipt writing."),
        ("Document and Artifact Analysis:", "Examined physical artifacts including the school's paper fee schedule flyers, carbon-copy triplicate receipt booklets, bank deposit tellers from commercial banks (First Bank, Zenith Bank), and physical paper ledger registers.")
    ]
    for title, desc in data_techs:
        p = doc.add_paragraph()
        r1 = p.add_run(f"1. {title} ")
        r1.bold = True
        p.add_run(desc)

    doc.add_page_break()

    # ==========================================
    # SECTION 2: EXISTING SYSTEM ANALYSIS
    # ==========================================
    h2 = doc.add_heading("SECTION 2: EXISTING SYSTEM ANALYSIS", level=1)
    h2.runs[0].font.color.rgb = RGBColor(30, 58, 138)

    doc.add_heading("2.1 Description of the Existing Manual System", level=2)
    doc.add_paragraph(
        "Solid Foundation Comprehensive High School currently manages fee collection, payment verification, receipt issuance, "
        "and financial accounting through a conventional manual and semi-manual paper-based system. The institution relies on paper "
        "ledgers, physical bank deposit slips (tellers), commercial bank account statements, and handwritten receipt booklets."
    )
    doc.add_paragraph(
        "When school resumes for an academic term, parents receive printed bills or circulars outlining the approved fee schedule "
        "for their child's class. Parents are instructed to pay directly at designated commercial bank branches in Issele-Uku or via "
        "mobile banking transfers into the school's bank account. After completing the bank transaction, the parent or student must "
        "physically present the paper deposit slip (teller) or a printout of the mobile transaction receipt to the school bursary office."
    )

    doc.add_heading("2.2 Step-by-Step Existing Operational Workflow", level=2)
    
    flow_steps = [
        ("Step 1: Fee Notification", "The school publishes physical circulars stating tuition, development levy, PTA levy, and exam fees."),
        ("Step 2: Payment Execution", "Parent travels to a commercial bank or POS operator, fills a deposit teller, queues, and pays cash, or initiates a mobile transfer."),
        ("Step 3: Proof Presentation", "Parent/student brings the physical paper deposit slip or transaction screenshot to the bursary office."),
        ("Step 4: Verification Search", "The bursar scrolls through bank SMS alerts on the school phone or awaits end-of-week paper bank statements to verify receipt of funds."),
        ("Step 5: Ledger Posting", "Bursar locates the student's name in a voluminous handwritten ledger book, records date, teller number, and amount paid, and calculates the remaining balance with a calculator."),
        ("Step 6: Receipt Writing", "Bursar manually writes a receipt from a triplicate paper booklet, stamps it, tears out the original for the parent, and files the carbon copies."),
        ("Step 7: Periodic Auditing", "At term-end, the bursar manually tallies each class column to prepare a summary report for the school proprietor.")
    ]
    for step, desc in flow_steps:
        p = doc.add_paragraph()
        r = p.add_run(f"{step}: ")
        r.bold = True
        r.font.color.rgb = RGBColor(30, 58, 138)
        p.add_run(desc)

    doc.add_heading("2.3 Workflow Diagram of the Existing System", level=2)
    existing_wf_ascii = (
        "+---------------------------------------------------------------------------------------+\n"
        "|                         EXISTING MANUAL FEE COLLECTION WORKFLOW                       |\n"
        "+---------------------------------------------------------------------------------------+\n"
        "                                                                                         \n"
        " [Parent] ----(1. Travels to Bank)----> [Commercial Bank]                               \n"
        "    |                                        |                                          \n"
        "    |                                   (Issues Paper Teller)                           \n"
        "    |                                        v                                          \n"
        "    +---------(2. Brings Physical Teller)--> [Bursary Office]                           \n"
        "                                                 |                                      \n"
        "                                        (3. Searches Phone SMS /                        \n"
        "                                            Bank Statements)                            \n"
        "                                                 v                                      \n"
        "                                        (4. Verifies Payment)                           \n"
        "                                            /          \\                                \n"
        "                                     [Match Found]   [No Match]                         \n"
        "                                          |              |                              \n"
        "                                          v              v                              \n"
        "                                    (5. Writes in    (Turn Parent Away /                \n"
        "                                     Paper Ledger)    Await Bank Clearance)             \n"
        "                                          |                                             \n"
        "                                          v                                             \n"
        "                                    (6. Issues Hand-                                    \n"
        "                                     written Receipt)                                   \n"
        "                                          |                                             \n"
        "                                          v                                             \n"
        "                                    (7. Manual Termly                                   \n"
        "                                     Summary Calculation)                               \n"
    )
    add_code_block(doc, existing_wf_ascii)

    doc.add_heading("2.4 Critical Bottlenecks and Vulnerabilities of the Existing System", level=2)
    
    flaws = [
        ("Reconciliation Delays & Congestion:", 
         "During the first three weeks of resumption, the bursary experiences severe overcrowding. Bursars spend an average of 10 to 15 minutes "
         "per student searching bank statements, verifying authenticity, and issuing receipts."),
        ("Susceptibility to Financial Fraud & Fake Tellers:",
         "Manual systems are vulnerable to altered deposit slips, forged bank stamps, fake SMS transfer alerts, and reused bank teller slips. "
         "Without automated API verification, fraudulent claims can slip into the school ledger unnoticed."),
        ("Physical Record Deterioration & Disaster Risk:",
         "Handwritten ledger registers and carbon receipt duplicates are stored in wooden filing cabinets. They face hazards such as moisture, "
         "rodents, ink fading, physical loss, and fire hazards. Lost ledgers permanently destroy historical payment records."),
        ("Mathematical Errors in Outstanding Balances:",
         "When parents pay in installments, bursars calculate outstanding arrears manually. Arithmetic mistakes frequently lead to disputes "
         "between parents and school administrators over whether a student is cleared for examinations."),
        ("Absence of Remote Self-Service for Parents:",
         "Working parents and guardians living outside Issele-Uku (e.g., in Asaba, Onitsha, Lagos) have no remote mechanism to check "
         "their child's fee status, balance, or payment history without traveling to the school premises."),
        ("Cumbersome Administrative Reporting:",
         "Compiling termly financial summaries, total fees collected, and the list of fee defaulters requires days of tedious manual tallying. "
         "Management cannot obtain real-time financial snapshots.")
    ]
    for title, desc in flaws:
        p = doc.add_paragraph()
        r1 = p.add_run(f"• {title} ")
        r1.bold = True
        r1.font.color.rgb = RGBColor(185, 28, 28)
        p.add_run(desc)

    doc.add_page_break()

    # ==========================================
    # SECTION 3: PROPOSED SYSTEM SPECIFICATION
    # ==========================================
    h3 = doc.add_heading("SECTION 3: PROPOSED SYSTEM SPECIFICATION", level=1)
    h3.runs[0].font.color.rgb = RGBColor(30, 58, 138)

    doc.add_heading("3.1 System Overview and Vision", level=2)
    doc.add_paragraph(
        "The proposed **Smart School Fees System** is a modern, responsive, cloud-hosted web application specifically engineered "
        "to digitize and automate the end-to-end fee lifecycle for Solid Foundation Comprehensive High School. "
        "The system completely replaces manual paper ledgers with a secure, highly scalable relational database managed by Supabase (PostgreSQL), "
        "integrates a direct payment gateway (Paystack) for instant online clearing, provides dual payment processing (supporting both online payments "
        "and staff-recorded manual cash/bank transfers), issues tamper-proof digital receipts with automated PDF generation, and presents "
        "real-time administrative dashboards and defaulters reporting."
    )

    doc.add_heading("3.2 Core Objectives of the Proposed System", level=2)
    objectives = [
        "1. Instant Automated Payment Clearing: Eliminate manual bank teller verification by integrating Paystack checkout with serverless webhook confirmation.",
        "2. Complete Multi-Device Accessibility: Provide a responsive, mobile-first web portal allowing parents to monitor balances and make payments 24/7 from any device.",
        "3. Dual Payment Architecture: Accommodate both online card/bank/USSD payments and in-person cash/bank transfer payments recorded by bursars with full staff audit trails.",
        "4. Tamper-Proof Digital Receipts: Automatically generate unique, cryptographically identifiable receipts downloadable as branded PDF documents.",
        "5. Automated Dynamic Balance Computation: Dynamically track itemized compulsory and optional fees per class/term, automatically recalculating balances upon partial or full payments.",
        "6. Enterprise Security and Data Isolation: Enforce PostgreSQL Row Level Security (RLS) policies ensuring parents can only view their linked wards, while bursars manage school-wide financial data.",
        "7. Real-Time Financial Intelligence: Provide instant dashboards displaying Expected Revenue, Total Collected, Outstanding Arrears, and exportable Defaulter reports."
    ]
    for obj in objectives:
        doc.add_paragraph(obj)

    doc.add_heading("3.3 Comparative Analysis: Existing vs. Proposed System", level=2)
    
    comp_tbl = doc.add_table(rows=8, cols=3)
    set_cell_text(comp_tbl.cell(0, 0), "Functional Dimension", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(comp_tbl.cell(0, 1), "Existing Manual System", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(comp_tbl.cell(0, 2), "Proposed Smart School Fees System", bold=True, color_rgb=RGBColor(255, 255, 255))
    
    comp_metrics = [
        ("Payment Channels", "Physical bank branch deposit or manual bank transfer requiring paper proof.", "Multi-channel online (Cards, USSD, Bank Transfer, QR) via Paystack + recorded manual payments."),
        ("Verification Speed", "Manual lookup taking 10 to 15 minutes per transaction, often delayed by days.", "Instant automated clearance (< 3 seconds) via serverless webhook verification."),
        ("Receipt Generation", "Handwritten paper triplicate booklet; easily lost, torn, or damaged.", "Instant auto-generated digital receipt with unique reference, downloadable as branded PDF."),
        ("Data Security & Integrity", "Physical paper registers prone to fire, theft, wear, or unauthorized alteration.", "Cloud-hosted PostgreSQL database protected by Row Level Security, SSL/TLS encryption, and daily backups."),
        ("Parent Visibility", "Zero remote access; parents must travel to school to check arrears.", "Secure 24/7 self-service portal accessible on smartphones, tablets, and desktop computers."),
        ("Error Probability", "High likelihood of arithmetic and transcription errors during manual posting.", "Zero calculation error; balances dynamically aggregated via automated SQL logic."),
        ("Reporting & Analytics", "Bursar spends days compiling termly summaries on paper sheets.", "One-click real-time generation of collection and defaulters reports with PDF/CSV export.")
    ]
    for idx, (dim, ex, prop) in enumerate(comp_metrics):
        set_cell_text(comp_tbl.cell(idx+1, 0), dim, bold=True, color_rgb=RGBColor(30, 58, 138))
        set_cell_text(comp_tbl.cell(idx+1, 1), ex)
        set_cell_text(comp_tbl.cell(idx+1, 2), prop)
    style_table(comp_tbl, col_widths=[1.5, 2.5, 2.5])

    doc.add_page_break()

    # ==========================================
    # SECTION 4: REQUIREMENTS ENGINEERING
    # ==========================================
    h4 = doc.add_heading("SECTION 4: REQUIREMENTS ENGINEERING", level=1)
    h4.runs[0].font.color.rgb = RGBColor(30, 58, 138)

    doc.add_heading("4.1 Functional Requirements Specification", level=2)
    doc.add_paragraph(
        "Functional requirements detail the specific operations, services, inputs, workflows, and outputs that the system "
        "must execute. These requirements are modularly organized and numbered for traceability."
    )

    fr_modules = [
        ("Module 1: Authentication & Role-Based Access Control (RBAC)", [
            ("FR-1.1", "The system shall authenticate Super Admin, Bursar, and Parent users using email and password via Supabase Auth."),
            ("FR-1.2", "The system shall enforce role-based access control, routing authenticated users to their authorized dashboards (Admin/Bursar vs. Parent)."),
            ("FR-1.3", "The system shall provide a self-service password reset flow via automated email verification links."),
            ("FR-1.4", "The system shall allow parent self-registration by verifying student admission number and surname against existing records.")
        ]),
        ("Module 2: Student & Guardian Record Management", [
            ("FR-2.1", "The system shall allow Bursars and Admins to create, view, edit, and deactivate student records (Admission Number, Full Name, Class, Photo, Status)."),
            ("FR-2.2", "The system shall prevent duplicate student admission numbers across the database using unique constraints."),
            ("FR-2.3", "The system shall allow Bursars and Admins to manage guardian profiles and link one or multiple students to a guardian.")
        ]),
        ("Module 3: Academic Structure Management", [
            ("FR-3.1", "The system shall allow Admins and Bursars to create and maintain academic classes (e.g., JSS1, JSS2, SS1) and optional arms (e.g., A, B, Science)."),
            ("FR-3.2", "The system shall allow management of academic sessions (e.g., '2025/2026') and terms ('First', 'Second', 'Third')."),
            ("FR-3.3", "The system shall allow marking exactly one session-term record as 'current' to drive default financial queries across the application.")
        ]),
        ("Module 4: Dynamic Fee Structure Configuration", [
            ("FR-4.1", "The system shall enable Bursars to define itemized fees (e.g., Tuition, PTA Levy, Development Levy, Exam Fee) per class per term."),
            ("FR-4.2", "The system shall support marking fee items as 'compulsory' or 'optional'."),
            ("FR-4.3", "The system shall ensure that updating or modifying a fee structure does not alter or corrupt historical payment records.")
        ]),
        ("Module 5: Payment Processing & Dual Channels", [
            ("FR-5.1", "The system shall display itemized fees due, total billed amount, total paid, and outstanding balance for each ward linked to a parent."),
            ("FR-5.2", "The system shall allow parents to pay fees online via Paystack in full or partial installments."),
            ("FR-5.3", "The system shall allow Bursars to record manual cash or direct bank transfer payments made at the school bursary office."),
            ("FR-5.4", "The system shall automatically attribute manual payments to the specific staff member (Bursar ID) who recorded them."),
            ("FR-5.5", "The system shall update student balances immediately upon receipt of a verified payment.")
        ]),
        ("Module 6: Automated Receipt Generation", [
            ("FR-6.1", "The system shall automatically issue a receipt with a unique serial number (e.g., 'REC-2026-XXXX') for every successful payment."),
            ("FR-6.2", "Receipts shall display school credentials (name, motto, address), student bio-data, payment method, amount paid, and remaining balance."),
            ("FR-6.3", "The system shall allow users to view receipts in-app and download them as formatted PDF files.")
        ]),
        ("Module 7: Role-Specific Dashboards", [
            ("FR-7.1", "The Admin/Bursar dashboard shall render live metrics: Total Expected Revenue, Total Collected Revenue, and Total Outstanding Arrears."),
            ("FR-7.2", "The Admin/Bursar dashboard shall provide filterable transaction tables and class-by-class collection breakdowns."),
            ("FR-7.3", "The Parent dashboard shall render individual ward cards with current balances and direct payment triggers.")
        ]),
        ("Module 8: Financial Auditing & Reporting", [
            ("FR-8.1", "The system shall generate termly collection reports filterable by session, term, class, and payment channel."),
            ("FR-8.2", "The system shall generate comprehensive defaulters reports listing students with outstanding balances."),
            ("FR-8.3", "The system shall support exporting financial reports in PDF and CSV formats for administrative audit.")
        ])
    ]

    for mod_title, fr_list in fr_modules:
        doc.add_heading(mod_title, level=3)
        for req_id, req_text in fr_list:
            p = doc.add_paragraph()
            r = p.add_run(f"{req_id}: ")
            r.bold = True
            r.font.color.rgb = RGBColor(30, 58, 138)
            p.add_run(req_text)

    doc.add_heading("4.2 Non-Functional Requirements Specification", level=2)
    doc.add_paragraph(
        "Non-functional requirements specify the system's operational qualities, performance thresholds, architectural constraints, "
        "and security standards."
    )

    nfr_table = doc.add_table(rows=9, cols=3)
    set_cell_text(nfr_table.cell(0, 0), "Requirement Area", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(nfr_table.cell(0, 1), "Quality Metric / Standard", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(nfr_table.cell(0, 2), "Implementation Mechanism in System", bold=True, color_rgb=RGBColor(255, 255, 255))

    nfr_items = [
        ("Security (NFR-1)", "Zero unauthorized data leakage; strict tenant segregation.", "PostgreSQL Row Level Security (RLS) policies enforced at database engine layer; JWT verification."),
        ("Payment Integrity (NFR-2)", "Zero client-side payment forgery.", "Paystack secret key isolation in serverless functions; HMAC-SHA512 webhook signature verification."),
        ("Performance (NFR-3)", "Sub-2.0 second page load time; sub-500ms database queries.", "Optimized React Vite build; PostgreSQL indexing on foreign keys (admission_no, student_id, guardian_id)."),
        ("Availability (NFR-4)", "99.9% uptime for payment and query services.", "Serverless cloud hosting on Supabase infrastructure with multi-zone automated failover."),
        ("Usability & Accessibility (NFR-5)", "Intuitive navigation for low/moderate tech parents.", "Clean UI designed with Tailwind CSS, minimal click paths, clear typography, and visual feedback modals."),
        ("Mobile Responsiveness (NFR-6)", "Seamless rendering on screens from 320px to 4K displays.", "Responsive flex/grid viewport layout catering to the predominantly mobile traffic of parents."),
        ("Data Auditability (NFR-7)", "Every transaction and fee adjustment permanently attributed.", "Immutable timestamping (timestamptz default now()), foreign key attribution to staff profiles."),
        ("Localization (NFR-8)", "Conformity with Nigerian financial and temporal conventions.", "Currency rendered in Nigerian Naira (₦), Africa/Lagos timezone, DD/MM/YYYY date formatting.")
    ]
    for idx, (area, metric, impl) in enumerate(nfr_items):
        set_cell_text(nfr_table.cell(idx+1, 0), area, bold=True, color_rgb=RGBColor(30, 58, 138))
        set_cell_text(nfr_table.cell(idx+1, 1), metric)
        set_cell_text(nfr_table.cell(idx+1, 2), impl)
    style_table(nfr_table, col_widths=[1.6, 2.3, 2.6])

    doc.add_page_break()

    # ==========================================
    # SECTION 5: SYSTEM MODELLING (UML & DFD)
    # ==========================================
    h5 = doc.add_heading("SECTION 5: SYSTEM MODELLING (UML & DFD)", level=1)
    h5.runs[0].font.color.rgb = RGBColor(30, 58, 138)

    doc.add_heading("5.1 Use Case Modeling", level=2)
    doc.add_paragraph(
        "Use case modeling captures the interactions between external actors and the system's boundary. "
        "The primary actors identified are: Super Admin, Bursar, Parent/Guardian, and the external Paystack Payment Gateway."
    )

    uc_table = doc.add_table(rows=7, cols=4)
    set_cell_text(uc_table.cell(0, 0), "Use Case ID", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(uc_table.cell(0, 1), "Use Case Title", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(uc_table.cell(0, 2), "Primary Actor", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(uc_table.cell(0, 3), "Scope / Business Goal", bold=True, color_rgb=RGBColor(255, 255, 255))
    
    uc_data = [
        ("UC-01", "Authenticate User", "All Users (Admin, Bursar, Parent)", "Verify credentials, issue JWT, and redirect to role-specific dashboard."),
        ("UC-02", "Manage Academic & Fee Setup", "Bursar / Admin", "Configure classes, academic terms, and itemized compulsory/optional fee schedules."),
        ("UC-03", "Manage Students & Guardians", "Bursar / Admin", "Register students, assign classes, and link to guardian profiles."),
        ("UC-04", "Pay Fees Online", "Parent / Guardian", "Select ward, initiate Paystack checkout, clear payment, and obtain digital receipt."),
        ("UC-05", "Record Manual Payment", "Bursar", "Log offline cash or bank transfer payment against student and issue immediate receipt."),
        ("UC-06", "Generate Financial Reports", "Bursar / Admin", "Query termly collection aggregates and export defaulter lists as PDF/CSV.")
    ]
    for idx, (ucid, title, actor, scope) in enumerate(uc_data):
        set_cell_text(uc_table.cell(idx+1, 0), ucid, bold=True, color_rgb=RGBColor(30, 58, 138))
        set_cell_text(uc_table.cell(idx+1, 1), title)
        set_cell_text(uc_table.cell(idx+1, 2), actor)
        set_cell_text(uc_table.cell(idx+1, 3), scope)
    style_table(uc_table, col_widths=[1.1, 1.8, 1.6, 2.0])

    doc.add_heading("5.1.1 Formal Use Case Specification: Pay Fees Online (UC-04)", level=3)
    
    uc_spec_tbl = doc.add_table(rows=9, cols=2)
    spec_data = [
        ("Use Case Name:", "Pay Fees Online (UC-04)"),
        ("Primary Actor:", "Parent / Guardian"),
        ("Pre-conditions:", "1. Parent is authenticated via Supabase Auth.\n2. Parent is linked to at least one active student record.\n3. A fee structure exists for the student's class in the current term."),
        ("Trigger:", "Parent clicks 'Pay Now' button on their dashboard for a specific ward."),
        ("Main Success Scenario (Normal Flow):", 
         "1. Parent views the itemized fee schedule and outstanding balance.\n"
         "2. Parent selects payment amount (full balance or custom partial installment).\n"
         "3. Parent clicks 'Proceed to Paystack Payment'.\n"
         "4. System initializes transaction and loads Paystack checkout modal.\n"
         "5. Parent enters card details or selects USSD/Bank Transfer and authorizes charge.\n"
         "6. Paystack processes payment and redirects client while dispatching webhook event.\n"
         "7. Serverless webhook handler verifies HMAC-SHA512 signature.\n"
         "8. System updates payment status from 'pending' to 'success'.\n"
         "9. System auto-generates receipt and updates student balance.\n"
         "10. Client displays confirmation message with instant receipt download."),
        ("Alternative Flows:", 
         "4a. Payment cancelled by user: Paystack modal closes; payment marked as cancelled; balance unchanged.\n"
         "6a. Payment declined by issuing bank: Paystack reports failure; system records status 'failed'; parent is prompted to retry with alternative channel."),
        ("Post-conditions:", "Student outstanding balance is reduced by the paid amount; transaction is recorded in database; receipt is generated."),
        ("Business Rules:", "1. Overpayment exceeding the total outstanding balance is rejected.\n2. Partial payments are permitted if amount > ₦0.\n3. Receipts are strictly immutable once created.")
    ]
    for idx, (label, val) in enumerate(spec_data):
        set_cell_text(uc_spec_tbl.cell(idx, 0), label, bold=True, color_rgb=RGBColor(30, 58, 138))
        set_cell_text(uc_spec_tbl.cell(idx, 1), val)
    style_table(uc_spec_tbl, col_widths=[2.2, 4.3])

    doc.add_heading("5.2 Data Flow Diagrams (DFD)", level=2)
    doc.add_paragraph(
        "Data Flow Diagrams depict how information traverses the system, identifying external entities, computational processes, "
        "and data stores."
    )

    doc.add_heading("5.2.1 Context Diagram (Level 0 DFD)", level=3)
    doc.add_paragraph("The Context Diagram illustrates the primary boundary of the Smart School Fees System and its interactions with external entities.")
    
    dfd0_ascii = (
        "=========================================================================================\n"
        "                               CONTEXT DIAGRAM (LEVEL 0 DFD)                             \n"
        "=========================================================================================\n"
        "                                                                                         \n"
        "                  +----------------------------------------------+                       \n"
        "                  |                   PARENT                     |                       \n"
        "                  +----------------------------------------------+                       \n"
        "                    |  ^                      ^              ^                           \n"
        "      Login/Ward ID |  | Fee Schedule/        | Payment      | Digital                   \n"
        "                    |  | Balance Info         | Confirmation | Receipt                   \n"
        "                    v  |                      |              |                           \n"
        "                 +===============================================+                       \n"
        "                 |                                               |                       \n"
        "                 |                     0.0                       |                       \n"
        "                 |           SMART SCHOOL FEES SYSTEM            |                       \n"
        "                 |   (Solid Foundation Comprehensive High Sch)   |                       \n"
        "                 |                                               |                       \n"
        "                 +===============================================+                       \n"
        "                    ^  |                      ^              |                           \n"
        "       Fee Setup &  |  | Financial Reports/   | Webhook      | Transaction               \n"
        "     Manual Payment |  | Student Records      | Verification | Initialization            \n"
        "                    |  v                      |              v                           \n"
        "                  +----------------------+  +----------------------------------+         \n"
        "                  |    ADMIN / BURSAR    |  |     PAYSTACK PAYMENT GATEWAY     |         \n"
        "                  +----------------------+  +----------------------------------+         \n"
    )
    add_code_block(doc, dfd0_ascii)

    doc.add_heading("5.2.2 Level 1 Data Flow Diagram (Subsystems Decomposition)", level=3)
    doc.add_paragraph("Level 1 DFD decomposes the system into its six core processes, detailing the data stores accessed.")
    
    dfd1_ascii = (
        "-----------------------------------------------------------------------------------------\n"
        "                                LEVEL 1 DATA FLOW DIAGRAM                                \n"
        "-----------------------------------------------------------------------------------------\n"
        "                                                                                         \n"
        "  [User Credentials]                                                                     \n"
        "          |                                                                              \n"
        "          v                                                                              \n"
        "   +-------------+      Session Token      +-------------------------------------------+ \n"
        "   | 1.0 Auth &  |------------------------>| D1: PROFILES & SESSIONS                   | \n"
        "   | Access Ctrl |                         +-------------------------------------------+ \n"
        "   +-------------+                                                                       \n"
        "          ^                                                                              \n"
        "          | Academic Config Data                                                         \n"
        "          v                                                                              \n"
        "   +-------------+     Class/Term Rules    +-------------------------------------------+ \n"
        "   | 2.0 Academic|<----------------------->| D2: CLASSES & TERMS                       | \n"
        "   | Structure   |                         +-------------------------------------------+ \n"
        "   +-------------+                                                                       \n"
        "          ^                                                                              \n"
        "          | Student / Guardian Bio-data                                                  \n"
        "          v                                                                              \n"
        "   +-------------+      Student Linkage    +-------------------------------------------+ \n"
        "   | 3.0 People  |<----------------------->| D3: STUDENTS & GUARDIANS                  | \n"
        "   | Management  |                         +-------------------------------------------+ \n"
        "   +-------------+                                                                       \n"
        "          ^                                                                              \n"
        "          | Fee Breakdown & Amounts                                                      \n"
        "          v                                                                              \n"
        "   +-------------+      Fee Schedules      +-------------------------------------------+ \n"
        "   | 4.0 Fee     |<----------------------->| D4: FEE_STRUCTURES                        | \n"
        "   | Definition  |                         +-------------------------------------------+ \n"
        "   +-------------+                                                                       \n"
        "          ^                                                                              \n"
        "          | Online / Manual Payments                                                     \n"
        "          v                                                                              \n"
        "   +-------------+      Payment Records    +-------------------------------------------+ \n"
        "   | 5.0 Payment |<----------------------->| D5: PAYMENTS                              | \n"
        "   | Engine      |                         +-------------------------------------------+ \n"
        "   +-------------+                                                                       \n"
        "          |                                                                              \n"
        "          | Payment Verified Event                                                       \n"
        "          v                                                                              \n"
        "   +-------------+      Receipt Data       +-------------------------------------------+ \n"
        "   | 6.0 Receipt |------------------------>| D6: RECEIPTS                              | \n"
        "   | & Reporting |                         +-------------------------------------------+ \n"
        "   +-------------+                                                                       \n"
    )
    add_code_block(doc, dfd1_ascii)

    doc.add_heading("5.2.3 Level 2 Data Flow Diagram (Payment & Webhook Verification)", level=3)
    doc.add_paragraph("Level 2 DFD drills down into Process 5.0 (Payment Processing) to capture cryptographic webhook verification.")
    
    dfd2_ascii = (
        "-----------------------------------------------------------------------------------------\n"
        "                  LEVEL 2 DFD: PROCESS 5.0 (PAYMENT PROCESSING & VERIFICATION)           \n"
        "-----------------------------------------------------------------------------------------\n"
        "                                                                                         \n"
        " [Parent] --(Initiate Pay)--> [5.1 Initialize Tx] --(Write Pending)--> [(D5) Payments]  \n"
        "                                    |                                                    \n"
        "                             (Redirect Modal)                                            \n"
        "                                    v                                                    \n"
        "                              [Paystack API]                                             \n"
        "                                    |                                                    \n"
        "                          (Charge Succeeded)                                             \n"
        "                                    v                                                    \n"
        " [Webhook Event] -----------> [5.2 Verify Webhook]                                       \n"
        "                                    |                                                    \n"
        "                     (HMAC-SHA512 Signature Valid?)                                      \n"
        "                             /             \\                                             \n"
        "                          [YES]           [NO]                                           \n"
        "                            |               |                                            \n"
        "                            v               v                                            \n"
        "                   [5.3 Update Status]    [Discard Event /                               \n"
        "                   to 'success' in D5     Return 400 Bad Request]                        \n"
        "                            |                                                            \n"
        "                            v                                                            \n"
        "                   [5.4 Trigger Receipt]                                                 \n"
        "                   Write Record to D6                                                    \n"
    )
    add_code_block(doc, dfd2_ascii)

    doc.add_heading("5.3 Sequence Diagram: Online Payment and Reconciliation Lifecycle", level=2)
    doc.add_paragraph(
        "The Sequence Diagram details the chronological message sequence exchanged between system components during an online fee payment."
    )

    seq_ascii = (
        "=========================================================================================\n"
        "                       UML SEQUENCE DIAGRAM: ONLINE PAYMENT LIFECYCLE                    \n"
        "=========================================================================================\n"
        " Parent         React Frontend       Paystack Modal      Edge Function       PostgreSQL  \n"
        "   |                  |                    |                   |                  |      \n"
        "   |--- 1. Pay Fees ->|                    |                   |                  |      \n"
        "   |                  |--- 2. Create Pending Payment Record --------------------->|      \n"
        "   |                  |<-- 3. Return Payment ID & Reference ----------------------|      \n"
        "   |                  |--- 4. Open Checkout(Key, Ref, Amount) |                  |      \n"
        "   |                  |------------------->|                   |                  |      \n"
        "   |<-- 5. Render Payment Options ---------|                   |                  |      \n"
        "   |--- 6. Authorize Payment (Card/USSD) ->|                   |                  |      \n"
        "   |                  |                    |--- 7. Process Tx  |                  |      \n"
        "   |                  |                    |--- 8. Send Webhook (Signature, Payload)----> \n"
        "   |                  |                    |                   |--- 9. Validate HMAC ---> \n"
        "   |                  |                    |                   |--- 10. Update Status 'success'\n"
        "   |                  |                    |                   |----------------->|      \n"
        "   |                  |                    |                   |--- 11. Insert Receipt ->|      \n"
        "   |                  |                    |                   |<-- 12. Commit Tx --------|      \n"
        "   |                  |<-- 13. OnClose / Callback Trigger -----|                  |      \n"
        "   |                  |--- 14. Query Updated Balance & Receipt ------------------>|      \n"
        "   |                  |<-- 15. Return Cleared Balance & Receipt Data -------------|      \n"
        "   |<-- 16. Display Success Alert & Download PDF Receipt ------|                  |      \n"
    )
    add_code_block(doc, seq_ascii)

    doc.add_heading("5.4 Class Diagram: Object-Oriented Domain Model", level=2)
    doc.add_paragraph(
        "The Class Diagram exhibits the object-oriented structure of the system, depicting domain classes, attributes, methods, "
        "and their structural multiplicities."
    )

    class_ascii = (
        "+-------------------------+             +-------------------------+                      \n"
        "|       UserProfile       |             |        Guardian         |                      \n"
        "+-------------------------+             +-------------------------+                      \n"
        "| - id: UUID              |             | - id: UUID              |                      \n"
        "| - full_name: String     |1           0..1 - profile_id: UUID    |                      \n"
        "| - role: UserRole        |<------------| - full_name: String     |                      \n"
        "| - phone: String         |             | - phone: String         |                      \n"
        "| - created_at: DateTime  |             | - email: String         |                      \n"
        "+-------------------------+             | - relationship: String  |                      \n"
        "| + login(): Boolean      |             +-------------------------+                      \n"
        "| + resetPassword(): Void |                          | 1                                 \n"
        "+-------------------------+                          |                                   \n"
        "                                                     | has warded                        \n"
        "                                                     v 1..*                              \n"
        "+-------------------------+             +-------------------------+                      \n"
        "|          Class          |             |         Student         |                      \n"
        "+-------------------------+             +-------------------------+                      \n"
        "| - id: UUID              |1           *| - id: UUID              |                      \n"
        "| - name: String          |<------------| - admission_no: String  |                      \n"
        "| - arm: String           |  enrolled in| - full_name: String     |                      \n"
        "+-------------------------+             | - class_id: UUID        |                      \n"
        "             | 1                        | - guardian_id: UUID     |                      \n"
        "             |                          | - status: StudentStatus |                      \n"
        "             | has fees                 +-------------------------+                      \n"
        "             v *                                     | 1                                 \n"
        "+-------------------------+                          |                                   \n"
        "|      FeeStructure       |                          | pays                              \n"
        "+-------------------------+                          v *                                 \n"
        "| - id: UUID              |             +-------------------------+                      \n"
        "| - class_id: UUID        |1           *|         Payment         |                      \n"
        "| - session_term_id: UUID |<------------| - id: UUID              |                      \n"
        "| - fee_item: String      | billed for  | - student_id: UUID      |                      \n"
        "| - amount: Decimal       |             | - fee_structure_id: UUID|                      \n"
        "| - is_compulsory: Boolean|             | - amount: Decimal       |                      \n"
        "+-------------------------+             | - method: PaymentMethod |                      \n"
        "                                        | - reference: String     |                      \n"
        "                                        | - status: PaymentStatus |                      \n"
        "                                        | - recorded_by: UUID     |                      \n"
        "                                        | - paid_at: DateTime     |                      \n"
        "                                        +-------------------------+                      \n"
        "                                                     | 1                                 \n"
        "                                                     | produces                          \n"
        "                                                     v 1                                 \n"
        "                                        +-------------------------+                      \n"
        "                                        |         Receipt         |                      \n"
        "                                        +-------------------------+                      \n"
        "                                        | - id: UUID              |                      \n"
        "                                        | - payment_id: UUID      |                      \n"
        "                                        | - receipt_no: String    |                      \n"
        "                                        | - pdf_url: String       |                      \n"
        "                                        | - issued_at: DateTime   |                      \n"
        "                                        +-------------------------+                      \n"
        "                                        | + generatePDF(): Blob   |                      \n"
        "                                        | + verifyReceipt(): Bool |                      \n"
        "                                        +-------------------------+                      \n"
    )
    add_code_block(doc, class_ascii)

    doc.add_page_break()

    # ==========================================
    # SECTION 6: DATABASE DESIGN & ARCHITECTURE
    # ==========================================
    h6 = doc.add_heading("SECTION 6: DATABASE DESIGN & ARCHITECTURE", level=1)
    h6.runs[0].font.color.rgb = RGBColor(30, 58, 138)

    doc.add_heading("6.1 Entity-Relationship Diagram (ERD)", level=2)
    doc.add_paragraph(
        "The relational database schema is normalized to Third Normal Form (3NF), eliminating transitive and partial dependencies "
        "while ensuring referential integrity through foreign key constraints and cascade actions."
    )

    erd_ascii = (
        "+--------------------+            +-------------------+            +-------------------+\n"
        "|     PROFILES       |            |     CLASSES       |            |   SESSION_TERMS   |\n"
        "+--------------------+            +-------------------+            +-------------------+\n"
        "| PK  id (UUID)      |            | PK  id (UUID)     |            | PK  id (UUID)     |\n"
        "|     full_name      |            |     name          |            |     session       |\n"
        "|     role           |            |     arm           |            |     term          |\n"
        "|     phone          |            +-------------------+            |     is_current    |\n"
        "+--------------------+                     | 1                     +-------------------+\n"
        "         | 1                               |                                 | 1        \n"
        "         |                                 |                                 |          \n"
        "         | 0..1                            v *                               v *        \n"
        "+--------------------+            +-------------------+            +-------------------+\n"
        "|    GUARDIANS       |            |     STUDENTS      |            |  FEE_STRUCTURES   |\n"
        "+--------------------+            +-------------------+            +-------------------+\n"
        "| PK  id (UUID)      |1          *| PK  id (UUID)     |            | PK  id (UUID)     |\n"
        "| FK  profile_id     |----------->|     admission_no  |            | FK  class_id      |\n"
        "|     full_name      |            |     full_name     |            | FK  session_term_id\n"
        "|     phone          |            | FK  class_id      |            |     fee_item      |\n"
        "|     email          |            | FK  guardian_id   |            |     amount        |\n"
        "|     relationship   |            |     status        |            |     is_compulsory |\n"
        "+--------------------+            +-------------------+            +-------------------+\n"
        "                                           | 1                               | 1        \n"
        "                                           |                                 |          \n"
        "                                           v *                               v *        \n"
        "                                  +----------------------------------------------------+ \n"
        "                                  |                      PAYMENTS                      | \n"
        "                                  +----------------------------------------------------+ \n"
        "                                  | PK  id (UUID)                                      | \n"
        "                                  | FK  student_id (REFERENCES students)               | \n"
        "                                  | FK  fee_structure_id (REFERENCES fee_structures)   | \n"
        "                                  |     amount (NUMERIC, CHECK > 0)                    | \n"
        "                                  |     method ('paystack','cash','bank_transfer')     | \n"
        "                                  |     reference (TEXT UNIQUE)                        | \n"
        "                                  |     status ('pending','success','failed')          | \n"
        "                                  | FK  recorded_by (REFERENCES profiles)             | \n"
        "                                  |     paid_at (TIMESTAMPTZ)                          | \n"
        "                                  +----------------------------------------------------+ \n"
        "                                                           | 1                          \n"
        "                                                           | generates                  \n"
        "                                                           v 1                          \n"
        "                                  +----------------------------------------------------+ \n"
        "                                  |                      RECEIPTS                      | \n"
        "                                  +----------------------------------------------------+ \n"
        "                                  | PK  id (UUID)                                      | \n"
        "                                  | FK  payment_id (REFERENCES payments UNIQUE)        | \n"
        "                                  |     receipt_no (TEXT UNIQUE)                       | \n"
        "                                  |     pdf_url (TEXT)                                 | \n"
        "                                  |     issued_at (TIMESTAMPTZ)                        | \n"
        "                                  +----------------------------------------------------+ \n"
    )
    add_code_block(doc, erd_ascii)

    doc.add_heading("6.2 Relational Database Schema (SQL DDL Definition)", level=2)
    doc.add_paragraph(
        "The following SQL script defines the complete schema, foreign key relations, constraints, and Row Level Security (RLS) "
        "policies implemented on PostgreSQL via Supabase:"
    )

    sql_ddl = (
        "-- PostgreSQL Schema for Smart School Fees System\n"
        "-- Institution: Solid Foundation Comprehensive High School\n"
        "\n"
        "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\n"
        "\n"
        "-- 1. Profiles Table\n"
        "CREATE TABLE profiles (\n"
        "    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,\n"
        "    full_name TEXT NOT NULL,\n"
        "    role TEXT NOT NULL CHECK (role IN ('super_admin','bursar','parent','student')),\n"
        "    phone TEXT,\n"
        "    created_at TIMESTAMPTZ DEFAULT NOW()\n"
        ");\n"
        "\n"
        "-- 2. Classes Table\n"
        "CREATE TABLE classes (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    name TEXT NOT NULL,\n"
        "    arm TEXT,\n"
        "    created_at TIMESTAMPTZ DEFAULT NOW()\n"
        ");\n"
        "\n"
        "-- 3. Sessions & Terms Table\n"
        "CREATE TABLE session_terms (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    session TEXT NOT NULL,\n"
        "    term TEXT NOT NULL CHECK (term IN ('First','Second','Third')),\n"
        "    is_current BOOLEAN DEFAULT FALSE,\n"
        "    created_at TIMESTAMPTZ DEFAULT NOW()\n"
        ");\n"
        "\n"
        "-- 4. Guardians Table\n"
        "CREATE TABLE guardians (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,\n"
        "    full_name TEXT NOT NULL,\n"
        "    phone TEXT,\n"
        "    email TEXT,\n"
        "    relationship TEXT,\n"
        "    created_at TIMESTAMPTZ DEFAULT NOW()\n"
        ");\n"
        "\n"
        "-- 5. Students Table\n"
        "CREATE TABLE students (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    admission_no TEXT UNIQUE NOT NULL,\n"
        "    full_name TEXT NOT NULL,\n"
        "    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,\n"
        "    guardian_id UUID REFERENCES guardians(id) ON DELETE SET NULL,\n"
        "    status TEXT DEFAULT 'active' CHECK (status IN ('active','graduated','withdrawn')),\n"
        "    photo_url TEXT,\n"
        "    created_at TIMESTAMPTZ DEFAULT NOW()\n"
        ");\n"
        "\n"
        "-- 6. Fee Structures Table\n"
        "CREATE TABLE fee_structures (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,\n"
        "    session_term_id UUID REFERENCES session_terms(id) ON DELETE CASCADE,\n"
        "    fee_item TEXT NOT NULL,\n"
        "    amount NUMERIC NOT NULL CHECK (amount >= 0),\n"
        "    is_compulsory BOOLEAN DEFAULT TRUE,\n"
        "    created_at TIMESTAMPTZ DEFAULT NOW()\n"
        ");\n"
        "\n"
        "-- 7. Payments Table\n"
        "CREATE TABLE payments (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    student_id UUID REFERENCES students(id) ON DELETE CASCADE,\n"
        "    fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,\n"
        "    amount NUMERIC NOT NULL CHECK (amount > 0),\n"
        "    method TEXT CHECK (method IN ('paystack','cash','bank_transfer')),\n"
        "    reference TEXT UNIQUE NOT NULL,\n"
        "    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),\n"
        "    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,\n"
        "    paid_at TIMESTAMPTZ DEFAULT NOW()\n"
        ");\n"
        "\n"
        "-- 8. Receipts Table\n"
        "CREATE TABLE receipts (\n"
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,\n"
        "    receipt_no TEXT UNIQUE NOT NULL,\n"
        "    pdf_url TEXT,\n"
        "    issued_at TIMESTAMPTZ DEFAULT NOW()\n"
        ");\n"
    )
    add_code_block(doc, sql_ddl)

    doc.add_heading("6.3 Comprehensive Data Dictionary", level=2)
    doc.add_paragraph(
        "The Data Dictionary defines the structure, data types, nullability, keys, default values, and business rules for every "
        "attribute across the database tables."
    )

    dict_tables = [
        ("Table 1: PROFILES (User Profiles extending auth.users)", [
            ("id", "UUID", "PK, FK", "NO", "None", "Unique identifier referencing Supabase auth.users(id)."),
            ("full_name", "TEXT", "None", "NO", "None", "Legal full name of the user (Staff, Bursar, or Parent)."),
            ("role", "TEXT", "CHECK", "NO", "None", "Access role: ('super_admin','bursar','parent','student')."),
            ("phone", "TEXT", "None", "YES", "NULL", "Contact mobile telephone number."),
            ("created_at", "TIMESTAMPTZ", "None", "NO", "NOW()", "System timestamp when profile was created.")
        ]),
        ("Table 2: CLASSES (Academic Class Categories)", [
            ("id", "UUID", "PK", "NO", "gen_random_uuid()", "Unique primary key."),
            ("name", "TEXT", "None", "NO", "None", "Class standard name (e.g., 'JSS1', 'SS2')."),
            ("arm", "TEXT", "None", "YES", "NULL", "Subdivision arm identifier (e.g., 'A', 'B', 'Science')."),
            ("created_at", "TIMESTAMPTZ", "None", "NO", "NOW()", "Creation timestamp.")
        ]),
        ("Table 3: SESSION_TERMS (Academic Sessions and Terms)", [
            ("id", "UUID", "PK", "NO", "gen_random_uuid()", "Unique primary key."),
            ("session", "TEXT", "None", "NO", "None", "Academic calendar year (e.g., '2025/2026')."),
            ("term", "TEXT", "CHECK", "NO", "None", "Academic term: ('First', 'Second', 'Third')."),
            ("is_current", "BOOLEAN", "None", "NO", "FALSE", "Flag marking the currently active operational term."),
            ("created_at", "TIMESTAMPTZ", "None", "NO", "NOW()", "Creation timestamp.")
        ]),
        ("Table 4: GUARDIANS (Parent & Guardian Records)", [
            ("id", "UUID", "PK", "NO", "gen_random_uuid()", "Unique primary key."),
            ("profile_id", "UUID", "FK", "YES", "NULL", "References profiles(id) when parent creates a login."),
            ("full_name", "TEXT", "None", "NO", "None", "Full name of parent or legal guardian."),
            ("phone", "TEXT", "None", "YES", "NULL", "Primary phone contact for SMS alerts."),
            ("email", "TEXT", "None", "YES", "NULL", "Email address for digital receipt delivery."),
            ("relationship", "TEXT", "None", "YES", "NULL", "Relationship to ward ('Father', 'Mother', 'Sponsor')."),
            ("created_at", "TIMESTAMPTZ", "None", "NO", "NOW()", "Creation timestamp.")
        ]),
        ("Table 5: STUDENTS (Student Bio-Data and Enrollment)", [
            ("id", "UUID", "PK", "NO", "gen_random_uuid()", "Unique primary key."),
            ("admission_no", "TEXT", "UNIQUE", "NO", "None", "Institutional matriculation number (e.g., 'SFHS/2024/0142')."),
            ("full_name", "TEXT", "None", "NO", "None", "Full legal name of the student."),
            ("class_id", "UUID", "FK", "YES", "NULL", "References classes(id); current class of enrollment."),
            ("guardian_id", "UUID", "FK", "YES", "NULL", "References guardians(id); parent responsible for fees."),
            ("status", "TEXT", "CHECK", "NO", "'active'", "Status: ('active', 'graduated', 'withdrawn')."),
            ("photo_url", "TEXT", "None", "YES", "NULL", "URL path to passport photograph in cloud storage."),
            ("created_at", "TIMESTAMPTZ", "None", "NO", "NOW()", "Creation timestamp.")
        ]),
        ("Table 6: FEE_STRUCTURES (Itemized Fee Configuration)", [
            ("id", "UUID", "PK", "NO", "gen_random_uuid()", "Unique primary key."),
            ("class_id", "UUID", "FK", "NO", "None", "References classes(id); target class for this fee."),
            ("session_term_id", "UUID", "FK", "NO", "None", "References session_terms(id); applicable term."),
            ("fee_item", "TEXT", "None", "NO", "None", "Fee title: ('Tuition', 'PTA Levy', 'Exam Fee')."),
            ("amount", "NUMERIC", "CHECK", "NO", "None", "Cost in Naira (₦); must satisfy amount >= 0."),
            ("is_compulsory", "BOOLEAN", "None", "NO", "TRUE", "True if fee is mandatory for examination clearance."),
            ("created_at", "TIMESTAMPTZ", "None", "NO", "NOW()", "Creation timestamp.")
        ]),
        ("Table 7: PAYMENTS (Transaction Ledger)", [
            ("id", "UUID", "PK", "NO", "gen_random_uuid()", "Unique primary key."),
            ("student_id", "UUID", "FK", "NO", "None", "References students(id); student billed."),
            ("fee_structure_id", "UUID", "FK", "YES", "NULL", "References fee_structures(id); itemized component."),
            ("amount", "NUMERIC", "CHECK", "NO", "None", "Amount paid in Naira (₦); must satisfy amount > 0."),
            ("method", "TEXT", "CHECK", "NO", "None", "Payment channel: ('paystack', 'cash', 'bank_transfer')."),
            ("reference", "TEXT", "UNIQUE", "NO", "None", "Unique transaction reference (Paystack ref or Bank teller)."),
            ("status", "TEXT", "CHECK", "NO", "'pending'", "Clearing status: ('pending', 'success', 'failed')."),
            ("recorded_by", "UUID", "FK", "YES", "NULL", "References profiles(id); staff member who logged payment."),
            ("paid_at", "TIMESTAMPTZ", "None", "NO", "NOW()", "Timestamp when payment was executed.")
        ]),
        ("Table 8: RECEIPTS (Digital Issued Receipts)", [
            ("id", "UUID", "PK", "NO", "gen_random_uuid()", "Unique primary key."),
            ("payment_id", "UUID", "FK, UNIQUE", "NO", "None", "References payments(id) [1:1 relationship]."),
            ("receipt_no", "TEXT", "UNIQUE", "NO", "None", "Unique human-readable receipt number (e.g. 'REC-2026-0042')."),
            ("pdf_url", "TEXT", "None", "YES", "NULL", "Cloud storage URL path to compiled PDF document."),
            ("issued_at", "TIMESTAMPTZ", "None", "NO", "NOW()", "Timestamp when receipt was generated.")
        ])
    ]

    for t_name, fields in dict_tables:
        doc.add_heading(t_name, level=3)
        dt = doc.add_table(rows=len(fields)+1, cols=6)
        set_cell_text(dt.cell(0, 0), "Field Name", bold=True, color_rgb=RGBColor(255, 255, 255))
        set_cell_text(dt.cell(0, 1), "Data Type", bold=True, color_rgb=RGBColor(255, 255, 255))
        set_cell_text(dt.cell(0, 2), "Keys/Const.", bold=True, color_rgb=RGBColor(255, 255, 255))
        set_cell_text(dt.cell(0, 3), "Null?", bold=True, color_rgb=RGBColor(255, 255, 255))
        set_cell_text(dt.cell(0, 4), "Default", bold=True, color_rgb=RGBColor(255, 255, 255))
        set_cell_text(dt.cell(0, 5), "Description & Business Rules", bold=True, color_rgb=RGBColor(255, 255, 255))
        for f_idx, (fn, fdt, fkc, fnul, fdef, fdesc) in enumerate(fields):
            set_cell_text(dt.cell(f_idx+1, 0), fn, bold=True, color_rgb=RGBColor(30, 58, 138))
            set_cell_text(dt.cell(f_idx+1, 1), fdt)
            set_cell_text(dt.cell(f_idx+1, 2), fkc)
            set_cell_text(dt.cell(f_idx+1, 3), fnul)
            set_cell_text(dt.cell(f_idx+1, 4), fdef)
            set_cell_text(dt.cell(f_idx+1, 5), fdesc)
        style_table(dt, col_widths=[1.1, 0.9, 0.9, 0.6, 0.9, 2.1])
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_page_break()

    # ==========================================
    # SECTION 7: SYSTEM ARCHITECTURE
    # ==========================================
    h7 = doc.add_heading("SECTION 7: SYSTEM ARCHITECTURE & DEPLOYMENT", level=1)
    h7.runs[0].font.color.rgb = RGBColor(30, 58, 138)

    doc.add_heading("7.1 Architectural Pattern: Three-Tier Architecture", level=2)
    doc.add_paragraph(
        "The Smart School Fees System is built on an enterprise-grade **Three-Tier Architectural Model**, separating the "
        "User Presentation, Business Logic/Application, and Data Persistence layers. This separation of concerns ensures "
        "high scalability, independent maintainability, zero-trust security boundaries, and low infrastructure overhead."
    )

    arch_ascii = (
        "+---------------------------------------------------------------------------------------+\n"
        "|                       TIER 1: PRESENTATION LAYER (CLIENT DEVICE)                      |\n"
        "|   React 18  *  TypeScript  *  Vite  *  Tailwind CSS  *  Lucide Icons  *  Paystack Inline |\n"
        "|   [Admin Dashboard]       [Bursar Portal]       [Parent Mobile UI]     [Receipt PDF]  |\n"
        "+---------------------------------------------------------------------------------------+\n"
        "                                           |                                             \n"
        "                                           | HTTPS / TLS 1.3 Encryption                  \n"
        "                                           | REST & Realtime WebSockets                  \n"
        "                                           v                                             \n"
        "+---------------------------------------------------------------------------------------+\n"
        "|                       TIER 2: APPLICATION & LOGIC LAYER (SERVERLESS)                  |\n"
        "|   - Supabase Auth Service (JSON Web Tokens [JWT], PBKDF2/Argon2 Password Hashing)     |\n"
        "|   - Supabase Edge Functions (Deno / TypeScript Runtime)                               |\n"
        "|       * Webhook Listener: HMAC-SHA512 Signature Verification                          |\n"
        "|       * Payment Status State Machine ('pending' -> 'success' | 'failed')              |\n"
        "|       * Receipt Number Sequencing & Storage Dispatcher                                |\n"
        "|   - Paystack External Payment Engine (Cards, USSD, Virtual Bank Transfer)             |\n"
        "+---------------------------------------------------------------------------------------+\n"
        "                                           |                                             \n"
        "                                           | Internal Postgres Wire Protocol             \n"
        "                                           | ACID Transactions                           \n"
        "                                           v                                             \n"
        "+---------------------------------------------------------------------------------------+\n"
        "|                       TIER 3: DATA PERSISTENCE LAYER (DATABASE)                       |\n"
        "|   - Supabase Managed PostgreSQL Relational Engine                                      |\n"
        "|   - Kernel-Level Row Level Security (RLS) Engine                                      |\n"
        "|   - Encrypted Cloud Storage Buckets (Digital Receipt PDFs & Student Photos)            |\n"
        "|   - Automated Hourly Snapshots & Point-in-Time Recovery (PITR)                        |\n"
        "+---------------------------------------------------------------------------------------+\n"
    )
    add_code_block(doc, arch_ascii)

    doc.add_heading("7.2 Detailed Layer Analysis", level=2)
    layers = [
        ("Presentation Layer (Client Tier):",
         "Constructed with React 18 and Vite for near-instant rendering and rapid state updates. TypeScript guarantees compile-time "
         "type safety across models. Tailwind CSS delivers a modern, responsive user experience optimized for both mobile smartphones "
         "(used by parents) and high-density desktop displays (used by bursars). The Paystack Inline JS SDK facilitates seamless modal "
         "checkout without requiring the parent to abandon the application page."),
        ("Application Layer (Logic Tier):",
         "Implemented serverlessly via Supabase Auth and Supabase Edge Functions running on Deno. Authentication relies on cryptographically "
         "signed JSON Web Tokens (JWT). The webhook listener validates Paystack's incoming `x-paystack-signature` using the institution's secret "
         "key and an HMAC-SHA512 algorithm, completely preventing client-side spoofing."),
        ("Data Layer (Persistence Tier):",
         "Powered by a cloud-hosted PostgreSQL database. Data segregation is enforced at the database engine level via PostgreSQL Row Level "
         "Security (RLS). Even if a malicious client constructs an arbitrary SQL query, the database kernel strictly filters records based "
         "on the caller's verified `auth.uid()` and assigned role. Generated receipts are stored in Supabase Cloud Storage.")
    ]
    for title, desc in layers:
        p = doc.add_paragraph()
        r = p.add_run(f"• {title} ")
        r.bold = True
        r.font.color.rgb = RGBColor(30, 58, 138)
        p.add_run(desc)

    doc.add_heading("7.3 Security Architecture and Threat Mitigation", level=2)
    
    sec_table = doc.add_table(rows=6, cols=3)
    set_cell_text(sec_table.cell(0, 0), "Threat / Attack Vector", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(sec_table.cell(0, 1), "Risk Impact", bold=True, color_rgb=RGBColor(255, 255, 255))
    set_cell_text(sec_table.cell(0, 2), "Architectural Mitigation Mechanism", bold=True, color_rgb=RGBColor(255, 255, 255))
    
    sec_data = [
        ("Client-Side Payment Spoofing", "Malicious user manipulates HTTP response to fake a successful payment without transferring funds.",
         "Zero-Trust model: Client cannot alter `payments.status`. Only the server-side Edge Function verifies Paystack's webhook signature before marking status as 'success'."),
        ("Unauthorized Cross-Tenant Data Access", "Parent snooping on other students' financial or personal records.",
         "PostgreSQL Row Level Security (RLS) dynamically filters rows so parents can only access rows where `guardian_id` matches their authenticated profile."),
        ("Credential Interception / Man-in-the-Middle", "Eavesdropping on login credentials or payment tokens in transit.",
         "Strict HTTPS enforcement with TLS 1.3 encryption for all client-to-cloud communications."),
        ("SQL Injection Vulnerabilities", "Injection of malicious SQL payload to dump or destroy tables.",
         "Parameterized queries natively handled by the Supabase PostgREST client and ORM layer, eliminating raw query concatenation."),
        ("Secret Key Compromise", "Exposure of Paystack Secret Key enabling unauthorized merchant actions.",
         "Paystack Secret Key is stored strictly in serverless environment variables (`SUPABASE_EDGE_ENV`), never bundled into frontend JavaScript.")
    ]
    for idx, (th, rsk, mit) in enumerate(sec_data):
        set_cell_text(sec_table.cell(idx+1, 0), th, bold=True, color_rgb=RGBColor(30, 58, 138))
        set_cell_text(sec_table.cell(idx+1, 1), rsk)
        set_cell_text(sec_table.cell(idx+1, 2), mit)
    style_table(sec_table, col_widths=[1.8, 2.3, 2.4])

    doc.add_heading("7.4 Deployment Architecture and Hosting Specifications", level=2)
    doc.add_paragraph(
        "The system employs a cloud-native, serverless deployment topology designed to eliminate on-premise hardware costs "
        "and maintenance overhead for Solid Foundation Comprehensive High School:"
    )

    dep_specs = [
        ("Frontend Hosting:", "Static distribution on Vercel or Netlify Edge CDN with automatic CI/CD deployment from GitHub. Global CDN caching ensures sub-second page delivery across Nigeria."),
        ("Backend & Database Hosting:", "Managed Supabase Project hosting the PostgreSQL relational database, Auth engine, and S3-compatible cloud storage buckets for receipt PDFs."),
        ("Serverless Webhook Execution:", "Supabase Edge Functions deployed on Deno globally distributed edge runtimes, scaling automatically to handle traffic spikes during school resumption weeks."),
        ("Payment Processing Gateway:", "Paystack Payments Limited (licensed by the Central Bank of Nigeria) handling PCI-DSS Level 1 compliant payment routing.")
    ]
    for title, desc in dep_specs:
        p = doc.add_paragraph()
        r = p.add_run(f"• {title} ")
        r.bold = True
        r.font.color.rgb = RGBColor(30, 58, 138)
        p.add_run(desc)

    doc.add_heading("7.5 Conclusion and Academic Summary", level=2)
    doc.add_paragraph(
        "The Smart School Fees System successfully addresses the systemic inefficiencies, reconciliation delays, fraud vulnerabilities, "
        "and lack of transparency inherent in the existing manual paper-based fee collection workflow at Solid Foundation Comprehensive High School. "
        "By synthesizing an Agile development methodology, robust UML and DFD models, a normalized PostgreSQL relational schema protected "
        "by kernel-level Row Level Security, and an event-driven three-tier architecture with Paystack integration, the project delivers "
        "a reliable, secure, and production-grade software solution suitable for academic presentation and real-world institutional deployment."
    )

    # Save document
    doc.save(output_path)
    print(f"Document successfully created and saved at: {output_path}")

if __name__ == "__main__":
    out_file = os.path.abspath("Smart_School_Fees_System_Final_Year_Project_Documentation.docx")
    create_full_document(out_file)
