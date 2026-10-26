import fs from 'node:fs';
fs.rmSync('_site',{recursive:true,force:true});fs.mkdirSync('_site');
for(const entry of fs.readdirSync('.',{withFileTypes:true})){
 if(entry.name==='assets')fs.cpSync('assets','_site/assets',{recursive:true});
 else if(entry.isFile()&&(entry.name==='_headers'||/\.(html|css|js|svg|png|jpe?g|JPG|webp|mp4|ico)$/.test(entry.name)))fs.copyFileSync(entry.name,'_site/'+entry.name);
}
