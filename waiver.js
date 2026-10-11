'use strict';
const form=document.getElementById('waiver-form');
const submit=document.getElementById('submit-waiver');
const error=document.getElementById('form-error');
const status=document.getElementById('submission-status');
let signedRecord=null;
const preview=location.hostname.startsWith('deploy-preview-');
const normalize=value=>value.trim().replace(/\s+/g,' ').toLocaleLowerCase('en-US');
function showError(message){error.textContent=message;error.hidden=false;status.textContent='';}
function syncRole(){
  const guardian=form.elements['signer-role'].value==='guardian';
  const fields=document.getElementById('guardian-fields');
  fields.hidden=!guardian;fields.disabled=!guardian;
  ['guardian-name','guardian-relationship','guardian-authority'].forEach(id=>document.getElementById(id).required=guardian);
  document.getElementById('signature').setCustomValidity('');
}
const dob=document.getElementById('participant-dob');
const localDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function ageAtDate(birth,today){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(birth)||birth>today)return null;
  const [y,m,d]=birth.split('-').map(Number),[ty,tm,td]=today.split('-').map(Number);
  const check=new Date(Date.UTC(y,m-1,d));
  if(check.getUTCFullYear()!==y||check.getUTCMonth()!==m-1||check.getUTCDate()!==d)return null;
  return ty-y-((tm<m||(tm===m&&td<d))?1:0);
}
function syncBirthDate(){
  dob.max=localDate();const age=ageAtDate(dob.value,dob.max);
  form.elements['participant-age'].value=age===null?'':String(age);
  document.getElementById('age-summary').textContent=age===null?'':'Age: '+age+' years';
  const role=form.elements['signer-role'].value;
  dob.setCustomValidity(age===null||age>120?'Enter a valid date of birth.':role==='adult'&&age<18?'A parent or legal guardian must sign for a participant under 18.':role==='guardian'&&age>=18?'Participants age 18 or older must sign for themselves.':'');
}
dob.addEventListener('input',syncBirthDate);
form.querySelectorAll('[name="signer-role"]').forEach(input=>input.addEventListener('change',syncBirthDate));
syncBirthDate();
form.querySelectorAll('[name="signer-role"]').forEach(input=>input.addEventListener('change',syncRole));
form.addEventListener('input',()=>document.getElementById('signature').setCustomValidity(''));
syncRole();
form.elements.source.value=new URLSearchParams(location.search).get('source')==='booking'?'booking':'direct-or-walk-in';
if(preview){status.textContent='Review preview: signing is disabled until the Studio approves and releases this agreement.';}
else submit.disabled=false;
document.getElementById('print-agreement').addEventListener('click',()=>window.print());
document.getElementById('print-receipt').addEventListener('click',()=>window.print());
document.getElementById('download-receipt').addEventListener('click',()=>{
  if(!signedRecord)return;
  try{buildWaiverPdf(signedRecord).save('Roots-Wisdom-Waiver-'+signedRecord['submission-reference']+'.pdf');}
  catch(e){status.textContent='The PDF download could not be created. Use Print / save signed copy to keep your copy instead.';}
});
document.getElementById('another-child').addEventListener('click',()=>{
  if(!window.confirm('Save or print this participant’s copy before continuing. Start a separate waiver for another child?'))return;
  form.reset();signedRecord=null;document.getElementById('receipt-details').replaceChildren();
  form.elements['submission-reference'].value='';form.elements['signed-at-client-utc'].value='';
  form.querySelector('[name="signer-role"][value="guardian"]').checked=true;
  syncRole();syncBirthDate();error.hidden=true;status.textContent=preview?'Review preview: signing is disabled until release.':'';
  submit.disabled=preview;submit.textContent='Sign and submit waiver';
  document.getElementById('receipt').hidden=true;document.getElementById('signing').hidden=false;
  document.getElementById('participant-name').focus();
});
form.addEventListener('submit',async event=>{
  event.preventDefault();if(preview)return;
  error.hidden=true;
  const role=form.elements['signer-role'].value;
  const signer=role==='guardian'?form.elements['guardian-name'].value:form.elements['participant-name'].value;
  const signature=document.getElementById('signature');
  signature.setCustomValidity(normalize(signature.value)===normalize(signer)?'':'Type the full legal name of the adult participant or signing parent/legal guardian.');
  syncBirthDate();
  if(!form.reportValidity())return;
  if(!form.elements['submission-reference'].value)form.elements['submission-reference'].value=crypto.randomUUID();
  form.elements['signed-at-client-utc'].value=new Date().toISOString();
  const data=new FormData(form);
  if(!data.has('photo-permission'))data.set('photo-permission','not-granted');
  submit.disabled=true;submit.textContent='Submitting…';status.textContent='Sending your waiver. Please keep this page open.';
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
  try{
    const response=await fetch('/waiver.html',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data).toString(),signal:controller.signal});
    if(!response.ok)throw new Error('Submission not accepted');
    signedRecord=Object.fromEntries(data);delete signedRecord['bot-field'];
    const labels={'submission-reference':'Submission reference','waiver-version':'Agreement version','participant-name':'Participant','participant-dob':'Participant’s date of birth','participant-age':'Participant’s age at signing','signer-role':'Signing role','guardian-name':'Parent / legal guardian','guardian-relationship':'Relationship','guardian-authority':'Guardian authority','email':'Email','phone':'Phone','emergency-contact-name':'Emergency contact','emergency-contact-phone':'Emergency contact phone','photo-permission':'Photo/video permission','signature':'Electronic signature','agreement-accepted':'Agreement accepted','signed-at-client-utc':'Signing time supplied by this browser (UTC)','document-sha256':'Agreement text fingerprint'};
    const details=document.getElementById('receipt-details');
    for(const [key,label]of Object.entries(labels))if(signedRecord[key]){const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=signedRecord[key];details.append(dt,dd);}
    document.getElementById('signing').hidden=true;const receipt=document.getElementById('receipt');receipt.hidden=false;receipt.focus();receipt.scrollIntoView({behavior:'smooth'});
  }catch(e){showError('We could not confirm that your waiver was saved. Your details are still here. Contact the Studio before trying again so we can check for a duplicate record. You are not marked as cleared to participate.');submit.disabled=false;submit.textContent='Try submitting again';}
  finally{clearTimeout(timeout);}
});
