/**
 * In a real application, you would use a proper password hashing library like bcrypt.
 * For simplicity in this demo, we're using a basic implementation.
 */

export async function hash(password: string): Promise<string> {
  // In a real app, use bcrypt or similar
  // This is just a placeholder for the demo
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verify(password: string, hashedPassword: string): Promise<boolean> {
  const passwordHash = await hash(password);
  return passwordHash === hashedPassword;
}
