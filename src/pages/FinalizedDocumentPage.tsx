import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DocumentData } from '../types';
import DailyPlanner from '../components/DailyPlanner';
import { getCurrentUser } from '../services/apiService';

const FinalizedDocumentPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [searchParams] = useSearchParams();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsCreator] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState<string>('Unknown Creator');

  useEffect(() => {
    if (documentId) {
      try {
        const currentUser = getCurrentUser();
        const shareCode = searchParams.get('code');
        
        // Check if this is a shared document view (via share code)
        if (shareCode) {
          console.log('🔗 [DEBUG] Loading shared document with code:', shareCode);
          setIsSharedView(true);
          
          // Retrieve shared document from backend API
          const loadSharedDocument = async () => {
            try {
              const response = await fetch(`http://localhost:3001/api/documents/share/${shareCode.toUpperCase()}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });

              const result = await response.json();

              if (!response.ok) {
                throw new Error(result.error || 'Document not found');
              }

              console.log('🔗 [DEBUG] Shared document retrieved from backend:', result);
              setDocument(result.document.data);
              setCreatorName(result.document.creatorName || 'Unknown Creator');
              setIsCreator(false); // This is a shared view, not creator
            } catch (err) {
              console.error('🔗 [ERROR] Failed to load shared document:', err);
              setError(err instanceof Error ? err.message : 'Shared document not found or invalid share code');
            } finally {
              setLoading(false);
            }
          };
          
          loadSharedDocument();
        } else {
          // This is a direct access (likely from Finalize button)
          console.log('📄 [DEBUG] Loading document directly for creator');
          setIsSharedView(false);
          
          const savedDocs = localStorage.getItem('destinationDocuments');
          if (savedDocs) {
            const docs = JSON.parse(savedDocs);
            const foundDoc = docs.find((doc: DocumentData) => doc.id === documentId);
            if (foundDoc) {
              setDocument(foundDoc);
              // Check if current user is the creator
              setIsCreator(currentUser ? foundDoc.creatorId === currentUser.id : false);
            } else {
              setError('Document not found');
            }
      } else {
            setError('No documents found');
          }
      }
    } catch (err) {
        console.error('Error loading document:', err);
      setError('Error loading document');
    } finally {
        // Only set loading to false if we're not loading a shared document
        // (shared document loading is handled in the async function)
        if (!shareCode) {
      setLoading(false);
    }
      }
    }
  }, [documentId, searchParams]);

  const handleInviteClick = async () => {
    console.log('🔥 [DEBUG] BUTTON CLICKED! handleInviteClick function called!');
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        alert('Please log in to share documents');
        return;
      }

      if (!document) {
        alert('Document not found');
        return;
      }

      console.log('📝 [DEBUG] FinalizedDocumentPage: Creating document share via backend API');
      console.log('📝 [DEBUG] FinalizedDocumentPage: Document ID:', document.id);
      
      // Debug: Check the token being used
      const token = localStorage.getItem('token');
      console.log('🔑 [DEBUG] Token being used:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN FOUND');
      console.log('🔑 [DEBUG] Full token for debugging:', token);
      
      // --- START: More robust token validation ---
      console.log('🔑 [DEBUG] Starting token validation...');
      if (!token) {
        console.error('🔑 [ERROR] No token found, forcing re-login');
        // Only clear authentication data, not user documents
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Your session has expired. Please log in again.');
        window.location.href = '/';
        return;
      }

      console.log('🔑 [DEBUG] Token exists, checking structure...');
      const parts = token.split('.');
      console.log('🔑 [DEBUG] Token parts count:', parts.length);
      if (parts.length !== 3) {
        console.error('🔑 [ERROR] Token has incorrect number of parts, forcing re-login');
        console.error('🔑 [ERROR] Token parts:', parts.length);
        // Only clear authentication data, not user documents
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Your session has expired. Please log in again.');
        window.location.href = '/';
        return;
      }

      // Basic check for the header part (first part)
      // A valid JWT header for HS256 is typically 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      // The corrupted one observed is 'eyJhbGci0iJIUzI1NiIs...' (with a '0' instead of 'O')
      const expectedHeaderPrefix = 'eyJhbGciOiJIUzI1NiIs'; // Note the 'O'
      console.log('🔑 [DEBUG] Checking header prefix...');
      console.log('🔑 [DEBUG] Expected:', expectedHeaderPrefix);
      console.log('🔑 [DEBUG] Actual:', parts[0].substring(0, expectedHeaderPrefix.length));
      console.log('🔑 [DEBUG] Expected length:', expectedHeaderPrefix.length);
      console.log('🔑 [DEBUG] Actual length:', parts[0].substring(0, expectedHeaderPrefix.length).length);
      console.log('🔑 [DEBUG] Starts with expected?', parts[0].startsWith(expectedHeaderPrefix));
      
      // More robust check - compare character by character
      const actualPrefix = parts[0].substring(0, expectedHeaderPrefix.length);
      console.log('🔑 [DEBUG] Starting character-by-character comparison...');
      console.log('🔑 [DEBUG] Expected chars:', expectedHeaderPrefix.split('').map((c, i) => `${i}:${c}`).join(' '));
      console.log('🔑 [DEBUG] Actual chars:  ', actualPrefix.split('').map((c, i) => `${i}:${c}`).join(' '));
      
      let isCorrupted = false;
      for (let i = 0; i < expectedHeaderPrefix.length; i++) {
        console.log(`🔑 [DEBUG] Comparing position ${i}: expected '${expectedHeaderPrefix[i]}' (${expectedHeaderPrefix.charCodeAt(i)}) vs actual '${actualPrefix[i]}' (${actualPrefix.charCodeAt(i)})`);
        if (expectedHeaderPrefix[i] !== actualPrefix[i]) {
          console.error(`🔑 [ERROR] Character mismatch at position ${i}: expected '${expectedHeaderPrefix[i]}', got '${actualPrefix[i]}'`);
          isCorrupted = true;
          break;
        }
      }
      console.log('🔑 [DEBUG] Character comparison complete. isCorrupted:', isCorrupted);
      
      if (isCorrupted || !parts[0].startsWith(expectedHeaderPrefix)) {
        console.error('🔑 [ERROR] Token header appears corrupted, forcing re-login');
        console.error('🔑 [ERROR] Expected header starts with:', expectedHeaderPrefix);
        console.error('🔑 [ERROR] Actual header starts with:', parts[0].substring(0, 20));
        console.error('🔑 [ERROR] Full corrupted token:', token);
        // Only clear authentication data, not user documents
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Your session has expired. Please log in again.');
        window.location.href = '/';
        return;
      }
      console.log('🔑 [DEBUG] Token validation passed!');
      // --- END: More robust token validation ---

      // Call backend API to create document share
      const response = await fetch('http://localhost:3001/api/documents/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          documentId: document.id,
          documentData: document
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create document share');
      }

      console.log('📝 [DEBUG] FinalizedDocumentPage: Backend API response:', result);
      
      setShareCode(result.shareCode);
      setShowInviteModal(true);
      
    } catch (error) {
      console.error('Error creating share code:', error);
      alert('Failed to create share code. Please try again.');
    }
  };

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
            {isSharedView ? 
              `Shared travel planning document by ${creatorName}` :
              'Your complete travel planning document is ready to share!'
            }
          </p>
                  {isSharedView && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                      <p className="text-blue-800 font-medium">
                        👥 You're viewing a shared document. This document was created and shared by another user.
                      </p>
                      <p className="text-blue-600 text-sm mt-2">
                        📖 <strong>View Only Mode:</strong> You can see all content and updates, but cannot edit the document.
                      </p>
                    </div>
                  )}

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
              readOnly={isSharedView}
              planningStyle={typeof document.bigIdeaSurveyData?.planningStyle === 'number' ? document.bigIdeaSurveyData.planningStyle : 50}
              initialTimeSlots={document.calendarPlanner?.timeSlots || []}
              onTimeSlotUpdate={async (timeSlots) => {
                // Update document with new time slots
                console.log('Time slots updated:', timeSlots);
                
                // Save the updated time slots to the document
                if (!isSharedView && document) {
                  const updatedDocument = {
                    ...document,
                    calendarPlanner: {
                      ...document.calendarPlanner,
                      timeSlots: timeSlots
                    }
                  };
                  
                  // Update the document state
                  setDocument(updatedDocument);
                  
                  // Save to localStorage
                  const savedDocs = localStorage.getItem('destinationDocuments');
                  if (savedDocs) {
                    const docs = JSON.parse(savedDocs);
                    const updatedDocs = docs.map((doc: DocumentData) => 
                      doc.id === documentId ? updatedDocument : doc
                    );
                    localStorage.setItem('destinationDocuments', JSON.stringify(updatedDocs));
                    console.log('✅ Daily planner changes saved to localStorage');
                  }

                  // If there's an active share code, update the backend document share
                  if (shareCode) {
                    try {
                      const response = await fetch(`http://localhost:3001/api/documents/share/${shareCode}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                          documentData: updatedDocument
                        })
                      });

                      if (response.ok) {
                        console.log('✅ Daily planner changes updated in backend for shared viewers');
                      } else {
                        console.warn('⚠️ Failed to update backend document share');
                      }
                    } catch (error) {
                      console.error('❌ Error updating backend document share:', error);
                    }
                  }
                }
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
            <div className="flex gap-4 justify-center">
              {!isSharedView && (
            <button
                  onClick={handleInviteClick}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Invite Others
                </button>
              )}
              <button
                onClick={() => window.close()}
              className="btn-primary"
            >
                Close Document
            </button>
          </div>
      </div>
        </motion.div>

        {/* Invite Modal */}
        {showInviteModal && shareCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share Document</h3>
              <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
              >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Share this code with others to let them view your document:</p>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <code className="text-lg font-mono font-bold text-gray-800 flex-1">{shareCode}</code>
              <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareCode);
                      alert('Share code copied to clipboard!');
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Copy
              </button>
            </div>
          </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Others can use this code in the "View Document" button to see your finalized document.
                </p>
            </div>
              
              <div className="flex gap-3">
              <button
                  onClick={async () => {
                    if (shareCode) {
                      try {
                        // Call backend API to delete document share
                        const response = await fetch(`http://localhost:3001/api/documents/share/${shareCode}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          }
                        });

                        const result = await response.json();

                        if (!response.ok) {
                          throw new Error(result.error || 'Failed to stop sharing');
                        }

                        console.log('📝 [DEBUG] FinalizedDocumentPage: Document sharing stopped via backend API');
                        setShowInviteModal(false);
                        setShareCode(null);
                        alert('Document sharing has been disabled.');
                      } catch (error) {
                        console.error('Error stopping document sharing:', error);
                        alert('Failed to stop sharing. Please try again.');
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Stop Sharing
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          </div>
      )}
      </div>
    </div>
  );
};

export default FinalizedDocumentPage; 