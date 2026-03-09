# Nestil - Your Nearby Property Marketplace

Nestil is a modern, full-stack real estate marketplace application designed to connect property owners, agents, and buyers/renters in a seamless, hyper-local platform.

## Overview

Most property websites focus on major metropolitan areas, leaving a gap for users in smaller towns and local communities. Nestil is designed to fill that void, providing a simple, fast, and trustworthy platform for listing and discovering properties nearby.

This application is built with a modern tech stack, featuring a Next.js frontend, a Firebase backend for database and authentication, and a clean, responsive UI built with ShadCN components and Tailwind CSS.

## Core Features

-   **User Authentication**: Secure sign-up, login, and logout functionality using Firebase Authentication (email/password). Includes email verification.
-   **Property Listings**: A multi-step form for property owners and agents to create detailed listings, including pricing, amenities, location, and photo URLs.
-   **Dynamic Search & Filtering**: A powerful property search page that allows users to filter by transaction type (rent/sale), property type, price, and size.
-   **Admin Dashboard**: A protected area for administrators (`helpnestil@gmail.com`) to review, approve, or reject new property submissions.
-   **Owner Dashboard**: A personal dashboard for users to view and manage their own property listings.
-   **Favorites System**: Authenticated users can save properties to a personal "Favorites" list.
-   **AI-Powered Descriptions**: Integrated Genkit flow to automatically generate compelling property descriptions based on listing details.
-   **"Verified by Nestil"**: A status badge granted to properties approved by an admin, building trust with users.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Backend**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
-   **UI**: [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
-   **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
-   **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
-   **Deployment**: Ready for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Getting Started

### Prerequisites

-   Node.js (v18 or newer recommended)
-   A Firebase project with Firestore and Authentication enabled.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Firebase Setup

1.  Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2.  Enable **Firestore** and **Firebase Authentication** (with the Email/Password provider).
3.  Go to Project Settings and copy your Firebase config object.
4.  Paste your config into `src/firebase/config.ts`.

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9003`.

2.  **Start the Genkit development server (for AI features):**
    In a separate terminal, run:
    ```bash
    npm run genkit:watch
    ```

## Admin Access

To access the Admin Dashboard, log in with the following credentials:
-   **Email**: `helpnestil@gmail.com`
-   **Password**: *You will need to set a password for this user in your Firebase Authentication console.*

Once logged in, you can navigate to `/admin` to manage property listings.
# nestilv3
