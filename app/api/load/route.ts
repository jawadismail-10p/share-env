import { REDIS_KEY } from "@/src/lib/constants";
import redis from "@/src/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new NextResponse("id param is missing", { status: 400 });
  }

  const key = [REDIS_KEY, id].join(":");

  const [data, _] = await Promise.all([
    await redis.hgetall<{
      encrypted: string;
      remainingReads: number | null;
      iv: string;
    }>(key),
    await redis.incr(`${REDIS_KEY}:metrics:reads`),
  ]);
  if (!data) {
    return new NextResponse("Not Found", { status: 404 });
  }
  if (data.remainingReads !== null && data.remainingReads < 1) {
    await redis.del(key);
    return new NextResponse("Not Found", { status: 404 });
  }

  let remainingReads: number | null = null;
  if (data.remainingReads !== null) {
    remainingReads = await redis.hincrby(key, "remainingReads", -1);
  }

  return NextResponse.json({
    iv: data.iv,
    encrypted: data.encrypted,
    remainingReads,
  });
}
