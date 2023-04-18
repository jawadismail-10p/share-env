import { NextRequest, NextResponse } from "next/server";
import redis from "@/src/lib/redis";
import { generateId } from "@/src/services/encryption";

export const config = {
  runtime: "edge",
};

interface Request {
  encrypted: string;
  ttl?: number;
  reads: number;
  iv: string;
}

export async function POST(req: NextRequest) {
  const { encrypted, ttl, reads, iv } = (await req.json()) as Request;
  
  const id = generateId();
  // const key = ["envshare", id].join(":");

  // const tx = redis.multi();
  // tx.hset(key, {
  //   remainingReads: reads > 0 ? reads : null,
  //   encrypted,
  //   iv,
  // });
  // if (ttl) {
  //   tx.expire(key, ttl);
  // }
  // tx.incr("envshare:metrics:writes");

  // await tx.exec();

  return NextResponse.json({ id });
}
