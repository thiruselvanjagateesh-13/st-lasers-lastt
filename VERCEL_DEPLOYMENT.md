# Deploy to Vercel

This project is a static, multi-page HTML site. It does not need a framework build step.

## Git-based deployment

1. Push the project to the GitHub repository connected to Vercel.
2. In Vercel, select **Add New... > Project** and import that repository.
3. Set **Root Directory** to `.` and **Framework Preset** to **Other**.
4. Leave **Build Command** empty. Set **Output Directory** to `.` if Vercel requires a value.
5. Deploy. Future pushes to the production branch will trigger deployments.

`vercel.json` enables extensionless URLs while retaining the existing `.html` links. For example, `/login` serves `login.html`.

## CLI deployment

From the project root, run `npx vercel` and follow the prompts. Use `npx vercel --prod` for a production deployment after the project has been linked.

## Firebase note

Client-side Firebase requests also depend on the Firebase project's Firestore security rules and configuration. A successful Vercel build does not verify database permissions; inspect the browser console and Firebase rules if invoice reads or writes fail after deployment.
