// deepthought.nz contact form
// Deployed as a Google Apps Script web app (execute as owner, access: anyone).
// Emails each submission to RECIPIENT from the owner's Google account.

const RECIPIENT = 'contact@deepthought.nz';
const SITE_URL = 'https://deepthought.nz';
const LIMITS = { name: 200, email: 320, message: 5000 };

function doPost(e) {
	const p = (e && e.parameter) || {};
	const wantsJson = p.format === 'json';

	// Honeypot: real visitors never see or fill this field
	if (p.company) return respond(wantsJson, true);

	const name = clean(p.name, LIMITS.name);
	const email = clean(p.email, LIMITS.email);
	const message = clean(p.message, LIMITS.message);

	if (!name || !email || !message) return respond(wantsJson, false, 'Please fill in every field.');
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respond(wantsJson, false, 'Please enter a valid email address.');

	MailApp.sendEmail({
		to: RECIPIENT,
		replyTo: email,
		name: 'deepthought.nz website',
		subject: 'Website enquiry from ' + name,
		body: [
			'Name: ' + name,
			'Email: ' + email,
			'Sent: ' + Utilities.formatDate(new Date(), 'Pacific/Auckland', 'd MMM yyyy, h:mm a'),
			'',
			message,
		].join('\n'),
	});

	return respond(wantsJson, true);
}

function clean(value, max) {
	return String(value || '').trim().slice(0, max);
}

function respond(wantsJson, ok, error) {
	if (wantsJson) {
		return ContentService
			.createTextOutput(JSON.stringify(ok ? { ok: true } : { ok: false, error: error }))
			.setMimeType(ContentService.MimeType.JSON);
	}
	// Fallback page for visitors without JavaScript
	const heading = ok ? 'Thanks — your message has been sent.' : 'Sorry, your message wasn’t sent.';
	const detail = ok ? '' : '<p>' + error + '</p>';
	return HtmlService.createHtmlOutput(
		'<div style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 16px;text-align:center">' +
		'<h1 style="font-weight:500">' + heading + '</h1>' + detail +
		'<p><a href="' + SITE_URL + '/#contact" target="_top">Back to deepthought.nz</a></p></div>'
	).setTitle('deepthought.nz');
}
