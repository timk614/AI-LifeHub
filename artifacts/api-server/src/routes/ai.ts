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
import {
  askJson,
  askText,
  isLiveAIEnabled,
  marketSchema,
  safeHelpSchema,
  safeAIErrorMessage,
  studySchema,
} from "../lib/ai/openai";

const router: IRouter = Router();

const demoError = (res: Parameters<IRouter["post"]>[1] extends never ? never : any) =>
  res.status(400).json({ error: "Please provide the required information." });

const liveMarketSystem = `You are a careful secondhand marketplace advisor. Return only valid JSON matching the requested schema. Analyze the listing title and seller price, but never claim authenticity, exact model, condition, or current market value as a fact. Use phrases such as presumed, possible, visually similar, and approximate. Estimate a broad price range in the provided currency based on general knowledge, not live listings. Keep the answer useful and concise.`;
const liveStudySystem = `You are a patient tutor. Return only valid JSON matching the requested schema. Explain the topic in plain language for the learner's level. Include one concrete example, one memory tip, a few common mistakes, and a short checking question. Do not shame the learner and do not jump straight to an answer when a process can be taught.`;
const liveSafeHelpSystem = `You are SafeHelp, a calm safety assistant. Return only valid JSON matching the requested schema. Give short, neutral, practical next steps. Never provide dangerous instructions, concealment advice, or a diagnosis. Treat riskLevel as an orientational estimate, not a professional assessment. If there may be immediate danger, set emergency true and tell the person to move toward safety if possible, contact a trusted adult nearby, and use the appropriate local emergency service.`;

