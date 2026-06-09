export function createClientId() {
  try {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    // HTTP(비보안) 환경에서는 randomUUID가 동작하지 않을 수 있음
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
