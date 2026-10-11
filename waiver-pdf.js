'use strict';
// Generate a participant copy locally; no signing details leave the browser here.
function buildWaiverPdf(record){
  const {jsPDF}=window.jspdf;
  const pdf=new jsPDF({unit:'pt',format:'letter'});
  const width=504,bottom=738;
  let y=54;
  const plain=t=>String(t).replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/→/g,'');
  function text(value,bold=false){
    pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(bold?12:10);
    const lines=pdf.splitTextToSize(plain(value),width);
    if(lines.length*12+8<=bottom-54 && y+lines.length*12>bottom){pdf.addPage();y=54;}
    for(const line of lines){if(y>bottom){pdf.addPage();y=54;}pdf.text(line,54,y);y+=12;}
    y+=6;
  }
  text('ROOTS & WISDOM STUDIO — PARTICIPANT COPY',true);
  text('Electronic signature details',true);
  const labels={'participant-name':'Participant','participant-dob':'Date of birth','participant-age':'Age at signing','signer-role':'Signing role','guardian-name':'Parent/legal guardian','guardian-relationship':'Relationship','guardian-authority':'Guardian authority','email':'Email','phone':'Phone','emergency-contact-name':'Emergency contact','emergency-contact-phone':'Emergency contact phone','photo-permission':'Photo/video permission','signature':'Typed electronic signature','agreement-accepted':'Agreement accepted','waiver-version':'Agreement version','signed-at-client-utc':'Browser-supplied signing time (UTC)','submission-reference':'Submission reference','document-sha256':'Agreement text fingerprint'};
  for(const [key,label]of Object.entries(labels))if(record[key])text(label+': '+record[key]);
  text('This copy records the details submitted by the signer. Studio staff must verify the saved record before participation. The browser timestamp and text fingerprint do not independently authenticate the signer.');
  pdf.addPage();y=54;
  text('Full agreement accepted by the signer',true);
  for(const paragraph of record['document-text'].split('\n\n'))text(paragraph);
  const pages=pdf.getNumberOfPages();
  for(let i=1;i<=pages;i++){pdf.setPage(i);pdf.setFontSize(8);pdf.setFont('helvetica','normal');pdf.text(plain(record['waiver-version'])+' | Participant copy',54,768);pdf.text('Page '+i+' of '+pages,490,768);}
  pdf.setProperties({title:'Roots & Wisdom signed participant waiver',author:'Roots & Wisdom Studio'});
  return pdf;
}
