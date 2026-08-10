'use client';

import { useEffect, useState } from 'react';
import { Card, Spinner, Table, Button } from 'flowbite-react';
import { HiOutlineClipboardList, HiOutlineStar, HiOutlineSpeakerphone, HiOutlineChatAlt2, HiOutlineDownload } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import SuperadminSidebar from '@/components/superadmin/SuperadminSidebar';

const PAGE_SIZES = [20, 50, 100] as const;

// Azul de la serie única (magnitud). Para el NPS se usa el par divergente
// azul↔rojo con gris neutro al centro: polaridad, no identidad.
const SERIES = '#2a78d6';
const NPS_POSITIVE = '#2a78d6';
const NPS_NEUTRAL = '#898781';
const NPS_NEGATIVE = '#d03b3b';

type Choice = 'si' | 'no' | 'en-parte';

const CHOICE_LABELS: Record<Choice, string> = {
  si: 'Sí',
  no: 'No',
  'en-parte': 'En parte',
};

interface SurveySummary {
  total: number;
  avgExperience: number;
  experienceDistribution: { value: number; count: number }[];
  helpedGetClients: Record<Choice, number>;
  helpedGetProjects: Record<Choice, number>;
  avgRecommendation: number;
  recommendationDistribution: { value: number; count: number }[];
  promoters: number;
  passives: number;
  detractors: number;
  npsScore: number;
  withComments: number;
}

interface SurveyResponse {
  _id: string;
  experienceRating?: number;
  helpedGetClients?: Choice;
  helpedGetProjects?: Choice;
  recommendationScore?: number;
  additionalComments?: string;
  submittedAt?: string;
  _createdAt?: string;
  user?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    company?: { _id: string; nameCompany?: string };
  };
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

/** Barra horizontal de una sola serie: la etiqueta lleva la identidad, el color solo la magnitud. */
function DistributionBar({
  label,
  count,
  total,
  color = SERIES,
}: {
  label: string;
  count: number;
  total: number;
  color?: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  // Mantener un hilo visible cuando hay respuestas pero el porcentaje redondea a 0
  const width = count > 0 ? Math.max(pct, 1.5) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-xs text-gray-600">{label}</span>
      <div className="flex-1 h-3 rounded bg-gray-100">
        <div className="h-full rounded" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
      <span className="w-24 shrink-0 text-right text-xs text-gray-500 tabular-nums">
        {count} · {pct}%
      </span>
    </div>
  );
}

