import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const fonts = [
  { weight: 400, file: "@fontsource/inter/files/inter-latin-400-normal.woff" },
  { weight: 600, file: "@fontsource/inter/files/inter-latin-600-normal.woff" },
  { weight: 800, file: "@fontsource/inter/files/inter-latin-800-normal.woff" },
].map(({ weight, file }) => ({
  name: "Inter",
  data: fs.readFileSync(require.resolve(file)),
  weight,
  style: "normal",
}));

const SITE = "https://thehippiescientist.net";
const OUT  = path.resolve("public/og");
fs.mkdirSync(OUT, { recursive: true });
const W = 1200, H = 630;

function sl(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");}

function frame({ title, subtitle }){
  return {
    type:"div",
    props:{
      style:{
        width:W,height:H,display:"flex",flexDirection:"column",background:"#0a0d10",position:"relative",padding:"64px",color:"#e8ecf2",fontFamily:"Inter, system-ui, -apple-system, Segoe UI, Roboto"
      },
      children:[
        {type:"div",props:{style:{position:"absolute",right:"-10%",top:"-10%",width:"70%",height:"70%",background:"radial-gradient(closest-side, rgba(82,225,255,.55), rgba(10,13,16,0))"}}},
        {type:"div",props:{style:{position:"absolute",left:"-15%",bottom:"-15%",width:"80%",height:"80%",background:"radial-gradient(closest-side, rgba(199,255,87,.45), rgba(10,13,16,0))"}}},
        {type:"div",props:{style:{fontSize:72,fontWeight:800,lineHeight:1.1,marginTop:24,maxWidth:980},children:title}},
        {type:"div",props:{style:{marginTop:28,fontSize:34,opacity:.9},children:subtitle||"The Hippie Scientist"}},
        {type:"div",props:{style:{position:"absolute",left:64,bottom:56,fontSize:28,opacity:.75},children:SITE.replace(/^https?:\/\//,"")}}
      ]
    }
  };
}

async function toPng(v,outfile){
  const svg = await satori(v,{width:W,height:H,fonts});
  const png = new Resvg(svg,{fitTo:{mode:"width",value:W}}).render().asPng();
  fs.writeFileSync(outfile,png);
}

// Default OG
await toPng(frame({title:"Herb knowledge without the fluff",subtitle:"Psychoactive botany • Safety • DIY blends"}),path.join(OUT,"default.png"));

// Herbs
try{
  const herbs=JSON.parse(fs.readFileSync("src/data/herbs/herbs.normalized.json","utf-8"));
  for(const h of herbs){
    const title=h.common||h.scientific||"Unknown Herb";
    const subtitle=h.intensity?`Intensity: ${h.intensity}`:"Herb Profile";
    await toPng(frame({title,subtitle}),path.join(OUT,`${h.slug||sl(title)}.png`));
  }
  console.log("OG generated for",herbs.length,"herbs");
}catch{console.log("No herbs file");}

// Blog
try{
  const posts=JSON.parse(fs.readFileSync("src/data/blog/posts.json","utf-8"));
  for(const p of posts){
    const title=p.title||"Article";
    const subtitle=p.category?`Article • ${p.category}`:"Article";
    await toPng(frame({title,subtitle}),path.join(OUT,`${p.slug||sl(title)}.png`));
  }
  console.log("OG generated for blog posts");
}catch{}
