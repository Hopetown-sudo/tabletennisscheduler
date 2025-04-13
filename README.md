# Ping Pong Tournament Manager

A modern React application for managing ping pong tournaments with player statistics tracking and an intuitive bracket system.

## Features

- **Complete Tournament Management**
  - Easily create tournaments with any number of players
  - Automatic bracket generation with first-round bye handling
  - Support for multiple rounds including quarterfinals, semifinals, finals, and 3rd place match
  - Track tournament progression from start to finish

- **Player Statistics**
  - Individual player cards showing wins, losses, and match count
  - Real-time status updates as the tournament progresses
  - Detailed match history for each player
  - Sorting options by tournament progress, wins, or name

- **Modern User Interface**
  - Clean, responsive design that works on all screen sizes
  - Intuitive controls for tournament management
  - Visual indicators for active and eliminated players
  - Medal indicators for final standings (🥇, 🥈, 🥉)

- **Data Export**
  - Export tournament results to CSV files for record-keeping
  - Comprehensive player statistics in downloadable format

## Getting Started

### Prerequisites

- Node.js 14.0 or higher
- npm or yarn

### Dependencies

- **React** - UI library
- **React DOM** - React renderer for the browser
- **React Hooks** - State and lifecycle features
- **Tailwind CSS** - Utility-first CSS framework
- **PapaParse** - For CSV parsing and export functionality

### Developer Dependencies

- **Vite** or **Create React App** - Development environment
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** or **React Testing Library** - Testing framework
- **PostCSS** - For processing Tailwind CSS
- **Autoprefixer** - For CSS compatibility

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hopetown-sudo/ping-pong-tournament.git
   cd ping-pong-tournament
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Install Tailwind CSS with specific version:
   ```bash
   npm install -D tailwindcss@3.4.3 postcss autoprefixer
   npx tailwindcss init -p
   ```

4. Configure Tailwind CSS by updating the `tailwind.config.js` file:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

5. Add Tailwind directives to your CSS file (src/index.css):
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

6. Install additional packages for CSV export:
   ```bash
   npm install papaparse
   # or
   yarn add papaparse
   ```

7. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

8. Open your browser and navigate to `http://localhost:3000` (if using Create React App) or `http://localhost:5173` (if using Vite)

## Usage Guide

### Setting Up a Tournament

1. Enter player names in the text area (separated by commas or new lines)
2. Click "Submit Players" to register participants
3. Click "Draw Round 1" to create the tournament brackets

### Managing Matches

1. Click on a player's name in a match to mark them as the winner
2. When all matches in a round are complete, click "Start Next Round"
3. Continue through all rounds until the tournament completes
4. View final standings with 1st, 2nd, 3rd, and 4th place winners

### Using Player Cards

- View each player's current tournament status, wins, and losses
- Click "View Match History" to see detailed information about each match
- Sort players by tournament progress, win count, or alphabetically

### Exporting Data

- Click "Export CSV" in the Players section to download complete player statistics
- After the tournament finishes, click "Export Results to CSV" in the Final Standings section for final rankings

## Customization

### Styling

The application uses Tailwind CSS for styling. You can customize the appearance by modifying the Tailwind classes in the component JSX files.

### Tournament Logic

To modify the tournament structure or scoring rules, edit the logic in the main `PingPongScheduler` component.

## Project Structure

```
src/
├── components/
│   ├── PingPongScheduler.jsx  # Main tournament component
│   └── PlayerCard.jsx         # Player statistics card component
├── utils/
│   └── tournamentHelpers.js   # Helper functions for tournament logic
├── styles/
│   └── tailwind.css           # Tailwind CSS configuration
└── App.js                     # Application entry point
```

## Technical Details

- Built with React (Hooks, Context API)
- Styled with Tailwind CSS
- Responsive design for desktop and mobile devices
- No external tournament management libraries used

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by tournament bracket systems in professional ping pong competitions
- Player card design influenced by modern sports statistics dashboards
- Thanks to all contributors who have helped improve this project

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ for ping pong enthusiasts everywhere.
