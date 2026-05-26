import { http } from "@/shared/api/http";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import type { DictionariesResponse, QuizzesResponse } from "./interfaces";

import "./styles.css";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLanguagePair } from "@/features/user-language-pairs/model/useLanguagePair";

export function Quizzes() {
  const {
    data: quizzes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => http<QuizzesResponse>("/quizzes"),
  });
  const { data: dictionaries } = useQuery({
    queryKey: ["dictionaries"],
    queryFn: () => http<DictionariesResponse>("/dictionaries"),
  });
  const { currentLanguagePair } = useLanguagePair();
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !quizzes) {
    return <div>Error happened</div>;
  }

  const handleAdd = async () => {
    if (isAdding) {
      return;
    }

    if (!dictionaries?.length) {
      toast.error("You don't have any dictionaries yet");
      return;
    }

    const dictionary = dictionaries.find(
      (dict) =>
        dict.source.code === currentLanguagePair?.sourceLanguage.code &&
        dict.target.code === currentLanguagePair?.targetLanguage.code,
    );

    if (!dictionary) {
      toast.error("You don't have a dictionary for the current language pair");
      return;
    }

    setIsAdding(true);

    try {
      const response = await http<{ id: string }>(
        `/dictionaries/${dictionary.id}/generate-quiz`,
        {
          method: "POST",
        },
      );

      navigate("/quizzes/" + response.id);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create quiz: ${msg}`);
      console.error("Failed to create quiz", error);
    }

    setIsAdding(false);
  };

  return (
    <section className="container-box quizzes">
      <div className="quizzes__header">
        <h1>Your Quizzes</h1>
        <button type="button" className="primary-button" onClick={handleAdd}>
          New Quiz
        </button>
      </div>
      {quizzes.length === 0 && <p>You have no quizzes yet.</p>}
      <ul className="quiz-list">
        {quizzes.map((quiz) => {
          const hasActive = quiz.attempts.some(
            (attempt) => !attempt.completedAt,
          );
          const latest = quiz.attempts.at(0);

          return (
            <li key={quiz.id} className="quiz-list__item">
              <div>
                {quiz.sourceLanguage.name} {"->"} {quiz.targetLanguage.name}
              </div>

              <div className="quiz-list__item-btns">
                {latest && !hasActive && (
                  <span className="quiz-list__item-last">
                    Last attempt: {latest.correct} / {latest.total}
                  </span>
                )}
                <Link
                  to={"/quizzes/" + quiz.id}
                  className="quiz-list__item-start"
                >
                  {hasActive ? "Continue quiz" : "Start quiz"}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
