import { PromptRequest, GeneratedPrompt, TripPreferences, TripTracingState } from '../types';

class PromptService {
  // Helper function to convert planning style to readable text with detailed explanations
  private getPlanningStyleText(planningStyle: any): string {
    if (!planningStyle) return 'Not specified';
    
    // Handle string values (planningType)
    if (typeof planningStyle === 'string') {
      switch (planningStyle) {
        case 'lazy': return 'Lazy (0-25%) - Last-minute activity choices, choosing at the last minute without detailed scheduling';
        case 'somewhat': return 'Balanced (26-50%) - Built-in recess approach, planning leeway together for spontaneous decisions';
        case 'well': return 'Organized (51-75%) - Packed activity schedules, most of the time is planned with activities';
        case 'complete': return 'Very Organized (76-100%) - Multiple options and cases for every minute, planned even for unexpected but likely situations';
        default: return planningStyle;
      }
    }
    
    // Handle numeric values (planningStyle percentage)
    if (typeof planningStyle === 'number') {
      if (planningStyle <= 25) return 'Lazy (0-25%) - Last-minute activity choices, choosing at the last minute without detailed scheduling';
      if (planningStyle <= 50) return 'Balanced (26-50%) - Built-in recess approach, planning leeway together for spontaneous decisions';
      if (planningStyle <= 75) return 'Organized (51-75%) - Packed activity schedules, most of the time is planned with activities';
      if (planningStyle <= 100) return 'Very Organized (76-100%) - Multiple options and cases for every minute, planned even for unexpected but likely situations';
    }
    
    return 'Not specified';
  }

