exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  const BREVO_KEY = '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';
 
  try {
    const { title, text } = JSON.parse(event.body);
 
    // Récupère les contacts de la liste 2
    const contactsRes = await fetch('https://api.brevo.com/v3/contacts?limit=500&listId=2', {
      headers: { 'api-key': BREVO_KEY, 'Accept': 'application/json' }
    });
    const contactsData = await contactsRes.json();
    const contacts = contactsData.contacts || [];
 
    if (contacts.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, sent: 0 })
      };
    }
 
    const shortText = text.length > 300 ? text.slice(0, 300) + '…' : text;
 
    // Envoie l'email
    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Carpe Diem ⛵', email: 'timothee.vivot@gmail.com' },
        to: contacts.map(c => ({ email: c.email })),
        subject: `⛵ Nouvel article : ${title}`,
        htmlContent: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:2rem;background:#fdf6e8;">
            <div style="background:linear-gradient(135deg,#0d4a5e,#2aaa99);border-radius:12px;padding:1.5rem;text-align:center;margin-bottom:1.5rem;">
              <h1 style="color:#ffe08a;font-size:1.5rem;margin:0;">⛵ Carpe Diem</h1>
              <p style="color:rgba(255,255,255,0.8);font-size:0.9rem;margin:0.5rem 0 0;">Nouvel article publié !</p>
            </div>
            <h2 style="color:#1a5566;font-size:1.3rem;">${title}</h2>
            <p style="color:#3a2e22;line-height:1.8;font-size:1rem;">${shortText}</p>
            <div style="text-align:center;margin-top:1.5rem;">
              <a href="https://polynesie-tim.netlify.app" style="background:#d4755a;color:white;padding:0.8rem 2rem;border-radius:30px;text-decoration:none;font-weight:bold;">Lire la suite sur le blog →</a>
            </div>
            <hr style="border:none;border-top:1px solid #eee;margin:1.5rem 0;"/>
            <p style="font-size:0.78rem;color:#aaa;text-align:center;">Tu reçois cet email car tu suis le blog Carpe Diem.</p>
          </div>
        `
      })
    });
 
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, sent: contacts.length })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
