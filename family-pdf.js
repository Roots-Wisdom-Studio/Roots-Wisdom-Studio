'use strict';
window.downloadFamilyWaiver=function(p,mode){
 if(p.status!=='signed'||!p.signing)throw Error('No signed record');
 const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'pt',format:'letter'});const margin=48,width=516,height=792;let y=54;
 function line(text,size=10,bold=false){if(bold&&y>height-120){doc.addPage();y=54;}doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);const lines=doc.splitTextToSize(String(text),width);for(const l of lines){if(y>height-60){doc.addPage();y=54;}doc.text(l,margin,y);y+=size*1.45;}y+=7;}
 line('ROOTS & WISDOM STUDIO',11,true);line(mode==='preview'?'SAMPLE COPY - NOT A LEGAL SIGNATURE':p.agreement.title,16,true);
 if(mode==='preview')line(p.agreement.title,12,true);
 line('Participant: '+p.name,11,true);line('Record: '+p.id);line('Date of birth: '+p.dob);line('Version: '+p.agreement.version);if(p.externalRegistration){line('Samba provider registration is separate and has not been verified by this studio form.');line(p.externalRegistration.url);}line('Agreement text fingerprint: '+p.agreement.sha256);line(p.agreement.entity);line(p.agreement.address);
 for(const s of p.agreement.sections){line(s.heading,11,true);line(s.text);}
 line('Participant and signing details',13,true);
 const s=p.signing;for(const [key,value]of [['Participant',p.name],['Participant birthdate',p.dob],['Age at signing',p.age],['Email',p.email],['Phone',p.phone],['Emergency contact',p.emergencyName],['Emergency phone',p.emergencyPhone],['Signer role',s.role],['Adult signer',s.signerName],['Signer birthdate',s.signerDob],['Relationship',s.relationship||'Self'],['Typed '+(mode==='preview'?'test name':'signature'),s.signature],['Agreement and media release accepted','Yes'],['Household access notice',s.householdAccessAccepted],['Server receipt time',s.serverReceivedAt],['Browser time (not authoritative)',s.browserSignedAt||'Not supplied'],['Record type',mode==='preview'?'Unsigned synthetic preview - not a legal signature':'Participant submitted record']])line(key+': '+value);
 line('This participant copy preserves the submitted agreement and signing details. It is not an independently authenticated identity certificate. Staff verify the server-held record before class.');
 const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(7);doc.setFont('helvetica','normal');doc.text((mode==='preview'?'PREVIEW ONLY | ':'')+p.agreement.version,48,766);doc.text(`${i} / ${pages}`,540,766);}
 doc.save('Roots-Wisdom-'+(mode==='preview'?'SAMPLE-':'')+p.name.replace(/[^a-z0-9]+/gi,'-')+'-Waiver.pdf');
};
