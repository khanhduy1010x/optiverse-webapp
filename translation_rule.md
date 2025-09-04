# Translation Rule — useAppTranslate

## Goal
- All UI text **must** use `useAppTranslate` (similar to `useTranslation`).
- No hardcoded strings in JSX/TSX.
- Keys use **snake_case**.
- Namespace = JSON file name (e.g., `auth.json`).

---

## Usage
```tsx
const { t } = useAppTranslate('auth');

<h3>{t('welcome_back')}</h3>
<p>{t('please_sign_in')}</p>
<Button title={t('login_google')} />
<Input placeholder={t('enter_email')} />
toast.success(t('profile_updated'));
```

```json
// locales/en/auth.json
{
  "welcome_back": "Welcome back",
  "please_sign_in": "Please sign in to continue",
  "login_google": "Login with Google",
  "enter_email": "Enter your email",
  "profile_updated": "Profile updated successfully"
}
```

---

## Rules
1. **Always** wrap visible text in `t('<key>')`.
2. **Props** (title, alt, aria-label, placeholder, errorMessage, etc.) → use `t()`.
3. **Interpolation**:
   ```tsx
   <Text>{t('replying_to', { sender_name })}</Text>
   ```
   ```json
   { "replying_to": "Replying to {{sender_name}}" }
   ```
4. **Pluralization**:
   ```json
   {
     "item_count_one": "1 item",
     "item_count": "{{count}} items"
   }
   ```
5. **Shared/common text** → `common.json`.
6. **Never** move `console.*` logs to JSON.

---

## Checklist
- [ ] No raw strings in JSX/props.
- [ ] Correct namespace used (`useAppTranslate('<namespace>')`).
- [ ] Keys in **snake_case**, short & meaningful.
- [ ] Reuse existing keys when possible.
- [ ] Interpolation/pluralization correct.
- [ ] Common/shared text placed in `common.json`.
