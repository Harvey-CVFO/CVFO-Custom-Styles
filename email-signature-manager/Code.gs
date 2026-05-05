/**
 * CVFO Email Signature Manager
 * Apps Script web app for managing and pushing Gmail signatures via API.
 *
 * SECURITY:
 * Do not commit service account keys. Store these Script Properties instead:
 *   SERVICE_ACCOUNT_EMAIL
 *   SERVICE_ACCOUNT_PRIVATE_KEY
 *
 * DEPENDENCY:
 * OAuth2 Apps Script library:
 * 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF
 */

var BRAND = {
  navy: '#1a365d',
  teal: '#00708b',
  mutedTeal: '#83aeaf',
  gold: '#d2b450',
  snow: '#f7fafc',
  charcoal: '#2d3748',
  gray: '#4a5568',
  line: '#e2e8f0',
  paleLine: '#e8edf2',
  green: '#1ba663',
  steelBlue: '#0081cc'
};

var ASSETS = {
  base: 'https://harvey-cvfo.github.io/CVFO-Custom-Styles/',
  logo: 'Logo_alt_small%20(1).png',
  globe: 'globe-simple.svg',
  envelope: 'envelope-simple.svg',
  phone: 'phone.svg',
  pin: 'map-pin.svg',
  book: 'AOP%20Book.png'
};

var OFFICE = {
  website: 'collectivevfo.com',
  websiteUrl: 'https://www.collectivevfo.com',
  mainPhone: '(909) 206-4343',
  mainTel: '9092064343',
  address: '34475 Yucaipa Blvd Suite 208, Yucaipa, CA 92399',
  bookUrl: 'https://artofproactivity.collectivevfo.com'
};

var PEOPLE = [
  {
    name: 'Harvey Rustman',
    email: 'harvey@collectivevfo.com',
    title: 'Technology Systems Specialist',
    headshot: 'HarveyR_2026_1.png',
    phone: OFFICE.mainPhone + ' ext. 102',
    tel: OFFICE.mainTel + ',102',
    variants: [{ label: 'Regular', sig: 'HARVEY_SIG' }],
    active: 'HARVEY_SIG'
  },
  {
    name: 'Sterling Hirsch',
    email: 'sterling@collectivevfo.com',
    title: 'CEO / Advanced Planning Lead',
    headshot: 'SH_2026_Primary.png',
    phone: OFFICE.mainPhone,
    tel: OFFICE.mainTel,
    variants: [
      { label: 'Regular', sig: 'STERLING_SIG' },
      { label: 'Book Promo', sig: 'STERLING_BOOK_SIG' }
    ],
    active: 'STERLING_BOOK_SIG'
  },
  {
    name: 'Anna-Marie Lovell',
    email: 'anna-marie@collectivevfo.com',
    title: 'Advanced Planning Lead',
    headshot: 'Anna-MarieL_2026_1.jpg',
    phone: '(858) 869-3833',
    tel: '8588693833',
    variants: [
      { label: 'Regular', sig: 'ANNA_MARIE_SIG' },
      { label: 'Book Promo', sig: 'ANNA_MARIE_BOOK_SIG' }
    ],
    active: 'ANNA_MARIE_BOOK_SIG'
  },
  {
    name: 'Wyatt Dursteler',
    email: 'wyatt@collectivevfo.com',
    title: 'Advanced Planning Lead',
    headshot: 'WyattD_2026_1.png',
    phone: OFFICE.mainPhone,
    tel: OFFICE.mainTel,
    variants: [
      { label: 'Regular', sig: 'WYATT_SIG' },
      { label: 'Book Promo', sig: 'WYATT_BOOK_SIG' }
    ],
    active: 'WYATT_SIG',
    naturalHeadshotRatio: true
  },
  {
    name: 'Carmen Hirsch',
    email: 'carmen@collectivevfo.com',
    title: 'Business Development Associate',
    headshot: 'CarmenH_2026_1.png',
    phone: OFFICE.mainPhone,
    tel: OFFICE.mainTel,
    variants: [{ label: 'Regular', sig: 'CARMEN_SIG' }],
    active: 'CARMEN_SIG'
  },
  {
    name: 'Phil Castro',
    email: 'phil@collectivevfo.com',
    title: 'Content Marketing Manager',
    headshot: 'PhilC_2026_1.png',
    phone: OFFICE.mainPhone,
    tel: OFFICE.mainTel,
    variants: [{ label: 'Regular', sig: 'PHIL_SIG' }],
    active: 'PHIL_SIG'
  },
  {
    name: 'Henry Rodriguez',
    email: 'henry@collectivevfo.com',
    title: 'Client Operations Coordinator',
    headshot: 'HenryR_2026_1.png',
    phone: OFFICE.mainPhone + ' ext. 103',
    tel: OFFICE.mainTel + ',103',
    variants: [{ label: 'Regular', sig: 'HENRY_SIG' }],
    active: 'HENRY_SIG'
  }
];

