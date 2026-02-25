'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Textarea } from 'flowbite-react';
import { useAuth } from '@/context/AuthContext';
import { getCookie, setCookie } from 'cookies-next/client';

const SURVEY_COMPLETED_KEY = 'survey_completed_at';
const SURVEY_SKIPPED_KEY = 'survey_skipped_at';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

function shouldShowSurvey(): boolean {
  const completedAt = getCookie(SURVEY_COMPLETED_KEY);
  const skippedAt = getCookie(SURVEY_SKIPPED_KEY);

  if (typeof completedAt === 'string') {
    const elapsed = Date.now() - parseInt(completedAt, 10);
    if (elapsed < THIRTY_DAYS_MS) return false;
  }

  if (typeof skippedAt === 'string') {
    const elapsed = Date.now() - parseInt(skippedAt, 10);
    if (elapsed < FORTY_EIGHT_HOURS_MS) return false;
  }

  return true;
}

export default function SurveyModal() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    experienceRating: 0,
    helpedGetClients: '',
    helpedGetProjects: '',
    recommendationScore: -1,
    additionalComments: '',
  });

  useEffect(() => {
    if (user?.uid && shouldShowSurvey()) {
      setShow(true);
    }
  }, [user?.uid]);

  const handleSkip = () => {
    setCookie(SURVEY_SKIPPED_KEY, Date.now().toString(), {
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
    });
    setShow(false);
  };

  const handleSubmit = async () => {
    if (!user?.uid) return;
    if (
      form.experienceRating < 1 ||
      !form.helpedGetClients ||
      !form.helpedGetProjects ||
      form.recommendationScore < 0
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          experienceRating: form.experienceRating,
          helpedGetClients: form.helpedGetClients,
          helpedGetProjects: form.helpedGetProjects,
          recommendationScore: form.recommendationScore,
          additionalComments: form.additionalComments || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al enviar');

      setCookie(SURVEY_COMPLETED_KEY, Date.now().toString(), {
        maxAge: 60 * 60 * 24 * 60, // 60 days
        path: '/',
      });
      setShow(false);
    } catch (err) {
      console.error('Error submitting survey:', err);
    } finally {
      setLoading(false);
    }
  };

  const questions = [
    {
      id: 'experienceRating',
      title: '¿Cómo calificarías tu experiencia general con la plataforma?',
      type: 'rating',
      required: true,
    },
    {
      id: 'helpedGetClients',
      title: '¿La plataforma te ha ayudado a conseguir clientes?',
      type: 'select',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' },
        { label: 'En parte', value: 'en-parte' },
      ],
      required: true,
    },
    {
      id: 'helpedGetProjects',
      title: '¿La plataforma te ha ayudado a conseguir proyectos?',
      type: 'select',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' },
        { label: 'En parte', value: 'en-parte' },
      ],
      required: true,
    },
    {
      id: 'recommendationScore',
      title: '¿Qué tan probable es que recomiendes la plataforma a otros? (0 = Poco probable, 10 = Muy probable)',
      type: 'nps',
      required: true,
    },
    {
      id: 'additionalComments',
      title: '¿Tienes algún comentario o sugerencia adicional? (Opcional)',
      type: 'textarea',
      required: false,
    },
  ];

  const currentQ = questions[step];
  const canSubmit =
    (currentQ?.id === 'experienceRating' && form.experienceRating >= 1) ||
    (currentQ?.id === 'helpedGetClients' && form.helpedGetClients) ||
    (currentQ?.id === 'helpedGetProjects' && form.helpedGetProjects) ||
    (currentQ?.id === 'recommendationScore' && form.recommendationScore >= 0 && form.recommendationScore <= 10) ||
    (currentQ?.id === 'additionalComments');

  const isLastStep = step === questions.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  };

  if (!show) return null;

  return (
    <Modal show={show} onClose={handleSkip} size="lg" dismissible={false}>
      <Modal.Header>
        <span className="text-lg font-semibold">
          Cuestionario de experiencia - Pregunta {step + 1} de {questions.length}
        </span>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">{currentQ?.title}</p>

          {currentQ?.type === 'rating' && (
            <div className="grid grid-cols-5 gap-4 justify-items-center">
              {[
                { n: 1, label: 'Muy insatisfecho' },
                { n: 2, label: 'Insatisfecho' },
                { n: 3, label: 'Regular' },
                { n: 4, label: 'Satisfecho' },
                { n: 5, label: 'Muy satisfecho' },
              ].map(({ n, label }) => (
                <div key={n} className="flex flex-col items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, experienceRating: n }))}
                    className={`w-12 h-12 rounded-full border-2 text-lg font-semibold transition flex-shrink-0 ${
                      form.experienceRating === n
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-blue-400 text-gray-600'
                    }`}
                  >
                    {n}
                  </button>
                  <span className="text-xs text-gray-600 text-center w-full">{label}</span>
                </div>
              ))}
            </div>
          )}

          {currentQ?.type === 'select' && currentQ.options && (
            <div className="flex flex-col gap-2">
              {currentQ.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={currentQ.id}
                    value={opt.value}
                    checked={
                      (currentQ.id === 'helpedGetClients' && form.helpedGetClients === opt.value) ||
                      (currentQ.id === 'helpedGetProjects' && form.helpedGetProjects === opt.value)
                    }
                    onChange={() =>
                      setForm((f) => ({
                        ...f,
                        [currentQ.id]: opt.value,
                      }))
                    }
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {currentQ?.type === 'nps' && (
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, recommendationScore: n }))}
                    className={`w-10 h-10 rounded border-2 text-sm font-semibold transition ${
                      form.recommendationScore === n
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-blue-400 text-gray-600'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">0 = Muy improbable · 10 = Muy probable</p>
            </div>
          )}

          {currentQ?.type === 'textarea' && (
            <Textarea
              rows={4}
              placeholder="Escribe tus comentarios..."
              value={form.additionalComments}
              onChange={(e) => setForm((f) => ({ ...f, additionalComments: e.target.value }))}
            />
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Omitir por ahora
          </button>
          <Button color="blue" onClick={handleNext} disabled={!canSubmit || loading}>
            {loading ? 'Enviando...' : isLastStep ? 'Enviar' : 'Siguiente'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
