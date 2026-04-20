export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

export const quizData: Question[] = [
  {
    id: 1,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    category: "Science",
  },
  {
    id: 2,
    question: "What is the capital city of Japan?",
    options: ["Beijing", "Seoul", "Bangkok", "Tokyo"],
    correctAnswer: 3,
    category: "Geography",
  },
  {
    id: 3,
    question: "Who painted the Mona Lisa?",
    options: [
      "Vincent van Gogh",
      "Pablo Picasso",
      "Leonardo da Vinci",
      "Michelangelo",
    ],
    correctAnswer: 2,
    category: "Art",
  },
  {
    id: 4,
    question: "What is the chemical symbol for Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    category: "Science",
  },
  {
    id: 5,
    question: "Which ocean is the largest in the world?",
    options: [
      "Atlantic Ocean",
      "Indian Ocean",
      "Arctic Ocean",
      "Pacific Ocean",
    ],
    correctAnswer: 3,
    category: "Geography",
  },
  {
    id: 6,
    question: "In what year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: 2,
    category: "History",
  },
  {
    id: 7,
    question: "What is the square root of 144?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2,
    category: "Mathematics",
  },
  {
    id: 8,
    question: "Which programming language was created by Guido van Rossum?",
    options: ["Java", "Python", "C++", "Ruby"],
    correctAnswer: 1,
    category: "Technology",
  },
  {
    id: 9,
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Quartz"],
    correctAnswer: 2,
    category: "Science",
  },
  {
    id: 10,
    question: "Which Shakespeare play features the character Hamlet?",
    options: ["Macbeth", "Othello", "Hamlet", "King Lear"],
    correctAnswer: 2,
    category: "Literature",
  },
];
