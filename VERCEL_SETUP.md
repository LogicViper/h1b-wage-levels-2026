# Setting up Vercel Deployment

To enable automated deployments to Vercel, you need to configure 3 secrets in your GitHub repository.

## 1. Get your Vercel Credentials

1.  **Install Vercel CLI** (if you haven't):
    ```bash
    npm i -g vercel
    ```
2.  **Login**:
    ```bash
    vercel login
    ```
3.  **Link your project**:
    Run this command in your project root:
    ```bash
    vercel link
    ```
    - Follow the prompts to set up the project.
    - This will create a `.vercel` folder.

4.  **Find your IDs**:
    - Open `.vercel/project.json`
    - Copy the `orgId` -> This is your **VERCEL_ORG_ID**
    - Copy the `projectId` -> This is your **VERCEL_PROJECT_ID**

5.  **Create a Token**:
    - Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
    - Create a new token (e.g. "GitHub Action")
    - Copy the token string -> This is your **VERCEL_TOKEN**

## 2. Add Secrets to GitHub

1.  Go to your GitHub Repository.
2.  Click **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret**.
4.  Add the following 3 secrets:

    | Name | Value |
    |------|-------|
    | `VERCEL_ORG_ID` | (Paste your orgId) |
    | `VERCEL_PROJECT_ID` | (Paste your projectId) |
    | `VERCEL_TOKEN` | (Paste your token) |

## 3. Verify

Once these are added, the next push to `main` will automatically deploy your site to Vercel!
