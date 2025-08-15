# unwind-chimes

Unwind Chimes is a wind chime simulator that transforms weather data into soothing, dynamic soundscapes. Each weather condition influences the app’s audio synthesis and effects parameters, letting you experience the world’s climate through sound.

Live Demo: [unwind-chimes.vercel.app](https://unwind-chimes.vercel.app/)

## Installation

To run Unwind Chimes locally:

### 1. Clone the repository

```bash
git clone https://github.com/sukelully/unwind-chimes.git
cd unwind-chimes
```

### 2. Install dependencies

```bash
npm install -g pnpm@latest-10
pnpm install
```

### 3. Set up environemnt variables

- Create a `.env` file in the root directory
- Copy the contents from `.env.example` into it
- Fill in the required Visual Crossing API key

### 4. Start the dev server

```bash
pnpm dev:v
```

## Tech Stack

- **Frontend:** React, Tailwind, TypeScript
- **Backend**: Node.js (for API endpoints)
- **Weather Data:** [Visual Crossing](https://www.visualcrossing.com/)
- **Deployment:** Vercel

## Contributing

Contributions are definitely welcome! To get started:

1. Fork the repository
2. Add any issues you'd like to work on or choose an exisiting one
3. Create a new branch (`git checkout -b feature-name`)
4. Make your changes and commit them (conventional commits)
5. Push your branch and open a pull request

## License

This project is licensed under the [MIT License](LICENSE).
