import { fromBase58, toBase58 } from "../lib/utils";

export function encodeCompositeKey(version: number, id: string, encryptionKey: Uint8Array): string {
  if (version < 0 || version > 255) {
    throw new Error("Version must fit in a byte");
  }
  const compositeKey = new Uint8Array([version, ...fromBase58(id), ...encryptionKey]);

  return toBase58(compositeKey);
}