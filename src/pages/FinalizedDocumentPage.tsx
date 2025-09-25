import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DocumentData } from '../types';
import DailyPlanner from '../components/DailyPlanner';

const FinalizedDocumentPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documentId) {
      try {
        const savedDocs = localStorage.getItem('destinationDocuments');
        if (savedDocs) {
          const docs = JSON.parse(savedDocs);
          const foundDoc = docs.find((doc: DocumentData) => doc.id === documentId);
          if (foundDoc) {
            setDocument(foundDoc);
          } else {
            setError('Document not found');
          }
        } else {
          setError('No documents found');
        }
      } catch (err) {
        setError('Error loading document');
      } finally {
        setLoading(false);
      }
    }
  }, [documentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your document.</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Document not found'}</p>
        </div>
      </div>
    );
  }

  const isGroupTravel = (document.bigIdeaSurveyData?.groupSize || document.surveyData?.groupSize) !== 'solo';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            📄 {isGroupTravel ? 
              `${document.destinationName} - Finalized Travel Plan` : 
              `Travel Handbook of ${document.editableFields?.travelerName || 'Your Name'}`
            }
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your complete travel planning document is ready to share!
          </p>
        </motion.div>

        {/* Itinerary Plan - Daily Planner */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            📅 Daily Itinerary Planner
            </h2>
            
          {document.editableFields?.dates?.startDate && document.editableFields?.dates?.endDate ? (
            <DailyPlanner
              startDate={document.editableFields.dates.startDate}
              endDate={document.editableFields.dates.endDate}
              accommodationOptions={document.optionsOrganizer?.accommodation || []}
              mealOptions={document.optionsOrganizer?.meals || []}
              activityOptions={document.optionsOrganizer?.activities || []}
              planningStyle={typeof document.bigIdeaSurveyData?.planningStyle === 'number' ? document.bigIdeaSurveyData.planningStyle : 50}
              onTimeSlotUpdate={(timeSlots) => {
                // Update document with new time slots
                console.log('Time slots updated:', timeSlots);
              }}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>Please set your travel dates to use the daily planner!</p>
              </div>
            )}
          </motion.div>

        {/* Travel Companion Contract - Only for Group Travel */}
        {isGroupTravel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                🤝 Travel Companion Contract
              </h2>
              
            <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                  Group Travel Agreement
                </h3>
                <p className="text-yellow-700">
                  This contract helps ensure everyone has a great trip together!
                </p>
              </div>
                
                <div className="bg-white rounded-lg p-6">
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    {/* Trip Info */}
                    <p className="mb-2"><strong>Travel informations:</strong></p>
                    <p className="mb-4">
                      This trip to <strong>{document.destinationName}</strong> heading from{' '}
                      {document.editableFields?.dates?.startDate ? (
                        <strong>{new Date(document.editableFields.dates.startDate).toLocaleDateString()}</strong>
                      ) : (
                        <span className="text-blue-600 font-medium">[Date from]</span>
                      )}{' '}
                      to{' '}
                      {document.editableFields?.dates?.endDate ? (
                        <strong>{new Date(document.editableFields.dates.endDate).toLocaleDateString()}</strong>
                      ) : (
                        <span className="text-blue-600 font-medium">[Date to]</span>
                      )}{' '}
                      for{' '}
                      {document.editableFields?.dates?.duration ? (
                        <strong>{document.editableFields.dates.duration}</strong>
                      ) : (
                        <span className="text-blue-600 font-medium">[Duration]</span>
                      )}.
                    </p>

                    {/* Budget */}
                    <p className="mb-4">
                      Every member will bring themselves about{' '}
                      {document.editableFields?.budget?.amount ? (
                        <strong>
                          {document.editableFields.budget.currency === 'USD' ? '$' : document.editableFields.budget.currency}
                          {document.editableFields.budget.amount.toLocaleString()}
                          {document.editableFields.budget.perDay ? ' per day' : ' total'}
                        </strong>
                      ) : document.bigIdeaSurveyData?.budget ? (
                        <strong>
                          {document.bigIdeaSurveyData.currency === 'USD' ? '$' : document.bigIdeaSurveyData.currency}
                          {document.bigIdeaSurveyData.budget.toLocaleString()}
                          {document.bigIdeaSurveyData.budgetType === 'perDay' ? ' per day' : ' total'}
                        </strong>
                      ) : (
                        <span className="text-blue-600 font-medium">[Budget]</span>
                      )}{' '}
                      to{' '}
                      {document.editableFields?.budget?.perDay || document.bigIdeaSurveyData?.budgetType === 'perDay' ? (
                        <span>a daily budget</span>
                      ) : (
                        <span>the total trip budget</span>
                      )}.
                      {document.editableFields?.budget?.notes && document.editableFields.budget.notes.trim() !== '' && (
                        <span> They must remember: <em>{document.editableFields.budget.notes}</em></span>
                      )}
                    </p>

                    {/* Transportation to Destination */}
                    <p className="mb-4">
                      We will take{' '}
                      {document.editableFields?.transportation?.toDestination ? (
                        <strong>{document.editableFields.transportation.toDestination}</strong>
                      ) : document.tripTracingSurveyData?.travelMethod?.travelMethod ? (
                        <strong>{document.tripTracingSurveyData.travelMethod.travelMethod}</strong>
                      ) : (
                        <span className="text-blue-600 font-medium">[Transport to Destination]</span>
                      )}{' '}
                      to <strong>{document.destinationName}</strong>.
                      {document.editableFields?.transportation?.toNotes && document.editableFields.transportation.toNotes.trim() !== '' && (
                        <span> Keeping in mind: <em>{document.editableFields.transportation.toNotes}</em></span>
                      )}
                    </p>

                    {/* Transportation within Destination */}
                    <p className="mb-4">
                      In <strong>{document.destinationName}</strong>, we will use{' '}
                      {document.editableFields?.transportation?.withinDestination ? (
                        <strong>{document.editableFields.transportation.withinDestination}</strong>
                      ) : (document.tripTracingSurveyData?.transportation?.selectedMethods && Array.isArray(document.tripTracingSurveyData.transportation.selectedMethods)) ? (
                        <strong>{document.tripTracingSurveyData.transportation.selectedMethods.join(', ')}</strong>
                      ) : (
                        <span className="text-blue-600 font-medium">[Transportation within Destination]</span>
                      )}{' '}
                      for local transportation.
                      {document.editableFields?.transportation?.withinNotes && document.editableFields.transportation.withinNotes.trim() !== '' && (
                        <span> Keeping in mind: <em>{document.editableFields.transportation.withinNotes}</em></span>
                      )}
                    </p>

                    {/* Goal of this Trip */}
                    <div className="mb-4">
                      <p className="mb-2"><strong>Goal of this Trip:</strong></p>
                      <p className="mb-2">
                        {(() => {
                          const tripVibe = document.bigIdeaSurveyData?.tripVibe || document.surveyData?.tripVibe;
                          if (tripVibe) {
                            const vibes = tripVibe.split(',').map((v: string) => v.trim().toLowerCase());
                            const descriptions = [];
                            
                            // Use the actual trip vibe values from Question 6
                            if (vibes.includes('culinary')) {
                              descriptions.push('treating our taste buds to amazing local flavors and authentic dining experiences');
                            }
                            if (vibes.includes('entertainment')) {
                              descriptions.push('enjoying vibrant shows, cultural performances, and memorable nightlife');
                            }
                            if (vibes.includes('relaxation')) {
                              descriptions.push('finding peace and relaxation, because we all need some stress-free time');
                            }
                            if (vibes.includes('educational')) {
                              descriptions.push('learning and discovering new things through museums, landmarks, and educational experiences');
                            }
                            if (vibes.includes('cultural')) {
                              descriptions.push('immersing ourselves in rich culture and meaningful local interactions');
                            }
                            if (vibes.includes('shared')) {
                              descriptions.push('creating special memories together and strengthening our bonds');
                            }
                            
                            if (descriptions.length > 0) {
                              return (
                                <span>
                                  This trip is for people who love {descriptions.join(', ')}. 
                                  We're here to make the most of our time together and create amazing memories!
                                </span>
                              );
                            } else {
                              return (
                                <span>
                                  This trip focuses on <strong>{tripVibe}</strong> experiences. 
                                  Let's make it unforgettable!
                                </span>
                              );
                            }
                          }
                          return <span className="text-blue-600 font-medium">[trip focus and goals]</span>;
                        })()}
                      </p>
                      
                      {/* Activities from Question 7 */}
                      {(() => {
                        const activities = document.bigIdeaSurveyData?.vibeActivities || document.surveyData?.vibeActivities;
                        if (activities && Object.keys(activities).length > 0) {
                          const activitySections: JSX.Element[] = [];
                          
                          Object.entries(activities).forEach(([vibe, activityList]) => {
                            const validActivities = (activityList as string[]).filter(activity => activity && activity.trim() !== '');
                            if (validActivities.length > 0) {
                              const vibeLabels: {[key: string]: string} = {
                                'relaxation': 'Relaxation',
                                'entertainment': 'Entertainment', 
                                'educational': 'Educational Discovery',
                                'cultural': 'Cultural Immersion',
                                'shared': 'Shared Escape',
                                'culinary': 'Culinary Adventure'
                              };
                              
                              activitySections.push(
                                <div key={vibe} className="mb-2">
                                  <span className="font-medium">{vibeLabels[vibe] || vibe}:</span> {validActivities.join(', ')}
                    </div>
                              );
                            }
                          });
                          
                          if (activitySections.length > 0) {
                            return (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">Specific activities we're excited about:</p>
                                {activitySections}
                    </div>
                            );
                          }
                        }
                        return null;
                      })()}
                      
                      <p className="mb-2">
                        {(() => {
                          const planningStyle = document.bigIdeaSurveyData?.planningStyle || document.surveyData?.planningStyle;
                          if (typeof planningStyle === 'number') {
                            if (planningStyle < 25) {
                              return (
                                <span>
                                  We're going with a <strong>go-with-the-flow</strong> approach - 
                                  we'll wake up, see how we feel, and decide what to do based on our mood and local recommendations. 
                                  No pressure, just pure spontaneity!
                                </span>
                              );
                            } else if (planningStyle < 50) {
                              return (
                                <span>
                                  We'll have a <strong>loose structure</strong> with plenty of room for spontaneity - 
                                  think of it as having a general game plan but being totally cool with last-minute changes and discoveries.
                                </span>
                              );
                            } else if (planningStyle < 75) {
                              return (
                                <span>
                                  We're the <strong>well-planned</strong> type who likes to pack our days with activities and make every moment count. 
                                  Even our downtime at the hotel might be part of the plan! 
                                  Members, please commit to fully participating in our organized adventure.
                                </span>
                              );
                            } else {
                              return (
                                <span>
                                  We're going <strong>full planning mode</strong> - detailed schedules, backup plans, and contingency strategies for everything. 
                                  We've thought of every possible scenario because that's how we roll!
                                </span>
                              );
                            }
                          } else if (typeof planningStyle === 'string') {
                            const lowerStyle = planningStyle.toLowerCase();
                            if (lowerStyle.includes('lazy') || lowerStyle.includes('spontaneous')) {
                              return (
                                <span>
                                  We're going with a <strong>go-with-the-flow</strong> approach - 
                                  we'll wake up, see how we feel, and decide what to do based on our mood and local recommendations. 
                                  No pressure, just pure spontaneity!
                                </span>
                              );
                            } else if (lowerStyle.includes('some') || lowerStyle.includes('flexible')) {
                              return (
                                <span>
                                  We'll have a <strong>loose structure</strong> with plenty of room for spontaneity - 
                                  think of it as having a general game plan but being totally cool with last-minute changes and discoveries.
                                </span>
                              );
                            } else if (lowerStyle.includes('well') || lowerStyle.includes('structured')) {
                              return (
                                <span>
                                  We're the <strong>well-planned</strong> type who likes to pack our days with activities and make every moment count. 
                                  Even our downtime at the hotel might be part of the plan! 
                                  Members, please commit to fully participating in our organized adventure.
                                </span>
                              );
                            } else if (lowerStyle.includes('complete') || lowerStyle.includes('detailed')) {
                              return (
                                <span>
                                  We're going <strong>full planning mode</strong> - detailed schedules, backup plans, and contingency strategies for everything. 
                                  We've thought of every possible scenario because that's how we roll!
                                </span>
                              );
                            }
                          }
                          return <span className="text-blue-600 font-medium">[planning approach and expectations]</span>;
                        })()}
                      </p>
                      
                      {document.bigIdeaSurveyData?.priorities && Array.isArray(document.bigIdeaSurveyData.priorities) && document.bigIdeaSurveyData.priorities.length > 0 && (
                        <div className="mb-2">
                          <p className="mb-1">Every decision we make during this trip will follow this priority order:</p>
                          <ol className="list-decimal list-inside ml-4 space-y-1">
                            {document.bigIdeaSurveyData.priorities.map((priority: string, index: number) => {
                              const priorityLower = priority.toLowerCase();
                              let description = '';
                              
                              if (priorityLower.includes('safety')) {
                                description = 'Safety first - nobody gets hurt on our watch!';
                              } else if (priorityLower.includes('time-efficiency')) {
                                description = 'Time is gold - no wasting precious vacation time!';
                              } else if (priorityLower.includes('cost-efficiency') || priorityLower.includes('cost-effectiveness')) {
                                description = 'Value for money - we\'re not getting ripped off!';
                              } else if (priorityLower.includes('accessibility')) {
                                description = 'Accessibility matters - everyone deserves to enjoy this trip!';
                              } else if (priorityLower.includes('eco-friendliness')) {
                                description = 'Eco-friendly choices - let\'s travel responsibly!';
                              } else if (priorityLower.includes('number-of-options')) {
                                description = 'Plenty of options - we like having choices!';
                              } else {
                                description = `${priority} - because that's what matters to us!`;
                              }
                              
                              return (
                                <li key={index} className="text-sm">
                                  <strong>{priority}:</strong> {description}
                                </li>
                              );
                            })}
                          </ol>
                    </div>
                  )}
                      
                      {document.bigIdeaSurveyData?.leewayExplanation && (
                        <p className="mb-2 text-sm italic">
                          <strong>Built-in Recess Note:</strong> {document.bigIdeaSurveyData.leewayExplanation}
                        </p>
                      )}
            </div>

                    {/* Expense Sharing Rules */}
                    <div className="mb-4">
                      <p className="mb-2"><strong>Rules to keep in mind:</strong></p>
                      {(document.editableFields?.expenseSharing?.policy || document.tripTracingSurveyData?.expenses?.type) && 
                       (document.editableFields?.expenseSharing?.policy !== 'custom' && document.tripTracingSurveyData?.expenses?.type !== 'custom') ? (
                        <p>
                          Expense will be{' '}
                          {(() => {
                            const policy = document.editableFields?.expenseSharing?.policy || document.tripTracingSurveyData?.expenses?.type;
                            switch (policy) {
                              case 'split': return 'split equally among all members - fair and simple!';
                              case 'individual': return 'handled individually by each member - maximum flexibility!';
                              case 'alternating': return 'paid by taking turns - like a friendly rotation!';
                              case 'category': return 'split by category (meals, activities, etc.) - organized approach!';
                              case 'income': return 'split proportionally based on income - considerate and fair!';
                              default: return 'discussed and agreed upon by all members';
                            }
                          })()}
                        </p>
                      ) : (
                          <div>
                          <p>Members must follow the rules of expense splitting as mentioned below:</p>
                          <ol className="list-decimal list-inside ml-4 space-y-1">
                            {(document.editableFields?.expenseSharing?.customPolicies || document.tripTracingSurveyData?.expenses?.customPolicies || [])
                              .filter((policy: string) => policy && policy.trim() !== '')
                              .map((policy: string, index: number) => (
                                <li key={index}>{policy}</li>
                              ))}
                          </ol>
                        </div>
                      )}
              </div>

                    {/* Group Rules */}
                    {document.editableFields?.groupRules?.rules && 
                     Array.isArray(document.editableFields.groupRules.rules) && 
                     document.editableFields.groupRules.rules.some((rule: string) => rule.trim() !== '') && (
                      <div className="mb-4">
                        <p className="mb-2">
                          Furthermore, please comply to our rules for our trip to progress with mutual happiness:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          {document.editableFields.groupRules.rules
                            .filter((rule: string) => rule.trim() !== '')
                            .map((rule: string, index: number) => (
                              <li key={index}>{rule}</li>
                            ))}
                        </ul>
              </div>
            )}

                    {/* Travel Companions */}
                    <div className="mb-4">
                      <p>
                        <strong>Travel Companions:</strong>{' '}
                        {document.editableFields?.groupMembers && document.editableFields.groupMembers.length > 0 && 
                         document.editableFields.groupMembers.some((member: string) => member.trim() !== '') ? (
                          document.editableFields.groupMembers
                            .filter((member: string) => member.trim() !== '')
                            .map((member: string, index: number) => (
                              <span key={index}>
                                {index > 0 && ', '}
                                <strong>{member}</strong>
                              </span>
                            ))
                        ) : (
                          <span className="text-blue-600 font-medium">[Travel Companion Names]</span>
                        )}
                      </p>
                  </div>

                    {/* Date */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        <strong>Date:</strong> {new Date().toLocaleDateString()}
                      </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Travel Handbook - Only for Solo Travel */}
        {!isGroupTravel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              📖 Travel Handbook
            </h2>
            
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Personal Travel Guide for {document.editableFields?.travelerName || 'Your Name'}
                </h3>
                <p className="text-gray-600">
                  Your comprehensive travel planning document
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {/* Trip Info */}
                  <p className="mb-2"><strong>Travel Information:</strong></p>
                  <p className="mb-4">
                    This trip to <strong>{document.destinationName}</strong> starting from{' '}
                    {document.editableFields?.dates?.startDate ? (
                      <strong>{new Date(document.editableFields.dates.startDate).toLocaleDateString()}</strong>
                    ) : (
                      <span className="text-blue-600 font-medium">[Start Date]</span>
                    )}{' '}
                    to{' '}
                    {document.editableFields?.dates?.endDate ? (
                      <strong>{new Date(document.editableFields.dates.endDate).toLocaleDateString()}</strong>
                    ) : (
                      <span className="text-blue-600 font-medium">[End Date]</span>
                    )}{' '}
                    for{' '}
                    {document.editableFields?.dates?.duration ? (
                      <strong>{document.editableFields.dates.duration}</strong>
                    ) : (
                      <span className="text-blue-600 font-medium">[Duration]</span>
                    )}.
                  </p>

                  {/* Budget */}
                  <p className="mb-2"><strong>Budget Planning:</strong></p>
                  <p className="mb-4">
                    {document.editableFields?.budget?.amount ? (
                      <>
                        Budget: <strong>${document.editableFields.budget.amount.toLocaleString()} {document.editableFields.budget.currency}</strong>
                        {document.editableFields.budget.perDay ? ' per day' : ' total'}
                        {document.editableFields.budget.notes && document.editableFields.budget.notes.trim() !== '' && (
                          <span>. Notes: <em>{document.editableFields.budget.notes}</em></span>
                        )}
                      </>
                    ) : (
                      <span className="text-blue-600 font-medium">[Budget Information]</span>
                    )}
                  </p>

                  {/* Transportation */}
                  <p className="mb-2"><strong>Transportation:</strong></p>
                  <p className="mb-4">
                    Primary transportation to destination:{' '}
                    {document.editableFields?.transportation?.toDestination ? (
                      <strong>{document.editableFields.transportation.toDestination}</strong>
                    ) : (
                      <span className="text-blue-600 font-medium">[Transport to Destination]</span>
                    )}{' '}
                    to <strong>{document.destinationName}</strong>.
                    {document.editableFields?.transportation?.toNotes && document.editableFields.transportation.toNotes.trim() !== '' && (
                      <span> Planning notes: <em>{document.editableFields.transportation.toNotes}</em></span>
                    )}
                  </p>

                  <p className="mb-4">
                    Local transportation within <strong>{document.destinationName}</strong>:{' '}
                    {document.editableFields?.transportation?.withinDestination ? (
                      <strong>{document.editableFields.transportation.withinDestination}</strong>
                    ) : (
                      <span className="text-blue-600 font-medium">[Local Transportation]</span>
                    )}
                    {document.editableFields?.transportation?.withinNotes && document.editableFields.transportation.withinNotes.trim() !== '' && (
                      <span>. Notes: <em>{document.editableFields.transportation.withinNotes}</em></span>
                    )}
                  </p>

                  {/* Goal of this Trip */}
                  {document.bigIdeaSurveyData && (
                    <>
                      <p className="mb-2"><strong>Goal of this Trip:</strong></p>
                      <p className="mb-4">
                        {document.bigIdeaSurveyData.tripVibe && (
                          <span>Seeking <strong>{document.bigIdeaSurveyData.tripVibe}</strong> experiences. </span>
                        )}
                        {document.bigIdeaSurveyData.planningStyle && (
                          <span>Planning approach: <strong>{document.bigIdeaSurveyData.planningStyle}</strong>. </span>
                        )}
                        {document.bigIdeaSurveyData.priorities && document.bigIdeaSurveyData.priorities.length > 0 && (
                          <span>Key priorities: <strong>{document.bigIdeaSurveyData.priorities.join(', ')}</strong>.</span>
                        )}
                      </p>
                    </>
                  )}

                  {/* Date */}
                  <p className="mb-2"><strong>Document Date:</strong></p>
                  <p className="mb-4">
                    <strong>Date:</strong> {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Document Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-gray-50 rounded-3xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            📊 Document Information
            </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <strong className="text-gray-700">Created:</strong><br/>
              <span className="text-gray-600">{new Date(document.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <strong className="text-gray-700">Last Modified:</strong><br/>
              <span className="text-gray-600">{new Date(document.lastModified).toLocaleDateString()}</span>
            </div>
            <div>
              <strong className="text-gray-700">Document ID:</strong><br/>
              <span className="text-gray-600 font-mono text-xs">{document.id}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-gray-600 mb-4">
              This document is automatically saved and can be edited anytime from your profile page.
            </p>
            <button
              onClick={() => window.close()}
              className="btn-primary"
            >
              Close Document
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinalizedDocumentPage; 