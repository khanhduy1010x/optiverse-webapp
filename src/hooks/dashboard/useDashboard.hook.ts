import { useEffect, useMemo, useState } from 'react';
import flashcardService from '../../services/flashcard.service';
import taskService from '../../services/task.service';
import focusService from '../../services/focus.service';

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flashcard
  const [flashcardToday, setFlashcardToday] = useState(0);
  const [flashcardStreak, setFlashcardStreak] = useState(0);
  const [flashcardChart, setFlashcardChart] = useState<number[]>([]);

  // Flashcard bổ sung
  const [flashcardDueToday, setFlashcardDueToday] = useState(0);
  const [flashcardNew, setFlashcardNew] = useState(0);
  const [flashcardLearning, setFlashcardLearning] = useState(0);
  const [flashcardReviewing, setFlashcardReviewing] = useState(0);
  const [flashcardPercentReviewed, setFlashcardPercentReviewed] = useState(0);
  const [flashcardTotalDeck, setFlashcardTotalDeck] = useState(0);
  const [flashcardTotalCard, setFlashcardTotalCard] = useState(0);
  const [flashcardReviewsThisWeek, setFlashcardReviewsThisWeek] = useState(0);
  type DueTodayPerDeck = { dueTodayCount: number; deckTitle: string };
  const [flashcardDueTodayPerDeck, setFlashcardDueTodayPerDeck] = useState<DueTodayPerDeck[]>([]);
  const [flashcardReviewsByDay, setFlashcardReviewsByDay] = useState<{date: string, count: number}[]>([]);

  // Task
  const [taskCompleted, setTaskCompleted] = useState(0);
  const [taskTotal, setTaskTotal] = useState(0);
  const [taskChart, setTaskChart] = useState<number[]>([]);
  const [taskPercent, setTaskPercent] = useState(0);

  // Focus Timer
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [focusSessions, setFocusSessions] = useState(0);
  const [focusChart, setFocusChart] = useState<number[]>([]);
  const [focusStreak, setFocusStreak] = useState(0);

  // Goal (mock, bạn có thể lấy từ API hoặc user settings)
  const goalFlashcard = 50;
  const goalTask = 10;
  const goalFocus = 150;

  // Achievement (mock)
  const achievement = {
    title: '7-Day Streak!',
    desc: 'You have studied flashcards for 7 days in a row!'
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      const todayISO = new Date().toISOString().slice(0, 10);
      try {
        // Flashcard
        const flashStat = await flashcardService.getFlashcardStatistic();
        console.log('flashStat', flashStat);
        // Cập nhật theo kiểu dữ liệu thực tế user cung cấp
        setFlashcardToday(flashStat?.reviewedCount || 0); // Số lượng đã review hôm nay
        setFlashcardStreak(flashStat?.streak || 0); // Nếu có streak, nếu không thì bỏ
        // flashStat.reviewsByDay là mảng object, cần chuyển thành mảng số cho chart
        setFlashcardChart(
          Array.isArray(flashStat?.reviewsByDay)
            ? flashStat.reviewsByDay.map((d: { count: number }) => d.count || 0)
            : []
        );
        setFlashcardDueToday(flashStat?.dueTodayCount || 0);
        setFlashcardNew(flashStat?.newCount || 0);
        setFlashcardLearning(flashStat?.learningCount || 0);
        setFlashcardReviewing(flashStat?.reviewingCount || 0);
        setFlashcardPercentReviewed(flashStat?.percentReviewed || 0);
        setFlashcardTotalDeck(flashStat?.totalDeckCount || 0);
        setFlashcardTotalCard(flashStat?.totalFlashcardCount || 0);
        setFlashcardReviewsThisWeek(flashStat?.reviewsThisWeekCount || 0);
        setFlashcardDueTodayPerDeck(Array.isArray(flashStat?.dueTodayPerDeck) ? flashStat.dueTodayPerDeck : []);
        setFlashcardReviewsByDay(Array.isArray(flashStat?.reviewsByDay) ? flashStat.reviewsByDay : []);

        // Task
        const tasks = await taskService.fetchAllUserTasks();
        const completed = tasks.filter(t => t.status === 'completed').length;
        setTaskCompleted(completed);
        setTaskTotal(tasks.length);
        // Bar chart: số task hoàn thành mỗi ngày trong tuần (giả lập)
        const weekTask = Array(7).fill(0);
        tasks.forEach(t => {
          if (t.status === 'completed' && t.end_time) {
            const d = new Date(t.end_time as string).getDay();
            weekTask[d]++;
          }
        });
        setTaskChart(weekTask);
        setTaskPercent(tasks.length ? Math.round((completed / tasks.length) * 100) : 0);

        // Focus Timer
        const sessions = await focusService.getFocusTimerList();
        setFocusSessions(sessions.length);
        // Tổng phút tập trung hôm nay
        const todaySessions = sessions.filter(s => s.start_time.startsWith(todayISO));
        const todayMinutes = todaySessions.reduce((sum, s) => {
          const start = new Date(s.start_time);
          const end = new Date(s.end_time);
          return sum + (end.getTime() - start.getTime()) / 60000;
        }, 0);
        setFocusMinutes(Math.round(todayMinutes));
        // Bar chart: tổng phút tập trung mỗi ngày trong tuần (giả lập)
        const weekFocus = Array(7).fill(0);
        sessions.forEach(s => {
          const d = new Date(s.start_time);
          const day = d.getDay();
          const min = (new Date(s.end_time).getTime() - d.getTime()) / 60000;
          weekFocus[day] += min;
        });
        setFocusChart(weekFocus.map(m => Math.round(m)));
        // Streak: số ngày liên tiếp có session (giả lập)
        const days = new Set(sessions.map(s => s.start_time.slice(0, 10)));
        setFocusStreak(days.size);
      } catch (e: unknown) {
        if (e instanceof Error) setError(e.message || 'Failed to load dashboard data');
        else setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return useMemo(() => ({
    loading,
    error,
    flashcardToday,
    flashcardStreak,
    flashcardChart,
    // bổ sung các trường flashcard thực tế
    flashcardDueToday,
    flashcardNew,
    flashcardLearning,
    flashcardReviewing,
    flashcardPercentReviewed,
    flashcardTotalDeck,
    flashcardTotalCard,
    flashcardReviewsThisWeek,
    flashcardDueTodayPerDeck,
    flashcardReviewsByDay,
    taskCompleted,
    taskTotal,
    taskChart,
    taskPercent,
    focusMinutes,
    focusSessions,
    focusChart,
    focusStreak,
    goalFlashcard,
    goalTask,
    goalFocus,
    achievement,
    // Dữ liệu streak cho line chart (giả lập 7 ngày gần nhất)
    streakChart: [1, 2, 3, 4, 5, 6, flashcardStreak],
  }), [loading, error, flashcardToday, flashcardStreak, flashcardChart, taskCompleted, taskTotal, taskChart, taskPercent, focusMinutes, focusSessions, focusChart, focusStreak, goalFlashcard, goalTask, goalFocus, achievement]);
}
