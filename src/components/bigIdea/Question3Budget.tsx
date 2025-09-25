import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Question3BudgetProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
}

const Question3Budget: React.FC<Question3BudgetProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed
}) => {
  const [budget, setBudget] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [budgetType, setBudgetType] = useState<'total' | 'perDay'>('total');
  const [isNotSure, setIsNotSure] = useState<boolean>(false);

  // Load previous answers on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('tripPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.budget !== undefined) {
          setBudget(preferences.formattedBudget || preferences.budget?.toString() || '');
        }
        if (preferences.currency) {
          setCurrency(preferences.currency);
        }
        if (preferences.budgetType) {
          setBudgetType(preferences.budgetType);
        }
        if (preferences.isNotSure !== undefined) {
          setIsNotSure(preferences.isNotSure);
        }
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'KRW', symbol: '₩', name: 'Korean Won' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
  ];

  const handleBudgetChange = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    
    // Parse the numeric value
    const numericValue = parseFloat(cleaned);
    
    if (!isNaN(numericValue)) {
      // Format with thousand separators
      const formatted = numericValue.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      
      setBudget(formatted);
      
      onAnswer(3, { 
        budget: numericValue, 
        currency, 
        budgetType,
        formattedBudget: formatted 
      });
    } else if (cleaned === '') {
      setBudget('');
      onAnswer(3, { 
        budget: 0, 
        currency, 
        budgetType,
        formattedBudget: '' 
      });
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    if (budget) {
      onAnswer(3, { 
        budget: parseFloat(budget.replace(/,/g, '')), 
        currency: newCurrency, 
        budgetType,
        formattedBudget: budget 
      });
    }
  };

  const handleBudgetTypeChange = (type: 'total' | 'perDay') => {
    setBudgetType(type);
    if (budget) {
      onAnswer(3, { 
        budget: parseFloat(budget.replace(/,/g, '')), 
        currency, 
        budgetType: type,
        formattedBudget: budget 
      });
    }
  };

  const handleNotSure = () => {
    setIsNotSure(true);
    setBudget('');
    onAnswer(3, { 
      budget: 0, 
      currency, 
      budgetType,
      formattedBudget: '',
      isNotSure: true
    });
  };

  const handleClearNotSure = () => {
    setIsNotSure(false);
    onAnswer(3, { 
      budget: 0, 
      currency, 
      budgetType,
      formattedBudget: '',
      isNotSure: false
    });
  };

  const handleNext = () => {
    if (isNotSure || (budget && parseFloat(budget.replace(/,/g, '')) > 0)) {
      onNext();
    }
  };

  const openXE = () => {
    window.open('https://www.xe.com/currencyconverter/', '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          How much is planned to be used for your trip?
        </h2>
        <p className="text-lg text-gray-600">
          Set your budget to help AI recommend suitable destinations and experiences
        </p>
      </div>

            {/* Budget Type Selection */}
            <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Budget Type
        </label>
        <div className="flex space-x-4">
          <button
            onClick={() => handleBudgetTypeChange('total')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              budgetType === 'total'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Total Trip Budget
          </button>
          <button
            onClick={() => handleBudgetTypeChange('perDay')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              budgetType === 'perDay'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Per Day Budget
          </button>
        </div>
      </div>

      {/* Currency Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Your Currency
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleCurrencyChange(curr.code)}
              className={`p-3 rounded-lg border-2 transition-all ${
                currency === curr.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-lg font-semibold">{curr.symbol}</div>
              <div className="text-xs text-gray-600">{curr.code}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {budgetType === 'total' ? 'Total Trip Budget' : 'Daily Budget'} ({currencies.find(c => c.code === currency)?.symbol})
        </label>
        <input
          type="text"
          value={budget}
          onChange={(e) => handleBudgetChange(e.target.value)}
          placeholder={budgetType === 'total' ? 'e.g., 5,000' : 'e.g., 200'}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          disabled={isNotSure}
        />
        
        {/* Not Sure Button */}
        <div className="mt-4 text-center">
          {!isNotSure ? (
            <button
              onClick={handleNotSure}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              🤔 I am not sure how much I want to spend
            </button>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 font-medium mb-2">
                💡 No worries! We'll help you figure out your budget
              </p>
              <p className="text-sm text-yellow-700 mb-3">
                The AI will guide you through a discussion to determine an appropriate budget based on your preferences and destination.
              </p>
              <button
                onClick={handleClearNotSure}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
              >
                Change my mind - I want to set a budget
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Budget Guidelines */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-3">Daily Budget Guidelines</h4>
        <p className="text-sm text-gray-600 mb-3">
          Based on average traveler spending patterns worldwide - these are per-person, per-day estimates
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-red-100 rounded-lg">
            <div className="font-semibold text-red-800">Tight Budget</div>
            <div className="text-red-600">$50-100/day</div>
            <div className="text-xs text-red-500">Hostels, street food, public transport, free activities, shared rooms</div>
          </div>
          <div className="text-center p-3 bg-yellow-100 rounded-lg">
            <div className="font-semibold text-yellow-800">Comfortable</div>
            <div className="text-yellow-600">$100-250/day</div>
            <div className="text-xs text-yellow-500">Mid-range hotels, restaurants, some paid activities, mix of transport, private rooms</div>
          </div>
          <div className="text-center p-3 bg-green-100 rounded-lg">
            <div className="font-semibold text-green-800">Luxurious</div>
            <div className="text-green-600">$250+/day</div>
            <div className="text-xs text-green-500">Premium hotels, fine dining, all activities, private transport, exclusive experiences</div>
          </div>
        </div>
      </div>

      {/* Enhanced XE Currency Converter */}
      <div className="mb-6 p-4 bg-blue-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">Need to check currency rates?</h4>
            <p className="text-sm text-blue-600 mb-2">
              Use XE Currency Converter to check current exchange rates and convert between currencies
            </p>
            <p className="text-xs text-blue-500">
              This helps you understand the real cost in your local currency and compare with other destinations. 
              Exchange rates can significantly affect your budget planning!
            </p>
          </div>
          <button
            onClick={openXE}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Open XE
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          className="px-6 py-3 rounded-xl font-semibold bg-gray-500 text-white hover:bg-gray-600 transition-all"
        >
          Previous
        </button>

        <div className="text-gray-500">
          {currentQuestion} of {totalQuestions}
        </div>

        <button
          onClick={handleNext}
          disabled={!isNotSure && (!budget || parseFloat(budget.replace(/,/g, '')) <= 0)}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            isNotSure || (budget && parseFloat(budget.replace(/,/g, '')) > 0)
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default Question3Budget;