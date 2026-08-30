import { NextRequest, NextResponse } from 'next/server';
import { sendNewsletterBroadcast } from '@/lib/newsletter/dispatcher';
import { sanitizeObject } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cleanData = sanitizeObject(body);

    const testEmails = Array.isArray(cleanData.testEmails) && cleanData.testEmails.length > 0
      ? cleanData.testEmails
      : [cleanData.email || 'editor@goalmills.com'];

    const testRecipients = testEmails.map((email: string, idx: number) => ({
      email: email.trim().toLowerCase(),
      unsubscribeToken: `test_unsub_${idx}_${Date.now()}`,
      recipientId: `test_recipient_${idx}`,
    }));

    const result = await sendNewsletterBroadcast({
      campaignId: cleanData.campaignId || `test_campaign_${Date.now()}`,
      subject: `[TEST PREVIEW] ${cleanData.title || cleanData.subject || 'GoalMills Sports Intel'}`,
      previewText: cleanData.previewText || 'Test preview of newsletter broadcast',
      editorialNote: cleanData.editorialNote || 'This is an internal test preview sent from the GoalMills Admin Console.',
      frequency: cleanData.frequencyTier || 'Daily',
      isHighPriority: true,
      articleIds: cleanData.articleIds || [],
      recipients: testRecipients,
    });

    return NextResponse.json({
      success: true,
      message: `Test email dispatched to ${testEmails.length} address(es)`,
      queuedCount: testEmails.length,
      dispatcherResult: result,
    });
  } catch (error: any) {
    console.error('[Admin Newsletter Test Send] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