var SIGNATURE_TO_EMAIL = {
  HARVEY_SIG: 'harvey@collectivevfo.com',
  STERLING_SIG: 'sterling@collectivevfo.com',
  STERLING_BOOK_SIG: 'sterling@collectivevfo.com',
  ANNA_MARIE_SIG: 'anna-marie@collectivevfo.com',
  ANNA_MARIE_BOOK_SIG: 'anna-marie@collectivevfo.com',
  WYATT_SIG: 'wyatt@collectivevfo.com',
  WYATT_BOOK_SIG: 'wyatt@collectivevfo.com',
  CARMEN_SIG: 'carmen@collectivevfo.com',
  PHIL_SIG: 'phil@collectivevfo.com',
  HENRY_SIG: 'henry@collectivevfo.com'
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('CVFO Signature Manager')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getPeopleConfig() {
  return PEOPLE;
}

function getSignatureHtml(sigKey) {
  return buildSignature_(sigKey);
}

function pushSignatureByKey(email, sigKey) {
  var html = buildSignature_(sigKey);
  if (!html) {
    return { success: false, verified: false, message: 'Unknown signature key: ' + sigKey };
  }

  var service = getService_(email);
  if (!service.hasAccess()) {
    return { success: false, verified: false, message: 'OAuth failed: ' + service.getLastError() };
  }

  var url = buildSendAsUrl_(email, email);
  var maxAttempts = 3;
  var lastError = '';

  for (var attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      var res = UrlFetchApp.fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + service.getAccessToken(),
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({ signature: html }),
        muteHttpExceptions: true
      });

      if (res.getResponseCode() !== 200) {
        lastError = 'HTTP ' + res.getResponseCode() + ': ' + res.getContentText().substring(0, 300);
        Utilities.sleep(1000 * attempt);
        continue;
      }

      Utilities.sleep(500);
      var live = getLiveSignature(email);
      var verified = !!(live.success && live.html && live.html.length > 100);

      return {
        success: true,
        verified: verified,
        attempt: attempt,
        liveLength: live.html ? live.html.length : 0,
        message: verified
          ? 'Pushed and verified' + (attempt > 1 ? ' on attempt ' + attempt : '')
          : 'Pushed, but verification returned empty. User may need to refresh Gmail or activate the signature defaults.'
      };
    } catch (e) {
      lastError = e.message;
      Utilities.sleep(1000 * attempt);
    }
  }

  return { success: false, verified: false, message: 'Failed after ' + maxAttempts + ' attempts. Last error: ' + lastError };
}

function pushAllActive() {
  return PEOPLE.map(function (person) {
    var result = pushSignatureByKey(person.email, person.active);
    return {
      name: person.name,
      email: person.email,
      success: result.success,
      verified: result.verified,
      message: result.message
    };
  });
}

function getLiveSignature(email) {
  try {
    var service = getService_(email);
    if (!service.hasAccess()) {
      return { success: false, html: '', message: 'OAuth failed: ' + service.getLastError() };
    }

    var res = UrlFetchApp.fetch(buildSendAsUrl_(email, email), {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + service.getAccessToken() },
      muteHttpExceptions: true
    });

    if (res.getResponseCode() !== 200) {
      return { success: false, html: '', message: 'HTTP ' + res.getResponseCode() + ': ' + res.getContentText().substring(0, 300) };
    }

    var data = JSON.parse(res.getContentText());
    return { success: true, html: data.signature || '', message: 'OK' };
  } catch (e) {
    return { success: false, html: '', message: e.message };
  }
}

function checkCredentialSetup() {
  var props = PropertiesService.getScriptProperties();
  return {
    serviceAccountEmailConfigured: !!props.getProperty('SERVICE_ACCOUNT_EMAIL'),
    privateKeyConfigured: !!props.getProperty('SERVICE_ACCOUNT_PRIVATE_KEY')
  };
}

function testConnection() {
  return getLiveSignature('harvey@collectivevfo.com');
}

