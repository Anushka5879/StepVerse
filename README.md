# 🚶 StepMeasure - Advanced Fitness Tracker

A modern, feature-rich step tracking application with AI-powered goal recommendations, daily quests, habit scoring, and smart motivation. Built with vanilla HTML, CSS, and JavaScript using Vite.

## ✨ Key Features

### 🎯 AI-Powered Smart Goals
- Analyzes your weekly step patterns
- Recommends personalized goals (5-7% increase from your average)
- One-click goal acceptance
- Adaptive learning based on performance

### 📊 Weekly Habit Score
- Tracks consistency across 7 days
- Visual progress ring chart
- Performance badges (Excellent/Good/Fair/Building)
- Shows percentage of days you met your goal

### 🎮 Daily Quests & Challenges
Six unique daily missions that reset every day:
- 🌅 Early Bird: Walk 3,000 steps before noon
- ⚡ Speed Demon: Complete 2,000 steps quickly
- 🎯 Goal Crusher: Reach 50% of daily goal
- 🔥 On Fire: Log steps 5 times
- 💪 Iron Legs: Walk 5,000+ steps
- 🌙 Night Owl: Walk after 8 PM

Earn reward points for each quest completed!

### 🎤 Smart Motivation System
- Context-aware, dynamic messages
- Adapts based on your performance level
- Changes as you progress through the day
- Personalized encouragement and celebration

### 👤 User Profile & Customization
- 6 customizable avatars (👤🏃💪⚡🔥🎯)
- Set your fitness level (Beginner/Intermediate/Advanced)
- Track favorite activities (Walking, Running, Hiking, etc.)
- Lifetime statistics dashboard
- **Data Export**: Download step history as CSV
- Profile reset option

### 🏆 Achievement System
Unlock 6 milestone badges:
- 🚶 Starter Spark (2k steps)
- ⚡ Momentum Mode (5k steps)
- 🔥 Strong Pace (7.5k steps)
- 🏆 Goal Crusher (10k steps)
- 👑 Endurance King (15k steps)
- ⭐ Legend Status (20k steps)

### 🎨 Premium Design
- Dark & Light themes with warm portrait colors in light mode
- Smooth animations and transitions
- Glassmorphism UI effects
- Fully responsive (mobile, tablet, desktop)
- Beautiful gradient accents

### 📱 Multi-Page Architecture
- **Home** - Landing page with feature overview
- **Dashboard** - Main tracker with all features
- **Profile** - Customization and statistics
- **Goals** - Goal planning and strategies
- **Reflection** - Log reasons for missed goals

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tool**: Vite
- **Storage**: LocalStorage for persistent data
- **Deployment**: Netlify / Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/StepMeasure.git
cd StepMeasure

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

```bash
npm run dev
```
Opens the app at `http://localhost:5173`

### Production Build

```bash
npm run build
```
Output is in the `dist/` folder, ready for deployment.

## 📊 Data Storage

All user data is stored locally in the browser using localStorage:
- Step counts and goals
- Weekly tracking data
- User profile information
- Achievements and quests
- Reflection notes

**No data is sent to external servers** - your fitness data remains private!

## 🎮 How to Use

### Adding Steps
1. Click **+500, +1,000, +2,500** buttons on Dashboard
2. Click **Surprise** for a random boost (350-1550 steps)
3. Use custom goal editor to set any step amount

### Tracking Progress
- **Main Ring**: Shows your daily progress towards goal
- **Habit Score**: Weekly consistency tracker
- **Achievements**: Milestone progress indicators
- **Quests**: Daily mission status

### Using Quests
- 3 random quests appear each day
- Complete them to earn reward points
- Quests reset at midnight

### Smart Goals
- Review recommended goal on Dashboard
- Click **Accept** to update your goal
- Based on your last 7 days of activity

### Profile Customization
- Visit **Profile** page
- Set your name and avatar
- Select fitness level
- Choose favorite activities
- Export data as CSV

## 🌙 Theme Toggle
Click the moon/sun icon in the top-right to switch between:
- **Dark Mode**: Cool blues and teals (night-friendly)
- **Light Mode**: Warm portrait colors (easier on eyes)

## 📈 Features Roadmap

- [ ] Social challenges with friends
- [ ] Community leaderboards
- [ ] Weather-based activity suggestions
- [ ] Wearable device integration (Apple Watch, Fitbit)
- [ ] Monthly progress reports
- [ ] Streak notifications
- [ ] Custom goal creation

## 🐛 Bug Reports

Found a bug? Please open an issue on GitHub with:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information

## 💡 Feature Requests

Have an idea? Open a GitHub discussion or issue with the label `enhancement`.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

Created with ❤️ for fitness enthusiasts and step trackers everywhere.

---

**Made with Vite + Vanilla JavaScript**

[View on GitHub](https://github.com/YOUR_USERNAME/StepMeasure) | [Live Demo](https://stepmeasure.netlify.app)
