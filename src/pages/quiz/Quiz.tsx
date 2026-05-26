import { http } from "@/shared/api/http";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { QuizResponse } from "../quizzes/interfaces";
import toast from "react-hot-toast";

export function Quiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const {
    data: quiz,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => http<QuizResponse>(`/quizzes/${quizId}`),
    enabled: Boolean(quizId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const initialRef = useRef(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState<Record<string, boolean>>({});
  const [isAnswering, setIsAnswering] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const answeredCount = useMemo(
    () =>
      quiz?.questions.filter(
        (q) => q.answered || answerState[q.id] !== undefined,
      ).length,
    [quiz?.questions, answerState],
  );
  const correctCount = useMemo(
    () =>
      quiz?.questions.filter((q) => {
        const result =
          answerState[q.id] !== undefined ? answerState[q.id] : q.isCorrect;
        return result === true;
      }).length,
    [quiz?.questions, answerState],
  );

  useEffect(() => {
    if (!quiz) {
      return;
    }

    if (!initialRef.current) {
      return;
    }

    initialRef.current = false;

    const idx = quiz.questions.findIndex((q) => !q.answered);

    if (idx > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex(idx);
    }
  }, [quiz]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !quiz) {
    return <div>Error happened</div>;
  }

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      await http(`/quizzes/${quizId}/complete`, { method: "POST" });
    } catch (err) {
      console.error("Failed to complete quiz", err);
      toast.error("Failed to complete quiz");
    }

    setIsCompleting(false);
  };

  const handleAnswer = async (questionId: string, answer: string) => {
    setIsAnswering(true);

    try {
      const response = await http<{ isCorrect: boolean }>(
        `/quizzes/${quizId}/${questionId}/answer`,
        { method: "POST", body: JSON.stringify({ answer }) },
      );

      setAnswerState((prev) => ({ ...prev, [questionId]: response.isCorrect }));
    } catch (err) {
      console.error("Failed to submit answer", err);
      toast.error("Failed to submit answer");
    }

    setIsAnswering(false);
  };

  const total = quiz.questions.length;
  const currentQuestion = quiz.questions[currentIndex];

  const currentAnswered =
    currentQuestion.answered || answerState[currentQuestion.id] !== undefined;

  const currentIsCorrect =
    answerState[currentQuestion.id] !== undefined
      ? answerState[currentQuestion.id]
      : currentQuestion.isCorrect;

  const isAllAnswered = answeredCount === total;

  return (
    <section className="container-box quiz-page">
      <header className="quiz-page__header">
        <h1 className="quiz-page__title">
          Quiz: {quiz.sourceLanguage.code.toUpperCase()} to{" "}
          {quiz.targetLanguage.code.toUpperCase()}
        </h1>
        <div className="quiz-page__stats">
          {answeredCount}/{total} answered | {correctCount} correct
        </div>
      </header>

      <div className="quiz-page__counter">
        Question {currentIndex + 1} / {total}
      </div>

      <article className="quiz-page__card">
        <h2 className="quiz-page__question">{currentQuestion.text}</h2>
        <p className="quiz-page__question-hint">
          {currentQuestion.type === "s2t_translate"
            ? "Translate to target language"
            : "Translate to source language"}
        </p>

        <div className="quiz-page__options">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isAnswering || currentAnswered}
              onClick={() => handleAnswer(currentQuestion.id, option.text)}
              className="quiz-page__option"
            >
              {option.text}
            </button>
          ))}
        </div>

        {currentAnswered && (
          <p
            className={
              currentIsCorrect === true
                ? "quiz-page__result quiz-page__result--correct"
                : "quiz-page__result quiz-page__result--wrong"
            }
          >
            {currentIsCorrect === true ? "Correct answer" : "Wrong answer"}
          </p>
        )}
      </article>

      <footer className="quiz-page__footer">
        <div />
        <div className="quiz-page__footer-actions">
          {currentIndex < total - 1 && (
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) => Math.min(total - 1, prev + 1))
              }
              className="primary-button"
            >
              Next
            </button>
          )}

          {isAllAnswered && (
            <button
              className="primary-button"
              type="button"
              disabled={isCompleting}
              onClick={handleComplete}
            >
              {isCompleting ? "Completing..." : "Complete quiz"}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