function pushHarveyRegular() {
  return pushSignatureByKey('harvey@collectivevfo.com', 'HARVEY_SIG');
}

function testSterlingBookOnHarvey() {
  return pushSignatureByKey('harvey@collectivevfo.com', 'STERLING_BOOK_SIG');
}

function restoreHarvey() {
  return pushSignatureByKey('harvey@collectivevfo.com', 'HARVEY_SIG');
}

function pushAllSignatures() {
  return pushAllActive();
}

function buildSignature_(sigKey) {
  var email = SIGNATURE_TO_EMAIL[sigKey];
  if (!email) return '';

  var person = getPersonByEmail_(email);
  if (!person) return '';

  var includeBookPromo = sigKey.indexOf('_BOOK_SIG') !== -1;
  return renderSignature_(person, includeBookPromo);
}

function renderSignature_(person, includeBookPromo) {
  var html = '';

  html += '<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;border-collapse:collapse;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;width:500px;">';
  html += renderHeader_(person);
  html += renderGoldLine_();
  html += renderContactBlock_(person);

  if (includeBookPromo) {
    html += renderBookPromo_();
  }

  html += renderTealLine_();
  html += renderTagline_();
  html += '</table>';

  return html;
}

function renderHeader_(person) {
  return '<tr><td style="background-color:' + BRAND.navy + ';padding:15px 20px 13px;mso-line-height-rule:exactly;line-height:1.4;">'
    + '<table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr>'
    + '<td style="vertical-align:middle;mso-line-height-rule:exactly;line-height:1.4;">'
    + '<div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-.3px;line-height:1.2;mso-line-height-rule:exactly;">' + esc_(person.name) + '</div>'
    + '<div style="font-size:8.5px;font-weight:700;color:' + BRAND.mutedTeal + ';letter-spacing:2px;text-transform:uppercase;margin-top:5px;line-height:1.2;mso-line-height-rule:exactly;">' + esc_(person.title) + '</div>'
    + '</td>'
    + '<td style="text-align:right;vertical-align:middle;">'
    + '<a href="' + OFFICE.websiteUrl + '" style="text-decoration:none;display:inline-block;line-height:0;">'
    + '<img src="' + asset_(ASSETS.logo) + '" height="60" alt="Collective VFO" style="display:block;border:0;line-height:0;" border="0">'
    + '</a></td></tr></table></td></tr>';
}

function renderGoldLine_() {
  return '<tr><td height="3" style="height:3px;background-color:' + BRAND.gold + ';font-size:0;line-height:0;mso-line-height-rule:exactly;padding:0;"></td></tr>';
}

function renderTealLine_() {
  return '<tr><td height="1" style="height:1px;background-color:' + BRAND.teal + ';font-size:0;line-height:0;mso-line-height-rule:exactly;padding:0;"></td></tr>';
}

function renderContactBlock_(person) {
  var headshotAttrs = person.naturalHeadshotRatio
    ? 'width="90"'
    : 'width="90" height="90"';

  return '<tr><td style="background-color:#ffffff;padding:15px 20px;mso-line-height-rule:exactly;line-height:1.4;">'
    + '<table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr>'
    + '<td style="vertical-align:top;padding-right:16px;width:106px;" width="106">'
    + '<img src="' + asset_(person.headshot) + '" ' + headshotAttrs + ' alt="' + esc_(person.name) + '" style="display:block;border:2px solid ' + BRAND.line + ';line-height:0;border-radius:5px;" border="0">'
    + '</td>'
    + '<td style="width:1px;background-color:' + BRAND.paleLine + ';padding:0;font-size:0;line-height:0;" width="1">&nbsp;</td>'
    + '<td style="vertical-align:top;padding-left:16px;">'
    + '<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;">'
    + contactRow_(ASSETS.globe, '<a href="' + OFFICE.websiteUrl + '" style="font-size:12px;color:' + BRAND.navy + ';text-decoration:none;font-weight:600;line-height:1.4;">' + OFFICE.website + '</a>', '12px', true)
    + contactRow_(ASSETS.envelope, '<a href="mailto:' + person.email + '" style="font-size:12px;color:' + BRAND.charcoal + ';text-decoration:none;line-height:1.4;">' + person.email + '</a>', '12px', true)
    + contactRow_(ASSETS.phone, '<a href="tel:' + person.tel + '" style="font-size:12px;color:' + BRAND.charcoal + ';text-decoration:none;line-height:1.4;">' + person.phone + '</a>', '12px', true)
    + contactRow_(ASSETS.pin, '<span style="font-size:11px;color:' + BRAND.gray + ';line-height:1.4;">' + OFFICE.address + '</span>', '11px', false)
    + '</table></td></tr></table></td></tr>';
}

