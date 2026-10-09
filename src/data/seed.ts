// ---------------------------------------------------------------------------
// EduSense AI — Demo / seed data
//
// All records below are fictional and generated for this college mini-project
// prototype. No real student data is used.
// ---------------------------------------------------------------------------

import type {
  Assessment,
  AttendanceRecord,
  Institution,
  LearningTask,
  NotificationItem,
  Intervention,
  PerformancePoint,
  Quiz,
  Student,
  Subject,
  Teacher,
} from '../types'
import { getStudentRiskPrediction } from '../services/predictionService'
import { hash } from '../utils/format'

// --- helpers ---------------------------------------------------------------

const DAY = 86400000

export function isoFromNow(days: number): string {
  return new Date(Date.now() + days * DAY).toISOString()
}

const AVATAR_TONES = [
  'indigo',
  'sky',
  'violet',
  'emerald',
  'amber',
  'rose',
  'cyan',
  'orange',
] as const

function tone(key: string): string {
  return AVATAR_TONES[hash(key) % AVATAR_TONES.length]
}

// --- demo accounts ---------------------------------------------------------

export interface DemoAccount {
  id: string
  name: string
  email: string
  password: string
  role: 'student' | 'teacher' | 'institution' | 'organization'
  subtitle: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'USR-STU',
    name: 'Ananya Iyer',
    email: 'student@demo.com',
    password: 'password123',
    role: 'student',
    subtitle: '3rd Year · Computer Science & Engineering',
  },
  {
    id: 'USR-TCH',
    name: 'Dr. Priya Raghavan',
    email: 'teacher@demo.com',
    password: 'password123',
    role: 'teacher',
    subtitle: 'Associate Professor · CSE',
  },
  {
    id: 'USR-INS',
    name: 'S. Krishnan',
    email: 'college@demo.com',
    password: 'password123',
    role: 'institution',
    subtitle: 'Registrar · SRM Institute of Technology',
  },
  {
    id: 'USR-ORG',
    name: 'EduSense Platform Admin',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'organization',
    subtitle: 'Organization Administrator',
  },
]

// --- subjects --------------------------------------------------------------

export const SUBJECTS: Subject[] = [
  {
    id: 'SUB-DS',
    name: 'Data Structures',
    code: 'CS-301',
    teacher: 'Dr. Priya Raghavan',
    attendance: 72,
    marks: 58,
    quiz: 54,
    assignments: 66,
    risk: 'Medium',
  },
  {
    id: 'SUB-ML',
    name: 'Machine Learning',
    code: 'CS-302',
    teacher: 'Dr. Priya Raghavan',
    attendance: 58,
    marks: 44,
    quiz: 46,
    assignments: 55,
    risk: 'High',
  },
  {
    id: 'SUB-DB',
    name: 'Database Management',
    code: 'CS-303',
    teacher: 'Prof. Arun Kumar',
    attendance: 70,
    marks: 62,
    quiz: 58,
    assignments: 72,
    risk: 'Medium',
  },
  {
    id: 'SUB-CN',
    name: 'Computer Networks',
    code: 'CS-304',
    teacher: 'Dr. Neha Sharma',
    attendance: 64,
    marks: 52,
    quiz: 49,
    assignments: 63,
    risk: 'High',
  },
  {
    id: 'SUB-CS',
    name: 'Cyber Security',
    code: 'CS-305',
    teacher: 'Dr. Neha Sharma',
    attendance: 68,
    marks: 55,
    quiz: 52,
    assignments: 60,
    risk: 'High',
  },
  {
    id: 'SUB-SE',
    name: 'Software Engineering',
    code: 'CS-306',
    teacher: 'Prof. Arun Kumar',
    attendance: 74,
    marks: 66,
    quiz: 61,
    assignments: 78,
    risk: 'Medium',
  },
]

/** Subject risk is derived with the same demo model used for students. */
export const SUBJECTS_WITH_RISK: Subject[] = SUBJECTS.map((s) => {
  const pred = getStudentRiskPrediction({
    attendance: s.attendance,
    previous_marks: s.marks,
    internal_marks: s.marks,
    quiz_scores: s.quiz,
    assignment_completion: s.assignments,
    learning_activity: 5,
  })
  return { ...s, risk: pred.risk_level }
})

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS_WITH_RISK.find((s) => s.id === id)
}

// --- students --------------------------------------------------------------

interface RawStudent {
  id: string
  name: string
  rollNo: string
  department: string
  year: string
  semester: string
  attendance: number
  previousMarks: number
  internalMarks: number
  quizScore: number
  assignmentCompletion: number
  learningActivity: number
}

