# MediDesk

Multi-tenant hospital management platform.

## Admin password reset

Admins can overwrite staff passwords from the staff management UI. This requires a Firebase Cloud Function because the Firebase Client SDK cannot update another user's password — Admin SDK privileges are needed.

### Deploy the Cloud Function

```bash
# Install Firebase CLI (one-time)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Install function dependencies
cd functions
npm install

# Deploy
npm run deploy
```

This deploys the `updateStaffPassword` function which calls `admin.auth().updateUser(uid, { password })`.

### Usage

1. Go to **Staff** tab in any hospital view (superadmin) or **Staff** page (hospital admin)
2. Click **Reset password** on any staff row
3. Copy the auto-generated password or generate a new one
4. Click **Copy password** or **Save & show** to apply and display the credentials
