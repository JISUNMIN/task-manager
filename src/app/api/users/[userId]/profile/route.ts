import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const formData = await req.formData();
    const file = formData.get("profileImage") as File | null;
    const password = formData.get("password") as string | null;
    const { userId } = await context.params;

    // 업데이트할 데이터
    const updateData: { profileImage?: string; password?: string } = {};

    // 1. 이미지가 있으면 업로드
    if (file && file.size > 0) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        return NextResponse.json(
          { error: "이미지 업로드 실패" },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(fileName);

      updateData.profileImage = publicUrl;
    }

    // 2. 비밀번호가 있으면 암호화 후 업데이트 데이터에 포함
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // 변경할 데이터가 없는 경우
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "변경할 데이터가 없습니다." },
        { status: 400 }
      );
    }

    // 3. DB 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData,
      select: {
        id: true,
        userId: true,
        name: true,
        profileImage: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PATCH /api/users/profile 에러:", error);
    return NextResponse.json(
      { error: "프로필 업데이트 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
