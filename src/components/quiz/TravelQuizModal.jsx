import { ArrowLeft, ArrowRight, Check, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { QUIZ_QUESTIONS } from '../../utils/travelQuiz.js'
import styles from './TravelQuizModal.module.css'

function TravelQuizModal({ initialAnswers = {}, onClose, onComplete }) {
  const closeButtonRef = useRef(null)
  const [answers, setAnswers] = useState(initialAnswers)
  const [questionIndex, setQuestionIndex] = useState(0)
  const question = QUIZ_QUESTIONS[questionIndex]
  const selectedAnswer = answers[question.id]
  const isLastQuestion = questionIndex === QUIZ_QUESTIONS.length - 1

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const selectAnswer = (value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [question.id]: value,
    }))
  }

  const continueQuiz = () => {
    if (!selectedAnswer) return

    if (isLastQuestion) {
      onComplete(answers)
      return
    }

    setQuestionIndex((currentIndex) => currentIndex + 1)
  }

  return createPortal(
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <section
        aria-labelledby="travel-quiz-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
      >
        <header className={styles.header}>
          <span className={styles.quizIcon} aria-hidden="true">
            <Sparkles size={22} />
          </span>
          <div>
            <strong>Quiz de viagem</strong>
            <span>
              Pergunta {questionIndex + 1} de {QUIZ_QUESTIONS.length}
            </span>
          </div>
          <button
            aria-label="Fechar quiz"
            className={styles.closeButton}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X size={19} />
          </button>
        </header>

        <div className={styles.progress} aria-hidden="true">
          <span
            style={{
              width: `${((questionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>

        <div className={styles.question} key={question.id}>
          <span>Preferências pessoais</span>
          <h2 id="travel-quiz-title">{question.title}</h2>
          <p>{question.description}</p>

          <div
            aria-label={question.title}
            className={styles.options}
            role="radiogroup"
          >
            {question.options.map((option) => {
              const isSelected = selectedAnswer === option.value

              return (
                <button
                  aria-checked={isSelected}
                  className={isSelected ? styles.selectedOption : ''}
                  key={option.value}
                  onClick={() => selectAnswer(option.value)}
                  role="radio"
                  type="button"
                >
                  <span>{option.label}</span>
                  <i aria-hidden="true">
                    {isSelected && <Check size={16} strokeWidth={2.5} />}
                  </i>
                </button>
              )
            })}
          </div>
        </div>

        <footer className={styles.footer}>
          <button
            className={styles.backButton}
            disabled={questionIndex === 0}
            onClick={() => setQuestionIndex((currentIndex) => currentIndex - 1)}
            type="button"
          >
            <ArrowLeft size={17} />
            Anterior
          </button>
          <button
            className={styles.continueButton}
            disabled={!selectedAnswer}
            onClick={continueQuiz}
            type="button"
          >
            {isLastQuestion ? 'Ver sugestões' : 'Continuar'}
            {isLastQuestion ? <Sparkles size={17} /> : <ArrowRight size={17} />}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}

export default TravelQuizModal