function contactRow_(icon, content, fontSize, hasBottomPadding) {
  return '<tr><td style="padding:0' + (hasBottomPadding ? ' 0 5px 0' : '') + ';font-size:' + fontSize + ';line-height:1.4;mso-line-height-rule:exactly;white-space:nowrap;">'
    + '<img src="' + asset_(icon) + '" width="13" height="13" style="display:inline-block;vertical-align:middle;margin-right:7px;" alt="">'
    + content
    + '</td></tr>';
}

function renderBookPromo_() {
  return '<tr><td style="background-color:' + BRAND.snow + ';padding:12px 14px 12px 14px;mso-line-height-rule:exactly;line-height:1.4;border-top:1px solid ' + BRAND.paleLine + ';">'
    + '<table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr>'
    + '<td width="102" style="width:102px;padding:0 8px 0 0;vertical-align:middle;text-align:center;mso-line-height-rule:exactly;line-height:1.4;">'
    + '<a href="' + OFFICE.bookUrl + '" style="text-decoration:none;line-height:0;display:inline-block;">'
    + '<img src="' + asset_(ASSETS.book) + '" width="80" height="80" alt="The Art of Proactivity" style="display:block;border:0;line-height:0;" border="0">'
    + '</a></td>'
    + '<td style="vertical-align:middle;padding:0 0 0 4px;mso-line-height-rule:exactly;line-height:1.4;">'
    + '<div style="font-size:13px;font-weight:700;color:' + BRAND.navy + ';line-height:1.25;mso-line-height-rule:exactly;">The Art of Proactivity</div>'
    + '<div style="font-size:11px;color:' + BRAND.gray + ';line-height:1.35;margin-top:4px;mso-line-height-rule:exactly;">A practical guide for CPA firms ready to move beyond the compliance treadmill.</div>'
    + '<div style="font-size:11px;line-height:1.25;margin-top:7px;mso-line-height-rule:exactly;"><a href="' + OFFICE.bookUrl + '" style="color:' + BRAND.teal + ';font-weight:700;text-decoration:none;">Free download &rarr;</a></div>'
    + '</td></tr></table></td></tr>';
}

function renderTagline_() {
  var font = 'font-family:\'Playfair Display\',Georgia,\'Times New Roman\',serif;font-size:11.5px;font-weight:700;line-height:1.4;';
  return '<tr><td style="background-color:' + BRAND.snow + ';padding:10px 20px;mso-line-height-rule:exactly;line-height:1.4;">'
    + '<span style="' + font + 'color:' + BRAND.mutedTeal + ';">Planning is the </span>'
    + '<span style="' + font + 'color:' + BRAND.green + ';font-style:italic;">commodity</span>'
    + '<span style="' + font + 'color:' + BRAND.mutedTeal + ';">. Implementation is the </span>'
    + '<span style="' + font + 'color:' + BRAND.steelBlue + ';text-decoration:underline;">differentiator</span>'
    + '<span style="' + font + 'color:' + BRAND.mutedTeal + ';">.</span>'
    + '</td></tr>';
}

function getService_(impersonateEmail) {
  return OAuth2.createService('cvfo_sig_' + impersonateEmail.replace(/[@.]/g, '_'))
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(getCredential_('SERVICE_ACCOUNT_PRIVATE_KEY'))
    .setIssuer(getCredential_('SERVICE_ACCOUNT_EMAIL'))
    .setSubject(impersonateEmail)
    .setScope('https://www.googleapis.com/auth/gmail.settings.basic')
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setCache(CacheService.getScriptCache());
}

function getCredential_(key) {
  var value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) throw new Error('Missing Script Property: ' + key);
  return value;
}

function buildSendAsUrl_(userEmail, sendAsEmail) {
  return 'https://gmail.googleapis.com/gmail/v1/users/'
    + encodeURIComponent(userEmail)
    + '/settings/sendAs/'
    + encodeURIComponent(sendAsEmail);
}

function getPersonByEmail_(email) {
  for (var i = 0; i < PEOPLE.length; i++) {
    if (PEOPLE[i].email === email) return PEOPLE[i];
  }
  return null;
}

function asset_(fileName) {
  return ASSETS.base + fileName;
}

function esc_(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
