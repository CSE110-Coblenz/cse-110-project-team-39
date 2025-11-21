# NumberNova

An interactive educational math game designed for 2nd and 3rd graders. Players travel through space, battling aliens on different planets by solving math expressions.

## About

NumberNova is a single-player card-based game where players create mathematical expressions to defeat aliens and progress through five unique worlds. Each world introduces new operations and difficulty levels, helping students practice fundamental arithmetic skills in an engaging, game-based environment.

## Game Mechanics

Players are dealt number and operation cards each round. They must:
- Arrange cards to create a valid mathematical expression
- Calculate a result that beats the alien's expression
- Defeat all aliens on a planet to progress to the next world

The game features:
- **5 Progressive Worlds**: Each planet introduces new operations and number ranges
  - World 1: Low number addition & subtraction (1-8)
  - World 2: Higher number addition & subtraction (6-12)
  - World 3: Low number multiplication & division (1-8)
  - World 4: Higher number multiplication & division (6-12)
  - World 5: Factorials & exponents (2-6)
- **Dynamic Difficulty**: Alien expressions are generated to ensure every round is both winnable and losable
- **Lives System**: Players have 3 lives per world
- **Score Tracking**: Points are awarded for defeating aliens
- **Outfit Store**: Customize your character with outfits and cosmetics
- **Leaderboard**: Compete with other players and track high scores

## Technology

The frontend is built with **TypeScript** and **Konva.js**, a powerful HTML5 canvas library that enables smooth animations and interactive gameplay. The game follows an MVC (Model-View-Controller) architecture for clean separation of game logic, rendering, and user interaction.

## Getting Started

```bash
cd numbernova/frontend
npm install
npm run dev
```

The game will be available at `http://localhost:5173`

## Team

This project was developed for CSE 110 with Professor Michael J Coblenz in Fall 2025 at UC San Diego.

**Team 39 Members:**
- Ashish Bamba
- Halvor Hafnor
- Ricardo Bomeny
- Saee Phalke
- Suldana Abdulkadir
