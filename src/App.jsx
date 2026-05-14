import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadDoc, saveDoc } from './firebase.js';


const ADMIN_PIN = "marjie";
const SK_LINKS   = "links";
const SK_CHECKS  = "checks";
const SK_CUSTOM  = "custom";

const SEED_ROWS = [
  { id:"1.1",  table:"both", phase:"Phase 1 — Professional Regulation & Ethics",             law:"RA 9646 + IRR",                                      tags:["both","hy"], group:"REB: General/Fundamentals · REA: Fundamentals",                     guide:"Definitions of all practitioners (broker, appraiser, assessor, consultant, salesperson); scope of practice per profession; licensing requirements; prohibited acts and penalties; salesperson accreditation; grounds for suspension or revocation" },
  { id:"1.2",  table:"both", phase:"Phase 1 — Professional Regulation & Ethics",             law:"Code of Ethics + RA 6713",                           tags:["both","hy"], group:"REB: General/Fundamentals · REA: Fundamentals",                     guide:"Code of Conduct and Ethical Standards (RA 6713); RESA Code of Ethics; fiduciary duty; professional responsibility; conflict of interest; prohibited acts and sanctions; for REA: PVS ethical standards, IVS ethical framework, DTI National Code of Ethics" },
  { id:"2.1",  table:"both", phase:"Phase 2 — Land Ownership Framework",                    law:"1987 Constitution Art. XII",                         tags:["both"],     group:"REB: General/Fundamentals · REA: Land Mgmt & Real Property Laws",  guide:"National Economy and Patrimony — who can own land; foreign ownership restrictions; nationalization rules; basis for all subsequent land ownership legislation" },
  { id:"2.2",  table:"both", phase:"Phase 2 — Land Ownership Framework",                    law:"CA 141 — Public Land Act",                           tags:["both","hy"], group:"REB: General/Fundamentals · REA: Land Mgmt & Real Property Laws",  guide:"Alienable and disposable (A&D) lands defined; modes of acquiring public land: homestead, free patent, sale, lease; judicial confirmation of imperfect title; DENR authority" },
  { id:"2.3",  table:"both", phase:"Phase 2 — Land Ownership Framework",                    law:"PD 705 — Revised Forestry Code",                     tags:["both","hy"], group:"REB: General/Fundamentals · REA: Land Mgmt & Real Property Laws",  guide:"Forest land vs. A&D land; DENR as sole classification authority; forest land can NEVER be titled or acquired by prescription; timberland not subject to private ownership" },
  { id:"2.4",  table:"both", phase:"Phase 2 — Land Ownership Framework",                    law:"Civil Code — Property & Ownership",                  tags:["both"],     group:"REB: General/Fundamentals · REA: Fundamentals",                     guide:"Movable vs. immovable property; modes of acquiring ownership (occupation, accession, prescription); kinds of property; accessory vs. principal" },
  { id:"3.1",  table:"both", phase:"Phase 3 — Land Titling — Torrens System",               law:"PD 1529 — Property Registration Decree",             tags:["both","hy"], group:"REB: Special & Technical · REA: Land Mgmt & Real Property Laws",   guide:"Mirror principle, curtain principle, indefeasibility (after 1 year); original vs. subsequent registration; adverse claim; lis pendens; reconstitution of lost/destroyed title" },
  { id:"3.2",  table:"both", phase:"Phase 3 — Land Titling — Torrens System",               law:"RA 10023 (2010) — Residential Free Patent Act",                  tags:["both"],     group:"REB: General/Fundamentals · REA: Land Mgmt & Real Property Laws",  guide:"Simplified titling for residential lands occupied for at least 10 years; free patent process and requirements; open to Filipino citizens; basis of title for properties without original Torrens registration; administered by DENR" },
  { id:"3.3",  table:"both", phase:"Phase 3 — Land Titling — Torrens System",               law:"RA 4729 (1966) — Land Surveyors Act",                tags:["both"],     group:"REB: General/Fundamentals · REA: Land Mgmt & Real Property Laws",  guide:"Registration and licensing of land surveyors; authority to conduct cadastral and survey work; qualifications and prohibited acts; relevance to property boundary disputes and lot area verification in appraisal" },
  { id:"3.4",  table:"both", phase:"Phase 3 — Land Titling — Torrens System",               law:"Civil Code Arts. 434–477 — Boundaries & Ownership",  tags:["both"],     group:"REB: Special & Technical · REA: Land Mgmt & Real Property Laws",  guide:"Governs property boundaries, accretion, alluvion, avulsion; rights of adjoining owners; encroachment and boundary disputes; rules on island formation; lot identification and boundary issues in appraisal" },
  { id:"4.1",  table:"both", phase:"Phase 4 — Real Estate Development Laws",                law:"PD 957 — Subdivision & Condo Buyers' Decree",        tags:["both","hy"], group:"REB: Special & Technical · REA: Land Mgmt & Real Property Laws",   guide:"License to Sell (LTS) requirements; consequences of selling without LTS; buyer rights and developer obligations; registration of projects; DHSUD oversight; penal provisions" },
  { id:"4.2",  table:"both", phase:"Phase 4 — Real Estate Development Laws",                law:"BP 220 — Economic & Socialized Housing",             tags:["both"],     group:"REB: Special & Technical · REA: Land Mgmt & Real Property Laws",   guide:"Minimum lot and floor area standards; difference between economic and socialized housing specifications; used as reference data in appraisals and project planning" },
  { id:"4.3",  table:"both", phase:"Phase 4 — Real Estate Development Laws",                law:"RA 4726 — Condominium Act",                          tags:["both"],     group:"REB: Special & Technical · REA: Land Mgmt & Real Property Laws",   guide:"Master deed, project, unit, common areas; condominium corporation governance; unit ownership and transfer; 40% foreign ownership cap" },
  { id:"4.4",  table:"both", phase:"Phase 4 — Real Estate Development Laws",                law:"RA 11201 — DHSUD Law",                               tags:["both"],     group:"REB: Special & Technical · REA: Land Mgmt & Real Property Laws",   guide:"Creation of DHSUD replacing HLURB; regulatory authority over subdivision and condominium development; permits and approvals affecting feasibility and value" },
  { id:"5.1",  table:"both", phase:"Phase 5 — Agrarian, Indigenous & Protected Land Laws",  law:"RA 6657 + RA 9700 — CARL & CARPER",                 tags:["both","hy"], group:"REB: General/RE Laws & Taxation · REA: Land Mgmt & Real Property Laws", guide:"Agricultural land coverage and exclusions; retention limits; farmer-beneficiary rights; restrictions on transfer and sale; for REA: LBP valuation formula under CARP" },
  { id:"5.2",  table:"both", phase:"Phase 5 — Agrarian, Indigenous & Protected Land Laws",  law:"RA 8371 — IPRA",                                    tags:["both"],     group:"REA: Land Mgmt & Real Property Laws",                               guide:"Ancestral domain vs. ancestral land; native title; FPIC; cannot be transacted or appraised under standard market assumptions" },
  { id:"5.3",  table:"both", phase:"Phase 5 — Agrarian, Indigenous & Protected Land Laws",  law:"RA 7586 + RA 11038 — NIPAS & ENIPAS",               tags:["both"],     group:"REA: Land Mgmt & Real Property Laws",                               guide:"Protected area classifications; restrictions on land use and development; status must be confirmed before any transaction or appraisal" },
  { id:"5.4",  table:"both", phase:"Phase 5 — Agrarian, Indigenous & Protected Land Laws",  law:"PD 1067 — Water Code",                               tags:["both"],     group:"REA: Land Mgmt & Real Property Laws",                               guide:"State ownership of all waters; easements — 3m (creek/canal), 20m (river urban), 40m (river agricultural/forest); riparian rights; easement strips deducted in area computation" },
  { id:"5.5",  table:"both", phase:"Phase 5 — Agrarian, Indigenous & Protected Land Laws",  law:"RA 7942 — Philippine Mining Act",                    tags:["both"],     group:"REA: Land Mgmt & Real Property Laws",                               guide:"Mineral resources owned by the State; surface rights vs. mineral rights; mineral lands not subject to private ownership" },
  { id:"5.6",  table:"both", phase:"Phase 5 — Agrarian, Indigenous & Protected Land Laws",  law:"PD 1586 — EIS System",                               tags:["both"],     group:"REB: Special & Technical · REA: Land Mgmt & Real Property Laws",   guide:"Environmentally critical areas (ECAs) and projects (ECPs); when ECC is required; environmental compliance affects development feasibility and property value" },
  { id:"6.1",  table:"both", phase:"Phase 6 — Housing, Land Use & Urban-Rural Planning",    law:"RA 7279 — UDHA",                                    tags:["both","hy"], group:"REB: Special & Technical · REA: Land Mgmt & Real Property Laws",   guide:"20% balanced housing requirement for developers; socialized housing programs; eviction and demolition rules; community mortgage program; for REA: affects just compensation valuation" },
  { id:"6.2",  table:"both", phase:"Phase 6 — Housing, Land Use & Urban-Rural Planning",    law:"CLUP / Zoning / Urban & Land Use Planning",          tags:["both"],     group:"REB: Professional Practice · REA: Land Mgmt & Real Property Laws",  guide:"Comprehensive Land Use Plan (CLUP); urban and rural land use classifications; zoning; LGU zoning authority under RA 7160; zoning directly determines HBU" },
  { id:"6.3",  table:"both", phase:"Phase 6 — Housing, Land Use & Urban-Rural Planning",    law:"RA 10752 — Right-of-Way Act",                        tags:["both"],     group:"REA: Land Mgmt & Real Property Laws",                               guide:"ROW acquisition for national government infrastructure; just compensation formula; negotiated sale and expropriation process" },
  { id:"7.1",  table:"both", phase:"Phase 7 — Taxation",                                    law:"RA 7160 — Local Government Code",                    tags:["both","hy"], group:"REB: General/RE Laws & Taxation · REA: Govt Assessment & Taxation",  guide:"RPT: AV = Market Value x Assessment Level; RPT = AV x Tax Rate; assessment levels per property classification; zonal vs. market vs. assessed value; tax exemptions; protest and refund; for REA: SMV and mass appraisal principles" },
  { id:"7.2",  table:"both", phase:"Phase 7 — Taxation",                                    law:"NIRC — National Internal Revenue Code (RA 8424)",    tags:["both","hy"], group:"REB: General/RE Laws & Taxation · REA: Govt Assessment & Taxation",  guide:"CGT (6% of GSP or zonal value, whichever is higher); DST; VAT on real estate; dealers vs. non-dealers; for REA: BIR zonal value as floor value in appraisal" },
  { id:"7.3",  table:"both", phase:"Phase 7 — Taxation",                                    law:"RA 10963 — TRAIN Law",                               tags:["both"],     group:"REB: General/RE Laws & Taxation · REA: Govt Assessment & Taxation",  guide:"Estate tax updated to 6% flat rate; donor's tax updates; VAT threshold changes; updated rates affect transaction costs and value conclusions" },
  { id:"8.1",  table:"both", phase:"Phase 8 — Real Estate Finance & Economics",              law:"Real Estate Finance & Economics",                    tags:["both","hy"], group:"REB: Professional Practice · REA: Fundamentals",                    guide:"Time value of money; interest computation and amortization; mortgage types (conventional, Pag-IBIG, SSS, GSIS); real estate market cycles; supply and demand as value drivers; for REA: DCF and income approach financing adjustments" },
  { id:"9.1",  table:"both", phase:"Phase 9 — Land Management System",                      law:"Land Management System",                             tags:["both"],     group:"REB: General/Fundamentals · REA: Land Mgmt & Real Property Laws",  guide:"DENR land classification system; cadastral survey process; LRA and Registry of Deeds functions; land records management; tax mapping and assessment rolls; LGU land records roles" },
  { id:"9.2",  table:"both", phase:"Phase 9 — Land Management System",                      law:"DAO 2007-29 — Manual of Land Survey Procedures",     tags:["both"],     group:"REB: General/Fundamentals · REA: Land Mgmt & Real Property Laws",  guide:"DENR administrative order governing procedures for land surveys; cadastral, isolated, and subdivision surveys; survey plan requirements; LRA approval process; relevance to lot area verification and title preparation" },
  { id:"9.3",  table:"both", phase:"Phase 9 — Land Management System",                      law:"DAO 2016-07 — Guidelines on Surveys",                tags:["both"],     group:"REB: General/Fundamentals · REA: Land Mgmt & Real Property Laws",  guide:"Updated DENR guidelines on land survey procedures; digital cadastral database integration; electronic submission of survey returns; current standards for survey practice affecting land registration and appraisal" },
  { id:"9.4",  table:"both", phase:"Phase 9 — Land Management System",                      law:"DAO 98-12 — Revised Manual on Land Surveys",         tags:["both"],     group:"REB: General/Fundamentals · REA: Land Mgmt & Real Property Laws",  guide:"Revised manual on land survey procedures; technical standards for cadastral and isolated surveys; computation methods; bearing and distance requirements; basis for current survey practice standards" },
  { id:"9.5",  table:"rea",  phase:"Phase 9 — Land Management System",                      law:"RA 10926 — Philippine Valuation Standards Act",      tags:["rea","hy"], group:"REA: Land Mgmt & Real Property Laws",                               guide:"Mandates adoption of Philippine Valuation Standards (PVS) for all government and private appraisals; establishes PVS as the national standard; requires compliance by all licensed appraisers; basis for PVS 3rd Edition 2025 applicability" },
  { id:"10.1", table:"both", phase:"Phase 10 — Fundamentals of Real Estate Principles",     law:"Fundamentals of Real Estate Principles & Practices", tags:["both","hy"], group:"REB: General/Fundamentals · REA: Fundamentals",                    guide:"Economic principles: anticipation, substitution, conformity, contribution, progression, regression, supply and demand, competition, balance, change; for REB: pricing/transaction decisions; for REA: approach selection and value conclusion" },
  { id:"R11.1",table:"rea",  phase:"Phase 11 — Human & Physical Geography",                 law:"Human & Physical Geography",                         tags:["rea","hy"],  group:"Fundamentals of RE Appraisal",                                      guide:"Physical features: topography, soil type, drainage, climate, flood zones, slope; human factors: population distribution, accessibility, road networks, infrastructure, surrounding land use; applied in site description" },
  { id:"R12.1",table:"rea",  phase:"Phase 12 — Standards & Ethics — Appraiser Depth",       law:"PVS 3rd Ed. 2025",                                   tags:["rea","hy"],  group:"Fundamentals — Standards & Ethics",                                 guide:"PVS framework; bases of value (market value, investment value, fair value, liquidation value); scope of work; appraiser independence; contingent fee prohibition; limiting conditions; certification statement" },
  { id:"R12.2",table:"rea",  phase:"Phase 12 — Standards & Ethics — Appraiser Depth",       law:"International Valuation Standards (IVS)",            tags:["rea","hy"],  group:"Fundamentals — Standards & Ethics",                                 guide:"IVS general standards and asset standards; how IVS is adopted in PVS 3rd Edition; IVS vs. PVS differences; IVS definitions of market value, bases of value, and valuation approaches" },
  { id:"R12.3",table:"rea",  phase:"Phase 12 — Standards & Ethics — Appraiser Depth",       law:"DTI National Code of Ethics for Appraisers",         tags:["rea"], group:"Fundamentals — Standards & Ethics",                                 guide:"DTI-issued national code of ethics specific to appraisers; ethical standards; independence requirements; conflict of interest rules distinct from RESA ethics" },
  { id:"R13.1",table:"rea",  phase:"Phase 13 — Additional Real Property Laws",              law:"Family Code — Property Relations",                   tags:["rea"], group:"Land Mgmt & Real Property Laws",                                    guide:"Absolute community of property vs. conjugal partnership of gains; family home provisions; how marital property regime affects ownership rights; consent requirements in sale" },
  { id:"R13.2",table:"rea",  phase:"Phase 13 — Additional Real Property Laws",              law:"RA 9856 — REIT Law",                                 tags:["rea"], group:"Land Mgmt & Real Property Laws",                                    guide:"Real Estate Investment Trust framework; REIT fund structure; income-producing real estate as investment vehicle; independent appraisal requirement" },
  { id:"R13.3",table:"rea",  phase:"Phase 13 — Additional Real Property Laws",              law:"Manual on Real Property Appraisal & Assessment Ops", tags:["rea"], group:"Govt Assessment & Taxation",                                         guide:"BLGF manual governing LGU real property assessment; SMV preparation methodology; unit construction costs and depreciation tables; assessment levels per property classification" },
  { id:"R13.4",table:"rea",  phase:"Phase 13 — Additional Real Property Laws",              law:"Guide Book on Mass Appraisal",                       tags:["rea"], group:"Govt Assessment & Taxation",                                         guide:"Mass appraisal concept vs. individual appraisal; statistical measures (median, mean, coefficient of dispersion, price-related differential); CAMA; LGU general revision" },
  { id:"R13.5",table:"rea",  phase:"Phase 13 — Additional Real Property Laws",              law:"Other Laws Affecting Real Estate (6.11)",             tags:["rea","hy"], group:"Land Mgmt & Real Property Laws",                                    guide:"Catch-all coverage of all other laws that affect real estate appraisal practice: PD 1529 (Torrens), RA 10752 (ROW), Civil Code property provisions (Arts. 434-477), RA 4729 (Land Surveyors), RA 7586/11038 (NIPAS/ENIPAS), PD 1067 (Water Code), RA 7942 (Mining Act), PD 705 (Forestry Code), CA 141 (Public Land Act), and any new PRC-issued issuances; examinee must be familiar with how each law intersects with appraisal practice" },
  { id:"R14.1",table:"rea",  phase:"Phase 14 — Theories, Principles & Methodology",         law:"Theories & Principles in Appraisal",                 tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"Anticipation, substitution, conformity, contribution, progression, regression, supply and demand, balance, change — applied to approach selection and value adjustments" },
  { id:"R14.2",table:"rea",  phase:"Phase 14 — Theories, Principles & Methodology",         law:"Valuation Procedures & Research",                    tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"Scope of work determination; defining the appraisal problem; data gathering; market research process; identification of subject property and property rights; data verification" },
  { id:"R14.3",table:"rea",  phase:"Phase 14 — Theories, Principles & Methodology",         law:"Highest and Best Use (HBU)",                         tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"Four sequential tests: (1) legally permissible; (2) physically possible; (3) financially feasible; (4) maximally productive; analysis as vacant AND as improved" },
  { id:"R15.1",table:"rea",  phase:"Phase 15 — Three Appraisal Approaches",                 law:"Sales Comparison Approach",                          tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"Comparable sales selection; adjustment factors: location, time, physical characteristics, conditions of sale, financing terms; paired sales analysis; lump-sum vs. percentage adjustments; reconciliation" },
  { id:"R15.2",table:"rea",  phase:"Phase 15 — Three Appraisal Approaches",                 law:"Cost Approach",                                      tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"RCN vs. reproduction cost; depreciation types — physical deterioration, functional obsolescence, external obsolescence; depreciation methods — age-life, observed condition, breakdown; land value estimated separately" },
  { id:"R15.3",table:"rea",  phase:"Phase 15 — Three Appraisal Approaches",                 law:"Income Approach",                                    tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"PGI; vacancy and collection loss; NOI; GRM; direct capitalization (V = NOI / Cap Rate); cap rate derivation; DCF; annuity capitalization; band of investment method" },
  { id:"R16.1",table:"rea",  phase:"Phase 16 — Machinery & Equipment + Specialized Valuation", law:"Machinery & Equipment Valuation",                 tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"Classification: installed (real property), uninstalled, process equipment; cost approach for M&E; functional and economic obsolescence; distinction between real property and personal property" },
  { id:"R16.2",table:"rea",  phase:"Phase 16 — Machinery & Equipment + Specialized Valuation", law:"Specialized Valuation",                           tags:["rea"], group:"Professional Appraisal Practice",                                   guide:"Special-purpose properties (churches, schools, hospitals, golf courses); going concern value; business enterprise value; partial interest valuation; valuation for insurance and expropriation" },
  { id:"R17.1",table:"rea",  phase:"Phase 17 — Practical Appraisal Mathematics",             law:"Area Computation",                                   tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"Lot area for regular and irregular shapes; FAR and lot coverage; usable area after easement and setback deductions; unit conversions" },
  { id:"R17.2",table:"rea",  phase:"Phase 17 — Practical Appraisal Mathematics",             law:"Depreciation Computation",                           tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"Age-life method: accrued depreciation = (Effective Age / Total Economic Life) x RCN; observed condition method; straight-line depreciation; remaining economic life" },
  { id:"R17.3",table:"rea",  phase:"Phase 17 — Practical Appraisal Mathematics",             law:"Income Capitalization Math",                         tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"NOI computation; cap rate application (V = NOI / R); GRM (V = Gross Rent x GRM); DCF present value; annuity factors; band of investment method; yield vs. overall rate" },
  { id:"R17.4",table:"rea",  phase:"Phase 17 — Practical Appraisal Mathematics",             law:"Statistics & Basic Mathematics",                     tags:["rea"], group:"Professional Appraisal Practice",                                   guide:"Descriptive statistics: mean, median, mode, standard deviation; ratio studies (assessment ratio, coefficient of dispersion, price-related differential); mass appraisal statistics" },
  { id:"R17.5",table:"rea",  phase:"Phase 17 — Practical Appraisal Mathematics",             law:"Adjustment & Reconciliation Math",                   tags:["rea"],       group:"Professional Appraisal Practice",                                   guide:"Paired sales adjustment; percentage and lump-sum adjustments; weighted average reconciliation; final value conclusion logic; rounding conventions" },
  { id:"R18.1",table:"rea",  phase:"Phase 18 — Report Writing, GIS & Current Events",        law:"Appraisal Report Writing",                           tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"Report formats — narrative, form, restricted use; required contents: title page, letter of transmittal, purpose and function, property ID, date of valuation, scope of work, data analysis, approaches, reconciliation, value conclusion, certification per PVS" },
  { id:"R18.2",table:"rea",  phase:"Phase 18 — Report Writing, GIS & Current Events",        law:"Geographical Information System (GIS)",              tags:["rea"], group:"Professional Appraisal Practice",                                   guide:"GIS basics: map reading, interpreting cadastral and topographic maps; plotting land boundaries; identifying land use zones, easements, and ROW; LRA cadastral map interpretation" },
  { id:"R18.3",table:"rea",  phase:"Phase 18 — Report Writing, GIS & Current Events",        law:"Current Events in Real Estate",                      tags:["rea"], group:"Professional Appraisal Practice",                                   guide:"Recent developments: new PRC issuances, BSP interest rate movements, BIR zonal value updates, DHSUD regulatory changes, infrastructure projects affecting property values" },
  { id:"R19.1",table:"rea",  phase:"Phase 19 — Government Assessment — Application",         law:"Govt Assessment Principles & Taxation — Application",tags:["rea"], group:"Professional Appraisal Practice",                                   guide:"Application and computation of RA 7160 RPT; SMV-based assessment value computation; unit value x area; applying assessment levels; back taxes and penalties; appeal and protest procedures" },
  { id:"R20.1",table:"rea",  phase:"Phase 20 — Case Studies & Full Integration",             law:"Case Studies — General",                             tags:["rea","hy"],  group:"Professional Appraisal Practice",                                   guide:"Full appraisal problem sets: given property scenario — identify approach, perform computations, reconcile value indications, state value conclusion; simultaneous application of law, geography, principles, math, and report writing" },
  { id:"R20.2",table:"rea",  phase:"Phase 20 — Case Studies & Full Integration",             law:"Specialized Valuation Case Studies",                 tags:["rea"], group:"Professional Appraisal Practice",                                   guide:"Case problems: agricultural land, expropriation/ROW, condominium units, income-producing property (DCF), M&E, government assessment computation" },
  { id:"R20.3",table:"rea",  phase:"Phase 20 — Case Studies & Full Integration",             law:"Full Integration & Timed Mock Exams",                tags:["rea"],       group:"Final Preparation",                                                 guide:"Combined law + valuation scenarios; full REA mock sets in PRC format; error log analysis; targeted weak topic review; aim for consistent 85%+" },
  { id:"B11.1",table:"reb",  phase:"Phase 11 — Legal Aspect of Sale, Mortgage & Lease",      law:"Civil Code — Contracts & Sales",                     tags:["reb","hy"],  group:"Special & Technical Knowledge",                                     guide:"Essential elements: consent, object, cause; stages: negotiation, perfection, consummation; contract of sale vs. contract to sell; absolute vs. conditional sale; rescission; double sale rule (Art. 1544)" },
  { id:"B11.2",table:"reb",  phase:"Phase 11 — Legal Aspect of Sale, Mortgage & Lease",      law:"Civil Code — Lease",                                 tags:["reb"],       group:"Special & Technical Knowledge",                                     guide:"Rights and obligations of lessor and lessee; lease period and renewal; sublease; lease of rural and urban lands; termination of lease" },
  { id:"B11.3",table:"reb",  phase:"Phase 11 — Legal Aspect of Sale, Mortgage & Lease",      law:"Civil Code — Mortgage",                              tags:["reb"],       group:"Special & Technical Knowledge",                                     guide:"Real mortgage definition and requirements; foreclosure — judicial vs. extrajudicial (Act 3135); right of redemption; mortgage vs. pledge; chattel mortgage vs. real estate mortgage" },
  { id:"B11.4",table:"reb",  phase:"Phase 11 — Legal Aspect of Sale, Mortgage & Lease",      law:"RA 6552 — Maceda Law",                               tags:["reb","hy"],  group:"Special & Technical Knowledge",                                     guide:"Grace periods: 2+ years paid = grace period + CSV refund (50% + 5% per year beyond 5 yrs, max 90%); less than 2 years = grace period only (1 month per year paid); 60-day notarial notice before cancellation" },
  { id:"B11.5",table:"reb",  phase:"Phase 11 — Legal Aspect of Sale, Mortgage & Lease",      law:"PD 1517 — Urban Land Reform",                        tags:["reb"],       group:"Special & Technical Knowledge",                                     guide:"Right of first refusal for legitimate tenants in urban land reform zones; ULRZs; priority rights of long-term occupants; broker obligation to disclose encumbrances" },
  { id:"B12.1",table:"reb",  phase:"Phase 12 — Subdivision Development & Condominium",       law:"Subdivision Development Process",                    tags:["reb"],       group:"Special & Technical Knowledge",                                     guide:"Site planning and subdivision plan preparation; DHSUD approval process; infrastructure standards — roads, drainage, water supply, electrical; open space requirements (30%); road lot standards" },
  { id:"B12.2",table:"reb",  phase:"Phase 12 — Subdivision Development & Condominium",       law:"Condominium Concept & Other Types of RE Holding",    tags:["reb"],       group:"Special & Technical Knowledge",                                     guide:"Master deed requirements; project registration and LTS; unit ownership, transfer, and annotation; condominium corporation governance; other holding types: leasehold, usufruct, co-ownership, time-share" },
  { id:"B13.1",table:"reb",  phase:"Phase 13 — Documentation & Registration Processes",      law:"Transaction Documentation & Registration",           tags:["reb","hy"],  group:"Special & Technical Knowledge",                                     guide:"Step-by-step transaction process; key documents: Deed of Absolute Sale, Contract to Sell, Deed of Conditional Sale, SPA; BIR clearance — CGT (6%) and DST; transfer of title at Registry of Deeds; eTitle system" },
  { id:"B14.1",table:"reb",  phase:"Phase 14 — Urban & Rural Land Use, Planning & Zoning",   law:"Urban & Rural Land Use",                             tags:["reb"],       group:"Professional Practice",                                             guide:"Urban land use patterns and classifications; rural land use — agricultural zoning, farm-to-market land; barangay-level land use planning; contrast between urban and rural land use" },
  { id:"B14.2",table:"reb",  phase:"Phase 14 — Urban & Rural Land Use, Planning & Zoning",   law:"Planning, Development & Zoning",                    tags:["reb"],       group:"Professional Practice",                                             guide:"National and local development planning framework; zoning ordinances and variances; rezoning process; how zoning affects permitted uses; subdivision planning standards; mixed-use development" },
  { id:"B15.1",table:"reb",  phase:"Phase 15 — Basic Principles of Ecology",                 law:"Basic Principles of Ecology",                        tags:["reb"],       group:"Professional Practice",                                             guide:"Ecosystems and environmental carrying capacity; how physical and environmental factors affect land use decisions and property marketability; basis for understanding EIS requirements" },
  { id:"B16.1",table:"reb",  phase:"Phase 16 — Real Estate Brokerage Practice",              law:"Real Estate Brokerage Practice",                     tags:["reb","hy"],  group:"Professional Practice",                                             guide:"Broker's duties and authority; agency relationship — creation, types, termination; listing agreements — exclusive right to sell, exclusive agency, open listing, net listing; commission computation; broker's lien; dual agency" },
  { id:"B16.2",table:"reb",  phase:"Phase 16 — Real Estate Brokerage Practice",              law:"Marketing & Negotiation",                            tags:["reb"],       group:"Professional Practice",                                             guide:"Real estate marketing strategies (pre-selling, resale, commercial, industrial); negotiation principles; client advisory obligations; prospecting and qualifying buyers; closing techniques" },
  { id:"B17.1",table:"reb",  phase:"Phase 17 — Basic Appraisal for Real Estate Brokers",     law:"Basic Appraisal for Real Estate Brokers",            tags:["reb"],       group:"Professional Practice",                                             guide:"Market value concept; overview of three appraisal approaches (broker-level depth only); how to read and interpret an appraisal report; HBU basics; CMA vs. formal appraisal; price vs. value distinction" },
  { id:"B18.1",table:"reb",  phase:"Phase 18 — REB Integration & Mock Exam Mode",            law:"Full Integration & Timed Mock Exams",                tags:["reb"],       group:"Final Preparation",                                                 guide:"Cross-law situational questions combining land classification + titling + taxation + buyer protection + brokerage practice; past PRC board questions; full mock sets; error log analysis; aim for 85%+" },
];