router.post("/ai/market/analyze", async (req, res) => {
  const parsed = AnalyzeMarketItemBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid market analysis request");
    return demoError(res);
  }

  const { title, price, currency } = parsed.data;
  if (isLiveAIEnabled()) {
    try {
      const live = await askJson<Record<string, unknown>>(
        "market_analysis",
        liveMarketSystem,
        `Listing title: ${title}
Seller price: ${price} ${currency}
Uploaded image filename (not image contents): ${parsed.data.imageName ?? "none"}
Return an approximate range in ${currency}.`,
        marketSchema,
      );
      if (live) {
        const result = AnalyzeMarketItemResponse.parse({
          ...live,
          currency,
          sellerPrice: price,
          demo: false,
        });
        return res.json(result);
      }
    } catch (error) {
      req.log.error({ message: safeAIErrorMessage(error) }, "Live market analysis failed; using fallback");
    }
  }
  const lowerTitle = title.toLowerCase();
  const isTech = /iphone|macbook|airpods|sony|camera|laptop|phone/.test(lowerTitle);
  const estimatedPriceMin = Math.max(10, Math.round(price * 0.85));
  const estimatedPriceMax = Math.round(price * 1.18);
  const difference = Math.round(((price - (estimatedPriceMin + estimatedPriceMax) / 2) / price) * 100);
  const result = AnalyzeMarketItemResponse.parse({
    category: isTech ? "Электроника" : "Вещи и аксессуары",
    brand: isTech ? "Предполагаемый бренд: визуально похоже на популярную модель" : "Бренд не удалось достоверно определить",
    model: isTech ? "Возможная модель по описанию продавца" : "Модель не подтверждена",
    description: `Резервный анализ для «${title}». По одному названию нельзя подтвердить происхождение, комплектацию или подлинность товара.`,
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

router.post("/ai/study/explain", async (req, res) => {
  const parsed = ExplainStudyTopicBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid study explanation request");
    return demoError(res);
  }

  const { subject, topic, depth } = parsed.data;
  if (isLiveAIEnabled()) {
    try {
      const live = await askJson<Record<string, unknown>>(
        "study_explanation",
        liveStudySystem,
        `Subject: ${subject}
Learner level: ${parsed.data.level}
Topic: ${topic}
Depth: ${depth}`,
        studySchema,
      );
      if (live) {
        const result = ExplainStudyTopicResponse.parse({ ...live, topic, demo: false });
        return res.json(result);
      }
    } catch (error) {
      req.log.error({ message: safeAIErrorMessage(error) }, "Live study explanation failed; using fallback");
    }
  }
  const detail = depth === "simple" ? "простыми словами" : depth === "deep" ? "с подробностями и связями" : "понятно и по шагам";
  const result = ExplainStudyTopicResponse.parse({
    topic,
    whatIsIt: `${topic} — это тема по предмету «${subject}». В резервном режиме объяснение построено ${detail}, чтобы было легче начать разбираться.`,
    keyRule: `Сначала выдели главное понятие в теме «${topic}», затем свяжи его с одним конкретным примером. Проверяй каждый шаг, а не только финальный ответ.`,
    example: `Пример: запиши, что уже известно в задаче по теме «${topic}», выбери подходящее правило и объясни себе, почему оно подходит. После этого реши похожий пример самостоятельно.`,
    memoryTip: "Попробуй объяснить тему человеку, который не знаком с ней. Если получилось без сложных слов — ты действительно понял(а) материал.",
    commonMistakes: ["Пытаться запомнить формулу без понимания смысла", "Пропускать промежуточные шаги", "Не проверять ответ обратным действием"],
    checkQuestion: `Как бы ты объяснил(а) основную идею темы «${topic}» одним предложением?`,
    demo: true,
  });
  res.json(result);
});

router.post("/ai/chat/respond", async (req, res) => {
  const parsed = RespondToChatBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid chat request");
    return demoError(res);
  }

  const { message, mode } = parsed.data;
  if (isLiveAIEnabled()) {
    try {
      const live = await askText(
        `You are LifeHub Assistant in ${mode} mode. Be clear, kind, and practical. In study mode, teach the principle before giving a final answer. In market mode, state uncertainty around price and authenticity. In SafeHelp mode, prioritize safety and trusted adults. Never present guesses as facts.`,
        message,
        parsed.data.history ?? [],
      );
      if (live) {
        return res.json(RespondToChatResponse.parse({ message: live, demo: false }));
      }
    } catch (error) {
      req.log.error({ message: safeAIErrorMessage(error) }, "Live chat response failed; using fallback");
    }
  }
  const lead = mode === "study"
    ? "Давай разберём это как на спокойном занятии."
    : mode === "market"
      ? "Перед покупкой лучше проверить факты, а не полагаться только на впечатление."
      : mode === "safehelp"
        ? "Сначала сосредоточимся на безопасности и одном понятном следующем шаге."
        : "Я помогу разложить вопрос по полочкам.";
  const result = RespondToChatResponse.parse({
    message: `${lead} Ты написал(а): «${message}»\n\nСейчас сработал резервный ответ. Я могу предложить безопасное направление, уточнить контекст и помочь составить план. Если вопрос важный или срочный, проверь ответ у взрослого, специалиста или по надёжному источнику.`,
    demo: true,
  });
  res.json(result);
});

router.post("/ai/safehelp/respond", async (req, res) => {
  const parsed = RespondToSafeHelpBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid SafeHelp request");
    return demoError(res);
  }

  const { situation } = parsed.data;
  const emergency = /прямо сейчас|угрожает|опасност|насили|пожар|травм|оружи|не могу уйти/i.test(situation);
  if (isLiveAIEnabled()) {
    try {
      const live = await askJson<Record<string, unknown>>(
        "safehelp_response",
        liveSafeHelpSystem,
        `Category: ${parsed.data.category ?? "unspecified"}
Situation: ${situation}`,
        safeHelpSchema,
      );
      if (live) {
        const result = RespondToSafeHelpResponse.parse({
          ...live,
          situation,
          emergency: emergency || live.emergency === true,
          demo: false,
        });
        return res.json(result);
      }
    } catch (error) {
      req.log.error({ message: safeAIErrorMessage(error) }, "Live SafeHelp response failed; using fallback");
    }
  }
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