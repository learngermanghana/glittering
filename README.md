This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Instagram feed

To show the Instagram section on the homepage, provide a valid Instagram Graph API access token:

```bash
INSTAGRAM_ACCESS_TOKEN=your_token_here
```

### Getting an Instagram Graph API access token

1. **Ensure you have the right account type.** The Instagram Graph API requires an **Instagram Business or Creator account** that is connected to a **Facebook Page**. Personal accounts will not work.
2. **Create a Meta app.** Go to the [Meta for Developers](https://developers.facebook.com/) dashboard, create a new app, and add the **Instagram Graph API** product.
3. **Connect your Instagram account.** In the app dashboard, connect your Instagram Business/Creator account (via the linked Facebook Page).
4. **Generate a User Access Token** with the `instagram_basic` permission (and any others you need). For development, you can use the Graph API Explorer. For production, implement OAuth and token refresh.
5. **Copy the token** into your environment as `INSTAGRAM_ACCESS_TOKEN`.

For more details, see the official Meta docs: [Instagram Graph API overview](https://developers.facebook.com/docs/instagram-api/).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
