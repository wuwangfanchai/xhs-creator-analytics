(() => {
  const encoder = new TextEncoder();
  const xml = value => String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const u16 = n => new Uint8Array([n&255,(n>>>8)&255]);
  const u32 = n => new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]);
  const crcTable = (() => {
    const table=new Uint32Array(256);
    for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xEDB88320^(c>>>1):c>>>1;table[n]=c>>>0}
    return table;
  })();
  const crc32 = bytes => {let c=0xFFFFFFFF;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
  const concat = arrays => {const size=arrays.reduce((n,a)=>n+a.length,0),out=new Uint8Array(size);let p=0;for(const a of arrays){out.set(a,p);p+=a.length}return out};
  function zip(files){
    const local=[],central=[];let offset=0;
    for(const [name,text] of files){
      const n=encoder.encode(name),data=encoder.encode(text),crc=crc32(data);
      const lh=concat([u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(n.length),u16(0),n]);
      local.push(lh,data);
      central.push(concat([u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(n.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),n]));
      offset+=lh.length+data.length;
    }
    const cd=concat(central),body=concat(local),end=concat([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(cd.length),u32(body.length),u16(0)]);
    return new Blob([body,cd,end],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  }
  const colName = index => {let s="";while(index){index--;s=String.fromCharCode(65+index%26)+s;index=Math.floor(index/26)}return s};
  const inlineCell = (ref,value,style="") => `<c r="${ref}" t="inlineStr"${style?` s="${style}"`:""}><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
  const numberCell = (ref,value) => `<c r="${ref}"><v>${Number(value)||0}</v></c>`;
  function sheet(rows){
    const header=["笔记ID","标题","发布时间","笔记类型","浏览量","点赞量","收藏量","评论数","转发数"];
    const all=[header,...rows];
    const body=all.map((row,r)=>`<row r="${r+1}">${row.map((v,c)=>r===0?inlineCell(`${colName(c+1)}1`,v,"1"):c<4?inlineCell(`${colName(c+1)}${r+1}`,v):numberCell(`${colName(c+1)}${r+1}`,v)).join("")}</row>`).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="30" customWidth="1"/><col min="2" max="2" width="42.5" customWidth="1"/><col min="3" max="3" width="17.857" customWidth="1"/><col min="4" max="4" width="7" customWidth="1"/><col min="5" max="5" width="10.286" customWidth="1"/><col min="6" max="6" width="10.286" customWidth="1"/><col min="7" max="7" width="10.286" customWidth="1"/><col min="8" max="8" width="10.286" customWidth="1"/><col min="9" max="9" width="10.286" customWidth="1"/></cols><sheetData>${body}</sheetData><autoFilter ref="A1:I${all.length}"/></worksheet>`;
  }
  const publishedKey = note => {
    const match=String(note.time||"").match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
    if(match)return Date.UTC(+match[1],+match[2]-1,+match[3],+match[4],+match[5],+(match[6]||0));
    const stamp=Number(note.timestamp)||0;
    return stamp>1e12?stamp:stamp*1000;
  };
  window.XhsXlsx={
    sortNotes(notes){return [...notes].sort((a,b)=>publishedKey(b)-publishedKey(a)||String(b.id).localeCompare(String(a.id)))},
    create(rows){
    const files=[
      ["[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
      ["_rels/.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ["xl/workbook.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="全部笔记" sheetId="1" r:id="rId1"/></sheets></workbook>`],
      ["xl/_rels/workbook.xml.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ["xl/styles.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="等线"/></font><font><b/><sz val="11"/><name val="等线"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`],
      ["xl/worksheets/sheet1.xml",sheet(rows)]
    ];
      return zip(files);
    }
  };
})();