const TS = {
  both:   { bg:"#eaf3de", color:"#27500a", border:"#97c459", label:"Both" },
  rea:    { bg:"#eeedfe", color:"#3c3489", border:"#7f77dd", label:"REA only" },
  reb:    { bg:"#e6f1fb", color:"#0c447c", border:"#378add", label:"REB only" },
  hy:     { bg:"#fcebeb", color:"#791f1f", border:"#f5c0c0", label:"Very High Yield" },
  custom: { bg:"#fef0ff", color:"#6b0080", border:"#d48ae8", label:"Custom" },
};
const BD = {
  both: { bg:"#eaf3de", color:"#27500a", border:"#97c459" },
  rea:  { bg:"#eeedfe", color:"#3c3489", border:"#7f77dd" },
  reb:  { bg:"#e6f1fb", color:"#0c447c", border:"#378add" },
  all:  { bg:"#f5efef", color:"#6b4f53", border:"#c4a8ab" },
};
const RING_CLR = { all:"#98777b", both:"#5a9a3a", rea:"#6b5fd4", reb:"#2d7cc4" };

function Tag({ t }) {
  const s = TS[t]; if (!s) return null;
  return <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:20, fontSize:9.5, fontWeight:500, marginRight:3, marginTop:3, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>{s.label}</span>;
}

