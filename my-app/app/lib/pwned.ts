export async function isPasswordPwned(password: string): Promise<boolean> {
  if (!password) return false;
  
  try {
    // Hash the password using SHA-1
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Split into prefix (first 5 chars) and suffix
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      console.error('Failed to fetch from Pwned Passwords API');
      return false; // Fail open if API is down
    }
    const text = await response.text();
    
    // API returns lines like: 0018A45C4D1DEF81644B54AB7F969B88D83:27
    const lines = text.split('\n');
    for (const line of lines) {
      const [returnedSuffix] = line.split(':');
      if (returnedSuffix.trim() === suffix) {
        return true; // Password was found in the breach database
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking password against HIBP:', error);
    return false; // Fail open
  }
}
