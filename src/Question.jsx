import { nanoid } from 'nanoid'

export default function Question({
  id,
  question,
  answerChoices,
  selectedAnswer,
  correctAnswer,
  gameOver,
  handleChange,
}) {
  const answerList = answerChoices.map((answer, index) => (
    <div key={nanoid()}>
      <input
        type="radio"
        name={id}
        id={id + index}
        value={answer}
        onChange={handleChange}
        checked={selectedAnswer === answer}
        disabled={gameOver}
      />
      <label
        htmlFor={id + index}
        className={
          gameOver
            ? answer === correctAnswer
              ? 'correct-answer'
              : 'incorrect-answer'
            : undefined
        }
      >
        {answer}
      </label>
    </div>
  ))

  return (
    <div className="question">
      <h2>{question}</h2>
      <div className="answers">{answerList}</div>
    </div>
  )
}
