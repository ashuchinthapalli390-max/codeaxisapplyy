import { NextRequest, NextResponse } from "next/server";
import { getQuestionBank, saveQuestion } from "@/lib/storage";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { QuestionBankItem } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const questions = await getQuestionBank();
    return NextResponse.json({ success: true, data: questions });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = (await req.json()) as QuestionBankItem;
    if (!body.question || !body.category) {
      return NextResponse.json({ success: false, error: "Question text and category are required." }, { status: 400 });
    }

    const q: QuestionBankItem = {
      id: body.id || `q-${Date.now()}`,
      category: body.category,
      level: body.level || "Basic",
      question: body.question,
      options: body.options || [],
      correctKey: body.correctKey || "A",
      explanation: body.explanation || "",
      scoreWeight: body.scoreWeight || 3,
      isActive: body.isActive ?? true,
    };

    await saveQuestion(q);
    return NextResponse.json({ success: true, data: q });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
