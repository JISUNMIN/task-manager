import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { FileType } from "@prisma/client";

export async function POST(
  req: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // 확장자 추출
    const fileExt = file.name.split(".").pop() || "";
    // 고유 파일명 생성
    const fileName = `${taskId}_${uuidv4()}.${fileExt}`;
    // 폴더 경로 지정
    const filePath = file.type.startsWith("image/")
      ? `images/${fileName}`
      : `docs/${fileName}`;

    // Supabase 업로드
    const { error: uploadError } = await supabase.storage
      .from("uploads") // 버킷명
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json({ error: "파일 업로드 실패" }, { status: 500 });
    }

    // Public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("uploads").getPublicUrl(filePath);

    // 파일 타입 판별 (enum 사용)
    let prismaFileType: FileType;
    if (file.type.startsWith("image/")) {
      prismaFileType = FileType.IMAGE;
    } else if (fileExt.toLowerCase() === "pdf") {
      prismaFileType = FileType.PDF;
    } else if (["xls", "xlsx", "csv"].includes(fileExt.toLowerCase())) {
      prismaFileType = FileType.EXCEL;
    } else {
      prismaFileType = FileType.OTHER;
    }

    // TaskAttachment DB 저장
    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId: Number(taskId),
        fileName: file.name,
        fileUrl: publicUrl,
        fileType: prismaFileType,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("파일 업로드 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
