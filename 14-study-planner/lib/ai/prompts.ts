/**
 * AI Prompts for Study Planner
 * All prompts are designed for Claude Haiku 4.5
 */

export function generateLearningPlanPrompt(
  subjectName: string,
  studyGoal: string,
  weeksAvailable: number
): string {
  return `You are an expert study planner. Create a detailed, week-by-week learning plan.

Subject: ${subjectName}
Study Goal: ${studyGoal}
Time Available: ${weeksAvailable} weeks

Create a structured learning plan with the following format:

**Week 1: [Topic]**
- Learning objectives
- Key concepts to master
- Recommended study time per day
- Practice exercises

[Continue for all ${weeksAvailable} weeks]

**Success Metrics:**
- How to measure progress
- Key milestones

Keep the plan realistic, actionable, and specific. Focus on progressive learning.`;
}

export function generateReviewSchedulePrompt(
  sessionData: {
    subjectName: string;
    durationMinutes: number;
    comprehension: number;
    notes?: string;
  }
): string {
  return `You are a learning optimization expert. Based on this study session, recommend an optimal review strategy.

Subject: ${sessionData.subjectName}
Study Duration: ${sessionData.durationMinutes} minutes
Comprehension Level: ${sessionData.comprehension}/5
Notes: ${sessionData.notes || 'None'}

Provide specific review recommendations:

1. **Immediate Actions** (within 24 hours):
   - What to review first
   - Key concepts to reinforce

2. **Review Strategy**:
   - Best times to review
   - Specific techniques to use
   - Areas needing extra attention

3. **Long-term Retention Tips**:
   - How to solidify this knowledge
   - Connection to future learning

Keep recommendations practical and specific to the comprehension level.`;
}

export function generateStudyMethodPrompt(
  subjectName: string,
  recentSessions: Array<{
    durationMinutes: number;
    comprehension: number;
    notes?: string;
  }>
): string {
  const avgComprehension = recentSessions.length > 0
    ? recentSessions.reduce((sum, s) => sum + s.comprehension, 0) / recentSessions.length
    : 0;
  const totalTime = recentSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return `You are a learning methodology expert. Analyze the study patterns and recommend optimal study methods.

Subject: ${subjectName}
Recent Sessions: ${recentSessions.length}
Total Study Time: ${totalTime} minutes
Average Comprehension: ${avgComprehension.toFixed(1)}/5

Session Details:
${recentSessions.map((s, i) => `Session ${i + 1}: ${s.durationMinutes}min, Comprehension: ${s.comprehension}/5${s.notes ? `, Notes: ${s.notes}` : ''}`).join('\n')}

Recommend:

1. **Optimal Study Methods** for this subject:
   - Specific techniques (e.g., Feynman, Active Recall, Spaced Repetition)
   - Why these methods work for this subject

2. **Session Structure**:
   - Ideal session length
   - Break patterns
   - Focus techniques

3. **Improvement Areas**:
   - What's working well
   - What needs adjustment
   - Specific action items

Base recommendations on the actual performance data shown above.`;
}

export function generateProgressAnalysisPrompt(
  subjectName: string,
  sessions: Array<{
    durationMinutes: number;
    comprehension: number;
    studiedAt: Date;
  }>
): string {
  const totalTime = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const avgComprehension = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.comprehension, 0) / sessions.length
    : 0;
  const recentSessions = sessions.slice(0, 5);

  return `You are a learning analytics expert. Analyze the study progress and provide insights.

Subject: ${subjectName}
Total Sessions: ${sessions.length}
Total Study Time: ${totalTime} minutes (${(totalTime / 60).toFixed(1)} hours)
Average Comprehension: ${avgComprehension.toFixed(1)}/5

Recent 5 Sessions:
${recentSessions.map((s, i) => `${i + 1}. ${s.studiedAt.toLocaleDateString()}: ${s.durationMinutes}min, Comprehension: ${s.comprehension}/5`).join('\n')}

Provide a comprehensive progress analysis:

1. **Overall Progress**:
   - Trend analysis (improving/stable/declining)
   - Key achievements
   - Areas of concern

2. **Learning Velocity**:
   - Study consistency
   - Comprehension trends
   - Efficiency metrics

3. **Actionable Recommendations**:
   - What to continue doing
   - What to change
   - Next focus areas

4. **Predictions**:
   - Expected mastery timeline
   - Suggested goals for next 2 weeks

Be specific, data-driven, and encouraging.`;
}

export function generateMotivationPrompt(
  userName: string,
  recentProgress: {
    sessionsThisWeek: number;
    totalMinutesThisWeek: number;
    avgComprehension: number;
  }
): string {
  return `You are a supportive learning coach. Generate an encouraging, personalized motivation message.

Student Progress This Week:
- Study Sessions: ${recentProgress.sessionsThisWeek}
- Total Study Time: ${recentProgress.totalMinutesThisWeek} minutes
- Average Comprehension: ${recentProgress.avgComprehension.toFixed(1)}/5

Create a motivational message that:
1. Acknowledges specific achievements
2. Encourages continued effort
3. Provides a practical tip or insight
4. Ends with an inspiring thought

Keep it genuine, personal (avoid generic platitudes), and under 150 words. Focus on growth mindset and intrinsic motivation.`;
}
