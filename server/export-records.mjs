import fs from 'node:fs';
import path from 'node:path';
const [input,output]=process.argv.slice(2);
if(!input||!output||!path.isAbsolute(input)||!path.isAbsolute(output))throw Error('Supply absolute private input and output paths.');
const parsed=JSON.parse(fs.readFileSync(input,'utf8')),family=parsed.data||parsed;
if(!Array.isArray(family.participants)||!family.id)throw Error('Not a family registration record.');
if(fs.existsSync(output))throw Error('Choose a new private export directory. Existing files will not be overwritten.');
fs.mkdirSync(output,{recursive:true,mode:0o700});
const q=s=>{let value=String(s??'');if(/^[=+@\-\t\r]/.test(value))value="'"+value;return '"'+value.replaceAll('"','""')+'"';};
const rows=[['Family reference','Participant reference','Name','Waiver version','Status','Test record','Server received at','Signer role']];
for(const p of family.participants){
 fs.writeFileSync(path.join(output,p.id+'.json'),JSON.stringify({familyId:family.id,testOnly:family.testOnly,household:family.household,participant:p},null,2),{mode:0o600});
 rows.push([family.id,p.id,p.name,p.agreement.version,p.status,family.testOnly?'TEST ONLY':'',p.signing?.serverReceivedAt||'',p.signing?.role||'']);
}
fs.writeFileSync(path.join(output,'participant-status.csv'),rows.map(r=>r.map(q).join(',')).join('\n')+'\n',{mode:0o600});
console.log(`Exported ${family.participants.length} participant records into the supplied private folder.`);
