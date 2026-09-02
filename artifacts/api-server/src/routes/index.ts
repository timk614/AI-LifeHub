import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);

router.get("/dashboard/summary", (_req, res) => {
  res.json({ topicsLearned: 3, practiceSessions: 8, savedItems: 4, planProgress: 68 });
});

router.get("/activity", (_req, res) => {
  res.json([
    { id: "a1", type: "study", title: "Повторение дробей", detail: "StudyAI", time: "Сегодня, 10:24" },
    { id: "a2", type: "market", title: "Проверка MacBook Air", detail: "Барахолка AI", time: "Вчера, 18:40" },
    { id: "a3", type: "plan", title: "План подготовки обновлён", detail: "Математика", time: "Вчера, 15:12" },
  ]);
});

export default router;
