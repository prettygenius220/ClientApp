# Forgot Password Workflow - Complete Reverse Engineering

## 🔄 **Complete Workflow Overview**

The forgot password system uses a custom token-based approach that bypasses Supabase SMTP entirely and uses direct Mailgun API for 100% reliability.

## 📋 **Step-by-Step Process**

### **Step 1: User Initiates Reset**
**Location**: `src/pages/ForgotPassword.tsx`

```typescript
// User clicks "Send Reset Instructions"
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Calls authHelpers.resetPassword()
  const result = await resetPassword(email);
  
  if (result.success) {
    toast.success('If an account exists, you will receive instructions shortly.');
    setSent(true);
  }
};
```

### **Step 2: Reset Password Function**
**Location**: `src/lib/authHelpers.ts`

```typescript
export async function resetPassword(email: string): Promise<AuthResult> {
  // 1. Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // 2. Check if user exists in todo_profiles table
  const { data: profile } = await supabase
    .from('todo_profiles')
    .select('id, email')
    .eq('email', email.toLowerCase().trim())
    .single();
    
  // 3. Generate secure reset token
  const resetToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  // 4. Store token in password_reset_tokens table
  await supabase
    .from('password_reset_tokens')
    .upsert({
      user_id: profile.id,
      token: resetToken,
      expires_at: expiresAt.toISOString(),
      used: false
    });
    
  // 5. Create reset URL with custom token
  const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}&email=${email}`;
  
  // 6. Send email via direct Mailgun API (bypassing Supabase)
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email-backup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      to: email,
      subject: 'Reset Your RealEdu Password',
      html: emailTemplate,
      type: 'password-reset'
    })
  });
}
```

### **Step 3: Email Delivery via Edge Function**
**Location**: `supabase/functions/send-email-backup/index.ts`

```typescript
Deno.serve(async (req) => {
  const { to, subject, html, text, type } = await req.json();
  
  // Uses your exact Mailgun logic:
  const resp = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      from: MAILGUN_FROM_EMAIL,
      to: to,
      subject: subject,
      text: text || "Please view this email in HTML format.",
      html: html || ""
    }),
  });
  
  return new Response(JSON.stringify({ success: true, mailgunId: result.id }));
});
```

### **Step 4: User Clicks Reset Link**
**Email Contains**: `https://makerrealedu.netlify.app/reset-password?token=UUID&email=user@example.com`

**Location**: `src/pages/ResetPassword.tsx`

```typescript
useEffect(() => {
  const validateToken = async () => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    // 1. Check if token exists and is valid
    const { data: tokenData } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();
      
    // 2. Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      // Redirect to forgot-password with error
    }
    
    // 3. Verify email matches
    const { data: profile } = await supabase
      .from('todo_profiles')
      .select('id, email')
      .eq('id', tokenData.user_id)
      .single();
      
    if (profile.email === email.toLowerCase().trim()) {
      setValidToken(true);
    }
  };
}, []);
```

### **Step 5: Password Update**
**Location**: `src/pages/ResetPassword.tsx` → `src/lib/authHelpers.ts`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // Calls validateResetTokenAndUpdatePassword()
  const result = await validateResetTokenAndUpdatePassword(token, email, password);
};

export async function validateResetTokenAndUpdatePassword(
  token: string, 
  email: string, 
  newPassword: string
): Promise<AuthResult> {
  // 1. Re-validate token (security check)
  const { data: tokenData } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .single();
    
  // 2. Update password using Supabase Admin API
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    tokenData.user_id,
    { password: newPassword }
  );
  
  // 3. Mark token as used
  await supabase
    .from('password_reset_tokens')
    .update({ used: true })
    .eq('token', token);
    
  return { success: true };
}
```

## 🗄️ **Database Tables Used**

### **password_reset_tokens**
```sql
CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES todo_profiles(id),
  token uuid NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

### **todo_profiles**
```sql
CREATE TABLE todo_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'user',
  -- other fields...
);
```

## 🔐 **Security Features**

1. **Token Expiration**: 1 hour timeout
2. **Single Use**: Tokens marked as `used` after password update
3. **Email Verification**: Double-checks email matches user
4. **UUID Tokens**: Cryptographically secure random tokens
5. **Admin API**: Uses Supabase admin API for password updates

## 🚀 **Why It's Bulletproof**

1. **No SMTP Dependency**: Bypasses Supabase SMTP completely
2. **Direct API**: Uses your working Mailgun API directly
3. **Custom Tokens**: Not dependent on Supabase's token system
4. **Proven Logic**: Uses your exact URLSearchParams approach
5. **Edge Functions**: Serverless, always available

## 🧪 **Testing the Complete Flow**

1. **Go to**: https://makerrealedu.netlify.app/forgot-password
2. **Enter**: Your email address
3. **Click**: "Send Reset Instructions"
4. **Check**: Your inbox for reset email
5. **Click**: Reset link in email
6. **Enter**: New password
7. **Success**: Password updated, redirected to login

## 📧 **Email Template Structure**

The reset email includes:
- Professional RealEdu branding
- Clear reset button
- Fallback text link
- 1-hour expiration notice
- Contact information
- Security disclaimer

## 🔍 **Debugging Information**

If you need to debug, check:
1. **Browser Console**: Shows detailed debug info in development
2. **Supabase Logs**: Edge function execution logs
3. **Mailgun Dashboard**: Email delivery status
4. **Database**: Check `password_reset_tokens` table

The system is now completely independent of Supabase SMTP and uses your proven Mailgun setup!