const STUDENT_SEED: RawStudent[] = [
  { id: 'STU-001', name: 'Ananya Iyer', rollNo: 'CS22001', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 66, previousMarks: 58, internalMarks: 49, quizScore: 51, assignmentCompletion: 70, learningActivity: 4 },
  { id: 'STU-002', name: 'Rahul Verma', rollNo: 'CS22002', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 58, previousMarks: 52, internalMarks: 48, quizScore: 45, assignmentCompletion: 55, learningActivity: 3 },
  { id: 'STU-003', name: 'Karan Mehta', rollNo: 'CS22003', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 55, previousMarks: 50, internalMarks: 44, quizScore: 42, assignmentCompletion: 50, learningActivity: 2.5 },
  { id: 'STU-004', name: 'Sneha Patil', rollNo: 'IT22004', department: 'Information Technology', year: '3rd Year', semester: 'Sem 5', attendance: 64, previousMarks: 57, internalMarks: 52, quizScore: 48, assignmentCompletion: 58, learningActivity: 4 },
  { id: 'STU-005', name: 'Arjun Reddy', rollNo: 'EC22005', department: 'Electronics & Communication', year: '3rd Year', semester: 'Sem 5', attendance: 60, previousMarks: 54, internalMarks: 47, quizScore: 50, assignmentCompletion: 52, learningActivity: 3 },
  { id: 'STU-006', name: 'Fatima Sheikh', rollNo: 'CS22006', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 66, previousMarks: 56, internalMarks: 50, quizScore: 47, assignmentCompletion: 62, learningActivity: 4.5 },
  { id: 'STU-007', name: 'Deepak Yadav', rollNo: 'CS22007', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 63, previousMarks: 58, internalMarks: 53, quizScore: 55, assignmentCompletion: 65, learningActivity: 5 },
  { id: 'STU-008', name: 'Vikram Joshi', rollNo: 'ME22008', department: 'Mechanical Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 68, previousMarks: 60, internalMarks: 55, quizScore: 58, assignmentCompletion: 68, learningActivity: 5 },
  { id: 'STU-009', name: 'Rohit Gupta', rollNo: 'CS22009', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 74, previousMarks: 67, internalMarks: 64, quizScore: 62, assignmentCompletion: 75, learningActivity: 5.5 },
  { id: 'STU-010', name: 'Meera Krishnan', rollNo: 'IT22010', department: 'Information Technology', year: '3rd Year', semester: 'Sem 5', attendance: 76, previousMarks: 69, internalMarks: 67, quizScore: 65, assignmentCompletion: 78, learningActivity: 6 },
  { id: 'STU-011', name: 'Sandeep Kumar', rollNo: 'EC22011', department: 'Electronics & Communication', year: '3rd Year', semester: 'Sem 5', attendance: 75, previousMarks: 66, internalMarks: 63, quizScore: 62, assignmentCompletion: 76, learningActivity: 5.5 },
  { id: 'STU-012', name: 'Kavya Menon', rollNo: 'CS22012', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 78, previousMarks: 70, internalMarks: 68, quizScore: 66, assignmentCompletion: 80, learningActivity: 6 },
  { id: 'STU-013', name: 'Imran Qureshi', rollNo: 'CS22013', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 75, previousMarks: 67, internalMarks: 64, quizScore: 62, assignmentCompletion: 76, learningActivity: 5.5 },
  { id: 'STU-014', name: 'Tanvi Deshpande', rollNo: 'CE22014', department: 'Civil Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 77, previousMarks: 70, internalMarks: 68, quizScore: 67, assignmentCompletion: 79, learningActivity: 6.5 },
  { id: 'STU-015', name: 'Nikhil Rao', rollNo: 'AI22015', department: 'Artificial Intelligence & Data Science', year: '3rd Year', semester: 'Sem 5', attendance: 74, previousMarks: 66, internalMarks: 64, quizScore: 62, assignmentCompletion: 76, learningActivity: 6 },
  { id: 'STU-016', name: 'Aisha Khan', rollNo: 'CS22016', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 88, previousMarks: 84, internalMarks: 86, quizScore: 82, assignmentCompletion: 94, learningActivity: 9 },
  { id: 'STU-017', name: 'Suresh Babu', rollNo: 'IT22017', department: 'Information Technology', year: '3rd Year', semester: 'Sem 5', attendance: 84, previousMarks: 79, internalMarks: 80, quizScore: 76, assignmentCompletion: 88, learningActivity: 7.5 },
  { id: 'STU-018', name: 'Divya Pillai', rollNo: 'CS22018', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 90, previousMarks: 86, internalMarks: 88, quizScore: 84, assignmentCompletion: 96, learningActivity: 10 },
  { id: 'STU-019', name: 'Manoj Tiwari', rollNo: 'EC22019', department: 'Electronics & Communication', year: '3rd Year', semester: 'Sem 5', attendance: 82, previousMarks: 76, internalMarks: 78, quizScore: 74, assignmentCompletion: 86, learningActivity: 7 },
  { id: 'STU-020', name: 'Ritika Shah', rollNo: 'CS22020', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 83, previousMarks: 78, internalMarks: 79, quizScore: 75, assignmentCompletion: 87, learningActivity: 7.5 },
  { id: 'STU-021', name: 'Joseph Mathew', rollNo: 'ME22021', department: 'Mechanical Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 89, previousMarks: 85, internalMarks: 87, quizScore: 83, assignmentCompletion: 95, learningActivity: 9.5 },
  { id: 'STU-022', name: 'Pooja Sethi', rollNo: 'CS22022', department: 'Computer Science & Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 81, previousMarks: 78, internalMarks: 80, quizScore: 76, assignmentCompletion: 88, learningActivity: 7 },
  { id: 'STU-023', name: 'Aravind Menon', rollNo: 'AI22023', department: 'Artificial Intelligence & Data Science', year: '3rd Year', semester: 'Sem 5', attendance: 79, previousMarks: 73, internalMarks: 74, quizScore: 72, assignmentCompletion: 84, learningActivity: 6.5 },
  { id: 'STU-024', name: 'Shreya Bose', rollNo: 'CE22024', department: 'Civil Engineering', year: '3rd Year', semester: 'Sem 5', attendance: 80, previousMarks: 75, internalMarks: 76, quizScore: 73, assignmentCompletion: 86, learningActivity: 7 },
]

function overallOf(s: RawStudent): number {
  return Math.round(
    0.2 * s.attendance +
      0.25 * s.previousMarks +
      0.25 * s.internalMarks +
      0.15 * s.quizScore +
      0.15 * s.assignmentCompletion,
  )
}

export const STUDENTS: Student[] = STUDENT_SEED.map((raw) => {
  const prediction = getStudentRiskPrediction({
    attendance: raw.attendance,
    previous_marks: raw.previousMarks,
    internal_marks: raw.internalMarks,
    quiz_scores: raw.quizScore,
    assignment_completion: raw.assignmentCompletion,
    learning_activity: raw.learningActivity,
    studentName: raw.name,
  })

  const email = `${raw.name.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, '.')}@srmist.edu.in`

  return {
    id: raw.id,
    name: raw.name,
    email,
    rollNo: raw.rollNo,
    department: raw.department,
    year: raw.year,
    semester: raw.semester,
    course: 'B.Tech',
    attendance: raw.attendance,
    previousMarks: raw.previousMarks,
    internalMarks: raw.internalMarks,
    quizScore: raw.quizScore,
    assignmentCompletion: raw.assignmentCompletion,
    learningActivity: raw.learningActivity,
    overallPerformance: overallOf(raw),
    risk: prediction.risk_level,
    riskScore: prediction.risk_score,
    topFactor: prediction.contributing_factors[0]?.name ?? '—',
    avatar: tone(raw.name),
  }
})

export const DEMO_STUDENT_ID = 'STU-001'

export function getDemoStudent(): Student {
  return STUDENTS.find((s) => s.id === DEMO_STUDENT_ID) ?? STUDENTS[0]
}

export function getStudent(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id)
}

export const DEPARTMENTS = Array.from(new Set(STUDENTS.map((s) => s.department))).sort()
export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']
export const SEMESTERS = ['Sem 1', 'Sem 3', 'Sem 5', 'Sem 7']
export const COURSES = ['B.Tech', 'M.Tech', 'B.Sc', 'MCA']

// --- teachers --------------------------------------------------------------

export const TEACHERS: Teacher[] = [
  { id: 'TCH-01', name: 'Dr. Priya Raghavan', email: 'teacher@demo.com', department: 'Computer Science & Engineering', subjects: ['Data Structures', 'Machine Learning'], students: 7, avatar: tone('Priya Raghavan') },
  { id: 'TCH-02', name: 'Prof. Arun Kumar', email: 'arun.kumar@srmist.edu.in', department: 'Computer Science & Engineering', subjects: ['Database Management', 'Software Engineering'], students: 6, avatar: tone('Arun Kumar') },
  { id: 'TCH-03', name: 'Dr. Neha Sharma', email: 'neha.sharma@srmist.edu.in', department: 'Information Technology', subjects: ['Computer Networks', 'Cyber Security'], students: 6, avatar: tone('Neha Sharma') },
  { id: 'TCH-04', name: 'Dr. Meenakshi Rao', email: 'meenakshi.rao@srmist.edu.in', department: 'Artificial Intelligence & Data Science', subjects: ['Machine Learning'], students: 5, avatar: tone('Meenakshi Rao') },
  { id: 'TCH-05', name: 'Prof. Daniel Thomas', email: 'daniel.thomas@srmist.edu.in', department: 'Mechanical Engineering', subjects: ['Software Engineering'], students: 4, avatar: tone('Daniel Thomas') },
  { id: 'TCH-06', name: 'Dr. Lakshmi Narayan', email: 'lakshmi.n@srmist.edu.in', department: 'Civil Engineering', subjects: ['Data Structures'], students: 4, avatar: tone('Lakshmi Narayan') },
]

// --- institutions ----------------------------------------------------------

export const INSTITUTIONS: Institution[] = [
  { id: 'INS-01', name: 'SRM Institute of Technology', code: 'SRM-001', city: 'Chennai', students: 4280, departments: 14, status: 'Active', plan: 'Enterprise', joined: '2024-06-12', performance: 71 },
  { id: 'INS-02', name: 'Vellore Institute of Learning', code: 'VIL-002', city: 'Vellore', students: 3620, departments: 11, status: 'Active', plan: 'Growth', joined: '2024-09-03', performance: 76 },
  { id: 'INS-03', name: 'Anna University College of Engineering', code: 'AUC-003', city: 'Chennai', students: 5110, departments: 16, status: 'Active', plan: 'Enterprise', joined: '2023-07-21', performance: 68 },
  { id: 'INS-04', name: 'Kumaraguru College of Technology', code: 'KCT-004', city: 'Coimbatore', students: 2740, departments: 9, status: 'Active', plan: 'Growth', joined: '2025-01-15', performance: 73 },
  { id: 'INS-05', name: "St. Xavier's Catholic College", code: 'SXC-005', city: 'Nagercoil', students: 1490, departments: 7, status: 'Inactive', plan: 'Starter', joined: '2025-03-08', performance: 62 },
  { id: 'INS-06', name: 'Govt. Polytechnic, Trichy', code: 'GPT-006', city: 'Trichy', students: 1980, departments: 6, status: 'Active', plan: 'Starter', joined: '2025-06-30', performance: 65 },
  { id: 'INS-07', name: 'Amrita School of Computing', code: 'ASC-007', city: 'Coimbatore', students: 3310, departments: 10, status: 'Active', plan: 'Growth', joined: '2024-11-19', performance: 79 },
  { id: 'INS-08', name: 'Sathyabama Science & Technology', code: 'SST-008', city: 'Chennai', students: 2260, departments: 8, status: 'Inactive', plan: 'Starter', joined: '2025-08-04', performance: 64 },
]

// --- assessments -----------------------------------------------------------

export const ASSESSMENTS: Assessment[] = [
  { id: 'ASM-01', subject: 'Machine Learning', title: 'Supervised Learning Quiz 3', type: 'Quiz', dueDate: isoFromNow(-24), status: 'Completed', score: 46, maxScore: 100 },
  { id: 'ASM-02', subject: 'Data Structures', title: 'Binary Trees Assignment', type: 'Assignment', dueDate: isoFromNow(-19), status: 'Completed', score: 58, maxScore: 100 },
  { id: 'ASM-03', subject: 'Database Management', title: 'Normalization Worksheet', type: 'Assignment', dueDate: isoFromNow(-14), status: 'Completed', score: 72, maxScore: 100 },
  { id: 'ASM-04', subject: 'Computer Networks', title: 'TCP/IP Quiz 2', type: 'Quiz', dueDate: isoFromNow(-11), status: 'Completed', score: 49, maxScore: 100 },
  { id: 'ASM-05', subject: 'Cyber Security', title: 'Internal Assessment II', type: 'Internal', dueDate: isoFromNow(-8), status: 'Completed', score: 55, maxScore: 100 },
  { id: 'ASM-06', subject: 'Software Engineering', title: 'SDLC Case Study', type: 'Assignment', dueDate: isoFromNow(-5), status: 'Completed', score: 78, maxScore: 100 },
  { id: 'ASM-07', subject: 'Machine Learning', title: 'Decision Trees Assignment', type: 'Assignment', dueDate: isoFromNow(-2), status: 'Overdue', score: null, maxScore: 100 },
  { id: 'ASM-08', subject: 'Data Structures', title: 'Graph Algorithms Quiz', type: 'Quiz', dueDate: isoFromNow(2), status: 'Pending', score: null, maxScore: 100 },
  { id: 'ASM-09', subject: 'Computer Networks', title: 'Routing Protocols Assignment', type: 'Assignment', dueDate: isoFromNow(4), status: 'Pending', score: null, maxScore: 100 },
  { id: 'ASM-10', subject: 'Database Management', title: 'SQL Query Practice Test', type: 'Quiz', dueDate: isoFromNow(7), status: 'Upcoming', score: null, maxScore: 100 },
  { id: 'ASM-11', subject: 'Cyber Security', title: 'Cryptography Assignment', type: 'Assignment', dueDate: isoFromNow(10), status: 'Upcoming', score: null, maxScore: 100 },
  { id: 'ASM-12', subject: 'Machine Learning', title: 'Internal Assessment III', type: 'Internal', dueDate: isoFromNow(14), status: 'Upcoming', score: null, maxScore: 100 },
  { id: 'ASM-13', subject: 'Software Engineering', title: 'Testing Techniques Quiz', type: 'Quiz', dueDate: isoFromNow(17), status: 'Upcoming', score: null, maxScore: 100 },
  { id: 'ASM-14', subject: 'Data Structures', title: 'Hashing & Sorting Assignment', type: 'Assignment', dueDate: isoFromNow(21), status: 'Upcoming', score: null, maxScore: 100 },
]

// --- quizzes (interactive demo) -------------------------------------------

export const QUIZZES: Quiz[] = [
  {
    id: 'QZ-DS',
    subject: 'Data Structures',
    title: 'Data Structures — Quick Quiz',
    questions: [
      {
        id: 'q1',
        question: 'What is the average time complexity of searching in a balanced binary search tree?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        answerIndex: 2,
        explanation:
          'A balanced BST keeps the tree height at O(log n), so search, insert and delete are all O(log n) on average.',
      },
      {
        id: 'q2',
        question: 'Which traversal of a binary search tree produces values in sorted order?',
        options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
        answerIndex: 1,
        explanation:
          'In-order traversal visits left subtree → node → right subtree, which yields keys in ascending order for a BST.',
      },
      {
        id: 'q3',
        question: 'In a queue data structure, insertion is performed at the…',
        options: ['Front', 'Rear', 'Middle', 'Both ends'],
        answerIndex: 1,
        explanation:
          'A queue follows FIFO: new elements are enqueued at the rear and removed from the front.',
      },
      {
        id: 'q4',
        question: 'Which data structure uses the LIFO principle?',
        options: ['Queue', 'Stack', 'Linked list', 'Heap'],
        answerIndex: 1,
        explanation:
          'A stack is Last-In-First-Out: the most recently pushed element is popped first.',
      },
      {
        id: 'q5',
        question: 'What is the worst-case time complexity of quicksort?',
        options: ['O(n log n)', 'O(log n)', 'O(n²)', 'O(n)'],
        answerIndex: 2,
        explanation:
          'Quicksort degrades to O(n²) when the pivot repeatedly splits the array unevenly — for example on already-sorted input with a first-element pivot.',
      },
    ],
  },
  {
    id: 'QZ-ML',
    subject: 'Machine Learning',
    title: 'Machine Learning — Quick Quiz',
    questions: [
      {
        id: 'q1',
        question: 'Which algorithm is a supervised learning technique?',
        options: ['K-means clustering', 'Linear regression', 'PCA', 'Apriori'],
        answerIndex: 1,
        explanation:
          'Linear regression learns from labelled input–output pairs, which makes it supervised. The others are unsupervised methods.',
      },
      {
        id: 'q2',
        question: 'Overfitting describes a model that…',
        options: [
          'Performs poorly on training data',
          'Memorises noise and generalises poorly',
          'Has too few parameters',
          'Is always linear',
        ],
        answerIndex: 1,
        explanation:
          'An overfitted model captures noise in the training set, giving high training accuracy but poor performance on unseen data.',
      },
      {
        id: 'q3',
        question: 'What does the learning rate control in gradient descent?',
        options: [
          'The number of features',
          'The step size taken toward the minimum',
          'The train/test split ratio',
          'The number of iterations only',
        ],
        answerIndex: 1,
        explanation:
          'Learning rate sets how large each gradient step is — too large can overshoot, too small converges slowly.',
      },
      {
        id: 'q4',
        question: 'Precision answers the question…',
        options: [
          'Of all predicted positives, how many are correct?',
          'Of all actual positives, how many were found?',
          'How accurate is the model overall?',
          'How balanced is the dataset?',
        ],
        answerIndex: 0,
        explanation:
          'Precision = TP / (TP + FP): among everything the model labelled positive, how many really were.',
      },
      {
        id: 'q5',
        question: 'Which metric is more suitable for an imbalanced dataset?',
        options: ['Accuracy', 'F1 score', 'Mean squared error', 'R² score'],
        answerIndex: 1,
        explanation:
          'F1 balances precision and recall, so a majority class cannot inflate it the way raw accuracy can.',
      },
    ],
  },
  {
    id: 'QZ-DB',
    subject: 'Database Management',
    title: 'Database Management — Quick Quiz',
    questions: [
      {
        id: 'q1',
        question: 'Which normal form removes partial dependency?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        answerIndex: 1,
        explanation:
          '2NF requires 1NF plus no non-key attribute may depend on only part of a composite primary key.',
      },
      {
        id: 'q2',
        question: 'SQL command used to retrieve data from a database is…',
        options: ['GET', 'SELECT', 'RETRIEVE', 'EXTRACT'],
        answerIndex: 1,
        explanation: 'SELECT is the DML command used to query rows from one or more tables.',
      },
      {
        id: 'q3',
        question: 'A primary key is…',
        options: [
          'Always numeric',
          'Unique and not null',
          'Allowed to repeat',
          'Optional in a table',
        ],
        answerIndex: 1,
        explanation:
          'A primary key uniquely identifies each row and cannot contain NULL values.',
      },
      {
        id: 'q4',
        question: 'ACID in databases stands for Atomicity, Isolation, Durability and…',
        options: ['Consistency', 'Concurrency', 'Compatibility', 'Capacity'],
        answerIndex: 0,
        explanation: 'ACID = Atomicity, Consistency, Isolation, Durability — the four transaction guarantees.',
      },
      {
        id: 'q5',
        question: 'Which JOIN returns only rows present in both tables?',
        options: ['LEFT JOIN', 'FULL OUTER JOIN', 'INNER JOIN', 'CROSS JOIN'],
        answerIndex: 2,
        explanation: 'An INNER JOIN keeps only matching rows from both sides of the join.',
      },
    ],
  },
]

// --- attendance ------------------------------------------------------------

const MONTH_LABELS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
const MONTH_OVERALL = [84, 82, 79, 76, 73, 70, 68, 66]

export const ATTENDANCE_RECORDS: AttendanceRecord[] = MONTH_LABELS.map((month, i) => {
  const delta = MONTH_OVERALL[i] - MONTH_OVERALL[MONTH_OVERALL.length - 1]
  const bySubject: Record<string, number> = {}
  for (const s of SUBJECTS) {
    bySubject[s.name] = Math.max(35, Math.min(100, s.attendance + delta))
  }
  return { month, overall: MONTH_OVERALL[i], bySubject }
})

// --- performance series ----------------------------------------------------

const SERIES: Record<'Weekly' | 'Monthly' | 'Semester', PerformancePoint[]> = {
  Weekly: [
    { label: 'W1', marks: 68, attendance: 78, quiz: 62, assignments: 75 },
    { label: 'W2', marks: 66, attendance: 76, quiz: 60, assignments: 72 },
    { label: 'W3', marks: 64, attendance: 74, quiz: 58, assignments: 70 },
    { label: 'W4', marks: 61, attendance: 70, quiz: 55, assignments: 68 },
    { label: 'W5', marks: 58, attendance: 66, quiz: 52, assignments: 66 },
    { label: 'W6', marks: 60, attendance: 64, quiz: 54, assignments: 64 },
    { label: 'W7', marks: 57, attendance: 66, quiz: 50, assignments: 66 },
    { label: 'W8', marks: 55, attendance: 66, quiz: 51, assignments: 70 },
  ],
  Monthly: [
    { label: 'Mar', marks: 72, attendance: 84, quiz: 70, assignments: 86 },
    { label: 'Apr', marks: 71, attendance: 82, quiz: 68, assignments: 84 },
    { label: 'May', marks: 70, attendance: 79, quiz: 66, assignments: 82 },
    { label: 'Jun', marks: 68, attendance: 76, quiz: 64, assignments: 80 },
    { label: 'Jul', marks: 66, attendance: 73, quiz: 62, assignments: 78 },
    { label: 'Aug', marks: 64, attendance: 70, quiz: 60, assignments: 75 },
    { label: 'Sep', marks: 62, attendance: 68, quiz: 57, assignments: 72 },
    { label: 'Oct', marks: 55, attendance: 66, quiz: 51, assignments: 70 },
  ],
  Semester: [
    { label: 'Sem 1', marks: 76, attendance: 88, quiz: 74, assignments: 90 },
    { label: 'Sem 2', marks: 74, attendance: 86, quiz: 72, assignments: 88 },
    { label: 'Sem 3', marks: 72, attendance: 84, quiz: 70, assignments: 85 },
    { label: 'Sem 4', marks: 70, attendance: 80, quiz: 67, assignments: 82 },
    { label: 'Sem 5', marks: 66, attendance: 74, quiz: 62, assignments: 78 },
    { label: 'Sem 6', marks: 55, attendance: 66, quiz: 51, assignments: 70 },
  ],
}

export const PERFORMANCE_SERIES = SERIES

// --- aggregate analytics (teacher / institution) ---------------------------

export const RISK_TREND = [
  { month: 'May', high: 12, medium: 26, low: 40 },
  { month: 'Jun', high: 14, medium: 25, low: 39 },
  { month: 'Jul', high: 17, medium: 27, low: 36 },
  { month: 'Aug', high: 19, medium: 28, low: 34 },
  { month: 'Sep', high: 21, medium: 27, low: 34 },
  { month: 'Oct', high: 22, medium: 28, low: 32 },
]

export const ATTENDANCE_VS_PERFORMANCE = STUDENTS.map((s) => ({
  name: s.name.split(' ')[0],
  attendance: s.attendance,
  performance: s.overallPerformance,
  risk: s.risk,
}))

export const SUBJECT_RISK = [
  { subject: 'Machine Learning', high: 9, medium: 7, low: 4 },
  { subject: 'Computer Networks', high: 7, medium: 8, low: 5 },
  { subject: 'Cyber Security', high: 6, medium: 8, low: 6 },
  { subject: 'Data Structures', high: 4, medium: 9, low: 7 },
  { subject: 'Database Management', high: 3, medium: 8, low: 9 },
  { subject: 'Software Engineering', high: 2, medium: 7, low: 11 },
]

export const DEPARTMENT_PERFORMANCE = [
  { department: 'Computer Science & Engineering', performance: 68, attendance: 74, students: 9 },
  { department: 'Information Technology', performance: 72, attendance: 79, students: 4 },
  { department: 'Electronics & Communication', performance: 64, attendance: 71, students: 3 },
  { department: 'Mechanical Engineering', performance: 70, attendance: 76, students: 3 },
  { department: 'Civil Engineering', performance: 74, attendance: 80, students: 3 },
  { department: 'Artificial Intelligence & Data Science', performance: 71, attendance: 78, students: 2 },
]

export const SEMESTER_COMPARISON = [
  { semester: 'Sem 1', performance: 74, attendance: 84, completion: 88 },
  { semester: 'Sem 3', performance: 72, attendance: 81, completion: 85 },
  { semester: 'Sem 5', performance: 66, attendance: 74, completion: 79 },
]

export const DROPOUT_RISK_TREND = [
  { month: 'May', flagged: 9, intervened: 4 },
  { month: 'Jun', flagged: 11, intervened: 6 },
  { month: 'Jul', flagged: 14, intervened: 8 },
  { month: 'Aug', flagged: 16, intervened: 11 },
  { month: 'Sep', flagged: 18, intervened: 14 },
  { month: 'Oct', flagged: 20, intervened: 17 },
]

export const PLATFORM_SIGNUP_TREND = [
  { month: 'May', signups: 120, active: 96 },
  { month: 'Jun', signups: 168, active: 131 },
  { month: 'Jul', signups: 214, active: 172 },
  { month: 'Aug', signups: 262, active: 210 },
  { month: 'Sep', signups: 318, active: 259 },
  { month: 'Oct', signups: 374, active: 312 },
]

export const PROGRAMS = [
  { id: 'PRG-01', name: 'B.Tech Computer Science & Engineering', level: 'Undergraduate', institutions: 6, students: 4120, duration: '4 years', status: 'Active' },
  { id: 'PRG-02', name: 'B.Tech Information Technology', level: 'Undergraduate', institutions: 5, students: 2480, duration: '4 years', status: 'Active' },
  { id: 'PRG-03', name: 'B.Tech Electronics & Communication', level: 'Undergraduate', institutions: 4, students: 1860, duration: '4 years', status: 'Active' },
  { id: 'PRG-04', name: 'M.Tech Artificial Intelligence', level: 'Postgraduate', institutions: 3, students: 640, duration: '2 years', status: 'Active' },
  { id: 'PRG-05', name: 'MCA', level: 'Postgraduate', institutions: 4, students: 910, duration: '2 years', status: 'Active' },
  { id: 'PRG-06', name: 'B.Sc Data Science', level: 'Undergraduate', institutions: 2, students: 380, duration: '3 years', status: 'Inactive' },
]

export const PLATFORM_USERS = [
  { id: 'PU-01', name: 'Ananya Iyer', email: 'ananya.iyer@demo.com', role: 'Student', institution: 'SRM Institute of Technology', status: 'Active', lastActive: '2 hours ago' },
  { id: 'PU-02', name: 'Dr. Priya Raghavan', email: 'teacher@demo.com', role: 'Teacher', institution: 'SRM Institute of Technology', status: 'Active', lastActive: '20 minutes ago' },
  { id: 'PU-03', name: 'S. Krishnan', email: 'college@demo.com', role: 'Institution Admin', institution: 'SRM Institute of Technology', status: 'Active', lastActive: 'Yesterday' },
  { id: 'PU-04', name: 'Rahul Verma', email: 'rahul.verma@demo.com', role: 'Student', institution: 'SRM Institute of Technology', status: 'Active', lastActive: '1 day ago' },
  { id: 'PU-05', name: 'Prof. Arun Kumar', email: 'arun.kumar@srmist.edu.in', role: 'Teacher', institution: 'SRM Institute of Technology', status: 'Active', lastActive: '3 hours ago' },
  { id: 'PU-06', name: 'Meera Krishnan', email: 'meera.krishnan@demo.com', role: 'Student', institution: 'Vellore Institute of Learning', status: 'Suspended', lastActive: '6 days ago' },
  { id: 'PU-07', name: 'Dr. Neha Sharma', email: 'neha.sharma@srmist.edu.in', role: 'Teacher', institution: 'SRM Institute of Technology', status: 'Active', lastActive: '40 minutes ago' },
  { id: 'PU-08', name: 'EduSense Platform Admin', email: 'admin@demo.com', role: 'Organization Admin', institution: 'EduSense AI', status: 'Active', lastActive: 'Now' },
  { id: 'PU-09', name: 'Kavya Menon', email: 'kavya.menon@demo.com', role: 'Student', institution: 'Amrita School of Computing', status: 'Active', lastActive: '5 hours ago' },
  { id: 'PU-10', name: 'Aisha Khan', email: 'aisha.khan@demo.com', role: 'Student', institution: 'Anna University College of Engineering', status: 'Active', lastActive: 'Yesterday' },
]

// --- interventions ---------------------------------------------------------

export const INTERVENTIONS: Intervention[] = [
  { id: 'INT-01', studentId: 'STU-003', studentName: 'Karan Mehta', risk: 'High', intervention: 'Weekly mentor check-in', note: 'Flagged for chronic absenteeism. Class mentor to meet every Monday.', status: 'In Progress', followUpDate: isoFromNow(4), updatedAt: isoFromNow(-3) },
  { id: 'INT-02', studentId: 'STU-002', studentName: 'Rahul Verma', risk: 'High', intervention: 'Assignment backlog clearance plan', note: 'Four pending submissions. Set a two-per-week target with subject teachers.', status: 'Pending', followUpDate: isoFromNow(6), updatedAt: isoFromNow(-2) },
  { id: 'INT-03', studentId: 'STU-001', studentName: 'Ananya Iyer', risk: 'High', intervention: 'Attendance contract + tutoring', note: 'Attendance dropped below 70%. Referred to peer tutoring for Machine Learning.', status: 'In Progress', followUpDate: isoFromNow(3), updatedAt: isoFromNow(-1) },
  { id: 'INT-04', studentId: 'STU-009', studentName: 'Rohit Gupta', risk: 'Medium', intervention: 'Quiz practice schedule', note: 'Quiz average recovering. Continue alternate-day practice tests.', status: 'Completed', followUpDate: isoFromNow(-4), updatedAt: isoFromNow(-4) },
  { id: 'INT-05', studentId: 'STU-005', studentName: 'Arjun Reddy', risk: 'High', intervention: 'Parent–faculty meeting', note: 'Acute drop in internal assessment scores. Meeting scheduled with guardian.', status: 'Pending', followUpDate: isoFromNow(9), updatedAt: isoFromNow(-5) },
  { id: 'INT-06', studentId: 'STU-015', studentName: 'Nikhil Rao', risk: 'Medium', intervention: 'Study plan review', note: 'Self-study hours below target. Shared a weekly timetable template.', status: 'Completed', followUpDate: isoFromNow(-7), updatedAt: isoFromNow(-6) },
]

// --- notifications ---------------------------------------------------------

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'NOT-01', title: 'Risk level changed', message: 'Your demo risk level changed from Medium to High after the latest assessment cycle.', type: 'risk', createdAt: isoFromNow(-0.2), read: false, link: '/student/risk-analysis', roles: ['student'] },
  { id: 'NOT-02', title: 'New recommendation available', message: '“Improve Class Attendance” was added to your personalised action plan.', type: 'recommendation', createdAt: isoFromNow(-0.6), read: false, link: '/student/recommendations', roles: ['student'] },
  { id: 'NOT-03', title: 'Quiz deadline approaching', message: 'Graph Algorithms Quiz is due in 2 days. Review graphs and hashing before attempting.', type: 'assessment', createdAt: isoFromNow(-1), read: false, link: '/student/assessments', roles: ['student'] },
  { id: 'NOT-04', title: 'Assignment overdue', message: 'Decision Trees Assignment (Machine Learning) is past its due date.', type: 'assessment', createdAt: isoFromNow(-2), read: true, link: '/student/assessments', roles: ['student'] },
  { id: 'NOT-05', title: 'Teacher added an intervention note', message: 'Dr. Priya Raghavan added a note to your support plan.', type: 'teacher', createdAt: isoFromNow(-3), read: true, link: '/student/progress', roles: ['student'] },
  { id: 'NOT-06', title: 'Attendance alert', message: 'Machine Learning attendance is at 58%, below the recommended 75%.', type: 'risk', createdAt: isoFromNow(-4), read: true, link: '/student/attendance', roles: ['student'] },

  { id: 'NOT-11', title: '3 students moved to high risk', message: 'The latest prediction cycle flagged 3 additional students for early intervention.', type: 'risk', createdAt: isoFromNow(-0.3), read: false, link: '/teacher/risk-monitor', roles: ['teacher'] },
  { id: 'NOT-12', title: 'Follow-up due', message: 'Ananya Iyer — attendance contract follow-up is due in 3 days.', type: 'system', createdAt: isoFromNow(-0.8), read: false, link: '/teacher/interventions', roles: ['teacher'] },
  { id: 'NOT-13', title: 'Intervention completed', message: 'Rohit Gupta quiz practice schedule was marked completed.', type: 'progress', createdAt: isoFromNow(-4), read: true, link: '/teacher/interventions', roles: ['teacher'] },
  { id: 'NOT-14', title: 'Assessment submissions pending', message: '12 of 20 students have not submitted the Routing Protocols assignment.', type: 'assessment', createdAt: isoFromNow(-2), read: true, link: '/teacher/assessments', roles: ['teacher'] },

  { id: 'NOT-21', title: 'At-risk population increased', message: 'At-risk students rose from 19 to 22 this month across all departments.', type: 'risk', createdAt: isoFromNow(-0.5), read: false, link: '/institution/analytics', roles: ['institution'] },
  { id: 'NOT-22', title: 'Monthly report ready', message: 'The October institutional risk & performance report is ready to download.', type: 'system', createdAt: isoFromNow(-2), read: true, link: '/institution/reports', roles: ['institution'] },

  { id: 'NOT-31', title: 'New institution onboarded', message: 'Sathyabama Science & Technology completed platform registration.', type: 'system', createdAt: isoFromNow(-1), read: false, link: '/admin/institutions', roles: ['organization'] },
  { id: 'NOT-32', title: 'Monthly platform digest', message: '374 signups and 312 active users were recorded in October.', type: 'progress', createdAt: isoFromNow(-3), read: true, link: '/admin/analytics', roles: ['organization'] },
]

// --- learning plan ---------------------------------------------------------

export const LEARNING_TASKS: LearningTask[] = [
  { id: 'LT-01', day: 'Monday', subject: 'Data Structures', topic: 'Trees — traversal & balancing', minutes: 45, done: true, resource: 'CS-301 lecture notes, units 4–5' },
  { id: 'LT-02', day: 'Monday', subject: 'Machine Learning', topic: 'Regression — cost functions', minutes: 20, done: true, resource: 'Practice set A (Q1–Q10)' },
  { id: 'LT-03', day: 'Tuesday', subject: 'Machine Learning', topic: 'Decision trees & pruning', minutes: 60, done: true, resource: 'CS-302 lecture + 1 case study' },
  { id: 'LT-04', day: 'Wednesday', subject: 'Database Management', topic: 'Normalization 1NF → BCNF', minutes: 30, done: false, resource: 'Normalization worksheet' },
  { id: 'LT-05', day: 'Wednesday', subject: 'Database Management', topic: 'SQL joins practice', minutes: 20, done: false, resource: '20 SQL query problems' },
  { id: 'LT-06', day: 'Thursday', subject: 'Computer Networks', topic: 'Routing algorithms', minutes: 45, done: false, resource: 'CS-304 slides, chapter 6' },
  { id: 'LT-07', day: 'Friday', subject: 'Cyber Security', topic: 'Symmetric & asymmetric ciphers', minutes: 60, done: false, resource: 'Cryptography reading + quiz' },
  { id: 'LT-08', day: 'Saturday', subject: 'Data Structures', topic: 'Graphs — BFS, DFS, Dijkstra', minutes: 45, done: false, resource: 'Previous year questions' },
  { id: 'LT-09', day: 'Saturday', subject: 'Machine Learning', topic: 'Model evaluation metrics', minutes: 30, done: false, resource: 'F1 / precision–recall notes' },
]

export const LEARNING_RESOURCES = [
  { title: 'Trees & Graphs — Revision Sheet', subject: 'Data Structures', type: 'Notes', minutes: 15 },
  { title: 'Decision Tree Worked Examples', subject: 'Machine Learning', type: 'Practice', minutes: 30 },
  { title: 'Normalization Cheat Sheet', subject: 'Database Management', type: 'Notes', minutes: 10 },
  { title: 'Routing Protocols Explained', subject: 'Computer Networks', type: 'Video', minutes: 22 },
  { title: 'Cryptography Fundamentals Quiz', subject: 'Cyber Security', type: 'Quiz', minutes: 12 },
]

export const PROGRESS_TIMELINE = [
  { id: 'PT-01', date: isoFromNow(-6), title: 'Attendance improved from 61% to 66%', detail: 'Two consecutive weeks of full attendance in Data Structures.', tone: 'success' as const },
  { id: 'PT-02', date: isoFromNow(-12), title: 'Quiz performance improved by 9%', detail: 'Database Management quiz average moved from 49% to 58%.', tone: 'success' as const },
  { id: 'PT-03', date: isoFromNow(-16), title: '2 high-priority recommendations completed', detail: 'Cleared the Normalization and SDLC case study submissions.', tone: 'success' as const },
  { id: 'PT-04', date: isoFromNow(-22), title: 'Risk moved from Medium to High', detail: 'Attendance and internal assessment shortfalls crossed the demo threshold.', tone: 'danger' as const },
  { id: 'PT-05', date: isoFromNow(-30), title: 'Machine Learning attendance fell below 60%', detail: 'Triggered the early-warning alert and an intervention note.', tone: 'warning' as const },
]

// --- FAQ (landing page) ----------------------------------------------------

export const FAQS = [
  {
    q: 'What exactly does EduSense AI predict?',
    a: 'It estimates a student’s academic risk level — Low, Medium or High — from inputs such as attendance, previous semester marks, internal assessments, quiz scores, assignment completion and self-study activity. It then explains which of those inputs drove the estimate.',
  },
  {
    q: 'Is a real machine-learning model running in this prototype?',
    a: 'No. This build uses a transparent, rule-based mock prediction service that runs in the browser. The interface, data contract and explainability layer are shaped exactly like a future FastAPI + ML backend, so the UI can be connected to a trained model without being rebuilt.',
  },
  {
    q: 'How does the explainability layer work?',
    a: 'Each input is compared with a healthy benchmark and weighted by its relative importance. The result is presented as a percentage contribution per factor — the same shape a SHAP feature-importance response would return from a real backend.',
  },
  {
    q: 'Who is the platform for?',
    a: 'Students see their own risk, reasons and action plan. Teachers monitor cohort risk and manage interventions. Institution admins get department-level analytics. Organization administrators manage tenants, programs and platform-wide metrics.',
  },
  {
    q: 'Does this replace teacher judgement?',
    a: 'No. EduSense AI is designed to support early academic intervention, not to replace teachers, label students or guarantee outcomes. All risk scores in this build are demo values.',
  },
  {
    q: 'Can I demonstrate it end-to-end?',
    a: 'Yes — the project ships with demo credentials for all four roles, seeded data for 24 students, 6 subjects, assessments, quizzes, interventions and notifications, all persisted in your browser.',
  },
]

export const PRODUCT_PREVIEW_TONES = AVATAR_TONES