  // Helper function to format duration and dates properly
  private getDurationAndDatesText(duration: any): string {
    if (!duration) return 'Not specified';
    
    // Handle complex duration object
    if (typeof duration === 'object' && duration.duration && duration.dates) {
      const dur = duration.duration;
      const dates = duration.dates;
      
      let durationText = '';
      let datesText = '';
      
      // Format duration
      if (dur.status === 'decided') {
        if (dur.months && dur.months !== '0') {
          durationText += `${dur.months} month${dur.months !== '1' ? 's' : ''}`;
        }
        if (dur.weeks && dur.weeks !== '0') {
          if (durationText) durationText += ', ';
          durationText += `${dur.weeks} week${dur.weeks !== '1' ? 's' : ''}`;
        }
        if (dur.days && dur.days !== '0') {
          if (durationText) durationText += ', ';
          durationText += `${dur.days} day${dur.days !== '1' ? 's' : ''}`;
        }
        durationText = durationText || 'Specific duration set';
      } else if (dur.status === 'in_mind') {
        let minText = '';
        let maxText = '';
        
        if (dur.minMonths && dur.minMonths !== '0') minText += `${dur.minMonths} month${dur.minMonths !== '1' ? 's' : ''}`;
        if (dur.minWeeks && dur.minWeeks !== '0') {
          if (minText) minText += ', ';
          minText += `${dur.minWeeks} week${dur.minWeeks !== '1' ? 's' : ''}`;
        }
        if (dur.minDays && dur.minDays !== '0') {
          if (minText) minText += ', ';
          minText += `${dur.minDays} day${dur.minDays !== '1' ? 's' : ''}`;
        }
        
        if (dur.maxMonths && dur.maxMonths !== '0') maxText += `${dur.maxMonths} month${dur.maxMonths !== '1' ? 's' : ''}`;
        if (dur.maxWeeks && dur.maxWeeks !== '0') {
          if (maxText) maxText += ', ';
          maxText += `${dur.maxWeeks} week${dur.maxWeeks !== '1' ? 's' : ''}`;
        }
        if (dur.maxDays && dur.maxDays !== '0') {
          if (maxText) maxText += ', ';
          maxText += `${dur.maxDays} day${dur.maxDays !== '1' ? 's' : ''}`;
        }
        
        if (minText && maxText) {
          durationText = `Flexible: ${minText} to ${maxText}`;
        } else if (minText) {
          durationText = `At least ${minText}`;
        } else if (maxText) {
          durationText = `Up to ${maxText}`;
        } else {
          durationText = 'Flexible duration';
        }
      } else {
        durationText = 'Duration not decided yet';
      }
      
      // Format dates
      if (dates.status === 'decided' && dates.startDate && dates.endDate) {
        const startDate = new Date(dates.startDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const endDate = new Date(dates.endDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        datesText = `Specific dates: ${startDate} to ${endDate}`;
      } else if (dates.status === 'in_mind') {
        if (dates.seasonPreference === 'peak') {
          datesText = 'Prefer peak season travel';
        } else if (dates.seasonPreference === 'off') {
          datesText = 'Prefer off-season travel';
        } else if (dates.seasonPreference === 'flexible') {
          datesText = 'Flexible with season timing';
        } else {
          datesText = 'Dates in mind but flexible';
        }
      } else {
        datesText = 'Dates not decided yet';
      }
      
      return `Duration: ${durationText} | ${datesText}`;
    }
    
    // Handle string duration
    if (typeof duration === 'string') {
      return `Duration: ${duration}`;
    }
    
    return 'Duration: Not specified';
  }

  // Helper function to format budget with currency and type
  private getBudgetText(tripPreferences: any): string {
    if (tripPreferences.isNotSure) {
      return 'User is unsure about budget - needs guidance on determining appropriate spending';
    }
    
    if (!tripPreferences.budget || tripPreferences.budget === 0) {
      return 'Budget not specified';
    }
    
    const budget = tripPreferences.budget;
    const currency = tripPreferences.currency || 'USD';
    const budgetType = tripPreferences.budgetType || 'total';
    
    // Format currency symbol
    const currencySymbols: {[key: string]: string} = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'KRW': '₩',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹'
    };
    
    const symbol = currencySymbols[currency] || currency;
    const formattedBudget = budget.toLocaleString();
    
    if (budgetType === 'per_day') {
      return `${symbol}${formattedBudget} per day (${currency})`;
    } else {
      return `${symbol}${formattedBudget} total budget (${currency})`;
    }
  }

  generateBigPicturePrompt(request: PromptRequest): GeneratedPrompt {
    const { tripPreferences } = request;
    
    // Generate preferences prompt (always the same)
    const preferencesPrompt = `You are an expert travel planner with a warm, diplomatic personality. Please memorize these travel preferences for future reference:

**User's Travel Profile:**
- Group Size: ${tripPreferences.groupSize || 'Not specified'}
- ${this.getDurationAndDatesText(tripPreferences.duration)}
- Budget: ${this.getBudgetText(tripPreferences)}
${tripPreferences.isNotSure ? `- Budget Discussion Needed: Please lead a discussion with the user to help them determine an appropriate budget based on their preferences, destination, and travel style. Consider factors like accommodation preferences, activity interests, meal preferences, and transportation needs.` : ''}
${tripPreferences.destinationApproach ? `- Destination Approach: ${
  tripPreferences.destinationApproach.travelType === 'abroad' ? 'International Travel' : 'Domestic Travel'
} (${
  tripPreferences.destinationApproach.destinationStatus === 'chosen' ? 'Destinations Chosen' :
  tripPreferences.destinationApproach.destinationStatus === 'in_mind' ? 'Destinations in Mind' :
  'Open to Suggestions'
})` : ''}
${tripPreferences.destinationApproach?.specificDestinations?.length ? 
`- Chosen Destinations: ${tripPreferences.destinationApproach.specificDestinations.join(', ')}` : ''}
${tripPreferences.destinationApproach?.originLocation ? 
`- Origin Location: ${tripPreferences.destinationApproach.originLocation}` : ''}
${tripPreferences.destinationStyles?.length ? 
`- Destination Style Preferences: ${tripPreferences.destinationStyles.join(', ')}` : ''}
- Trip Vibe: ${typeof tripPreferences.tripVibe === 'string' ? tripPreferences.tripVibe.split(',').map(v => v.trim()).join(', ') : tripPreferences.tripVibe || 'Not specified'}
${tripPreferences.vibeActivities && Object.keys(tripPreferences.vibeActivities).length > 0 ? 
`- Trip Vibe Activities: ${Object.entries(tripPreferences.vibeActivities)
  .map(([vibe, activities]) => `${vibe}: ${activities.join(', ')}`)
  .join(' | ')}` : ''}
- Planning Style: ${this.getPlanningStyleText(tripPreferences.planningStyle)}
${tripPreferences.leewayExplanation ? `- Built-in Recess Explanation: ${tripPreferences.leewayExplanation}` : ''}
- Top Priorities: ${tripPreferences.priorities?.join(', ') || 'Not specified'}

Please acknowledge that you've memorized these preferences and are ready to help with travel planning. It will be referred for the whole trip planning process. 🌟`;

    // Generate destination-specific prompt based on status
    let destinationPrompt = '';
    const destinationStatus = tripPreferences.destinationApproach?.destinationStatus;
    const specificDestinations = tripPreferences.destinationApproach?.specificDestinations || [];

    if (destinationStatus === 'chosen' && specificDestinations.length > 0) {
      // Case 1: Destinations are decided
      destinationPrompt = `Based on the memorized preferences, please provide detailed information about these chosen destinations: ${specificDestinations.join(', ')}

For each destination, provide:

**Destination Name & Location**

**Hashtag-style Keywords** (e.g., #SpecialThingsToDo #KeyCharacteristicsInMultipleHashtags #TourismFriendliness etc.)

**Available Transportation:**
- To the destination (flights, trains, buses, etc.) from ${tripPreferences.destinationApproach?.originLocation || '[user\'s origin location]'}
- Within the destination (public transport, taxis, walking, etc.)
Include information about the where to get the information about the transportation and how to manage/book it.

**Accommodation Styles Available** (hotels, hostels, Airbnb, resorts, special local types (ryokans, villas, etc.))

**Visa Requirements** under different conditions (tourist, business, long-term stay)

**Travel Tips:**
- Transportation apps and maps to use
- Best ways to get around
- Money-saving transportation tips

**Basic Etiquettes & Local Manners:**
- Important cultural norms to follow
- Common tourist mistakes to avoid
- How to be respectful to locals

**Simple Local Language** expressions to know (greetings, thank you, please, etc.)

**What's Interesting for Tourists:**
- Must-see attractions and experiences
- Hidden gems
- Local festivals or events

**Tour-friendliness Rating:** # out of 5 (0.5 unit increments) with explanation and citations of credible sources

**Fit to User's Trip Preferences:** [Percentage]% match with detailed explanation of why

**Budget Analysis for ${this.getDurationAndDatesText(tripPreferences.duration)}:**
- Tight Budget: [Range] - Why we think so (with citation)
- Enough Budget: [Range] - Why we think so (with citation)  
- Luxurious Budget: [Range] - Why we think so (with citation)

Please provide comprehensive, practical information that will help them plan their trip effectively.`;

    } else if (destinationStatus === 'in_mind' && specificDestinations.length > 0) {
      // Case 2: Destinations are in mind
      destinationPrompt = `Based on the memorized preferences, please provide detailed information about these destinations in mind: ${specificDestinations.join(', ')}

${tripPreferences.destinationApproach?.destinationStyles?.length ? 
`**Important:** The user has expressed interest in these destination styles: ${tripPreferences.destinationApproach.destinationStyles.join(', ')}. Please consider these style preferences when providing information and suggestions.` : ''}

For each destination, provide the same detailed format as above (transportation from ${tripPreferences.destinationApproach?.originLocation || '[user\'s origin location]'}, hashtags, accommodation, visa requirements, travel tips, etiquettes, local language, tourist attractions, tour-friendliness rating, fit percentage, and budget analysis).

Additionally, suggest 2-3 other destinations that might also be great for them${tripPreferences.destinationApproach?.destinationStyles?.length ? `, especially considering their preferred destination styles: ${tripPreferences.destinationApproach.destinationStyles.join(', ')}` : ''}, with:
- **Why it matches** (personalized reason based on their preferences)
- **3 key highlights**
- **1 unique feature**
- **Match percentage** with explanation

Please provide comprehensive information for both the destinations in mind and the additional suggestions.`;

    } else {
      // Case 3: Destinations are open/undecided
      destinationPrompt = `Based on the memorized preferences, please suggest 5 destinations that would be perfect for them.

For each suggested destination, provide the same detailed format as above (transportation, hashtags, accommodation, visa requirements, travel tips, etiquettes, local language, tourist attractions, tour-friendliness rating, fit percentage, and budget analysis).

Please provide comprehensive, practical information that will help them discover amazing destinations that match their travel style.`;
    }

    const result = {
      title: "Travel Planning Assistant",
      description: "Get personalized travel insights and destination information",
      tips: [
        "Copy the Preferences prompt first to establish context",
        "Then use the Destination prompt for specific information",
        "The AI will provide comprehensive travel guidance",
        "Save both responses for your trip planning"
      ],
      preferencesPrompt,
      destinationPrompt,
      links: [
        "https://chat.openai.com",
        "https://claude.ai",
        "https://gemini.google.com"
      ]
    };
    
    return result;
  }

  generateDestinationsPrompt(request: PromptRequest): GeneratedPrompt {
    const { tripPreferences, destinationCount = 5 } = request;
    
    const prompt = `You are an expert travel destination recommender. Based on the user's preferences, suggest ${destinationCount} destinations that would be perfect for them.

For each destination, provide:

**Name + Location** (e.g., "Osaka, Japan")

**Match Percentage** with creative commentary although I will give you an example:
- 90-100%: "Perfect match! 😍 This is your dream destination!"
- 80-89%: "Excellent choice! 😊 Very well suited to your style"
- 70-79%: "Great option! 😎 Worth considering for sure"
- 60-69%: "Interesting pick! 🤔 Might be a discovery for you"

**3-5 Hashtags** that capture the essence (e.g., #CulturallyValuable #Popular #FoodieParadise)

**3-5 Key Highlights** that make this place special

**Thorough Personalized Description** with:
- Why it matches their preferences
- What makes it unique for their travel style
- Recent news/data if relevant
- Links to reliable sources when possible

**1 Unique Feature** that sets it apart

**SWOT Analysis:**
- Strengths (3-4 points)
- Weaknesses (2-3 points) 
- Opportunities (2-3 points)
- Threats (1-2 points)

**Crowdedness Level** (Low/Medium/High) with explanation

**Surrounding Places** worth visiting

**Accommodation Styles** available (✅ for good options, ❌ for poor options)

**Visa Requirements** (Will they need one? If yes, how to get it?)

**Travel Tips** (transportation, maps, etc.)

**Basic Etiquettes** and local manners to remember (+ common tourist mistakes)

**Simple Local Language** expressions to know

**Budget for ${tripPreferences.duration === 'decided' ? 'their trip' : 'a typical trip'}**:
- Tight Budget: [Range] - Why we think so (with citation)
- Enough Budget: [Range] - Why we think so (with citation)  
- Luxurious Budget: [Range] - Why we think so (with citation)

User's Preferences:
- Group Size: ${tripPreferences.groupSize}
- Budget: ${tripPreferences.isNotSure ? 'User is unsure about budget - needs guidance on determining appropriate spending' : `$${tripPreferences.budget}`}
${tripPreferences.isNotSure ? `- Budget Discussion Needed: Please lead a discussion with the user to help them determine an appropriate budget based on their preferences, destination, and travel style. Consider factors like accommodation preferences, activity interests, meal preferences, and transportation needs.` : ''}
- Destination Style: ${tripPreferences.destinationStyle}
- Trip Vibe: ${tripPreferences.tripVibe}
- Planning Style: ${this.getPlanningStyleText(tripPreferences.planningStyle)}
- Priorities: ${tripPreferences.priorities?.join(', ') || 'Not specified'}

Keep the tone warm, diplomatic, and encouraging with emojis. Explain your reasoning clearly so they understand why each destination suits them.`;

    return {
      title: "Destination Recommendations",
      description: "Get personalized destination suggestions based on your preferences",
      tips: [
        "Copy this prompt into your preferred AI tool",
        "The AI will suggest destinations perfect for you",
        "Each destination includes detailed analysis",
        "Use this to narrow down your choices"
      ],
      prompt,
      links: [
        "https://chat.openai.com",
        "https://claude.ai",
        "https://gemini.google.com"
      ]
    };
  }

  generateTripTracingPrompt(request: PromptRequest): GeneratedPrompt {
    const { tripPreferences, tripTracingState } = request;
    
    if (!tripTracingState) {
      throw new Error('Trip tracing state is required for this prompt');
    }

    // Add defensive checks for required properties
    const safeTripPreferences = tripPreferences || {};
    const safeTripTracingState = tripTracingState || {};

    const prompt = `You are an expert travel planning advisor. Based on the user's big picture preferences and detailed trip tracing survey, provide personalized advice and recommendations.

**TRANSPORTATION PLANNING INTELLIGENCE:**
As an AI travel assistant, maintain comprehensive transportation awareness by:
- ANALYZING DESTINATION ACCESSIBILITY: Assess how people typically reach these destinations, identify all viable transportation options (not just user's stated preference), consider seasonal/regional transportation variations, flag any transportation challenges or requirements
- PROVIDING STRATEGIC RECOMMENDATIONS: Compare pros/cons of different transportation methods for these specific destinations, suggest optimal booking strategies and timing, recommend specific platforms/websites/apps, include money-saving tips and alternative options
- DESTINATION-SPECIFIC INSIGHTS: Share transportation quirks or tips specific to these destinations, mention local transportation connections and logistics, highlight any transportation-related requirements (visas, documentation, etc.), suggest backup plans if primary transportation fails
- ADAPTIVE ADVICE: If user hasn't decided on transportation method, help them choose based on their priorities. If user selected a method that might not be optimal, diplomatically suggest alternatives. Provide guidance for complex multi-destination itineraries
- PRACTICAL BOOKING GUIDANCE: Current best practices for booking their chosen method, platform-specific tips and tricks, timing strategies for best prices, what to watch out for when booking

Throughout your travel planning assistance, always suggest the most practical transportation methods for any destinations discussed, provide current booking resources and strategies, alert users to transportation challenges or opportunities, offer cost-saving alternatives and timing advice, and share destination-specific transportation insights. Be helpful but not pushy - if user has chosen a transportation method, provide excellent guidance for that method while gently suggesting alternatives if they would be significantly better.

**Big Picture Context:**
- Group Size: ${safeTripPreferences.groupSize || 'Not specified'}
- Budget: ${safeTripPreferences.isNotSure ? 'User is unsure about budget - needs guidance on determining appropriate spending' : `$${safeTripPreferences.budget || 'Not specified'}`}
${safeTripPreferences.isNotSure ? `- Budget Discussion Needed: Please lead a discussion with the user to help them determine an appropriate budget based on their preferences, destination, and travel style. Consider factors like accommodation preferences, activity interests, meal preferences, and transportation needs.` : ''}
- Destination Style: ${safeTripPreferences.destinationStyle || 'Not specified'}
- Trip Vibe: ${safeTripPreferences.tripVibe || 'Not specified'}
- Planning Style: ${safeTripPreferences.planningStyle || 'Not specified'}
- Priorities: ${safeTripPreferences.priorities?.join(', ') || 'Not specified'}

**Current Trip Tracing Preferences:**

**Accommodation Preferences:**
- Preferred Types: ${safeTripTracingState.accommodation?.selectedTypes?.join(', ') || 'Not specified'}
- Flexibility: ${safeTripTracingState.accommodation?.changeThroughTrip ? 'Open to changing accommodation types during the trip' : 'Prefers consistent accommodation type throughout trip'}
${safeTripTracingState.accommodation?.changeType ? `- Change Strategy: ${safeTripTracingState.accommodation.changeType}` : ''}

**Travel Method (To Destination):**
- Primary Method: ${safeTripTracingState.travelMethod?.travelMethod || 'Not specified'}
${safeTripTracingState.travelMethod?.travelMethod === 'public_transport' && safeTripTracingState.travelMethod?.publicTransportType ? 
`- Public Transport Type: ${safeTripTracingState.travelMethod?.publicTransportType}` : ''}
${safeTripTracingState.travelMethod?.publicTransportDetails ? 
`- Transport Details: ${safeTripTracingState.travelMethod?.publicTransportDetails}` : ''}

**Local Transportation (Within Destination):**
- Preferred Methods: ${safeTripTracingState.transportation?.selectedMethods?.join(', ') || 'Not specified'}
- Flexibility: ${safeTripTracingState.transportation?.changeThroughTrip ? 'Open to changing transportation methods during the trip' : 'Prefers consistent transportation method throughout trip'}
${safeTripTracingState.transportation?.changeType ? `- Change Strategy: ${safeTripTracingState.transportation.changeType}` : ''}

**Meal Patterns & Food Preferences:**
- Selected Meals: ${safeTripTracingState.mealPatterns?.selectedMeals?.join(', ') || 'Not specified'}
- Meal Flexibility: ${safeTripTracingState.mealPatterns?.changeThroughTrip ? 'Open to changing meal patterns during the trip' : 'Prefers consistent meal patterns throughout trip'}
${safeTripTracingState.mealPatterns?.changeType ? `- Change Strategy: ${safeTripTracingState.mealPatterns.changeType}` : ''}

**Food Style Preferences:**
- Cuisine Styles: ${safeTripTracingState.foodPreferences?.styles?.join(', ') || 'Not specified'}
- Popular/Trendy Places: ${safeTripTracingState.foodPreferences?.popularity ? 'Yes - interested in popular and trendy restaurants' : 'No - prefers local/authentic options'}
- Vegan Options: ${safeTripTracingState.foodPreferences?.vegan ? 'Yes - requires vegan-friendly options' : 'No - vegan options not required'}
- Instagram-Worthy: ${safeTripTracingState.foodPreferences?.goodPicVibe ? 'Yes - values photogenic dining experiences' : 'No - focuses on taste over aesthetics'}

${(safeTripTracingState.travelMethod?.travelMethod === 'flights' || safeTripTracingState.travelMethod?.travelMethod === 'undecided') && safeTripTracingState.flight ? 
`**Flight Preferences:**
- Priority: ${safeTripTracingState.flight?.priority || 'Not specified'}
- Flight Type: ${safeTripTracingState.flight?.flightType || 'Not specified'}
- Strategy Approach: ${safeTripTracingState.flight?.strategyChoice === 'provide' ? 'User provided custom strategy' : 'Requesting AI strategy'}
${safeTripTracingState.flight?.strategyChoice === 'provide' && safeTripTracingState.flight?.customStrategy ? 
`- User's Custom Strategy: ${safeTripTracingState.flight?.customStrategy}` : ''}
- Explanation: ${safeTripTracingState.flight?.explanation || 'Not specified'}` : ''}

**Expense Sharing (Group Travel):**
- Type: ${safeTripTracingState.expenses?.type || 'Not specified'}
${safeTripTracingState.expenses?.type === 'custom' && safeTripTracingState.expenses?.customPolicies ? 
`- Custom Policies: ${safeTripTracingState.expenses?.customPolicies.join('; ')}` : ''}
${safeTripTracingState.expenses?.explanation ? `- Explanation: ${safeTripTracingState.expenses?.explanation}` : ''}

**Please provide personalized recommendations based on their specific choices:**

1. **Accommodation Strategy:** ${safeTripTracingState.accommodation?.selectedTypes?.includes('dont-mind') || !safeTripTracingState.accommodation?.selectedTypes?.length ? 
   'User is open to accommodation suggestions - provide destination-specific recommendations for accommodation types, compare options based on their budget, group size, and travel style.' : 
   'User has specific accommodation preferences (' + (safeTripTracingState.accommodation?.selectedTypes?.join(', ') || '') + ') - validate their choices, suggest specific properties/areas that match their preferences, provide booking tips, and warn about any potential challenges with their choices.'}
   ${safeTripTracingState.accommodation?.changeThroughTrip ? 'Since they\'re open to changing accommodation types during the trip, suggest a strategic mix of different accommodation types for different parts of their journey.' : 'Since they prefer consistent accommodation, focus on finding the best options within their preferred type throughout the trip.'}

2. **Transportation Strategy:** 
   - ANALYZE DESTINATION ACCESSIBILITY: Assess how people typically reach these destinations and identify all viable transportation options (not just their stated preference)
   - STRATEGIC RECOMMENDATIONS: Compare pros/cons of different transportation methods for these specific destinations, suggest optimal booking strategies and timing, recommend specific platforms/websites/apps, include money-saving tips and alternatives
   - DESTINATION-SPECIFIC INSIGHTS: Share transportation quirks or tips specific to these destinations, mention local transportation connections and logistics, highlight any transportation requirements (visas, documentation, etc.), suggest backup plans if primary transportation fails
   - ADAPTIVE ADVICE: ${safeTripTracingState.travelMethod?.travelMethod === 'undecided' ? 
     'IMPORTANT: User hasn\'t decided on transportation method - provide a comprehensive comparison of all options for their destinations, help them choose based on their budget, time constraints, group size, and priorities. Include decision-making framework and pros/cons analysis.' : 
     'User selected ' + safeTripTracingState.travelMethod?.travelMethod + ' - provide excellent guidance for this method while diplomatically suggesting alternatives if they would be significantly better for their specific destinations.'} 
   - PRACTICAL BOOKING GUIDANCE: Current best practices for booking their chosen method, platform-specific tips and tricks, timing strategies for best prices, what to watch out for when booking
   - LOCAL TRANSPORTATION DECISION SUPPORT: ${safeTripTracingState.transportation?.selectedMethods?.includes('dont-mind') || !safeTripTracingState.transportation?.selectedMethods?.length ? 
     'User is open to local transportation suggestions - provide destination-specific recommendations for getting around, compare options like rental cars vs public transit vs ride-sharing based on their destinations and travel style.' : 
     'User has local transportation preferences (' + (safeTripTracingState.transportation?.selectedMethods?.join(', ') || '') + ') - validate their choices and provide optimization tips for their preferred methods.'}
   ${safeTripTracingState.transportation?.changeThroughTrip ? 'Since they\'re open to changing transportation methods during the trip, suggest a strategic mix of different transportation options for different parts of their journey.' : 'Since they prefer consistent transportation, focus on optimizing their preferred method throughout the trip.'}

3. **Meal Planning Strategy:** 
   - MEAL PATTERN GUIDANCE: Based on their selected meals (${safeTripTracingState.mealPatterns?.selectedMeals?.join(', ') || 'Not specified'}), provide realistic meal planning advice
   - FOOD STYLE RECOMMENDATIONS: ${safeTripTracingState.foodPreferences?.styles?.length ? 
     'Focus on ' + safeTripTracingState.foodPreferences.styles.join(', ') + ' cuisine styles' : 
     'Provide diverse cuisine recommendations'}
   ${safeTripTracingState.foodPreferences?.popularity ? '- Include popular and trendy restaurant recommendations' : '- Focus on local, authentic dining experiences'}
   ${safeTripTracingState.foodPreferences?.vegan ? '- Ensure vegan-friendly options are highlighted' : ''}
   ${safeTripTracingState.foodPreferences?.goodPicVibe ? '- Include Instagram-worthy dining spots' : '- Focus on taste and authenticity over aesthetics'}
   ${safeTripTracingState.mealPatterns?.changeThroughTrip ? 'Since they\'re open to changing meal patterns during the trip, suggest flexible meal planning strategies.' : 'Since they prefer consistent meal patterns, provide structured meal planning advice.'}

${(safeTripTracingState.travelMethod?.travelMethod === 'flights' || safeTripTracingState.travelMethod?.travelMethod === 'undecided') && safeTripTracingState.flight ? 
(safeTripTracingState.flight?.strategyChoice === 'provide' ? 
`4. **Flight Booking Strategy Review:** The user has provided their own strategy: "${safeTripTracingState.flight?.customStrategy || 'See above'}". Review their approach, validate it, suggest improvements or optimizations, and provide additional tips that complement their strategy.` :
`4. **Flight Booking Strategy:** Based on their priority (${safeTripTracingState.flight?.priority}), provide a comprehensive flight booking strategy and share life-hacks for ${safeTripTracingState.flight?.flightType} flights. Include step-by-step booking process, timing recommendations, and money-saving tips.`) : 
`4. **Travel Method Guidance:** Provide specific booking resources, strategies, and tips for ${safeTripTracingState.travelMethod?.travelMethod === 'driving' ? 'road trip planning' : safeTripTracingState.travelMethod?.travelMethod === 'public_transport' ? (safeTripTracingState.travelMethod?.publicTransportType || 'public transportation') : 'their chosen travel method'}.`}

5. **Local Transportation Guidance:** Provide specific advice for getting around within the destination using their preferred methods (${safeTripTracingState.transportation?.selectedMethods?.join(', ') || 'various options'}), including apps, costs, and practical tips.

${safeTripTracingState.expenses?.type === 'custom' && safeTripTracingState.expenses?.customPolicies ? 
`6. **Expense Sharing Policies:** The user has created custom expense sharing policies: "${safeTripTracingState.expenses?.customPolicies.join('; ')}". Review these policies, suggest improvements if needed, and help create a clear trip companion contract that incorporates these rules to prevent conflicts.` :
`6. **Expense Management:** For group travelers, suggest a witty agreement contract template that encourages discussion and harmony about expense sharing (they chose: ${safeTripTracingState.expenses?.type}).`}

7. **Food Recommendations:** Suggest where to eat based on their specific food preferences and local knowledge.

8. **Activity Planning:** Help plan an itinerary that enhances their trip vibe without weakening the overall experience.

${safeTripTracingState.travelMethod?.travelMethod === 'undecided' ? 
`9. **Transportation Decision Framework:** Since the user hasn't decided on transportation method, provide a structured decision-making framework:
   - Create a comparison table of transportation options for their specific destinations
   - Factor in their budget (${safeTripPreferences.isNotSure ? 'budget needs to be determined through discussion' : `$${safeTripPreferences.budget}`}), group size (${safeTripPreferences.groupSize}), and priorities
   - Provide clear recommendations with reasoning
   - Include backup options and contingency planning
   - Help them understand the trade-offs between cost, time, convenience, and experience` : ''}

Keep the tone warm, diplomatic, and encouraging with emojis. Provide practical advice that makes them excited about their trip! 🌟`;

    return {
      title: "Trip Tracing Recommendations",
      description: "Get personalized advice for accommodation, transportation, meals, and activities",
      tips: [
        "Copy this prompt into your preferred AI tool",
        "The AI will give you detailed travel planning advice",
        "Use this to refine your travel preferences",
        "Save the response for your final planning"
      ],
      prompt,
      links: [
        "https://chat.openai.com",
        "https://claude.ai",
        "https://gemini.google.com"
      ]
    };
  }

  generateFinalItineraryPrompt(request: PromptRequest): GeneratedPrompt {
    const { tripPreferences, tripTracingState } = request;
    
    if (!tripTracingState) {
      throw new Error('Trip tracing state is required for this prompt');
    }

    // Add defensive checks for required properties
    const safeTripPreferences = tripPreferences || {};
    const safeTripTracingState = tripTracingState || {};

    const prompt = `You are an expert travel itinerary creator. Based on the user's complete preferences, create a comprehensive vacation plan that looks like a beautiful flight ticket.

**User's Complete Profile:**
- Group Size: ${safeTripPreferences.groupSize || 'Not specified'}
- Budget: ${safeTripPreferences.isNotSure ? 'User is unsure about budget - needs guidance on determining appropriate spending' : `$${safeTripPreferences.budget || 'Not specified'}`}
${safeTripPreferences.isNotSure ? `- Budget Discussion Needed: Please lead a discussion with the user to help them determine an appropriate budget based on their preferences, destination, and travel style. Consider factors like accommodation preferences, activity interests, meal preferences, and transportation needs.` : ''}
- Destination Style: ${safeTripPreferences.destinationStyle || 'Not specified'}
- Trip Vibe: ${safeTripPreferences.tripVibe || 'Not specified'}
- Planning Style: ${safeTripPreferences.planningStyle || 'Not specified'}
- Priorities: ${safeTripPreferences.priorities?.join(', ') || 'Not specified'}

**Trip Tracing Details:**
- Accommodation: ${safeTripTracingState.accommodation?.selectedTypes?.join(', ') || 'Not specified'}
- Travel Method: ${safeTripTracingState.travelMethod?.travelMethod || 'Not specified'}
- Local Transportation: ${safeTripTracingState.transportation?.selectedMethods?.join(', ') || 'Not specified'}
- Meals: ${safeTripTracingState.mealPatterns?.selectedMeals?.join(', ') || 'Not specified'}
- Food Preferences: ${safeTripTracingState.foodPreferences?.styles?.join(', ') || 'Not specified'}
- Activities: ${safeTripTracingState.activities?.interests?.join(', ') || 'Not specified'}

**Please create a "Flight Ticket Style" vacation plan with:**

**Date & Duration:** Suggest optimal timing based on their preferences

**Destination:** Recommend the perfect destination with a colloquial comment (e.g., "Hawaii - I already can taste the tropical fruits! 😋 I'm excited for you!")

**Companions:** Based on their group size

**Budget per Person:** Breakdown of their total budget

**Accommodation:** Specific recommendations based on their preferences

**Trip Type:** Adventure, Relaxation, Cultural, etc.

**Pace:** Fast-paced, Relaxed, Balanced, etc.

**Daily Schedule:** What will happen each day and how:
- Include meals, accommodation changes, activities
- Consider their planning style preference
- Add flexibility where appropriate

**Visa Requirements:** Will they need one? If yes, provide a complete guide with relevant links

**Travel Tips:** Transportation, maps, local customs, etc.

**Basic Etiquettes:** Local manners to remember (+ common tourist mistakes)

**Simple Language:** Essential phrases in the local language

**Additional Recommendations:**
- Best time to book flights
- Packing suggestions
- Local apps to download
- Emergency contacts

Keep the tone warm, diplomatic, and encouraging with emojis. Make them excited about their upcoming adventure! 🌟

Format this like a beautiful, detailed flight ticket that they can print and reference during their trip.`;

    return {
      title: "Final Vacation Plan",
      description: "Get your complete vacation itinerary in a beautiful flight ticket format",
      tips: [
        "Copy this prompt into your preferred AI tool",
        "The AI will create your complete travel plan",
        "Format it like a beautiful flight ticket",
        "Print it out for your trip reference"
      ],
      prompt,
      links: [
        "https://chat.openai.com",
        "https://claude.ai",
        "https://gemini.google.com"
      ]
    };
  }
}

export default new PromptService(); 