export default function SuperadminSurveyView() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SurveySummary | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState<20 | 50 | 100>(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const exportCsv = async () => {
    if (!user?.uid) return;
    setExporting(true);
    try {
      const res = await fetch('/api/superadmin/export?type=survey', {
        headers: { 'x-user-id': user.uid },
      });
      if (!res.ok) throw new Error('No se pudo exportar el cuestionario');

      const disposition = res.headers.get('Content-Disposition') || '';
      const filename =
        disposition.match(/filename="?([^";]+)"?/)?.[1] ||
        `cuestionario-${new Date().toISOString().slice(0, 10)}.csv`;

      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo exportar el cuestionario');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/superadmin/survey?page=${currentPage}&limit=${limit}`, {
          headers: { 'x-user-id': user.uid },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Error al cargar las respuestas');
        setSummary(data.data.summary);
        setResponses(data.data.responses);
        setTotal(data.data.total);
        setError('');
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Error al cargar las respuestas');
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [user?.uid, currentPage, limit]);

  if (loading && !summary) {
    return (
      <div className="flex container mx-auto mt-10">
        <SuperadminSidebar />
        <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0 flex justify-center items-center">
          <Spinner size="xl" />
        </main>
      </div>
    );
  }

  const totalAnswers = summary?.total ?? 0;

  const kpis = [
    {
      label: 'Respuestas recibidas',
      value: totalAnswers.toLocaleString('es-CO'),
      icon: HiOutlineClipboardList,
    },
    {
      label: 'Experiencia promedio',
      value: totalAnswers > 0 ? `${summary?.avgExperience ?? 0} / 5` : '-',
      icon: HiOutlineStar,
    },
    {
      label: 'NPS',
      value: totalAnswers > 0 ? `${summary?.npsScore ?? 0}` : '-',
      icon: HiOutlineSpeakerphone,
      hint: 'Promotores − detractores (−100 a 100)',
    },
    {
      label: 'Con comentarios',
      value: (summary?.withComments ?? 0).toLocaleString('es-CO'),
      icon: HiOutlineChatAlt2,
    },
  ];

  return (
    <div className="flex container mx-auto mt-10">
      <SuperadminSidebar />
      <main className="w-full md:w-3/4 md:pl-10 mt-6 md:mt-0">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Cuestionario de experiencia</h1>
          <Button color="light" onClick={exportCsv} disabled={exporting || totalAnswers === 0}>
            <HiOutlineDownload className="h-5 w-5 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {totalAnswers === 0 && !error ? (
          <p className="text-center text-gray-500 py-12">Todavía no hay respuestas al cuestionario.</p>
        ) : (
          <>
            {/* Indicadores generales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {kpis.map(({ label, value, icon: Icon, hint }) => (
                <Card key={label}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="text-3xl font-bold text-gray-900">{value}</p>
                      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
                    </div>
                    <Icon className="h-10 w-10 text-blue-500 shrink-0" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Distribuciones por pregunta */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <h2 className="text-base font-semibold text-gray-900">
                  ¿Cómo calificarías tu experiencia general con la plataforma?
                </h2>
                <p className="text-xs text-gray-500 -mt-2">1 = Muy insatisfecho · 5 = Muy satisfecho</p>
                <div className="flex flex-col gap-2">
                  {summary?.experienceDistribution.map(({ value, count }) => (
                    <DistributionBar key={value} label={`${value} — ${['Muy insatisfecho', 'Insatisfecho', 'Regular', 'Satisfecho', 'Muy satisfecho'][value - 1]}`} count={count} total={totalAnswers} />
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-base font-semibold text-gray-900">
                  Recomendación (NPS)
                </h2>
                <p className="text-xs text-gray-500 -mt-2">
                  Promedio {summary?.avgRecommendation ?? 0} / 10
                </p>
                <div className="flex flex-col gap-2">
                  <DistributionBar label="Promotores (9-10)" count={summary?.promoters ?? 0} total={totalAnswers} color={NPS_POSITIVE} />
                  <DistributionBar label="Pasivos (7-8)" count={summary?.passives ?? 0} total={totalAnswers} color={NPS_NEUTRAL} />
                  <DistributionBar label="Detractores (0-6)" count={summary?.detractors ?? 0} total={totalAnswers} color={NPS_NEGATIVE} />
                </div>
                <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                  <p className="text-xs font-medium text-gray-600">Detalle por puntaje</p>
                  {summary?.recommendationDistribution.map(({ value, count }) => (
                    <DistributionBar key={value} label={`${value}`} count={count} total={totalAnswers} />
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-base font-semibold text-gray-900">
                  ¿La plataforma te ha ayudado a conseguir clientes?
                </h2>
                <div className="flex flex-col gap-2">
                  {(Object.keys(CHOICE_LABELS) as Choice[]).map((choice) => (
                    <DistributionBar
                      key={choice}
                      label={CHOICE_LABELS[choice]}
                      count={summary?.helpedGetClients[choice] ?? 0}
                      total={totalAnswers}
                    />
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-base font-semibold text-gray-900">
                  ¿La plataforma te ha ayudado a conseguir proyectos?
                </h2>
                <div className="flex flex-col gap-2">
                  {(Object.keys(CHOICE_LABELS) as Choice[]).map((choice) => (
                    <DistributionBar
                      key={choice}
                      label={CHOICE_LABELS[choice]}
                      count={summary?.helpedGetProjects[choice] ?? 0}
                      total={totalAnswers}
                    />
                  ))}
                </div>
              </Card>
            </div>

            {/* Respuestas individuales */}
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Respuestas individuales</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <Table.Head>
                  <Table.HeadCell>Usuario</Table.HeadCell>
                  <Table.HeadCell>Empresa</Table.HeadCell>
                  <Table.HeadCell>Experiencia</Table.HeadCell>
                  <Table.HeadCell>Clientes</Table.HeadCell>
                  <Table.HeadCell>Proyectos</Table.HeadCell>
                  <Table.HeadCell>NPS</Table.HeadCell>
                  <Table.HeadCell>Comentario</Table.HeadCell>
                  <Table.HeadCell>Fecha</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {responses.map((r) => (
                    <Table.Row key={r._id}>
                      <Table.Cell className="font-medium text-gray-900">
                        {[r.user?.firstName, r.user?.lastName].filter(Boolean).join(' ') || 'Usuario eliminado'}
                        {r.user?.email && <span className="block text-xs font-normal text-gray-500">{r.user.email}</span>}
                      </Table.Cell>
                      <Table.Cell>{r.user?.company?.nameCompany || '-'}</Table.Cell>
                      <Table.Cell className="tabular-nums">
                        {typeof r.experienceRating === 'number' ? `${r.experienceRating} / 5` : '-'}
                      </Table.Cell>
                      <Table.Cell>{r.helpedGetClients ? CHOICE_LABELS[r.helpedGetClients] : '-'}</Table.Cell>
                      <Table.Cell>{r.helpedGetProjects ? CHOICE_LABELS[r.helpedGetProjects] : '-'}</Table.Cell>
                      <Table.Cell className="tabular-nums">
                        {typeof r.recommendationScore === 'number' ? r.recommendationScore : '-'}
                      </Table.Cell>
                      <Table.Cell className="max-w-xs">
                        <span className="block truncate" title={r.additionalComments || ''}>
                          {r.additionalComments?.trim() || '-'}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        {formatDate(r.submittedAt || r._createdAt)}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>

            <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Registros por página:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value) as 20 | 50 | 100);
                    setCurrentPage(1);
                  }}
                  className="rounded border border-gray-300 text-sm py-1.5 px-2"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-500">
                  {total > 0
                    ? `${Math.min((currentPage - 1) * limit + 1, total)}-${Math.min(currentPage * limit, total)} de ${total}`
                    : '0 registros'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Anterior
                </Button>
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage * limit >= total || loading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
