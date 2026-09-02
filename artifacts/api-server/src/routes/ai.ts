import { Router, type IRouter } from "express";
import {
  AnalyzeMarketItemBody,
  AnalyzeMarketItemResponse,
  ExplainStudyTopicBody,
  ExplainStudyTopicResponse,
  RespondToChatBody,
  RespondToChatResponse,
  RespondToSafeHelpBody,
  RespondToSafeHelpResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const demoError = (res: Parameters<IRouter["post"]>[1] extends never ? never : any) =>
  res.status(400).json({ error: "Please provide the required information." });

router.post("/ai/market/analyze", (req, res) => {
  const parsed = AnalyzeMarketItemBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid market analysis request");
    return demoError(res);
  }

  const { title, price, currency } = parsed.data;
  const lowerTitle = title.toLowerCase();
  const isTech = /iphone|macbook|airpods|sony|camera|laptop|phone/.test(lowerTitle);
  const estimatedPriceMin = Math.max(10, Math.round(price * 0.85));
  const estimatedPriceMax = Math.round(price * 1.18);
  const difference = Math.round(((price - (estimatedPriceMin + estimatedPriceMax) / 2) / price) * 100);
  const result = AnalyzeMarketItemResponse.parse({
    category: isTech ? "Электроника" : "Вещи и аксессуары",
    brand: isTech ? "Предполагаемый бренд: визуально похоже на популярную модель" : "Бренд не удалось достоверно определить",
    model: isTech ? "Возможная модель по описанию продавца" : "Модель не подтверждена",
    description: `Демо-анализ для «${title}». По одному названию нельзя подтвердить происхождение, комплектацию или подлинность товара.`,
    condition: "Требует проверки продавцом и при личном осмотре",
    estimatedPriceMin,
    estimatedPriceMax,
    currency,
    sellerPrice: price,
    difference,
    confidence: isTech ? 72 : 54,
    thingsToCheck: ["Состояние и следы ремонта", "Комплектацию и документы", "Серийный номер", "Работоспособность всех функций", "Признаки подделки"],
    verdict: difference < -8 ? "good" : difference > 10 ? "expensive" : "fair",
    demo: true,
  });
  res.json(result);
});

router.post("/ai/study/explain", (req, res) => {
  const parsed = ExplainStudyTopicBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid study explanation request");
    return demoError(res);
  }

  const { subject, topic, depth } = parsed.data;
  const detail = depth === "simple" ? "простыми словами" : depth === "deep" ? "с подробностями и связями" : "понятно и по шагам";
  const result = ExplainStudyTopicResponse.parse({
    topic,
    whatIsIt: `${topic} — это тема по предмету «${subject}». В этом демо-режиме объяснение построено ${detail}, чтобы было легче начать разбираться.`,
    keyRule: `Сначала выдели главное понятие в теме «${topic}», затем свяжи его с одним конкретным примером. Проверяй каждый шаг, а не только финальный ответ.`,
    example: `Пример: запиши, что уже известно в задаче по теме «${topic}», выбери подходящее правило и объясни себе, почему оно подходит. После этого реши похожий пример самостоятельно.`,
    memoryTip: "Попробуй объяснить тему человеку, который не знаком с ней. Если получилось без сложных слов — ты действительно понял(а) материал.",
    commonMistakes: ["Пытаться запомнить формулу без понимания смысла", "Пропускать промежуточные шаги", "Не проверять ответ обратным действием"],
    checkQuestion: `Как бы ты объяснил(а) основную идею темы «${topic}» одним предложением?`,
    demo: true,
  });
  res.json(result);
});

router.post("/ai/chat/respond", (req, res) => {
  const parsed = RespondToChatBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid chat request");
    return demoError(res);
  }

  const { message, mode } = parsed.data;
  const lead = mode === "study"
    ? "Давай разберём это как на спокойном занятии."
    : mode === "market"
      ? "Перед покупкой лучше проверить факты, а не полагаться только на впечатление."
      : mode === "safehelp"
        ? "Сначала сосредоточимся на безопасности и одном понятном следующем шаге."
        : "Я помогу разложить вопрос по полочкам.";
  const result = RespondToChatResponse.parse({
    message: `${lead} Ты написал(а): «${message}»\n\nВ демо-режиме я могу предложить безопасное направление, уточнить контекст и помочь составить план. Если вопрос важный или срочный, проверь ответ у взрослого, специалиста или по надёжному источнику.`,
    demo: true,
  });
  res.json(result);
});

router.post("/ai/safehelp/respond", (req, res) => {
  const parsed = RespondToSafeHelpBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid SafeHelp request");
    return demoError(res);
  }

  const { situation } = parsed.data;
  const emergency = /прямо сейчас|угрожает|опасност|насили|пожар|травм|оружи|не могу уйти/i.test(situation);
  const result = RespondToSafeHelpResponse.parse({
    situation,
    riskLevel: emergency ? "emergency" : "medium",
    summary: "Похоже, ситуация требует спокойной оценки и поддержки, но этот ответ не является профессиональной диагностикой.",
    immediateActions: emergency
      ? ["Отойди в безопасное место, если это можно сделать без риска", "Позови взрослого рядом", "Свяжись с соответствующей экстренной службой"]
      : ["Сделай паузу и оцени, что прямо сейчас безопасно", "Сохрани важные сообщения или детали", "Расскажи доверенному взрослому"],
    avoid: ["Не оставайся с опасной ситуацией один/одна", "Не встречайся с незнакомцем и не отправляй личные данные", "Не отвечай угрозой на угрозу"],
    whenToGetHelp: emergency
      ? "Помощь взрослого и экстренной службы нужна прямо сейчас."
      : "Обратись к родителю, опекуну, учителю или другому ответственному взрослому, если ситуация повторяется, пугает или выходит из-под контроля.",
    recommendedContact: emergency ? "Взрослый рядом и соответствующая экстренная служба" : "Родитель, опекун, учитель или школьный психолог",
    emergency,
    demo: true,
  });
  res.json(result);
});

export default router;