# Where To Next? - AI-Powered Vacation Planner

A beautiful, interactive React application that helps users plan their perfect vacation using AI-powered recommendations and a delightful user experience.

## 🎯 Features

### Phase 1 - Complete ✅
- **Interactive Question Flow**: 7 carefully crafted questions to understand user preferences
- **Beautiful UI/UX**: Modern design with smooth animations using Framer Motion
- **Progress Tracking**: Visual progress bar and state management
- **AI Integration**: Mock AI summaries and recommendations
- **Tinder-Style Cards**: Swipeable destination cards for easy selection
- **SWOT Analysis**: Comprehensive analysis for saved destinations
- **Local Storage**: Persistent data storage for user preferences

### Question Flow Structure
1. **Group Size** - Solo, Pair, Small Group, Mid-size Squad, Big Group, or Unsure
2. **Duration & Dates** - Specific dates, flexible range, future planning, or flexible timing
3. **Budget** - Budget input with AI suggestions and currency conversion
4. **Destination Styles** - Urban, Rural, Coastal, Mountain, Tropical, or Snowy (multiple select with ranking)
5. **Trip Vibes** - Comfort Zone (Relaxation, Entertainment, Shared Escape) and Growth Zone (Educational, Cultural, Culinary)
6. **Planning Style** - Interactive slider from "Lazily planned" to "Completely planned"
7. **Priorities** - Drag-and-drop ranking of priorities (Eco-friendliness, Safety, Accessibility, etc.)

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd where-to-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
where-to-next/
├── src/
│   ├── components/
│   │   ├── questions/           # Question components
│   │   │   ├── Question1GroupSize.tsx
│   │   │   ├── Question2Duration.tsx
│   │   │   ├── Question3Budget.tsx
│   │   │   ├── Question4DestinationStyle.tsx
│   │   │   ├── Question5TripVibe.tsx
│   │   │   ├── Question6PlanningStyle.tsx
│   │   │   └── Question7Priorities.tsx
│   │   ├── Header.tsx           # Navigation header
│   │   ├── Footer.tsx           # Footer with witty quote
│   │   └── ProgressBar.tsx      # Progress indicator
│   ├── pages/
│   │   ├── HomePage.tsx         # Landing page
│   │   ├── QuestionFlow.tsx     # Main question flow
│   │   ├── SummaryPage.tsx      # AI summary page
│   │   ├── DestinationCards.tsx # Tinder-style cards
│   │   └── SavedDestinations.tsx # Saved destinations with SWOT
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── App.tsx                  # Main app component
│   └── index.css                # Tailwind CSS styles
├── public/                      # Static assets
└── package.json                 # Dependencies and scripts
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (`from-blue-500 to-purple-600`)
- **Secondary**: Purple gradient (`from-purple-400 to-purple-600`)
- **Background**: Soft gradient (`from-blue-50 to-purple-50`)

### Components
- **Cards**: White background with rounded corners and shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Animations**: Smooth transitions using Framer Motion

### Typography
- **Headings**: Bold, large text with gradient colors
- **Body**: Clean, readable font with proper spacing

## 🔧 Technologies Used

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and interactions
- **React Router** - Client-side routing
- **Local Storage** - Data persistence

## 📱 Responsive Design

The application is fully responsive and works beautifully on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🎯 Key Learning Points

### For Beginners

1. **React Hooks**: Learn how to use `useState`, `useEffect`, and custom hooks
2. **TypeScript**: Understand type safety and interfaces
3. **Component Architecture**: See how to structure React components
4. **State Management**: Learn about local state and prop drilling
5. **Routing**: Understand client-side navigation
6. **Styling**: Learn Tailwind CSS utility classes
7. **Animations**: See Framer Motion in action

### Advanced Concepts

1. **Form Handling**: Complex form state management
2. **Data Persistence**: Local storage implementation
3. **User Experience**: Smooth transitions and micro-interactions
4. **Accessibility**: ARIA labels and keyboard navigation
5. **Performance**: Optimized re-renders and animations

## 🚀 Next Steps (Future Phases)

### Phase 2 - Enhanced AI Integration
- Real AI API integration (Claude, GPT-4)
- Dynamic destination recommendations
- Personalized travel itineraries

### Phase 3 - Social Features
- Share trip plans with friends
- Collaborative planning
- Community recommendations

### Phase 4 - Advanced Features
- Booking integration
- Weather integration
- Real-time travel updates
- Mobile app

## 🤝 Contributing

This is a learning project! Feel free to:
- Ask questions about the code
- Suggest improvements
- Report bugs
- Add new features

## 📄 License

This project is for educational purposes. Feel free to use and modify as needed.

## 🎉 Enjoy Your Trip Planning!

Remember: "Isn't the whole point of a trip to have fun? Keep it simply pleasant and stop overthinking!"

---

**Built with ❤️ for learning React and modern web development**
