import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { trackPromise, usePromiseTracker } from 'react-promise-tracker'
import parse from 'html-react-parser'
import LoadingIndicator from './LoadingIndicator'
import Question from './Question'

export default function App() {
  const [quizData, setQuizData] = useState([])
  const [quizStatus, setQuizStatus] = useState({
    started: false,
    gameOver: false,
  })
  const [score, setScore] = useState({ total: 0, questions: 0 })
  const { promiseInProgress } = usePromiseTracker()

  useEffect(() => {
    async function getQuizData() {
      const response = await fetch(
        'https://opentdb.com/api.php?amount=5&category=11&type=multiple'
      )
      const data = await response.json()
      setQuizData(processData(data.results))
    }

    const delayLoading = new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })

    if (!quizStatus.gameOver && quizStatus.started) {
      trackPromise(delayLoading)
      trackPromise(getQuizData())
    }
  }, [quizStatus])

  function processData(data) {
    return data.map((item) => ({
      id: nanoid(),
      question: parse(item.question),
      correctAnswer: item.correct_answer,
      answerChoices: parseArray(
        shuffle([...item.incorrect_answers, item.correct_answer])
      ),
      selectedAnswer: '',
    }))
  }

  function parseArray(array) {
    return array.map((value) => parse(value))
  }

  function shuffle(items) {
    return items
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }

  function startGame() {
    setQuizStatus({
      started: true,
      gameOver: false,
    })
  }

  function endGame() {
    setQuizStatus((prevQuizStatus) => ({
      ...prevQuizStatus,
      gameOver: true,
    }))
  }

  function selectAnswer(e) {
    const { value, name } = e.target
    setQuizData((prevQuizData) =>
      prevQuizData.map((data) => ({
        ...data,
        selectedAnswer: data.id === name ? value : data.selectedAnswer,
      }))
    )
  }

  function checkAnswers() {
    const newScoreTotal = quizData.reduce(
      (accumulator, data) =>
        data.correctAnswer === data.selectedAnswer
          ? accumulator + 1
          : accumulator,
      0
    )
    setScore({ total: newScoreTotal, questions: quizData.length })
  }

  const questions = quizData.map((data) => (
    <Question
      key={data.id}
      id={data.id}
      question={parse(data.question)}
      answerChoices={data.answerChoices}
      selectedAnswer={data.selectedAnswer}
      correctAnswer={data.correctAnswer}
      gameOver={quizStatus.gameOver}
      handleChange={selectAnswer}
    />
  ))

  if (promiseInProgress) return <LoadingIndicator />

  if (quizStatus.started)
    return (
      <div>
        <div className="questions">{questions}</div>
        <div className="controls">
          {quizStatus.gameOver ? (
            <>
              <span className="score">
                You scored {score.total}/{score.questions} correct answers
              </span>
              <button
                className="button--small"
                type="button"
                onClick={startGame}
              >
                Play again
              </button>
            </>
          ) : (
            <button
              className="button--small"
              type="button"
              onClick={() => {
                checkAnswers()
                endGame()
              }}
            >
              Check answer
            </button>
          )}
        </div>
      </div>
    )

  return (
    <div className="start-screen">
      <h1>Quizzical</h1>
      <h3>Test your movie knowledge</h3>
      <button className="button--large" type="button" onClick={startGame}>
        Start quiz
      </button>
    </div>
  )
}
