import {
  Profile,
  Idea,
  Goal,
  GoalAlignment,
  Evaluation,
  NotificationItem,
  IdeaStatus,
  GeneratedAssets,
  DiscoveryAnswers,
} from './types';
import {
  DEMO_PROFILES,
  INITIAL_GOALS,
  INITIAL_IDEAS,
  INITIAL_ALIGNMENTS,
  INITIAL_EVALUATIONS,
  INITIAL_NOTIFICATIONS,
} from './seedData';

const STORAGE_KEYS = {
  CURRENT_USER: 'banco_ideias_current_user',
  IDEAS: 'banco_ideias_ideas',
  GOALS: 'banco_ideias_goals',
  ALIGNMENTS: 'banco_ideias_alignments',
  EVALUATIONS: 'banco_ideias_evaluations',
  NOTIFICATIONS: 'banco_ideias_notifications',
};

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Erro ao salvar ${key} no localStorage:`, err);
  }
}

/**
 * Evento único de sincronização. Toda mutação de estado (ideias, metas, perfil,
 * notificações, avaliações) dispara `storage-sync` para que Header e páginas
 * re-renderizem de forma consistente.
 */
export function emitSync(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('storage-sync'));
}

export const StorageService = {
  // --- Perfis e Sessão Atual ---
  getProfiles: (): Profile[] => {
    return DEMO_PROFILES;
  },

  getCurrentUser: (): Profile => {
    const stored = getFromStorage<Profile | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (stored && DEMO_PROFILES.some((p) => p.id === stored.id)) {
      return stored;
    }
    return DEMO_PROFILES[0]; // Padrão: Colaborador João Silva
  },

  setCurrentUser: (profileId: string): Profile => {
    const profile = DEMO_PROFILES.find((p) => p.id === profileId) || DEMO_PROFILES[0];
    saveToStorage(STORAGE_KEYS.CURRENT_USER, profile);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth_changed', { detail: profile }));
    }
    emitSync();
    return profile;
  },

  // --- Ideias ---
  getIdeas: (): Idea[] => {
    return getFromStorage<Idea[]>(STORAGE_KEYS.IDEAS, INITIAL_IDEAS);
  },

  getIdeaById: (id: string): Idea | null => {
    const ideas = StorageService.getIdeas();
    return ideas.find((idea) => idea.id === id) || null;
  },

  saveIdea: (idea: Partial<Idea> & { title: string; problem: string; solution: string; area: string }): Idea => {
    const ideas = StorageService.getIdeas();
    const currentUser = StorageService.getCurrentUser();
    const now = new Date().toISOString();

    if (idea.id) {
      // Atualização
      const index = ideas.findIndex((i) => i.id === idea.id);
      if (index !== -1) {
        const updatedIdea: Idea = {
          ...ideas[index],
          ...idea,
          updated_at: now,
        };
        ideas[index] = updatedIdea;
        saveToStorage(STORAGE_KEYS.IDEAS, ideas);
        emitSync();
        return updatedIdea;
      }
    }

    // Nova Ideia
    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      author_area: currentUser.area,
      title: idea.title,
      problem: idea.problem,
      solution: idea.solution,
      area: idea.area,
      status: idea.status || 'rascunho',
      discovery_answers: idea.discovery_answers || {},
      assets: idea.assets,
      submitted_at: idea.status === 'em_avaliacao' ? now : null,
      created_at: now,
      updated_at: now,
    };

    ideas.unshift(newIdea);
    saveToStorage(STORAGE_KEYS.IDEAS, ideas);
    emitSync();
    return newIdea;
  },

  updateDiscoveryAnswers: (ideaId: string, answers: DiscoveryAnswers): Idea | null => {
    const ideas = StorageService.getIdeas();
    const index = ideas.findIndex((i) => i.id === ideaId);
    if (index === -1) return null;

    ideas[index].discovery_answers = {
      ...ideas[index].discovery_answers,
      ...answers,
    };
    ideas[index].updated_at = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.IDEAS, ideas);
    return ideas[index];
  },

  updateIdeaAssets: (ideaId: string, assets: GeneratedAssets): Idea | null => {
    const ideas = StorageService.getIdeas();
    const index = ideas.findIndex((i) => i.id === ideaId);
    if (index === -1) return null;

    const currentAssets = ideas[index].assets || {};
    const newVersion = (currentAssets.version || 0) + 1;

    ideas[index].assets = {
      ...currentAssets,
      ...assets,
      version: newVersion,
      lastUpdated: new Date().toISOString(),
    };
    ideas[index].updated_at = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.IDEAS, ideas);
    return ideas[index];
  },

  submitIdeaToBank: (ideaId: string): Idea | null => {
    const ideas = StorageService.getIdeas();
    const index = ideas.findIndex((i) => i.id === ideaId);
    if (index === -1) return null;

    const now = new Date().toISOString();
    ideas[index].status = 'em_avaliacao';
    ideas[index].submitted_at = now;
    ideas[index].updated_at = now;
    saveToStorage(STORAGE_KEYS.IDEAS, ideas);

    // Classificação automática imediata frente às metas
    StorageService.autoClassifyIdeaAgainstGoals(ideas[index]);

    return ideas[index];
  },

  // --- Metas Estratégicas ---
  getGoals: (): Goal[] => {
    return getFromStorage<Goal[]>(STORAGE_KEYS.GOALS, INITIAL_GOALS);
  },

  saveGoal: (goalData: Omit<Goal, 'id' | 'created_at' | 'created_by'>): Goal => {
    const goals = StorageService.getGoals();
    const currentUser = StorageService.getCurrentUser();
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    };
    goals.unshift(newGoal);
    saveToStorage(STORAGE_KEYS.GOALS, goals);
    emitSync();
    return newGoal;
  },

  // --- Alinhamentos com Metas ---
  getAlignments: (): GoalAlignment[] => {
    return getFromStorage<GoalAlignment[]>(STORAGE_KEYS.ALIGNMENTS, INITIAL_ALIGNMENTS);
  },

  getAlignmentsByIdeaId: (ideaId: string): GoalAlignment[] => {
    const alignments = StorageService.getAlignments();
    return alignments.filter((a) => a.idea_id === ideaId);
  },

  autoClassifyIdeaAgainstGoals: (idea: Idea): GoalAlignment[] => {
    const goals = StorageService.getGoals();
    const alignments = StorageService.getAlignments();

    // Remove alinhamentos anteriores desta ideia se houver
    const filtered = alignments.filter((a) => a.idea_id !== idea.id);

    // Cruzamento inteligente baseado em palavras-chave e área
    const newAlignments: GoalAlignment[] = goals.map((goal) => {
      let score = 45;
      if (idea.area.toLowerCase() === goal.owner_area.toLowerCase()) {
        score += 30;
      }
      const problemWords = (idea.problem + ' ' + idea.solution + ' ' + (idea.discovery_answers.I_objetivos || '')).toLowerCase();
      const goalKeywords = goal.title.toLowerCase().split(' ');
      const matchCount = goalKeywords.filter((w) => w.length > 3 && problemWords.includes(w)).length;
      score += Math.min(matchCount * 10, 24);

      score = Math.min(Math.max(score, 30), 96);
      const label: 'alta' | 'media' | 'baixa' = score >= 75 ? 'alta' : score >= 50 ? 'media' : 'baixa';

      return {
        id: `align-${Date.now()}-${goal.id}`,
        idea_id: idea.id,
        goal_id: goal.id,
        goal_title: goal.title,
        adherence_score: score,
        adherence_label: label,
        justification: `A IA identificou correlação temática entre a proposta na área de ${idea.area} e os objetivos da meta "${goal.title}", com potencial impacto de alívio operacional no indicador "${goal.indicator}".`,
        created_at: new Date().toISOString(),
      };
    });

    const combined = [...newAlignments, ...filtered];
    saveToStorage(STORAGE_KEYS.ALIGNMENTS, combined);

    // Cria notificação informativa para o autor
    const bestMatch = newAlignments.sort((a, b) => b.adherence_score - a.adherence_score)[0];
    if (bestMatch) {
      StorageService.addNotification({
        user_id: idea.author_id,
        idea_id: idea.id,
        type: 'goal_classified',
        title: 'Classificação Estratégica Concluída',
        message: `Sua ideia obteve adesão ${bestMatch.adherence_label.toUpperCase()} (${bestMatch.adherence_score}%) à meta "${bestMatch.goal_title}".`,
      });
    }

    return newAlignments;
  },

  // --- Avaliações ---
  getEvaluations: (): Evaluation[] => {
    return getFromStorage<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, INITIAL_EVALUATIONS);
  },

  getEvaluationsByIdeaId: (ideaId: string): Evaluation[] => {
    const evals = StorageService.getEvaluations();
    return evals
      .filter((e) => e.idea_id === ideaId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addEvaluation: (ideaId: string, decision: 'aprovada' | 'reprovada' | 'standby', comment?: string): Evaluation => {
    const evals = StorageService.getEvaluations();
    const currentUser = StorageService.getCurrentUser();
    const newEval: Evaluation = {
      id: `eval-${Date.now()}`,
      idea_id: ideaId,
      evaluator_id: currentUser.id,
      evaluator_name: currentUser.full_name,
      decision,
      comment: comment || undefined,
      created_at: new Date().toISOString(),
    };

    evals.unshift(newEval);
    saveToStorage(STORAGE_KEYS.EVALUATIONS, evals);
    emitSync();

    // Atualiza status da ideia
    const ideas = StorageService.getIdeas();
    const ideaIndex = ideas.findIndex((i) => i.id === ideaId);
    if (ideaIndex !== -1) {
      ideas[ideaIndex].status = decision;
      ideas[ideaIndex].updated_at = new Date().toISOString();
      saveToStorage(STORAGE_KEYS.IDEAS, ideas);

      // Dispara notificação in-app para o autor da ideia (US-13)
      const decisionLabel =
        decision === 'aprovada'
          ? 'APROVADA 🎉'
          : decision === 'reprovada'
          ? 'REPROVADA'
          : 'colocada em STANDBY';

      StorageService.addNotification({
        user_id: ideas[ideaIndex].author_id,
        idea_id: ideaId,
        type: 'status_change',
        title: `Ideia ${decisionLabel}`,
        message: `O avaliador ${currentUser.full_name} registrou a decisão: "${decisionLabel}". ${comment ? `Comentário: "${comment}"` : ''}`,
      });
    }

    return newEval;
  },

  // --- Notificações ---
  getNotifications: (userId?: string): NotificationItem[] => {
    const list = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!userId) return list;
    return list.filter((n) => n.user_id === userId);
  },

  addNotification: (item: Omit<NotificationItem, 'id' | 'created_at' | 'read'>): NotificationItem => {
    const list = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      read: false,
      created_at: new Date().toISOString(),
    };
    list.unshift(newNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification_added', { detail: newNotif }));
    }
    emitSync();
    return newNotif;
  },

  markNotificationAsRead: (notificationId: string): void => {
    const list = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const index = list.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      list[index].read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
      emitSync();
    }
  },

  markAllNotificationsAsRead: (userId: string): void => {
    const list = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    list.forEach((n) => {
      if (n.user_id === userId) n.read = true;
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    emitSync();
  },

  // Resetar para dados de demonstração
  resetToSeedData: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.IDEAS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.ALIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  },
};

// Named exports convenientes para as páginas e componentes
export const getIdeas = StorageService.getIdeas;
export const getIdeaById = StorageService.getIdeaById;
export const saveIdea = StorageService.saveIdea;
export const createIdea = (data: Partial<Idea> & { title: string; problem: string; solution: string; area: string }): Idea => {
  return StorageService.saveIdea(data);
};

export const updateIdea = (id: string, updates: Partial<Idea>): Idea | null => {
  const ideas = StorageService.getIdeas();
  const index = ideas.findIndex((i) => i.id === id);
  if (index === -1) return null;
  ideas[index] = {
    ...ideas[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  saveToStorage(STORAGE_KEYS.IDEAS, ideas);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('storage-sync'));
  }
  return ideas[index];
};

export const deleteIdea = (id: string): boolean => {
  const ideas = StorageService.getIdeas();
  const filtered = ideas.filter((i) => i.id !== id);
  saveToStorage(STORAGE_KEYS.IDEAS, filtered);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('storage-sync'));
  }
  return true;
};

export const getGoals = StorageService.getGoals;
export const saveGoal = StorageService.saveGoal;
export const createGoal = (data: {
  title: string;
  description: string;
  indicator: string;
  target_value?: string;
  deadline?: string;
  responsible?: string;
  owner_area?: string;
}): Goal => {
  return StorageService.saveGoal({
    title: data.title,
    description: data.description,
    indicator: data.indicator + (data.target_value ? ` (Alvo: ${data.target_value})` : ''),
    owner_area: data.owner_area || data.responsible || 'Operações',
    deadline: data.deadline || null,
  });
};

export const deleteGoal = (id: string): boolean => {
  const goals = StorageService.getGoals();
  const filtered = goals.filter((g) => g.id !== id);
  saveToStorage(STORAGE_KEYS.GOALS, filtered);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('storage-sync'));
  }
  return true;
};

export const getActiveProfile = (): Profile => {
  const user = StorageService.getCurrentUser();
  return {
    ...user,
    name: user.full_name,
    department: user.area,
  };
};

export const createNotification = (item: {
  user_id: string;
  title: string;
  message: string;
  idea_id?: string;
}) => {
  return StorageService.addNotification({
    user_id: item.user_id,
    idea_id: item.idea_id,
    type: 'system',
    title: item.title,
    message: item.message,
  });
};

export const evaluateIdea = (
  ideaId: string,
  decision: 'aprovada' | 'reprovada' | 'standby',
  evaluatorName: string,
  comment?: string,
  score?: number
) => {
  StorageService.addEvaluation(ideaId, decision, comment);
  if (score !== undefined) {
    updateIdea(ideaId, {
      status: decision,
    });
  }
};

