import React, { useState, useEffect } from "react";
import Question from "./Question";
import "./App.css";
import LoginForm from "./LoginForm";
import Header from "./Header";

// Component to display questions and navigate to them
const QuestionList = ({
  questions,
  answers,
  currentQuestionId,
  onNavigate,
}) => {
  return (
    <div className="questions-list">
      <ul>
        {questions.map((question) => {
          const isAnswered = answers.some((a) => a.questionId === question.id);
          const questionClass = isAnswered ? "answered" : "unanswered";

          return (
            <li
              key={question.id}
              onClick={() => onNavigate(question.id)}
              className={`question-item ${questionClass} ${
                currentQuestionId === question.id ? "highlight" : ""
              }`}
            >
              Question {question.id} - {isAnswered ? "Answered" : "Unanswered"}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [user, setUser] = useState(null); // Store user info

  // Fetch questions from the server when the component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }
        const data = await response.json();
        const shuffledQuestions = shuffleQuestions(data); // Shuffle the questions before setting them
        setQuestions(shuffledQuestions);
        if (shuffledQuestions.length > 0) {
          setCurrentQuestionId(shuffledQuestions[0].id); // Initialize with the first question
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []); // This effect runs once after the component is mounted

  const handleAnswer = (questionId, answer) => {
    const updatedAnswers = [...answers];
    const existingAnswerIndex = updatedAnswers.findIndex(
      (a) => a.questionId === questionId
    );

    if (existingAnswerIndex !== -1) {
      updatedAnswers[existingAnswerIndex] = {
        questionId,
        answer
      };
    } else {
      updatedAnswers.push({ questionId, answer });
    }

    setAnswers(updatedAnswers);
  };

  const handleNavigation = (direction) => {
    // Find the index of the current question in the list
    const currentIndex = questions.findIndex((q) => q.id === currentQuestionId);

    // Calculate the new index based on the direction
    const newIndex = currentIndex + direction;

    // Check bounds and update the current question ID if within valid range
    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentQuestionId(questions[newIndex].id);
    }
  };

  const handleNavigateToQuestion = (questionId) => {
    setCurrentQuestionId(questionId);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitted(true);

    // Prepare the payload to send to the backend
    const submissionData = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      answers: answers,
    };

    try {
      // Sending the data to the backend
      const response = await fetch("/submit-answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answers");
      }

      const data = await response.json();
      console.log("Submission response:", data);
    } catch (error) {
      console.error("Error submitting answers:", error);
      alert("There was an error submitting your answers. Please try again.");
    }
  };

  const handleLogin = (name, email) => {
    const userId = `user-${Date.now()}`; // Generate a unique ID
    setUser({ name, email, userId });
    console.log("User Logged In:", { name, email, userId });
  };

  return (
    <div className="App">
      {!user ? (
        <div>
          <Header />
          <br />
          <LoginForm onLogin={handleLogin} />
        </div>
      ) : (
        <div className="quiz-container">
          <div className="sidebar">
            <QuestionList
              questions={questions}
              answers={answers}
              currentQuestionId={currentQuestionId}
              onNavigate={handleNavigateToQuestion}
            />
          </div>
          <div className="main-content">
            <h1>Welcome, {user.name}</h1>
            {!isSubmitted ? (
              <>
                {questions.length > 0 && (
                  <Question
                    question={questions.find((q) => q.id === currentQuestionId)}
                    currentAnswer={
                      answers.find((a) => a.questionId === currentQuestionId)
                        ?.answer || ""
                    }
                    onAnswer={handleAnswer}
                  />
                )}
                <div className="navigation">
                  <button
                    onClick={() => handleNavigation(-1)}
                    disabled={
                      questions.findIndex((q) => q.id === currentQuestionId) ===
                      0
                    }
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleNavigation(1)}
                    disabled={
                      questions.findIndex((q) => q.id === currentQuestionId) ===
                      questions.length - 1
                    }
                  >
                    Next
                  </button>
                </div>
                <button className="submit-all" onClick={handleFinalSubmit}>
                  Submit All
                </button>
              </>
            ) : (
              <div className="summary">
                <h2>Quiz Submitted!</h2>
                <p>Here are your answers:</p>
                <pre>
                {JSON.stringify(answers, null, 2)}
                </pre>
                <p>User ID: {user.userId}</p>
                <p>User Email: {user.email}</p>
                <p>User Name: {user.name}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const shuffleQuestions = (questions) => {
  return questions.sort(() => Math.random() - 0.5).slice(0, 30);
};

export default App;
