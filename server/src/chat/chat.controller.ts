import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ChatConversation, ChatMessage } from "../database/models";
import { AiService } from "../ai/ai.service";

function sanitize(o: any) {
  const { _id, __v, ...rest } = o || {};
  return rest;
}

@Controller("api/ai/chat")
export class ChatController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  async getChat(@Query("conversationId") conversationId?: string) {
    try {
      if (conversationId) {
        const convId = Number(conversationId);
        const messages = await ChatMessage.find({ conversationId: convId })
          .sort({ createdAt: 1 })
          .lean();
        return { success: true, messages: messages.map(sanitize) };
      }

      const conversations = await ChatConversation.find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      return { success: true, conversations: conversations.map(sanitize) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Post()
  async postChat(@Body() body: Record<string, any>) {
    try {
      const { message, conversationId, userId, city } = body || {};
      if (!message || typeof message !== "string") {
        return { success: false, error: "پیام متنی الزامی است" };
      }

      let activeConvId: number | null = conversationId ? Number(conversationId) : null;
      if (!activeConvId) {
        const titleSummary = message.slice(0, 45) + (message.length > 45 ? "..." : "");
        const newConv = await ChatConversation.create({
          userId: userId ? Number(userId) : undefined,
          title: titleSummary,
          city: city || "تهران",
        });
        activeConvId = (newConv as any).id;
      }

      await ChatMessage.create({
        conversationId: activeConvId,
        sender: "user",
        message,
        intent: "query",
      });

      const aiResult = await this.aiService.processConversationalQuery(
        message,
        city || "تهران",
      );

      const savedAiMsg = await ChatMessage.create({
        conversationId: activeConvId,
        sender: "assistant",
        message: aiResult.message,
        intent: aiResult.intent,
        structuredData: aiResult.structuredData,
      });

      return {
        success: true,
        conversationId: activeConvId,
        reply: sanitize((savedAiMsg as any).toObject()),
        structuredData: aiResult.structuredData,
      };
    } catch (error) {
      console.error("Chat POST error:", error);
      return { success: false, error: String(error) };
    }
  }
}
