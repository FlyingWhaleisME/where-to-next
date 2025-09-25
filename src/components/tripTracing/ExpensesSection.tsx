import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpensesSectionProps {
  onAnswer: (sectionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentSection: number;
  totalSections: number;
  canProceed: boolean;
}

const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentSection,
  totalSections,
  canProceed
}) => {
  // Load existing data from localStorage
  const getExistingData = () => {
    const saved = localStorage.getItem('tripTracingState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        return state.expenses || {};
      } catch (error) {
        console.error('Error parsing trip tracing state:', error);
      }
    }
    return {};
  };

  const existingData = getExistingData();

  const [expenseType, setExpenseType] = useState<string>(existingData.type || '');
  const [explanation, setExplanation] = useState<string>(existingData.explanation || '');
  const [customPolicies, setCustomPolicies] = useState<string[]>(existingData.customPolicies || ['']);
  const [policySetName, setPolicySetName] = useState<string>('');
  const [savedPolicySets, setSavedPolicySets] = useState<any[]>([]);
  const [selectedSavedPolicySet, setSelectedSavedPolicySet] = useState<string>('');

  const expenseOptions = [
    { value: 'split', label: 'Split Equally', emoji: '🔀', description: 'Divide all costs equally' },
    { value: 'individual', label: 'Individual', emoji: '👤', description: 'Each person pays their own' },
    { value: 'alternating', label: 'Alternating', emoji: '🔄', description: 'Take turns paying' },
    { value: 'category', label: 'By Category', emoji: '📊', description: 'Split by expense type' },
    { value: 'income', label: 'By Income', emoji: '💵', description: 'Split proportionally to income' },
    { value: 'custom', label: 'Custom Policies', emoji: '📝', description: 'Create your own expense sharing rules' }
  ];

  useEffect(() => {
    // Load saved expense policy sets from localStorage
    const saved = localStorage.getItem('expensePolicySets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedPolicySets(parsed);
      } catch (error) {
        console.error('Error parsing expense policy sets:', error);
      }
    }
  }, []);

  useEffect(() => {
    const answer = {
      expenses: {
        type: expenseType,
        explanation: expenseType === 'custom' ? explanation : undefined,
        customPolicies: expenseType === 'custom' ? customPolicies : undefined,
        selectedSavedPolicySet
      }
    };
    onAnswer(currentSection, answer);
  }, [expenseType, explanation, customPolicies, selectedSavedPolicySet, currentSection, onAnswer]);

  const addPolicy = () => {
    setCustomPolicies([...customPolicies, '']);
  };

  const removePolicy = (index: number) => {
    if (customPolicies.length > 1) {
      setCustomPolicies(customPolicies.filter((_, i) => i !== index));
    }
  };

  const updatePolicy = (index: number, value: string) => {
    const updated = [...customPolicies];
    updated[index] = value;
    setCustomPolicies(updated);
  };

  const savePolicySet = () => {
    if (policySetName.trim() && customPolicies.some(policy => policy.trim())) {
      const validPolicies = customPolicies.filter(policy => policy.trim());
      const newPolicySet = {
        id: `policy_${Date.now()}`,
        name: policySetName.trim(),
        policies: validPolicies,
        createdAt: new Date().toISOString()
      };

      const updatedPolicySets = [...savedPolicySets, newPolicySet];
      setSavedPolicySets(updatedPolicySets);
      localStorage.setItem('expensePolicySets', JSON.stringify(updatedPolicySets));
      
      // Clear the input fields
      setCustomPolicies(['']);
      setPolicySetName('');
      
      alert(`Expense policy set "${newPolicySet.name}" saved successfully!`);
    }
  };

  const loadSavedPolicySet = (policySetId: string) => {
    console.log('Loading saved policy set:', policySetId);
    const policySet = savedPolicySets.find(p => p.id === policySetId);
    console.log('Found policy set:', policySet);
    if (policySet) {
      console.log('Loading policies:', policySet.policies);
      setCustomPolicies([...policySet.policies]);
      setSelectedSavedPolicySet(policySetId);
    }
  };

  const canProceedToNext = () => {
    if (!expenseType) return false;
    
    if (expenseType === 'custom') {
      // For custom policies, need at least one non-empty policy
      return customPolicies.some(policy => policy.trim());
    } else {
      // For standard types, just need to have selected an option - no explanation needed
      return true;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          💰 Expense Sharing
        </h2>
        <p className="text-lg text-gray-600">
          How do you prefer to handle expenses when traveling with others?
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">How do you want to share expenses?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseOptions.map((option) => (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`option-card ${expenseType === option.value ? 'selected' : ''}`}
              onClick={() => setExpenseType(option.value)}
            >
              <div className="text-4xl mb-3">{option.emoji}</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{option.label}</h4>
              <p className="text-gray-600">{option.description}</p>
            </motion.div>
          ))}
        </div>
      </div>


      {/* Custom Policies Section */}
      <AnimatePresence>
        {expenseType === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 space-y-6"
          >
            <h3 className="text-xl font-semibold text-gray-800">Create Custom Expense Sharing Policies:</h3>
            
            {/* Saved Policy Sets Selection */}
            {savedPolicySets.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Use a saved policy set:</h4>
                <select
                  value={selectedSavedPolicySet}
                  onChange={(e) => {
                    setSelectedSavedPolicySet(e.target.value);
                    if (e.target.value) {
                      loadSavedPolicySet(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a saved policy set...</option>
                  {savedPolicySets.map((policySet) => (
                    <option key={policySet.id} value={policySet.id}>
                      {policySet.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Policy Set Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Set Name (for saving):
              </label>
              <input
                type="text"
                value={policySetName}
                onChange={(e) => setPolicySetName(e.target.value)}
                placeholder="e.g., 'Family Trip Rules', 'Friends Weekend Policies'"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Dynamic Policy Inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Sharing Policies:
              </label>
              <div className="space-y-3">
                {customPolicies.map((policy, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={policy}
                      onChange={(e) => updatePolicy(index, e.target.value)}
                      placeholder={`Policy ${index + 1}: e.g., "Whoever suggests the restaurant pays", "Split accommodation 50/50"`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {customPolicies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePolicy(index)}
                        className="px-4 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPolicy}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  + Add another policy
                </button>
              </div>
            </div>

            {/* Save Policy Set Button */}
            <div className="flex justify-end">
              <button
                onClick={savePolicySet}
                disabled={!policySetName.trim() || !customPolicies.some(policy => policy.trim())}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  policySetName.trim() && customPolicies.some(policy => policy.trim())
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                💾 Save Policy Set
              </button>
            </div>

            {/* Policy Summary */}
            {customPolicies.some(policy => policy.trim()) && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">✅ Your Current Policies:</h4>
                <ul className="space-y-2">
                  {customPolicies.filter(policy => policy.trim()).map((policy, index) => (
                    <li key={index} className="text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2 font-bold">{index + 1}.</span>
                      {policy}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          className="px-6 py-3 rounded-xl font-semibold bg-gray-500 text-white hover:bg-gray-600 transition-all"
        >
          ← Previous
        </button>

        <div className="text-gray-500">
          {currentSection} of {totalSections}
        </div>

        <motion.button
          whileHover={{ scale: canProceedToNext() ? 1.05 : 1 }}
          whileTap={{ scale: canProceedToNext() ? 0.95 : 1 }}
          onClick={onNext}
          disabled={!canProceedToNext()}
          className={`btn-primary text-lg px-8 py-4 ${
            canProceedToNext()
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {canProceedToNext() ? 'Continue →' : 
           (expenseType === 'custom' ? 'Please add at least one policy' : 'Please explain your approach')}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ExpensesSection; 