function Ring({ pct, size=52, stroke=5, color="#97c459" }) {
  const r = (size-stroke)/2, circ = 2*Math.PI*r, offset = circ-(pct/100)*circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0e8e8" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset .5s ease" }}/>
    </svg>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [name,setName]=useState(""); const [pin,setPin]=useState("");
  const [mode,setMode]=useState("user"); const [err,setErr]=useState("");
  const [focused,setFocused]=useState(false);
  const go = () => {
    if (mode==="admin") { pin===ADMIN_PIN ? onLogin("__admin__",true) : setErr("Incorrect PIN."); }
    else { const n=name.trim(); if(!n){setErr("Please enter your name.");return;} onLogin(n.toLowerCase(),false); }
  };
  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"system-ui,sans-serif", overflow:"hidden" }}>
      {/* Left panel — decorative */}
      <div style={{
        display:"none", flex:"0 0 42%", background:"linear-gradient(160deg,#3d2a2c 0%,#6b4f53 55%,#98777b 100%)",
        padding:"3rem", flexDirection:"column", justifyContent:"space-between", position:"relative",
        ...(typeof window!=="undefined"&&window.innerWidth>=768?{display:"flex"}:{})
      }} className="login-panel">
        <div>
          <div style={{ fontSize:9, letterSpacing:".3em", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", marginBottom:48 }}>PRC · RA 9646 Section 13</div>
          <div style={{ fontSize:38, fontWeight:200, color:"white", lineHeight:1.1, letterSpacing:"-.5px" }}>Real Estate</div>
          <div style={{ fontSize:38, fontWeight:700, color:"white", lineHeight:1.1, letterSpacing:"-.5px", marginBottom:16 }}>Licensure Exam</div>
          <div style={{ width:40, height:2, background:"rgba(255,255,255,0.3)", borderRadius:2, marginBottom:20 }}/>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", letterSpacing:".15em", textTransform:"uppercase" }}>Study Tracker · 2026–2027</div>
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.7)" }}>Engr. Mary Marjorie D. Dumlao</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>RCE, RMP, SO-II</div>
        </div>
        {/* Decorative circles */}
        <div style={{ position:"absolute", bottom:-60, right:-60, width:200, height:200, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.07)" }}/>
        <div style={{ position:"absolute", bottom:-30, right:-30, width:120, height:120, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.05)" }}/>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        background:"#faf7f7", padding:"2rem 1.5rem",
      }}>
        {/* Mobile title only */}
        <div style={{ textAlign:"center", marginBottom:32 }} className="mobile-title">
          <div style={{ fontSize:9, letterSpacing:".25em", color:"#c4a8ab", textTransform:"uppercase", marginBottom:8 }}>PRC · RA 9646 Section 13</div>
          <div style={{ fontSize:24, fontWeight:700, color:"#6b4f53", letterSpacing:"-.3px" }}>Real Estate Licensure Exam</div>
          <div style={{ fontSize:11, color:"#c4a8ab", letterSpacing:".12em", textTransform:"uppercase", marginTop:4 }}>Study Tracker</div>
        </div>

        <div style={{ width:"100%", maxWidth:360 }}>
          <div style={{ marginBottom:28 }}/>

          {/* Toggle */}
          <div style={{ display:"flex", background:"#f0e8e8", borderRadius:10, padding:3, marginBottom:22, gap:3 }}>
            {[{k:"user",label:"Student"},{k:"admin",label:"Admin"}].map(m=>(
              <button key={m.k} onClick={()=>{setMode(m.k);setErr("");}} style={{
                flex:1, padding:"7px 0", border:"none", borderRadius:8, cursor:"pointer",
                fontFamily:"inherit", fontSize:12, fontWeight:mode===m.k?600:400,
                background:mode===m.k?"white":"transparent",
                color:mode===m.k?"#6b4f53":"#a8898c",
                boxShadow:mode===m.k?"0 1px 4px rgba(107,79,83,0.1)":"none",
                transition:"all .2s",
              }}>{m.label}</button>
            ))}
          </div>

          {/* Label + input */}
          <div style={{ marginBottom:err?10:18 }}>
            <div style={{ fontSize:10.5, fontWeight:600, color:"#7a6264", letterSpacing:".06em", textTransform:"uppercase", marginBottom:6 }}>
              {mode==="user"?"Full Name or ID":"Admin PIN"}
            </div>
            <input
              type={mode==="admin"?"password":"text"}
              value={mode==="user"?name:pin}
              onChange={e=>{ mode==="user"?setName(e.target.value):setPin(e.target.value); setErr(""); }}
              onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
              onKeyDown={e=>e.key==="Enter"&&go()}
              placeholder={mode==="user"?"e.g. Juan dela Cruz":"••••"}
              style={{
                width:"100%", border:`1.5px solid ${focused?"#98777b":"#e8dede"}`,
                borderRadius:10, padding:"11px 14px", fontSize:13,
                fontFamily:"inherit", outline:"none", boxSizing:"border-box",
                background:"white", color:"#3d2a2c", transition:"border-color .2s",
              }}
            />
          </div>

          {err && <div style={{ fontSize:11.5, color:"#9c3030", background:"#fdf0f0", border:"1px solid #f5c0c0", borderRadius:8, padding:"7px 10px", marginBottom:14, textAlign:"center" }}>{err}</div>}

          <button onClick={go} style={{
            width:"100%", background:"#3d2a2c", color:"white", border:"none",
            borderRadius:10, padding:"12px 0", fontSize:13, fontWeight:600,
            cursor:"pointer", fontFamily:"inherit", letterSpacing:".02em", transition:"background .2s",
          }}
            onMouseEnter={e=>e.currentTarget.style.background="#6b4f53"}
            onMouseLeave={e=>e.currentTarget.style.background="#3d2a2c"}
          >
            {mode==="user"?"Continue →":"Enter →"}
          </button>

          <div style={{ textAlign:"center", marginTop:16, fontSize:10.5, color:"#c4a8ab" }}>
            {mode==="user"?"Progress is saved per name across all devices":"Admin access only"}
          </div>
        </div>

        {/* Mobile footer */}
        <div style={{ marginTop:40, textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"#98777b" }}>Engr. Mary Marjorie D. Dumlao, RCE, RMP, SO-II</div>
          <div style={{ fontSize:10, color:"#c4a8ab", marginTop:2, letterSpacing:".06em", textTransform:"uppercase" }}>Real Estate Licensure Exam Reviewer · 2026–2027</div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .login-panel { display: flex !important; } .mobile-title { display: none !important; } }
        @media (max-width: 767px) { .login-panel { display: none !important; } .mobile-title { display: block !important; } }
      `}</style>
    </div>
  );
}

// ── TRACKER ───────────────────────────────────────────────────────────────────
function Tracker({ userName, isAdmin, onLogout }) {
  const [tab, setTab]           = useState("all");
  const [search, setSearch]     = useState("");
  const [collapsed, setCollapsed] = useState({});   // { phaseName: bool }
  const [allChecks, setAllChecks] = useState({});
  const [links, setLinks]       = useState({});
  const [custom, setCustom]     = useState({ phases:[], rows:[] });
  const [addingLink, setAddingLink] = useState(null);
  const [linkDraft, setLinkDraft]   = useState({ title:"", url:"" });
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [showAddRow, setShowAddRow]     = useState(null); // phaseTitle
  const [phaseDraft, setPhaseDraft]     = useState({ title:"", table:"both" });
  const [rowDraft, setRowDraft]         = useState({ law:"", group:"", guide:"", tags:"custom" });
  const [saved, setSaved]       = useState(false);
  const [ready, setReady]       = useState(false);

  // Load all from shared storage
  useEffect(()=>{
    (async()=>{
      try {
        const rc = await loadDoc("tracker", SK_CHECKS);
        if(rc?.data) setAllChecks(JSON.parse(rc.data));
        const rl = await loadDoc("tracker", SK_LINKS);
        if(rl?.data) setLinks(JSON.parse(rl.data));
        const rcu = await loadDoc("tracker", SK_CUSTOM);
        if(rcu?.data) setCustom(JSON.parse(rcu.data));
      } catch{}
      setReady(true);
    })();
  },[]);

  const flash = () => { setSaved(true); setTimeout(()=>setSaved(false),1300); };

  const persist = useCallback(async(key, data) => {
    try { await saveDoc("tracker", key, { data: JSON.stringify(data) }); flash(); } catch{}
  },[]);

  const myChecks = allChecks[userName] || {};

  const toggleCheck = useCallback((id)=>{
    setAllChecks(prev=>{
      const mine = { ...(prev[userName]||{}), [id]: !(prev[userName]||{})[id] };
      const next  = { ...prev, [userName]: mine };
      persist(SK_CHECKS, next);
      return next;
    });
  },[userName, persist]);

  const toggleCollapse = (phase) => setCollapsed(prev=>({ ...prev, [phase]: !prev[phase] }));

  // Links
  const addLink = useCallback((id)=>{
    const t=linkDraft.title.trim(), u=linkDraft.url.trim(); if(!t||!u) return;
    setLinks(prev=>{ const next={...prev,[id]:[...(prev[id]||[]),{title:t,url:u}]}; persist(SK_LINKS,next); return next; });
    setAddingLink(null); setLinkDraft({title:"",url:""});
  },[linkDraft, persist]);
  const removeLink = useCallback((id,idx)=>{
    setLinks(prev=>{ const arr=[...(prev[id]||[])]; arr.splice(idx,1); const next={...prev,[id]:arr}; persist(SK_LINKS,next); return next; });
  },[persist]);

  // Custom phases & rows
  const addPhase = () => {
    const t=phaseDraft.title.trim(); if(!t) return;
    const id="cp_"+Date.now();
    setCustom(prev=>{ const next={...prev, phases:[...prev.phases,{id,title:t,table:phaseDraft.table}]}; persist(SK_CUSTOM,next); return next; });
    setShowAddPhase(false); setPhaseDraft({title:"",table:"both"});
  };
  const addRow = (phaseTitle) => {
    const l=rowDraft.law.trim(); if(!l) return;
    const id="cr_"+Date.now();
    const newRow={ id, phase:phaseTitle, table: custom.phases.find(p=>p.title===phaseTitle)?.table||"both", law:l, group:rowDraft.group, guide:rowDraft.guide, tags:["custom"] };
    setCustom(prev=>{ const next={...prev, rows:[...prev.rows,newRow]}; persist(SK_CUSTOM,next); return next; });
    setShowAddRow(null); setRowDraft({law:"",group:"",guide:"",tags:"custom"});
  };
  const deleteCustomRow = (id) => {
    setCustom(prev=>{ const next={...prev, rows:prev.rows.filter(r=>r.id!==id)}; persist(SK_CUSTOM,next); return next; });
  };
  const deleteCustomPhase = (phaseTitle) => {
    setCustom(prev=>{ const next={...prev, phases:prev.phases.filter(p=>p.title!==phaseTitle), rows:prev.rows.filter(r=>r.phase!==phaseTitle)}; persist(SK_CUSTOM,next); return next; });
  };

  // Merge seed + custom rows
  const allRows = useMemo(()=>[...SEED_ROWS, ...custom.rows],[custom.rows]);

  // Progress for current user
  const myStats = useMemo(()=>{
    const done={both:0,rea:0,reb:0,all:0}, total={both:0,rea:0,reb:0,all:0};
    allRows.forEach(r=>{ total[r.table]=(total[r.table]||0)+1; total.all++; if(myChecks[r.id]){done[r.table]=(done[r.table]||0)+1; done.all++;} });
    return {done,total};
  },[allRows,myChecks]);
  const pct = (k) => myStats.total[k] ? Math.round((myStats.done[k]/myStats.total[k])*100) : 0;

  // Filter + group
  const grouped = useMemo(()=>{
    const q=search.trim().toLowerCase();
    const filtered=allRows.filter(r=>{
      if(tab!=="all" && r.table!==tab) return false;
      if(!q) return true;
      return r.law.toLowerCase().includes(q)||r.guide.toLowerCase().includes(q)||r.phase.toLowerCase().includes(q)||r.id.toLowerCase().includes(q)||r.group.toLowerCase().includes(q);
    });
    const map={};
    filtered.forEach(r=>{ if(!map[r.phase]) map[r.phase]=[]; map[r.phase].push(r); });
    return Object.entries(map);
  },[allRows,tab,search]);

  const isCustomPhase = (title) => custom.phases.some(p=>p.title===title);

  const inputStyle = { width:"100%", border:"1px solid #d4c0c2", borderRadius:6, padding:"6px 9px", fontSize:11.5, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };
  const btnStyle   = (bg,clr) => ({ background:bg, color:clr, border:"none", borderRadius:6, padding:"5px 12px", fontSize:11.5, cursor:"pointer", fontFamily:"inherit", fontWeight:500 });

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", background:"#faf7f7", minHeight:"100vh", padding:"1rem 0.9rem", fontSize:12.5, color:"#2c1f20" }}>
      {/* Responsive: hide Subject Group on mobile */}
      <style>{`@media (max-width:680px){.col-grp{display:none!important}}`}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem", paddingBottom:"0.9rem", borderBottom:"1px solid #e8dede", flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontSize:18, fontWeight:700, color:"#6b4f53" }}>Real Estate Licensure Exam</div>
          <div style={{ fontSize:11, color:"#7a6264" }}>{isAdmin?"🔐 Admin Mode":`👤 ${userName}`} · Study Tracker</div>
        </div>
        <button onClick={onLogout} style={{ background:"#f5efef", color:"#6b4f53", border:"1px solid #e8dede", borderRadius:8, padding:"5px 12px", fontSize:11.5, cursor:"pointer", fontFamily:"inherit" }}>
          {isAdmin?"Exit Admin":"Switch User"}
        </button>
      </div>

      {/* Progress rings */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:"1rem", justifyContent:"center" }}>
        {[{key:"all",label:"Overall"},{key:"both",label:"Both"},{key:"rea",label:"REA Only"},{key:"reb",label:"REB Only"}].map(c=>(
          <div key={c.key} style={{ background:"white", border:"1px solid #e8dede", borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, minWidth:128 }}>
            <div style={{ position:"relative", width:52, height:52, flexShrink:0 }}>
              <Ring pct={pct(c.key)} color={RING_CLR[c.key]}/>
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:RING_CLR[c.key] }}>{pct(c.key)}%</div>
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:12, color:"#2c1f20" }}>{c.label}</div>
              <div style={{ fontSize:10.5, color:"#7a6264" }}>{myStats.done[c.key]||0}/{myStats.total[c.key]||0}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background:"white", border:"1px solid #e8dede", borderRadius:12, padding:"10px 14px", marginBottom:"1rem" }}>
        <div style={{ fontSize:10.5, fontWeight:500, color:"#7a6264", marginBottom:7, textTransform:"uppercase", letterSpacing:".05em" }}>
          Progress by Table — {isAdmin?"Admin View":userName}
        </div>
        {[{key:"both",label:"Both (Table 1)",color:"#5a9a3a"},{key:"rea",label:"REA Only (Table 2)",color:"#6b5fd4"},{key:"reb",label:"REB Only (Table 3)",color:"#2d7cc4"}].map(b=>{
          const p=pct(b.key);
          return (
            <div key={b.key} style={{ marginBottom:7 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10.5, color:"#7a6264", marginBottom:2 }}>
                <span>{b.label}</span>
                <span style={{ fontWeight:600, color:b.color }}>{myStats.done[b.key]||0}/{myStats.total[b.key]||0} ({p}%)</span>
              </div>
              <div style={{ background:"#f0e8e8", borderRadius:20, height:7, overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:20, background:b.color, width:`${p}%`, transition:"width .5s ease" }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs + controls */}
      <div style={{ display:"flex", gap:6, marginBottom:"0.7rem", flexWrap:"wrap", alignItems:"center" }}>
        {[{key:"all",label:"All Topics"},{key:"both",label:"Table 1 — Both"},{key:"rea",label:"Table 2 — REA"},{key:"reb",label:"Table 3 — REB"}].map(t=>{
          const bd=BD[t.key]; const act=tab===t.key;
          return <button key={t.key} onClick={()=>setTab(t.key)} style={{ padding:"5px 12px", borderRadius:20, border:`1.5px solid ${bd.border}`, background:act?bd.bg:"white", color:act?bd.color:"#7a6264", fontWeight:act?600:400, fontSize:11.5, cursor:"pointer", fontFamily:"inherit" }}>{t.label}</button>;
        })}
        {isAdmin && (
          <button onClick={()=>setShowAddPhase(true)} style={{ padding:"5px 12px", borderRadius:20, border:"1.5px solid #d48ae8", background:"#fef0ff", color:"#6b0080", fontWeight:500, fontSize:11.5, cursor:"pointer", fontFamily:"inherit", marginLeft:"auto" }}>
            + Add Phase
          </button>
        )}
        {saved && <span style={{ fontSize:10.5, color:"#27500a", background:"#eaf3de", padding:"3px 8px", borderRadius:20 }}>✓ Saved</span>}
      </div>

      {/* Add Phase modal */}
      {isAdmin && showAddPhase && (
        <div style={{ background:"white", border:"1px solid #d48ae8", borderRadius:10, padding:"14px 16px", marginBottom:"0.9rem" }}>
          <div style={{ fontWeight:600, fontSize:12.5, color:"#6b0080", marginBottom:10 }}>➕ Add New Phase</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <input value={phaseDraft.title} onChange={e=>setPhaseDraft(d=>({...d,title:e.target.value}))} placeholder="Phase title (e.g. Phase 21 — Special Topic)" style={inputStyle}/>
            <select value={phaseDraft.table} onChange={e=>setPhaseDraft(d=>({...d,table:e.target.value}))} style={{ ...inputStyle, cursor:"pointer" }}>
              <option value="both">Both (REB & REA)</option>
              <option value="rea">REA Only</option>
              <option value="reb">REB Only</option>
            </select>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={addPhase} style={btnStyle("#6b4f53","white")}>Save Phase</button>
              <button onClick={()=>{setShowAddPhase(false);setPhaseDraft({title:"",table:"both"});}} style={btnStyle("#f0e8e8","#6b4f53")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:"0.8rem", background:"white", border:"1px solid #e8dede", borderRadius:8, padding:"6px 10px" }}>
        <span style={{ color:"#c4a8ab" }}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search topics, laws, phase names..."
          style={{ border:"none", outline:"none", width:"100%", fontFamily:"inherit", fontSize:12.5, color:"#2c1f20", background:"transparent" }}/>
        {search && <button onClick={()=>setSearch("")} style={{ border:"none", background:"none", cursor:"pointer", color:"#c4a8ab", fontSize:14, padding:0 }}>×</button>}
      </div>

      {/* Legend */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:"0.9rem" }}>
        {Object.entries(TS).map(([k,s])=><span key={k} style={{ padding:"1px 7px", borderRadius:20, fontSize:10, fontWeight:500, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>{s.label}</span>)}
      </div>

      {/* Phases */}
      {ready && (
        grouped.length===0
          ? <div style={{ textAlign:"center", padding:"3rem", color:"#c4a8ab", fontSize:13 }}>No topics match your search.</div>
          : grouped.map(([phase, rows])=>{
              const done   = rows.filter(r=>myChecks[r.id]).length;
              const isOpen = !collapsed[phase];
              const isCust = isCustomPhase(phase);
              return (
                <div key={phase} style={{ marginBottom:"0.7rem", border:"1px solid #e8dede", borderRadius:12, overflow:"hidden", background:"white" }}>

                  {/* Phase header — clickable to collapse */}
                  <div onClick={()=>toggleCollapse(phase)}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", background:"#f5efef", cursor:"pointer", userSelect:"none" }}>
                    <span style={{ fontSize:13, color:"#98777b", transition:"transform .2s", display:"inline-block", transform:isOpen?"rotate(90deg)":"rotate(0deg)" }}>▶</span>
                    <span style={{ flex:1, fontWeight:600, fontSize:11.5, color:"#6b4f53" }}>
                      {phase}
                      {isCust && <span style={{ marginLeft:6, fontSize:9.5, background:"#fef0ff", color:"#6b0080", border:"1px solid #d48ae8", borderRadius:20, padding:"1px 6px" }}>Custom</span>}
                    </span>
                    <span style={{ fontSize:10.5, color: done===rows.length&&rows.length>0 ? "#5a9a3a" : "#c4a8ab", fontWeight:500 }}>
                      {done}/{rows.length} done
                    </span>
                    {/* Admin: add lesson to this phase */}
                    {isAdmin && (
                      <button onClick={e=>{e.stopPropagation(); setShowAddRow(phase); setRowDraft({law:"",group:"",guide:"",tags:"custom"});}}
                        style={{ fontSize:10.5, background:"#fef0ff", color:"#6b0080", border:"1px solid #d48ae8", borderRadius:6, padding:"2px 8px", cursor:"pointer", fontFamily:"inherit", marginLeft:4 }}>
                        + Lesson
                      </button>
                    )}
                    {/* Admin: delete custom phase */}
                    {isAdmin && isCust && (
                      <button onClick={e=>{e.stopPropagation(); if(window.confirm("Delete this phase and all its lessons?")) deleteCustomPhase(phase);}}
                        style={{ fontSize:10.5, background:"#fcebeb", color:"#791f1f", border:"1px solid #f5c0c0", borderRadius:6, padding:"2px 8px", cursor:"pointer", fontFamily:"inherit" }}>
                        Delete Phase
                      </button>
                    )}
                  </div>

                  {/* Add lesson form */}
                  {isAdmin && showAddRow===phase && (
                    <div style={{ padding:"12px 14px", borderBottom:"1px solid #e8dede", background:"#fdfaff" }}>
                      <div style={{ fontWeight:600, fontSize:12, color:"#6b0080", marginBottom:8 }}>➕ Add Lesson to: {phase}</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                        <input value={rowDraft.law} onChange={e=>setRowDraft(d=>({...d,law:e.target.value}))} placeholder="Topic / Law name *" style={inputStyle}/>
                        <input value={rowDraft.group} onChange={e=>setRowDraft(d=>({...d,group:e.target.value}))} placeholder="Subject group (optional)" style={inputStyle}/>
                        <textarea value={rowDraft.guide} onChange={e=>setRowDraft(d=>({...d,guide:e.target.value}))} placeholder="Key coverage / guidelines (optional)" rows={2} style={{ ...inputStyle, resize:"vertical" }}/>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={()=>addRow(phase)} style={btnStyle("#6b4f53","white")}>Save Lesson</button>
                          <button onClick={()=>setShowAddRow(null)} style={btnStyle("#f0e8e8","#6b4f53")}>Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rows — shown only when expanded */}
                  {isOpen && (
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11.5 }}>
                        <thead>
                          <tr style={{ background:"#faf7f7" }}>
                            {["✓","#","Topic / Law","Subject Group","Key Coverage & Guidelines","Resources"].map(h=>
                              <th key={h} className={h==="Subject Group"?"col-grp":""} style={{ padding:"7px 9px", textAlign:"left", fontWeight:500, fontSize:10, textTransform:"uppercase", letterSpacing:".05em", color:"#98777b", borderBottom:"1px solid #f0e8e8", whiteSpace:"nowrap" }}>{h}</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row,ri)=>{
                            const done=!!myChecks[row.id];
                            const rowLinks=links[row.id]||[];
                            return (
                              <tr key={row.id} style={{ background:done?"#f6fbf0":ri%2===0?"white":"#fdf9f9" }}>
                                {/* Check */}
                                <td style={{ padding:"8px 9px", textAlign:"center", verticalAlign:"middle", width:34, cursor:isAdmin?"default":"pointer" }}
                                  onClick={()=>!isAdmin&&toggleCheck(row.id)}>
                                  <div style={{ width:19, height:19, borderRadius:4, border:`2px solid ${done?"#5a9a3a":"#d4c0c2"}`, background:done?"#5a9a3a":"white", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", transition:"all .15s" }}>
                                    {done && <span style={{ color:"white", fontSize:11, fontWeight:700, lineHeight:1 }}>✓</span>}
                                  </div>
                                </td>
                                {/* ID */}
                                <td style={{ padding:"8px 9px", color:"#c4a8ab", fontSize:10.5, verticalAlign:"top", whiteSpace:"nowrap" }}>{row.id}</td>
                                {/* Law */}
                                <td style={{ padding:"8px 9px", verticalAlign:"top", minWidth:150, cursor:isAdmin?"default":"pointer" }}
                                  onClick={()=>!isAdmin&&toggleCheck(row.id)}>
                                  <div style={{ fontWeight:500, color:done?"#5a9a3a":"#2c1f20", textDecoration:done?"line-through":"none", lineHeight:1.4, marginBottom:3 }}>{row.law}</div>
                                  <div>{row.tags.map(t=><Tag key={t} t={t}/>)}</div>
                                </td>
                                {/* Group */}
                                <td className="col-grp" style={{ padding:"8px 9px", verticalAlign:"top", minWidth:105, color:"#7a6264", fontStyle:"italic", fontSize:10.5, lineHeight:1.5, cursor:isAdmin?"default":"pointer" }}
                                  onClick={()=>!isAdmin&&toggleCheck(row.id)}>{row.group}</td>
                                {/* Guide */}
                                <td style={{ padding:"8px 9px", verticalAlign:"top", color:done?"#9ab88a":"#7a6264", lineHeight:1.6, minWidth:230, cursor:isAdmin?"default":"pointer" }}
                                  onClick={()=>!isAdmin&&toggleCheck(row.id)}>{row.guide}</td>
                                {/* Resources */}
                                <td style={{ padding:"8px 9px", verticalAlign:"top", minWidth:150 }} onClick={e=>e.stopPropagation()}>
                                  {rowLinks.map((lk,idx)=>(
                                    <div key={idx} style={{ display:"flex", alignItems:"center", gap:3, marginBottom:4 }}>
                                      <a href={lk.url} target="_blank" rel="noreferrer"
                                        style={{ flex:1, background:"#eaf3de", color:"#27500a", border:"1px solid #97c459", borderRadius:5, padding:"4px 7px", fontSize:10.5, textDecoration:"none", fontWeight:500, display:"flex", alignItems:"center", gap:4, overflow:"hidden" }}>
                                        <span style={{ flexShrink:0 }}>📂</span>
                                        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lk.title}</span>
                                      </a>
                                      {isAdmin && (
                                        <button onClick={()=>removeLink(row.id,idx)} style={{ flexShrink:0, background:"#fcebeb", color:"#791f1f", border:"1px solid #f5c0c0", borderRadius:4, width:19, height:19, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>×</button>
                                      )}
                                    </div>
                                  ))}
                                  {isAdmin && (
                                    addingLink===row.id ? (
                                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                                        <input autoFocus value={linkDraft.title} onChange={e=>setLinkDraft(d=>({...d,title:e.target.value}))} placeholder="Title" style={{ ...inputStyle, fontSize:11 }}/>
                                        <input value={linkDraft.url} onChange={e=>setLinkDraft(d=>({...d,url:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter")addLink(row.id); if(e.key==="Escape"){setAddingLink(null);setLinkDraft({title:"",url:""});}}} placeholder="Paste URL..." style={{ ...inputStyle, fontSize:11 }}/>
                                        <div style={{ display:"flex", gap:4 }}>
                                          <button onClick={()=>addLink(row.id)} style={btnStyle("#6b4f53","white")}>Save</button>
                                          <button onClick={()=>{setAddingLink(null);setLinkDraft({title:"",url:""}); }} style={btnStyle("#f0e8e8","#6b4f53")}>Cancel</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button onClick={()=>{setAddingLink(row.id);setLinkDraft({title:"",url:""}); }}
                                        style={{ background:"white", color:"#c4a8ab", border:"1px dashed #d4c0c2", borderRadius:5, padding:"4px 7px", fontSize:10.5, cursor:"pointer", fontFamily:"inherit", width:"100%", marginTop:rowLinks.length?3:0 }}>
                                        + Add link
                                      </button>
                                    )
                                  )}
                                  {!isAdmin && rowLinks.length===0 && (
                                    <span style={{ fontSize:10.5, color:"#d4c0c2", fontStyle:"italic" }}>No resources yet</span>
                                  )}
                                  {/* Admin: delete custom lesson */}
                                  {isAdmin && row.tags.includes("custom") && (
                                    <button onClick={()=>deleteCustomRow(row.id)} style={{ ...btnStyle("#fcebeb","#791f1f"), fontSize:10, marginTop:5, width:"100%", border:"1px solid #f5c0c0" }}>
                                      Delete Lesson
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
      )}

      {/* Footer */}
      <div style={{ textAlign:"center", marginTop:"1.5rem", paddingTop:"1rem", borderTop:"1px solid #e8dede" }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#6b4f53" }}>Engr. Mary Marjorie D. Dumlao, RCE, RMP, SO-II</div>
        <div style={{ fontSize:10.5, color:"#c4a8ab", marginTop:2 }}>Real Estate Licensure Exam Reviewer · 2026–2027</div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  if (!user) return <LoginScreen onLogin={(n,a)=>setUser({name:n,isAdmin:a})}/>;
  return <Tracker userName={user.name} isAdmin={user.isAdmin} onLogout={()=>setUser(null)}/>;
}
