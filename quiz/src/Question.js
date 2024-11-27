import React, { useState, useEffect } from "react";

const Question = ({ question, currentAnswer, onAnswer }) => {
  const [answer, setAnswer] = useState(currentAnswer);

  useEffect(() => {
    setAnswer(currentAnswer);
  }, [currentAnswer]);

  const handleAnswerChange = (e) => {
    const selectedAnswer = e.target.value;
    setAnswer(selectedAnswer);
    onAnswer(question.id, selectedAnswer);
  };

  return (
    <div className="question">
      <h3>{question.question}</h3>
      <div>
        {question.answers.map((option) => (
          <div key={option}>
            <input
              type="radio"
              id={`${question.id}-${option}`}
              name={question.id}
              value={option}
              checked={answer === option}
              onChange={handleAnswerChange}
            />
            <label htmlFor={`${question.id}-${option}`}>{option}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Question;
